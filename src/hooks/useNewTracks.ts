import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { Track } from "../types";

export function useNewTracks() {
  const [newTracks, setNewTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState<Date>(() => {
    // Set initial fetch time to current time minus 30 days
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date;
  });

  useEffect(() => {
    // Initial fetch of tracks
    fetchNewTracks();

    // Set up real-time subscription
    const subscription = supabase
      .channel("artist_tracks_changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "artist_tracks",
        },
        (payload) => {
          console.log("Real-time track insert detected:", payload);
          // When a new track is published, fetch it and add to our list
          fetchTrackById(payload.new.id);
        },
      )
      .subscribe();

    // Listen for manual refresh events
    const handleRefresh = () => {
      console.log("Manual refresh triggered");
      fetchNewTracks();
    };

    window.addEventListener("refresh-tracks", handleRefresh);

    return () => {
      // Clean up subscription on unmount
      subscription.unsubscribe();
      window.removeEventListener("refresh-tracks", handleRefresh);
    };
  }, []);

  const fetchNewTracks = async () => {
    try {
      setLoading(true);
      setError(null); // Reset error state before fetching

      console.log("Fetching new tracks...");

      // Query artist_tracks table for all tracks, not just newer ones
      // This ensures we get tracks even if there's a timestamp issue
      const { data, error } = await supabase
        .from("artist_tracks")
        .select(
          `
          id,
          title,
          price,
          created_at,
          audio_url,
          cover_art_url,
          artist_id
        `,
        )
        .order("created_at", { ascending: false })
        .limit(20);

      console.log("Tracks query result:", { data, error });

      if (error) {
        console.error("Supabase error:", error);
        throw new Error(
          error.message || "Failed to fetch tracks from database",
        );
      }

      if (!data) {
        console.warn("No data returned from Supabase");
        setNewTracks([]);
        return;
      }

      // Get artist names for the tracks
      const artistIds = data.map((track) => track.artist_id).filter(Boolean);
      let artistNames = {};

      if (artistIds.length > 0) {
        console.log("Fetching artist names for IDs:", artistIds);

        // First try artist_profiles table directly - this is where artist names are stored
        const { data: artistData, error: artistError } = await supabase
          .from("artist_profiles")
          .select("user_id, name")
          .in("user_id", artistIds);

        console.log("Artist data result from artist_profiles:", {
          artistData,
          artistError,
        });

        if (!artistError && artistData && artistData.length > 0) {
          artistNames = artistData.reduce((acc, artist) => {
            acc[artist.user_id] = artist.name;
            return acc;
          }, {});
          console.log(
            "Successfully mapped artist names from artist_profiles:",
            artistNames,
          );
        }

        // If any artist IDs are still missing, try profiles table
        const missingArtistIds = artistIds.filter((id) => !artistNames[id]);
        if (missingArtistIds.length > 0) {
          console.log(
            "Some artist IDs still missing, trying profiles table:",
            missingArtistIds,
          );
          const { data: profilesData, error: profilesError } = await supabase
            .from("profiles")
            .select("id, name")
            .in("id", missingArtistIds);

          console.log("Artist data result from profiles:", {
            profilesData,
            profilesError,
          });

          if (!profilesError && profilesData && profilesData.length > 0) {
            profilesData.forEach((profile) => {
              artistNames[profile.id] = profile.name;
              console.log(
                `Found name for artist ${profile.id} in profiles: ${profile.name}`,
              );
            });
          }
        }

        // Last resort: try directly querying for each remaining missing artist ID
        const stillMissingArtistIds = artistIds.filter(
          (id) => !artistNames[id],
        );
        if (stillMissingArtistIds.length > 0) {
          console.log(
            "Still missing artist IDs, trying individual queries:",
            stillMissingArtistIds,
          );
          for (const artistId of stillMissingArtistIds) {
            try {
              // Try the RPC function first
              const { data: rpcData } = await supabase
                .rpc("get_artist_name_by_id", { artist_id: artistId })
                .maybeSingle();

              if (rpcData && rpcData.name) {
                artistNames[artistId] = rpcData.name;
                console.log(
                  `Found name for artist ${artistId} via RPC: ${rpcData.name}`,
                );
                continue;
              }

              // If RPC fails, try direct query to artist_profiles
              const { data: directArtistData } = await supabase
                .from("artist_profiles")
                .select("name")
                .eq("user_id", artistId)
                .single();

              if (directArtistData) {
                artistNames[artistId] = directArtistData.name;
                console.log(
                  `Found name for artist ${artistId} via direct query: ${directArtistData.name}`,
                );
              }
            } catch (err) {
              console.warn(
                `Failed to get name for artist ID ${artistId}:`,
                err,
              );
            }
          }
        }
      }

      // Transform the data to match our Track type
      const formattedTracks: Track[] = data.map((track) => {
        // Check if we have an artist_id and if it's in our artistNames map
        const artistName =
          track.artist_id && artistNames[track.artist_id]
            ? artistNames[track.artist_id]
            : "Unknown Artist";

        console.log(
          `Track ${track.id} artist_id: ${track.artist_id}, mapped artist name: ${artistName}`,
        );

        // If we still have Unknown Artist, log more details to help debug
        if (artistName === "Unknown Artist" && track.artist_id) {
          console.warn(
            `Failed to map artist name for track ${track.id} with artist_id ${track.artist_id}`,
            "Available artist IDs in map:",
            Object.keys(artistNames),
          );
        }

        return {
          id: track.id,
          title: track.title || "Untitled Track",
          artist: artistName,
          inscription: "", // Default value as this might not be in the DB
          price: track.price || 0,
          coverArt: track.cover_art_url || "",
          audioUrl: track.audio_url || "",
          plays: 0, // Default value since plays column doesn't exist
          duration: 0, // Default value since duration column doesn't exist
        };
      });

      console.log("Formatted tracks:", formattedTracks);
      setNewTracks(formattedTracks);

      // Update lastFetch time to now
      setLastFetch(new Date());
    } catch (err) {
      console.error("Error fetching new tracks:", err);
      setError(
        err instanceof Error ? err.message : "An unknown error occurred",
      );
      // Don't clear existing tracks on error
    } finally {
      setLoading(false);
    }
  };

  const fetchTrackById = async (trackId: string) => {
    try {
      const { data, error } = await supabase
        .from("artist_tracks")
        .select(
          `
          id,
          title,
          price,
          created_at,
          audio_url,
          cover_art_url,
          artist_id
        `,
        )
        .eq("id", trackId)
        .single();

      if (error) {
        console.error("Error fetching track by ID:", error);
        return;
      }

      if (!data) {
        console.warn(`No track found with ID: ${trackId}`);
        return;
      }

      // Get artist name if we have an artist_id
      let artistName = "Unknown Artist";
      if (data.artist_id) {
        console.log(`Fetching artist name for ID: ${data.artist_id}`);

        // First try artist_profiles table directly - this is where artist names are stored
        const { data: artistData, error: artistError } = await supabase
          .from("artist_profiles")
          .select("name")
          .eq("user_id", data.artist_id)
          .single();

        console.log("Artist data result from artist_profiles:", {
          artistData,
          artistError,
        });

        if (!artistError && artistData) {
          artistName = artistData.name;
          console.log(`Found artist name in artist_profiles: ${artistName}`);
        } else {
          // If not found, try profiles table
          console.log(`Trying profiles table for ID: ${data.artist_id}`);
          const { data: profileData, error: profileError } = await supabase
            .from("profiles")
            .select("name")
            .eq("id", data.artist_id)
            .single();

          console.log("Artist data result from profiles:", {
            profileData,
            profileError,
          });

          if (!profileError && profileData) {
            artistName = profileData.name;
            console.log(`Found artist name in profiles: ${artistName}`);
          } else {
            // Last resort: try the RPC function
            console.log(`Trying RPC function for artist ID: ${data.artist_id}`);
            try {
              const { data: rpcData } = await supabase
                .rpc("get_artist_name_by_id", { artist_id: data.artist_id })
                .maybeSingle();

              if (rpcData && rpcData.name) {
                artistName = rpcData.name;
                console.log(`Found artist name via RPC: ${artistName}`);
              } else {
                console.warn(
                  `Could not find artist with ID: ${data.artist_id} in any table`,
                );
              }
            } catch (err) {
              console.warn(`RPC error for artist ID ${data.artist_id}:`, err);
            }
          }
        }
      }

      const newTrack: Track = {
        id: data.id,
        title: data.title || "Untitled Track",
        artist: artistName,
        inscription: "", // Default value
        price: data.price || 0,
        coverArt: data.cover_art_url || "",
        audioUrl: data.audio_url || "",
        plays: 0, // Default value since plays column doesn't exist
        duration: 0, // Default value since duration column doesn't exist
      };

      // Add the new track to the beginning of our list
      setNewTracks((prev) => [newTrack, ...prev]);
    } catch (err) {
      console.error("Error fetching track by ID:", err);
      // Don't update error state here as this is a background operation
      // and we don't want to show errors for individual track fetches
    }
  };

  return { newTracks, loading, error, refetch: fetchNewTracks };
}

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

        // First try to fetch from artist_profiles
        const { data: artistData, error: artistError } = await supabase
          .from("artist_profiles")
          .select("id, name")
          .in("id", artistIds);

        console.log("Artist data result from artist_profiles:", {
          artistData,
          artistError,
        });

        if (!artistError && artistData && artistData.length > 0) {
          artistNames = artistData.reduce((acc, artist) => {
            acc[artist.id] = artist.name;
            return acc;
          }, {});
        } else {
          // If no results from artist_profiles, try the public.artist_profiles table
          console.log(
            "No results from artist_profiles, trying public.artist_profiles",
          );
          const { data: publicArtistData, error: publicArtistError } =
            await supabase
              .from("public.artist_profiles")
              .select("id, name")
              .in("id", artistIds);

          console.log("Artist data result from public.artist_profiles:", {
            publicArtistData,
            publicArtistError,
          });

          if (
            !publicArtistError &&
            publicArtistData &&
            publicArtistData.length > 0
          ) {
            artistNames = publicArtistData.reduce((acc, artist) => {
              acc[artist.id] = artist.name;
              return acc;
            }, {});
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

        // First try artist_profiles table
        const { data: artistData, error: artistError } = await supabase
          .from("artist_profiles")
          .select("name")
          .eq("id", data.artist_id)
          .single();

        console.log("Artist data result from artist_profiles:", {
          artistData,
          artistError,
        });

        if (!artistError && artistData) {
          artistName = artistData.name;
          console.log(`Found artist name: ${artistName}`);
        } else {
          // If not found, try public.artist_profiles table
          console.log(
            `Trying public.artist_profiles for ID: ${data.artist_id}`,
          );
          const { data: publicArtistData, error: publicArtistError } =
            await supabase
              .from("public.artist_profiles")
              .select("name")
              .eq("id", data.artist_id)
              .single();

          console.log("Artist data result from public.artist_profiles:", {
            publicArtistData,
            publicArtistError,
          });

          if (!publicArtistError && publicArtistData) {
            artistName = publicArtistData.name;
            console.log(
              `Found artist name in public.artist_profiles: ${artistName}`,
            );
          } else {
            console.warn(
              `Could not find artist with ID: ${data.artist_id} in either table`,
            );
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

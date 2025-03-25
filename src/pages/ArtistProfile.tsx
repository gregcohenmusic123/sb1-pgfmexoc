import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { artists } from "../data/artists";
import { tracks } from "../data/tracks";
import { Track } from "../types";
import ArtistCover from "../components/Artist/ArtistCover";
import ArtistInfo from "../components/Artist/ArtistInfo";
import ArtistTracks from "../components/Artist/ArtistTracks";
import { supabase } from "../lib/supabase";

export default function ArtistProfile() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [dbArtist, setDbArtist] = useState<any>(null);
  const [dbTracks, setDbTracks] = useState<Track[]>([]);

  // First try to find artist by ID in static data
  let artist = artists.find((a) => a.id === id);

  // If not found and the ID might be a name (for database artists)
  if (!artist) {
    artist = artists.find((a) => a.name === id);
  }

  useEffect(() => {
    async function fetchArtistFromDb() {
      try {
        setLoading(true);

        // Try to fetch artist by ID first
        let { data, error } = await supabase
          .from("artist_profiles")
          .select("*")
          .eq("id", id)
          .single();

        // If not found by ID, try by name
        if (error || !data) {
          const { data: nameData, error: nameError } = await supabase
            .from("artist_profiles")
            .select("*")
            .eq("name", id)
            .single();

          if (!nameError && nameData) {
            data = nameData;
            error = null;
          }
        }

        if (error && error.code !== "PGRST116") {
          console.error("Error fetching artist profile:", error);
        } else if (data) {
          setDbArtist(data);

          // Fetch artist tracks from database
          // Try both user_id and id fields to ensure we catch all tracks
          const { data: trackData, error: trackError } = await supabase
            .from("artist_tracks")
            .select("*")
            .or(`artist_id.eq.${data.id},artist_id.eq.${data.user_id}`);

          if (trackError) {
            console.error("Error fetching artist tracks:", trackError);

            // Try a direct query to the storage bucket as fallback
            try {
              console.log(
                `Attempting to fetch tracks from storage for artist ${data.name}`,
              );
              const { data: storageData, error: storageError } =
                await supabase.storage
                  .from("audio")
                  .list(`tracks/${data.user_id}`, {
                    limit: 100,
                    offset: 0,
                  });

              if (!storageError && storageData && storageData.length > 0) {
                console.log(
                  `Found ${storageData.length} tracks in storage for ${data.name}:`,
                  storageData,
                );

                // Create track objects from storage files
                const storageFormattedTracks: Track[] = storageData.map(
                  (file, index) => ({
                    id: `storage-${data.user_id}-${index}`,
                    title:
                      file.name
                        .split("-")
                        .slice(1)
                        .join("-")
                        .replace(/\.[^/.]+$/, "") || "Untitled Track",
                    artist: data.name,
                    inscription: "",
                    price: 0.05, // Default price
                    coverArt:
                      "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80",
                    audioUrl: supabase.storage
                      .from("audio")
                      .getPublicUrl(`tracks/${data.user_id}/${file.name}`).data
                      .publicUrl,
                    plays: 0,
                    duration: 180,
                  }),
                );

                setDbTracks(storageFormattedTracks);
              }
            } catch (storageErr) {
              console.error("Error fetching from storage:", storageErr);
            }
          } else {
            // Transform database tracks to match Track interface, even if empty
            const formattedTracks: Track[] = trackData
              ? trackData.map((track) => ({
                  id: track.id,
                  title: track.title,
                  artist: data.name,
                  inscription: track.inscription_id || "",
                  price: track.price || 0,
                  coverArt:
                    track.cover_art_url ||
                    "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80",
                  audioUrl: track.audio_url || "",
                  plays: track.play_count || 0,
                  duration: track.duration || 180,
                }))
              : [];

            console.log(
              `Found ${formattedTracks.length} tracks in database for ${data.name}:`,
              formattedTracks,
            );
            setDbTracks(formattedTracks);
          }
        }
      } catch (err) {
        console.error("Error in artist profile fetch:", err);
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchArtistFromDb();
    }
  }, [id]);

  // Merge database artist with static artist or create placeholder
  if (dbArtist) {
    // Override static data with database data
    artist = {
      id: dbArtist.id || id || "",
      name: dbArtist.name || id || "Unknown Artist",
      bio: dbArtist.bio || "Artist information coming soon.",
      profileImage:
        dbArtist.profile_image_url ||
        "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80",
      coverImage:
        dbArtist.background_image_url ||
        "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&q=80",
      socialLinks: {
        website: dbArtist.website_url,
        instagram: dbArtist.instagram_handle,
        twitter: dbArtist.twitter_handle,
        ...(dbArtist.social_links || {}),
      },
      stats: {
        totalTracks: dbArtist.total_tracks || 0,
        totalSales: dbArtist.total_sales || 0,
        followers: dbArtist.followers || 0,
      },
    };
  } else if (!artist) {
    // Create placeholder if no artist found in static or database
    artist = {
      id: id || "",
      name: id || "Unknown Artist",
      bio: "Artist information coming soon.",
      profileImage:
        "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80",
      coverImage:
        "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&q=80",
      socialLinks: {},
      stats: { totalTracks: 0, totalSales: 0, followers: 0 },
    };
  }

  // Get tracks for this artist - combine database tracks with static tracks
  const staticTracks = tracks.filter(
    (track) =>
      track.artist === artist?.name ||
      track.artist === id ||
      (dbArtist &&
        (track.artist === dbArtist.name || track.artist === dbArtist.user_id)),
  );

  // Combine database tracks with static tracks, avoiding duplicates
  const artistTracks = [
    ...dbTracks,
    ...staticTracks.filter(
      (staticTrack) =>
        !dbTracks.some((dbTrack) => dbTrack.id === staticTrack.id),
    ),
  ];

  if (!artist) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold">Artist not found</h2>
        <Link
          to="/"
          className="text-blue-600 hover:underline mt-4 inline-block"
        >
          Return to home
        </Link>
      </div>
    );
  }

  const handlePurchase = (track: Track) => {
    alert(`Initiating purchase of "${track.title}" for ${track.price} BTC`);
  };

  return (
    <div className="pb-24">
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          <ArtistCover
            coverImage={artist.coverImage}
            artistName={artist.name}
          />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 relative z-10">
            <ArtistInfo artist={artist} />
            <ArtistTracks tracks={artistTracks} onPurchase={handlePurchase} />
          </div>
        </>
      )}
    </div>
  );
}

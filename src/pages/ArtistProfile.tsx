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

  // Get tracks for this artist
  const artistTracks = tracks.filter(
    (track) => track.artist === artist?.name || track.artist === id,
  );

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

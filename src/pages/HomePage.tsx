import React from "react";
import { Track } from "../types";
import { tracks } from "../data/tracks";
import TrackCard from "../components/TrackCard";
import TrendingSection from "../components/TrendingTracks/TrendingSection";
import { usePlayer } from "../contexts/PlayerContext";
import { motion } from "framer-motion";
import { useNewTracks } from "../hooks/useNewTracks";

export default function HomePage() {
  const { currentTrack, isPlaying } = usePlayer();
  const { newTracks, loading, error, refetch } = useNewTracks();

  // Prioritize CHUCKIE tracks in latest releases
  const latestReleases = [...tracks]
    .sort((a, b) => {
      // Put CHUCKIE tracks first
      if (a.artist === "CHUCKIE" && b.artist !== "CHUCKIE") return -1;
      if (a.artist !== "CHUCKIE" && b.artist === "CHUCKIE") return 1;
      // Then sort by ID for remaining tracks
      return Number(b.id) - Number(a.id);
    })
    .slice(0, 9);

  const handlePurchase = (track: Track) => {
    alert(`Initiating purchase of "${track.title}" for ${track.price} BTC`);
  };

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <section>
        <h2 className="text-3xl text-primary font-bold">Latest Releases</h2>
        <div className="mt-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-3">
            {latestReleases.map((track) => (
              <TrackCard
                key={track.id}
                track={track}
                onPurchase={() => handlePurchase(track)}
                showArtist={true}
                showMobileComments={false}
              />
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="flex justify-between items-center">
          <h2 className="text-3xl text-primary font-bold">New Uploads</h2>
          {!loading && (
            <button
              onClick={() => refetch()}
              className="text-sm text-accent hover:text-accent/80 flex items-center gap-1 transition-colors"
              aria-label="Refresh new tracks"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 2v6h-6" />
                <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
                <path d="M3 22v-6h6" />
                <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
              </svg>
              Refresh
            </button>
          )}
        </div>
        <div className="mt-6">
          {newTracks.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-3">
              {newTracks.map((track) => (
                <TrackCard
                  key={track.id}
                  track={track}
                  onPurchase={() => handlePurchase(track)}
                  showArtist={true}
                  showMobileComments={false}
                />
              ))}
            </div>
          ) : (
            !loading &&
            !error && (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-gray-400 mb-4"
                >
                  <path d="M9 18V5l12-2v13" />
                  <circle cx="6" cy="18" r="3" />
                  <circle cx="18" cy="16" r="3" />
                </svg>
                <p className="text-gray-400 mb-2">No new tracks available</p>
                <p className="text-gray-500 text-sm max-w-md">
                  Check back later for new music uploads or refresh to check
                  again
                </p>
              </div>
            )
          )}
        </div>
      </section>

      {loading && (
        <div className="flex justify-center py-8">
          <div className="flex items-center gap-2">
            <svg
              className="animate-spin h-5 w-5 text-accent"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <div className="text-accent">Loading new tracks...</div>
          </div>
        </div>
      )}

      {error && (
        <div className="flex justify-center py-4 px-6 bg-red-900/20 rounded-lg border border-red-500/30 my-4">
          <div className="text-red-500 flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            Error loading new tracks: {error}
            <button
              onClick={() => window.location.reload()}
              className="ml-4 px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-md text-sm transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      <TrendingSection tracks={tracks} />
    </motion.div>
  );
}

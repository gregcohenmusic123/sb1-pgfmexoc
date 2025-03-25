import React from "react";
import { Track } from "../../types";
import TrackCard from "../TrackCard";

interface ArtistTracksProps {
  tracks: Track[];
  onPurchase: (track: Track) => void;
}

export default function ArtistTracks({
  tracks,
  onPurchase,
}: ArtistTracksProps) {
  return (
    <div className="mt-8">
      <h2 className="text-2xl text-primary mb-4">Tracks</h2>
      {tracks && tracks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tracks.map((track) => (
            <TrackCard
              key={track.id}
              track={track}
              onPurchase={() => onPurchase(track)}
              showArtist={false}
              showMobileComments={true}
            />
          ))}
        </div>
      ) : (
        <div className="bg-gray-800 rounded-lg p-6 text-center">
          <p className="text-gray-400">
            No tracks available yet. Check back soon!
          </p>
        </div>
      )}
    </div>
  );
}

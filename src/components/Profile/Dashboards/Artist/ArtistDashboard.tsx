import React, { useState, useEffect } from "react";
import { useArtistProfile } from "../../../../hooks/useArtistProfile";
import TrackUploadForm from "./TrackUploadForm";
import { toast } from "react-hot-toast";
import { AlertCircle } from "lucide-react";

export default function ArtistDashboard() {
  const { uploadTrack, isUploading, getArtistProfile } = useArtistProfile();
  const [artistProfile, setArtistProfile] = useState(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profile = await getArtistProfile();
        setArtistProfile(profile);
        setError(null);
      } catch (err) {
        setError("Failed to load artist profile. Please try again later.");
      }
    };
    fetchProfile();
  }, [getArtistProfile]);

  const handleUpload = async (formData: any) => {
    setError(null);
    try {
      await uploadTrack(
        formData.title,
        formData.price,
        formData.audioFile,
        formData.coverArt,
        formData.artistProfile,
      );
      // Toast is now handled in the hook
    } catch (err) {
      // Error toast is now handled in the hook
      console.error("Upload error:", err);
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-red-500 font-medium">Error</h3>
            <p className="text-sm text-primary/70">{error}</p>
            <p className="text-xs text-primary/50 mt-1">
              {error.includes("Database error")
                ? "The required database tables might be missing or misconfigured. The system is attempting to fix this issue. Please try again in a few moments."
                : "This might be due to missing database tables. Please contact support."}
            </p>
          </div>
        </div>
      )}

      <div className="bg-surface rounded-lg p-6 border border-accent/20">
        <h2 className="text-xl font-mono text-primary font-bold mb-4">
          Upload New Track
        </h2>
        <p className="text-sm text-primary/70 mb-6">
          Upload your track and optionally update your artist profile
          information. Fields marked with{" "}
          <span className="text-red-500">*</span> are required.
        </p>
        <TrackUploadForm onSubmit={handleUpload} isUploading={isUploading} />
      </div>
    </div>
  );
}

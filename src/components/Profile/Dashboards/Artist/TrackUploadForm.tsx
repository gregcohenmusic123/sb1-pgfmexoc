import React, { useState, useEffect } from "react";
import { Music, Upload, User, Image, Link, AtSign } from "lucide-react";
import { useStorage } from "../../../../hooks/useStorage";
import { ArtistProfileData } from "../../../../types";

interface UploadFormData {
  title: string;
  price: number;
  audioFile: File | null;
  coverArt: File | null;
  artistProfile: ArtistProfileData;
}

interface TrackUploadFormProps {
  onSubmit: (data: UploadFormData) => Promise<void>;
  isUploading: boolean;
}

export default function TrackUploadForm({
  onSubmit,
  isUploading,
}: TrackUploadFormProps) {
  const { uploadFile, error: uploadError } = useStorage();
  const [formData, setFormData] = useState<UploadFormData>({
    title: "",
    price: 0,
    audioFile: null,
    coverArt: null,
    artistProfile: {
      name: "",
      bio: "",
      profileImage: null,
      backgroundImage: null,
      website: "",
      instagram: "",
      twitter: "",
    },
  });
  const [showProfileFields, setShowProfileFields] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    const { title, audioFile, coverArt, artistProfile } = formData;

    // Required fields
    if (!title) newErrors.title = "Track title is required";
    if (!audioFile) newErrors.audioFile = "Audio file is required";
    if (!coverArt) newErrors.coverArt = "Cover art is required";
    if (!artistProfile.name) newErrors.artistName = "Artist name is required";

    // Validate URL format
    if (
      artistProfile.website &&
      !/^(https?:\/\/)?([\w\-])+\.([\w\-\.]+)+([\w\-\.,@?^=%&:/~\+#]*[\w\-\@?^=%&/~\+#])?$/.test(
        artistProfile.website,
      )
    ) {
      newErrors.website = "Please enter a valid URL";
    }

    // Validate bio length
    if (artistProfile.bio && artistProfile.bio.length > 500) {
      newErrors.bio = "Bio must be less than 500 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      // Submit with file URLs
      await onSubmit(formData);

      // Reset form
      setFormData({
        title: "",
        price: 0,
        audioFile: null,
        coverArt: null,
        artistProfile: {
          name: "",
          bio: "",
          profileImage: null,
          backgroundImage: null,
          website: "",
          instagram: "",
          twitter: "",
        },
      });
    } catch (err) {
      console.error("Upload error:", err);
      alert("Failed to upload files. Please try again.");
    }
  };

  const updateArtistProfile = (field: string, value: any) => {
    setFormData({
      ...formData,
      artistProfile: {
        ...formData.artistProfile,
        [field]: value,
      },
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-mono text-primary font-bold">
          Track Information
        </h3>
        <div>
          <label className="block text-sm text-primary font-bold mb-1">
            Track Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            className={`w-full px-3 py-2 bg-surface border ${errors.title ? "border-red-500" : "border-accent/20"} rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-primary text-sm`}
            required
          />
          {errors.title && (
            <p className="text-red-500 text-xs mt-1">{errors.title}</p>
          )}
        </div>

        <div>
          <label className="block text-sm text-primary font-bold mb-1">
            Price (BTC) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            step="0.001"
            value={formData.price}
            onChange={(e) =>
              setFormData({ ...formData, price: Number(e.target.value) })
            }
            className="w-full px-3 py-2 bg-surface border border-accent/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-primary text-sm"
            required
          />
        </div>

        <div>
          <label className="block text-sm text-primary font-bold mb-1">
            Audio File <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center justify-center w-full">
            <label
              className={`w-full flex flex-col items-center px-4 py-6 bg-surface rounded-lg border-2 ${errors.audioFile ? "border-red-500" : "border-accent/20"} border-dashed cursor-pointer hover:border-accent/40`}
            >
              <Music className="w-8 h-8 text-primary" />
              <span className="mt-2 text-sm text-primary">
                {formData.audioFile
                  ? formData.audioFile.name
                  : "Select audio file"}
              </span>
              <input
                type="file"
                accept="audio/*"
                className="hidden"
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    audioFile: e.target.files?.[0] || null,
                  })
                }
              />
            </label>
          </div>
          {errors.audioFile && (
            <p className="text-red-500 text-xs mt-1">{errors.audioFile}</p>
          )}
        </div>

        <div>
          <label className="block text-sm text-primary font-bold mb-1">
            Cover Art <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center justify-center w-full">
            <label
              className={`w-full flex flex-col items-center px-4 py-6 bg-surface rounded-lg border-2 ${errors.coverArt ? "border-red-500" : "border-accent/20"} border-dashed cursor-pointer hover:border-accent/40`}
            >
              <Upload className="w-8 h-8 text-primary" />
              <span className="mt-2 text-sm text-primary">
                {formData.coverArt
                  ? formData.coverArt.name
                  : "Select cover art"}
              </span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    coverArt: e.target.files?.[0] || null,
                  })
                }
              />
            </label>
          </div>
          {errors.coverArt && (
            <p className="text-red-500 text-xs mt-1">{errors.coverArt}</p>
          )}
        </div>
      </div>

      <div className="pt-4 border-t border-accent/10">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-mono text-primary font-bold">
            Artist Profile
          </h3>
          <button
            type="button"
            onClick={() => setShowProfileFields(!showProfileFields)}
            className="text-sm text-accent hover:underline"
          >
            {showProfileFields
              ? "Hide optional fields"
              : "Show optional fields"}
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-primary font-bold mb-1">
              Artist Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 h-4 w-4 text-primary/50" />
              <input
                type="text"
                value={formData.artistProfile.name}
                onChange={(e) => updateArtistProfile("name", e.target.value)}
                className={`w-full pl-10 pr-3 py-2 bg-surface border ${errors.artistName ? "border-red-500" : "border-accent/20"} rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-primary text-sm`}
                required
              />
            </div>
            {errors.artistName && (
              <p className="text-red-500 text-xs mt-1">{errors.artistName}</p>
            )}
          </div>

          {showProfileFields && (
            <>
              <div>
                <label className="block text-sm text-primary font-bold mb-1">
                  Artist Bio{" "}
                  <span className="text-xs font-normal text-primary/50">
                    (optional, max 500 chars)
                  </span>
                </label>
                <textarea
                  value={formData.artistProfile.bio}
                  onChange={(e) => updateArtistProfile("bio", e.target.value)}
                  maxLength={500}
                  rows={3}
                  className={`w-full px-3 py-2 bg-surface border ${errors.bio ? "border-red-500" : "border-accent/20"} rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-primary text-sm`}
                />
                <div className="flex justify-end">
                  <span className="text-xs text-primary/50">
                    {formData.artistProfile.bio?.length || 0}/500
                  </span>
                </div>
                {errors.bio && (
                  <p className="text-red-500 text-xs mt-1">{errors.bio}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-primary font-bold mb-1">
                    Profile Image{" "}
                    <span className="text-xs font-normal text-primary/50">
                      (optional)
                    </span>
                  </label>
                  <div className="flex items-center justify-center w-full">
                    <label className="w-full flex flex-col items-center px-4 py-6 bg-surface rounded-lg border-2 border-accent/20 border-dashed cursor-pointer hover:border-accent/40">
                      <User className="w-6 h-6 text-primary" />
                      <span className="mt-2 text-sm text-primary">
                        {formData.artistProfile.profileImage
                          ? formData.artistProfile.profileImage.name
                          : "Select profile image"}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) =>
                          updateArtistProfile(
                            "profileImage",
                            e.target.files?.[0] || null,
                          )
                        }
                      />
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-primary font-bold mb-1">
                    Background Image{" "}
                    <span className="text-xs font-normal text-primary/50">
                      (optional)
                    </span>
                  </label>
                  <div className="flex items-center justify-center w-full">
                    <label className="w-full flex flex-col items-center px-4 py-6 bg-surface rounded-lg border-2 border-accent/20 border-dashed cursor-pointer hover:border-accent/40">
                      <Image className="w-6 h-6 text-primary" />
                      <span className="mt-2 text-sm text-primary">
                        {formData.artistProfile.backgroundImage
                          ? formData.artistProfile.backgroundImage.name
                          : "Select background image"}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) =>
                          updateArtistProfile(
                            "backgroundImage",
                            e.target.files?.[0] || null,
                          )
                        }
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-accent/10">
                <h4 className="text-md font-mono text-primary font-bold mb-3">
                  Social Links{" "}
                  <span className="text-xs font-normal text-primary/50">
                    (all optional)
                  </span>
                </h4>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-primary font-bold mb-1">
                      Website URL
                    </label>
                    <div className="relative">
                      <Link className="absolute left-3 top-2.5 h-4 w-4 text-primary/50" />
                      <input
                        type="text"
                        value={formData.artistProfile.website}
                        onChange={(e) =>
                          updateArtistProfile("website", e.target.value)
                        }
                        placeholder="https://yourwebsite.com"
                        className={`w-full pl-10 pr-3 py-2 bg-surface border ${errors.website ? "border-red-500" : "border-accent/20"} rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-primary text-sm`}
                      />
                    </div>
                    {errors.website && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.website}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm text-primary font-bold mb-1">
                      Instagram Handle
                    </label>
                    <div className="relative">
                      <AtSign className="absolute left-3 top-2.5 h-4 w-4 text-primary/50" />
                      <input
                        type="text"
                        value={formData.artistProfile.instagram}
                        onChange={(e) => {
                          const value = e.target.value;
                          updateArtistProfile(
                            "instagram",
                            value.startsWith("@") ? value : `@${value}`,
                          );
                        }}
                        placeholder="@yourusername"
                        className="w-full pl-10 pr-3 py-2 bg-surface border border-accent/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-primary text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-primary font-bold mb-1">
                      Twitter/X Handle
                    </label>
                    <div className="relative">
                      <AtSign className="absolute left-3 top-2.5 h-4 w-4 text-primary/50" />
                      <input
                        type="text"
                        value={formData.artistProfile.twitter}
                        onChange={(e) => {
                          const value = e.target.value;
                          updateArtistProfile(
                            "twitter",
                            value.startsWith("@") ? value : `@${value}`,
                          );
                        }}
                        placeholder="@yourusername"
                        className="w-full pl-10 pr-3 py-2 bg-surface border border-accent/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-primary text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={isUploading}
        className="w-full px-4 py-2 bg-surface border border-accent/20 text-primary hover:text-accent rounded-lg transition-colors disabled:opacity-50 text-sm font-bold mt-6"
      >
        {isUploading ? "Uploading..." : "Upload Track"}
      </button>
    </form>
  );
}

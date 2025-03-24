import { useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import { ArtistProfileData } from "../types";
import { toast } from "react-hot-toast";

export function useArtistProfile() {
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [profileUpdating, setProfileUpdating] = useState(false);

  const uploadTrack = async (
    title: string,
    price: number,
    audioFile: File,
    coverArt: File,
    artistProfile?: ArtistProfileData,
  ) => {
    // Validate inputs before proceeding
    if (!title.trim()) {
      throw new Error("Track title is required");
    }
    if (price < 0) {
      throw new Error("Price cannot be negative");
    }
    if (!audioFile) {
      throw new Error("Audio file is required");
    }
    if (!coverArt) {
      throw new Error("Cover art is required");
    }

    // Validate file types
    if (!audioFile.type.startsWith("audio/")) {
      throw new Error(
        `Invalid file type for audio. Please upload an audio file (MP3, WAV, etc).`,
      );
    }
    if (!coverArt.type.startsWith("image/")) {
      throw new Error(
        `Invalid file type for cover art. Please upload an image file.`,
      );
    }

    // Check file sizes
    if (audioFile.size > 100 * 1024 * 1024) {
      // 100MB limit
      throw new Error(
        `Audio file is too large (${(audioFile.size / (1024 * 1024)).toFixed(2)}MB). Maximum size is 100MB.`,
      );
    }
    if (coverArt.size > 10 * 1024 * 1024) {
      // 10MB limit
      throw new Error(
        `Cover image is too large (${(coverArt.size / (1024 * 1024)).toFixed(2)}MB). Maximum size is 10MB.`,
      );
    }
    if (!user) throw new Error("Must be signed in to upload tracks");
    setIsUploading(true);

    try {
      // Check if tables exist
      const { count: profilesCount, error: profilesCheckError } = await supabase
        .from("artist_profiles")
        .select("*", { count: "exact", head: true });

      if (profilesCheckError && profilesCheckError.code !== "PGRST116") {
        console.error(
          "Error checking artist_profiles table:",
          profilesCheckError,
        );
        throw new Error(
          `Database error: ${profilesCheckError.message}. The artist_profiles table might not exist.`,
        );
      }

      const { count: tracksCount, error: tracksCheckError } = await supabase
        .from("artist_tracks")
        .select("*", { count: "exact", head: true });

      if (tracksCheckError && tracksCheckError.code !== "PGRST116") {
        console.error("Error checking artist_tracks table:", tracksCheckError);
        throw new Error(
          `Database error: ${tracksCheckError.message}. The artist_tracks table might not exist.`,
        );
      }

      // Create storage buckets if they don't exist
      const { error: audioBucketError } = await supabase.storage
        .createBucket("audio", {
          public: true,
        })
        .catch((err) => {
          console.log("Audio bucket already exists or error:", err);
          return { error: null };
        }); // Ignore error if bucket already exists

      const { error: imagesBucketError } = await supabase.storage
        .createBucket("images", {
          public: true,
        })
        .catch((err) => {
          console.log("Images bucket already exists or error:", err);
          return { error: null };
        }); // Ignore error if bucket already exists

      // Upload audio file
      const audioPath = `tracks/${user.id}/${Date.now()}-${audioFile.name.replace(/[^a-zA-Z0-9.-]/g, "")}`;
      const { error: audioError } = await supabase.storage
        .from("audio")
        .upload(audioPath, audioFile, { upsert: true });
      if (audioError) {
        console.error("Audio upload error:", audioError);
        const errorMessage = audioError.message || "Unknown error";
        const errorCode = audioError.code || "";
        const detailedMessage = `Failed to upload audio file (${audioFile.name}): ${errorMessage} [Code: ${errorCode}]`;

        // Check for specific error types
        if (errorCode === "23505") {
          throw new Error(
            `Duplicate audio file detected. Please try with a different file or filename.`,
          );
        } else if (
          errorMessage.includes("permission") ||
          errorCode === "42501"
        ) {
          throw new Error(
            `Permission denied when uploading audio. Please check your account permissions.`,
          );
        } else if (
          errorMessage.includes("storage") ||
          errorMessage.includes("bucket")
        ) {
          throw new Error(
            `Storage bucket issue: ${errorMessage}. The audio storage might not be properly configured.`,
          );
        } else if (audioFile.size > 100 * 1024 * 1024) {
          // 100MB limit check
          throw new Error(
            `Audio file is too large (${(audioFile.size / (1024 * 1024)).toFixed(2)}MB). Maximum size is 100MB.`,
          );
        }

        throw new Error(detailedMessage);
      }

      // Upload cover art
      const coverPath = `covers/${user.id}/${Date.now()}-${coverArt.name.replace(/[^a-zA-Z0-9.-]/g, "")}`;
      const { error: coverError } = await supabase.storage
        .from("images")
        .upload(coverPath, coverArt, { upsert: true });
      if (coverError) {
        console.error("Cover art upload error:", coverError);
        const errorMessage = coverError.message || "Unknown error";
        const errorCode = coverError.code || "";
        const detailedMessage = `Failed to upload cover art (${coverArt.name}): ${errorMessage} [Code: ${errorCode}]`;

        // Check for specific error types
        if (errorCode === "23505") {
          throw new Error(
            `Duplicate cover image detected. Please try with a different image or filename.`,
          );
        } else if (
          errorMessage.includes("permission") ||
          errorCode === "42501"
        ) {
          throw new Error(
            `Permission denied when uploading cover art. Please check your account permissions.`,
          );
        } else if (
          errorMessage.includes("storage") ||
          errorMessage.includes("bucket")
        ) {
          throw new Error(
            `Storage bucket issue: ${errorMessage}. The images storage might not be properly configured.`,
          );
        } else if (!coverArt.type.startsWith("image/")) {
          throw new Error(
            `Invalid file type for cover art. Please upload an image file.`,
          );
        } else if (coverArt.size > 10 * 1024 * 1024) {
          // 10MB limit check
          throw new Error(
            `Cover image is too large (${(coverArt.size / (1024 * 1024)).toFixed(2)}MB). Maximum size is 10MB.`,
          );
        }

        throw new Error(detailedMessage);
      }

      // Get public URLs
      const audioUrl = supabase.storage.from("audio").getPublicUrl(audioPath)
        .data.publicUrl;
      const coverArtUrl = supabase.storage
        .from("images")
        .getPublicUrl(coverPath).data.publicUrl;

      // Update artist profile if provided
      if (artistProfile) {
        await updateArtistProfile(artistProfile);
      }

      // Ensure user exists in profiles table before creating track
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", user.id)
        .maybeSingle();

      // If profile doesn't exist, create it
      if (!existingProfile) {
        const { error: profileError } = await supabase.from("profiles").insert({
          id: user.id,
          name: artistProfile?.name || "Artist",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

        if (profileError) {
          console.error("Profile creation error:", profileError);
          throw new Error(
            `Failed to create user profile: ${profileError.message}`,
          );
        }
      }

      console.log("Attempting to insert track with data:", {
        artist_id: user.id,
        title,
        price,
        audio_url: audioUrl,
        cover_art_url: coverArtUrl,
      });

      // Create track record
      const { data: insertedTrack, error: trackError } = await supabase
        .from("artist_tracks")
        .insert({
          artist_id: user.id,
          title,
          price,
          audio_url: audioUrl,
          cover_art_url: coverArtUrl,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select();

      if (trackError) {
        console.error("Track insert error:", trackError);
        // Log more detailed information about the error
        console.log("Track insert details:", {
          table: "artist_tracks",
          errorCode: trackError.code,
          errorMessage: trackError.message,
          details: trackError.details,
          hint: trackError.hint,
        });

        // Check for specific error types
        if (trackError.code === "23503") {
          // Foreign key violation - likely the artist_id reference
          console.log("Foreign key violation - creating profiles record first");

          // Create a profiles record if it doesn't exist
          const { error: profilesError } = await supabase
            .from("profiles")
            .upsert({
              id: user.id,
              name: artistProfile?.name || "Artist",
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });

          if (profilesError) {
            console.error("Profiles creation error:", profilesError);
            throw new Error(
              `Failed to create profiles record: ${profilesError.message}`,
            );
          }

          // Try inserting the track again
          const { data: insertedTrack, error: retryError } = await supabase
            .from("artist_tracks")
            .insert({
              artist_id: user.id,
              title,
              price,
              audio_url: audioUrl,
              cover_art_url: coverArtUrl,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .select();

          if (!retryError && insertedTrack) {
            console.log("Successfully inserted track on retry:", insertedTrack);
          }

          if (retryError) {
            console.error("Track retry insert error:", retryError);
            throw new Error(
              `Failed to create track record after retry: ${retryError.message}`,
            );
          }
        } else {
          throw new Error(
            `Failed to create track record: ${trackError.message}`,
          );
        }
      }

      // Force refresh the tracks list by calling the API directly
      try {
        const { data: newTrack } = await supabase
          .from("artist_tracks")
          .select()
          .eq("title", title)
          .eq("artist_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        console.log("Verified track was inserted:", newTrack);

        // Manually trigger a refresh of the home page tracks
        const refreshEvent = new CustomEvent("refresh-tracks");
        window.dispatchEvent(refreshEvent);
      } catch (verifyError) {
        console.warn("Could not verify track insertion:", verifyError);
      }

      toast.success("Track uploaded successfully!");
      return true;
    } catch (error) {
      console.error("Error uploading track:", error);

      // Log additional diagnostic information
      console.log("Audio file details:", {
        name: audioFile.name,
        type: audioFile.type,
        size: `${(audioFile.size / (1024 * 1024)).toFixed(2)}MB`,
      });
      console.log("Cover art details:", {
        name: coverArt.name,
        type: coverArt.type,
        size: `${(coverArt.size / (1024 * 1024)).toFixed(2)}MB`,
      });

      toast.error(
        error instanceof Error ? error.message : "Failed to upload track",
      );
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  const updateArtistProfile = async (profileData: ArtistProfileData) => {
    if (!user) throw new Error("Must be signed in to update profile");
    setProfileUpdating(true);

    try {
      // Create images bucket if it doesn't exist
      await supabase.storage
        .createBucket("images", {
          public: true,
        })
        .catch(() => {}); // Ignore error if bucket already exists

      let profileImageUrl = null;
      let backgroundImageUrl = null;

      // Upload profile image if provided
      if (profileData.profileImage) {
        // Validate image file type and size before attempting upload
        if (!profileData.profileImage.type.startsWith("image/")) {
          throw new Error(
            `Invalid file type for profile image. Please upload an image file.`,
          );
        }
        if (profileData.profileImage.size > 5 * 1024 * 1024) {
          // 5MB limit
          throw new Error(
            `Profile image is too large (${(profileData.profileImage.size / (1024 * 1024)).toFixed(2)}MB). Maximum size is 5MB.`,
          );
        }

        const profilePath = `profiles/${user.id}/${Date.now()}-${profileData.profileImage.name.replace(/[^a-zA-Z0-9.-]/g, "")}`;
        const { error: profileError } = await supabase.storage
          .from("images")
          .upload(profilePath, profileData.profileImage, { upsert: true });
        if (profileError) {
          console.error("Profile image upload error:", profileError);
          const errorMessage = profileError.message || "Unknown error";
          const errorCode = profileError.code || "";
          const detailedMessage = `Failed to upload profile image (${profileData.profileImage.name}): ${errorMessage} [Code: ${errorCode}]`;

          // Check for specific error types
          if (errorCode === "23505") {
            throw new Error(
              `Duplicate profile image detected. Please try with a different image or filename.`,
            );
          } else if (
            errorMessage.includes("permission") ||
            errorCode === "42501"
          ) {
            throw new Error(
              `Permission denied when uploading profile image. Please check your account permissions.`,
            );
          } else if (
            errorMessage.includes("storage") ||
            errorMessage.includes("bucket")
          ) {
            throw new Error(
              `Storage bucket issue: ${errorMessage}. The images storage might not be properly configured.`,
            );
          }

          throw new Error(detailedMessage);
        }
        profileImageUrl = supabase.storage
          .from("images")
          .getPublicUrl(profilePath).data.publicUrl;
      }

      // Upload background image if provided
      if (profileData.backgroundImage) {
        // Validate image file type and size before attempting upload
        if (!profileData.backgroundImage.type.startsWith("image/")) {
          throw new Error(
            `Invalid file type for background image. Please upload an image file.`,
          );
        }
        if (profileData.backgroundImage.size > 10 * 1024 * 1024) {
          // 10MB limit
          throw new Error(
            `Background image is too large (${(profileData.backgroundImage.size / (1024 * 1024)).toFixed(2)}MB). Maximum size is 10MB.`,
          );
        }

        const bgPath = `backgrounds/${user.id}/${Date.now()}-${profileData.backgroundImage.name.replace(/[^a-zA-Z0-9.-]/g, "")}`;
        const { error: bgError } = await supabase.storage
          .from("images")
          .upload(bgPath, profileData.backgroundImage, { upsert: true });
        if (bgError) {
          console.error("Background image upload error:", bgError);
          const errorMessage = bgError.message || "Unknown error";
          const errorCode = bgError.code || "";
          const detailedMessage = `Failed to upload background image (${profileData.backgroundImage.name}): ${errorMessage} [Code: ${errorCode}]`;

          // Check for specific error types
          if (errorCode === "23505") {
            throw new Error(
              `Duplicate background image detected. Please try with a different image or filename.`,
            );
          } else if (
            errorMessage.includes("permission") ||
            errorCode === "42501"
          ) {
            throw new Error(
              `Permission denied when uploading background image. Please check your account permissions.`,
            );
          } else if (
            errorMessage.includes("storage") ||
            errorMessage.includes("bucket")
          ) {
            throw new Error(
              `Storage bucket issue: ${errorMessage}. The images storage might not be properly configured.`,
            );
          }

          throw new Error(detailedMessage);
        }
        backgroundImageUrl = supabase.storage
          .from("images")
          .getPublicUrl(bgPath).data.publicUrl;
      }

      // Check if artist profile exists
      const { data: existingProfile, error: fetchError } = await supabase
        .from("artist_profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (fetchError && fetchError.code !== "PGRST116") {
        console.error("Error fetching profile:", fetchError);
        throw new Error(
          `Failed to check existing profile: ${fetchError.message}`,
        );
      }

      const profileUpdate = {
        user_id: user.id,
        name: profileData.name,
        bio: profileData.bio || null,
        website_url: profileData.website || null,
        instagram_handle: profileData.instagram || null,
        twitter_handle: profileData.twitter || null,
        ...(profileImageUrl && { profile_image_url: profileImageUrl }),
        ...(backgroundImageUrl && { background_image_url: backgroundImageUrl }),
      };

      if (existingProfile) {
        // Update existing profile
        const { error: updateError } = await supabase
          .from("artist_profiles")
          .update(profileUpdate)
          .eq("user_id", user.id);
        if (updateError) {
          console.error("Profile update error:", updateError);
          throw new Error(`Failed to update profile: ${updateError.message}`);
        }
      } else {
        // Create new profile
        const { error: insertError } = await supabase
          .from("artist_profiles")
          .insert(profileUpdate);
        if (insertError) {
          console.error("Profile insert error:", insertError);
          throw new Error(`Failed to create profile: ${insertError.message}`);
        }
      }

      toast.success("Profile updated successfully!");
      return true;
    } catch (error) {
      console.error("Error updating artist profile:", error);

      // Log additional diagnostic information for profile images
      if (profileData.profileImage) {
        console.log("Profile image details:", {
          name: profileData.profileImage.name,
          type: profileData.profileImage.type,
          size: `${(profileData.profileImage.size / (1024 * 1024)).toFixed(2)}MB`,
        });
      }
      if (profileData.backgroundImage) {
        console.log("Background image details:", {
          name: profileData.backgroundImage.name,
          type: profileData.backgroundImage.type,
          size: `${(profileData.backgroundImage.size / (1024 * 1024)).toFixed(2)}MB`,
        });
      }

      toast.error(
        error instanceof Error ? error.message : "Failed to update profile",
      );
      throw error;
    } finally {
      setProfileUpdating(false);
    }
  };

  const getArtistProfile = async () => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from("artist_profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error && error.code !== "PGRST116") {
        console.error("Error fetching artist profile:", error);
        throw error;
      }
      return data || null;
    } catch (error) {
      console.error("Error fetching artist profile:", error);
      return null;
    }
  };

  return {
    uploadTrack,
    updateArtistProfile,
    getArtistProfile,
    isUploading,
    profileUpdating,
  };
}

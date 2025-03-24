import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useProfile } from "../hooks/useProfile";
import { UserType } from "../types/user";
import ArtistDashboard from "../components/Profile/Dashboards/Artist/ArtistDashboard";
import ContentCreatorDashboard from "../components/Profile/ContentCreatorDashboard";
import InvestorDashboard from "../components/Profile/InvestorDashboard";

export default function ProfilePage() {
  const { user } = useAuth();
  const { profile, updateProfile } = useProfile();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    userType: "" as UserType | "",
  });

  useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate]);

  useEffect(() => {
    if (profile) {
      setFormData({
        userType: profile.userType || "",
      });
    }
  }, [profile]);

  const userTypes: { value: UserType; label: string }[] = [
    { value: "artist", label: "Artist" },
    { value: "content-creator", label: "Content Creator" },
    { value: "investor", label: "Investor" },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      userType: formData.userType as UserType,
    }).catch((error) => {
      console.error("Error updating profile:", error);
    });
  };

  const renderDashboard = () => {
    switch (formData.userType) {
      case "artist":
        return <ArtistDashboard />;
      case "content-creator":
        return <ContentCreatorDashboard />;
      case "investor":
        return <InvestorDashboard />;
      default:
        return null;
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-surface rounded-xl overflow-hidden border border-accent/20">
        {/* Profile Header */}
        <div className="relative h-32 bg-surface border-b border-accent/20">
          <div className="absolute -bottom-12 left-8">
            <div className="w-24 h-24 rounded-full bg-surface border border-accent/20 flex items-center justify-center">
              <User className="w-12 h-12 text-primary/60" />
            </div>
          </div>
        </div>

        <div className="pt-16 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-sm text-primary/60">Email</label>
              <p className="mt-1 text-primary">{user.email}</p>
            </div>

            {/* User Type */}
            <div>
              <label className="block text-sm text-primary/60 mb-2">
                I am a...
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {userTypes.map((type) => (
                  <label
                    key={type.value}
                    className={`
                      flex items-center justify-center px-4 py-3 border rounded-lg cursor-pointer
                      transition-colors text-sm
                      ${
                        formData.userType === type.value
                          ? "bg-accent/20 text-white border-accent shadow-lg font-medium"
                          : "border-accent/20 text-primary hover:text-accent"
                      }
                    `}
                  >
                    <input
                      type="radio"
                      name="userType"
                      value={type.value}
                      checked={formData.userType === type.value}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          userType: e.target.value as UserType,
                        })
                      }
                      className="sr-only"
                    />
                    <span>{type.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* User Type Specific Dashboard */}
      {formData.userType && renderDashboard()}
    </div>
  );
}

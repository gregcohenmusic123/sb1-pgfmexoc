import React from "react";
import { Twitter, Instagram, Globe } from "lucide-react";

interface SocialLinks {
  twitter?: string;
  instagram?: string;
  website?: string;
}

interface ArtistSocialLinksProps {
  socialLinks: SocialLinks;
}

export default function ArtistSocialLinks({
  socialLinks,
}: ArtistSocialLinksProps) {
  const hasSocialLinks =
    socialLinks.twitter || socialLinks.instagram || socialLinks.website;

  if (!hasSocialLinks) return null;

  return (
    <div className="mt-6">
      <h3 className="text-sm font-medium text-primary/80 mb-2">Connect</h3>
      <div className="flex flex-wrap gap-3">
        {socialLinks.twitter && (
          <a
            href={socialLinks.twitter}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-1.5 bg-surface/80 hover:bg-accent/10 border border-accent/20 rounded-lg text-primary/80 hover:text-accent transition-colors text-sm"
          >
            <Twitter className="w-4 h-4" />
            <span>Twitter</span>
          </a>
        )}
        {socialLinks.instagram && (
          <a
            href={socialLinks.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-1.5 bg-surface/80 hover:bg-accent/10 border border-accent/20 rounded-lg text-primary/80 hover:text-accent transition-colors text-sm"
          >
            <Instagram className="w-4 h-4" />
            <span>Instagram</span>
          </a>
        )}
        {socialLinks.website && (
          <a
            href={socialLinks.website}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-1.5 bg-surface/80 hover:bg-accent/10 border border-accent/20 rounded-lg text-primary/80 hover:text-accent transition-colors text-sm"
          >
            <Globe className="w-4 h-4" />
            <span>Website</span>
          </a>
        )}
      </div>
    </div>
  );
}

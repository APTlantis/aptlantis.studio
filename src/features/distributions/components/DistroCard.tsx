import type React from "react";

import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useSyncStatus } from "../context/SyncStatusContext";
import { useToast } from "../hooks/useToast";
import { Copy, ExternalLink } from "./icons";

/**
 * Interface for the properties of the DistroCard component
 *
 * @interface DistroCardProps
 * @property {string} id - Unique identifier for the distribution
 * @property {string} title - Name of the Linux distribution
 * @property {string} description - Short description of the distribution
 * @property {string} buttonColor - CSS class for the primary button color
 * @property {string} buttonText - Text to display on the primary button
 * @property {string} rsyncCommand - Command to sync the distribution using rsync
 * @property {string} logoSrc - URL to the distribution's logo image
 * @property {string} websiteUrl - URL to the distribution's official website
 * @property {string} [isoUrl] - Optional URL to download the distribution's ISO file
 * @property {string} [aboutText] - Optional detailed description of the distribution
 * @property {number} [releaseYear] - Optional year when the distribution was first released
 * @property {boolean} [isMuseum] - Optional flag indicating if this is a historical/museum distribution
 * @property {string[]} [videos] - Optional array of video URLs related to the distribution
 * @property {string[]} [historicalPosts] - Optional array of URLs to historical blog posts/articles
 * @property {string} [historicalContext] - Optional text describing the historical context
 * @property {number} [yearDiscontinued] - Optional year when the distribution was discontinued
 */
interface DistroCardProps {
  id: string;
  title: string;
  description: string;
  buttonColor: string;
  buttonText: string;
  rsyncCommand: string;
  logoSrc: string;
  websiteUrl: string;
  isoUrl?: string;
  aboutText?: string;
  releaseYear?: number;
  isMuseum?: boolean;
  videos?: string[];
  historicalPosts?: string[];
  historicalContext?: string;
  yearDiscontinued?: number;
  tags?: string[];
}

/**
 * DistroCard Component
 *
 * Displays a card with information about a Linux distribution.
 * The card includes the distribution's logo, name, description, tags,
 * and buttons to visit the website, download ISO, and copy rsync command.
 * The card also shows a sync status indicator and can be clicked to view more details.
 *
 * @param {DistroCardProps} props - The properties for the DistroCard component
 * @returns {JSX.Element} A card displaying information about a Linux distribution
 */
const DistroCard = ({
  id,
  title,
  description,
  buttonColor,
  buttonText,
  rsyncCommand,
  logoSrc,
  websiteUrl,
  isMuseum,
  tags = [],
}: DistroCardProps) => {
  // Get sync status from context
  const { syncStatuses } = useSyncStatus();
  const syncStatus = id ? syncStatuses[id] : undefined;
  const { toast } = useToast();
  const navigate = useNavigate();

  // State for image loading and error
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // State for selected tags
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Tag colors - will be randomly assigned, memoized to prevent recreation on every render
  const tagColors = useMemo(
    () => [
      "bg-blue-500 text-white",
      "bg-green-500 text-white",
      "bg-purple-500 text-white",
      "bg-red-500 text-white",
      "bg-yellow-500 text-black",
      "bg-pink-500 text-white",
      "bg-indigo-500 text-white",
      "bg-teal-500 text-white",
      "bg-orange-500 text-white",
      "bg-cyan-500 text-white",
    ],
    [],
  );

  // State for tag colors
  const [tagColorMap, setTagColorMap] = useState<Record<string, string>>({});

  /**
   * Effect hook to select random tags when component mounts
   * Randomly selects 2-3 tags from the available tags for this distribution
   * and assigns random colors to them
   */
  useEffect(() => {
    if (tags && tags.length > 0) {
      // Randomly select 2-3 tags
      const numTags = Math.min(tags.length, Math.floor(Math.random() * 2) + 2); // 2-3 tags
      const shuffled = [...tags].sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, numTags);

      // Assign random colors to selected tags
      const colorMap: Record<string, string> = {};
      selected.forEach((tag) => {
        const randomColor =
          tagColors[Math.floor(Math.random() * tagColors.length)];
        colorMap[tag] = randomColor;
      });

      setSelectedTags(selected);
      setTagColorMap(colorMap);
    }
  }, [tags, tagColors]);

  /**
   * Handles copying the rsync command to the clipboard
   *
   * @param {React.MouseEvent} e - The click event
   * @returns {void}
   */
  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(rsyncCommand);
    toast({
      title: "Command Copied!",
      description: `${title} rsync command copied to clipboard.`,
      duration: 3000,
    });
  };

  /**
   * Returns the CSS class for the sync status indicator dot
   *
   * @returns {string} CSS class name for the sync status indicator
   */
  const getSyncStatusColor = () => {
    switch (syncStatus) {
      case "synced":
        return "bg-green-500";
      case "syncing":
        return "bg-yellow-500";
      case "failed":
        return "bg-red-500";
      default:
        return "bg-gray-500 opacity-0"; // Hidden if no status
    }
  };

  /**
   * Handles click events on the card
   * Navigates to the distribution detail page
   *
   * @param {React.MouseEvent} e - The click event
   * @returns {void}
   */
  const handleCardClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    // For all distros, navigate to the distro detail page using React Router
    navigate(`/distro/${id}`);
  };

  return (
    <div
      className="bg-white dark:bg-[#1a1a1a] border border-cyan-500/30 hover:border-cyan-500/70 rounded-lg p-4 flex flex-col h-full relative
      transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-cyan-500/20 cursor-pointer group"
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      aria-label={`View details for ${title}`}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          navigate(`/distro/${id}`);
        }
      }}
    >
      {/* Sync status indicator dot with tooltip */}
      <div
        className={`absolute top-2 right-2 w-3 h-3 rounded-full ${getSyncStatusColor()} shadow-glow`}
        title={syncStatus ? `Status: ${syncStatus}` : ""}
        aria-label={
          syncStatus ? `Mirror status: ${syncStatus}` : "Mirror status unknown"
        }
      />

      <div className="flex justify-center mb-2 relative">
        {/* Skeleton loader for image - only show when image is loading and not errored */}
        {!isImageLoaded && !imageError && logoSrc && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
          </div>
        )}

        {/* Only render the image if we have a logoSrc and no error */}
        {logoSrc && !imageError ? (
          <img
            src={logoSrc}
            width={80}
            height={80}
            alt={`${title} Logo`}
            className={`w-20 h-20 rounded-full object-cover transition-all duration-300 group-hover:scale-110 ${isImageLoaded ? "opacity-100" : "opacity-0"}`}
            onLoad={() => setIsImageLoaded(true)}
            onError={() => {
              // If image fails to load, set error state
              setImageError(true);
            }}
          />
        ) : null}

        {/* Custom placeholder that shows when no logo exists or when loading fails */}
        <div
          className={`logo-placeholder w-20 h-20 rounded-full flex items-center justify-center ${!logoSrc || imageError ? "flex" : "hidden"}`}
          style={{
            backgroundColor: buttonColor?.split(" ")[0] || "bg-gray-200",
            color: "white",
          }}
        >
          <span className="text-xl font-bold">
            {title ? title.substring(0, 2).toUpperCase() : "??"}
          </span>
        </div>

        {/* Museum badge */}
        {isMuseum && (
          <div className="absolute -top-2 -right-2 bg-purple-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg transform rotate-12 animate-pulse">
            Museum
          </div>
        )}
      </div>

      <h2 className="text-lg font-bold text-gray-800 dark:text-white text-center">
        {title}
      </h2>

      {/* Tags display */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap justify-center gap-1 mt-2">
          {selectedTags.map((tag) => (
            <span
              key={tag}
              className={`${tagColorMap[tag]} text-xs px-2 py-1 rounded-full font-medium`}
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <p className="text-sm text-gray-600 dark:text-gray-300 text-center mt-2 flex-grow">
        {description}
      </p>

      <div className="flex flex-col gap-2 mt-4">
        <a
          href={websiteUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`${buttonColor} px-4 py-2 rounded text-center text-sm font-medium flex items-center justify-center gap-1`}
          onClick={(e) => e.stopPropagation()}
        >
          {buttonText} <ExternalLink className="w-3.5 h-3.5" />
        </a>

        <button
          className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 px-4 py-2 rounded text-center text-sm font-medium flex items-center justify-center gap-1"
          onClick={handleCopy}
        >
          Copy rsync <Copy className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

export default DistroCard;

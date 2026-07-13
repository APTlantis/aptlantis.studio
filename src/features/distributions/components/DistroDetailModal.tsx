/* eslint-disable jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/no-noninteractive-tabindex */
import { useEffect } from "react";
import { X, ExternalLink, FileDown, Copy } from "./icons";
import { useToast } from "../hooks/useToast";

/**
 * Interface representing a Linux distribution
 *
 * @interface Distro
 * @property {string} id - Unique identifier for the distribution
 * @property {string} title - Name of the Linux distribution
 * @property {string} description - Short description of the distribution
 * @property {string} logoSrc - URL to the distribution's logo image
 * @property {string} websiteUrl - URL to the distribution's official website
 * @property {string} rsyncCommand - Command to sync the distribution using rsync
 * @property {string} [isoUrl] - Optional URL to download the distribution's ISO file
 * @property {string} [aboutText] - Optional detailed description of the distribution
 * @property {number} [releaseYear] - Optional year when the distribution was first released
 */
interface Distro {
  id: string;
  title: string;
  description: string;
  logoSrc: string;
  websiteUrl: string;
  rsyncCommand: string;
  isoUrl?: string;
  aboutText?: string;
  releaseYear?: number;
}

/**
 * Interface for the properties of the DistroDetailModal component
 *
 * @interface DistroDetailModalProps
 * @property {boolean} isOpen - Whether the modal is currently open
 * @property {() => void} onClose - Function to call when the modal is closed
 * @property {Distro} distro - The distribution to display in the modal
 */
interface DistroDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  distro: Distro;
}

/**
 * DistroDetailModal Component
 *
 * A modal component that displays detailed information about a Linux distribution.
 * Includes the distribution's logo, name, description, website link, ISO download link,
 * and rsync command. The modal can be closed by clicking outside, pressing ESC, or
 * clicking the close button.
 *
 * @param {DistroDetailModalProps} props - The properties for the DistroDetailModal component
 * @returns {JSX.Element | null} The modal component or null if not open
 */
const DistroDetailModal = ({
  isOpen,
  onClose,
  distro,
}: DistroDetailModalProps) => {
  const { toast } = useToast();

  /**
   * Effect hook to prevent body scrolling when the modal is open
   * Sets body overflow to hidden when modal opens and restores it when modal closes
   */
  useEffect(() => {
    // Prevent scrolling when modal is open
    if (typeof document !== "undefined" && isOpen) {
      document.body.style.overflow = "hidden";
    }

    // Cleanup function to re-enable scrolling when component unmounts or modal closes
    return () => {
      if (typeof document !== "undefined") {
        document.body.style.overflow = "auto";
      }
    };
  }, [isOpen]);

  /**
   * Effect hook to handle ESC key press to close the modal
   * Adds and removes event listener for keyboard events
   */
  useEffect(() => {
    if (typeof window === "undefined") return;

    /**
     * Event handler for keyboard events to close modal on ESC key press
     *
     * @param {KeyboardEvent} e - The keyboard event
     */
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEsc);

    return () => {
      window.removeEventListener("keydown", handleEsc);
    };
  }, [onClose]);

  /**
   * Copies the rsync command to the clipboard and shows a toast notification
   *
   * @returns {void}
   */
  const handleCopy = () => {
    navigator.clipboard.writeText(distro.rsyncCommand);
    toast({
      title: "Command Copied!",
      description: `${distro.title} rsync command copied to clipboard.`,
      duration: 3000,
    });
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 sm:p-6 md:p-8 animate-fadeIn"
      onClick={onClose}
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          onClose();
        }
      }}
      role="presentation"
      tabIndex={-1}
    >
      {/* Baseball card style modal - landscape orientation */}
      <div
        className="bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] rounded-xl w-full max-w-5xl overflow-hidden shadow-2xl animate-scaleIn border-2 border-cyan-500/30"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
        tabIndex={0}
        style={{ minHeight: "300px", maxHeight: "90vh" }}
      >
        {/* Close button - absolute positioned in the top-right corner */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors bg-black/40 rounded-full p-1 hover:bg-black/60"
          aria-label="Close modal"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Card content - flex layout for landscape orientation */}
        <div className="flex flex-col md:flex-row h-full">
          {/* Left side - Logo and basic info */}
          <div className="w-full md:w-1/3 p-4 md:p-6 lg:p-8 flex flex-col items-center justify-center bg-gradient-to-b from-[#0a0a0a]/80 to-transparent md:border-r border-cyan-500/20">
            <img
              src={distro.logoSrc || "/placeholder.svg"}
              width={192}
              height={192}
              alt={`${distro.title} logo`}
              className="w-32 h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 rounded-full mb-4 md:mb-6 shadow-lg shadow-cyan-500/20 object-cover"
            />
            <h2
              id="modal-title"
              className="text-2xl md:text-3xl font-bold text-white text-center mb-2"
            >
              {distro.title}
            </h2>
            {distro.releaseYear && (
              <p className="text-cyan-400 text-base md:text-lg">
                Est. {distro.releaseYear}
              </p>
            )}

            <div className="mt-4 md:mt-6 flex gap-3 md:gap-4">
              <a
                href={distro.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-cyan-600 text-white py-1.5 md:py-2 px-3 md:px-4 rounded-md text-sm flex items-center justify-center hover:bg-cyan-700 transition-all duration-200 shadow-md"
              >
                <ExternalLink className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1.5 md:mr-2" />
                Website
              </a>

              {distro.isoUrl && (
                <a
                  href={distro.isoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-green-600 text-white py-1.5 md:py-2 px-3 md:px-4 rounded-md text-sm flex items-center justify-center hover:bg-green-700 transition-all duration-200 shadow-md"
                >
                  <FileDown className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1.5 md:mr-2" />
                  ISO
                </a>
              )}
            </div>
          </div>

          {/* Right side - Details and features */}
          <div
            className="w-full md:w-2/3 p-4 md:p-6 lg:p-8 overflow-y-auto max-h-[60vh] md:max-h-[70vh]"
            style={{
              scrollbarWidth: "thin",
              scrollbarColor: "rgba(6, 182, 212, 0.2) transparent",
            }}
          >
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-bold text-cyan-400 mb-3 border-b border-cyan-500/30 pb-2">
                  About
                </h3>
                <p
                  id="modal-description"
                  className="text-gray-200 text-lg leading-relaxed"
                >
                  {distro.description}
                </p>
                <p className="text-gray-300 mt-4 leading-relaxed">
                  {distro.aboutText ||
                    `${distro.title} is a Linux distribution that provides a complete operating system with its own
                  package management system. For more information, visit the official website.`}
                </p>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-cyan-400 mb-3 border-b border-cyan-500/30 pb-2">
                  Mirror Information
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  Our mirrors are updated regularly to ensure you have access to
                  the latest packages and security updates. Use the rsync
                  command below to create a local mirror.
                </p>

                <div className="mt-4 bg-[#0a0a0a] p-4 rounded-md border border-cyan-500/20">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-lg font-semibold text-cyan-400">
                      Rsync Command
                    </h4>
                    <button
                      onClick={handleCopy}
                      className="text-gray-400 hover:text-white bg-[#1a1a1a] p-1 rounded hover:bg-[#252525] transition-colors"
                      title="Copy command"
                      aria-label="Copy rsync command"
                    >
                      <Copy className="w-5 h-5" />
                    </button>
                  </div>
                  <code className="text-green-400 text-sm block overflow-x-auto whitespace-nowrap p-2 bg-black/50 rounded">
                    {distro.rsyncCommand}
                  </code>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DistroDetailModal;

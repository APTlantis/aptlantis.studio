import { useState } from "react";
import type { Torrent } from "../data/torrentsLoader";
import {
  formatFileSize,
  getMainFile,
  formatDate,
} from "../data/torrentsLoader";
import { ChevronRight } from "./icons";

interface TorrentCardProps {
  torrent: Torrent;
}

/**
 * TorrentCard Component
 *
 * Displays a card with torrent information.
 * Has two states: collapsed (shows minimal info) and expanded (shows full details)
 *
 * @param {TorrentCardProps} props - The torrent data to display
 * @returns {JSX.Element} A card displaying torrent information
 */
const TorrentCard = ({ torrent }: TorrentCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const mainFile = getMainFile(torrent);
  const fileName = mainFile?.path || torrent.filename;

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm transition-all duration-200 ${
        isExpanded ? "shadow-md" : "hover:shadow-md"
      }`}
    >
      {/* Collapsed view - always visible */}
      <button
        onClick={toggleExpanded}
        className="w-full p-4 text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors rounded-lg"
      >
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-medium text-gray-900 dark:text-white truncate">
            {fileName}
          </h3>
          <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
            <span className="flex items-center">
              <svg
                className="w-4 h-4 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
              {formatFileSize(mainFile?.size || torrent.size_bytes)}
            </span>
            <span className="flex items-center">
              <svg
                className="w-4 h-4 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              {formatDate(torrent.torrent.creation_date)}
            </span>
            {torrent.torrent.file_count > 1 && (
              <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded">
                {torrent.torrent.file_count} files
              </span>
            )}
          </div>
        </div>
        <ChevronRight
          className={`w-5 h-5 text-gray-400 transition-transform flex-shrink-0 ml-2 ${
            isExpanded ? "rotate-90" : ""
          }`}
        />
      </button>

      {/* Expanded view - shows when clicked */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-4 border-t border-gray-100 dark:border-gray-700 pt-4">
          {/* Download Section */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Download
            </h4>
            <div className="flex flex-wrap gap-2">
              {torrent.download_urls.map((url, index) => (
                <a
                  key={index}
                  href={url.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-3 py-1.5 text-sm bg-blue-600 dark:bg-blue-700 text-white rounded hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
                >
                  {url.type === "torrent" ? (
                    <svg
                      className="w-4 h-4 mr-1.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
                    </svg>
                  ) : (
                    <svg
                      className="w-4 h-4 mr-1.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                  {url.type === "torrent" ? "Torrent File" : "Direct Download"}
                </a>
              ))}
            </div>
          </div>

          {/* Info Hash */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Info Hash
            </h4>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-xs bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-300 px-3 py-2 rounded font-mono break-all">
                {torrent.torrent.info_hash}
              </code>
              <button
                onClick={() => copyToClipboard(torrent.torrent.info_hash)}
                className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                title="Copy info hash"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Torrent Details */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Pieces
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {torrent.torrent.piece_count.toLocaleString()} (
                {formatFileSize(torrent.torrent.piece_length)} each)
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Created By
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {torrent.torrent.created_by || "Unknown"}
              </p>
            </div>
          </div>

          {/* Trackers */}
          {torrent.torrent.trackers && torrent.torrent.trackers.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Trackers ({torrent.torrent.trackers.length})
              </h4>
              <div className="space-y-1">
                {torrent.torrent.trackers.slice(0, 3).map((tracker, index) => (
                  <div
                    key={index}
                    className="text-xs bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-400 px-3 py-1.5 rounded font-mono break-all"
                  >
                    {tracker}
                  </div>
                ))}
                {torrent.torrent.trackers.length > 3 && (
                  <p className="text-xs text-gray-500 dark:text-gray-500 italic">
                    + {torrent.torrent.trackers.length - 3} more trackers
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Tags */}
          {torrent.aptlantis.tags && torrent.aptlantis.tags.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Tags
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {torrent.aptlantis.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Hashes */}
          {torrent.hashes && Object.keys(torrent.hashes).length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Checksums
              </h4>
              <div className="space-y-2">
                {Object.entries(torrent.hashes)
                  .slice(0, 3)
                  .map(([algo, hash]) => (
                    <div key={algo} className="flex items-start gap-2">
                      <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase min-w-[80px]">
                        {algo.replace(/_/g, "-")}:
                      </span>
                      <code className="flex-1 text-xs bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-400 px-2 py-1 rounded font-mono break-all">
                        {hash}
                      </code>
                    </div>
                  ))}
                {Object.keys(torrent.hashes).length > 3 && (
                  <p className="text-xs text-gray-500 dark:text-gray-500 italic">
                    + {Object.keys(torrent.hashes).length - 3} more hash
                    algorithms
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TorrentCard;

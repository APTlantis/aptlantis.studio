import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import TorrentCard from "../components/TorrentCard";
import TorrentChatbot from "../components/TorrentChatbot";
import { torrents } from "../data/torrentsLoader";
import { Search } from "../../../shared/icons";
import MetaTags from "../../../components/MetaTags";

/**
 * TorrentsPage Component
 *
 * Displays a searchable, filterable list of all available torrents
 * Uses TorrentCard components to show torrent details
 *
 * @returns {JSX.Element} The torrents listing page
 */
const TorrentsPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const torrentsPerPage = 50;

  // Filter torrents based on search query
  const filteredTorrents = useMemo(() => {
    if (!searchQuery.trim()) {
      return torrents;
    }

    const query = searchQuery.toLowerCase();
    return torrents.filter((torrent) => {
      const fileName = torrent.torrent.files[0]?.path || torrent.filename;
      const tags = torrent.aptlantis.tags?.join(" ") || "";

      return (
        fileName.toLowerCase().includes(query) ||
        tags.toLowerCase().includes(query)
      );
    });
  }, [searchQuery]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredTorrents.length / torrentsPerPage);
  const startIndex = (currentPage - 1) * torrentsPerPage;
  const endIndex = startIndex + torrentsPerPage;
  const currentTorrents = filteredTorrents.slice(startIndex, endIndex);

  // Reset to page 1 when search query changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <MetaTags
        title="Academic Torrents Collection | APTlantis"
        description="Browse and download academic research datasets, papers, and educational materials via BitTorrent from the Academic Torrents collection."
        canonicalUrl="https://aptlantis.net/torrents"
      />

      {/* Breadcrumb */}
      <div className="mb-6">
        <nav className="flex" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <Link
                to="/"
                className="text-gray-600 dark:text-gray-400 hover:text-cyan-600 dark:hover:text-cyan-400"
              >
                Home
              </Link>
            </li>
            <li>
              <div className="flex items-center">
                <svg
                  className="w-4 h-4 text-gray-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <Link
                  to="/distro/princeton-torrents"
                  className="ml-1 text-gray-600 dark:text-gray-400 hover:text-cyan-600 dark:hover:text-cyan-400 md:ml-2"
                >
                  Princeton Academic Torrents
                </Link>
              </div>
            </li>
            <li>
              <div className="flex items-center">
                <svg
                  className="w-4 h-4 text-gray-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="ml-1 text-gray-600 dark:text-gray-400 md:ml-2">
                  All Torrents
                </span>
              </div>
            </li>
          </ol>
        </nav>
      </div>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">
          Academic Torrents Collection
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300">
          Browse {torrents.length.toLocaleString()} research datasets, papers,
          and educational materials
        </p>
      </div>

      {/* Chatbot Assistant */}
      <div className="mb-6">
        <TorrentChatbot torrents={torrents} />
      </div>

      {/* Search Bar */}
      <div className="mb-6 flex items-center bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <Search className="w-5 h-5 text-gray-400 mr-3" />
        <input
          type="text"
          placeholder="Search torrents by filename or tags..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="flex-1 bg-transparent text-gray-900 dark:text-white focus:outline-none"
        />
        {searchQuery && (
          <button
            onClick={() => {
              setSearchQuery("");
              setCurrentPage(1);
            }}
            className="ml-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"
            title="Clear search"
          >
            ×
          </button>
        )}
      </div>

      {/* Results Info */}
      <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
        Showing {startIndex + 1}-{Math.min(endIndex, filteredTorrents.length)}{" "}
        of {filteredTorrents.length.toLocaleString()} torrents
        {searchQuery && ` matching "${searchQuery}"`}
      </div>

      {/* Torrent Cards */}
      {filteredTorrents.length > 0 ? (
        <>
          <div className="space-y-3 mb-8">
            {currentTorrents.map((torrent, index) => (
              <TorrentCard
                key={torrent.torrent.info_hash || index}
                torrent={torrent}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className={`px-4 py-2 rounded ${
                  currentPage === 1
                    ? "bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>

              <span className="text-gray-700 dark:text-gray-300">
                Page {currentPage} of {totalPages}
              </span>

              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                className={`px-4 py-2 rounded ${
                  currentPage === totalPages
                    ? "bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <h3 className="text-xl font-semibold mb-2 text-gray-700 dark:text-gray-300">
            No torrents found
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Try adjusting your search terms to find what you're looking for.
          </p>
        </div>
      )}
    </div>
  );
};

export default TorrentsPage;

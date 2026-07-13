import { useState } from "react";
import VideoCard from "./VideoCard";
import VideoPlayer from "./VideoPlayer";

const VideoGrid = ({ videos }) => {
  const [selectedVideo, setSelectedVideo] = useState(null);

  const handleVideoClick = (video) => {
    setSelectedVideo(video);
  };

  const closeModal = () => {
    setSelectedVideo(null);
  };

  // Handle keyboard events for the modal
  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      closeModal();
    }
  };

  return (
    <div>
      {/* Video Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.map((video) => (
          <VideoCard
            key={video.id}
            video={video}
            onClick={() => handleVideoClick(video)}
          />
        ))}
      </div>

      {/* Empty state */}
      {videos.length === 0 && (
        <div className="text-center py-12">
          <h3 className="text-xl font-medium text-gray-300 mb-2">
            No videos found
          </h3>
          <p className="text-gray-400">
            Try adjusting your filters or search query to find videos.
          </p>
        </div>
      )}

      {/* Video Modal */}
      {selectedVideo && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={closeModal}
          onKeyDown={handleKeyDown}
          tabIndex={-1}
        >
          <div
            className="bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-white">
                  {selectedVideo.title}
                </h2>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-white"
                  aria-label="Close modal"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* Video Player */}
              <div className="mb-4">
                <VideoPlayer
                  url={selectedVideo.url}
                  title={selectedVideo.title}
                />
              </div>

              <div className="mb-4">
                <p className="text-gray-300 mb-2">
                  {selectedVideo.description}
                </p>
                <div className="flex items-center text-gray-400 text-sm">
                  <span className="mr-4">Year: {selectedVideo.year}</span>
                  <span>Duration: {selectedVideo.duration}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {selectedVideo.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 text-sm rounded-full bg-gray-700 text-gray-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoGrid;

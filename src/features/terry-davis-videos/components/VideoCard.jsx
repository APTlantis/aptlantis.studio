const VideoCard = ({ video, onClick }) => {
  return (
    <div
      className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-cyan-500/20 transition-shadow cursor-pointer"
      onClick={onClick}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video bg-gray-900">
        {/* This would be an actual image in production */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-cyan-500 bg-gray-800 bg-opacity-70 p-3 rounded-full">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </div>
        <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
          {video.duration}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-lg font-medium text-white mb-1 line-clamp-2">
          {video.title}
        </h3>
        <p className="text-gray-400 text-sm mb-2">{video.year}</p>
        <p className="text-gray-300 text-sm line-clamp-2 mb-3">
          {video.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1">
          {video.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 text-xs rounded-full bg-gray-700 text-gray-300"
            >
              {tag}
            </span>
          ))}
          {video.tags.length > 3 && (
            <span className="px-2 py-0.5 text-xs rounded-full bg-gray-700 text-gray-300">
              +{video.tags.length - 3}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoCard;

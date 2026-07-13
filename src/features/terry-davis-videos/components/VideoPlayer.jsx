import { useMemo, useState } from "react";

// Lightweight player without external deps; uses native <video> with graceful fallback
const VideoPlayer = ({ url, title }) => {
  const [error, setError] = useState(false);

  const processedUrl = useMemo(() => {
    if (
      url &&
      !url.startsWith("http") &&
      !url.startsWith("blob:") &&
      !url.startsWith("file://")
    ) {
      const baseUrl = window.location.origin;
      return `${baseUrl}/${url.replace(/\\/g, "/")}`;
    }
    return url;
  }, [url]);

  const handleError = () => setError(true);

  return (
    <div className="video-player-container">
      {error ? (
        <div className="bg-gray-900 rounded-lg p-6 text-center">
          <p className="text-red-400 mb-4">
            Failed to load video. The format may not be supported by your
            browser.
          </p>
          <a
            href={processedUrl}
            target="_blank"
            rel="noopener noreferrer"
            download={title || "video"}
            className="inline-block bg-cyan-600 hover:bg-cyan-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            Download Video
          </a>
        </div>
      ) : (
        <div className="relative aspect-w-16 aspect-h-9 bg-gray-900 rounded-lg overflow-hidden">
          <video
            src={processedUrl}
            controls
            className="absolute inset-0 w-full h-full"
            controlsList="nodownload"
            onContextMenu={(e) => e.preventDefault()}
            onError={handleError}
            title={title || "Video Player"}
          />
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;

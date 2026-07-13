import type { Artifact } from "../data/artifactsLoader";
import { formatFileSize } from "../data/torrentsLoader";
import { Copy } from "./icons";

interface ZipArtifactCardProps {
  artifact: Artifact;
  downloadBaseUrl?: string;
}

const ZipArtifactCard = ({
  artifact,
  downloadBaseUrl,
}: ZipArtifactCardProps) => {
  const normalizedBase = downloadBaseUrl?.endsWith("/")
    ? downloadBaseUrl.slice(0, -1)
    : downloadBaseUrl;
  const downloadUrl = normalizedBase
    ? `${normalizedBase}/${artifact.filename}`
    : undefined;
  const hashEntries = Object.entries(artifact.hashes);

  const handleCopy = (value: string) => {
    if (!value) return;
    navigator.clipboard?.writeText(value).catch(() => undefined);
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl p-4 space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="flex-1 min-w-0">
          <p className="text-xs uppercase tracking-wide text-purple-600 dark:text-purple-300 font-semibold">
            Compressed Archive
          </p>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white break-all">
            {artifact.filename}
          </h3>
          <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-300">
            <span className="flex items-center gap-1">
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
                  d="M4 7h16M4 12h10M4 17h4"
                />
              </svg>
              ZIP archive
            </span>
            <span className="flex items-center gap-1">
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
                  d="M12 8c-1.657 0-3 1.343-3 3v7a3 3 0 006 0v-7c0-1.657-1.343-3-3-3z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 8V6a4 4 0 118 0v2"
                />
              </svg>
              {formatFileSize(artifact.size_bytes)}
            </span>
            {artifact.iso?.architecture && (
              <span className="flex items-center gap-1">
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
                    d="M3 12h18M12 5l7 7-7 7"
                  />
                </svg>
                {artifact.iso.architecture.toUpperCase()}
              </span>
            )}
          </div>
        </div>
        {downloadUrl && (
          <a
            href={downloadUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-purple-600 text-white text-sm font-medium hover:bg-purple-700 transition-colors"
          >
            Download ZIP
            <svg
              className="w-4 h-4 ml-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2m-5-4l-3 3m0 0l-3-3m3 3V4"
              />
            </svg>
          </a>
        )}
      </div>

      {artifact.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {artifact.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs font-medium px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-200"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {hashEntries.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">
            Integrity
          </p>
          <div className="space-y-2">
            {hashEntries.slice(0, 2).map(([algorithm, value]) => (
              <div
                key={algorithm}
                className="flex items-start gap-2 bg-white dark:bg-gray-800 rounded-lg p-2 border border-gray-200 dark:border-gray-700"
              >
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase min-w-[70px]">
                  {algorithm}
                </span>
                <code className="flex-1 text-xs text-gray-800 dark:text-gray-200 break-all">
                  {value}
                </code>
                <button
                  onClick={() => handleCopy(value)}
                  className="text-gray-400 hover:text-gray-700 dark:hover:text-white"
                  title={`Copy ${algorithm} hash`}
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            ))}
            {hashEntries.length > 2 && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                + {hashEntries.length - 2} additional checksum
                {hashEntries.length - 2 > 1 ? "s" : ""}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ZipArtifactCard;

import type { Artifact } from "../data/artifactsLoader";
import { formatFileSize } from "../data/torrentsLoader";
import { Copy } from "./icons";

interface IsoArtifactCardProps {
  artifact: Artifact;
  downloadBaseUrl?: string;
}

const IsoArtifactCard = ({
  artifact,
  downloadBaseUrl,
}: IsoArtifactCardProps) => {
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
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-4 space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="flex-1 min-w-0">
          <p className="text-xs uppercase tracking-wide text-blue-600 dark:text-blue-300 font-semibold">
            ISO Image
          </p>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white break-words">
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
                    d="M3 7h18M3 12h18M3 17h18"
                  />
                </svg>
                {artifact.iso.architecture.toUpperCase()}
              </span>
            )}
            {artifact.iso?.variant && (
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
                    d="M5 12h14M12 5l7 7-7 7"
                  />
                </svg>
                {artifact.iso.variant}
              </span>
            )}
          </div>
        </div>
        {downloadUrl && (
          <a
            href={downloadUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Download ISO
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
              className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-200"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {hashEntries.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">
            Checksums
          </p>
          <div className="space-y-2">
            {hashEntries.slice(0, 3).map(([algorithm, value]) => (
              <div
                key={algorithm}
                className="flex items-start gap-2 bg-gray-50 dark:bg-gray-900/40 rounded-lg p-2"
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
            {hashEntries.length > 3 && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                + {hashEntries.length - 3} additional checksum
                {hashEntries.length > 4 ? "s" : ""}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default IsoArtifactCard;

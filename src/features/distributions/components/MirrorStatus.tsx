import { useState, useEffect } from "react";
import { AlertCircle, Clock, Database, RefreshCw } from "./icons";
import { distros } from "../data/distrosLoader";

// Define types for our mirror status data
interface MirrorStatusData {
  overallStatus: string;
  lastUpdated: string;
  totalRepoSize: string;
  distroStatuses: Record<string, string>;
  distroDetails: Record<
    string,
    {
      lastSyncTime: string;
      repoSize: string;
      syncDuration: string;
      isSyncing: boolean;
    }
  >;
  featuredDistros: string[];
}

// Define type for distro with status and details
interface FeaturedDistro {
  id: string;
  title: string;
  description: string;
  logoSrc: string;
  websiteUrl: string;
  rsyncCommand: string;
  isoUrl?: string;
  aboutText?: string;
  releaseYear?: number;
  status: string;
  details: {
    lastSyncTime: string;
    repoSize: string;
    syncDuration: string;
    isSyncing: boolean;
  } | null;
}

const MirrorStatus = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isStatusAvailable, setIsStatusAvailable] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [statusData, setStatusData] = useState<MirrorStatusData | null>(null);
  const [featuredDistroData, setFeaturedDistroData] = useState<
    FeaturedDistro[]
  >([]);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        // Fetch the mirror status from our API endpoint
        const response = await fetch("/api/mirror-status");
        if (!response.ok) {
          throw new Error("Failed to fetch mirror status");
        }

        const data = await response.json();
        setStatusData(data);

        // Check if the overall status is healthy
        setIsStatusAvailable(data.overallStatus === "healthy");

        // Prepare featured distro data
        if (data.featuredDistros && Array.isArray(data.featuredDistros)) {
          const featured = data.featuredDistros
            .map((id: string) => {
              const distroInfo = distros.find((d) => d.id === id);
              if (!distroInfo) return null;

              return {
                ...distroInfo,
                status: data.distroStatuses[id] || "unknown",
                details: data.distroDetails[id] || null,
              };
            })
            .filter(Boolean);
          // Display all featured distros without random selection or limit

          setFeaturedDistroData(featured);
        }
      } catch (err) {
        console.error("Error fetching mirror status from API:", err);

        // Try to fetch the static mirror-status.json file as a fallback
        try {
          console.log(
            "Attempting to fetch static mirror-status.json as fallback",
          );
          const staticResponse = await fetch("/data/mirror-status.json");
          if (!staticResponse.ok) {
            throw new Error("Failed to fetch static mirror status");
          }

          const staticData = await staticResponse.json();
          setStatusData(staticData);

          // Check if the overall status is healthy
          setIsStatusAvailable(staticData.overallStatus === "healthy");

          // Prepare featured distro data from static file
          if (
            staticData.featuredDistros &&
            Array.isArray(staticData.featuredDistros)
          ) {
            const featured = staticData.featuredDistros
              .map((id: string) => {
                const distroInfo = distros.find((d) => d.id === id);
                if (!distroInfo) return null;

                return {
                  ...distroInfo,
                  status: staticData.distroStatuses[id] || "unknown",
                  details: staticData.distroDetails[id] || null,
                };
              })
              .filter(Boolean);

            setFeaturedDistroData(featured);
          }

          console.log(
            "Successfully loaded static mirror-status.json as fallback",
          );
        } catch (fallbackErr) {
          console.error("Error fetching static mirror status:", fallbackErr);
          setError(
            err instanceof Error
              ? err
              : new Error("Failed to fetch mirror status"),
          );
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchStatus();
  }, []);

  if (isLoading) {
    return (
      <div className="bg-gray-800/30 border border-gray-700 rounded-lg p-4 animate-pulse">
        <div className="h-6 bg-gray-700 rounded w-3/4 mb-2" />
        <div className="h-4 bg-gray-700 rounded w-1/2" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400">
        <p className="flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          Error checking mirror status
        </p>
        <p className="mt-2">
          We encountered an error while checking mirror status: {error.message}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 text-sm bg-red-500/20 hover:bg-red-500/30 text-red-500 px-3 py-1 rounded transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  // Helper function to get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "synced":
        return "bg-green-500";
      case "syncing":
        return "bg-yellow-500";
      case "failed":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  // Helper function to format date
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString();
    } catch (e) {
      return "Unknown";
    }
  };

  if (isStatusAvailable) {
    return (
      <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 text-green-400">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
          <div>
            <p className="flex items-center">
              <span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-2" />
              All mirrors are up-to-date and functioning normally.
            </p>
            <p className="mt-2 text-sm text-green-400/80">
              Last checked:{" "}
              {statusData
                ? formatDate(statusData.lastUpdated)
                : new Date().toLocaleTimeString()}
            </p>
          </div>
          <div className="mt-2 md:mt-0 text-sm flex items-center">
            <Database className="w-4 h-4 mr-1" />
            Total repository size: {statusData?.totalRepoSize || "Unknown"}
          </div>
        </div>

        {/* Featured distros section */}
        {featuredDistroData.length > 0 && (
          <div className="mt-4">
            <h3 className="text-sm font-medium mb-3">
              Repository Sync Status:
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {featuredDistroData.map((distro) => (
                <div
                  key={distro.id}
                  className="bg-gray-800 rounded-md p-3 shadow-sm border border-gray-700 flex flex-col items-center relative hover:shadow-md transition-shadow"
                >
                  {/* Status indicator */}
                  <div
                    className="absolute top-0 left-0 right-0 h-1 rounded-t-md"
                    style={{ backgroundColor: getStatusColor(distro.status) }}
                  />

                  {/* Logo */}
                  <img
                    src={distro.logoSrc}
                    width={40}
                    height={40}
                    alt={`${distro.title} logo`}
                    className="w-10 h-10 rounded-full mb-2 mt-1 object-cover"
                  />

                  {/* Name */}
                  <p className="text-sm font-medium text-white text-center">
                    {distro.title}
                  </p>

                  {/* Status text */}
                  <div
                    className={`text-xs mt-1 px-2 py-0.5 rounded-full ${
                      distro.status === "synced"
                        ? "bg-green-900/30 text-green-400"
                        : distro.status === "syncing"
                          ? "bg-yellow-900/30 text-yellow-400"
                          : distro.status === "failed"
                            ? "bg-red-900/30 text-red-400"
                            : "bg-gray-900/30 text-gray-400"
                    }`}
                  >
                    {distro.status === "syncing" ? (
                      <span className="flex items-center">
                        <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                        Syncing
                      </span>
                    ) : (
                      distro.status.charAt(0).toUpperCase() +
                      distro.status.slice(1)
                    )}
                  </div>

                  {/* Details if available */}
                  {distro.details && (
                    <div className="mt-2 text-xs text-gray-400 w-full">
                      <div className="flex items-center justify-between border-t border-gray-700 pt-1 mt-1">
                        <span className="flex items-center">
                          <Database className="w-3 h-3 mr-1" />
                          Size:
                        </span>
                        <span>{distro.details.repoSize}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          Sync:
                        </span>
                        <span>{distro.details.syncDuration}</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 text-yellow-400">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
        <div>
          <p className="flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            Some mirrors may be experiencing issues
          </p>
          <p className="mt-2">
            Our monitoring system has detected that some mirrors may be out of
            sync or experiencing delays.
          </p>
        </div>
        <div className="mt-2 md:mt-0">
          <button
            onClick={() => window.location.reload()}
            className="text-sm bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 px-3 py-1 rounded transition-colors"
          >
            Check Again
          </button>
        </div>
      </div>

      {/* Featured distros section */}
      {featuredDistroData.length > 0 && (
        <div className="mt-4">
          <h3 className="text-sm font-medium mb-3">Repository Sync Status:</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {featuredDistroData.map((distro) => (
              <div
                key={distro.id}
                className="bg-gray-800 rounded-md p-3 shadow-sm border border-gray-700 flex flex-col items-center relative hover:shadow-md transition-shadow"
              >
                {/* Status indicator */}
                <div
                  className="absolute top-0 left-0 right-0 h-1 rounded-t-md"
                  style={{ backgroundColor: getStatusColor(distro.status) }}
                />

                {/* Logo */}
                <img
                  src={distro.logoSrc}
                  width={40}
                  height={40}
                  alt={`${distro.title} logo`}
                  className="w-10 h-10 rounded-full mb-2 mt-1 object-cover"
                />

                {/* Name */}
                <p className="text-sm font-medium text-white text-center">
                  {distro.title}
                </p>

                {/* Status text */}
                <div
                  className={`text-xs mt-1 px-2 py-0.5 rounded-full ${
                    distro.status === "synced"
                      ? "bg-green-900/30 text-green-400"
                      : distro.status === "syncing"
                        ? "bg-yellow-900/30 text-yellow-400"
                        : distro.status === "failed"
                          ? "bg-red-900/30 text-red-400"
                          : "bg-gray-900/30 text-gray-400"
                  }`}
                >
                  {distro.status === "syncing" ? (
                    <span className="flex items-center">
                      <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                      Syncing
                    </span>
                  ) : (
                    distro.status.charAt(0).toUpperCase() +
                    distro.status.slice(1)
                  )}
                </div>

                {/* Details if available */}
                {distro.details && (
                  <div className="mt-2 text-xs text-gray-400 w-full">
                    <div className="flex items-center justify-between border-t border-gray-700 pt-1 mt-1">
                      <span className="flex items-center">
                        <Database className="w-3 h-3 mr-1" />
                        Size:
                      </span>
                      <span>{distro.details.repoSize}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        Sync:
                      </span>
                      <span>{distro.details.syncDuration}</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MirrorStatus;

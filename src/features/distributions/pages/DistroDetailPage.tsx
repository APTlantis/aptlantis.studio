import { useEffect, useState, FormEvent, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { distros, type Distro } from "../data/distrosLoader";
import { torrents, type Torrent } from "../data/torrentsLoader";
import { loadArtifacts, type Artifact } from "../data/artifactsLoader";
import TorrentCard from "../components/TorrentCard";
import IsoArtifactCard from "../components/IsoArtifactCard";
import ZipArtifactCard from "../components/ZipArtifactCard";
import { useSyncStatus } from "../context/SyncStatusContext";
import { useToast } from "../hooks/useToast";
import LoadingSpinner from "../components/LoadingSpinner";
import FallbackError from "../components/FallbackError";
import {
  Copy,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
} from "../components/icons";
import { Search } from "../../../shared/icons";
import MetaTags from "../../../components/MetaTags";

const getTorrentSearchText = (torrent: Torrent): string => {
  const fileName = (
    torrent.torrent.files[0]?.path || torrent.filename
  ).toLowerCase();
  const tags = (torrent.aptlantis.tags || []).join(" ").toLowerCase();
  return `${fileName} ${tags}`.trim();
};

const getArtifactSearchText = (artifact: Artifact): string => {
  const isoParts = [
    artifact.iso?.architecture,
    artifact.iso?.variant,
    artifact.iso?.distro,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  const tags = artifact.tags.join(" ").toLowerCase();
  return `${artifact.filename.toLowerCase()} ${isoParts} ${tags}`.trim();
};

const filterArtifactsByQuery = (
  artifacts: Artifact[],
  query: string,
): Artifact[] => {
  if (!query.trim()) {
    return artifacts;
  }
  const normalizedQuery = query.toLowerCase();
  return artifacts.filter((artifact) =>
    getArtifactSearchText(artifact).includes(normalizedQuery),
  );
};

const filterTorrentsByQuery = (
  records: Torrent[],
  query: string,
): Torrent[] => {
  if (!query.trim()) {
    return records;
  }
  const normalizedQuery = query.toLowerCase();
  return records.filter((record) =>
    getTorrentSearchText(record).includes(normalizedQuery),
  );
};

const isKaliTorrent = (torrent: Torrent): boolean =>
  getTorrentSearchText(torrent).includes("kali");

const DistroDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [distro, setDistro] = useState<Distro | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [activeTab, setActiveTab] = useState<
    "overview" | "installation" | "screenshots" | "torrents" | "downloads"
  >("overview");
  const [imageError, setImageError] = useState(false);
  const { syncStatuses } = useSyncStatus();
  const { toast } = useToast();

  // State for screenshot upload
  const [uploadingScreenshot, setUploadingScreenshot] = useState(false);
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // State for navigation between distros
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const [sliderValue, setSliderValue] = useState<number>(0);

  // State for torrents tab (only for princeton-torrents)
  const [torrentSearchQuery, setTorrentSearchQuery] = useState("");
  const [currentTorrentPage, setCurrentTorrentPage] = useState(1);
  const torrentsPerPage = 50;
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [artifactsLoading, setArtifactsLoading] = useState(false);
  const [artifactsError, setArtifactsError] = useState<string | null>(null);
  const [downloadView, setDownloadView] = useState<"iso" | "zip" | "torrent">(
    "iso",
  );
  const [downloadSearchQuery, setDownloadSearchQuery] = useState("");
  const [downloadPage, setDownloadPage] = useState(1);
  const downloadsPerPage = 24;
  const kaliTorrents = useMemo(() => {
    return torrents.filter(isKaliTorrent).sort((a, b) => {
      const aTime = new Date(a.torrent.creation_date).getTime();
      const bTime = new Date(b.torrent.creation_date).getTime();
      const safeATime = Number.isNaN(aTime) ? 0 : aTime;
      const safeBTime = Number.isNaN(bTime) ? 0 : bTime;
      return safeBTime - safeATime;
    });
  }, []);
  const isoArtifacts = useMemo(
    () => artifacts.filter((artifact) => artifact.type === "iso"),
    [artifacts],
  );
  const zipArtifacts = useMemo(
    () => artifacts.filter((artifact) => artifact.type === "zip"),
    [artifacts],
  );
  const filteredIsoArtifacts = useMemo(
    () => filterArtifactsByQuery(isoArtifacts, downloadSearchQuery),
    [isoArtifacts, downloadSearchQuery],
  );
  const filteredZipArtifacts = useMemo(
    () => filterArtifactsByQuery(zipArtifacts, downloadSearchQuery),
    [zipArtifacts, downloadSearchQuery],
  );
  const filteredKaliTorrents = useMemo(
    () => filterTorrentsByQuery(kaliTorrents, downloadSearchQuery),
    [kaliTorrents, downloadSearchQuery],
  );
  const activeDownloadList = useMemo<(Artifact | Torrent)[]>(() => {
    if (downloadView === "iso") {
      return filteredIsoArtifacts;
    }
    if (downloadView === "zip") {
      return filteredZipArtifacts;
    }
    return filteredKaliTorrents;
  }, [
    downloadView,
    filteredIsoArtifacts,
    filteredZipArtifacts,
    filteredKaliTorrents,
  ]);
  const totalDownloadPages = Math.max(
    1,
    Math.ceil(activeDownloadList.length / downloadsPerPage),
  );
  const downloadStartIndex = (downloadPage - 1) * downloadsPerPage;
  const currentDownloadItems = activeDownloadList.slice(
    downloadStartIndex,
    downloadStartIndex + downloadsPerPage,
  );
  const downloadLabel =
    downloadView === "iso"
      ? "ISO images"
      : downloadView === "zip"
        ? "ZIP archives"
        : "torrents";
  const downloadRangeStart =
    activeDownloadList.length === 0 ? 0 : downloadStartIndex + 1;
  const downloadRangeEnd = Math.min(
    downloadStartIndex + downloadsPerPage,
    activeDownloadList.length,
  );

  useEffect(() => {
    // Fetch distro details
    const fetchDistro = async () => {
      try {
        setLoading(true);
        setError(null);

        // In a real app, this would be an API call
        const foundDistro = distros.find((d) => d.id === id);

        // Find the index of the current distro in the distros array
        const index = distros.findIndex((d) => d.id === id);

        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 800));

        if (!foundDistro) {
          throw new Error(`Distribution with ID "${id}" not found`);
        }

        setDistro(foundDistro);

        // Set the current index and slider value
        if (index !== -1) {
          setCurrentIndex(index);
          setSliderValue(index);
        }
      } catch (err) {
        console.error("Error fetching distro:", err);
        setError(
          err instanceof Error
            ? err
            : new Error("Failed to load distribution details"),
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchDistro();
    } else {
      setError(new Error("No distribution ID provided"));
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id !== "kali-images") {
      setArtifacts([]);
      setArtifactsError(null);
      setArtifactsLoading(false);
      return;
    }

    let isMounted = true;
    setArtifactsLoading(true);

    loadArtifacts()
      .then((data) => {
        if (!isMounted) return;
        setArtifacts(data);
        setArtifactsError(null);
      })
      .catch((err) => {
        if (!isMounted) return;
        setArtifactsError(
          err instanceof Error
            ? err.message
            : "Failed to load download artifacts",
        );
      })
      .finally(() => {
        if (isMounted) {
          setArtifactsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  useEffect(() => {
    setDownloadView("iso");
    setDownloadSearchQuery("");
    setDownloadPage(1);
  }, [id]);

  useEffect(() => {
    if (downloadPage > totalDownloadPages) {
      setDownloadPage(totalDownloadPages);
    }
  }, [downloadPage, totalDownloadPages]);

  const handleCopy = () => {
    if (distro) {
      try {
        navigator.clipboard.writeText(distro.rsyncCommand);
        toast({
          title: "Command Copied!",
          description: `${distro.title} rsync command copied to clipboard.`,
          duration: 3000,
        });
      } catch (err) {
        console.error("Failed to copy to clipboard:", err);
        toast({
          title: "Copy Failed",
          description: "Could not copy to clipboard. Please try again.",
          duration: 3000,
        });
      }
    }
  };

  // Handle screenshot file selection
  const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];

      // Validate file type
      const validTypes = ["image/jpeg", "image/png"];
      if (!validTypes.includes(file.type)) {
        setUploadError("Invalid file type. Only JPEG and PNG are allowed.");
        setScreenshotFile(null);
        return;
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (file.size > maxSize) {
        setUploadError("File too large. Maximum size is 5MB.");
        setScreenshotFile(null);
        return;
      }

      setScreenshotFile(file);
      setUploadError(null);
    }
  };

  // Handle screenshot form submission
  const handleScreenshotSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!distro) {
      setUploadError("No distribution selected.");
      return;
    }

    if (!screenshotFile) {
      setUploadError("Please select a screenshot file.");
      return;
    }

    try {
      setUploadingScreenshot(true);
      setUploadError(null);
      setUploadSuccess(false);

      // Create form data
      const formData = new FormData();
      formData.append("screenshot", screenshotFile);
      formData.append("distroId", distro.id);

      // Get description and email from form
      const form = e.currentTarget;
      const description =
        (form.elements.namedItem("description") as HTMLTextAreaElement)
          ?.value || "";
      const email =
        (form.elements.namedItem("email") as HTMLInputElement)?.value || "";

      formData.append("description", description);
      formData.append("email", email);

      // Send the request to the API
      const response = await fetch("/api/upload-screenshot", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to upload screenshot");
      }

      // Reset form
      setScreenshotFile(null);
      setUploadSuccess(true);
      form.reset();

      // Show success toast
      toast({
        title: "Screenshot Uploaded!",
        description:
          "Your screenshot has been uploaded successfully and will be reviewed by our team.",
        duration: 5000,
      });
    } catch (error) {
      console.error("Error uploading screenshot:", error);
      setUploadError(
        error instanceof Error ? error.message : "Failed to upload screenshot",
      );
    } finally {
      setUploadingScreenshot(false);
    }
  };

  // Navigation functions
  const goToPrevDistro = () => {
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      navigate(`/distro/${distros[prevIndex].id}`);
    }
  };

  const goToNextDistro = () => {
    if (currentIndex < distros.length - 1) {
      const nextIndex = currentIndex + 1;
      navigate(`/distro/${distros[nextIndex].id}`);
    }
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value, 10);
    setSliderValue(newValue);
  };

  const handleSliderChangeComplete = () => {
    if (sliderValue !== currentIndex) {
      navigate(`/distro/${distros[sliderValue].id}`);
    }
  };

  // Get sync status color
  const getSyncStatusColor = () => {
    const status = id ? syncStatuses[id] : undefined;

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

  // Get sync status text
  const getSyncStatusText = () => {
    const status = id ? syncStatuses[id] : undefined;

    switch (status) {
      case "synced":
        return "Synced";
      case "syncing":
        return "Syncing";
      case "failed":
        return "Failed";
      default:
        return "Unknown";
    }
  };

  // Filtered torrents for princeton-torrents distro
  const filteredTorrents = useMemo(() => {
    if (id !== "princeton-torrents") return [];

    if (!torrentSearchQuery.trim()) {
      return torrents;
    }

    const query = torrentSearchQuery.toLowerCase();
    return torrents.filter((torrent) => {
      const fileName = torrent.torrent.files[0]?.path || torrent.filename;
      const tags = torrent.aptlantis.tags?.join(" ") || "";
      return (
        fileName.toLowerCase().includes(query) ||
        tags.toLowerCase().includes(query)
      );
    });
  }, [id, torrentSearchQuery]);

  // Pagination for torrents
  const totalTorrentPages = Math.ceil(
    filteredTorrents.length / torrentsPerPage,
  );
  const startTorrentIndex = (currentTorrentPage - 1) * torrentsPerPage;
  const endTorrentIndex = startTorrentIndex + torrentsPerPage;
  const currentTorrents = filteredTorrents.slice(
    startTorrentIndex,
    endTorrentIndex,
  );

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <FallbackError
        error={error}
        message="We couldn't load the distribution details. Please try again later."
        resetErrorBoundary={() => window.location.reload()}
      />
    );
  }

  if (!distro) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <MetaTags
          title="Distribution Not Found | APTlantis"
          description="The Linux distribution you're looking for doesn't exist or has been removed from our mirror."
          canonicalUrl="https://aptlantis.net/404"
        />
        <h1 className="text-3xl font-bold mb-4">Distribution Not Found</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-8">
          The Linux distribution you&apos;re looking for doesn&apos;t exist or
          has been removed.
        </p>
        <Link
          to="/"
          className="bg-cyan-600 text-white py-2 px-6 rounded-md hover:bg-cyan-700 transition-colors inline-flex items-center"
        >
          <ChevronRight className="w-4 h-4 mr-2 rotate-180" />
          Back to Distributions
        </Link>
      </div>
    );
  }

  // Create structured data for the distribution
  const distroStructuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: distro.title,
    operatingSystem: "Linux",
    applicationCategory: "OperatingSystem",
    url: `https://aptlantis.net/distro/${distro.id}`,
    downloadUrl:
      distro.isoUrl ||
      `https://mirrors.aptlantis.net/${distro.id.toLowerCase()}/latest.iso`,
    softwareVersion: distro.version || "Latest",
    description: distro.description,
    image: distro.logoSrc || "https://aptlantis.net/placeholder.svg",
    logo: distro.logoSrc || "https://aptlantis.net/placeholder.svg",
    offers: [
      {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
        description: "Free download",
      },
    ],
    isPartOf: {
      "@type": "WebSite",
      name: "APTlantis",
      url: "https://aptlantis.net/",
    },
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <MetaTags
        title={`${distro.title} - Linux Distribution | APTlantis`}
        description={`Download ${distro.title} Linux distribution from APTlantis high-speed mirrors. ${distro.description}`}
        keywords={`${distro.title}, Linux, distribution, download, mirror, ISO, open-source, APTlantis`}
        canonicalUrl={`https://aptlantis.net/distro/${distro.id}`}
        ogTitle={`${distro.title} - Linux Distribution | APTlantis`}
        ogDescription={`Download ${distro.title} Linux distribution from our high-speed mirrors. ${distro.description}`}
        ogImage={distro.logoSrc || "https://aptlantis.net/placeholder.svg"}
        ogImageAlt={`${distro.title} logo`}
        twitterTitle={`${distro.title} - Linux Distribution | APTlantis`}
        twitterDescription={`Download ${distro.title} Linux distribution from our high-speed mirrors. ${distro.description}`}
        twitterImage={distro.logoSrc || "https://aptlantis.net/placeholder.svg"}
        twitterImageAlt={`${distro.title} logo`}
        structuredData={distroStructuredData}
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
                <ChevronRight className="w-4 h-4 text-gray-400" />
                <span className="ml-1 text-gray-600 dark:text-gray-400 md:ml-2">
                  {distro.title}
                </span>
              </div>
            </li>
          </ol>
        </nav>
      </div>

      {/* Distro Navigation Slider */}
      <div className="mb-8 bg-gray-100 dark:bg-[#1a1a1a] p-4 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white">
          Browse Distributions
        </h3>
        <div className="flex items-center gap-4">
          <button
            onClick={goToPrevDistro}
            disabled={currentIndex <= 0}
            className={`p-2 rounded-full ${
              currentIndex <= 0
                ? "bg-gray-300 dark:bg-gray-700 cursor-not-allowed"
                : "bg-cyan-600 hover:bg-cyan-700 dark:bg-cyan-700 dark:hover:bg-cyan-600"
            } text-white transition-colors`}
            aria-label="Previous distribution"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex-1">
            <input
              type="range"
              min="0"
              max={distros.length - 1}
              value={sliderValue}
              onChange={handleSliderChange}
              onMouseUp={handleSliderChangeComplete}
              onKeyUp={handleSliderChangeComplete}
              className="w-full h-2 bg-gray-300 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-600"
              aria-label="Distribution slider"
            />
            <div className="flex justify-between mt-2 text-xs text-gray-600 dark:text-gray-400">
              <span>1</span>
              <span>{Math.floor(distros.length / 2)}</span>
              <span>{distros.length}</span>
            </div>
          </div>

          <button
            onClick={goToNextDistro}
            disabled={currentIndex >= distros.length - 1}
            className={`p-2 rounded-full ${
              currentIndex >= distros.length - 1
                ? "bg-gray-300 dark:bg-gray-700 cursor-not-allowed"
                : "bg-cyan-600 hover:bg-cyan-700 dark:bg-cyan-700 dark:hover:bg-cyan-600"
            } text-white transition-colors`}
            aria-label="Next distribution"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
        <div className="text-center mt-2 text-sm text-gray-600 dark:text-gray-400">
          {currentIndex + 1} of {distros.length}:{" "}
          <span className="font-medium text-cyan-600 dark:text-cyan-400">
            {distro.title}
          </span>
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-8">
        <div className="relative">
          {distro.logoSrc && !imageError ? (
            <img
              src={distro.logoSrc}
              width={160}
              height={160}
              alt={`${distro.title} logo`}
              className="w-40 h-40 rounded-full border-4 border-white dark:border-gray-800 shadow-lg object-cover"
              onError={() => {
                // If image fails to load, set error state
                setImageError(true);
              }}
            />
          ) : null}

          {/* Custom placeholder that shows when no logo exists or when loading fails */}
          <div
            className={`logo-placeholder w-40 h-40 rounded-full border-4 border-white dark:border-gray-800 shadow-lg flex items-center justify-center bg-gray-200 dark:bg-gray-700 ${!distro.logoSrc || imageError ? "flex" : "hidden"}`}
            style={{
              backgroundColor:
                distro.buttonColor?.split(" ")[0] || "bg-gray-200",
              color: "white",
            }}
          >
            <span className="text-3xl font-bold">
              {distro.title ? distro.title.substring(0, 2).toUpperCase() : "??"}
            </span>
          </div>

          <div
            className={`absolute bottom-2 right-2 w-6 h-6 rounded-full ${getSyncStatusColor()} border-2 border-white dark:border-gray-800`}
            title={`Mirror status: ${getSyncStatusText()}`}
          />
        </div>

        <div className="flex-1 text-center md:text-left">
          <h1 className="text-4xl font-bold mb-2">{distro.title}</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-4">
            {distro.description}
          </p>

          <div className="flex flex-wrap gap-3 justify-center md:justify-start">
            <a
              href={distro.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-cyan-600 text-white py-2 px-4 rounded-md text-sm flex items-center justify-center hover:bg-cyan-700 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Official Website
            </a>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8 overflow-x-auto" aria-label="Tabs">
          <button
            onClick={() => setActiveTab("overview")}
            className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab === "overview"
                ? "border-cyan-500 text-cyan-600 dark:text-cyan-400"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
            aria-current={activeTab === "overview" ? "page" : undefined}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("installation")}
            className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab === "installation"
                ? "border-cyan-500 text-cyan-600 dark:text-cyan-400"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
            aria-current={activeTab === "installation" ? "page" : undefined}
          >
            Installation Guide
          </button>
          <button
            onClick={() => setActiveTab("screenshots")}
            className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab === "screenshots"
                ? "border-cyan-500 text-cyan-600 dark:text-cyan-400"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
            aria-current={activeTab === "screenshots" ? "page" : undefined}
          >
            Screenshots
          </button>
          {id === "kali-images" && (
            <button
              onClick={() => setActiveTab("downloads")}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === "downloads"
                  ? "border-cyan-500 text-cyan-600 dark:text-cyan-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
              aria-current={activeTab === "downloads" ? "page" : undefined}
            >
              Downloads
            </button>
          )}
          {/* Torrents tab - only for Princeton Academic Torrents */}
          {id === "princeton-torrents" && (
            <button
              onClick={() => setActiveTab("torrents")}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === "torrents"
                  ? "border-cyan-500 text-cyan-600 dark:text-cyan-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
              aria-current={activeTab === "torrents" ? "page" : undefined}
            >
              Torrents ({torrents.length.toLocaleString()})
            </button>
          )}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="animate-fadeIn">
        {activeTab === "overview" && (
          <div className="space-y-6">
            <section>
              <h2 className="text-2xl font-semibold mb-3 text-cyan-600 dark:text-cyan-400">
                About {distro.title}
              </h2>
              {distro.longDescription ? (
                <div className="text-gray-600 dark:text-gray-300 space-y-3">
                  {distro.longDescription
                    .split("\n\n")
                    .map((paragraph: string, index: number) => (
                      <p key={index}>{paragraph}</p>
                    ))}
                </div>
              ) : (
                <p className="text-gray-600 dark:text-gray-300">
                  {distro.title} is a Linux distribution that provides a
                  complete operating system with its own package management
                  system. It is designed to be user-friendly and stable, making
                  it a great choice for both beginners and experienced users.
                </p>
              )}
              <p className="text-gray-600 dark:text-gray-300 mt-3">
                Our mirrors are updated regularly to ensure you have access to
                the latest packages and security updates. The current mirror
                status is{" "}
                <span className="font-semibold">{getSyncStatusText()}</span>.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3 text-cyan-600 dark:text-cyan-400">
                Mirror Information
              </h2>
              <div className="bg-gray-100 dark:bg-[#0a0a0a] p-4 rounded-md">
                <h3 className="text-lg font-medium mb-2">Rsync Command</h3>
                <div className="flex justify-between items-center bg-white dark:bg-[#1a1a1a] p-3 rounded-md">
                  <code className="text-green-600 dark:text-green-400 text-sm overflow-x-auto whitespace-nowrap max-w-[calc(100%-2rem)]">
                    {distro.rsyncCommand}
                  </code>
                  <button
                    onClick={handleCopy}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white ml-2"
                    title="Copy command"
                    aria-label="Copy rsync command"
                  >
                    <Copy className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3 text-cyan-600 dark:text-cyan-400">
                System Requirements
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-100 dark:bg-[#0a0a0a] p-4 rounded-md">
                  <h3 className="text-lg font-medium mb-2">
                    Minimum Requirements
                  </h3>
                  {distro.minimumRequirements ? (
                    <p className="text-gray-600 dark:text-gray-300">
                      {distro.minimumRequirements}
                    </p>
                  ) : (
                    <ul className="list-disc pl-5 text-gray-600 dark:text-gray-300 space-y-1">
                      <li>1 GHz processor</li>
                      <li>1 GB RAM</li>
                      <li>10 GB disk space</li>
                      <li>Graphics card capable of 800×600 resolution</li>
                      <li>Internet connection (recommended)</li>
                    </ul>
                  )}
                </div>
                <div className="bg-gray-100 dark:bg-[#0a0a0a] p-4 rounded-md">
                  <h3 className="text-lg font-medium mb-2">
                    Recommended Requirements
                  </h3>
                  {distro.recommendedRequirements ? (
                    <p className="text-gray-600 dark:text-gray-300">
                      {distro.recommendedRequirements}
                    </p>
                  ) : (
                    <ul className="list-disc pl-5 text-gray-600 dark:text-gray-300 space-y-1">
                      <li>2 GHz dual-core processor or better</li>
                      <li>4 GB RAM</li>
                      <li>25 GB disk space</li>
                      <li>Graphics card capable of 1366×768 resolution</li>
                      <li>Broadband internet connection</li>
                    </ul>
                  )}
                </div>
              </div>
            </section>
          </div>
        )}

        {activeTab === "installation" && (
          <div className="space-y-6">
            <section>
              <h2 className="text-2xl font-semibold mb-3 text-cyan-600 dark:text-cyan-400">
                Installation Guide
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Follow these steps to install {distro.title} on your system:
              </p>

              <div className="space-y-4">
                <div className="bg-gray-100 dark:bg-[#0a0a0a] p-4 rounded-md">
                  <h3 className="text-lg font-medium mb-2">
                    Step 1: Download the ISO
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-2">
                    Download the latest {distro.title} ISO from the official
                    website:
                  </p>
                  <a
                    href={distro.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-green-600 text-white py-2 px-4 rounded-md text-sm inline-flex items-center hover:bg-green-700 transition-all duration-200"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Visit Official Website
                  </a>
                </div>

                <div className="bg-gray-100 dark:bg-[#0a0a0a] p-4 rounded-md">
                  <h3 className="text-lg font-medium mb-2">
                    Step 2: Create a Bootable USB Drive
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Use a tool like Rufus (Windows), Etcher (cross-platform), or
                    dd (Linux) to create a bootable USB drive with the
                    downloaded ISO.
                  </p>
                </div>

                <div className="bg-gray-100 dark:bg-[#0a0a0a] p-4 rounded-md">
                  <h3 className="text-lg font-medium mb-2">
                    Step 3: Boot from the USB Drive
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Insert the USB drive into your computer and boot from it.
                    You may need to change the boot order in your BIOS/UEFI
                    settings.
                  </p>
                </div>

                <div className="bg-gray-100 dark:bg-[#0a0a0a] p-4 rounded-md">
                  <h3 className="text-lg font-medium mb-2">
                    Step 4: Install {distro.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Follow the on-screen instructions to install {distro.title}.
                    The installer will guide you through the process of
                    partitioning your disk, setting up user accounts, and
                    configuring basic settings.
                  </p>
                </div>

                <div className="bg-gray-100 dark:bg-[#0a0a0a] p-4 rounded-md">
                  <h3 className="text-lg font-medium mb-2">
                    Step 5: Update Your System
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    After installation, make sure to update your system to get
                    the latest security patches and software updates. You can
                    use our mirror for faster downloads.
                  </p>
                </div>
              </div>
            </section>
          </div>
        )}

        {activeTab === "screenshots" && (
          <div className="space-y-6">
            <section>
              <h2 className="text-2xl font-semibold mb-3 text-cyan-600 dark:text-cyan-400">
                {distro.title} Screenshots
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Share your experience with {distro.title} by submitting
                screenshots of your desktop. Your submissions will be reviewed
                by our team before being published.
              </p>

              <div className="bg-gray-100 dark:bg-[#0a0a0a] p-6 rounded-md mb-6">
                <h3 className="text-xl font-medium mb-4">
                  Submit a Screenshot
                </h3>

                <form className="space-y-4" onSubmit={handleScreenshotSubmit}>
                  {/* Show error message if there is one */}
                  {uploadError && (
                    <div className="bg-red-100 dark:bg-red-900/30 border-l-4 border-red-500 p-4 rounded-md">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg
                            className="h-5 w-5 text-red-500"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-red-700 dark:text-red-200">
                            {uploadError}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Show success message if upload was successful */}
                  {uploadSuccess && (
                    <div className="bg-green-100 dark:bg-green-900/30 border-l-4 border-green-500 p-4 rounded-md">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg
                            className="h-5 w-5 text-green-500"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-green-700 dark:text-green-200">
                            Screenshot uploaded successfully! It will be
                            reviewed by our team before being published.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div>
                    <label
                      htmlFor="screenshot"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      Upload Screenshot
                    </label>
                    <input
                      type="file"
                      id="screenshot"
                      name="screenshot"
                      accept="image/png, image/jpeg"
                      onChange={handleScreenshotChange}
                      className="block w-full text-sm text-gray-500 dark:text-gray-400
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-md file:border-0
                        file:text-sm file:font-medium
                        file:bg-cyan-600 file:text-white
                        hover:file:bg-cyan-700
                        file:cursor-pointer"
                    />
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      PNG or JPG only (max. 5MB)
                    </p>
                    {screenshotFile && (
                      <p className="mt-1 text-sm text-green-600 dark:text-green-400">
                        Selected: {screenshotFile.name} (
                        {(screenshotFile.size / (1024 * 1024)).toFixed(2)} MB)
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="description"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      Description
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      rows={3}
                      placeholder="Describe your screenshot (desktop environment, customizations, etc.)"
                      className="w-full px-3 py-2 text-gray-700 dark:text-gray-300 border rounded-md 
                        dark:border-gray-700 dark:bg-[#1a1a1a] focus:outline-none focus:ring-2 focus:ring-cyan-600"
                    ></textarea>
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      Email (optional)
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      placeholder="your@email.com"
                      className="w-full px-3 py-2 text-gray-700 dark:text-gray-300 border rounded-md 
                        dark:border-gray-700 dark:bg-[#1a1a1a] focus:outline-none focus:ring-2 focus:ring-cyan-600"
                    />
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      We'll notify you when your screenshot is approved
                    </p>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={uploadingScreenshot || !screenshotFile}
                      className={`w-full md:w-auto py-2 px-6 rounded-md transition-colors flex items-center justify-center ${
                        uploadingScreenshot || !screenshotFile
                          ? "bg-gray-400 dark:bg-gray-700 cursor-not-allowed"
                          : "bg-cyan-600 text-white hover:bg-cyan-700"
                      }`}
                    >
                      {uploadingScreenshot ? (
                        <>
                          <svg
                            className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                          </svg>
                          Uploading...
                        </>
                      ) : (
                        "Submit Screenshot"
                      )}
                    </button>
                  </div>
                </form>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 p-4 rounded-md">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-yellow-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700 dark:text-yellow-200">
                      All screenshots are reviewed by our team before being
                      published. This process may take 1-2 business days.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

        {activeTab === "downloads" && id === "kali-images" && (
          <div className="space-y-6">
            <section>
              <h2 className="text-2xl font-semibold mb-3 text-cyan-600 dark:text-cyan-400">
                Kali Linux Image Library
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Browse curated ISO images, compressed archives, and torrents
                mirrored directly from our Kali Linux image collection.
              </p>

              <div className="flex flex-wrap gap-3 mb-4">
                <button
                  onClick={() => {
                    setDownloadView("iso");
                    setDownloadPage(1);
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    downloadView === "iso"
                      ? "bg-cyan-600 text-white"
                      : "bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                  }`}
                >
                  ISO Images ({isoArtifacts.length})
                </button>
                <button
                  onClick={() => {
                    setDownloadView("zip");
                    setDownloadPage(1);
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    downloadView === "zip"
                      ? "bg-cyan-600 text-white"
                      : "bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                  }`}
                >
                  ZIP Archives ({zipArtifacts.length})
                </button>
                <button
                  onClick={() => {
                    setDownloadView("torrent");
                    setDownloadPage(1);
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    downloadView === "torrent"
                      ? "bg-cyan-600 text-white"
                      : "bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                  }`}
                >
                  Torrents ({kaliTorrents.length})
                </button>
              </div>

              {artifactsError && downloadView !== "torrent" && (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-900/20 p-3 text-sm text-red-700 dark:text-red-300">
                  {artifactsError}
                </div>
              )}

              <div className="mb-6 flex items-center bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <Search className="w-5 h-5 text-gray-400 mr-3" />
                <input
                  type="text"
                  placeholder={`Search ${downloadLabel} by filename or tags...`}
                  value={downloadSearchQuery}
                  onChange={(e) => {
                    setDownloadSearchQuery(e.target.value);
                    setDownloadPage(1);
                  }}
                  className="flex-1 bg-transparent text-gray-900 dark:text-white focus:outline-none"
                />
                {downloadSearchQuery && (
                  <button
                    onClick={() => {
                      setDownloadSearchQuery("");
                      setDownloadPage(1);
                    }}
                    className="ml-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white text-xl"
                    title="Clear search"
                  >
                    &times;
                  </button>
                )}
              </div>

              <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                {activeDownloadList.length > 0 ? (
                  <>
                    Showing {downloadRangeStart}-{downloadRangeEnd} of{" "}
                    {activeDownloadList.length.toLocaleString()} {downloadLabel}
                    {downloadSearchQuery &&
                      ` matching "${downloadSearchQuery}"`}
                  </>
                ) : (
                  <>
                    No {downloadLabel} available
                    {downloadSearchQuery &&
                      ` matching "${downloadSearchQuery}"`}
                  </>
                )}
              </div>

              {downloadView !== "torrent" && artifactsLoading ? (
                <div className="flex justify-center py-12">
                  <LoadingSpinner />
                </div>
              ) : currentDownloadItems.length > 0 ? (
                <>
                  <div className="space-y-3 mb-6">
                    {downloadView === "iso" &&
                      (currentDownloadItems as Artifact[]).map((artifact) => (
                        <IsoArtifactCard
                          key={artifact.id}
                          artifact={artifact}
                          downloadBaseUrl={distro?.isoUrl}
                        />
                      ))}
                    {downloadView === "zip" &&
                      (currentDownloadItems as Artifact[]).map((artifact) => (
                        <ZipArtifactCard
                          key={artifact.id}
                          artifact={artifact}
                          downloadBaseUrl={distro?.isoUrl}
                        />
                      ))}
                    {downloadView === "torrent" &&
                      (currentDownloadItems as Torrent[]).map(
                        (torrent, index) => (
                          <TorrentCard
                            key={
                              torrent.torrent.info_hash ||
                              `${torrent.filename}-${index}`
                            }
                            torrent={torrent}
                          />
                        ),
                      )}
                  </div>

                  {totalDownloadPages > 1 && (
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() =>
                          setDownloadPage((page) => Math.max(1, page - 1))
                        }
                        disabled={downloadPage === 1}
                        className={`px-4 py-2 rounded ${
                          downloadPage === 1
                            ? "bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed"
                            : "bg-blue-600 text-white hover:bg-blue-700"
                        }`}
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <span className="text-gray-700 dark:text-gray-300">
                        Page {downloadPage} of {totalDownloadPages}
                      </span>
                      <button
                        onClick={() =>
                          setDownloadPage((page) =>
                            Math.min(totalDownloadPages, page + 1),
                          )
                        }
                        disabled={downloadPage === totalDownloadPages}
                        className={`px-4 py-2 rounded ${
                          downloadPage === totalDownloadPages
                            ? "bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed"
                            : "bg-blue-600 text-white hover:bg-blue-700"
                        }`}
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <h3 className="text-xl font-semibold mb-2 text-gray-700 dark:text-gray-300">
                    No downloads found
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Try adjusting your search terms or switch file types to see
                    more options.
                  </p>
                </div>
              )}
            </section>
          </div>
        )}

        {/* Torrents tab - only for Princeton Academic Torrents */}
        {activeTab === "torrents" && id === "princeton-torrents" && (
          <div className="space-y-6">
            <section>
              <h2 className="text-2xl font-semibold mb-3 text-cyan-600 dark:text-cyan-400">
                Academic Torrents Collection
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Browse {torrents.length.toLocaleString()} research datasets,
                papers, and educational materials available via BitTorrent.
              </p>

              {/* Search Bar */}
              <div className="mb-6 flex items-center bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <Search className="w-5 h-5 text-gray-400 mr-3" />
                <input
                  type="text"
                  placeholder="Search torrents by filename or tags..."
                  value={torrentSearchQuery}
                  onChange={(e) => {
                    setTorrentSearchQuery(e.target.value);
                    setCurrentTorrentPage(1);
                  }}
                  className="flex-1 bg-transparent text-gray-900 dark:text-white focus:outline-none"
                />
                {torrentSearchQuery && (
                  <button
                    onClick={() => {
                      setTorrentSearchQuery("");
                      setCurrentTorrentPage(1);
                    }}
                    className="ml-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white text-xl"
                    title="Clear search"
                  >
                    ×
                  </button>
                )}
              </div>

              {/* Results Info */}
              <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                Showing {startTorrentIndex + 1}-
                {Math.min(endTorrentIndex, filteredTorrents.length)} of{" "}
                {filteredTorrents.length.toLocaleString()} torrents
                {torrentSearchQuery && ` matching "${torrentSearchQuery}"`}
              </div>

              {/* Torrent Cards */}
              {filteredTorrents.length > 0 ? (
                <>
                  <div className="space-y-3 mb-6">
                    {currentTorrents.map((torrent, index) => (
                      <TorrentCard
                        key={torrent.torrent.info_hash || index}
                        torrent={torrent}
                      />
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalTorrentPages > 1 && (
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() =>
                          setCurrentTorrentPage((p) => Math.max(1, p - 1))
                        }
                        disabled={currentTorrentPage === 1}
                        className={`px-4 py-2 rounded ${
                          currentTorrentPage === 1
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
                        Page {currentTorrentPage} of {totalTorrentPages}
                      </span>

                      <button
                        onClick={() =>
                          setCurrentTorrentPage((p) =>
                            Math.min(totalTorrentPages, p + 1),
                          )
                        }
                        disabled={currentTorrentPage === totalTorrentPages}
                        className={`px-4 py-2 rounded ${
                          currentTorrentPage === totalTorrentPages
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
                <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <h3 className="text-xl font-semibold mb-2 text-gray-700 dark:text-gray-300">
                    No torrents found
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Try adjusting your search terms to find what you're looking
                    for.
                  </p>
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  );
};

export default DistroDetailPage;

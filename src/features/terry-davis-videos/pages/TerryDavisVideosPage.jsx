import { useMemo, useState, useEffect } from "react";
import MetaTags from "../../../components/MetaTags";
import VideoGrid from "../components/VideoGrid";
import VideoFilters from "../components/VideoFilters";
import videosData from "../data/terry-davis-videos.json";

const TerryDavisVideosPage = () => {
  const [videos, setVideos] = useState([]);
  const [filteredVideos, setFilteredVideos] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedYears, setSelectedYears] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const structuredData = useMemo(() => {
    // Build a CollectionPage with VideoObject items (basic fields)
    const videoObjects = (videosData?.videos || []).slice(0, 24).map((v) => ({
      "@type": "VideoObject",
      name: v.title,
      description: v.description,
      thumbnailUrl: Array.isArray(v.thumbnailUrl)
        ? v.thumbnailUrl
        : v.thumbnailUrl
          ? [v.thumbnailUrl]
          : undefined,
      uploadDate: v.year ? `${v.year}-01-01` : undefined,
      url: `https://aptlantis.net/terry-davis-videos`,
      potentialAction: {
        "@type": "WatchAction",
        target: v.url,
      },
    }));

    const collection = {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "Terry A. Davis Videos",
      description:
        "Browse Terry A. Davis's coding videos in HolyC and TempleOS.",
      url: "https://aptlantis.net/terry-davis-videos",
      hasPart: videoObjects,
    };

    return [collection];
  }, []);

  // Load videos data
  useEffect(() => {
    // Simulate loading from API
    const loadData = async () => {
      setIsLoading(true);
      try {
        // In a real app, this would be an API call
        // For now, we're using the imported JSON data
        setVideos(videosData.videos);
        setFilteredVideos(videosData.videos);
      } catch (error) {
        console.error("Error loading videos:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Filter videos when filters change
  useEffect(() => {
    let result = [...videos];

    // Filter by tags
    if (selectedTags.length > 0) {
      result = result.filter((video) =>
        selectedTags.some((tag) => video.tags.includes(tag)),
      );
    }

    // Filter by years
    if (selectedYears.length > 0) {
      result = result.filter((video) => selectedYears.includes(video.year));
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (video) =>
          video.title.toLowerCase().includes(query) ||
          video.description.toLowerCase().includes(query),
      );
    }

    setFilteredVideos(result);
  }, [videos, selectedTags, selectedYears, searchQuery]);

  const handleTagChange = (tags) => {
    setSelectedTags(tags);
  };

  const handleYearChange = (years) => {
    setSelectedYears(years);
  };

  const handleSearchChange = (query) => {
    setSearchQuery(query);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <MetaTags
        title="Terry Davis Videos | APTlantis"
        description="Browse Terry A. Davis's coding videos in HolyC and TempleOS."
        canonicalUrl="https://aptlantis.net/terry-davis-videos"
        ogTitle="Terry A. Davis Videos"
        ogDescription="Explore curated videos of HolyC programming and TempleOS development."
        structuredData={structuredData}
      />

      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-cyan-400 mb-2">
          Terry A. Davis Videos
        </h1>
        <p className="text-gray-300 mb-8">
          Browse through Terry A. Davis's coding videos showcasing HolyC
          programming and TempleOS development. These short videos (typically
          5-10 minutes) demonstrate various programming concepts and techniques.
        </p>

        <VideoFilters
          tags={videosData.tags}
          years={videosData.years}
          selectedTags={selectedTags}
          selectedYears={selectedYears}
          searchQuery={searchQuery}
          onTagChange={handleTagChange}
          onYearChange={handleYearChange}
          onSearchChange={handleSearchChange}
        />

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
          </div>
        ) : (
          <>
            <div className="mb-4 text-gray-400">
              {filteredVideos.length}{" "}
              {filteredVideos.length === 1 ? "video" : "videos"} found
            </div>
            <VideoGrid videos={filteredVideos} />
          </>
        )}
      </div>
    </div>
  );
};

export default TerryDavisVideosPage;

import { useState } from "react";

const VideoFilters = ({
  tags,
  years,
  selectedTags,
  selectedYears,
  searchQuery,
  onTagChange,
  onYearChange,
  onSearchChange,
}) => {
  const [isTagsExpanded, setIsTagsExpanded] = useState(false);

  const handleTagClick = (tag) => {
    if (selectedTags.includes(tag)) {
      onTagChange(selectedTags.filter((t) => t !== tag));
    } else {
      onTagChange([...selectedTags, tag]);
    }
  };

  const handleYearClick = (year) => {
    if (selectedYears.includes(year)) {
      onYearChange(selectedYears.filter((y) => y !== year));
    } else {
      onYearChange([...selectedYears, year]);
    }
  };

  const handleSearchInputChange = (e) => {
    onSearchChange(e.target.value);
  };

  const clearFilters = () => {
    onTagChange([]);
    onYearChange([]);
    onSearchChange("");
  };

  // Display only the first 10 tags when collapsed
  const displayedTags = isTagsExpanded ? tags : tags.slice(0, 10);

  return (
    <div className="bg-gray-800 rounded-lg p-6 mb-8">
      <h2 className="text-xl font-semibold text-white mb-4">Filter Videos</h2>

      {/* Search */}
      <div className="mb-6">
        <label
          htmlFor="search"
          className="block text-sm font-medium text-gray-300 mb-2"
        >
          Search
        </label>
        <input
          type="text"
          id="search"
          value={searchQuery}
          onChange={handleSearchInputChange}
          placeholder="Search by title or description"
          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
        />
      </div>

      {/* Tags */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-300 mb-2">Tags</h3>
        <div className="flex flex-wrap gap-2">
          {displayedTags.map((tag) => (
            <button
              key={tag}
              onClick={() => handleTagClick(tag)}
              className={`px-3 py-1 text-sm rounded-full transition-colors ${
                selectedTags.includes(tag)
                  ? "bg-cyan-600 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              {tag}
            </button>
          ))}
          {tags.length > 10 && (
            <button
              onClick={() => setIsTagsExpanded(!isTagsExpanded)}
              className="px-3 py-1 text-sm rounded-full bg-gray-700 text-gray-300 hover:bg-gray-600"
            >
              {isTagsExpanded ? "Show Less" : `+${tags.length - 10} More`}
            </button>
          )}
        </div>
      </div>

      {/* Years */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-300 mb-2">Years</h3>
        <div className="flex flex-wrap gap-2">
          {years.map((year) => (
            <button
              key={year}
              onClick={() => handleYearClick(year)}
              className={`px-3 py-1 text-sm rounded-full transition-colors ${
                selectedYears.includes(year)
                  ? "bg-cyan-600 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              {year}
            </button>
          ))}
        </div>
      </div>

      {/* Clear Filters */}
      {(selectedTags.length > 0 || selectedYears.length > 0 || searchQuery) && (
        <button
          onClick={clearFilters}
          className="text-sm text-cyan-400 hover:text-cyan-300 focus:outline-none"
        >
          Clear all filters
        </button>
      )}
    </div>
  );
};

export default VideoFilters;

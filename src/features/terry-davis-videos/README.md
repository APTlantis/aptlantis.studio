# Terry Davis Videos Feature

This feature provides a catalog of Terry A. Davis's coding videos, showcasing his work on HolyC programming and TempleOS development.

## Overview

The Terry Davis Videos feature allows users to browse, search, and filter through a collection of Terry Davis's coding videos. Users can filter videos by tags, years, and search by title or description.

## Components

### Pages

- **TerryDavisVideosPage**: The main page component that integrates all the other components and manages the state for filtering videos.

### Components

- **VideoFilters**: Provides UI for filtering videos by tags, years, and search query.
- **VideoGrid**: Displays the filtered videos in a grid layout and handles the video selection modal.
- **VideoCard**: Displays individual video cards with thumbnails, title, description, and tags.
- **VideoPlayer**: Embedded video player component that plays videos directly within the application.

### Data

- **terry-davis-videos.json**: Contains the catalog of videos with metadata like title, description, year, duration, URL, thumbnail URL, and tags.

## Features

- **Video Browsing**: Browse through a grid of video cards.
- **Filtering**: Filter videos by tags, years, and search query.
- **Video Details**: View detailed information about a video in a modal.
- **Embedded Video Player**: Watch videos directly within the application without leaving the page.
- **Responsive Design**: Works on both desktop and mobile devices.

## Implementation Details

- Videos are loaded from a JSON file (in a production environment, this would be an API call).
- Filtering is implemented client-side using React hooks.
- The UI is built using Tailwind CSS for styling.
- The embedded video player is implemented using react-player, which supports various video formats and sources.
- The feature follows the project's established patterns for feature organization and component structure.

### Video Player Technical Details

- The video player supports various formats including MP4, WebM, and Ogg.
- MKV file support depends on the browser's native video capabilities:
  - Chrome and Firefox have limited support for MKV files
  - Safari generally doesn't support MKV files
  - If a browser can't play an MKV file, the player will show an error message with a download option
- The player includes loading indicators and error handling with fallback options.
- Videos can be played directly from local files or remote URLs.
- Local file paths are automatically converted to absolute URLs for better compatibility.

### Testing the Video Player

To test the video player with different file formats:

1. **Remote Videos**: Standard HTTP URLs should work in all browsers
2. **Local Videos**:
   - MP4, WebM, and Ogg files should work in most browsers
   - MKV files may work in Chrome and Firefox but likely won't work in Safari
   - If a video doesn't play, use the download option to watch it in a desktop video player

#### Testing with the Local MKV File

The application includes a local MKV file at:

```
src/features/terry-davis-videos/videos/2015-01-04T00_00_00+00_00 - TempleOS - 5-Minute Random Code Walk-Thru #94 (r0nqOxneh8Y).mkv
```

This file is referenced in the `terry-davis-videos.json` data file with ID "12". When testing with this file:

1. If your browser supports MKV playback, the video should play directly in the player
2. If your browser doesn't support MKV, the player will show an error message with a download option
3. For best compatibility, consider converting the MKV file to MP4 format

## Future Enhancements

- Add pagination for large numbers of videos.
- Implement server-side filtering for better performance with large datasets.
- Add user preferences for sorting and filtering.
- Add support for video quality selection and playback speed controls.
- Implement video analytics to track viewing statistics.

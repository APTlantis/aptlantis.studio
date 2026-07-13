// Data loader for torrents - loads torrent metadata from JSON
import torrentsJson from "./aptlantis.torrents.json";

// Define interfaces for torrent data structure
export interface TorrentFile {
  path: string;
  size: number;
}

export interface TorrentInfo {
  info_hash: string;
  piece_length: number;
  piece_count: number;
  file_count: number;
  files: TorrentFile[];
  trackers: string[];
  created_by?: string;
  creation_date: string;
}

export interface AptlantisMetadata {
  reconstructible: boolean;
  reconstruction_method: string;
  tags: string[];
  added_at: string;
}

export interface DownloadUrl {
  type: string;
  url: string;
  mirror?: string;
  infohash?: string;
}

export interface TorrentHashes {
  md5?: string;
  sha1?: string;
  sha256?: string;
  sha512?: string;
  sha3_256?: string;
  blake2b_256?: string;
  blake3_256?: string;
  k12_256?: string;
}

export interface MirrorInfo {
  http_url: string;
  rsync_url: string;
  status: string;
}

export interface Torrent {
  _id?: any;
  torrent: TorrentInfo;
  aptlantis: AptlantisMetadata;
  created_at?: any;
  download_urls: DownloadUrl[];
  filename: string;
  hashes: TorrentHashes;
  mirror: MirrorInfo;
  size: number;
  size_bytes: number;
  updated_at?: any;
}

// Export the torrents array with proper typing
export const torrents: Torrent[] = torrentsJson as Torrent[];

// Helper function to format file size
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

// Helper function to get main file from torrent
export const getMainFile = (torrent: Torrent): TorrentFile | null => {
  if (!torrent.torrent.files || torrent.torrent.files.length === 0) {
    return null;
  }

  // Return the first (and usually only) file
  return torrent.torrent.files[0];
};

// Helper function to extract distro name from filename
export const extractDistroName = (filename: string): string => {
  // Remove .torrent extension and hash suffix
  const name = filename.replace(/\.[a-f0-9]{16}\.torrent$/, "");

  // Extract recognizable distro names
  const distroPatterns = [
    /raspbian/i,
    /debian/i,
    /ubuntu/i,
    /archlinux/i,
    /fedora/i,
    /centos/i,
    /kali/i,
    /parrot/i,
  ];

  for (const pattern of distroPatterns) {
    if (pattern.test(name)) {
      return name;
    }
  }

  return name;
};

// Helper function to format date
export const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateString;
  }
};

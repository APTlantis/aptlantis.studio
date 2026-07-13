// ISO file interface
export interface IsoFile {
  path: string;
  size: string;
  timestamp: string;
  extension?: string;
  mod_time?: string;
  md5_hash?: string;
}

// ISO data interface
export interface IsoData {
  last_updated: string;
  files: IsoFile[];
}

// Function to fetch ISO data
export const fetchIsoData = async (): Promise<IsoData> => {
  try {
    const response = await fetch("/data/isos_info.json");
    if (!response.ok) {
      throw new Error(
        `Failed to fetch ISO data: ${response.status} ${response.statusText}`,
      );
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching ISO data:", error);
    return { last_updated: "", files: [] };
  }
};

// Function to get ISO files for a specific distribution
export const getDistroIsos = (
  isoData: IsoData | null,
  distroId: string,
): IsoFile[] => {
  if (!isoData || !isoData.files) {
    return [];
  }

  // Filter files by distribution name in the path
  return isoData.files.filter((file) => {
    const path = file.path.toLowerCase();
    return (
      path.startsWith(distroId.toLowerCase() + "/") &&
      (path.endsWith(".iso") || path.endsWith(".img"))
    );
  });
};

// Function to extract filename from path
export const getFilenameFromPath = (path: string): string => {
  return path.split("/").pop() || path;
};

// Function to get direct download URL for an ISO file
export const getDirectDownloadUrl = (filePath: string): string => {
  return `/assets/isos/${filePath}`;
};

// Function to get torrent download URL for an ISO file
export const getTorrentDownloadUrl = (filePath: string): string => {
  return `/torrents/${filePath}.torrent`;
};

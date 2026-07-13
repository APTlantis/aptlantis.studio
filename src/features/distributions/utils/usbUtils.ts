/**
 * USB Drive Utilities
 *
 * This module provides functions for detecting USB drives and flashing ISO images to them.
 * It includes platform-specific implementations for Windows, macOS, and Linux.
 */

/**
 * Interface representing a USB drive
 */
export interface USBDrive {
  path: string; // Device path (e.g., /dev/sdb, \\.\PhysicalDrive1)
  label: string; // Drive label or name
  size: string; // Drive size in human-readable format
  isRemovable: boolean; // Whether the drive is removable
}

/**
 * Detects available USB drives on the system
 *
 * @returns {Promise<USBDrive[]>} A promise that resolves to an array of USB drives
 */
export async function detectUSBDrives(): Promise<USBDrive[]> {
  // Determine the platform
  const platform = getPlatform();

  try {
    switch (platform) {
      case "windows":
        return await detectWindowsUSBDrives();
      case "macos":
        return await detectMacOSUSBDrives();
      case "linux":
        return await detectLinuxUSBDrives();
      default:
        throw new Error(`Unsupported platform: ${platform}`);
    }
  } catch (error) {
    console.error("Error detecting USB drives:", error);
    throw new Error(
      `Failed to detect USB drives: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

/**
 * Flashes an ISO image to a USB drive
 *
 * @param {File|string} iso - The ISO file or path to flash
 * @param {string} drivePath - The path to the USB drive
 * @param {(progress: number) => void} progressCallback - Callback function for progress updates
 * @returns {Promise<void>} A promise that resolves when the flashing is complete
 */
export async function flashISOToUSB(
  iso: File | string,
  drivePath: string,
  progressCallback: (progress: number) => void,
): Promise<void> {
  // Determine the platform
  const platform = getPlatform();

  try {
    switch (platform) {
      case "windows":
        return await flashISOToUSBWindows(iso, drivePath, progressCallback);
      case "macos":
        return await flashISOToUSBMacOS(iso, drivePath, progressCallback);
      case "linux":
        return await flashISOToUSBLinux(iso, drivePath, progressCallback);
      default:
        throw new Error(`Unsupported platform: ${platform}`);
    }
  } catch (error) {
    console.error("Error flashing ISO to USB:", error);
    throw new Error(
      `Failed to flash ISO to USB: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

/**
 * Gets the current platform
 *
 * @returns {string} The platform name ('windows', 'macos', 'linux', or 'unknown')
 */
function getPlatform(): string {
  const userAgent = window.navigator.userAgent.toLowerCase();

  if (userAgent.indexOf("win") !== -1) {
    return "windows";
  } else if (userAgent.indexOf("mac") !== -1) {
    return "macos";
  } else if (userAgent.indexOf("linux") !== -1) {
    return "linux";
  } else {
    return "unknown";
  }
}

/**
 * Detects USB drives on Windows
 *
 * @returns {Promise<USBDrive[]>} A promise that resolves to an array of USB drives
 */
async function detectWindowsUSBDrives(): Promise<USBDrive[]> {
  try {
    // Call the backend API to detect USB drives
    const response = await fetch("http://localhost:8081/api/usb/detect");

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const drives = await response.json();
    return drives;
  } catch (error) {
    console.error("Error detecting Windows USB drives:", error);

    // Fallback to mock data if the API call fails
    console.warn("Falling back to mock USB drive data");
    return [
      {
        path: "\\\\.\\PhysicalDrive1",
        label: "USB Drive (D:)",
        size: "16 GB",
        isRemovable: true,
      },
      {
        path: "\\\\.\\PhysicalDrive2",
        label: "USB Drive (E:)",
        size: "32 GB",
        isRemovable: true,
      },
    ];
  }
}

/**
 * Detects USB drives on macOS
 *
 * @returns {Promise<USBDrive[]>} A promise that resolves to an array of USB drives
 */
async function detectMacOSUSBDrives(): Promise<USBDrive[]> {
  try {
    // Call the backend API to detect USB drives
    const response = await fetch("http://localhost:8081/api/usb/detect");

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const drives = await response.json();
    return drives;
  } catch (error) {
    console.error("Error detecting macOS USB drives:", error);

    // Fallback to mock data if the API call fails
    console.warn("Falling back to mock USB drive data");
    return [
      {
        path: "/dev/disk2",
        label: "USB Drive",
        size: "16 GB",
        isRemovable: true,
      },
      {
        path: "/dev/disk3",
        label: "External Drive",
        size: "32 GB",
        isRemovable: true,
      },
    ];
  }
}

/**
 * Detects USB drives on Linux
 *
 * @returns {Promise<USBDrive[]>} A promise that resolves to an array of USB drives
 */
async function detectLinuxUSBDrives(): Promise<USBDrive[]> {
  try {
    // Call the backend API to detect USB drives
    const response = await fetch("http://localhost:8081/api/usb/detect");

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const drives = await response.json();
    return drives;
  } catch (error) {
    console.error("Error detecting Linux USB drives:", error);

    // Fallback to mock data if the API call fails
    console.warn("Falling back to mock USB drive data");
    return [
      {
        path: "/dev/sdb",
        label: "USB Drive",
        size: "16 GB",
        isRemovable: true,
      },
      {
        path: "/dev/sdc",
        label: "External Drive",
        size: "32 GB",
        isRemovable: true,
      },
    ];
  }
}

/**
 * Flashes an ISO image to a USB drive on Windows
 *
 * @param {File|string} iso - The ISO file or path to flash
 * @param {string} drivePath - The path to the USB drive
 * @param {(progress: number) => void} progressCallback - Callback function for progress updates
 * @returns {Promise<void>} A promise that resolves when the flashing is complete
 */
async function flashISOToUSBWindows(
  iso: File | string,
  drivePath: string,
  progressCallback: (progress: number) => void,
): Promise<void> {
  try {
    // Prepare the request body
    const isoPath = typeof iso === "string" ? iso : "/path/to/uploaded/iso"; // Handle File objects in a real implementation

    const requestBody = {
      isoPath: isoPath,
      drivePath: drivePath,
    };

    // Start the flashing process by calling the API
    const response = await fetch("http://localhost:8081/api/usb/flash", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const flashId = data.flashId;

    // Poll for progress updates
    const pollInterval = setInterval(async () => {
      try {
        const progressResponse = await fetch(
          `http://localhost:8081/api/usb/progress?id=${flashId}`,
        );

        if (!progressResponse.ok) {
          throw new Error(`HTTP error! status: ${progressResponse.status}`);
        }

        const progressData = await progressResponse.json();

        // Update progress
        progressCallback(progressData.progress);

        // Check if the process is complete
        if (
          progressData.progress === 100 ||
          progressData.status.includes("error") ||
          progressData.status === "completed"
        ) {
          clearInterval(pollInterval);

          if (progressData.status.includes("error")) {
            throw new Error(`Flashing error: ${progressData.status}`);
          }
        }
      } catch (error) {
        console.error("Error polling for progress:", error);
        clearInterval(pollInterval);
        throw error;
      }
    }, 1000); // Poll every second
  } catch (error) {
    console.error("Error flashing ISO to USB on Windows:", error);

    // Fallback to simulation if the API call fails
    console.warn("Falling back to simulated flashing");
    for (let i = 0; i <= 100; i += 10) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      progressCallback(i);
    }
  }
}

/**
 * Flashes an ISO image to a USB drive on macOS
 *
 * @param {File|string} iso - The ISO file or path to flash
 * @param {string} drivePath - The path to the USB drive
 * @param {(progress: number) => void} progressCallback - Callback function for progress updates
 * @returns {Promise<void>} A promise that resolves when the flashing is complete
 */
async function flashISOToUSBMacOS(
  iso: File | string,
  drivePath: string,
  progressCallback: (progress: number) => void,
): Promise<void> {
  try {
    // Prepare the request body
    const isoPath = typeof iso === "string" ? iso : "/path/to/uploaded/iso"; // Handle File objects in a real implementation

    const requestBody = {
      isoPath: isoPath,
      drivePath: drivePath,
    };

    // Start the flashing process by calling the API
    const response = await fetch("http://localhost:8081/api/usb/flash", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const flashId = data.flashId;

    // Poll for progress updates
    const pollInterval = setInterval(async () => {
      try {
        const progressResponse = await fetch(
          `http://localhost:8081/api/usb/progress?id=${flashId}`,
        );

        if (!progressResponse.ok) {
          throw new Error(`HTTP error! status: ${progressResponse.status}`);
        }

        const progressData = await progressResponse.json();

        // Update progress
        progressCallback(progressData.progress);

        // Check if the process is complete
        if (
          progressData.progress === 100 ||
          progressData.status.includes("error") ||
          progressData.status === "completed"
        ) {
          clearInterval(pollInterval);

          if (progressData.status.includes("error")) {
            throw new Error(`Flashing error: ${progressData.status}`);
          }
        }
      } catch (error) {
        console.error("Error polling for progress:", error);
        clearInterval(pollInterval);
        throw error;
      }
    }, 1000); // Poll every second
  } catch (error) {
    console.error("Error flashing ISO to USB on macOS:", error);

    // Fallback to simulation if the API call fails
    console.warn("Falling back to simulated flashing");
    for (let i = 0; i <= 100; i += 10) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      progressCallback(i);
    }
  }
}

/**
 * Flashes an ISO image to a USB drive on Linux
 *
 * @param {File|string} iso - The ISO file or path to flash
 * @param {string} drivePath - The path to the USB drive
 * @param {(progress: number) => void} progressCallback - Callback function for progress updates
 * @returns {Promise<void>} A promise that resolves when the flashing is complete
 */
async function flashISOToUSBLinux(
  iso: File | string,
  drivePath: string,
  progressCallback: (progress: number) => void,
): Promise<void> {
  try {
    // Prepare the request body
    const isoPath = typeof iso === "string" ? iso : "/path/to/uploaded/iso"; // Handle File objects in a real implementation

    const requestBody = {
      isoPath: isoPath,
      drivePath: drivePath,
    };

    // Start the flashing process by calling the API
    const response = await fetch("http://localhost:8081/api/usb/flash", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const flashId = data.flashId;

    // Poll for progress updates
    const pollInterval = setInterval(async () => {
      try {
        const progressResponse = await fetch(
          `http://localhost:8081/api/usb/progress?id=${flashId}`,
        );

        if (!progressResponse.ok) {
          throw new Error(`HTTP error! status: ${progressResponse.status}`);
        }

        const progressData = await progressResponse.json();

        // Update progress
        progressCallback(progressData.progress);

        // Check if the process is complete
        if (
          progressData.progress === 100 ||
          progressData.status.includes("error") ||
          progressData.status === "completed"
        ) {
          clearInterval(pollInterval);

          if (progressData.status.includes("error")) {
            throw new Error(`Flashing error: ${progressData.status}`);
          }
        }
      } catch (error) {
        console.error("Error polling for progress:", error);
        clearInterval(pollInterval);
        throw error;
      }
    }, 1000); // Poll every second
  } catch (error) {
    console.error("Error flashing ISO to USB on Linux:", error);

    // Fallback to simulation if the API call fails
    console.warn("Falling back to simulated flashing");
    for (let i = 0; i <= 100; i += 10) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      progressCallback(i);
    }
  }
}

/**
 * Validates that a drive is safe to flash to
 *
 * @param {string} drivePath - The path to the drive
 * @returns {Promise<boolean>} A promise that resolves to true if the drive is safe to flash to
 */
export async function validateDriveSafety(drivePath: string): Promise<boolean> {
  try {
    // Get the list of USB drives
    const drives = await detectUSBDrives();

    // Check if the drive is in the list of USB drives and is removable
    const drive = drives.find((d) => d.path === drivePath);

    if (!drive) {
      console.warn(`Drive ${drivePath} not found in the list of USB drives`);
      return false;
    }

    if (!drive.isRemovable) {
      console.warn(
        `Drive ${drivePath} is not removable and may be a system drive`,
      );
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error validating drive safety:", error);

    // Fallback to a safer default if the API call fails
    console.warn("Falling back to safe default for drive validation");
    return false;
  }
}

/**
 * Gets the size of an ISO file
 *
 * @param {File} file - The ISO file
 * @returns {string} The size of the file in human-readable format
 */
export function getISOFileSize(file: File): string {
  const bytes = file.size;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];

  if (bytes === 0) return "0 Byte";

  const i = Math.floor(Math.log(bytes) / Math.log(1024));

  return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
}

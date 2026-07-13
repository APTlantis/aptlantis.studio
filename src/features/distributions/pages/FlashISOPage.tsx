import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { distros } from "../data/distrosLoader";
import { ChevronLeft } from "../components/icons";
import MetaTags from "../../../components/MetaTags";
import type { USBDrive } from "../utils/usbUtils";
import {
  detectUSBDrives,
  flashISOToUSB,
  validateDriveSafety,
  getISOFileSize,
} from "../utils/usbUtils";

/**
 * FlashISOPage Component
 *
 * This page allows users to flash an ISO image to a USB drive.
 * Users can either upload their own ISO file or select one from the available distributions.
 * The page handles device detection, ISO selection, and the flashing process.
 *
 * @returns {JSX.Element} A page for flashing ISO images to USB drives
 */
const FlashISOPage = () => {
  // State for selected ISO file (either uploaded or from distros)
  const [selectedISO, setSelectedISO] = useState<File | null>(null);
  const [selectedDistro, setSelectedDistro] = useState<string | null>(null);

  // State for available USB drives
  const [usbDrives, setUsbDrives] = useState<USBDrive[]>([]);
  const [selectedDrive, setSelectedDrive] = useState<string | null>(null);

  // State for the flashing process
  const [isFlashing, setIsFlashing] = useState(false);
  const [flashProgress, setFlashProgress] = useState(0);
  const [flashStatus, setFlashStatus] = useState<
    "idle" | "flashing" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // State for file upload
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  // Effect to detect USB drives
  useEffect(() => {
    // Function to detect USB drives using the utility function
    const detectDrives = async () => {
      try {
        const drives = await detectUSBDrives();
        setUsbDrives(drives);
      } catch (error) {
        console.error("Error detecting USB drives:", error);
        setErrorMessage(
          "Failed to detect USB drives. Please make sure you have the necessary permissions.",
        );
      }
    };

    // Call the detection function
    detectDrives();

    // Set up a polling interval to periodically check for new drives
    const interval = setInterval(detectDrives, 5000);

    // Clean up the interval when the component unmounts
    return () => clearInterval(interval);
  }, []);

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      // Check if the file is an ISO
      if (file.name.toLowerCase().endsWith(".iso")) {
        setUploadedFile(file);
        setSelectedISO(file);
        setSelectedDistro(null); // Clear selected distro when uploading a file
      } else {
        setErrorMessage("Please select a valid ISO file.");
      }
    }
  };

  // Handle distro selection
  const handleDistroSelect = (distroId: string) => {
    const distro = distros.find((d) => d.id === distroId);
    if (distro && distro.isoUrl) {
      setSelectedDistro(distroId);
      setUploadedFile(null); // Clear uploaded file when selecting a distro
      setSelectedISO(null);

      // In a real implementation, we would download the ISO or prepare it for flashing
      // For now, we'll just set a placeholder message
      setFlashStatus("idle");
      setErrorMessage(null);
    } else {
      setErrorMessage(
        "Selected distribution does not have an ISO file available.",
      );
    }
  };

  // Handle drive selection
  const handleDriveSelect = (drivePath: string) => {
    setSelectedDrive(drivePath);
  };

  // Handle the flash button click
  const handleFlash = async () => {
    if (!selectedISO && !selectedDistro) {
      setErrorMessage("Please select an ISO file or distribution first.");
      return;
    }

    if (!selectedDrive) {
      setErrorMessage("Please select a USB drive.");
      return;
    }

    // Validate that the drive is safe to flash to
    try {
      const isSafe = await validateDriveSafety(selectedDrive);
      if (!isSafe) {
        setErrorMessage(
          "This drive cannot be flashed to. It may be a system drive or contain important data.",
        );
        return;
      }
    } catch (error) {
      console.error("Error validating drive safety:", error);
      setErrorMessage("Failed to validate drive safety. Please try again.");
      return;
    }

    // Confirm the action with the user
    const confirmed = window.confirm(
      `WARNING: This will erase ALL data on the selected drive (${selectedDrive}). Are you sure you want to continue?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setIsFlashing(true);
      setFlashStatus("flashing");
      setFlashProgress(0);
      setErrorMessage(null);

      // Determine the ISO source
      let isoSource: File | string;

      if (selectedISO) {
        // Use the uploaded ISO file
        isoSource = selectedISO;
      } else if (selectedDistro) {
        // Use the selected distribution's ISO URL
        const distro = distros.find((d) => d.id === selectedDistro);
        if (!distro || !distro.isoUrl) {
          throw new Error("Selected distribution does not have an ISO URL.");
        }
        isoSource = distro.isoUrl;
      } else {
        throw new Error("No ISO source selected.");
      }

      // Flash the ISO to the USB drive
      await flashISOToUSB(isoSource, selectedDrive, (progress) => {
        setFlashProgress(progress);
      });

      // Flash completed successfully
      setFlashStatus("success");
    } catch (error) {
      console.error("Error flashing ISO:", error);
      setFlashStatus("error");
      setErrorMessage(
        `Failed to flash the ISO to the USB drive: ${error instanceof Error ? error.message : String(error)}`,
      );
    } finally {
      setIsFlashing(false);
    }
  };

  // Structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "Flash ISO to USB Drive",
    description: "How to flash a Linux distribution ISO image to a USB drive",
    step: [
      {
        "@type": "HowToStep",
        name: "Select ISO",
        text: "Upload an ISO file or select a distribution from the list",
      },
      {
        "@type": "HowToStep",
        name: "Select USB Drive",
        text: "Choose the USB drive you want to flash the ISO to",
      },
      {
        "@type": "HowToStep",
        name: "Flash ISO",
        text: "Click the Flash button to write the ISO to the USB drive",
      },
    ],
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <MetaTags
        title="Flash ISO to USB Drive | APTlantis"
        description="Create a bootable USB drive by flashing a Linux distribution ISO image. Select from our collection or upload your own ISO file."
        keywords="flash ISO, bootable USB, Linux installation, USB drive, ISO image, dd, rufus, etcher"
        canonicalUrl="https://aptlantis.net/flash-iso"
        ogTitle="Flash ISO to USB Drive | APTlantis"
        ogDescription="Create a bootable USB drive by flashing a Linux distribution ISO image. Select from our collection or upload your own ISO file."
        ogImage="https://aptlantis.net/og-usb-preview.jpeg"
        ogImageAlt="USB drive with Linux logo"
        twitterTitle="Flash ISO to USB Drive | APTlantis"
        twitterDescription="Create a bootable USB drive by flashing a Linux distribution ISO image. Select from our collection or upload your own ISO file."
        twitterImage="https://aptlantis.net/og-usb-preview.jpeg"
        twitterImageAlt="USB drive with Linux logo"
        structuredData={structuredData}
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
                <ChevronLeft className="w-4 h-4 text-gray-400 rotate-180" />
                <span className="ml-1 text-gray-600 dark:text-gray-400 md:ml-2">
                  Flash ISO to USB
                </span>
              </div>
            </li>
          </ol>
        </nav>
      </div>

      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-4">Flash ISO to USB Drive</h1>
        <p className="text-xl text-gray-600 dark:text-gray-300">
          Create a bootable USB drive by flashing a Linux distribution ISO
          image.
          <br />
          Select from our collection or upload your own ISO file.
        </p>
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left column: ISO selection */}
        <div className="bg-gray-100 dark:bg-[#1a1a1a] p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4 text-cyan-600 dark:text-cyan-400">
            Step 1: Select ISO
          </h2>

          {/* Upload ISO section */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">Upload ISO File</h3>
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-4 text-center">
              <input
                type="file"
                id="iso-upload"
                accept=".iso"
                className="hidden"
                onChange={handleFileUpload}
              />
              <label
                htmlFor="iso-upload"
                className="cursor-pointer block py-4 px-2 text-gray-600 dark:text-gray-300 hover:text-cyan-600 dark:hover:text-cyan-400"
              >
                {uploadedFile ? (
                  <span>
                    Selected: {uploadedFile.name} (
                    {getISOFileSize(uploadedFile)})
                  </span>
                ) : (
                  <span>Click to select an ISO file or drag and drop here</span>
                )}
              </label>
            </div>
          </div>

          {/* Or divider */}
          <div className="flex items-center mb-6">
            <div className="flex-grow border-t border-gray-300 dark:border-gray-700" />
            <span className="mx-4 text-gray-500 dark:text-gray-400">OR</span>
            <div className="flex-grow border-t border-gray-300 dark:border-gray-700" />
          </div>

          {/* Select from distros section */}
          <div>
            <h3 className="text-lg font-medium mb-2">
              Select from Available Distributions
            </h3>
            <div className="max-h-80 overflow-y-auto pr-2">
              {distros
                .filter((distro) => distro.isoUrl) // Only show distros with ISO URLs
                .map((distro) => (
                  <div
                    key={distro.id}
                    className={`flex items-center p-3 mb-2 rounded-lg cursor-pointer transition-colors ${
                      selectedDistro === distro.id
                        ? "bg-cyan-100 dark:bg-cyan-900"
                        : "bg-white dark:bg-[#0a0a0a] hover:bg-gray-200 dark:hover:bg-gray-800"
                    }`}
                    onClick={() => handleDistroSelect(distro.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleDistroSelect(distro.id);
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    aria-pressed={selectedDistro === distro.id}
                  >
                    <div className="w-10 h-10 mr-3 flex-shrink-0">
                      {distro.logoSrc ? (
                        <img
                          src={distro.logoSrc}
                          width={40}
                          height={40}
                          alt={`${distro.title} logo`}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <div
                          className="w-full h-full rounded-full flex items-center justify-center"
                          style={{
                            backgroundColor:
                              distro.buttonColor?.split(" ")[0] ||
                              "bg-gray-200",
                            color: "white",
                          }}
                        >
                          <span className="text-sm font-bold">
                            {distro.title
                              ? distro.title.substring(0, 2).toUpperCase()
                              : "??"}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex-grow">
                      <h4 className="font-medium">{distro.title}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                        {distro.description}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Right column: USB drive selection and flashing */}
        <div className="bg-gray-100 dark:bg-[#1a1a1a] p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4 text-cyan-600 dark:text-cyan-400">
            Step 2: Select USB Drive
          </h2>

          {/* USB drive selection */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">Available USB Drives</h3>
            {usbDrives.length > 0 ? (
              <div className="space-y-2">
                {usbDrives.map((drive) => (
                  <div
                    key={drive.path}
                    className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedDrive === drive.path
                        ? "bg-cyan-100 dark:bg-cyan-900"
                        : "bg-white dark:bg-[#0a0a0a] hover:bg-gray-200 dark:hover:bg-gray-800"
                    }`}
                    onClick={() => handleDriveSelect(drive.path)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleDriveSelect(drive.path);
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    aria-pressed={selectedDrive === drive.path}
                  >
                    <div className="w-10 h-10 mr-3 flex-shrink-0 bg-gray-300 dark:bg-gray-700 rounded-full flex items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 text-gray-600 dark:text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                        />
                      </svg>
                    </div>
                    <div className="flex-grow">
                      <h4 className="font-medium">{drive.label}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {drive.path} ({drive.size})
                        {!drive.isRemovable && (
                          <span className="ml-2 text-red-500 dark:text-red-400 font-medium">
                            Not Removable
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white dark:bg-[#0a0a0a] p-4 rounded-lg text-center">
                <p className="text-gray-600 dark:text-gray-400">
                  No USB drives detected. Please insert a USB drive.
                </p>
              </div>
            )}
          </div>

          <h2 className="text-2xl font-semibold mb-4 text-cyan-600 dark:text-cyan-400">
            Step 3: Flash ISO to USB
          </h2>

          {/* Warning message */}
          <div className="bg-yellow-100 dark:bg-yellow-900/30 border-l-4 border-yellow-500 p-4 mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-yellow-500"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700 dark:text-yellow-200">
                  <strong>Warning:</strong> This will erase ALL data on the
                  selected USB drive. Make sure you have backed up any important
                  files.
                </p>
              </div>
            </div>
          </div>

          {/* Error message */}
          {errorMessage && (
            <div className="bg-red-100 dark:bg-red-900/30 border-l-4 border-red-500 p-4 mb-4">
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
                    {errorMessage}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Flash progress */}
          {flashStatus === "flashing" && (
            <div className="mb-4">
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Flashing progress
                </span>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {flashProgress}%
                </span>
              </div>
              <div className="w-full bg-gray-300 dark:bg-gray-700 rounded-full h-2.5">
                <div
                  className="bg-cyan-600 h-2.5 rounded-full"
                  style={{ width: `${flashProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Success message */}
          {flashStatus === "success" && (
            <div className="bg-green-100 dark:bg-green-900/30 border-l-4 border-green-500 p-4 mb-4">
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
                    ISO successfully flashed to USB drive! You can now boot from
                    this USB drive to install or run the operating system.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Flash button */}
          <button
            onClick={handleFlash}
            disabled={
              isFlashing || (!selectedISO && !selectedDistro) || !selectedDrive
            }
            className={`w-full py-3 px-4 rounded-md text-white font-medium flex items-center justify-center ${
              isFlashing || (!selectedISO && !selectedDistro) || !selectedDrive
                ? "bg-gray-400 dark:bg-gray-700 cursor-not-allowed"
                : "bg-cyan-600 hover:bg-cyan-700 dark:bg-cyan-700 dark:hover:bg-cyan-600"
            }`}
          >
            {isFlashing ? (
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
                Flashing...
              </>
            ) : (
              "Flash ISO to USB"
            )}
          </button>
        </div>
      </div>

      {/* Additional information */}
      <div className="mt-12 bg-gray-100 dark:bg-[#1a1a1a] p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4 text-cyan-600 dark:text-cyan-400">
          About ISO Flashing
        </h2>
        <div className="text-gray-600 dark:text-gray-300 space-y-4">
          <p>
            Flashing an ISO to a USB drive creates a bootable drive that can be
            used to install or run an operating system. This is useful for
            installing Linux distributions, creating recovery drives, or running
            live environments.
          </p>
          <p>
            The process works by writing the ISO file directly to the USB drive,
            replacing any existing data. This is different from simply copying
            the ISO file to the drive, as it makes the drive bootable.
          </p>
          <p>
            <strong>Note:</strong> This tool uses the following methods
            depending on your operating system:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Windows: Uses PowerShell scripts or diskpart commands</li>
            <li>macOS: Uses the dd command</li>
            <li>Linux: Uses dd, lsblk, and udev</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default FlashISOPage;

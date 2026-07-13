import React, { useState, useEffect, useCallback } from "react";
import { useScreensaver } from "../context/ScreensaverContext";
import figlet from "../utils/figletConfig";

// Define the distro tips
const DISTRO_TIPS = [
  "Tip: Use 'rsync -avz --progress' to see transfer progress in real-time",
  "Tip: Alpine Linux uses only 130MB of RAM and 700MB of storage",
  "Tip: Arch Linux follows a rolling release model for continuous updates",
  "Tip: Debian is one of the oldest and most respected Linux distributions",
  "Tip: Gentoo allows you to compile packages with custom optimizations",
  "Tip: Rocky Linux is a drop-in replacement for CentOS",
  "Tip: FreeBSD is not Linux, but a descendant of the original Berkeley Unix",
  "Tip: Use 'apt-get clean' to free up disk space by clearing package cache",
  "Tip: KDE Neon combines the latest KDE software with Ubuntu LTS stability",
  "Tip: Linux Mint is designed to work 'out of the box' with multimedia support",
  "Tip: Void Linux uses the runit init system instead of systemd",
  "Tip: Kali Linux includes over 600 penetration testing tools",
  "Tip: Use 'dd if=/dev/zero of=/dev/null bs=1M count=1000' to benchmark disk speed",
  "Tip: Fedora often introduces new technologies later adopted by other distributions",
  "Tip: Use 'htop' for a more user-friendly alternative to 'top'",
  "Tip: The 'find' command can locate files based on size, date, and permissions",
  "Tip: Use 'ssh-copy-id user@host' to easily copy your SSH key to a server",
  "Tip: APTlantis mirrors are updated every 6 hours for freshness",
  "Tip: Use 'curl wttr.in' to get a weather forecast in your terminal",
  "Tip: The 'ncdu' tool helps you find what's taking up disk space",
];

// ASCII banners to cycle through
const BANNERS = ["APTlantis", "MIRROR READY", "rsync -avz --cool"];

// Simulated file paths for the scanning effect
const FILE_PATHS = [
  "/var/www/mirrors/debian/pool/main/a/apache2/apache2_2.4.57-2_amd64.deb",
  "/var/www/mirrors/ubuntu/pool/universe/z/zsh/zsh_5.9-4ubuntu1_amd64.deb",
  "/var/www/mirrors/fedora/releases/38/Everything/x86_64/os/Packages/k/kernel-6.2.9-300.fc38.x86_64.rpm",
  "/var/www/mirrors/archlinux/pool/packages/linux-6.3.1.arch1-1-x86_64.pkg.tar.zst",
  "/var/www/mirrors/gentoo/distfiles/openssl-3.0.8.tar.gz",
  "/var/www/mirrors/alpine/v3.18/main/x86_64/busybox-1.36.0-r0.apk",
  "/var/www/mirrors/opensuse/distribution/leap/15.5/repo/oss/x86_64/zypper-1.14.56-150500.1.3.x86_64.rpm",
  "/var/www/mirrors/rockylinux/8/BaseOS/x86_64/os/Packages/b/bash-4.4.20-4.el8.x86_64.rpm",
  "/var/www/mirrors/freebsd/releases/amd64/13.2-RELEASE/base.txz",
  "/var/www/mirrors/kali/pool/main/m/metasploit-framework/metasploit-framework_6.3.4-0kali1_all.deb",
];

// Simulated hash values
const generateHash = () => {
  const chars = "0123456789abcdef";
  let hash = "";
  for (let i = 0; i < 64; i++) {
    hash += chars[Math.floor(Math.random() * chars.length)];
  }
  return hash;
};

const Screensaver: React.FC = () => {
  const { isActive } = useScreensaver();
  const [visible, setVisible] = useState(false);
  const [opacity, setOpacity] = useState(0);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [asciiBanner, setAsciiBanner] = useState("");
  const [scanningFile, setScanningFile] = useState("");
  const [fileHash, setFileHash] = useState("");
  const [flickerIntensity, setFlickerIntensity] = useState(1);

  // Generate ASCII art from text
  const generateAsciiArt = useCallback((text: string): Promise<string> => {
    return new Promise((resolve) => {
      figlet.text(
        text,
        {
          font: "Standard",
          horizontalLayout: "default",
          verticalLayout: "default",
          width: 80,
          whitespaceBreak: true,
        },
        (err, result) => {
          if (err) {
            console.error("Error generating ASCII art:", err);
            resolve(text);
          } else {
            resolve(result || text);
          }
        },
      );
    });
  }, []);

  // Update the ASCII banner when the current banner index changes
  useEffect(() => {
    if (isActive) {
      generateAsciiArt(BANNERS[currentBannerIndex]).then((art) => {
        setAsciiBanner(art);
      });
    }
  }, [currentBannerIndex, isActive, generateAsciiArt]);

  // Cycle through banners
  useEffect(() => {
    if (!isActive) return;

    const bannerInterval = setInterval(() => {
      setCurrentBannerIndex((prevIndex) => (prevIndex + 1) % BANNERS.length);
    }, 10000); // Change banner every 10 seconds

    return () => clearInterval(bannerInterval);
  }, [isActive]);

  // Cycle through tips
  useEffect(() => {
    if (!isActive) return;

    const tipInterval = setInterval(() => {
      setCurrentTipIndex((prevIndex) => (prevIndex + 1) % DISTRO_TIPS.length);
    }, 5000); // Change tip every 5 seconds

    return () => clearInterval(tipInterval);
  }, [isActive]);

  // Simulate file scanning
  useEffect(() => {
    if (!isActive) return;

    const scanInterval = setInterval(() => {
      const randomFileIndex = Math.floor(Math.random() * FILE_PATHS.length);
      setScanningFile(FILE_PATHS[randomFileIndex]);
      setFileHash(generateHash());
    }, 2000); // Scan a new file every 2 seconds

    return () => clearInterval(scanInterval);
  }, [isActive]);

  // Create flickering effect
  useEffect(() => {
    if (!isActive) return;

    const flickerInterval = setInterval(() => {
      setFlickerIntensity(0.85 + Math.random() * 0.3); // Random value between 0.85 and 1.15
    }, 100); // Update flicker every 100ms

    return () => clearInterval(flickerInterval);
  }, [isActive]);

  // Handle fade in/out
  useEffect(() => {
    if (isActive && !visible) {
      setVisible(true);
      // Start fade in
      setTimeout(() => {
        setOpacity(1);
      }, 10);
    } else if (!isActive && visible) {
      // Start fade out
      setOpacity(0);
      // Remove from DOM after fade out
      setTimeout(() => {
        setVisible(false);
      }, 500); // Match transition duration
    }
  }, [isActive, visible]);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center overflow-hidden"
      style={{
        opacity,
        transition: "opacity 500ms ease-in-out",
        fontFamily: "monospace",
      }}
    >
      {/* Terminal header */}
      <div className="absolute top-0 left-0 right-0 bg-gray-900 text-green-500 p-2 flex justify-between items-center border-b border-green-800">
        <div>APTlantis Terminal v1.0</div>
        <div>{new Date().toLocaleTimeString()}</div>
      </div>

      {/* ASCII art banner */}
      <div
        className="text-green-500 text-center mb-8 whitespace-pre"
        style={{
          filter: `brightness(${flickerIntensity})`,
          textShadow: "0 0 5px rgba(0, 255, 0, 0.7)",
        }}
      >
        {asciiBanner}
      </div>

      {/* Distro tip */}
      <div
        className="text-green-400 text-xl mb-12"
        style={{
          filter: `brightness(${flickerIntensity})`,
          textShadow: "0 0 3px rgba(0, 255, 0, 0.5)",
        }}
      >
        {DISTRO_TIPS[currentTipIndex]}
      </div>

      {/* File scanning simulation */}
      <div className="w-full max-w-4xl px-4">
        <div
          className="text-green-500 text-sm mb-2"
          style={{ filter: `brightness(${flickerIntensity})` }}
        >
          Scanning: {scanningFile}
        </div>
        <div
          className="text-green-400 text-sm mb-4"
          style={{ filter: `brightness(${flickerIntensity})` }}
        >
          SHA-256: {fileHash}
        </div>

        {/* Progress bar */}
        <div className="w-full bg-green-900 rounded-full h-2 mb-8">
          <div
            className="bg-green-500 h-2 rounded-full"
            style={{
              width: `${Math.random() * 100}%`,
              boxShadow: "0 0 10px rgba(0, 255, 0, 0.7)",
            }}
          />
        </div>
      </div>

      {/* Press any key message */}
      <div
        className="absolute bottom-4 text-green-400 text-sm"
        style={{
          opacity: 0.7 * flickerIntensity,
          animation: "pulse 2s infinite",
        }}
      >
        Press any key to continue...
      </div>

      {/* Add a global style for the pulse animation */}
      <style>{`
        @keyframes pulse {
          0% { opacity: 0.3; }
          50% { opacity: 0.7; }
          100% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
};

export default Screensaver;

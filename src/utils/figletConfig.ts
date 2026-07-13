import figlet from "figlet";

// Create a wrapper for figlet to ensure it's properly initialized
let figletInstance = figlet;

try {
  // Make sure figlet is properly initialized
  if (!figletInstance) {
    console.warn(
      "Figlet module not loaded properly, trying to create a fallback",
    );
    // This is a last resort if the import somehow failed but didn't throw
    figletInstance = require("figlet");
  }

  // Check if the figlet instance has the required methods
  if (figletInstance && typeof figletInstance.defaults === "function") {
    // Configure figlet to use our custom font path
    figletInstance.defaults({
      fontPath: "/fonts", // This will resolve to public/fonts in Next.js
    });

    // Verify that text method exists
    if (typeof figletInstance.text !== "function") {
      console.error("Figlet instance is missing the text method");
    }
  } else {
    console.error("Figlet instance is missing the defaults method");
  }
} catch (error) {
  console.error("Error initializing figlet:", error);
}

// Ensure we're exporting a properly initialized figlet instance
export default figletInstance;

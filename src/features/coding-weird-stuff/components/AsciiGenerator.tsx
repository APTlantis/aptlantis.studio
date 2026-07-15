import React, { useState, useEffect, useRef } from "react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectGroup,
} from "@radix-ui/react-select";

// Define types for figlet library
interface FigletOptions {
  font?: string;
  horizontalLayout?: string;
  verticalLayout?: string;
  width?: number;
  whitespaceBreak?: boolean;
  // Allow additional properties with string keys and unknown values
  [key: string]: unknown;
}

interface FigletCallback {
  (err: Error | null, result?: string): void;
}

interface FigletLoadFontCallback {
  (err: Error | null, fontObject?: object): void;
}

interface FigletInstance {
  text: (
    text: string,
    options: FigletOptions | string,
    callback: FigletCallback,
  ) => void;
  textSync?: (text: string, options?: FigletOptions | string) => string;
  defaults: (options: FigletOptions) => void;
  loadFont: (name: string, callback: FigletLoadFontCallback) => void;
}

const AsciiGenerator: React.FC = () => {
  const [text, setText] = useState("Hello World");
  const [font, setFont] = useState("Standard");
  const [output, setOutput] = useState("");
  const [style, setStyle] = useState("green");
  const [figlet, setFiglet] = useState<FigletInstance | null>(null);
  const [fonts, setFonts] = useState<string[]>([]);
  const outputRef = useRef<HTMLPreElement>(null);

  // Load figlet.js dynamically on client-side
  useEffect(() => {
    // Set initial loading state
    setOutput("Loading ASCII generator...");

    // Track if component is still mounted
    let isMounted = true;

    // Define the common fonts we'll use
    const commonFonts = ["Standard", "Slant", "Block", "Shadow", "Doom"];

    // Define the full font list
    const fontList = [
      ...commonFonts,
      "3D-ASCII",
      "3D Diagonal",
      "ANSI Regular",
      "ANSI Shadow",
      "Avatar",
      "Banner",
      "Banner3",
      "Big",
      "Bloody",
      "Bolger",
      "Braced",
      "Broadway",
      "Bubble",
      "Caligraphy",
      "Colossal",
      "Computer",
      "Contessa",
      "Contrast",
      "Crawford",
      "Cricket",
      "Cursive",
      "Cyberlarge",
      "Cybermedium",
      "Dancing Font",
      "Def Leppard",
      "Diamond",
      "Digital",
      "Doh",
      "Dotmatrix",
      "Double",
      "Electronic",
      "Elite",
      "Epic",
      "Fender",
      "Filter",
      "Fire Font-k",
      "Flower Power",
      "Four Tops",
      "Fraktur",
      "Fuzzy",
      "Georgi16",
      "Georgia11",
      "Ghost",
      "Ghoulish",
      "Glenyn",
      "Goofy",
      "Gothic",
      "Graceful",
      "Graffiti",
      "Hex",
      "Hieroglyphs",
      "Hollywood",
      "ICL-1900",
      "Impossible",
      "Invita",
      "Isometric1",
      "Isometric2",
      "Isometric3",
      "Isometric4",
      "Italic",
      "Ivrit",
      "Jacky",
      "Jazmine",
      "Jerusalem",
      "Katakana",
      "Kban",
      "Keyboard",
      "Knob",
      "Konto",
      "LCD",
      "Lean",
      "Letters",
      "Linux",
      "Lockergnome",
      "Madrid",
      "Marquee",
      "Maxfour",
      "Merlin1",
      "Merlin2",
      "Mike",
      "Mini",
      "Mirror",
      "Mnemonic",
      "Modular",
      "Morse",
      "Moscow",
      "Mshebrew210",
      "Muzzle",
      "NScript",
      "Nancyj",
      "Nancyj-Fancy",
      "Nancyj-Improved",
      "Nancyj-Underlined",
      "Nipples",
      "O8",
      "OS2",
      "Octal",
      "Ogre",
      "Old Banner",
      "Patorjk's Cheese",
      "Patorjk-HeX",
      "Pawp",
      "Peaks",
      "Pebbles",
      "Pepper",
      "Poison",
      "Puffy",
      "Puzzle",
      "Pyramid",
      "Rammstein",
      "Rectangles",
      "Relief",
      "Relief2",
      "Reverse",
      "Roman",
      "Rot13",
      "Rotated",
      "Rounded",
      "Rowan Cap",
      "Rozzo",
      "Runic",
      "Runyc",
      "S Blood",
      "SL Script",
      "Santa Clara",
      "Script",
      "Serifcap",
      "Shimrod",
      "Short",
      "Slide",
      "Small",
      "Small Caps",
      "Small Isometric1",
      "Small Keyboard",
      "Small Poison",
      "Small Script",
      "Small Shadow",
      "Small Slant",
      "Small Tengwar",
      "Speed",
      "Spliff",
      "Stacey",
      "Stampate",
      "Stampatello",
      "Star Strips",
      "Star Wars",
      "Stellar",
      "Stforek",
      "Stick Letters",
      "Stop",
      "Straight",
      "Sub-Zero",
      "Swamp Land",
      "Swan",
      "Sweet",
      "Tanja",
      "Tengwar",
      "Term",
      "Test1",
      "The Edge",
      "Thick",
      "Thin",
      "Thorned",
      "Three Point",
      "Ticks",
      "Ticks Slant",
      "Tiles",
      "Tinker-Toy",
      "Tombstone",
      "Train",
      "Trek",
      "Tsalagi",
      "Tubular",
      "Twisted",
      "Two Point",
      "USA Flag",
      "Univers",
      "Varsity",
      "Wavy",
      "Weird",
      "Wet Letter",
      "Whimsy",
    ];

    // Filter out duplicate font names to ensure unique keys
    const uniqueFontList = [...new Set(fontList)];

    // Set the fonts list immediately so the dropdown isn't empty
    setFonts(uniqueFontList);

    const loadFiglet = async () => {
      try {
        // First try to import our configured figlet instance
        let figletInstance;

        try {
          const figletModule = await import("../../../utils/figletConfig");
          figletInstance = figletModule.default;

          // Verify that figlet is properly initialized
          if (!figletInstance || typeof figletInstance.text !== "function") {
            throw new Error("Configured figlet instance is not valid");
          }
        } catch (configError) {
          console.warn(
            "Could not load configured figlet, trying direct import:",
            configError,
          );

          // Try to import figlet directly as a fallback
          const originalFiglet = await import("figlet");
          figletInstance = originalFiglet.default;

          // Configure the fallback figlet
          if (figletInstance && typeof figletInstance.defaults === "function") {
            figletInstance.defaults({
              fontPath: "/fonts",
            });
          } else {
            throw new Error("Failed to initialize figlet properly");
          }
        }

        // At this point we should have a valid figlet instance
        if (!figletInstance || typeof figletInstance.text !== "function") {
          throw new Error(
            "Failed to initialize figlet properly after all attempts",
          );
        }

        // Update the figlet state if component is still mounted
        if (isMounted) {
          // Ensure figletInstance is of the correct type before setting state
          if (figletInstance && typeof figletInstance.text === "function") {
            setFiglet(figletInstance as FigletInstance);
            setOutput("Initializing fonts...");
          }
        }

        // Preload common fonts in the background
        const preloadFonts = async () => {
          if (typeof figletInstance.loadFont === "function") {
            for (const fontName of commonFonts) {
              try {
                await new Promise<void>((resolve, reject) => {
                  // Use proper typing for figlet
                  figletInstance.loadFont(
                    fontName as any,
                    (err: Error | null, _?: object) => {
                      if (err) {
                        reject(err);
                      } else {
                        // Font preloaded successfully
                        resolve();
                      }
                    },
                  );
                });
              } catch (err) {
                console.warn(`Failed to preload font ${fontName}:`, err);
                // Continue with other fonts even if one fails
              }
            }
          }

          // Generate initial ASCII art after fonts are loaded
          if (isMounted && text && typeof figletInstance.text === "function") {
            try {
              figletInstance.text(
                text,
                { font: "Standard" },
                (err: Error | null, result?: string) => {
                  if (!isMounted) return;

                  if (err) {
                    console.error("Error generating initial ASCII art:", err);
                    setOutput("Ready to generate ASCII art. Enter text above.");
                  } else {
                    setOutput(
                      result ||
                        "Ready to generate ASCII art. Enter text above.",
                    );
                  }
                },
              );
            } catch (err) {
              console.error("Error calling figlet.text:", err);
              if (isMounted) {
                setOutput("Ready to generate ASCII art. Enter text above.");
              }
            }
          }
        };

        // Start preloading fonts in the background
        setTimeout(() => {
          preloadFonts().catch((err) => {
            console.error("Error in preloading fonts:", err);
          });
        }, 100);
      } catch (err) {
        console.error("Failed to load figlet:", err);
        if (isMounted) {
          setOutput(
            "Error loading ASCII generator. Please refresh the page and try again.",
          );
        }
      }
    };

    // Start loading figlet
    loadFiglet();

    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, [text]);

  // Generate ASCII art when text or font changes
  useEffect(() => {
    if (!figlet) {
      setOutput("Loading figlet library...");
      return;
    }

    if (!text) {
      setOutput("Please enter some text");
      return;
    }

    // Use a fallback font if the selected font isn't available
    const fallbackFont = "Standard";
    const currentFont = font || fallbackFont;

    // Track if we're still waiting for the current render
    let isCurrent = true;

    const generateAscii = () => {
      try {
        // Make sure figlet is properly initialized and has the text method
        if (typeof figlet.text === "function") {
          // Show a loading message while generating
          setOutput(`Generating ASCII art with ${currentFont} font...`);

          // Use setTimeout to prevent UI freezing
          setTimeout(() => {
            if (!isCurrent) return; // Skip if this is no longer the current render

            try {
              figlet.text(
                text,
                { font: currentFont },
                (err: Error | null, result?: string) => {
                  if (!isCurrent) return; // Skip if this is no longer the current render

                  if (err) {
                    console.error("Error generating ASCII art:", err);
                    // Try with the fallback font if the current font failed
                    if (currentFont !== fallbackFont) {
                      // Falling back to default font
                      figlet.text(
                        text,
                        { font: fallbackFont },
                        (
                          fallbackErr: Error | null,
                          fallbackResult?: string,
                        ) => {
                          if (!isCurrent) return;
                          if (fallbackErr) {
                            setOutput(
                              "Error generating ASCII art. Please try a different font.",
                            );
                          } else {
                            setOutput(fallbackResult || "No output generated");
                          }
                        },
                      );
                    } else {
                      setOutput(
                        "Error generating ASCII art. Please try a different font.",
                      );
                    }
                  } else {
                    setOutput(result || "No output generated");
                  }
                },
              );
            } catch (err) {
              if (!isCurrent) return;
              console.error("Error calling figlet.text:", err);
              setOutput(
                "Error generating ASCII art. Please try again with a different font.",
              );

              // Try to reinitialize figlet if there was an error
              reinitializeFiglet();
            }
          }, 0);
        } else {
          console.error("figlet.text is not a function");
          setOutput("Initializing figlet library...");

          // Try to reinitialize figlet
          reinitializeFiglet();
        }
      } catch (err) {
        if (!isCurrent) return;
        console.error("Error in figlet.text:", err);
        setOutput("Error generating ASCII art. Please try again.");
      }
    };

    // Function to reinitialize figlet if needed
    const reinitializeFiglet = async () => {
      try {
        const originalFiglet = await import("figlet");
        const figletFallback = originalFiglet.default;

        if (figletFallback && typeof figletFallback.text === "function") {
          figletFallback.defaults({
            fontPath: "/fonts",
          });
          setFiglet(figletFallback as FigletInstance);
        }
      } catch (err) {
        console.error("Failed to reinitialize figlet:", err);
      }
    };

    // Generate the ASCII art
    generateAscii();

    // Cleanup function to prevent state updates if the component unmounts
    return () => {
      isCurrent = false;
    };
  }, [text, font, figlet]);

  // Handle text input change
  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);
  };

  // Handle font selection change
  const handleFontChange = (value: string) => {
    // Update the font state immediately to provide instant feedback to the user
    setFont(value);

    // If figlet is not available, we've already updated the font state
    // The useEffect will handle the error when it tries to generate ASCII art
    if (!figlet) {
      return;
    }

    // For common fonts, we don't need to load them again as they were preloaded
    const commonFonts = ["Standard", "Slant", "Block", "Shadow", "Doom"];
    if (commonFonts.includes(value)) {
      return; // These fonts are already preloaded, no need to load them again
    }

    // For other fonts, load them in the background without blocking the UI
    if (typeof figlet.loadFont === "function") {
      // Use setTimeout to move the font loading to the next event loop tick
      // This prevents UI freezing by allowing the UI to update before loading the font
      setTimeout(() => {
        try {
          figlet.loadFont(value as any, (err: Error | null) => {
            if (err) {
              console.error(`Failed to load font ${value}:`, err);
              // The font will fall back to a default font in the text method
            }
          });
        } catch (err) {
          console.error(`Error in loadFont for ${value}:`, err);
        }
      }, 0);
    } else {
      console.warn(
        "figlet.loadFont is not a function, font may not display correctly",
      );
    }
  };

  // Handle style preset selection
  const handleStyleChange = (newStyle: string) => {
    setStyle(newStyle);
  };

  // Handle download button click
  const handleDownload = () => {
    if (!output) return;

    const blob = new Blob([output], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ascii-art-${text.substring(0, 20).replace(/\s+/g, "-")}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Get terminal style classes based on selected style
  const getTerminalClasses = () => {
    const baseClasses =
      "w-full h-64 overflow-auto p-4 rounded-md font-mono text-sm whitespace-pre";

    switch (style) {
      case "green":
        return `${baseClasses} bg-black text-green-500 terminal-effect-green`;
      case "amber":
        return `${baseClasses} bg-black text-amber-500 terminal-effect-amber`;
      case "purple":
        return `${baseClasses} bg-black text-purple-500 terminal-effect-glitch`;
      default:
        return `${baseClasses} bg-black text-green-500 terminal-effect-green`;
    }
  };

  return (
    <div className="atl-card p-5">
      <h2 className="atl-title mb-4 text-2xl font-black">
        Terminal Banner Generator
      </h2>

      <div className="mb-4">
        <label
          htmlFor="text-input"
          className="mb-1 block text-sm font-medium text-atl-silver"
        >
          Enter Text
        </label>
        <input
          id="text-input"
          type="text"
          value={text}
          onChange={handleTextChange}
          className="w-full rounded-md border border-atl-ridge bg-atl-void/60 px-3 py-2 text-atl-archive shadow-sm focus:border-atl-silver focus:outline-none focus:ring-2 focus:ring-atl-silver"
          placeholder="Type something..."
        />
      </div>

      <div className="mb-4">
        <label
          htmlFor="font-select"
          className="mb-1 block text-sm font-medium text-atl-silver"
        >
          Select Font
        </label>
        <Select value={font} onValueChange={handleFontChange}>
          <SelectTrigger
            id="font-select"
            className="w-full rounded-md border border-atl-ridge bg-atl-void/60 px-3 py-2 text-atl-archive shadow-sm focus:border-atl-silver focus:outline-none focus:ring-2 focus:ring-atl-silver"
          >
            <SelectValue placeholder="Select a font" />
          </SelectTrigger>
          <SelectContent className="max-h-80 overflow-y-auto rounded-md border border-atl-ridge bg-atl-void text-atl-archive shadow-md">
            <SelectGroup>
              {/* Show only the most common fonts first */}
              {["Standard", "Slant", "Block", "Shadow", "Doom"].map(
                (fontName) => (
                  <SelectItem
                    key={fontName}
                    value={fontName}
                    className="cursor-pointer px-3 py-2 hover:bg-atl-abyss"
                  >
                    {fontName}
                  </SelectItem>
                ),
              )}
              {/* Show a separator */}
              <div className="my-1 h-px bg-atl-ridge" />
              {/* Show the rest of the fonts */}
              {fonts
                .filter(
                  (f) =>
                    !["Standard", "Slant", "Block", "Shadow", "Doom"].includes(
                      f,
                    ),
                )
                .map((fontName) => (
                  <SelectItem
                    key={fontName}
                    value={fontName}
                    className="cursor-pointer px-3 py-2 hover:bg-atl-abyss"
                  >
                    {fontName}
                  </SelectItem>
                ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <div className="mb-4">
        <h3
          id="terminal-style-heading"
          className="mb-1 block text-sm font-medium text-atl-silver"
        >
          Terminal Style
        </h3>
        <div
          className="flex flex-wrap gap-2"
          role="group"
          aria-labelledby="terminal-style-heading"
        >
          <button
            onClick={() => handleStyleChange("green")}
            className={`rounded-md border px-3 py-1 text-sm ${
              style === "green"
                ? "border-green-300 bg-green-500/20 text-green-200"
                : "border-atl-ridge bg-atl-void/60 text-atl-silver"
            }`}
          >
            CRT Green
          </button>
          <button
            onClick={() => handleStyleChange("amber")}
            className={`rounded-md border px-3 py-1 text-sm ${
              style === "amber"
                ? "border-amber-300 bg-amber-500/20 text-amber-200"
                : "border-atl-ridge bg-atl-void/60 text-atl-silver"
            }`}
          >
            DOS Amber
          </button>
          <button
            onClick={() => handleStyleChange("purple")}
            className={`rounded-md border px-3 py-1 text-sm ${
              style === "purple"
                ? "border-purple-300 bg-purple-500/20 text-purple-200"
                : "border-atl-ridge bg-atl-void/60 text-atl-silver"
            }`}
          >
            Glitch Purple
          </button>
        </div>
      </div>

      <div className="mb-4">
        <h3
          id="ascii-output-heading"
          className="mb-1 block text-sm font-medium text-atl-silver"
        >
          ASCII Output
        </h3>
        <pre
          ref={outputRef}
          aria-labelledby="ascii-output-heading"
          className={getTerminalClasses()}
          style={{
            boxShadow: "inset 0 0 10px rgba(0, 0, 0, 0.5)",
            backgroundImage:
              "linear-gradient(rgba(0, 0, 0, 0.1) 50%, transparent 50%)",
            backgroundSize: "100% 4px",
            animation: style === "purple" ? "glitch 0.3s infinite" : "none",
            filter: `blur(0.4px) brightness(1.1) ${style === "amber" ? "sepia(0.5)" : ""}`,
          }}
        >
          {output || "Loading..."}
        </pre>
      </div>

      <div>
        <button
          onClick={handleDownload}
          disabled={!output}
          className="atl-button px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
        >
          Download as .txt
        </button>
      </div>

      <style>{`
        @keyframes glitch {
          0% { transform: translate(0) }
          20% { transform: translate(-2px, 2px) }
          40% { transform: translate(-2px, -2px) }
          60% { transform: translate(2px, 2px) }
          80% { transform: translate(2px, -2px) }
          100% { transform: translate(0) }
        }

        .terminal-effect-green {
          text-shadow: 0 0 5px rgba(0, 255, 0, 0.7);
        }

        .terminal-effect-amber {
          text-shadow: 0 0 5px rgba(255, 191, 0, 0.7);
        }

        .terminal-effect-glitch {
          text-shadow: 0 0 5px rgba(128, 0, 255, 0.7), 2px 2px 0px rgba(255, 0, 255, 0.5);
        }
      `}</style>
    </div>
  );
};

export default AsciiGenerator;

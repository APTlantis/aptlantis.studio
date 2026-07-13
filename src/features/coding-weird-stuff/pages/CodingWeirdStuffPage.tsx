import { Link } from "react-router-dom";
import { ChevronRight } from "../../../shared/icons";
import { lazy, Suspense } from "react";

// Dynamically import the AsciiGenerator component to avoid SSR issues with figlet
const AsciiGenerator = lazy(() =>
  import("../components").then((mod) => ({ default: mod.AsciiGenerator })),
);

// Sample data for weird coding projects
const weirdProjects = [
  {
    id: "ascii-generator",
    title: "ASCII Art Generator",
    language: "React + figlet.js",
    description:
      "A retro terminal-styled ASCII art generator that converts text to ASCII art using various fonts.",
    imageUrl: "logos/folder-react-components.svg",
  },
  {
    id: "tetris-excel",
    title: "Tetris in Excel",
    language: "Excel Macros",
    description:
      "A fully functional Tetris game built entirely in Excel using VBA macros and cell formatting.",
    imageUrl: "/placeholder.svg",
  },
  {
    id: "css-tic-tac-toe",
    title: "CSS-only Tic Tac Toe",
    language: "CSS",
    description:
      "A complete Tic Tac Toe game using only CSS - no JavaScript required!",
    imageUrl: "/logos/css.svg",
  },
  {
    id: "qbasic-rpg",
    title: "Fantasy RPG in QBasic",
    language: "QBasic",
    description:
      "A text-based role-playing game created in QBasic with ASCII art graphics.",
    imageUrl: "/placeholder.svg",
  },
  {
    id: "cobol-web-server",
    title: "Web Server in COBOL",
    language: "COBOL",
    description:
      "A functioning HTTP server implemented in COBOL running on mainframe systems.",
    imageUrl: "logos/cobol.svg",
  },
  {
    id: "bash-platformer",
    title: "Terminal Platformer",
    language: "Bash",
    description:
      "A platform game that runs entirely in your terminal using Bash scripting.",
    imageUrl: "/placeholder.svg",
  },
  {
    id: "powerpoint-adventure",
    title: "PowerPoint Adventure Game",
    language: "PowerPoint",
    description:
      "An interactive adventure game built using only PowerPoint slides and animations.",
    imageUrl: "logos/powerpoint.svg",
  },
  {
    id: "regex-chess",
    title: "Regex Chess",
    language: "Regular Expressions",
    description:
      "A chess engine implemented entirely using regular expressions.",
    imageUrl: "/placeholder.svg",
  },
  {
    id: "sql-raytracer",
    title: "SQL Raytracer",
    language: "SQL",
    description: "A raytracing renderer implemented purely in SQL queries.",
    imageUrl: "/placeholder.svg",
  },
];

const CodingWeirdStuffPage = () => {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="mb-6">
        <nav className="flex" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <Link
                to="/"
                className="text-gray-600 dark:text-gray-400 hover:text-cyan-600 dark:hover:text-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-[#0a0a0a] rounded-md"
              >
                Home
              </Link>
            </li>
            <li>
              <div className="flex items-center">
                <ChevronRight className="w-4 h-4 text-gray-400" />
                <span className="ml-1 text-gray-600 dark:text-gray-400 md:ml-2">
                  Coding Weird Stuff
                </span>
              </div>
            </li>
          </ol>
        </nav>
      </div>

      {/* Hero Banner */}
      <div className="relative rounded-xl overflow-hidden mb-8 bg-gradient-to-r from-purple-600 to-indigo-600">
        <div className="absolute inset-0 opacity-20 bg-pattern-circuit" />
        <div className="relative z-10 px-6 py-12 md:py-20 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
            Coding Weird Stuff
          </h1>
          <p className="text-xl text-white/90 max-w-3xl mx-auto">
            Celebrating the art of writing creative code in strange and
            unexpected languages
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-gray-100 dark:bg-[#1a1a1a] p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold mb-3 text-cyan-600 dark:text-cyan-400">
          Against the Grain
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Sometimes the most interesting solutions come from using tools in ways
          they were never intended. This collection celebrates developers who
          push boundaries by creating impressive projects in unconventional
          languages and platforms. From games in Excel to animations in pure
          CSS, these projects demonstrate creativity, ingenuity, and a healthy
          disregard for conventional wisdom.
        </p>

        {/* Project Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {weirdProjects.map((project) => (
            <div
              key={project.id}
              className="bg-white dark:bg-[#0a0a0a] p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-purple-500 dark:hover:border-purple-500 transition-all duration-300 hover:shadow-lg"
            >
              <div className="flex items-center mb-3">
                <img
                  src={project.imageUrl}
                  width={48}
                  height={48}
                  alt={`${project.title} thumbnail`}
                  className="w-12 h-12 rounded-full mr-3 bg-gray-200 dark:bg-gray-800 object-cover"
                />
                <div>
                  <h3 className="text-lg font-semibold text-purple-600 dark:text-purple-400">
                    {project.title}
                  </h3>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {project.language}
                  </span>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                {project.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ASCII Generator Section */}
      <div className="mb-8">
        <Suspense
          fallback={
            <div className="p-4 text-center">Loading ASCII Generator...</div>
          }
        >
          <AsciiGenerator />
        </Suspense>
      </div>

      {/* About Section */}
      <div className="bg-gray-100 dark:bg-[#1a1a1a] p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-3 text-cyan-600 dark:text-cyan-400">
          Why Go Weird?
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          Exploring unconventional programming approaches helps expand our
          understanding of what&apos;s possible. These projects may not be
          practical for production, but they teach valuable lessons about
          problem-solving, constraints, and the fundamental concepts that
          underlie all programming languages.
        </p>
        <p className="text-gray-600 dark:text-gray-300">
          Have you created something weird and wonderful? We&apos;d love to see
          it!
        </p>
      </div>

      {/* Optional Footer */}
      <div className="mt-8 text-center text-gray-500 dark:text-gray-400 text-sm">
        Proudly hosted by APTlantis. Weird is the point.
      </div>
    </div>
  );
};

export default CodingWeirdStuffPage;

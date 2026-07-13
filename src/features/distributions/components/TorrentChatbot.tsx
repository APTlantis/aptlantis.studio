import { useState } from "react";
import type { Torrent } from "../data/torrentsLoader";

interface TorrentChatbotProps {
  torrents: Torrent[];
}

interface Message {
  role: "user" | "assistant";
  content: string;
  recommendations?: Torrent[];
}

/**
 * TorrentChatbot Component
 *
 * An AI-powered chatbot card that helps users discover and learn about Linux distro torrents.
 * Provides recommendations based on user needs and queries the torrent metadata.
 */
const TorrentChatbot = ({ torrents }: TorrentChatbotProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hi! I'm here to help you find the perfect Linux distro. What are you looking for?",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Quick action buttons for common queries
  const quickActions = [
    { label: "Lightweight distros", query: "lightweight" },
    { label: "Server distros", query: "server" },
    { label: "Beginner-friendly", query: "beginner" },
    { label: "Latest Raspbian", query: "raspbian latest" },
  ];

  // Simple recommendation engine based on keywords
  const getRecommendations = (query: string): Torrent[] => {
    const lowerQuery = query.toLowerCase();
    const keywords = lowerQuery.split(" ");

    // Score each torrent based on relevance
    const scoredTorrents = torrents.map((torrent) => {
      let score = 0;
      const fileName =
        torrent.torrent.files[0]?.path?.toLowerCase() ||
        torrent.filename.toLowerCase();
      const tags = torrent.aptlantis.tags?.join(" ").toLowerCase() || "";
      const combined = `${fileName} ${tags}`;

      // Keyword matching
      keywords.forEach((keyword) => {
        if (combined.includes(keyword)) score += 10;
      });

      // Boost recent torrents
      const creationDate = new Date(torrent.torrent.creation_date);
      const yearsDiff =
        (Date.now() - creationDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
      if (yearsDiff < 2) score += 5;
      if (yearsDiff < 1) score += 5;

      // Special handling for common queries
      if (lowerQuery.includes("lightweight") || lowerQuery.includes("small")) {
        if (torrent.size_bytes < 500 * 1024 * 1024) score += 15; // < 500MB
      }

      if (lowerQuery.includes("beginner") || lowerQuery.includes("easy")) {
        if (
          combined.includes("ubuntu") ||
          combined.includes("mint") ||
          combined.includes("debian")
        ) {
          score += 20;
        }
      }

      if (lowerQuery.includes("server")) {
        if (
          combined.includes("server") ||
          combined.includes("debian") ||
          combined.includes("ubuntu")
        ) {
          score += 15;
        }
      }

      if (
        lowerQuery.includes("raspberry") ||
        lowerQuery.includes("raspbian") ||
        lowerQuery.includes("pi")
      ) {
        if (combined.includes("raspbian") || combined.includes("raspberry")) {
          score += 25;
        }
      }

      if (
        lowerQuery.includes("latest") ||
        lowerQuery.includes("newest") ||
        lowerQuery.includes("recent")
      ) {
        if (yearsDiff < 1) score += 20;
        if (yearsDiff < 0.5) score += 10;
      }

      return { torrent, score };
    });

    // Filter and sort by score
    return scoredTorrents
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map((item) => item.torrent);
  };

  // Generate response based on query
  const generateResponse = (
    query: string,
    recommendations: Torrent[],
  ): string => {
    const lowerQuery = query.toLowerCase();

    if (recommendations.length === 0) {
      return "I couldn't find any torrents matching your criteria. Try rephrasing your question or use broader terms.";
    }

    let intro = "";
    if (lowerQuery.includes("lightweight") || lowerQuery.includes("small")) {
      intro =
        "Here are some lightweight distros that won't take up much space:";
    } else if (lowerQuery.includes("beginner") || lowerQuery.includes("easy")) {
      intro = "These distros are great for beginners:";
    } else if (lowerQuery.includes("server")) {
      intro = "Here are some solid choices for servers:";
    } else if (
      lowerQuery.includes("raspberry") ||
      lowerQuery.includes("raspbian") ||
      lowerQuery.includes("pi")
    ) {
      intro = "Found these Raspberry Pi distributions:";
    } else if (lowerQuery.includes("latest") || lowerQuery.includes("newest")) {
      intro = "Here are the most recent torrents:";
    } else {
      intro = `I found ${recommendations.length} torrent${recommendations.length > 1 ? "s" : ""} for you:`;
    }

    return intro;
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      role: "user",
      content: inputValue,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    const recommendations = getRecommendations(inputValue);
    const response = generateResponse(inputValue, recommendations);

    const assistantMessage: Message = {
      role: "assistant",
      content: response,
      recommendations: recommendations.length > 0 ? recommendations : undefined,
    };

    setMessages((prev) => [...prev, assistantMessage]);
    setIsLoading(false);
  };

  const handleQuickAction = (query: string) => {
    setInputValue(query);
    // Auto-send after a brief delay
    setTimeout(() => {
      const recommendations = getRecommendations(query);
      const response = generateResponse(query, recommendations);

      setMessages((prev) => [
        ...prev,
        { role: "user", content: query },
        {
          role: "assistant",
          content: response,
          recommendations:
            recommendations.length > 0 ? recommendations : undefined,
        },
      ]);
      setInputValue("");
    }, 100);
  };

  const formatFileSize = (bytes: number): string => {
    const mb = bytes / (1024 * 1024);
    const gb = bytes / (1024 * 1024 * 1024);
    return gb >= 1 ? `${gb.toFixed(2)} GB` : `${mb.toFixed(0)} MB`;
  };

  return (
    <div className="bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-gray-800 dark:to-gray-900 rounded-lg border-2 border-cyan-200 dark:border-cyan-800 shadow-lg overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-cyan-100/50 dark:hover:bg-gray-700/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center">
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
              />
            </svg>
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Torrent Assistant
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Ask me about Linux distros
            </p>
          </div>
        </div>
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? "rotate-180" : ""}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {/* Chat Content */}
      {isExpanded && (
        <div className="border-t border-cyan-200 dark:border-gray-700">
          {/* Messages */}
          <div className="h-96 overflow-y-auto p-4 space-y-4 bg-white dark:bg-gray-900">
            {messages.map((message, index) => (
              <div key={index}>
                <div
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-2 ${
                      message.role === "user"
                        ? "bg-cyan-600 text-white"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white"
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                  </div>
                </div>

                {/* Recommendations */}
                {message.recommendations &&
                  message.recommendations.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {message.recommendations.map((torrent, idx) => (
                        <div
                          key={idx}
                          className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700 hover:border-cyan-400 dark:hover:border-cyan-600 transition-colors"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                {torrent.torrent.files[0]?.path ||
                                  torrent.filename}
                              </p>
                              <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 dark:text-gray-400">
                                <span>
                                  {formatFileSize(torrent.size_bytes)}
                                </span>
                                <span>
                                  {new Date(
                                    torrent.torrent.creation_date,
                                  ).getFullYear()}
                                </span>
                              </div>
                            </div>
                            <a
                              href={torrent.download_urls[0]?.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1 text-xs bg-cyan-600 hover:bg-cyan-700 text-white rounded transition-colors flex-shrink-0"
                            >
                              Download
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 dark:bg-gray-800 rounded-lg px-4 py-2">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          {messages.length === 1 && (
            <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                Quick suggestions:
              </p>
              <div className="flex flex-wrap gap-2">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickAction(action.query)}
                    className="px-3 py-1.5 text-xs bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full border border-gray-300 dark:border-gray-600 hover:border-cyan-500 dark:hover:border-cyan-500 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 bg-gray-50 dark:bg-gray-800/50">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="Ask me anything about these torrents..."
                className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-400 text-white rounded-lg transition-colors disabled:cursor-not-allowed"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TorrentChatbot;

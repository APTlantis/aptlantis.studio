import { AlertCircle } from "./icons";
import { Link } from "react-router-dom";

/**
 * Props for the FallbackError component
 *
 * @interface FallbackErrorProps
 * @property {Error} [error] - Optional error object to display
 * @property {() => void} [resetErrorBoundary] - Optional function to reset the error boundary
 * @property {string} [message] - Optional custom error message to display
 */
interface FallbackErrorProps {
  error?: Error;
  resetErrorBoundary?: () => void;
  message?: string;
}

const FallbackError = ({
  error,
  resetErrorBoundary,
  message,
}: FallbackErrorProps) => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg max-w-2xl w-full border border-red-200 dark:border-red-800">
        <div className="flex items-center justify-center mb-4">
          <AlertCircle className="w-12 h-12 text-red-500" />
        </div>
        <h2 className="text-xl font-bold text-red-700 dark:text-red-400 mb-2">
          Something went wrong
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          {message ||
            "We're sorry, but an error occurred while loading this content."}
        </p>
        {error && (
          <div className="bg-white dark:bg-gray-800 p-4 rounded text-left overflow-auto max-h-48 mb-4">
            <p className="text-red-600 dark:text-red-400 font-mono text-sm whitespace-pre-wrap">
              {error.toString()}
            </p>
          </div>
        )}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => resetErrorBoundary?.() || window.location.reload()}
            className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded transition-colors"
          >
            Try Again
          </button>
          <Link
            to="/"
            className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 focus:ring-offset-[#0a0a0a]"
          >
            Go to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
};

export default FallbackError;

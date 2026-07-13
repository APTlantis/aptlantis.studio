import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertCircle } from "./icons";

/**
 * Props for the ErrorBoundary component
 *
 * @interface Props
 * @property {ReactNode} children - The components that this error boundary wraps
 * @property {ReactNode} [fallback] - Optional custom fallback UI to show when an error occurs
 */
interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * State for the ErrorBoundary component
 *
 * @interface State
 * @property {boolean} hasError - Whether an error has been caught
 * @property {Error | null} error - The error that was caught, if any
 * @property {ErrorInfo | null} errorInfo - Additional information about the error, if available
 */
interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * ErrorBoundary Component
 *
 * A React component that catches JavaScript errors anywhere in its child component tree,
 * logs those errors, and displays a fallback UI instead of the component tree that crashed.
 *
 * @extends {Component<Props, State>}
 */
class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  /**
   * Static method called when an error is thrown in a child component
   * Used to update the state so that the next render will show the fallback UI
   *
   * @static
   * @param {Error} error - The error that was thrown
   * @returns {State} New state with hasError set to true and the error
   */
  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error, errorInfo: null };
  }

  /**
   * Lifecycle method called after an error has been thrown by a descendant component
   * Used to log the error and update the state with error details
   *
   * @param {Error} error - The error that was thrown
   * @param {ErrorInfo} errorInfo - Additional information about the error
   * @returns {void}
   */
  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // You can also log the error to an error reporting service
    console.error("Uncaught error:", error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  /**
   * Renders either the children or a fallback UI if an error occurred
   *
   * @returns {ReactNode} The children or fallback UI
   */
  public render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
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
              We&apos;re sorry, but an error occurred while rendering this
              component.
            </p>
            <div className="bg-white dark:bg-gray-800 p-4 rounded text-left overflow-auto max-h-48 mb-4">
              <p className="text-red-600 dark:text-red-400 font-mono text-sm whitespace-pre-wrap">
                {this.state.error?.toString()}
              </p>
              {this.state.errorInfo && (
                <details className="mt-2">
                  <summary className="text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
                    Stack trace
                  </summary>
                  <p className="text-xs text-gray-600 dark:text-gray-400 font-mono whitespace-pre-wrap mt-2">
                    {this.state.errorInfo.componentStack}
                  </p>
                </details>
              )}
            </div>
            <button
              onClick={() => window.location.reload()}
              className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

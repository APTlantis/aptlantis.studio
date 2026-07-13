/**
 * LoadingSpinner Component
 *
 * A reusable loading spinner component that displays a centered, animated
 * circular spinner with the Aptlantis blue-slate scheme. Used to indicate loading states
 * throughout the application.
 *
 * @returns {JSX.Element} A loading spinner with an accessible text label
 */
const LoadingSpinner = () => {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="relative h-20 w-20">
        <div className="absolute left-0 top-0 h-full w-full rounded-full border-4 border-atl-ridge" />
        <div className="absolute left-0 top-0 h-full w-full animate-spin rounded-full border-4 border-transparent border-t-atl-archive" />
      </div>
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export default LoadingSpinner;

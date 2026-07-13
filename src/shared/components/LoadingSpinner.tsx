/**
 * LoadingSpinner Component
 *
 * A reusable loading spinner component that displays a centered, animated
 * circular spinner with a cyan color scheme. Used to indicate loading states
 * throughout the application.
 *
 * @returns {JSX.Element} A loading spinner with an accessible text label
 */
const LoadingSpinner = () => {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="relative w-20 h-20">
        <div className="absolute top-0 left-0 w-full h-full border-4 border-cyan-200 dark:border-cyan-900 rounded-full" />
        <div className="absolute top-0 left-0 w-full h-full border-4 border-transparent border-t-cyan-500 rounded-full animate-spin" />
      </div>
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export default LoadingSpinner;

import type { ReactNode } from "react";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";

interface ScreensaverContextType {
  isActive: boolean;
  activate: () => void;
  deactivate: () => void;
}

const ScreensaverContext = createContext<ScreensaverContextType | undefined>(
  undefined,
);

interface ScreensaverProviderProps {
  children: ReactNode;
  inactivityTimeout?: number; // in milliseconds
}

export const ScreensaverProvider: React.FC<ScreensaverProviderProps> = ({
  children,
  inactivityTimeout = 45000, // 45 seconds default
}) => {
  const [isActive, setIsActive] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Track when the screensaver was activated
  const activatedTimeRef = useRef<number | null>(null);

  const activate = useCallback(() => {
    setIsActive(true);
    // Record activation time in the activate function as well
    // This ensures it's set even if activated outside of resetTimer
    activatedTimeRef.current = Date.now();
  }, []);

  const deactivate = useCallback(() => {
    setIsActive(false);
    activatedTimeRef.current = null;
  }, []);

  const resetTimer = useCallback(() => {
    const currentTime = Date.now();

    // Only deactivate if screensaver is active AND it's been active for at least 1 second
    // This prevents immediate deactivation due to events triggered by the screensaver itself
    if (
      isActive &&
      activatedTimeRef.current &&
      currentTime - activatedTimeRef.current > 1000
    ) {
      deactivate();
      activatedTimeRef.current = null;
    }

    // Clear existing timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    // Set new timer
    timerRef.current = setTimeout(() => {
      activate();
      activatedTimeRef.current = Date.now(); // Record when the screensaver was activated
    }, inactivityTimeout);
  }, [isActive, inactivityTimeout, activate, deactivate]);

  // Set up event listeners for user activity
  useEffect(() => {
    const handleActivity = () => {
      resetTimer();
    };

    // Track various user activities
    window.addEventListener("mousemove", handleActivity);
    window.addEventListener("mousedown", handleActivity);
    window.addEventListener("keypress", handleActivity);
    window.addEventListener("touchstart", handleActivity);
    window.addEventListener("scroll", handleActivity);

    // Initial timer setup
    resetTimer();

    // Cleanup event listeners on unmount
    return () => {
      window.removeEventListener("mousemove", handleActivity);
      window.removeEventListener("mousedown", handleActivity);
      window.removeEventListener("keypress", handleActivity);
      window.removeEventListener("touchstart", handleActivity);
      window.removeEventListener("scroll", handleActivity);

      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [resetTimer]);

  // Handle keypress to exit screensaver
  useEffect(() => {
    const handleKeyPress = (_: KeyboardEvent) => {
      if (isActive) {
        deactivate();
      }
    };

    window.addEventListener("keydown", handleKeyPress);

    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [isActive, deactivate]);

  return (
    <ScreensaverContext.Provider value={{ isActive, activate, deactivate }}>
      {children}
    </ScreensaverContext.Provider>
  );
};

export const useScreensaver = (): ScreensaverContextType => {
  const context = useContext(ScreensaverContext);
  if (context === undefined) {
    throw new Error("useScreensaver must be used within a ScreensaverProvider");
  }
  return context;
};

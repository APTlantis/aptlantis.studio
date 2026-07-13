import { createContext, useContext, useEffect, type ReactNode } from "react";

interface ThemeContextType {
  theme: "dark";
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "dark",
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  toggleTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  // Always use dark theme
  const theme = "dark";

  // Apply dark theme to document when in browser
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.classList.remove("light");
      document.documentElement.classList.add("dark");
    }
  }, []);

  // No-op function since we're only using dark mode
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  const toggleTheme = () => {
    // Do nothing - we only support dark mode now
    // Theme toggling is disabled - only dark mode is supported
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

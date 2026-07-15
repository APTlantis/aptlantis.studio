import { Link, NavLink, useLocation } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import { Menu, X } from "./icons";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navItems = [
    { label: "Home", to: "/" },
    { label: "Projects", to: "/#projects" },
    { label: "Standards", to: "/project/cityhall" },
    { label: "SVG Lab", to: "/svg-lab" },
    { label: "Structra Lab", to: "/structra-lab" },
    { label: "About", to: "/about" },
  ];

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape" && isMenuOpen) {
        setIsMenuOpen(false);
      }
    },
    [isMenuOpen],
  );

  useEffect(() => {
    // Add event listener for keyboard navigation
    document.addEventListener("keydown", handleKeyDown);

    // Clean up event listener
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-atl-ridge/60 bg-atl-void/90 py-4 text-atl-archive backdrop-blur">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <div className="w-12 h-12 relative mr-3">
                <img
                  src="/logos/aptlantis-organization-mark.png"
                  width={48}
                  height={48}
                  alt="Aptlantis Logo"
                  className="h-full w-full rounded-full border border-atl-silver/60 object-cover shadow-lg shadow-atl-bluegray/20 brightness-110 contrast-110"
                />
              </div>
              <div>
                <h1 className="text-xl font-bold text-atl-archive">
                  Aptlantis
                </h1>
                <p className="atl-eyebrow text-[0.62rem]">
                  Project Teaching Studio
                </p>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav
            className="hidden md:flex items-center space-x-6 text-sm"
            aria-label="Main Navigation"
          >
            {navItems.map((item) => (
              <NavLink
                key={item.label}
                to={item.to}
                className={({ isActive }) => {
                  const active =
                    item.label === "Projects"
                      ? location.pathname === "/" &&
                        location.hash === "#projects"
                      : isActive && item.label !== "Projects";
                  return `rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-atl-silver focus:ring-offset-2 focus:ring-offset-atl-void ${
                    active
                      ? "text-atl-archive"
                      : "text-atl-silver hover:text-atl-archive"
                  }`;
                }}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden">
            <button
              id="mobile-menu-button"
              onClick={toggleMenu}
              className="rounded-md border border-atl-ridge bg-atl-abyss p-2 text-atl-silver"
              aria-label="Toggle menu"
              aria-expanded={isMenuOpen}
              aria-controls="mobile-menu"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav
            id="mobile-menu"
            className="mt-4 animate-fadeIn border-t border-atl-ridge py-4 md:hidden"
            aria-label="Mobile Navigation"
          >
            <div className="flex flex-col space-y-4">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  to={item.to}
                  className="rounded-md text-atl-silver transition-colors hover:text-atl-archive focus:outline-none focus:ring-2 focus:ring-atl-silver focus:ring-offset-2 focus:ring-offset-atl-void"
                  onClick={() => setIsMenuOpen(false)}
                  tabIndex={isMenuOpen ? 0 : -1}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;

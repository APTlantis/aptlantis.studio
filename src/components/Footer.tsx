import { Link } from "react-router-dom";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-atl-ridge/60 bg-atl-void/80 py-8 text-atl-archive">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <h2 className="text-xl font-bold text-atl-archive">Aptlantis</h2>
            <p className="atl-eyebrow text-[0.62rem]">
              Atlanta Studio project catalog
            </p>
          </div>

          <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-6 text-sm">
            {/* Museum link hidden until functionality is working */}
            {/* <Link to="/museum" className="text-gray-300 hover:text-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-[#0a0a0a] rounded-md transition-colors">
              Museum
            </Link> */}
            <Link
              to="/terms"
              className="rounded-md text-atl-silver transition-colors hover:text-atl-archive focus:outline-none focus:ring-2 focus:ring-atl-silver focus:ring-offset-2 focus:ring-offset-atl-void"
            >
              Terms of Service
            </Link>
            <Link
              to="/privacy"
              className="rounded-md text-atl-silver transition-colors hover:text-atl-archive focus:outline-none focus:ring-2 focus:ring-atl-silver focus:ring-offset-2 focus:ring-offset-atl-void"
            >
              Privacy Policy
            </Link>
          </div>
        </div>

        <div className="mt-8 border-t border-atl-ridge/50 pt-4 text-center text-sm text-atl-frost">
          <p>© {currentYear} Aptlantis. All rights reserved.</p>
          <p className="mt-1">
            Cataloging the tools, archives, and systems that create.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { HomePage } from "./features/home";
import LoadingSpinner from "./components/LoadingSpinner";
import ErrorBoundary from "./components/ErrorBoundary";
import { ToastProvider } from "./hooks/useToast";
import { ThemeProvider } from "./context/ThemeContext";
import { ScreensaverProvider } from "./context/ScreensaverContext";
import Screensaver from "./components/Screensaver";
import "./App.css";

// Lazy load non-critical pages for better performance
const AboutPage = lazy(() =>
  import("./features/about").then((module) => ({ default: module.AboutPage })),
);
const ContactPage = lazy(() =>
  import("./features/contact").then((module) => ({
    default: module.ContactPage,
  })),
);
const TermsPage = lazy(() =>
  import("./features/legal").then((module) => ({ default: module.TermsPage })),
);
const PrivacyPage = lazy(() =>
  import("./features/legal").then((module) => ({
    default: module.PrivacyPage,
  })),
);
const ProjectDetailPage = lazy(() =>
  import("./features/projects").then((module) => ({
    default: module.ProjectDetailPage,
  })),
);
const SVGLabPage = lazy(() =>
  import("./features/svg-lab").then((module) => ({
    default: module.SVGLabPage,
  })),
);
const StructraLabPage = lazy(() =>
  import("./features/structra-lab").then((module) => ({
    default: module.StructraLabPage,
  })),
);
const IRCServerPage = lazy(() =>
  import("./features/irc").then((module) => ({
    default: module.IRCServerPage,
  })),
);
const CodingWeirdStuffPage = lazy(() =>
  import("./features/coding-weird-stuff").then((module) => ({
    default: module.CodingWeirdStuffPage,
  })),
);
const LinuxGenealogyPage = lazy(() =>
  import("./features/linux-geneology").then((module) => ({
    default: module.LinuxGenealogyPage,
  })),
);

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <ToastProvider>
          <ScreensaverProvider>
            <Router>
              <div className="atl-shell flex min-h-screen flex-col text-atl-archive">
                <Header />
                <main className="flex-grow">
                  <ErrorBoundary>
                    <Suspense fallback={<LoadingSpinner />}>
                      <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/about" element={<AboutPage />} />
                        <Route path="/contact" element={<ContactPage />} />
                        <Route path="/terms" element={<TermsPage />} />
                        <Route path="/privacy" element={<PrivacyPage />} />
                        <Route
                          path="/project/:id"
                          element={<ProjectDetailPage />}
                        />
                        <Route path="/svg-lab" element={<SVGLabPage />} />
                        <Route
                          path="/structra-lab"
                          element={<StructraLabPage />}
                        />
                        <Route path="/irc" element={<IRCServerPage />} />
                        <Route
                          path="/coding-against-the-grain"
                          element={<CodingWeirdStuffPage />}
                        />
                        <Route
                          path="/coding-weird-stuff"
                          element={<CodingWeirdStuffPage />}
                        />
                        <Route
                          path="/linux-genealogy"
                          element={<LinuxGenealogyPage />}
                        />
                        <Route
                          path="/linux-geneology"
                          element={<LinuxGenealogyPage />}
                        />
                      </Routes>
                    </Suspense>
                  </ErrorBoundary>
                </main>
                <Footer />
                <Screensaver />
              </div>
            </Router>
          </ScreensaverProvider>
        </ToastProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;

import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import MetaTags from "../../../components/MetaTags";
import DistroCard from "../components/DistroCard";
import { useDistributions } from "../hooks/useDistributions";
import LoadingSpinner from "../components/LoadingSpinner";
import FallbackError from "../components/FallbackError";

/**
 * DistrosPage
 * A dedicated overview page that lists all distributions and emits a
 * CollectionPage JSON-LD with hasPart SoftwareApplication entries.
 */
const DistrosPage: React.FC = () => {
  const { items: distros, loading, error, source } = useDistributions();

  const collectionJsonLd = useMemo(() => {
    const hasPart = (distros || []).map((d) => ({
      "@type": "SoftwareApplication",
      name: d.title,
      operatingSystem: "Linux",
      url: `https://aptlantis.net/distro/${d.id}`,
    }));

    return {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "Linux Distribution Mirror Index",
      description:
        "Browse supported Linux distributions mirrored on Aptlantis.",
      hasPart,
    } as const;
  }, [distros]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <MetaTags
        title="APTlantis – Linux Distribution Mirror Index"
        description="Browse supported Linux distributions mirrored on APTlantis, with fast downloads and up-to-date repository snapshots."
        canonicalUrl="https://aptlantis.net/distros"
        ogTitle="Linux Distribution Mirror Index | APTlantis"
        ogDescription="Find and download Linux distributions from APTlantis high-speed mirrors."
        structuredData={[collectionJsonLd]}
      />

      {/* Breadcrumb */}
      <nav className="mb-6" aria-label="Breadcrumb">
        <ol className="inline-flex items-center space-x-1 md:space-x-3">
          <li className="inline-flex items-center">
            <Link
              to="/"
              className="text-gray-600 dark:text-gray-400 hover:text-cyan-600 dark:hover:text-cyan-400"
            >
              Home
            </Link>
          </li>
          <li className="inline-flex items-center text-gray-600 dark:text-gray-400">
            <span className="mx-1">/</span>
            <span>Distributions</span>
          </li>
        </ol>
      </nav>

      <header className="mb-6">
        <h1 className="text-3xl font-bold">Linux Distribution Mirror Index</h1>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          Explore all Linux distributions mirrored on APTlantis.
        </p>
      </header>

      {error && (
        <div className="mb-4">
          <FallbackError
            title="Failed to load distributions"
            message={error.message}
          />
        </div>
      )}

      {source === "fallback" && (
        <div className="mb-4 text-yellow-300">
          Using fallback static data (API offline)
        </div>
      )}

      <section>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {loading ? (
            <div className="col-span-full">
              <LoadingSpinner />
            </div>
          ) : (
            distros.map((d) => <DistroCard key={d.id} {...d} />)
          )}
        </div>
      </section>
    </div>
  );
};

export default DistrosPage;

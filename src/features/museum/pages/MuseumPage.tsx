import { useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { distros } from "../../distributions";
import { ChevronRight } from "../../../shared/icons";

const MuseumPage = () => {
  const [searchParams] = useSearchParams();
  const distroId = searchParams.get("distro");
  const navigate = useNavigate();

  // Filter museum distros
  const museumDistros = distros.filter((distro) => distro.isMuseum);

  useEffect(() => {
    // If a specific distro is requested, navigate to its detail page
    if (distroId) {
      const distro = distros.find((d) => d.id === distroId);
      if (distro && distro.isMuseum) {
        navigate(`/distro/${distroId}`);
      }
    }
  }, [distroId, navigate]);

  return (
    <div className="atl-container py-8">
      {/* Breadcrumb */}
      <div className="mb-6">
        <nav className="flex" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <Link to="/" className="text-atl-frost hover:text-atl-archive">
                Home
              </Link>
            </li>
            <li>
              <div className="flex items-center">
                <ChevronRight className="h-4 w-4 text-atl-frost" />
                <span className="ml-1 text-atl-frost md:ml-2">Museum</span>
              </div>
            </li>
          </ol>
        </nav>
      </div>

      {/* Header */}
      <div className="atl-panel atl-ornament mb-8 flex flex-col items-center gap-6 p-6 md:flex-row md:items-start">
        <div className="relative">
          <div className="atl-grid-dense grid h-40 w-40 place-items-center rounded-full border border-atl-silver/60 bg-atl-void/70 shadow-lg shadow-atl-bluegray/20">
            <span className="font-mono text-4xl font-black text-atl-archive">
              M
            </span>
          </div>
          <div
            className="absolute bottom-2 right-2 h-6 w-6 rounded-full border-2 border-atl-deep bg-atl-warning"
            title="Museum Collection"
          />
        </div>

        <div className="flex-1 text-center md:text-left">
          <h1 className="atl-title mb-2 text-4xl font-bold">Museum</h1>
          <p className="atl-subtitle mb-4 text-xl">
            Explore historical operating systems
          </p>
        </div>
      </div>

      {/* Museum dashboard */}
      <div className="atl-panel mb-8 p-6">
        <h2 className="mb-3 text-2xl font-semibold text-atl-archive">
          Museum Dashboard
        </h2>
        <p className="atl-subtitle mb-4">
          Welcome to the APTlantis Museum! Explore our collection of historical
          operating systems.
        </p>

        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {museumDistros.map((distro) => (
            <Link
              key={distro.id}
              to={`/distro/${distro.id}`}
              className="atl-card p-4 transition hover:border-atl-silver"
            >
              <div className="flex items-center mb-3">
                <img
                  src={distro.logoSrc || "/placeholder.svg"}
                  width={48}
                  height={48}
                  alt={`${distro.title} logo`}
                  className="mr-3 h-12 w-12 rounded-full border border-atl-ridge object-cover"
                />
                <h3 className="text-lg font-semibold text-atl-archive">
                  {distro.title}
                </h3>
              </div>
              <p className="atl-subtitle">{distro.description}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* About the Museum */}
      <div className="atl-card p-6">
        <h2 className="mb-3 text-2xl font-semibold text-atl-archive">
          About the Museum
        </h2>
        <p className="atl-subtitle mb-4">
          The APTlantis Museum is dedicated to preserving and showcasing
          historical operating systems that have made significant contributions
          to computing history. These systems may no longer be actively
          maintained, but they represent important milestones in the evolution
          of operating systems.
        </p>
        <p className="atl-subtitle">
          Each museum entry includes historical context, videos, articles, and
          downloadable ISO files for educational and archival purposes.
        </p>
      </div>
    </div>
  );
};

export default MuseumPage;

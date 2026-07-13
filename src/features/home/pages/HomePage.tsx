import { useEffect, useMemo, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import MetaTags from "../../../components/MetaTags";
import LoadingSpinner from "../../../components/LoadingSpinner";
import { loadPortfolio } from "../../projects/data/portfolioLoader";
import type { PortfolioData, ProjectRecord } from "../../projects/types";
import { PortfolioDashboard } from "../../projects/components/PortfolioDashboard";
import { ProjectCard } from "../../projects/components/ProjectBits";

const normalize = (value: string) => value.toLowerCase().trim();

const HomePage = () => {
  const [portfolio, setPortfolio] = useState<PortfolioData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [groupFilter, setGroupFilter] = useState("all");
  const [sortBy, setSortBy] = useState<
    "curated" | "completion-desc" | "completion-asc" | "name"
  >("curated");

  useEffect(() => {
    loadPortfolio()
      .then(setPortfolio)
      .catch((err) =>
        setError(
          err instanceof Error ? err.message : "Failed to load portfolio",
        ),
      );
  }, []);

  const statuses = useMemo(
    () => (portfolio ? Object.keys(portfolio.statusCounts).sort() : []),
    [portfolio],
  );
  const groups = useMemo(
    () => (portfolio ? Object.keys(portfolio.governanceCounts).sort() : []),
    [portfolio],
  );

  const projects = useMemo<ProjectRecord[]>(() => {
    if (!portfolio) return [];
    const query = normalize(searchQuery);
    return portfolio.projects
      .filter((project) => {
        const matchesStatus =
          statusFilter === "all" || project.status === statusFilter;
        const matchesGroup =
          groupFilter === "all" || project.governanceGroup === groupFilter;
        const text = normalize(
          [
            project.name,
            project.summary,
            project.ecosystemRole,
            project.governanceGroup,
            ...project.tags,
          ].join(" "),
        );
        return (
          matchesStatus && matchesGroup && (!query || text.includes(query))
        );
      })
      .sort((a, b) => {
        if (sortBy === "curated") {
          return (
            portfolio.projects.findIndex((project) => project.id === a.id) -
            portfolio.projects.findIndex((project) => project.id === b.id)
          );
        }
        if (sortBy === "name") return a.name.localeCompare(b.name);
        if (sortBy === "completion-asc")
          return a.completion - b.completion || a.name.localeCompare(b.name);
        return b.completion - a.completion || a.name.localeCompare(b.name);
      });
  }, [portfolio, searchQuery, statusFilter, groupFilter, sortBy]);

  if (error) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center text-white">
        <h1 className="text-3xl font-black">Portfolio data did not load</h1>
        <p className="mt-3 text-slate-300">{error}</p>
      </div>
    );
  }

  if (!portfolio) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen text-atl-archive">
      <MetaTags
        title="Aptlantis Project Portfolio"
        description="Evidence-led catalog of Aptlantis tools, standards, archives, and systems."
        canonicalUrl="https://aptlantis.studio/"
        ogTitle="Aptlantis Project Portfolio"
        ogDescription="Explore Aptlantis projects by governance, completion, capabilities, and operator evidence."
      />

      <main className="mx-auto max-w-7xl px-4 py-10">
        <section className="atl-panel atl-ornament mb-8 overflow-hidden">
          <div className="grid gap-0 lg:grid-cols-[0.92fr_1.08fr]">
            <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-10">
              <p className="atl-eyebrow">Aptlantis / Project Teaching Studio</p>
              <h1 className="atl-title atl-gradient-text atl-text-balance mt-4 text-4xl font-black sm:text-5xl lg:text-6xl">
                Deep Structure. Clear Insight.
              </h1>
              <p className="atl-subtitle mt-5 max-w-2xl text-sm sm:text-base">
                Evidence-led project pages, release posture, standards maps, and
                operator notes on a dark archival technical palette.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                <span className="atl-tag px-3 py-2">Archival</span>
                <span className="atl-tag px-3 py-2">Technical</span>
                <span className="atl-tag atl-tag-verified px-3 py-2">
                  Evidence First
                </span>
              </div>
            </div>
            <div className="min-h-[260px] border-t border-atl-ridge/50 lg:border-l lg:border-t-0">
              <img
                src="/theme/aptlantis-blue-slate-banner.png"
                alt="Aptlantis blue-slate banner with technical grid, maritime emblem, and metallic Aptlantis wordmark"
                className="h-full min-h-[260px] w-full object-cover object-center opacity-90"
              />
            </div>
          </div>
        </section>

        <PortfolioDashboard portfolio={portfolio} />

        <section id="projects" className="mt-10 scroll-mt-24">
          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <h1 className="atl-title text-4xl font-black text-atl-archive">
              All Available Projects
            </h1>
            <div className="flex flex-wrap gap-3">
              <label className="atl-card-soft flex min-h-[42px] items-center gap-2 px-3 text-sm text-atl-silver">
                <Search className="h-4 w-4 text-atl-mist" />
                <input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search projects..."
                  className="w-52 bg-transparent text-atl-archive outline-none placeholder:text-atl-smoke"
                />
              </label>
              <label className="atl-card-soft flex min-h-[42px] items-center gap-2 px-3 text-sm text-atl-silver">
                <SlidersHorizontal className="h-4 w-4 text-atl-mist" />
                <span className="font-bold">Sort</span>
                <select
                  value={sortBy}
                  onChange={(event) =>
                    setSortBy(event.target.value as typeof sortBy)
                  }
                  className="bg-atl-void text-atl-archive outline-none"
                >
                  <option value="curated">Curated order</option>
                  <option value="completion-desc">Completion high</option>
                  <option value="completion-asc">Completion low</option>
                  <option value="name">Name</option>
                </select>
              </label>
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="min-h-[42px] rounded-[8px] border border-atl-ridge bg-atl-abyss px-3 text-sm text-atl-archive outline-none"
              >
                <option value="all">All statuses</option>
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
              <select
                value={groupFilter}
                onChange={(event) => setGroupFilter(event.target.value)}
                className="min-h-[42px] rounded-[8px] border border-atl-ridge bg-atl-abyss px-3 text-sm text-atl-archive outline-none"
              >
                <option value="all">All groups</option>
                {groups.map((group) => (
                  <option key={group} value={group}>
                    {group}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {projects.length === 0 ? (
            <div className="atl-card p-10 text-center text-atl-silver">
              No projects match those filters.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
              {projects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default HomePage;

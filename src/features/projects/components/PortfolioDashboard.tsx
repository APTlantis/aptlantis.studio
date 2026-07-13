import { Link } from "react-router-dom";
import { ArrowUpRight, Info } from "lucide-react";
import type { PortfolioData } from "../types";

const CountPill = ({ label, value }: { label: string; value: number }) => (
  <div className="atl-card-soft px-4 py-3">
    <div className="text-2xl font-black text-atl-archive">{value}</div>
    <div className="text-xs font-semibold uppercase text-atl-frost">
      {label}
    </div>
  </div>
);

export const PortfolioDashboard = ({
  portfolio,
}: {
  portfolio: PortfolioData;
}) => {
  const governanceEntries = Object.entries(portfolio.governanceCounts).sort(
    (a, b) => b[1] - a[1],
  );
  const statusEntries = Object.entries(portfolio.statusCounts).sort(
    (a, b) => b[1] - a[1],
  );

  return (
    <section className="atl-panel p-6">
      <div className="mb-6 flex flex-wrap gap-2">
        <button className="atl-button px-4 py-2 text-sm">
          Project Operations
        </button>
        <button className="atl-button-ghost px-4 py-2 text-sm font-bold">
          Catalog Priorities
        </button>
      </div>

      <h2 className="atl-title mb-5 text-3xl font-black text-atl-archive">
        Project Operations
      </h2>

      <div className="grid gap-4 lg:grid-cols-[1.1fr_1fr]">
        <div className="atl-card p-5">
          <h3 className="mb-3 flex items-center gap-2 text-lg font-bold text-atl-silver">
            <Info className="h-5 w-5" />
            Portfolio Note
          </h3>
          <p className="text-sm font-bold text-atl-archive">
            Use evidence and operating shape, not README mirroring.
          </p>
          <p className="atl-muted mt-2 max-w-3xl text-sm leading-6">
            This catalog turns analyzer output into project teaching pages: what
            each system does, what is complete, what is blocked, and what an
            operator can do with it next.
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <CountPill label="Projects" value={portfolio.projectCount} />
            <CountPill
              label="Avg complete"
              value={Math.round(portfolio.averageCompletion)}
            />
            <CountPill label="Groups" value={governanceEntries.length} />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          <div className="atl-card-soft p-4">
            <h3 className="atl-eyebrow mb-3">By Governance</h3>
            <div className="space-y-2">
              {governanceEntries.map(([label, value]) => (
                <div
                  key={label}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-atl-silver">{label}</span>
                  <span className="font-bold text-atl-archive">{value}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="atl-card-soft p-4">
            <h3 className="atl-eyebrow mb-3">By Status</h3>
            <div className="grid grid-cols-2 gap-2">
              {statusEntries.slice(0, 8).map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-[6px] border border-atl-ridge/70 bg-atl-void/70 px-3 py-2 text-sm"
                >
                  <span className="text-atl-silver">{label}</span>
                  <span className="float-right font-bold text-atl-archive">
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <h3 className="mb-3 text-lg font-bold text-atl-archive">
          Project Links
        </h3>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {portfolio.topPriorities.slice(0, 4).map((priority) => (
            <Link
              key={priority.id}
              to={`/project/${priority.id}`}
              className="atl-card-soft p-4 no-underline transition hover:border-atl-silver/70"
            >
              <h4 className="flex items-center gap-2 font-bold text-atl-silver">
                {priority.name}
                <ArrowUpRight className="h-4 w-4" />
              </h4>
              <p className="atl-muted mt-2 line-clamp-3 text-sm leading-6">
                {priority.next}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

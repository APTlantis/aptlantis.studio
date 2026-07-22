import type { CSSProperties, ReactNode } from "react";
import { Link } from "react-router-dom";
import MetaTags from "../../../components/MetaTags";
import type { ProjectRecord } from "../types";
import { CopyButton } from "./ProjectBits";

export type DossierTone =
  | "cyan"
  | "teal"
  | "amber"
  | "violet"
  | "green"
  | "blue"
  | "rose";

export const dossierToneClasses: Record<DossierTone, string> = {
  cyan: "text-cyan-300 border-cyan-300/25 bg-cyan-300/10",
  teal: "text-teal-300 border-teal-300/25 bg-teal-300/10",
  amber: "text-amber-300 border-amber-300/25 bg-amber-300/10",
  violet: "text-violet-300 border-violet-300/25 bg-violet-300/10",
  green: "text-emerald-300 border-emerald-300/25 bg-emerald-300/10",
  blue: "text-sky-300 border-sky-300/25 bg-sky-300/10",
  rose: "text-rose-300 border-rose-300/25 bg-rose-300/10",
};

export const dossierToneText = (tone: DossierTone) =>
  dossierToneClasses[tone].split(" ")[0];

export const MaterialIcon = ({
  name,
  className = "",
}: {
  name: string;
  className?: string;
}) => (
  <span className={`material-symbols-outlined ${className}`} aria-hidden="true">
    {name}
  </span>
);

export const DossierSectionTitle = ({
  icon,
  title,
  tone = "cyan",
}: {
  icon: string;
  title: string;
  tone?: DossierTone;
}) => (
  <h3 className="mb-4 flex items-center gap-2 text-xl font-bold">
    <span
      className={`grid h-8 w-8 place-items-center rounded-[6px] border ${dossierToneClasses[tone]}`}
    >
      <MaterialIcon name={icon} />
    </span>
    {title}
  </h3>
);

export const DossierList = ({
  title,
  icon,
  tone,
  itemIcon = "check_circle",
  items,
}: {
  title: string;
  icon: string;
  tone: DossierTone;
  itemIcon?: string;
  items: string[];
}) => (
  <section className="dossier-card p-5">
    <DossierSectionTitle icon={icon} title={title} tone={tone} />
    <div className="space-y-2">
      {items.map((item) => (
        <div
          key={item}
          className="flex min-h-9 items-center gap-3 rounded-[6px] border border-cyan-100/12 bg-slate-950/25 px-3 py-2 text-sm text-atl-silver"
        >
          <MaterialIcon name={itemIcon} className={dossierToneText(tone)} />
          <span>{item}</span>
        </div>
      ))}
    </div>
  </section>
);

export const DossierStat = ({
  label,
  value,
  icon,
  tone,
}: {
  label: string;
  value: string;
  icon: string;
  tone: DossierTone;
}) => (
  <div className="rounded-[8px] border border-cyan-100/15 bg-slate-950/25 p-4">
    <MaterialIcon
      name={icon}
      className={`mb-3 text-2xl ${dossierToneText(tone)}`}
    />
    <div className="text-xs uppercase text-atl-frost">{label}</div>
    <div className="mt-1 text-lg font-black text-atl-archive">{value}</div>
  </div>
);

export interface DossierTabItem {
  id: string;
  label: string;
  icon: string;
}

export interface DossierBadge {
  label: string;
  tone: DossierTone;
}

export interface DossierFact {
  label: string;
  value: string;
  icon: string;
}

export interface DossierLink {
  label: string;
  url: string;
}

export const DossierProjectShell = ({
  project,
  activeTab,
  tabs,
  badges,
  metadata,
  statusRows,
  links,
  heroImageSrc,
  evidenceTabId,
  children,
  onTabChange,
}: {
  project: ProjectRecord;
  activeTab: string;
  tabs: DossierTabItem[];
  badges: DossierBadge[];
  metadata: DossierFact[];
  statusRows: Array<[string, string]>;
  links: DossierLink[];
  heroImageSrc: string;
  evidenceTabId?: string;
  children: ReactNode;
  onTabChange: (tab: string) => void;
}) => (
  <div className="dossier-shell min-h-screen text-atl-archive">
    <MetaTags
      title={`${project.name} | Aptlantis Project Portfolio`}
      description={project.summary}
      canonicalUrl={`https://aptlantis.studio/project/${project.id}`}
      ogTitle={`${project.name} | Aptlantis`}
      ogDescription={project.summary}
      ogImage={project.logoSrc}
    />

    <main className="mx-auto max-w-[1860px] px-4 py-5 md:px-8">
      <nav
        className="mb-4 flex items-center gap-2 text-sm text-cyan-300/80"
        aria-label="Breadcrumb"
      >
        <Link to="/" className="hover:text-cyan-100">
          Home
        </Link>
        <MaterialIcon name="chevron_right" className="text-base" />
        <Link to="/#projects" className="hover:text-cyan-100">
          Projects
        </Link>
        <MaterialIcon name="chevron_right" className="text-base" />
        <span className="text-atl-silver">{project.name}</span>
      </nav>

      <header
        className="dossier-hero mb-5 overflow-hidden rounded-[8px] border border-cyan-100/35"
        style={
          {
            "--dossier-hero-image": `url("${heroImageSrc}")`,
          } as CSSProperties
        }
      >
        <div className="grid min-h-[430px] gap-8 p-8 lg:grid-cols-[260px_1fr]">
          <img
            src={project.logoSrc}
            alt={`${project.name} logo`}
            className="h-56 w-56 self-start rounded-[8px] border border-cyan-100/35 bg-slate-950/60 object-cover shadow-2xl shadow-cyan-950/60"
          />
          <div className="max-w-3xl self-center">
            <div className="mb-5 flex flex-wrap gap-2">
              {badges.map((badge) => (
                <span
                  key={badge.label}
                  className={`rounded-[4px] border px-3 py-1 text-xs font-black uppercase ${dossierToneClasses[badge.tone]}`}
                >
                  {badge.label}
                </span>
              ))}
            </div>
            <h1 className="atl-title text-5xl font-black md:text-6xl">
              {project.name}
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-7 text-atl-silver">
              {project.summary}
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              {project.repoUrl && (
                <a
                  href={project.repoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-10 items-center gap-2 rounded-[8px] border border-cyan-300/60 bg-cyan-300/15 px-5 text-sm font-bold text-cyan-100 no-underline"
                >
                  View Project
                  <MaterialIcon name="open_in_new" />
                </a>
              )}
              <CopyButton text={project.cloneCommand} label="Copy git clone" />
            </div>
          </div>
        </div>

        <div className="grid gap-3 border-t border-cyan-100/15 bg-slate-950/35 px-8 py-5 sm:grid-cols-2 lg:grid-cols-5">
          {metadata.map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-3 border-cyan-100/12 lg:border-r"
            >
              <MaterialIcon
                name={item.icon}
                className="text-2xl text-cyan-300"
              />
              <div>
                <div className="text-xs text-atl-frost">{item.label}</div>
                <div className="text-sm font-black text-atl-archive">
                  {item.value}
                </div>
              </div>
            </div>
          ))}
        </div>
      </header>

      <div className="mb-4 flex flex-wrap gap-1 border-b border-cyan-100/15">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={`inline-flex min-h-11 items-center gap-2 border-b-2 px-4 text-sm transition ${
              activeTab === tab.id
                ? "border-cyan-300 text-cyan-100"
                : "border-transparent text-atl-frost hover:text-atl-archive"
            }`}
          >
            <MaterialIcon name={tab.icon} />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_420px]">
        {children}

        <aside className="space-y-4">
          <section className="dossier-card p-5">
            <h2 className="mb-3 text-xl font-bold">Status at a Glance</h2>
            <dl className="overflow-hidden rounded-[6px] border border-cyan-100/12 text-sm">
              {statusRows.map(([label, value]) => (
                <div
                  key={label}
                  className="grid grid-cols-[1fr_1.05fr] border-b border-cyan-100/10 last:border-b-0"
                >
                  <dt className="px-3 py-2 text-atl-frost">{label}</dt>
                  <dd className="border-l border-cyan-100/10 px-3 py-2 text-right text-atl-archive">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
            {evidenceTabId && (
              <button
                type="button"
                onClick={() => onTabChange(evidenceTabId)}
                className="mt-3 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-[6px] border border-cyan-300/30 bg-cyan-300/10 text-sm text-cyan-100"
              >
                View Execution Evidence
                <MaterialIcon name="chevron_right" />
              </button>
            )}
          </section>

          <section className="dossier-card p-5">
            <h2 className="mb-3 text-xl font-bold">Project Links</h2>
            <div className="space-y-1">
              {links.map((link) => (
                <a
                  key={link.label}
                  href={link.url}
                  target={link.url.startsWith("http") ? "_blank" : undefined}
                  rel={link.url.startsWith("http") ? "noreferrer" : undefined}
                  className="grid grid-cols-[115px_1fr_24px] items-center rounded-[6px] border border-transparent px-2 py-2 text-sm text-atl-silver no-underline hover:border-cyan-100/15 hover:bg-slate-950/25"
                >
                  <span>{link.label}</span>
                  <span className="truncate text-cyan-300">{link.url}</span>
                  <MaterialIcon name="open_in_new" />
                </a>
              ))}
            </div>
          </section>

          <section className="dossier-card p-5">
            <h2 className="mb-4 text-xl font-bold">Maintainers</h2>
            <div className="flex items-center gap-4">
              <img
                src="/logos/aptlantis-organization-mark.png"
                alt="Aptlantis mark"
                className="h-14 w-14 rounded-full border border-cyan-100/30 object-cover"
              />
              <div>
                <div className="font-bold">Aptlantis Studio</div>
                <Link to="/contact" className="text-sm text-cyan-300">
                  Contact maintainers
                </Link>
              </div>
              <span className="ml-auto rounded-[4px] border border-cyan-300/40 px-2 py-1 text-xs text-cyan-200">
                LEAD
              </span>
            </div>
          </section>
        </aside>
      </div>
    </main>
  </div>
);

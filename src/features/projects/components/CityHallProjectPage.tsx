import { Link } from "react-router-dom";
import MetaTags from "../../../components/MetaTags";
import type { FrameworkNode, PortfolioData, ProjectRecord } from "../types";
import { CodeBlock } from "./CodeBlock";
import {
  DossierList,
  DossierSectionTitle,
  MaterialIcon,
  type DossierTone,
  dossierToneText,
} from "./DossierPrimitives";
import { CopyButton } from "./ProjectBits";

type Tab = string;

const cityHallTabIcons: Record<string, string> = {
  overview: "map",
  standards: "account_tree",
  workflows: "schema",
  templates: "article",
  relationships: "hub",
  changes: "history",
  "downloads-templates": "download",
};

const downloadTextFile = (
  filename: string,
  content: string,
  type = "application/json",
) => {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
};

const standardTone = (node: FrameworkNode): DossierTone => {
  if (["drs", "wds", "pps"].includes(node.id)) return "amber";
  if (["aamhs", "cts"].includes(node.id)) return "green";
  if (["neonink", "blue-slate", "sesm"].includes(node.id)) return "violet";
  return "cyan";
};

const StandardRegistryCard = ({ node }: { node: FrameworkNode }) => {
  const tone = standardTone(node);
  return (
    <article className="dossier-card flex min-h-[230px] flex-col p-5">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h3 className={`text-2xl font-black ${dossierToneText(tone)}`}>
            {node.abbreviation}
          </h3>
          <p className="mt-1 text-base font-semibold text-atl-archive">
            {node.title}
          </p>
        </div>
        <div className="flex flex-wrap justify-end gap-1.5 text-[11px]">
          <span className="rounded-[4px] border border-cyan-300/25 px-2 py-1 text-cyan-200">
            v{node.version}
          </span>
          <span className="rounded-[4px] border border-emerald-300/25 px-2 py-1 uppercase text-emerald-200">
            {node.status}
          </span>
        </div>
      </div>
      <p className="text-sm leading-6 text-atl-silver">{node.description}</p>
      <div className="mt-4 grid gap-1 border-t border-cyan-100/10 pt-3 text-xs text-atl-frost">
        <span>Schema: {node.schema || "not declared"}</span>
        <span>Templates: {node.templates.length}</span>
        <span>Validators: {node.validators.length}</span>
      </div>
      <div className="mt-auto flex flex-wrap gap-3 pt-4 text-sm">
        <span className={dossierToneText(tone)}>View standard</span>
        {node.schema && <span className="text-atl-silver">Schema</span>}
        {node.templates.length > 0 && (
          <span className="text-atl-silver">Templates</span>
        )}
      </div>
    </article>
  );
};

export const CityHallProjectPage = ({
  project,
  portfolio,
  activeTab,
  setActiveTab,
}: {
  project: ProjectRecord;
  portfolio: PortfolioData;
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
}) => {
  const suite = project.frameworkSuite;
  const nodes = suite?.nodes || [];
  const resourceKits = suite?.resourceKits || [];
  const generatedDate = new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(portfolio.generatedAt));
  const templateCount =
    nodes.reduce((total, node) => total + node.templates.length, 0) +
    resourceKits.reduce((total, kit) => total + kit.templates.length, 0);
  const schemaCount = nodes.filter((node) => node.schema).length;
  const validatorCount = nodes.reduce(
    (total, node) => total + node.validators.length,
    0,
  );
  const tabs = [
    { id: "overview", label: "Map" },
    { id: "standards", label: "Standards" },
    { id: "workflows", label: "Workflows" },
    { id: "templates", label: "Templates" },
    { id: "relationships", label: "Relationships" },
    { id: "changes", label: "Changes" },
    { id: "downloads-templates", label: "Downloads" },
  ].map((tab) => ({ ...tab, icon: cityHallTabIcons[tab.id] }));
  const standardsHealth = [
    ["Standards Documented", 100, "cyan"],
    ["Standards Versioned", 100, "green"],
    [
      "Standards w/ Examples",
      Math.round(
        (nodes.filter((node) => node.examples.length > 0).length /
          Math.max(nodes.length, 1)) *
          100,
      ),
      "teal",
    ],
    [
      "Standards w/ Validators",
      Math.round(
        (nodes.filter((node) => node.validators.length > 0).length /
          Math.max(nodes.length, 1)) *
          100,
      ),
      "amber",
    ],
  ] as const;
  const nodeById = new Map(nodes.map((node) => [node.id, node]));
  const coreNodes = ["wgs", "aamhs", "cts", "drs", "wds", "pps"]
    .map((id) => nodeById.get(id))
    .filter(Boolean) as FrameworkNode[];
  const standardCards = [
    ...coreNodes,
    ...nodes.filter((node) => !coreNodes.includes(node)),
  ];
  const districts = [
    {
      title: "Governance & Orientation",
      icon: "account_balance",
      tone: "cyan" as DossierTone,
      items: ["WGS", "Blue Slate", "NeonInk"],
      body: "Workspace placement, shared design language, visual systems, and orientation records.",
    },
    {
      title: "Project Creation",
      icon: "edit_document",
      tone: "violet" as DossierTone,
      items: ["PPS", "Blanks"],
      body: "Proposal intent, starter manifests, templates, README blanks, and project creation records.",
    },
    {
      title: "Delivery & Release",
      icon: "rocket_launch",
      tone: "amber" as DossierTone,
      items: ["DRS", "CTS", "WDS"],
      body: "Desktop releases, command tools, websites, deployment records, and release mechanics.",
    },
    {
      title: "Integrity & Preservation",
      icon: "verified_user",
      tone: "green" as DossierTone,
      items: ["AAMHS"],
      body: "Archive verification, preservation hash manifests, provenance, and integrity records.",
    },
    {
      title: "Visual & Semantic Systems",
      icon: "visibility",
      tone: "blue" as DossierTone,
      items: ["SESM", "NeonInk", "Blue Slate"],
      body: "Semantic SVG metadata, UI profiles, theme contracts, diagrams, and asset context.",
    },
  ];
  const quickActions = [
    ["Start or Register a Project", "flag"],
    ["Prepare a Release", "inventory"],
    ["Register a Tool or Command", "terminal"],
    ["Publish a Website", "language"],
    ["Create an Archive Record", "archive"],
  ] as const;

  const renderSideRail = () => (
    <aside className="space-y-4">
      <section className="dossier-card p-5">
        <DossierSectionTitle
          icon="monitoring"
          title="System Status"
          tone="cyan"
        />
        <dl className="space-y-2 text-sm">
          {[
            ["Active Standards", nodes.length],
            ["Resource Kits", resourceKits.length],
            ["Templates", templateCount],
            ["Schemas", schemaCount],
            ["Standards w/ Validators", validatorCount],
            ["Last Review", generatedDate],
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between gap-4">
              <dt className="text-atl-silver">{label}</dt>
              <dd className="font-bold text-atl-archive">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="dossier-card p-5">
        <DossierSectionTitle
          icon="donut_large"
          title="Governance Health"
          tone="green"
        />
        <div className="space-y-3">
          {standardsHealth.map(([label, value, tone]) => (
            <div key={label}>
              <div className="mb-1 flex justify-between text-sm">
                <span className="text-atl-silver">{label}</span>
                <span className="font-bold text-atl-archive">{value}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-950/70">
                <div
                  className={`h-full rounded-full ${
                    tone === "green"
                      ? "bg-emerald-300"
                      : tone === "teal"
                        ? "bg-teal-300"
                        : tone === "amber"
                          ? "bg-amber-300"
                          : "bg-cyan-300"
                  }`}
                  style={{ width: `${value}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="dossier-card p-5">
        <DossierSectionTitle icon="bolt" title="Quick Actions" tone="teal" />
        <div className="space-y-2">
          {quickActions.map(([label, icon]) => (
            <button
              type="button"
              key={label}
              className="flex min-h-11 w-full items-center gap-3 rounded-[6px] border border-cyan-100/12 bg-slate-950/25 px-3 text-left text-sm text-atl-silver"
            >
              <MaterialIcon name={icon} className="text-cyan-300" />
              <span>{label}</span>
              <MaterialIcon name="chevron_right" className="ml-auto" />
            </button>
          ))}
        </div>
      </section>

      <section className="dossier-card p-5">
        <DossierSectionTitle icon="link" title="Related Links" tone="blue" />
        <div className="space-y-2 text-sm">
          {[
            "Standards Index",
            "Templates Library",
            "Change Log",
            "Architecture Overview",
          ].map((label) => (
            <div
              key={label}
              className="flex items-center justify-between rounded-[6px] border border-cyan-100/12 bg-slate-950/25 px-3 py-2 text-atl-silver"
            >
              <span>{label}</span>
              <MaterialIcon name="open_in_new" className="text-cyan-300" />
            </div>
          ))}
        </div>
      </section>
    </aside>
  );

  const renderTab = () => {
    if (activeTab === "standards") {
      return (
        <section className="dossier-card p-5">
          <DossierSectionTitle
            icon="account_tree"
            title="Standards Registry"
            tone="cyan"
          />
          <p className="mb-4 max-w-4xl text-sm leading-6 text-atl-silver">
            Authoritative standards and resource kits that define how Aptlantis
            projects are created, governed, built, released, and preserved.
          </p>
          <div className="grid gap-4 xl:grid-cols-3">
            {standardCards.map((node) => (
              <StandardRegistryCard key={node.id} node={node} />
            ))}
            {resourceKits.map((kit) => (
              <article key={kit.id} className="dossier-card p-5">
                <h3 className="text-2xl font-black text-violet-300">
                  {kit.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-atl-silver">
                  {kit.description}
                </p>
                <div className="mt-4 text-xs text-atl-frost">
                  Templates: {kit.templates.length}
                </div>
              </article>
            ))}
          </div>
        </section>
      );
    }

    if (activeTab === "workflows") {
      return (
        <section className="dossier-card p-5">
          <DossierSectionTitle
            icon="schema"
            title="Common Workflows"
            tone="amber"
          />
          <div className="grid gap-4 xl:grid-cols-2">
            {(suite?.usagePatterns || []).map((pattern) => (
              <article
                key={pattern.title}
                className="rounded-[8px] border border-cyan-100/15 bg-slate-950/25 p-4"
              >
                <h3 className="text-lg font-black text-atl-archive">
                  {pattern.title}
                </h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  {pattern.appliesTo.map((standard) => (
                    <span
                      key={standard}
                      className="rounded-[4px] border border-amber-300/25 px-2 py-1 text-xs text-amber-200"
                    >
                      {standard}
                    </span>
                  ))}
                </div>
                <ol className="mt-4 space-y-2 text-sm leading-6 text-atl-silver">
                  {pattern.steps.map((step) => (
                    <li key={step} className="flex gap-2">
                      <MaterialIcon
                        name="check_circle"
                        className="mt-1 text-emerald-300"
                      />
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </article>
            ))}
          </div>
        </section>
      );
    }

    if (activeTab === "templates") {
      const templateRows = [
        ...nodes.flatMap((node) =>
          node.templates.map((template) => ({
            owner: node.abbreviation,
            template,
            tone: "cyan" as DossierTone,
          })),
        ),
        ...resourceKits.flatMap((kit) =>
          kit.templates.map((template) => ({
            owner: kit.title,
            template,
            tone: "violet" as DossierTone,
          })),
        ),
      ];
      return (
        <section className="dossier-card p-5">
          <DossierSectionTitle
            icon="article"
            title="Template Library"
            tone="violet"
          />
          <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
            {templateRows.map((row) => (
              <div
                key={`${row.owner}-${row.template}`}
                className="flex min-h-10 items-center gap-3 rounded-[6px] border border-cyan-100/12 bg-slate-950/25 px-3 py-2 text-sm text-atl-silver"
              >
                <MaterialIcon
                  name="description"
                  className={dossierToneText(row.tone)}
                />
                <span className="font-bold text-atl-archive">{row.owner}</span>
                <span className="truncate">{row.template}</span>
              </div>
            ))}
          </div>
        </section>
      );
    }

    if (activeTab === "relationships") {
      return (
        <div className="space-y-4">
          <section className="dossier-card p-5">
            <DossierSectionTitle
              icon="hub"
              title="Standards Relationships"
              tone="blue"
            />
            <CodeBlock
              code={suite?.mermaid.operatingModel || "flowchart LR"}
              language="mermaid"
            />
          </section>
          <section className="dossier-card p-5">
            <DossierSectionTitle
              icon="share"
              title="Relationship Records"
              tone="cyan"
            />
            <div className="grid gap-2 xl:grid-cols-2">
              {(suite?.relationships || []).map((relationship) => (
                <div
                  key={`${relationship.source}-${relationship.target}-${relationship.type}`}
                  className="rounded-[6px] border border-cyan-100/12 bg-slate-950/25 p-3 text-sm text-atl-silver"
                >
                  <span className="font-bold text-cyan-200">
                    {relationship.source.toUpperCase()}
                  </span>{" "}
                  <span className="text-atl-frost">{relationship.type}</span>{" "}
                  <span className="font-bold text-violet-200">
                    {relationship.target.toUpperCase()}
                  </span>
                  <p className="mt-1 text-atl-frost">{relationship.label}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      );
    }

    if (activeTab === "changes") {
      return (
        <div className="grid gap-4 xl:grid-cols-2">
          <DossierList
            title="Recent Governance Changes"
            icon="history"
            tone="cyan"
            items={[
              "WGS v0.2.7 clarified workspace registration and lifecycle visibility.",
              "AAMHS v1.0.3 expanded manifest hash and provenance rules.",
              "CTS v0.2.1 records command contract expectations.",
              "DRS v1.0.2 added installer evidence requirements.",
              "SESM v0.3.0 expanded safe-profile and metadata guidance.",
            ]}
          />
          <DossierList
            title="Known Governance Gaps"
            icon="warning"
            tone="rose"
            itemIcon="error"
            items={project.missingPieces}
          />
        </div>
      );
    }

    if (activeTab === "downloads-templates") {
      return (
        <div className="grid gap-4 xl:grid-cols-2">
          <section className="dossier-card p-5">
            <DossierSectionTitle
              icon="download"
              title="Download Registry Data"
              tone="cyan"
            />
            <p className="mb-4 text-sm leading-6 text-atl-silver">
              Export the current public CityHall dataset for local inspection or
              agent-readable analysis.
            </p>
            <button
              type="button"
              onClick={() =>
                downloadTextFile(
                  "cityhall-framework-suite.json",
                  JSON.stringify(suite, null, 2),
                )
              }
              className="inline-flex min-h-10 items-center gap-2 rounded-[8px] border border-cyan-300/60 bg-cyan-300/15 px-5 text-sm font-bold text-cyan-100"
            >
              Download framework suite <MaterialIcon name="download" />
            </button>
          </section>
          <DossierList
            title="Documentation Outputs"
            icon="library_books"
            tone="blue"
            items={project.documentationOutputs}
          />
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <section className="dossier-card atl-ornament p-6">
          <div className="grid items-center gap-5 md:grid-cols-[150px_1fr]">
            <img
              src={project.logoSrc}
              alt=""
              className="mx-auto h-28 w-28 object-contain opacity-90"
            />
            <div>
              <p className="atl-eyebrow">Aptlantis Governing Principle</p>
              <blockquote className="mt-4 text-2xl leading-9 text-atl-archive">
                Projects create artifacts. Standards govern projects. WGS
                governs the workspace.
              </blockquote>
              <p className="mt-3 text-sm leading-6 text-atl-silver">
                CityHall governs how Aptlantis projects are proposed,
                structured, developed, released, verified, preserved, and
                interpreted.
              </p>
            </div>
          </div>
        </section>

        <section className="dossier-card p-5">
          <DossierSectionTitle
            icon="explore"
            title="Governance Districts"
            tone="cyan"
          />
          <div className="grid gap-4 xl:grid-cols-5">
            {districts.map((district) => (
              <article
                key={district.title}
                className="rounded-[8px] border border-current/30 bg-slate-950/25 p-4"
              >
                <MaterialIcon
                  name={district.icon}
                  className={`text-4xl ${dossierToneText(district.tone)}`}
                />
                <h3 className="mt-4 text-lg font-black text-atl-archive">
                  {district.title}
                </h3>
                <p className="mt-2 min-h-[72px] text-sm leading-6 text-atl-silver">
                  {district.body}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {district.items.map((item) => (
                    <span
                      key={item}
                      className={`rounded-[4px] border border-current/30 px-2 py-1 text-xs ${dossierToneText(
                        district.tone,
                      )}`}
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="dossier-card p-5">
          <DossierSectionTitle
            icon="account_tree"
            title="Authority Chain"
            tone="blue"
          />
          <div className="grid gap-3 md:grid-cols-5">
            {[
              ["Workspace", "The Aptlantis workspace", "public"],
              ["City Hall", "Central governance hub", "account_balance"],
              ["Governing Standards", "Normative rules and guidance", "policy"],
              [
                "Project Manifests & Templates",
                "Implementation records",
                "description",
              ],
              [
                "Project Artifacts & Evidence",
                "Outputs and verification",
                "inventory_2",
              ],
            ].map(([title, body, icon]) => (
              <article
                key={title}
                className="rounded-[8px] border border-cyan-100/15 bg-slate-950/25 p-4 text-center"
              >
                <MaterialIcon name={icon} className="text-4xl text-cyan-300" />
                <h3 className="mt-3 font-black text-atl-archive">{title}</h3>
                <p className="mt-2 text-xs leading-5 text-atl-frost">{body}</p>
              </article>
            ))}
          </div>
        </section>

        <div className="grid gap-4 xl:grid-cols-2">
          <DossierList
            title="Quick Registry Preview"
            icon="fact_check"
            tone="green"
            items={nodes
              .slice(0, 8)
              .map((node) => `${node.abbreviation} - ${node.title}`)}
          />
          <DossierList
            title="Next Governance Work"
            icon="playlist_add_check"
            tone="amber"
            items={project.nextSteps}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="dossier-shell min-h-screen text-atl-archive">
      <MetaTags
        title={`${project.name} | Aptlantis Standards Hub`}
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

        <header className="dossier-card mb-5 overflow-hidden">
          <div className="grid gap-6 p-6 lg:grid-cols-[190px_1fr_520px]">
            <img
              src={project.logoSrc}
              alt={`${project.name} logo`}
              className="h-40 w-40 rounded-[8px] border border-cyan-100/35 bg-slate-950/60 object-cover shadow-2xl shadow-cyan-950/60"
            />
            <div className="self-center">
              <div className="mb-3 flex flex-wrap gap-2">
                <span className="rounded-[4px] border border-emerald-300/40 bg-emerald-300/10 px-3 py-1 text-xs font-black uppercase text-emerald-200">
                  {project.status}
                </span>
                <span className="rounded-[4px] border border-cyan-300/40 bg-cyan-300/10 px-3 py-1 text-xs font-black uppercase text-cyan-200">
                  Standards Hub
                </span>
                <span className="rounded-[4px] border border-violet-300/40 bg-violet-300/10 px-3 py-1 text-xs font-black uppercase text-violet-200">
                  Governance
                </span>
              </div>
              <h1 className="atl-title text-5xl font-black">{project.name}</h1>
              <p className="mt-4 max-w-3xl text-base leading-7 text-atl-silver">
                CityHall is the control center for Aptlantis governance. It
                defines how projects are proposed, structured, developed,
                released, verified, preserved, and interpreted across the
                workspace.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setActiveTab("standards")}
                  className="inline-flex min-h-10 items-center gap-2 rounded-[8px] border border-cyan-300/60 bg-cyan-300/15 px-5 text-sm font-bold text-cyan-100"
                >
                  View Standards Map <MaterialIcon name="open_in_new" />
                </button>
                <CopyButton
                  text="/project/cityhall"
                  label="Copy registry link"
                />
              </div>
            </div>
            <div className="grid gap-3 self-center sm:grid-cols-2">
              {[
                ["Active Standards", nodes.length, "account_tree"],
                ["Templates", templateCount, "article"],
                ["Schemas", schemaCount, "schema"],
                ["Last Review", generatedDate, "event_available"],
              ].map(([label, value, icon]) => (
                <div
                  key={label}
                  className="rounded-[8px] border border-cyan-100/15 bg-slate-950/25 p-4"
                >
                  <MaterialIcon
                    name={String(icon)}
                    className="text-2xl text-cyan-300"
                  />
                  <div className="mt-2 text-sm text-atl-silver">{label}</div>
                  <div className="text-xl font-black text-atl-archive">
                    {value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </header>

        <div className="mb-4 flex flex-wrap gap-1 border-b border-cyan-100/15">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
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

        <div className="grid gap-5 lg:grid-cols-[1fr_380px]">
          {renderTab()}
          {renderSideRail()}
        </div>
      </main>
    </div>
  );
};

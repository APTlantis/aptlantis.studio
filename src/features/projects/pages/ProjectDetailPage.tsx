import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import * as d3 from "d3";
import {
  ArrowLeft,
  ArrowRight,
  Download,
  ExternalLink,
  FileText,
  Gauge,
  PackageCheck,
  Route,
} from "lucide-react";
import MetaTags from "../../../components/MetaTags";
import LoadingSpinner from "../../../components/LoadingSpinner";
import { loadPortfolio } from "../data/portfolioLoader";
import type {
  FrameworkNode,
  FrameworkSuite,
  PortfolioData,
  ProjectRecord,
} from "../types";
import { CodeBlock } from "../components/CodeBlock";
import { CommandBuilder } from "../components/CommandBuilder";
import {
  DossierProjectShell,
  DossierList,
  DossierSectionTitle,
  DossierStat,
  MaterialIcon,
  dossierToneText,
} from "../components/DossierPrimitives";
import { CopyButton, ProgressBar, statusTone } from "../components/ProjectBits";

type Tab = string;
type ProjectTeachingTab = {
  id: Tab;
  label: string;
};

type GraphFrameworkNode = FrameworkNode & d3.SimulationNodeDatum;
type GraphFrameworkLink = d3.SimulationLinkDatum<GraphFrameworkNode> & {
  type: string;
  label: string;
  strength: number;
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "") || "download";

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

const buildFrameworkResourceManifest = (framework: FrameworkNode) =>
  JSON.stringify(
    {
      id: framework.id,
      title: framework.title,
      abbreviation: framework.abbreviation,
      status: framework.status,
      maturity: framework.maturity,
      version: framework.version,
      sourcePath: framework.sourcePath,
      specification: framework.specification,
      schema: framework.schema,
      templates: framework.templates,
      examples: framework.examples,
      validators: framework.validators,
      adopterArtifacts: framework.adopterArtifacts,
      readFirst: framework.readFirst,
    },
    null,
    2,
  );

const buildUsageChecklist = (
  pattern: FrameworkSuite["usagePatterns"][number],
) =>
  [
    `# ${pattern.title}`,
    "",
    `Applies to: ${pattern.appliesTo.join(", ")}`,
    "",
    ...pattern.steps.map((step) => `- [ ] ${step}`),
    "",
  ].join("\n");

const DataList = ({ title, items }: { title: string; items: string[] }) => {
  if (!items.length) return null;
  return (
    <section className="atl-card p-5">
      <h2 className="mb-4 text-2xl font-bold text-atl-archive">{title}</h2>
      <div className="grid gap-2 md:grid-cols-2">
        {items.slice(0, 10).map((item) => (
          <div
            key={item}
            className="rounded-[6px] border border-atl-ridge/70 bg-atl-void/60 px-4 py-3 text-sm text-atl-silver"
          >
            {item}
          </div>
        ))}
      </div>
    </section>
  );
};

const defaultTabs: ProjectTeachingTab[] = [
  { id: "overview", label: "Overview" },
  { id: "usage", label: "Usage" },
  { id: "storage-model", label: "Architecture" },
  { id: "screenshots", label: "Screenshots" },
  { id: "command-builder", label: "Operation" },
  { id: "execution-evidence", label: "Evidence" },
];

const projectTeachingTabs: Record<string, ProjectTeachingTab[]> = {
  "clone-cratesio": [
    { id: "overview", label: "Overview" },
    { id: "usage", label: "Usage" },
    { id: "screenshots", label: "Screenshots" },
    { id: "command-builder", label: "Command Builder" },
    { id: "explainer-video", label: "Explainer Video" },
    { id: "execution-evidence", label: "Execution Evidence" },
  ],
  aptdiskwright: [
    { id: "overview", label: "Overview" },
    { id: "planning-workflow", label: "Planning Workflow" },
    { id: "safety-model", label: "Safety Model" },
    { id: "architecture", label: "Architecture" },
    { id: "transaction-diagrams", label: "Transaction Diagrams" },
    { id: "screenshots", label: "Screenshots" },
  ],
  filecabinet: [
    { id: "overview", label: "Overview" },
    { id: "usage", label: "Usage" },
    { id: "storage-model", label: "Storage Model" },
    { id: "screenshots", label: "Screenshots" },
    { id: "command-builder", label: "CLI & Tests" },
    { id: "trust-repair-model", label: "Data Model" },
    { id: "execution-evidence", label: "Releases" },
  ],
  chatarchive: [
    { id: "overview", label: "Overview" },
    { id: "usage", label: "Usage" },
    { id: "screenshots", label: "Screenshots" },
    { id: "storage-model", label: "Storage Model" },
    { id: "trust-repair-model", label: "Trust / Release Model" },
  ],
  cityhall: [
    { id: "overview", label: "Overview" },
    { id: "usage", label: "Usage" },
    { id: "visualizations", label: "Visualizations" },
    { id: "downloads-templates", label: "Downloads / Templates" },
  ],
  structra: [
    { id: "overview", label: "Overview" },
    { id: "usage", label: "Usage" },
    { id: "structra-lab", label: "Structra Lab" },
    { id: "visualizations", label: "Visualizations" },
    { id: "execution-evidence", label: "Execution Evidence" },
  ],
};

const getProjectTabs = (project: ProjectRecord): ProjectTeachingTab[] =>
  projectTeachingTabs[project.id] || defaultTabs;

const FileCabinetProjectPage = ({
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
  const generatedDate = new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(portfolio.generatedAt));
  const repoBase = project.repoUrl.replace(/\/$/, "");
  const tabItems = [
    { id: "overview", label: "Overview", icon: "radio_button_checked" },
    { id: "usage", label: "Capabilities", icon: "inventory_2" },
    { id: "storage-model", label: "Architecture", icon: "schema" },
    { id: "screenshots", label: "Screenshots", icon: "photo_library" },
    { id: "command-builder", label: "CLI & Tests", icon: "terminal" },
    { id: "trust-repair-model", label: "Data Model", icon: "dataset" },
    { id: "execution-evidence", label: "Releases", icon: "release_alert" },
  ];
  const healthMetrics = [
    ["Overall Health", project.completion, "verified", "bg-emerald-300"],
    [
      "Operational Readiness",
      project.operationalCompleteness,
      "rocket_launch",
      "bg-sky-300",
    ],
    [
      "Preservation Readiness",
      Math.max(0, project.productCompleteness + 28),
      "science",
      "bg-violet-300",
    ],
    ["Security Posture", 85, "shield", "bg-amber-300"],
  ] as const;
  const sections = [
    ["Core Capabilities", "shield", "cyan", project.capabilities.slice(0, 8)],
    [
      "Preservation Features",
      "hub",
      "violet",
      [
        "Immutable storage with optional WORM policies",
        "Evidence-grade hashing and compatibility hash families",
        "Provenance manifests and chain-of-custody",
        "Time-stamped repair logs",
        "Retention schedules and legal hold",
        "Verifiable exports with signed-manifest room",
        "Redundant catalog backups and checksum verification",
        "Tamper-evident packaging workflow",
      ],
    ],
    ["Storage Model", "database", "teal", project.produces.slice(3, 9)],
  ] as const;
  const statusRows = [
    ["Lifecycle", project.status],
    ["Core Status", project.lifecycle],
    ["Maturity", `${project.completion}% cataloged`],
    ["Product Evidence", `${project.productCompleteness}%`],
    ["Catalog Updated", generatedDate],
    ["Release Artifact", "v1.7.3 evidence pending"],
  ];
  const techStack = [
    ["integration_instructions", "VB.NET / WPF", "violet"],
    ["deployed_code", ".NET 10", "cyan"],
    ["database", "JSON catalog", "teal"],
    ["terminal", "PowerShell / CLI", "blue"],
    ["inventory_2", "WiX Toolset", "amber"],
    ["task_alt", "MSTest", "green"],
    ["fingerprint", "SHA-256 / BLAKE3", "green"],
  ] as const;
  const projectLinks = [
    { label: "Repository", url: repoBase },
    { label: "Documentation", url: "/project/filecabinet" },
    { label: "Releases", url: `${repoBase}/releases` },
    { label: "Issues", url: `${repoBase}/issues` },
    { label: "Discussions", url: `${repoBase}/discussions` },
  ];
  const capabilityGroups = [
    {
      title: "Vault Intake",
      icon: "drive_folder_upload",
      tone: "cyan" as const,
      items: [
        "deterministic copy or move ingest",
        "Explorer context actions for one-off custody capture",
        "operator metadata, notes, tags, and retention fields",
        "thumbnail and extracted-text generation after ingest",
      ],
    },
    {
      title: "Integrity And Repair",
      icon: "health_and_safety",
      tone: "green" as const,
      items: [
        "SHA-256 with optional BLAKE3 and legacy hash families",
        "read-only vault health analysis before repair",
        "safe repair preview and selected apply controls",
        "vault-local repair history for later inspection",
      ],
    },
    {
      title: "Operator Surfaces",
      icon: "terminal",
      tone: "blue" as const,
      items: [
        "WPF vault dashboard for daily browsing",
        "headless CLI for verify, repair, package, rescan, and report",
        "PowerShell installer pipeline",
        "DRS-aligned release notes and verification metadata",
      ],
    },
  ];
  const architectureFlow = [
    ["Ingest", "User-selected files, folders, copy/move actions", "input"],
    [
      "Catalog",
      "Local JSON records, metadata, hashes, preview state",
      "list_alt",
    ],
    [
      "Vault",
      "Retained files, thumbnails, extracted text, backups",
      "inventory_2",
    ],
    [
      "Evidence",
      "Repair logs, release docs, deterministic exports",
      "verified",
    ],
  ] as const;
  const cliExamples = `# Copy an installer into the vault without removing the original.
FileCabinet.Cli.exe ingest --copy --vault "A:\\FileCabinet" "C:\\Downloads\\setup.exe"

# Search catalog metadata and extracted text.
FileCabinet.Cli.exe search "firmware manifest" --scope all

# Preview repair actions before applying them.
FileCabinet.Cli.exe repair-preview --vault "A:\\FileCabinet" --json

# Rescan the vault and adopt untracked files deliberately.
FileCabinet.Cli.exe rescan --vault "A:\\FileCabinet" --apply --yes`;
  const releaseCommands = `dotnet build FileCabinet.vbproj
dotnet test
powershell -ExecutionPolicy Bypass -File installer/build-installer.ps1 -Version 1.7.3.0
Get-FileHash artifacts/installer/FileCabinet-1.7.3.0-win-x64.msi -Algorithm SHA256`;
  const dataModelCards = [
    {
      title: "Catalog Record",
      icon: "description",
      tone: "teal" as const,
      body: "Tracks source path, vault path, retention metadata, notes, tags, preview state, integrity state, and lifecycle state.",
    },
    {
      title: "Integrity Block",
      icon: "fingerprint",
      tone: "green" as const,
      body: "Stores SHA-256 and optional compatibility hashes so artifacts can be checked after copy, restore, package, or repair.",
    },
    {
      title: "Repair Finding",
      icon: "build_circle",
      tone: "amber" as const,
      body: "Represents stale paths, missing previews, hash gaps, duplicate candidates, and selected repair actions before mutation.",
    },
    {
      title: "Release Evidence",
      icon: "fact_check",
      tone: "rose" as const,
      body: "Expected to collect build logs, test logs, installer hashes, install checks, uninstall checks, and signing posture per version.",
    },
  ];

  const renderFileCabinetTab = () => {
    if (activeTab === "usage") {
      return (
        <div className="space-y-4">
          <section className="dossier-card p-5">
            <DossierSectionTitle
              icon="conversion_path"
              title="Daily Vault Workflow"
              tone="cyan"
            />
            <ol className="grid gap-3 xl:grid-cols-2">
              {[
                "Choose or create a local vault and decide whether the source should be copied or moved into custody.",
                "Ingest files or folders through the desktop surface, context menu, or CLI.",
                "Let FileCabinet write catalog metadata, hashes, thumbnails, and extracted text where available.",
                "Search by filename, source path, notes, tags, category, extracted text, and integrity state.",
                "Run Analyze Health before repair so proposed changes are visible before mutation.",
                "Apply only selected safe repairs and keep the vault-local repair log with the catalog.",
              ].map((step, index) => (
                <li
                  key={step}
                  className="flex gap-3 rounded-[8px] border border-cyan-100/12 bg-slate-950/25 p-4"
                >
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-[6px] border border-cyan-300/25 bg-cyan-300/10 text-sm font-black text-cyan-200">
                    {index + 1}
                  </span>
                  <span className="text-sm leading-6 text-atl-silver">
                    {step}
                  </span>
                </li>
              ))}
            </ol>
          </section>

          <div className="grid gap-4 xl:grid-cols-3">
            {capabilityGroups.map((group) => (
              <DossierList
                key={group.title}
                title={group.title}
                icon={group.icon}
                tone={group.tone}
                items={group.items}
              />
            ))}
          </div>
        </div>
      );
    }

    if (activeTab === "storage-model") {
      return (
        <div className="space-y-4">
          <section className="dossier-card p-5">
            <DossierSectionTitle
              icon="schema"
              title="Architecture Flow"
              tone="teal"
            />
            <div className="grid gap-3 xl:grid-cols-4">
              {architectureFlow.map(([title, body, icon], index) => (
                <article
                  key={title}
                  className="relative rounded-[8px] border border-cyan-100/15 bg-slate-950/25 p-4"
                >
                  <MaterialIcon
                    name={icon}
                    className="mb-3 text-3xl text-teal-300"
                  />
                  <h4 className="text-lg font-black">{title}</h4>
                  <p className="mt-2 text-sm leading-6 text-atl-silver">
                    {body}
                  </p>
                  {index < architectureFlow.length - 1 && (
                    <MaterialIcon
                      name="arrow_forward"
                      className="absolute right-3 top-4 hidden text-cyan-300 xl:block"
                    />
                  )}
                </article>
              ))}
            </div>
          </section>
          <div className="grid gap-4 xl:grid-cols-2">
            <DossierList
              title="Interfaces"
              icon="settings_input_component"
              tone="blue"
              items={project.interfaces}
            />
            <DossierList
              title="Dependencies"
              icon="account_tree"
              tone="violet"
              items={project.dependsOn}
            />
          </div>
        </div>
      );
    }

    if (activeTab === "screenshots") {
      return (
        <section className="dossier-card p-5">
          <DossierSectionTitle
            icon="photo_library"
            title="Screenshots And Visual Evidence"
            tone="cyan"
          />
          <div className="grid gap-4 xl:grid-cols-3">
            {project.screenshots.map((screenshot) => (
              <figure
                key={screenshot.src}
                className="overflow-hidden rounded-[8px] border border-cyan-100/15 bg-slate-950/30"
              >
                <img
                  src={screenshot.src}
                  alt={screenshot.caption}
                  className="aspect-[4/3] w-full object-cover"
                />
                <figcaption className="p-4 text-sm leading-6 text-atl-silver">
                  {screenshot.caption}
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      );
    }

    if (activeTab === "command-builder") {
      return (
        <div className="grid gap-4 xl:grid-cols-2">
          <section className="dossier-card p-5">
            <DossierSectionTitle
              icon="terminal"
              title="CLI Operating Shape"
              tone="blue"
            />
            <p className="mb-4 text-sm leading-6 text-atl-silver">
              The CLI is the repeatable surface for scripted ingest, searching,
              rescan, repair preview, report, and package workflows.
            </p>
            <CodeBlock code={cliExamples} language="powershell" />
          </section>
          <section className="dossier-card p-5">
            <DossierSectionTitle
              icon="fact_check"
              title="Build And Verification Commands"
              tone="green"
            />
            <p className="mb-4 text-sm leading-6 text-atl-silver">
              These commands describe the expected release verification path.
              Current v1.7.3 evidence is still marked pending in the catalog.
            </p>
            <CodeBlock code={releaseCommands} language="powershell" />
          </section>
          <DossierList
            title="Documentation Evidence"
            icon="library_books"
            tone="violet"
            items={project.documentationOutputs}
          />
          <DossierList
            title="Produced Artifacts"
            icon="deployed_code"
            tone="amber"
            items={project.produces}
          />
        </div>
      );
    }

    if (activeTab === "trust-repair-model") {
      return (
        <div className="space-y-4">
          <section className="grid gap-4 xl:grid-cols-4">
            {dataModelCards.map((card) => (
              <article key={card.title} className="dossier-card p-5">
                <MaterialIcon
                  name={card.icon}
                  className={`mb-3 text-3xl ${dossierToneText(card.tone)}`}
                />
                <h3 className="text-lg font-black">{card.title}</h3>
                <p className="mt-2 text-sm leading-6 text-atl-silver">
                  {card.body}
                </p>
              </article>
            ))}
          </section>
          <div className="grid gap-4 xl:grid-cols-2">
            <DossierList
              title="Known Evidence Gaps"
              icon="warning"
              tone="rose"
              itemIcon="error"
              items={project.missingPieces}
            />
            <DossierList
              title="Repair And Hardening Improvements"
              icon="construction"
              tone="amber"
              itemIcon="build_circle"
              items={project.potentialImprovements}
            />
          </div>
        </div>
      );
    }

    if (activeTab === "execution-evidence") {
      return (
        <div className="space-y-4">
          <section className="dossier-card p-5">
            <DossierSectionTitle
              icon="release_alert"
              title="Release Evidence Posture"
              tone="rose"
            />
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <DossierStat
                label="Current candidate"
                value="v1.7.3.0"
                icon="package_2"
                tone="amber"
              />
              <DossierStat
                label="Build evidence"
                value="Pending"
                icon="hourglass_empty"
                tone="rose"
              />
              <DossierStat
                label="Hash evidence"
                value="Pending"
                icon="fingerprint"
                tone="rose"
              />
              <DossierStat
                label="Release standard"
                value={project.governanceGroup}
                icon="verified_user"
                tone="cyan"
              />
            </div>
          </section>
          <div className="grid gap-4 xl:grid-cols-2">
            <DossierList
              title="Next Verification Steps"
              icon="playlist_add_check"
              tone="green"
              items={project.nextSteps}
            />
            <DossierList
              title="Missing Release Evidence"
              icon="report"
              tone="rose"
              itemIcon="priority_high"
              items={project.missingPieces}
            />
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <section className="dossier-card p-5">
          <h2 className="mb-3 text-2xl font-bold text-atl-archive">
            About {project.name}
          </h2>
          <p className="max-w-5xl text-sm leading-7 text-atl-silver">
            {project.ecosystemRole}
          </p>
          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {healthMetrics.map(([label, value, icon, color]) => (
              <div
                key={label}
                className="rounded-[8px] border border-cyan-100/15 bg-slate-950/30 p-4"
              >
                <div className="mb-3 flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-[8px] border border-cyan-100/20 bg-slate-950/45">
                    <MaterialIcon name={icon} className="text-cyan-200" />
                  </span>
                  <span className="text-sm text-atl-silver">{label}</span>
                  <span className="ml-auto text-xl font-black text-atl-archive">
                    {value}%
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-950/70">
                  <div
                    className={`h-full rounded-full ${color}`}
                    style={{ width: `${Math.min(100, value)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="grid gap-4 xl:grid-cols-3">
          {sections.map(([title, icon, tone, items]) => (
            <DossierList
              key={title}
              title={title}
              icon={icon}
              tone={tone}
              items={[...items]}
            />
          ))}
        </div>

        <section className="dossier-card p-5">
          <h3 className="mb-4 text-xl font-bold">Tech Stack</h3>
          <div className="flex flex-wrap gap-3">
            {techStack.map(([icon, label, tone]) => (
              <span
                key={label}
                className="inline-flex min-h-10 items-center gap-3 rounded-[8px] border border-cyan-100/15 bg-slate-950/30 px-4 text-sm text-atl-silver"
              >
                <MaterialIcon name={icon} className={dossierToneText(tone)} />
                {label}
              </span>
            ))}
          </div>
        </section>
      </div>
    );
  };

  return (
    <DossierProjectShell
      project={project}
      activeTab={activeTab}
      tabs={tabItems}
      badges={[
        { label: project.status, tone: "amber" },
        { label: project.lifecycle, tone: "cyan" },
        { label: "Vault", tone: "violet" },
      ]}
      metadata={[
        { label: "Primary Language", value: "VB.NET", icon: "deployed_code" },
        { label: "Platform", value: "Windows", icon: "window" },
        { label: "Catalog Updated", value: generatedDate, icon: "schedule" },
        { label: "Maintainer", value: "Aptlantis Studio", icon: "groups" },
        {
          label: "Governance",
          value: project.governanceGroup,
          icon: "verified_user",
        },
      ]}
      statusRows={statusRows}
      links={projectLinks}
      heroImageSrc={project.screenshots[0]?.src || project.logoSrc}
      evidenceTabId="execution-evidence"
      onTabChange={setActiveTab}
    >
      {renderFileCabinetTab()}
    </DossierProjectShell>
  );
};

const dossierTabIcons: Record<string, string> = {
  overview: "radio_button_checked",
  usage: "inventory_2",
  visualizations: "analytics",
  screenshots: "photo_library",
  "command-builder": "terminal",
  "explainer-video": "smart_display",
  "execution-evidence": "release_alert",
  "planning-workflow": "conversion_path",
  "safety-model": "health_and_safety",
  architecture: "schema",
  "transaction-diagrams": "account_tree",
  "storage-model": "database",
  "trust-repair-model": "verified_user",
  "downloads-templates": "download",
  "structra-lab": "data_object",
};

const projectDossierProfile: Record<
  string,
  {
    type: string;
    typeTone: "cyan" | "teal" | "amber" | "violet" | "green" | "blue" | "rose";
    primaryLanguage: string;
    platform: string;
  }
> = {
  "clone-cratesio": {
    type: "Registry Mirror",
    typeTone: "green",
    primaryLanguage: "Go / Python",
    platform: "CLI",
  },
  chatarchive: {
    type: "Local Archive",
    typeTone: "violet",
    primaryLanguage: "Rust / React",
    platform: "Tauri",
  },
  codenote: {
    type: "Desktop Editor",
    typeTone: "blue",
    primaryLanguage: "Rust / React",
    platform: "Tauri",
  },
  commandwizard: {
    type: "Command Studio",
    typeTone: "teal",
    primaryLanguage: ".NET",
    platform: "Windows",
  },
  chromearchivalplugin: {
    type: "Browser Extension",
    typeTone: "amber",
    primaryLanguage: "JavaScript",
    platform: "Chrome MV3",
  },
  structra: {
    type: "Structured Data",
    typeTone: "cyan",
    primaryLanguage: "Rust / React",
    platform: "Tauri",
  },
};

const ProjectDossierPage = ({
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
  const generatedDate = new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(portfolio.generatedAt));
  const tabs = getProjectTabs(project).map((tab) => ({
    ...tab,
    icon: dossierTabIcons[tab.id] || "article",
  }));
  const profile = projectDossierProfile[project.id] || {
    type: project.tags[0] || "Project",
    typeTone: "cyan" as const,
    primaryLanguage: project.tags.includes("rust")
      ? "Rust"
      : project.tags.includes("go")
        ? "Go"
        : project.tags.includes("dotnet")
          ? ".NET"
          : "Mixed",
    platform: project.tags.includes("desktop")
      ? "Desktop"
      : project.tags.includes("cli")
        ? "CLI"
        : "Public Catalog",
  };
  const repoBase = project.repoUrl.replace(/\/$/, "");
  const projectLinks = [
    ...(repoBase ? [{ label: "Repository", url: repoBase }] : []),
    { label: "Project Page", url: `/project/${project.id}` },
    ...(repoBase
      ? [
          { label: "Releases", url: `${repoBase}/releases` },
          { label: "Issues", url: `${repoBase}/issues` },
        ]
      : []),
  ];
  const statusRows: Array<[string, string]> = [
    ["Lifecycle", project.status],
    ["Core Status", project.lifecycle],
    ["Governance", project.governanceGroup],
    ["Completion", `${project.completion}%`],
    ["Operational", `${project.operationalCompleteness}%`],
    ["Product Evidence", `${project.productCompleteness}%`],
    ["Catalog Updated", generatedDate],
  ];

  const renderGenericUsage = () => {
    if (project.id === "clone-cratesio") {
      return <CloneCratesUsage project={project} />;
    }
    if (project.id === "chatarchive") {
      return <ChatArchiveUsage project={project} />;
    }
    if (project.frameworkSuite) {
      return <FrameworkUsage project={project} />;
    }
    return (
      <div className="grid gap-4 xl:grid-cols-2">
        <DossierList
          title="Operator Capabilities"
          icon="inventory_2"
          tone="cyan"
          items={project.capabilities.slice(0, 10)}
        />
        <DossierList
          title="Interfaces"
          icon="settings_input_component"
          tone="blue"
          items={project.interfaces.slice(0, 10)}
        />
        <DossierList
          title="Inputs"
          icon="input"
          tone="violet"
          items={project.consumes.slice(0, 10)}
        />
        <DossierList
          title="Outputs"
          icon="output"
          tone="teal"
          items={project.produces.slice(0, 10)}
        />
      </div>
    );
  };

  const renderDossierTab = () => {
    if (activeTab === "usage") {
      return <div className="space-y-4">{renderGenericUsage()}</div>;
    }

    if (
      ["storage-model", "architecture", "transaction-diagrams"].includes(
        activeTab,
      )
    ) {
      return (
        <div className="space-y-4">
          <section className="dossier-card p-5">
            <DossierSectionTitle
              icon="schema"
              title="Project Architecture"
              tone="teal"
            />
            <ProjectMap project={project} />
          </section>
          <div className="grid gap-4 xl:grid-cols-2">
            <DossierList
              title="Dependencies"
              icon="account_tree"
              tone="violet"
              items={project.dependsOn}
            />
            <DossierList
              title="Used By"
              icon="hub"
              tone="blue"
              items={project.usedBy}
            />
          </div>
        </div>
      );
    }

    if (activeTab === "screenshots" || activeTab === "visualizations") {
      return (
        <section className="dossier-card p-5">
          <DossierSectionTitle
            icon={
              activeTab === "visualizations" ? "analytics" : "photo_library"
            }
            title={
              activeTab === "visualizations"
                ? "Visual Evidence"
                : "Screenshots And Visual Evidence"
            }
            tone="cyan"
          />
          {project.frameworkSuite && activeTab === "visualizations" && (
            <div className="mb-4 space-y-4">
              <FrameworkForceGraph project={project} />
              <div className="grid gap-4 xl:grid-cols-3">
                <CodeBlock
                  code={project.frameworkSuite.mermaid.operatingModel}
                  language="mermaid"
                />
                <CodeBlock
                  code={project.frameworkSuite.mermaid.adoptionFlow}
                  language="mermaid"
                />
                <CodeBlock
                  code={project.frameworkSuite.mermaid.artifactChain}
                  language="mermaid"
                />
              </div>
            </div>
          )}
          {project.screenshots.length > 0 ? (
            <div className="grid gap-4 xl:grid-cols-3">
              {project.screenshots.map((screenshot) => (
                <figure
                  key={screenshot.src}
                  className="overflow-hidden rounded-[8px] border border-cyan-100/15 bg-slate-950/30"
                >
                  <img
                    src={screenshot.src}
                    alt={screenshot.caption}
                    className="aspect-[4/3] w-full object-cover"
                  />
                  <figcaption className="p-4 text-sm leading-6 text-atl-silver">
                    {screenshot.caption}
                  </figcaption>
                </figure>
              ))}
            </div>
          ) : (
            <p className="text-sm text-atl-silver">
              Curated screenshots have not been added for this project yet.
            </p>
          )}
        </section>
      );
    }

    if (activeTab === "command-builder") {
      return (
        <div className="space-y-4">
          <section className="dossier-card p-5">
            <DossierSectionTitle
              icon="terminal"
              title="Operation Surface"
              tone="blue"
            />
            <CommandBuilder
              schemaId={project.commandWizardSchema}
              fallbackHelp={project.helpOutput}
            />
          </section>
          {project.helpOutput && (
            <section className="dossier-card p-5">
              <DossierSectionTitle
                icon="article"
                title="Help Output"
                tone="violet"
              />
              <CodeBlock
                code={project.helpOutput}
                language="bash"
                maxHeight="max-h-[540px]"
              />
            </section>
          )}
        </div>
      );
    }

    if (["trust-repair-model", "safety-model"].includes(activeTab)) {
      return (
        <div className="grid gap-4 xl:grid-cols-2">
          <DossierList
            title="Trust And Safety Capabilities"
            icon="verified_user"
            tone="green"
            items={project.capabilities}
          />
          <DossierList
            title="Known Gaps"
            icon="warning"
            tone="rose"
            itemIcon="error"
            items={project.missingPieces}
          />
          <DossierList
            title="Potential Improvements"
            icon="construction"
            tone="amber"
            itemIcon="build_circle"
            items={project.potentialImprovements}
          />
        </div>
      );
    }

    if (activeTab === "execution-evidence") {
      return (
        <div className="space-y-4">
          <section className="dossier-card p-5">
            <DossierSectionTitle
              icon="release_alert"
              title="Evidence Posture"
              tone="rose"
            />
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <DossierStat
                label="Completion"
                value={`${project.completion}%`}
                icon="speed"
                tone="cyan"
              />
              <DossierStat
                label="Operational"
                value={`${project.operationalCompleteness}%`}
                icon="settings_suggest"
                tone="green"
              />
              <DossierStat
                label="Product evidence"
                value={`${project.productCompleteness}%`}
                icon="fact_check"
                tone={project.productCompleteness >= 70 ? "green" : "amber"}
              />
              <DossierStat
                label="Governance"
                value={project.governanceGroup}
                icon="policy"
                tone="violet"
              />
            </div>
          </section>
          <div className="grid gap-4 xl:grid-cols-2">
            <DossierList
              title="Produced Artifacts"
              icon="deployed_code"
              tone="teal"
              items={project.produces}
            />
            <DossierList
              title="Documentation Evidence"
              icon="library_books"
              tone="blue"
              items={project.documentationOutputs}
            />
            <DossierList
              title="Next Verification Steps"
              icon="playlist_add_check"
              tone="green"
              items={project.nextSteps}
            />
            <DossierList
              title="Missing Evidence"
              icon="report"
              tone="rose"
              itemIcon="priority_high"
              items={project.missingPieces}
            />
          </div>
        </div>
      );
    }

    if (activeTab === "structra-lab") {
      return (
        <div className="space-y-4">
          <section className="dossier-card p-5">
            <DossierSectionTitle
              icon="data_object"
              title="Structra Lab"
              tone="cyan"
            />
            <p className="max-w-4xl text-sm leading-7 text-atl-silver">
              The full Structra project is a Tauri desktop app. The site lab is
              a smaller browser-safe cousin that demonstrates the core workflow:
              visual fields and workflow steps become structured JSON, schema,
              and YAML output.
            </p>
            <Link
              to="/structra-lab"
              className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-[8px] border border-cyan-300/60 bg-cyan-300/15 px-5 text-sm font-bold text-cyan-100 no-underline"
            >
              Open Structra Lab <ExternalLink className="h-4 w-4" />
            </Link>
          </section>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              [
                "Inputs",
                "Visual field definitions, binding paths, example values, workflow steps, and dependencies.",
              ],
              [
                "Model",
                "A structured document plus workflow graph that can be validated before export.",
              ],
              [
                "Outputs",
                "JSON values, JSON Schema-style previews, portable YAML, GitHub Actions, and GitLab CI shapes.",
              ],
            ].map(([title, body]) => (
              <article key={title} className="dossier-card p-5">
                <h3 className="text-lg font-black text-atl-archive">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-atl-silver">{body}</p>
              </article>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <section className="dossier-card p-5">
          <h2 className="mb-3 text-2xl font-bold text-atl-archive">
            About {project.name}
          </h2>
          <p className="max-w-5xl text-sm leading-7 text-atl-silver">
            {project.ecosystemRole || project.summary}
          </p>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {[
              ["Overall", project.completion, "speed", "bg-cyan-300"],
              [
                "Operational",
                project.operationalCompleteness,
                "settings_suggest",
                "bg-emerald-300",
              ],
              [
                "Product Evidence",
                project.productCompleteness,
                "fact_check",
                "bg-amber-300",
              ],
            ].map(([label, value, icon, color]) => (
              <div
                key={label}
                className="rounded-[8px] border border-cyan-100/15 bg-slate-950/30 p-4"
              >
                <div className="mb-3 flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-[8px] border border-cyan-100/20 bg-slate-950/45">
                    <MaterialIcon
                      name={String(icon)}
                      className="text-cyan-200"
                    />
                  </span>
                  <span className="text-sm text-atl-silver">{label}</span>
                  <span className="ml-auto text-xl font-black text-atl-archive">
                    {value}%
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-950/70">
                  <div
                    className={`h-full rounded-full ${color}`}
                    style={{ width: `${Math.min(100, Number(value))}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
        <div className="grid gap-4 xl:grid-cols-3">
          <DossierList
            title="Capabilities"
            icon="inventory_2"
            tone="cyan"
            items={project.capabilities.slice(0, 8)}
          />
          <DossierList
            title="Outputs"
            icon="output"
            tone="teal"
            items={project.produces.slice(0, 8)}
          />
          <DossierList
            title="Next Steps"
            icon="playlist_add_check"
            tone="amber"
            items={project.nextSteps.slice(0, 8)}
          />
        </div>
      </div>
    );
  };

  return (
    <DossierProjectShell
      project={project}
      activeTab={activeTab}
      tabs={tabs}
      badges={[
        {
          label: project.status,
          tone: project.status.toLowerCase().includes("blocked")
            ? "rose"
            : "amber",
        },
        { label: project.lifecycle || "cataloged", tone: "cyan" },
        { label: profile.type, tone: profile.typeTone },
      ]}
      metadata={[
        {
          label: "Primary Language",
          value: profile.primaryLanguage,
          icon: "deployed_code",
        },
        { label: "Platform", value: profile.platform, icon: "apps" },
        { label: "Catalog Updated", value: generatedDate, icon: "schedule" },
        { label: "Maintainer", value: "Aptlantis Studio", icon: "groups" },
        {
          label: "Governance",
          value: project.governanceGroup,
          icon: "verified_user",
        },
      ]}
      statusRows={statusRows}
      links={projectLinks}
      heroImageSrc={project.screenshots[0]?.src || project.logoSrc}
      evidenceTabId={
        tabs.some((tab) => tab.id === "execution-evidence")
          ? "execution-evidence"
          : undefined
      }
      onTabChange={setActiveTab}
    >
      {renderDossierTab()}
    </DossierProjectShell>
  );
};

const cloneCratesQuickstart = `$root = "$env:USERPROFILE\\Rust-Crates"
New-Item -Force -ItemType Directory $root, "$root\\crates.io-index", "$root\\mirror" | Out-Null

git clone https://github.com/rust-lang/crates.io-index "$root\\crates.io-index"

go build -o .\\bin\\download-crates.exe .\\cmd\\download-crates
go build -o .\\bin\\generate-sidecars.exe .\\cmd\\generate-sidecars

.\\bin\\download-crates.exe -index-dir "$root\\crates.io-index" -out "$root\\mirror" -concurrency 256 -dry-run -log-level info
.\\bin\\download-crates.exe -index-dir "$root\\crates.io-index" -out "$root\\mirror" -concurrency 256 -include-yanked -progress-interval 5s -listen :9090 -log-format json`;

const cloneCratesWrapper = `python Clone-Index.py --index-dir "A:\\rust-lang\\crates.io-index" --output-dir "A:\\rust-lang\\crates" --threads 128 --include-yanked --manifest "A:\\rust-lang\\manifest.jsonl" --non-interactive`;

const cloneCratesAirgapVerify = `jq -r 'select(.ok==true) | "\\(.sha256)  \\(.path)"' manifest.jsonl > checksums.txt
sha256sum -c checksums.txt`;

const CloneCratesUsage = ({ project }: { project: ProjectRecord }) => {
  const workflowSteps = [
    "Clone or update the local crates.io-index checkout so the registry index is the source of truth.",
    "Run a dry-run preflight to validate paths, concurrency, bundle settings, and metrics binding before downloading.",
    "Mirror .crate files directly or use bundle mode to roll output into transportable .tar.zst archives.",
    "Emit manifest.jsonl so every downloaded crate has an audit record with path, size, sha256, yanked state, and timestamp.",
    "Generate sidecars when downstream tooling needs per-crate metadata without walking the raw index again.",
    "Verify the manifest before transport, then re-verify after moving the mirror or bundle archives offline.",
  ];

  const operatorNotes = [
    {
      title: "Wrapper first",
      body: "Use Clone-Index.py when you want the Windows-friendly entry point that updates the index and invokes the downloader with project defaults.",
      icon: Route,
    },
    {
      title: "Bundle for airgap",
      body: "Use bundle mode when file count, copy time, or offline transport matters. The run produces bundle manifests plus bundles.index.jsonl.",
      icon: PackageCheck,
    },
    {
      title: "Watch the run",
      body: "download-crates exposes /metrics, /api/status, and /debug/pprof/ on :9090 by default, so long mirror runs can be monitored.",
      icon: Gauge,
    },
  ];

  return (
    <div className="space-y-6">
      <section className="atl-card p-5">
        <div className="mb-5 max-w-4xl">
          <h3 className="text-2xl font-bold text-atl-archive">
            Operator Workflow
          </h3>
          <p className="mt-2 text-sm leading-6 text-atl-silver">
            CloneCratesio is not a one-shot downloader. It is a restart-friendly
            mirror pipeline for building a verifiable local copy of crates.io,
            then proving the files are safe to move into an offline or archival
            environment.
          </p>
        </div>
        <ol className="grid gap-3 lg:grid-cols-2">
          {workflowSteps.map((step, index) => (
            <li key={step} className="flex gap-3 atl-card-soft p-4">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-[6px] bg-atl-navy/50 text-sm font-black text-atl-silver">
                {index + 1}
              </span>
              <span className="text-sm leading-6 text-atl-silver">{step}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        {operatorNotes.map((note) => {
          const Icon = note.icon;
          return (
            <article key={note.title} className="atl-card p-5">
              <Icon
                className="mb-4 h-6 w-6 text-atl-silver"
                aria-hidden="true"
              />
              <h3 className="font-bold text-atl-archive">{note.title}</h3>
              <p className="mt-2 text-sm leading-6 text-atl-silver">
                {note.body}
              </p>
            </article>
          );
        })}
      </section>

      <section className="atl-card p-5">
        <h3 className="mb-3 text-xl font-bold text-atl-archive">
          Quickstart Shape
        </h3>
        <p className="mb-4 text-sm leading-6 text-atl-silver">
          Build the Go CLIs, run a dry-run preflight, then start the real mirror
          with metrics enabled.
        </p>
        <CodeBlock
          code={cloneCratesQuickstart}
          language="powershell"
          maxHeight="max-h-[420px]"
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="atl-card p-5">
          <h3 className="mb-3 text-xl font-bold text-atl-archive">
            Python Wrapper Entry Point
          </h3>
          <p className="mb-4 text-sm leading-6 text-atl-silver">
            The wrapper is the simplest operator command. Its `--threads` flag
            maps to downloader concurrency, and `--verify-existing` is reserved
            for deliberate integrity sweeps rather than normal update runs.
          </p>
          <CodeBlock code={cloneCratesWrapper} language="powershell" />
        </article>

        <article className="atl-card p-5">
          <h3 className="mb-3 text-xl font-bold text-atl-archive">
            Airgap Verification
          </h3>
          <p className="mb-4 text-sm leading-6 text-atl-silver">
            The manifest is the handoff contract: verify hashes before
            transport, move the mirror or bundles, then recompute on arrival.
          </p>
          <CodeBlock code={cloneCratesAirgapVerify} language="bash" />
        </article>
      </section>

      <section className="atl-card p-5">
        <h3 className="mb-4 text-xl font-bold text-atl-archive">
          What This Run Produces
        </h3>
        <div className="grid gap-3 md:grid-cols-2">
          {project.produces.slice(0, 8).map((item) => (
            <div
              key={item}
              className="rounded-[6px] border border-atl-ridge/70 bg-atl-void/60 px-4 py-3 text-sm text-atl-silver"
            >
              {item}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

const FileCabinetUsage = ({ project }: { project: ProjectRecord }) => {
  const workflowSteps = [
    "Choose or create a vault, then use copy mode when the original file needs to remain in place or move mode when the vault becomes the source of custody.",
    "Drop files or folders into the ingest zone, or use the Explorer context menu for one-off Copy to FileCabinet and Move to FileCabinet operations.",
    "Search the catalog by filename, source path, tags, notes, extracted text, category, retention state, and integrity state.",
    "Open, restore, quarantine, or permanently delete selected items from the right-hand detail panel after checking metadata and related items.",
    "Run Analyze Health before a repair pass so missing previews, stale paths, hash gaps, and duplicate candidates are visible before anything changes.",
    "Apply only the selected safe repairs, then keep the vault-local repair log with the catalog as the audit trail for what changed.",
  ];

  const cliExamples = `$vault = "A:\\FileCabinet"

# Copy an installer into the vault without removing the original.
FileCabinet.Cli.exe ingest --copy --vault $vault C:\\Downloads\\setup.exe

# Search catalog metadata and extracted text.
FileCabinet.Cli.exe search "firmware manifest" --scope all

# Preview repair actions before applying them.
FileCabinet.Cli.exe repair-preview --vault $vault --json

# Rescan the vault and adopt untracked files deliberately.
FileCabinet.Cli.exe rescan --vault $vault --apply --yes`;

  return (
    <div className="space-y-6">
      <section className="atl-card p-5">
        <div className="mb-5 max-w-4xl">
          <h3 className="text-2xl font-bold text-atl-archive">
            Daily Vault Workflow
          </h3>
          <p className="mt-2 text-sm leading-6 text-atl-silver">
            FileCabinet is a local Windows vault for keeping technical artifacts
            findable, previewable, and repairable. The desktop app is the normal
            operator surface; the CLI exists for scripted ingest, searching,
            reporting, and health checks.
          </p>
        </div>
        <ol className="grid gap-3 lg:grid-cols-2">
          {workflowSteps.map((step, index) => (
            <li key={step} className="flex gap-3 atl-card-soft p-4">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-[6px] bg-atl-navy/50 text-sm font-black text-atl-silver">
                {index + 1}
              </span>
              <span className="text-sm leading-6 text-atl-silver">{step}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        {[
          {
            title: "Desktop first",
            body: "The WPF interface is built around a visible vault, live counts, an ingest zone, filtered item lists, and a detail pane for restore and lifecycle actions.",
            icon: FileText,
          },
          {
            title: "Health before repair",
            body: "Analyze is read-only. Apply Selected Repairs is the deliberate step that recomputes missing hashes, regenerates previews, or rebinds stale paths.",
            icon: Gauge,
          },
          {
            title: "Auditable custody",
            body: "Catalog entries, thumbnails, extracted text, integrity hashes, and repair-log JSONL stay local to the vault so the archive can be inspected later.",
            icon: PackageCheck,
          },
        ].map((note) => {
          const Icon = note.icon;
          return (
            <article key={note.title} className="atl-card p-5">
              <Icon
                className="mb-4 h-6 w-6 text-atl-silver"
                aria-hidden="true"
              />
              <h3 className="font-bold text-atl-archive">{note.title}</h3>
              <p className="mt-2 text-sm leading-6 text-atl-silver">
                {note.body}
              </p>
            </article>
          );
        })}
      </section>

      <section className="atl-card p-5">
        <h3 className="mb-3 text-xl font-bold text-atl-archive">CLI Shape</h3>
        <p className="mb-4 text-sm leading-6 text-atl-silver">
          The command-line surface is for repeatable ingest, search, preview,
          rescan, and repair automation.
        </p>
        <CodeBlock
          code={cliExamples}
          language="powershell"
          maxHeight="max-h-[420px]"
        />
      </section>

      <DataList title="What FileCabinet Produces" items={project.produces} />
    </div>
  );
};

const ChatArchiveUsage = ({ project }: { project: ProjectRecord }) => {
  const workflowSteps = [
    "Request an OpenAI data export from ChatGPT settings, then download and extract the export when the email link arrives.",
    "Keep the export folder intact so conversations-*.json, conversation_asset_file_names.json, and .dat asset blobs remain together.",
    "Choose a local ChatArchive library folder, then import the extracted OpenAI export through the Tauri desktop app.",
    "Let the importer normalize conversation trees, resolve asset filenames, copy local assets, and build searchable archive indexes.",
    "Use the sidebar filters to narrow by title, content, code, raw text, assets, documents, links, dates, and message counts.",
    "Review the Code, Document, and Asset explorers to classify useful artifacts, copy snippets, export originals, bookmark important threads, and jump back to the source conversation.",
  ];

  const exportChecklist = `1. Open ChatGPT settings.
2. Start the data export request.
3. Wait for the OpenAI export email and download the archive.
4. Extract the archive locally without renaming or separating asset blobs.
5. In ChatArchive, select the extracted export folder.
6. Select or create the local ChatArchive library folder.
7. Import, then review unresolved assets and explorer counts.`;

  return (
    <div className="space-y-6">
      <section className="atl-card p-5">
        <div className="mb-5 max-w-4xl">
          <h3 className="text-2xl font-bold text-atl-archive">
            From OpenAI Export To Local Library
          </h3>
          <p className="mt-2 text-sm leading-6 text-atl-silver">
            ChatArchive turns the export that OpenAI gives users into a local
            desktop library. The important part is keeping the export structure
            together, then letting the importer build durable conversation,
            code, document, image, link, and asset indexes.
          </p>
        </div>
        <ol className="grid gap-3 lg:grid-cols-2">
          {workflowSteps.map((step, index) => (
            <li key={step} className="flex gap-3 atl-card-soft p-4">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-[6px] bg-atl-navy/50 text-sm font-black text-atl-silver">
                {index + 1}
              </span>
              <span className="text-sm leading-6 text-atl-silver">{step}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        {[
          {
            title: "Reader dashboard",
            body: "Start from the archive totals, visible messages, unresolved assets, and conversation filters before drilling into any one artifact family.",
            icon: Gauge,
          },
          {
            title: "Artifact explorers",
            body: "Code, Documents, Assets, and Links are separate review surfaces so useful outputs do not stay buried inside long chats.",
            icon: FileText,
          },
          {
            title: "Source traceability",
            body: "Explorer rows keep source-conversation links, copy/export actions, and context so a snippet or asset can be traced back to the original thread.",
            icon: Route,
          },
        ].map((note) => {
          const Icon = note.icon;
          return (
            <article key={note.title} className="atl-card p-5">
              <Icon
                className="mb-4 h-6 w-6 text-atl-silver"
                aria-hidden="true"
              />
              <h3 className="font-bold text-atl-archive">{note.title}</h3>
              <p className="mt-2 text-sm leading-6 text-atl-silver">
                {note.body}
              </p>
            </article>
          );
        })}
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <article className="atl-card p-5">
          <h3 className="mb-3 text-xl font-bold text-atl-archive">
            Export Checklist
          </h3>
          <p className="mb-4 text-sm leading-6 text-atl-silver">
            This is the user-facing path: request the official export, preserve
            the folder shape, then import.
          </p>
          <CodeBlock code={exportChecklist} language="text" />
        </article>

        <article className="atl-card p-5">
          <h3 className="mb-3 text-xl font-bold text-atl-archive">
            Explorer Categories
          </h3>
          <div className="grid gap-3">
            {[
              "Code snippets and generated scripts",
              "Documents, standards, plans, and release notes",
              "Images and copied local assets",
              "Links and source references",
            ].map((item) => (
              <div
                key={item}
                className="rounded-[6px] border border-atl-ridge/70 bg-atl-void/60 px-4 py-3 text-sm text-atl-silver"
              >
                {item}
              </div>
            ))}
          </div>
        </article>
      </section>

      <DataList title="What ChatArchive Produces" items={project.produces} />
    </div>
  );
};

const ProjectMap = ({ project }: { project: ProjectRecord }) => {
  const chart = project.frameworkSuite
    ? project.frameworkSuite.mermaid.operatingModel
    : `flowchart LR
    Project["${project.name}"]
    Group["${project.governanceGroup}"]
    Inputs["Inputs"]
    Outputs["Outputs"]
    Next["Next steps"]
    Group --> Project
    Inputs --> Project
    Project --> Outputs
    Project --> Next`;
  const title = project.frameworkSuite
    ? "Standards Operating Map"
    : "Project Map";

  return (
    <section className="atl-card p-5">
      <h2 className="mb-4 text-2xl font-bold text-atl-archive">{title}</h2>
      <CodeBlock code={chart} language="mermaid" />
    </section>
  );
};

const FrameworkForceGraph = ({ project }: { project: ProjectRecord }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [selected, setSelected] = useState<FrameworkNode | null>(
    project.frameworkSuite?.nodes[0] ?? null,
  );

  useEffect(() => {
    if (!svgRef.current || !project.frameworkSuite) return;

    const width = 920;
    const height = 520;
    const nodes: GraphFrameworkNode[] = project.frameworkSuite.nodes.map(
      (node) => ({ ...node }),
    );
    const links: GraphFrameworkLink[] =
      project.frameworkSuite.relationships.map((link) => ({ ...link }));
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    svg.attr("viewBox", `0 0 ${width} ${height}`).attr("role", "img");

    const link = svg
      .append("g")
      .attr("stroke-linecap", "round")
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke", "#475569")
      .attr("stroke-width", (relationship) =>
        Math.max(1.5, relationship.strength * 4),
      )
      .attr("stroke-opacity", 0.65);

    const label = svg
      .append("g")
      .selectAll("text")
      .data(links)
      .join("text")
      .attr("fill", "#94a3b8")
      .attr("font-size", 10)
      .attr("text-anchor", "middle")
      .text((relationship) => relationship.type);

    const node = svg
      .append("g")
      .selectAll<SVGGElement, GraphFrameworkNode>("g")
      .data(nodes)
      .join("g")
      .attr("tabindex", 0)
      .attr(
        "aria-label",
        (framework) => `${framework.title}: ${framework.layer}`,
      )
      .style("cursor", "pointer")
      .on("click", (_event, framework) => setSelected(framework))
      .on("keydown", (event, framework) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          setSelected(framework);
        }
      });

    node
      .append("circle")
      .attr("r", (framework) => (framework.id === "wgs" ? 30 : 22))
      .attr("fill", (framework) => framework.color)
      .attr("stroke", "#e2e8f0")
      .attr("stroke-width", 2)
      .attr("opacity", 0.95);

    node
      .append("text")
      .attr("text-anchor", "middle")
      .attr("dy", 4)
      .attr("fill", "#020617")
      .attr("font-size", 11)
      .attr("font-weight", 900)
      .text((framework) => framework.abbreviation);

    const simulation = d3
      .forceSimulation(nodes)
      .force(
        "link",
        d3
          .forceLink<GraphFrameworkNode, GraphFrameworkLink>(links)
          .id((nodeDatum) => nodeDatum.id)
          .distance((relationship) => 140 - relationship.strength * 35),
      )
      .force("charge", d3.forceManyBody().strength(-540))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force(
        "x",
        d3
          .forceX<GraphFrameworkNode>((framework) =>
            framework.id === "wgs" ? width * 0.42 : width / 2,
          )
          .strength(0.08),
      )
      .force("y", d3.forceY<GraphFrameworkNode>(height / 2).strength(0.08))
      .on("tick", () => {
        link
          .attr(
            "x1",
            (relationship) =>
              (relationship.source as GraphFrameworkNode).x ?? 0,
          )
          .attr(
            "y1",
            (relationship) =>
              (relationship.source as GraphFrameworkNode).y ?? 0,
          )
          .attr(
            "x2",
            (relationship) =>
              (relationship.target as GraphFrameworkNode).x ?? 0,
          )
          .attr(
            "y2",
            (relationship) =>
              (relationship.target as GraphFrameworkNode).y ?? 0,
          );
        label
          .attr(
            "x",
            (relationship) =>
              (((relationship.source as GraphFrameworkNode).x ?? 0) +
                ((relationship.target as GraphFrameworkNode).x ?? 0)) /
              2,
          )
          .attr(
            "y",
            (relationship) =>
              (((relationship.source as GraphFrameworkNode).y ?? 0) +
                ((relationship.target as GraphFrameworkNode).y ?? 0)) /
              2,
          );
        node.attr(
          "transform",
          (framework) => `translate(${framework.x ?? 0},${framework.y ?? 0})`,
        );
      });

    return () => {
      simulation.stop();
    };
  }, [project.frameworkSuite]);

  if (!project.frameworkSuite) return null;

  return (
    <section className="atl-card p-5">
      <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-atl-archive">
            Framework Relationship Map
          </h2>
          <p className="mt-1 text-sm text-atl-frost">
            Click a standard to inspect its scope, resources, and layer.
          </p>
        </div>
        <span className="text-sm font-bold text-atl-silver">
          {project.frameworkSuite.nodes.length} standards /{" "}
          {project.frameworkSuite.relationships.length} relationships
        </span>
      </div>
      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="min-h-[360px] overflow-hidden rounded-[8px] border border-atl-ridge/70 bg-atl-void/70">
          <svg ref={svgRef} className="h-full min-h-[360px] w-full" />
        </div>
        {selected && (
          <aside className="atl-card-soft p-4">
            <div className="mb-3 flex items-center gap-3">
              <span
                className="h-4 w-4 rounded-full"
                style={{ backgroundColor: selected.color }}
              />
              <div>
                <h3 className="font-bold text-atl-archive">{selected.title}</h3>
                <p className="text-xs uppercase text-atl-smoke">
                  {selected.layer}
                </p>
              </div>
            </div>
            <p className="text-sm leading-6 text-atl-silver">
              {selected.description}
            </p>
            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-atl-smoke">Version</dt>
                <dd className="font-bold text-atl-archive">
                  {selected.version}
                </dd>
              </div>
              <div>
                <dt className="text-atl-smoke">Maturity</dt>
                <dd className="font-bold text-atl-archive">
                  {selected.maturity}
                </dd>
              </div>
              <div>
                <dt className="text-atl-smoke">Templates</dt>
                <dd className="font-bold text-atl-archive">
                  {selected.templates.length}
                </dd>
              </div>
              <div>
                <dt className="text-atl-smoke">Validators</dt>
                <dd className="font-bold text-atl-archive">
                  {selected.validators.length}
                </dd>
              </div>
            </dl>
            <p className="mt-4 text-xs leading-5 text-atl-frost">
              {selected.scope}
            </p>
          </aside>
        )}
      </div>
    </section>
  );
};

const FrameworkUsage = ({ project }: { project: ProjectRecord }) => {
  if (!project.frameworkSuite) return null;

  return (
    <div className="space-y-6">
      <section className="atl-card p-5">
        <h2 className="mb-4 text-2xl font-bold text-atl-archive">
          Standards And Resources
        </h2>
        <div className="grid gap-3 md:grid-cols-2">
          {project.frameworkSuite.nodes.map((framework) => (
            <div key={framework.id} className="atl-card-soft p-4">
              <div className="mb-2 flex items-center justify-between gap-3">
                <h3 className="font-bold text-atl-archive">
                  {framework.abbreviation}
                </h3>
                <span className="rounded-[6px] border border-atl-ridge px-2 py-1 text-xs text-atl-silver">
                  v{framework.version}
                </span>
              </div>
              <p className="text-sm leading-6 text-atl-silver">
                {framework.description}
              </p>
              <div className="mt-3 text-xs text-atl-smoke">
                {framework.sourcePath}
              </div>
            </div>
          ))}
          {project.frameworkSuite.resourceKits.map((kit) => (
            <div
              key={kit.id}
              className="rounded-[8px] border border-atl-warning/40 bg-atl-warning/10 p-4"
            >
              <h3 className="font-bold text-amber-100">{kit.title}</h3>
              <p className="mt-2 text-sm leading-6 text-atl-silver">
                {kit.description}
              </p>
              <div className="mt-3 text-xs text-amber-100/80">
                {kit.templates.length} reusable blanks
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="atl-card p-5">
        <h2 className="mb-4 text-2xl font-bold text-atl-archive">
          Usage Recipes
        </h2>
        <div className="grid gap-4 lg:grid-cols-2">
          {project.frameworkSuite.usagePatterns.map((pattern) => (
            <article key={pattern.title} className="atl-card-soft p-4">
              <div className="mb-3 flex flex-wrap gap-2">
                {pattern.appliesTo.map((item) => (
                  <span
                    key={item}
                    className="rounded-[6px] bg-atl-navy/50 px-2 py-1 text-xs font-bold text-atl-silver"
                  >
                    {item}
                  </span>
                ))}
              </div>
              <h3 className="font-bold text-atl-archive">{pattern.title}</h3>
              <ol className="mt-3 space-y-2 text-sm leading-6 text-atl-silver">
                {pattern.steps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};

const ResourceList = ({ title, items }: { title: string; items: string[] }) => {
  if (!items.length) return null;

  return (
    <div>
      <h4 className="mb-2 text-xs font-black uppercase text-atl-smoke">
        {title}
      </h4>
      <div className="space-y-1">
        {items.slice(0, 5).map((item) => (
          <div
            key={item}
            className="truncate text-xs text-atl-silver"
            title={item}
          >
            {item}
          </div>
        ))}
        {items.length > 5 && (
          <div className="text-xs font-bold text-atl-silver">
            +{items.length - 5} more
          </div>
        )}
      </div>
    </div>
  );
};

const FrameworkDownloads = ({ project }: { project: ProjectRecord }) => {
  if (!project.frameworkSuite)
    return (
      <DataList
        title="Documentation Outputs"
        items={project.documentationOutputs}
      />
    );

  return (
    <div className="space-y-6">
      <section className="atl-card p-5">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-atl-archive">
              Resource Downloads
            </h2>
            <p className="mt-1 text-sm leading-6 text-atl-frost">
              Export lightweight manifests, checklists, and diagram sources from
              the current CityHall dataset.
            </p>
          </div>
          <button
            type="button"
            onClick={() =>
              downloadTextFile(
                "cityhall-framework-suite.json",
                JSON.stringify(project.frameworkSuite, null, 2),
              )
            }
            className="inline-flex min-h-[38px] items-center justify-center gap-2 rounded-[8px] bg-atl-silver px-4 text-sm font-bold text-atl-void transition hover:bg-atl-archive"
          >
            <Download className="h-4 w-4" />
            Suite JSON
          </button>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {project.frameworkSuite.nodes.map((framework) => (
            <article key={framework.id} className="atl-card-soft p-4">
              <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="font-bold text-atl-archive">
                    {framework.title}
                  </h3>
                  <p className="mt-1 text-xs uppercase text-atl-smoke">
                    {framework.abbreviation} / {framework.layer}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    downloadTextFile(
                      `${slugify(framework.abbreviation)}-resources.json`,
                      buildFrameworkResourceManifest(framework),
                    )
                  }
                  className="inline-flex min-h-[34px] items-center justify-center gap-2 rounded-[8px] border border-atl-ridge px-3 text-xs font-black text-atl-archive transition hover:border-atl-silver/70 hover:text-atl-silver"
                >
                  <Download className="h-4 w-4" />
                  Manifest
                </button>
              </div>
              <p className="mb-4 text-sm leading-6 text-atl-silver">
                {framework.description}
              </p>
              <div className="grid gap-4 sm:grid-cols-3">
                <ResourceList title="Read first" items={framework.readFirst} />
                <ResourceList title="Templates" items={framework.templates} />
                <ResourceList title="Validators" items={framework.validators} />
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-atl-smoke">
                <FileText className="h-4 w-4 text-atl-frost" />
                <span className="truncate">{framework.sourcePath}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="atl-card p-5">
        <h2 className="mb-4 text-2xl font-bold text-atl-archive">
          Starter Kits And Checklists
        </h2>
        <div className="grid gap-4 lg:grid-cols-2">
          {project.frameworkSuite.resourceKits.map((kit) => (
            <article
              key={kit.id}
              className="rounded-[8px] border border-atl-warning/40 bg-atl-warning/10 p-4"
            >
              <h3 className="font-bold text-amber-100">{kit.title}</h3>
              <p className="mt-2 text-sm leading-6 text-atl-silver">
                {kit.description}
              </p>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {kit.templates.map((template) => (
                  <div
                    key={template}
                    className="rounded-[6px] border border-atl-warning/30 bg-atl-void/60 px-3 py-2 text-xs text-amber-50"
                  >
                    {template}
                  </div>
                ))}
              </div>
            </article>
          ))}

          {project.frameworkSuite.usagePatterns.map((pattern) => (
            <article key={pattern.title} className="atl-card-soft p-4">
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-bold text-atl-archive">
                    {pattern.title}
                  </h3>
                  <p className="mt-1 text-xs uppercase text-atl-smoke">
                    {pattern.appliesTo.join(" + ")}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    downloadTextFile(
                      `${slugify(pattern.title)}-checklist.md`,
                      buildUsageChecklist(pattern),
                      "text/markdown",
                    )
                  }
                  className="inline-flex min-h-[34px] items-center justify-center gap-2 rounded-[8px] border border-atl-ridge px-3 text-xs font-black text-atl-archive transition hover:border-atl-silver/70 hover:text-atl-silver"
                >
                  <Download className="h-4 w-4" />
                  Checklist
                </button>
              </div>
              <ol className="space-y-2 text-sm leading-6 text-atl-silver">
                {pattern.steps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </article>
          ))}
        </div>
      </section>

      <section className="atl-card p-5">
        <h2 className="mb-4 text-2xl font-bold text-atl-archive">
          Diagram Sources
        </h2>
        <div className="grid gap-4 lg:grid-cols-3">
          {Object.entries(project.frameworkSuite.mermaid).map(
            ([name, chart]) => (
              <article key={name} className="atl-card-soft p-4">
                <h3 className="font-bold capitalize text-atl-archive">
                  {name.replace(/([A-Z])/g, " $1")}
                </h3>
                <p className="mt-2 text-sm leading-6 text-atl-frost">
                  Download the Mermaid source for reuse in docs or external
                  diagram tooling.
                </p>
                <button
                  type="button"
                  onClick={() =>
                    downloadTextFile(
                      `cityhall-${slugify(name)}.mmd`,
                      chart,
                      "text/plain",
                    )
                  }
                  className="mt-4 inline-flex min-h-[34px] items-center justify-center gap-2 rounded-[8px] border border-atl-ridge px-3 text-xs font-black text-atl-archive transition hover:border-atl-silver/70 hover:text-atl-silver"
                >
                  <Download className="h-4 w-4" />
                  Mermaid
                </button>
              </article>
            ),
          )}
        </div>
      </section>
    </div>
  );
};

const ProjectDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [portfolio, setPortfolio] = useState<PortfolioData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  useEffect(() => {
    loadPortfolio()
      .then(setPortfolio)
      .catch((err) =>
        setError(
          err instanceof Error ? err.message : "Failed to load portfolio",
        ),
      );
  }, []);

  const projectIndex = useMemo(
    () => portfolio?.projects.findIndex((project) => project.id === id) ?? -1,
    [portfolio, id],
  );
  const project =
    projectIndex >= 0 ? (portfolio?.projects[projectIndex] ?? null) : null;
  const previous =
    portfolio && projectIndex > 0 ? portfolio.projects[projectIndex - 1] : null;
  const next =
    portfolio &&
    projectIndex >= 0 &&
    projectIndex < portfolio.projects.length - 1
      ? portfolio.projects[projectIndex + 1]
      : null;
  const tabs = project ? getProjectTabs(project) : defaultTabs;

  useEffect(() => {
    if (project && !tabs.some((tab) => tab.id === activeTab)) {
      setActiveTab(tabs[0].id);
    }
  }, [activeTab, project, tabs]);

  const goTo = (target: ProjectRecord | null) => {
    if (target) navigate(`/project/${target.id}`);
  };

  if (error) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center text-atl-archive">
        <h1 className="text-3xl font-black">Project data did not load</h1>
        <p className="mt-3 text-atl-silver">{error}</p>
      </div>
    );
  }

  if (!portfolio) return <LoadingSpinner />;

  if (!project) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center text-atl-archive">
        <h1 className="text-3xl font-black">Project not found</h1>
        <Link className="mt-5 inline-flex text-atl-archive" to="/">
          Back to project portfolio
        </Link>
      </div>
    );
  }

  if (project.id === "filecabinet") {
    return (
      <FileCabinetProjectPage
        project={project}
        portfolio={portfolio}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
    );
  }

  if (project.id !== "cityhall") {
    return (
      <ProjectDossierPage
        project={project}
        portfolio={portfolio}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
    );
  }

  return (
    <div className="min-h-screen text-atl-archive">
      <MetaTags
        title={`${project.name} | Aptlantis Project Portfolio`}
        description={project.summary}
        canonicalUrl={`https://aptlantis.studio/project/${project.id}`}
        ogTitle={`${project.name} | Aptlantis`}
        ogDescription={project.summary}
        ogImage={project.logoSrc}
      />

      <main className="mx-auto max-w-6xl px-4 py-10">
        <nav
          className="mb-8 flex items-center gap-2 text-sm text-atl-frost"
          aria-label="Breadcrumb"
        >
          <Link
            to="/"
            className="text-atl-frost no-underline hover:text-atl-archive"
          >
            Home
          </Link>
          <span>/</span>
          <span className="text-atl-silver">{project.name}</span>
        </nav>

        <section className="atl-panel mb-8 p-5">
          <h2 className="atl-eyebrow mb-4">Browse Projects</h2>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => goTo(previous)}
              disabled={!previous}
              className="grid h-10 w-10 place-items-center rounded-full border border-atl-ridge bg-atl-steel/60 text-atl-silver transition hover:border-atl-silver hover:text-atl-archive disabled:opacity-30"
              aria-label="Previous project"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <input
              type="range"
              min={0}
              max={portfolio.projects.length - 1}
              value={projectIndex}
              onChange={(event) =>
                navigate(
                  `/project/${portfolio.projects[Number(event.target.value)].id}`,
                )
              }
              className="h-2 flex-1 accent-atl-silver"
              aria-label="Browse projects"
            />
            <button
              type="button"
              onClick={() => goTo(next)}
              disabled={!next}
              className="grid h-10 w-10 place-items-center rounded-full border border-atl-ridge bg-atl-navy/70 text-atl-silver transition hover:border-atl-silver hover:bg-atl-ridge/60 hover:text-atl-archive disabled:opacity-30"
              aria-label="Next project"
            >
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
          <p className="mt-3 text-center text-sm text-atl-frost">
            {projectIndex + 1} of {portfolio.projects.length}:{" "}
            <span className="font-bold text-atl-silver">{project.name}</span>
          </p>
        </section>

        <header className="atl-panel atl-ornament mb-10 grid gap-6 p-6 md:grid-cols-[150px_1fr]">
          <img
            src={project.logoSrc}
            alt={`${project.name} logo`}
            className="h-36 w-36 rounded-[8px] border border-atl-ridge object-cover shadow-xl shadow-black/40"
          />
          <div>
            <div className="mb-3 flex flex-wrap gap-2">
              <span
                className={`rounded-[6px] border px-2 py-1 text-xs font-black uppercase ${statusTone(project.status)}`}
              >
                {project.status}
              </span>
              {project.lifecycle && (
                <span className="rounded-[6px] border border-atl-ridge bg-atl-void/60 px-2 py-1 text-xs font-black uppercase text-atl-frost">
                  {project.lifecycle}
                </span>
              )}
              <span className="rounded-[6px] border border-atl-mist/30 bg-atl-navy/50 px-2 py-1 text-xs font-black uppercase text-atl-silver">
                {project.governanceGroup}
              </span>
            </div>
            <h1 className="atl-title atl-gradient-text text-5xl font-black">
              {project.name}
            </h1>
            <p className="mt-4 max-w-4xl text-xl leading-8 text-atl-silver">
              {project.summary}
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              {project.repoUrl && (
                <a
                  href={project.repoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="atl-button min-h-[38px] px-4 text-sm no-underline"
                >
                  Visit Repository <ExternalLink className="h-4 w-4" />
                </a>
              )}
              <CopyButton text={project.cloneCommand} label="Copy git clone" />
            </div>
          </div>
        </header>

        <div className="mb-8 flex flex-wrap border-b border-atl-ridge/70">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              data-testid={`project-tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={`min-h-[44px] px-4 text-sm font-black transition ${
                activeTab === tab.id
                  ? "border-b-2 border-atl-silver text-atl-silver"
                  : "text-atl-frost hover:text-atl-archive"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "overview" && (
          <div className="space-y-6">
            <section>
              <h2 className="mb-3 text-3xl font-bold text-atl-archive">
                About {project.name}
              </h2>
              <p className="max-w-5xl text-base leading-8 text-atl-silver">
                {project.ecosystemRole || project.summary}
              </p>
            </section>
            <div className="grid gap-4 md:grid-cols-3">
              <ProgressBar label="Overall" value={project.completion} />
              <ProgressBar
                label="Operational"
                value={project.operationalCompleteness}
              />
              <ProgressBar
                label="Product"
                value={project.productCompleteness}
              />
            </div>
            <DataList title="Capabilities" items={project.capabilities} />
            <DataList title="Interfaces" items={project.interfaces} />
            <DataList title="Outputs" items={project.produces} />
            <DataList title="Dependencies" items={project.dependsOn} />
            <ProjectMap project={project} />
            <DataList title="Next Steps" items={project.nextSteps} />
            <DataList title="Missing Pieces" items={project.missingPieces} />
          </div>
        )}

        {activeTab === "usage" && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-atl-archive">Usage</h2>
            {project.id === "clone-cratesio" ? (
              <CloneCratesUsage project={project} />
            ) : project.id === "filecabinet" ? (
              <FileCabinetUsage project={project} />
            ) : project.id === "chatarchive" ? (
              <ChatArchiveUsage project={project} />
            ) : project.frameworkSuite ? (
              <FrameworkUsage project={project} />
            ) : (
              <>
                <CommandBuilder
                  schemaId={project.commandWizardSchema}
                  fallbackHelp={project.helpOutput}
                />
                {project.helpOutput && (
                  <section className="atl-card p-5">
                    <h3 className="mb-4 text-xl font-bold text-atl-archive">
                      Help Output
                    </h3>
                    <CodeBlock
                      code={project.helpOutput}
                      language="bash"
                      maxHeight="max-h-[540px]"
                    />
                  </section>
                )}
                {!project.commandWizardSchema && !project.helpOutput && (
                  <section className="atl-card p-5">
                    <h3 className="mb-4 text-xl font-bold text-atl-archive">
                      Operating Notes
                    </h3>
                    <div className="grid gap-3 md:grid-cols-2">
                      {[...project.interfaces, ...project.documentationOutputs]
                        .slice(0, 12)
                        .map((item) => (
                          <div
                            key={item}
                            className="rounded-[6px] border border-atl-ridge/70 bg-atl-void/60 px-4 py-3 text-sm text-atl-silver"
                          >
                            {item}
                          </div>
                        ))}
                    </div>
                  </section>
                )}
              </>
            )}
          </div>
        )}

        {activeTab === "visualizations" && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-atl-archive">
              {project.name} Visualizations
            </h2>
            {project.frameworkSuite && (
              <>
                <FrameworkForceGraph project={project} />
                <section className="grid gap-4 lg:grid-cols-3">
                  <div className="atl-card p-5">
                    <h3 className="mb-3 text-lg font-bold text-atl-archive">
                      Operating Model
                    </h3>
                    <CodeBlock
                      code={project.frameworkSuite.mermaid.operatingModel}
                      language="mermaid"
                    />
                  </div>
                  <div className="atl-card p-5">
                    <h3 className="mb-3 text-lg font-bold text-atl-archive">
                      Adoption Flow
                    </h3>
                    <CodeBlock
                      code={project.frameworkSuite.mermaid.adoptionFlow}
                      language="mermaid"
                    />
                  </div>
                  <div className="atl-card p-5">
                    <h3 className="mb-3 text-lg font-bold text-atl-archive">
                      Artifact Chain
                    </h3>
                    <CodeBlock
                      code={project.frameworkSuite.mermaid.artifactChain}
                      language="mermaid"
                    />
                  </div>
                </section>
              </>
            )}
            {project.video && (
              <figure className="overflow-hidden rounded-[8px] border border-atl-ridge/70 bg-atl-abyss/80">
                <video
                  controls
                  className="aspect-video w-full bg-black"
                  poster={project.screenshots[0]?.src}
                >
                  <source src={project.video.src} />
                  {project.video.captions && (
                    <track
                      src={project.video.captions}
                      kind="captions"
                      srcLang="en"
                      label="English"
                    />
                  )}
                </video>
                <figcaption className="p-4">
                  <h3 className="font-bold text-atl-archive">
                    {project.video.title}
                  </h3>
                  <p className="mt-1 text-sm text-atl-frost">
                    {project.video.description}
                  </p>
                </figcaption>
              </figure>
            )}
            {!project.frameworkSuite && project.screenshots.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {project.screenshots.map((screenshot) => (
                  <figure
                    key={screenshot.src}
                    className="overflow-hidden rounded-[8px] border border-atl-ridge/70 bg-atl-abyss/80"
                  >
                    <img
                      src={screenshot.src}
                      alt={screenshot.caption}
                      className="h-auto w-full"
                    />
                    <figcaption className="p-4 text-sm text-atl-silver">
                      {screenshot.caption}
                    </figcaption>
                  </figure>
                ))}
              </div>
            ) : (
              !project.frameworkSuite && (
                <div className="atl-card p-8 text-atl-silver">
                  Curated project imagery or visualization data has not been
                  added for this project yet.
                </div>
              )
            )}
          </div>
        )}

        {activeTab === "screenshots" && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-atl-archive">
              {project.name} Screenshots
            </h2>
            {project.screenshots.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {project.screenshots.map((screenshot) => (
                  <figure
                    key={screenshot.src}
                    className="overflow-hidden rounded-[8px] border border-atl-ridge/70 bg-atl-abyss/80"
                  >
                    <img
                      src={screenshot.src}
                      alt={screenshot.caption}
                      className="h-auto w-full"
                    />
                    <figcaption className="p-4 text-sm text-atl-silver">
                      {screenshot.caption}
                    </figcaption>
                  </figure>
                ))}
              </div>
            ) : (
              <div className="atl-card p-8 text-atl-silver">
                Curated screenshots have not been added for this project yet.
              </div>
            )}
          </div>
        )}

        {activeTab === "command-builder" && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-atl-archive">
              Command Builder
            </h2>
            <CommandBuilder
              schemaId={project.commandWizardSchema}
              fallbackHelp={project.helpOutput}
            />
          </div>
        )}

        {activeTab === "structra-lab" && (
          <div className="space-y-6">
            <section className="atl-panel atl-ornament grid gap-5 p-6 lg:grid-cols-[1fr_280px]">
              <div>
                <p className="atl-eyebrow">Browser Teaching Surface</p>
                <h2 className="atl-title mt-3 text-4xl font-black">
                  Structra Lab
                </h2>
                <p className="atl-subtitle mt-4 max-w-3xl">
                  The full Structra project is a Tauri desktop app. The site lab
                  is a smaller browser-safe cousin that demonstrates the core
                  workflow: visual fields and workflow steps become structured
                  JSON, schema, and YAML output.
                </p>
              </div>
              <div className="atl-card p-4">
                <h3 className="mb-2 font-bold text-atl-archive">
                  Scope boundary
                </h3>
                <p className="text-sm leading-6 text-atl-silver">
                  The lab does not use Structra&apos;s Tauri backend, Rust
                  commands, React Flow canvas, or packaging layer. It is a
                  teaching surface for the model, not release evidence.
                </p>
                <Link
                  to="/structra-lab"
                  className="atl-button mt-4 min-h-[38px] px-4 text-sm no-underline"
                >
                  Open Structra Lab <ExternalLink className="h-4 w-4" />
                </Link>
              </div>
            </section>

            <section className="grid gap-4 md:grid-cols-3">
              {[
                [
                  "Inputs",
                  "Visual field definitions, binding paths, example values, workflow steps, and dependencies.",
                ],
                [
                  "Model",
                  "A structured document plus workflow graph that can be validated before export.",
                ],
                [
                  "Outputs",
                  "JSON values, JSON Schema-style previews, portable YAML, GitHub Actions, and GitLab CI shapes.",
                ],
              ].map(([title, body]) => (
                <div key={title} className="atl-card p-5">
                  <h3 className="mb-2 text-xl font-bold text-atl-archive">
                    {title}
                  </h3>
                  <p className="text-sm leading-6 text-atl-silver">{body}</p>
                </div>
              ))}
            </section>
          </div>
        )}

        {activeTab === "explainer-video" && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-atl-archive">
              Explainer Video
            </h2>
            {project.video ? (
              <figure className="overflow-hidden rounded-[8px] border border-atl-ridge/70 bg-atl-abyss/80">
                <video
                  controls
                  className="aspect-video w-full bg-black"
                  poster={project.screenshots[0]?.src}
                >
                  <source src={project.video.src} />
                  {project.video.captions && (
                    <track
                      src={project.video.captions}
                      kind="captions"
                      srcLang="en"
                      label="English"
                    />
                  )}
                </video>
                <figcaption className="p-4">
                  <h3 className="font-bold text-atl-archive">
                    {project.video.title}
                  </h3>
                  <p className="mt-1 text-sm text-atl-frost">
                    {project.video.description}
                  </p>
                </figcaption>
              </figure>
            ) : (
              <div className="atl-card p-8 text-atl-silver">
                No explainer video has been curated for this project yet.
              </div>
            )}
          </div>
        )}

        {activeTab === "execution-evidence" && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-atl-archive">
              Execution Evidence
            </h2>
            <DataList title="Outputs" items={project.produces} />
            <DataList
              title="Documentation Evidence"
              items={project.documentationOutputs}
            />
            <DataList
              title="Next Verification Steps"
              items={project.nextSteps}
            />
          </div>
        )}

        {["planning-workflow", "workflow"].includes(activeTab) && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-atl-archive">Workflow</h2>
            <DataList title="Interfaces" items={project.interfaces} />
            <DataList title="Inputs" items={project.consumes} />
            <DataList title="Outputs" items={project.produces} />
          </div>
        )}

        {["safety-model", "trust-repair-model"].includes(activeTab) && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-atl-archive">
              Trust And Safety Model
            </h2>
            <DataList title="Capabilities" items={project.capabilities} />
            <DataList title="Missing Pieces" items={project.missingPieces} />
            <DataList
              title="Potential Improvements"
              items={project.potentialImprovements}
            />
          </div>
        )}

        {["architecture", "transaction-diagrams", "storage-model"].includes(
          activeTab,
        ) && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-atl-archive">
              Architecture
            </h2>
            <ProjectMap project={project} />
            <DataList title="Dependencies" items={project.dependsOn} />
            <DataList title="Used By" items={project.usedBy} />
          </div>
        )}

        {activeTab === "downloads-templates" && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-atl-archive">
              Downloads And Templates
            </h2>
            <FrameworkDownloads project={project} />
          </div>
        )}
      </main>
    </div>
  );
};

export default ProjectDetailPage;

import { Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  Copy,
  Download,
  ExternalLink,
} from "lucide-react";
import { Fragment, useState } from "react";
import type { ProjectRecord } from "../types";

export const statusTone = (status: string): string => {
  const normalized = status.toLowerCase();
  if (normalized.includes("production") || normalized.includes("active")) {
    return "border-atl-success/40 bg-atl-success/10 text-atl-success";
  }
  if (normalized.includes("progress") || normalized.includes("prototype")) {
    return "border-atl-mist/40 bg-atl-mist/10 text-atl-silver";
  }
  if (normalized.includes("paused")) {
    return "border-atl-warning/40 bg-atl-warning/10 text-atl-warning";
  }
  if (normalized.includes("blocked")) {
    return "border-atl-danger/40 bg-atl-danger/10 text-atl-danger";
  }
  return "border-atl-smoke/40 bg-atl-steel/40 text-atl-silver";
};

export const ProgressBar = ({
  label,
  value,
}: {
  label: string;
  value: number;
}) => (
  <div className="atl-card-soft p-4">
    <div className="mb-3 flex items-center justify-between gap-4 text-sm">
      <span className="font-semibold text-atl-silver">{label}</span>
      <span className="font-bold text-atl-archive">{Math.round(value)}%</span>
    </div>
    <div className="h-2 overflow-hidden rounded-full bg-atl-void">
      <div
        className="h-full rounded-full bg-atl-silver"
        style={{ width: `${Math.min(value, 100)}%` }}
      />
    </div>
  </div>
);

export const CopyButton = ({
  text,
  label = "Copy",
  className = "",
  testId,
}: {
  text: string;
  label?: string;
  className?: string;
  testId?: string;
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.setAttribute("readonly", "true");
      textArea.style.position = "fixed";
      textArea.style.opacity = "0";
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      disabled={!text}
      data-testid={testId}
      className={`inline-flex min-h-[34px] items-center justify-center gap-2 rounded-[8px] border border-atl-ridge bg-atl-abyss px-3 text-xs font-bold text-atl-silver transition hover:border-atl-silver/70 hover:text-atl-archive disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    >
      <Copy className="h-3.5 w-3.5" />
      {copied ? "Copied" : label}
    </button>
  );
};

const logosThemesStages = [
  {
    title: "AptlantisLogos",
    label: "logo source",
    icon: "/projects/logos-themes/logos/apt-ada-logo.svg",
    tone: "border-cyan-300/35 bg-cyan-300/10 text-cyan-100",
  },
  {
    title: "LangThemeGenerator",
    label: "theme outputs",
    icon: "/projects/logos-themes/logos/apt-vue-logo.svg",
    tone: "border-emerald-300/35 bg-emerald-300/10 text-emerald-100",
  },
];

const LogosThemesProjectCard = ({ project }: { project: ProjectRecord }) => (
  <article className="atl-card group flex h-full flex-col overflow-hidden p-5 transition hover:-translate-y-1 hover:border-atl-silver/70 hover:shadow-xl hover:shadow-atl-void/40">
    <Link
      to={`/project/${project.id}`}
      className="flex flex-1 flex-col no-underline"
    >
      <div className="mb-4 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        {logosThemesStages.map((stage, index) => (
          <Fragment key={stage.title}>
            <div
              className="rounded-[8px] border border-atl-ridge bg-atl-void/55 p-2"
            >
              <img
                src={stage.icon}
                alt={`${stage.title} logo`}
                className="mx-auto h-16 w-16 rounded-[6px] object-cover shadow-lg shadow-black/40"
              />
              <div
                className={`mt-2 truncate rounded-[5px] border px-1.5 py-1 text-center text-[10px] font-black uppercase ${stage.tone}`}
              >
                {stage.label}
              </div>
            </div>
            {index === 0 && (
              <ArrowRight
                className="h-5 w-5 text-atl-mist"
              />
            )}
          </Fragment>
        ))}
      </div>
      <div className="mb-2 flex flex-wrap items-center justify-center gap-2">
        <span
          className={`rounded-[6px] border px-2 py-1 text-[11px] font-bold uppercase tracking-normal ${statusTone(project.status)}`}
        >
          {project.status}
        </span>
        <span className="rounded-[6px] border border-violet-300/35 bg-violet-300/10 px-2 py-1 text-[11px] font-bold uppercase text-violet-100">
          pipeline umbrella
        </span>
      </div>
      <h3 className="text-center text-xl font-bold text-atl-archive">
        {project.name}
      </h3>
      <p className="atl-muted mt-3 text-center text-sm leading-6">
        Language logos feed generated IDE, terminal, and web themes, then
        publish through the live Atlas picker.
      </p>
      <div className="mt-4 grid gap-2">
        {[
          ["60", "languages"],
          ["300", "theme files"],
          ["6", "targets"],
        ].map(([value, label]) => (
          <div
            key={label}
            className="flex items-center justify-between rounded-[6px] border border-atl-ridge/70 bg-atl-void/45 px-3 py-2 text-xs"
          >
            <span className="text-atl-frost">{label}</span>
            <span className="font-black text-atl-archive">{value}</span>
          </div>
        ))}
      </div>
      <div className="mt-4">
        <ProgressBar label="Pipeline readiness" value={project.completion} />
      </div>
    </Link>
    <div className="mt-4 grid gap-2">
      <Link
        to="/language-atlas"
        className="atl-button min-h-[38px] px-4 text-sm no-underline"
      >
        Open Language Atlas <ArrowUpRight className="h-4 w-4" />
      </Link>
      <Link
        to={`/project/${project.id}`}
        className="inline-flex min-h-[34px] items-center justify-center gap-2 rounded-[8px] border border-atl-ridge bg-atl-abyss px-3 text-xs font-bold text-atl-silver no-underline transition hover:border-atl-silver/70 hover:text-atl-archive"
      >
        Inspect Pipeline <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  </article>
);

export const ProjectCard = ({ project }: { project: ProjectRecord }) => {
  if (project.id === "logos-themes") {
    return <LogosThemesProjectCard project={project} />;
  }

  return (
    <article className="atl-card group flex h-full flex-col p-5 transition hover:-translate-y-1 hover:border-atl-silver/70 hover:shadow-xl hover:shadow-atl-void/40">
    <Link
      to={`/project/${project.id}`}
      className="flex flex-1 flex-col no-underline"
    >
      <div className="mb-4 flex justify-center">
        <img
          src={project.logoSrc}
          alt={`${project.name} logo`}
          className="h-24 w-24 rounded-[8px] border border-atl-ridge object-cover shadow-lg shadow-black/40 transition group-hover:scale-[1.03]"
        />
      </div>
      <div className="mb-2 flex flex-wrap items-center justify-center gap-2">
        <span
          className={`rounded-[6px] border px-2 py-1 text-[11px] font-bold uppercase tracking-normal ${statusTone(project.status)}`}
        >
          {project.status}
        </span>
        {project.lifecycle && (
          <span className="rounded-[6px] border border-atl-ridge bg-atl-void/70 px-2 py-1 text-[11px] font-bold uppercase text-atl-frost">
            {project.lifecycle}
          </span>
        )}
      </div>
      <h3 className="text-center text-xl font-bold text-atl-archive">
        {project.name}
      </h3>
      <div className="mt-4 flex flex-wrap justify-center gap-1.5">
        {project.tags.slice(0, 4).map((tag) => (
          <span
            key={tag}
            className="rounded-[6px] border border-atl-mist/30 bg-atl-navy/50 px-2 py-1 text-xs text-atl-silver"
          >
            {tag}
          </span>
        ))}
      </div>
      <p className="atl-muted mt-4 flex-1 text-center text-sm leading-6">
        {project.summary}
      </p>
      <div className="mt-5">
        <ProgressBar label="Completion" value={project.completion} />
      </div>
    </Link>
    <div className="mt-4 grid gap-2">
      {project.repoUrl ? (
        <a
          href={project.repoUrl}
          target="_blank"
          rel="noreferrer"
          className="atl-button min-h-[38px] px-4 text-sm no-underline"
        >
          Visit Repository <ExternalLink className="h-4 w-4" />
        </a>
      ) : (
        <Link
          to={`/project/${project.id}`}
          className="atl-button min-h-[38px] px-4 text-sm no-underline"
        >
          View Project <ArrowUpRight className="h-4 w-4" />
        </Link>
      )}
      <CopyButton text={project.cloneCommand} label="Copy git clone" />
    </div>
  </article>
  );
};

export const DownloadScriptButton = ({
  command,
  testId,
}: {
  command: string;
  testId?: string;
}) => {
  const script = `# Generated by aptlantis.studio CommandWizard\n${command}\n`;

  return (
    <a
      href={`data:text/plain;charset=utf-8,${encodeURIComponent(script)}`}
      download="aptlantis-command.ps1"
      data-testid={testId}
      className="inline-flex min-h-[34px] items-center justify-center gap-2 rounded-[8px] border border-atl-ridge bg-atl-abyss px-3 text-xs font-bold text-atl-silver no-underline transition hover:border-atl-silver/70 hover:text-atl-archive"
    >
      <Download className="h-3.5 w-3.5" />
      Download PS1
    </a>
  );
};

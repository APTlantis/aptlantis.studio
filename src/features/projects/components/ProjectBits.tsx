import { Link } from "react-router-dom";
import { ArrowUpRight, Copy, Download, ExternalLink } from "lucide-react";
import { useState } from "react";
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

export const ProjectCard = ({ project }: { project: ProjectRecord }) => (
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

import { useEffect, useId, useMemo, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { loadCommandSchemas } from "../data/portfolioLoader";
import type { CommandArgument, CommandSchema } from "../types";
import { CodeBlock } from "./CodeBlock";
import { CopyButton, DownloadScriptButton } from "./ProjectBits";

const defaultFor = (argument: CommandArgument): string | boolean => {
  if (argument.type === "boolean") {
    return argument.default === "true";
  }
  return argument.default || "";
};

const quoteIfNeeded = (value: string): string => {
  if (!value) return "";
  if (/[\s;]/.test(value)) return `"${value.replace(/"/g, '\\"')}"`;
  return value;
};

const argumentName = (argument: CommandArgument): string => {
  if (argument.long) return `--${argument.long}`;
  if (argument.flag) return `-${argument.flag}`;
  return "";
};

const buildCommand = (
  schema: CommandSchema,
  values: Record<string, string | boolean>,
): string => {
  const parts = [schema.tool.installedName || schema.tool.name];
  for (const argument of schema.arguments) {
    const name = argumentName(argument);
    if (!name) continue;
    const value =
      values[argument.long || argument.flag || argument.description];
    if (argument.type === "boolean") {
      if (value === true) parts.push(name);
      continue;
    }
    if (typeof value === "string" && value.trim()) {
      parts.push(name, quoteIfNeeded(value.trim()));
    }
  }
  return parts.join(" ");
};

export const CommandBuilder = ({
  schemaId,
  fallbackHelp,
}: {
  schemaId: string | null;
  fallbackHelp?: string;
}) => {
  const inputIdPrefix = useId();
  const [schema, setSchema] = useState<CommandSchema | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [values, setValues] = useState<Record<string, string | boolean>>({});

  useEffect(() => {
    if (!schemaId) return;
    loadCommandSchemas()
      .then((schemas) => {
        const selected = schemas[schemaId];
        if (!selected) {
          throw new Error(`Command schema "${schemaId}" was not found.`);
        }
        setSchema(selected);
        setValues(
          Object.fromEntries(
            selected.arguments.map((argument) => [
              argument.long || argument.flag || argument.description,
              defaultFor(argument),
            ]),
          ),
        );
      })
      .catch((err) =>
        setError(
          err instanceof Error ? err.message : "Failed to load command schema",
        ),
      );
  }, [schemaId]);

  const validationErrors = useMemo(() => {
    if (!schema) return [];
    return schema.arguments
      .filter((argument) => argument.required)
      .filter((argument) => {
        const value =
          values[argument.long || argument.flag || argument.description];
        return value === "" || value === false || value === undefined;
      })
      .map((argument) => `${argumentName(argument)} is required`);
  }, [schema, values]);

  const command = schema ? buildCommand(schema, values) : "";

  if (!schemaId) {
    return fallbackHelp ? (
      <CodeBlock code={fallbackHelp} language="bash" />
    ) : (
      <div className="atl-card p-5 text-atl-silver">
        No command schema has been curated for this project yet.
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-[8px] border border-rose-400/30 bg-rose-400/10 p-4 text-rose-100">
        {error}
      </div>
    );
  }

  if (!schema) {
    return (
      <div className="atl-card p-5 text-atl-silver">
        Loading command schema...
      </div>
    );
  }

  return (
    <div className="atl-card p-5">
      <div className="mb-5">
        <h3 className="text-xl font-bold text-atl-archive">Build a command</h3>
        <p className="mt-1 text-sm text-atl-frost">{schema.tool.description}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {schema.arguments.map((argument) => {
          const key = argument.long || argument.flag || argument.description;
          const label = argument.long
            ? `--${argument.long}`
            : argument.flag
              ? `-${argument.flag}`
              : argument.description;
          const inputId = `${inputIdPrefix}-${key.replace(/[^a-z0-9_-]/gi, "-")}`;
          if (argument.type === "boolean") {
            return (
              <div
                key={key}
                className="atl-card-soft flex min-h-[44px] items-center gap-3 px-3 text-sm text-atl-silver"
              >
                <input
                  id={inputId}
                  type="checkbox"
                  checked={values[key] === true}
                  onChange={(event) =>
                    setValues((current) => ({
                      ...current,
                      [key]: event.target.checked,
                    }))
                  }
                  className="h-4 w-4 accent-atl-silver"
                />
                <label htmlFor={inputId}>
                  <span className="font-bold text-atl-archive">{label}</span>
                  <span className="ml-2 text-atl-frost">
                    {argument.description}
                  </span>
                </label>
              </div>
            );
          }

          return (
            <label
              htmlFor={inputId}
              key={key}
              className="grid gap-2 text-sm font-semibold text-atl-silver"
            >
              <span>
                {label}
                {argument.required && (
                  <span className="text-atl-archive"> required</span>
                )}
              </span>
              <input
                id={inputId}
                type={argument.type === "number" ? "number" : "text"}
                value={String(values[key] || "")}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    [key]: event.target.value,
                  }))
                }
                placeholder={argument.description}
                className="min-h-[42px] rounded-[8px] border border-atl-ridge bg-atl-void/70 px-3 text-sm text-atl-archive outline-none transition placeholder:text-atl-smoke focus:border-atl-silver"
              />
            </label>
          );
        })}
      </div>

      {validationErrors.length > 0 && (
        <div className="mt-5 rounded-[8px] border border-amber-300/30 bg-amber-300/10 p-3 text-sm text-amber-100">
          <div className="mb-1 flex items-center gap-2 font-bold">
            <AlertTriangle className="h-4 w-4" />
            Pre-flight notes
          </div>
          {validationErrors.join(", ")}
        </div>
      )}

      <div className="mt-5 rounded-[8px] border border-atl-ridge bg-atl-void/70">
        <div className="flex items-center justify-between border-b border-atl-ridge/60 px-4 py-2">
          <span className="text-xs font-bold uppercase text-atl-frost">
            Generated command
          </span>
          <div className="flex gap-2">
            <CopyButton text={command} testId="generated-command-copy" />
            <DownloadScriptButton
              command={command}
              testId="generated-command-download"
            />
          </div>
        </div>
        <CodeBlock code={command} language="powershell" />
      </div>

      {schema.examples && schema.examples.length > 0 && (
        <div className="mt-6">
          <h3 className="mb-3 text-lg font-bold text-atl-archive">
            Example Commands
          </h3>
          <div className="grid gap-3">
            {schema.examples.map((example) => (
              <div
                key={example.title}
                className="rounded-[8px] border border-atl-ridge bg-atl-void/70"
              >
                <div className="flex items-center justify-between border-b border-atl-ridge/60 px-4 py-2">
                  <span className="text-sm font-bold text-atl-silver">
                    {example.title}
                  </span>
                  <CopyButton text={example.command} />
                </div>
                <CodeBlock code={example.command} language="powershell" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

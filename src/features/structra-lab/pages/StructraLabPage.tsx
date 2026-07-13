import { useMemo, useState } from "react";
import {
  ArrowRight,
  Braces,
  CheckCircle2,
  Copy,
  Download,
  GitBranch,
  Layers3,
  Plus,
  ShieldCheck,
  Workflow,
} from "lucide-react";
import MetaTags from "../../../components/MetaTags";

type FieldKind = "string" | "number" | "boolean" | "object";
type ExportTarget = "portable" | "github-actions" | "gitlab-ci";

type StructraField = {
  id: string;
  label: string;
  binding: string;
  kind: FieldKind;
  required: boolean;
  example: string;
};

type StructraStep = {
  id: string;
  name: string;
  kind: "run" | "uses" | "approval";
  command: string;
  needs: string[];
};

const initialFields: StructraField[] = [
  {
    id: "field-project",
    label: "Project Name",
    binding: "project.name",
    kind: "string",
    required: true,
    example: "Structra",
  },
  {
    id: "field-version",
    label: "Version",
    binding: "project.version",
    kind: "string",
    required: true,
    example: "1.0.0",
  },
  {
    id: "field-release",
    label: "Release Verified",
    binding: "verification.release_verified",
    kind: "boolean",
    required: false,
    example: "false",
  },
];

const initialSteps: StructraStep[] = [
  {
    id: "step-schema",
    name: "Generate JSON Schema",
    kind: "run",
    command: "structra export --mode schema --format json --out schema.json",
    needs: [],
  },
  {
    id: "step-validate",
    name: "Validate examples",
    kind: "run",
    command: "structra validate --schema schema.json --input examples/*.json",
    needs: ["step-schema"],
  },
  {
    id: "step-review",
    name: "Review evidence",
    kind: "approval",
    command: "manual review before publishing generated artifacts",
    needs: ["step-validate"],
  },
];

const fieldKinds: FieldKind[] = ["string", "number", "boolean", "object"];
const exportTargets: ExportTarget[] = [
  "portable",
  "github-actions",
  "gitlab-ci",
];

const titleCase = (value: string) =>
  value
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => `${part.slice(0, 1).toUpperCase()}${part.slice(1)}`)
    .join(" ");

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "") || "step";

const coerceExample = (field: StructraField): unknown => {
  if (field.kind === "number") {
    const parsed = Number(field.example);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  if (field.kind === "boolean") {
    return field.example.toLowerCase() === "true";
  }
  if (field.kind === "object") {
    return {};
  }
  return field.example;
};

const assignPath = (
  target: Record<string, unknown>,
  path: string,
  value: unknown,
) => {
  const parts = path
    .split(".")
    .map((part) => part.trim())
    .filter(Boolean);
  if (!parts.length) return;
  let cursor = target;
  parts.slice(0, -1).forEach((part) => {
    const next = cursor[part];
    if (!next || typeof next !== "object" || Array.isArray(next)) {
      cursor[part] = {};
    }
    cursor = cursor[part] as Record<string, unknown>;
  });
  cursor[parts[parts.length - 1]] = value;
};

const buildValues = (fields: StructraField[]) => {
  const output: Record<string, unknown> = {};
  fields.forEach((field) =>
    assignPath(output, field.binding, coerceExample(field)),
  );
  return output;
};

const buildSchema = (fields: StructraField[]) => {
  const properties: Record<string, unknown> = {};
  const required: string[] = [];
  fields.forEach((field) => {
    assignPath(properties, field.binding, {
      type: field.kind === "object" ? "object" : field.kind,
      title: field.label,
    });
    if (field.required) required.push(field.binding);
  });
  return {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    title: "Structra Lab Export",
    type: "object",
    properties,
    "x-required-paths": required,
  };
};

const workflowYaml = (steps: StructraStep[], target: ExportTarget) => {
  if (target === "github-actions") {
    return [
      "name: Structra Lab Workflow",
      "on: workflow_dispatch",
      "jobs:",
      ...steps
        .flatMap((step) => [
          `  ${step.id}:`,
          "    runs-on: ubuntu-latest",
          step.needs.length ? `    needs: [${step.needs.join(", ")}]` : "",
          "    steps:",
          step.kind === "uses"
            ? `      - uses: ${step.command || "actions/checkout@v4"}`
            : `      - run: ${JSON.stringify(step.command || step.name)}`,
        ])
        .filter(Boolean),
    ].join("\n");
  }

  if (target === "gitlab-ci") {
    return steps
      .flatMap((step) => [
        `${step.id}:`,
        "  stage: build",
        step.needs.length ? `  needs: [${step.needs.join(", ")}]` : "",
        `  script: ${JSON.stringify(step.command || step.name)}`,
      ])
      .filter(Boolean)
      .join("\n");
  }

  return [
    "version: 1.0.0",
    "name: Structra Lab Workflow",
    "steps:",
    ...steps.flatMap((step) => [
      `  - id: ${step.id}`,
      `    name: ${JSON.stringify(step.name)}`,
      `    kind: ${step.kind}`,
      `    command: ${JSON.stringify(step.command)}`,
      `    needs: [${step.needs.join(", ")}]`,
    ]),
  ].join("\n");
};

const validateLab = (fields: StructraField[], steps: StructraStep[]) => {
  const issues: string[] = [];
  const bindings = new Set<string>();
  fields.forEach((field) => {
    if (!field.label.trim()) issues.push("A field has no display label.");
    if (!field.binding.trim())
      issues.push(`${field.label || "A field"} has no binding path.`);
    if (bindings.has(field.binding))
      issues.push(`${field.binding} is used more than once.`);
    bindings.add(field.binding);
  });

  const stepIds = new Set(steps.map((step) => step.id));
  steps.forEach((step) => {
    if (!step.name.trim()) issues.push(`${step.id} has no name.`);
    if (step.kind !== "approval" && !step.command.trim()) {
      issues.push(
        `${step.name || step.id} needs a command or action reference.`,
      );
    }
    step.needs.forEach((need) => {
      if (!stepIds.has(need))
        issues.push(`${step.id} depends on missing step ${need}.`);
      if (need === step.id) issues.push(`${step.id} depends on itself.`);
    });
  });

  return issues;
};

const StructraLabPage = () => {
  const [fields, setFields] = useState(initialFields);
  const [steps, setSteps] = useState(initialSteps);
  const [selectedFieldId, setSelectedFieldId] = useState(initialFields[0].id);
  const [selectedStepId, setSelectedStepId] = useState(initialSteps[0].id);
  const [target, setTarget] = useState<ExportTarget>("portable");
  const [copied, setCopied] = useState<string | null>(null);

  const selectedField =
    fields.find((field) => field.id === selectedFieldId) ?? fields[0];
  const selectedStep =
    steps.find((step) => step.id === selectedStepId) ?? steps[0];
  const values = useMemo(() => buildValues(fields), [fields]);
  const schema = useMemo(() => buildSchema(fields), [fields]);
  const yaml = useMemo(() => workflowYaml(steps, target), [steps, target]);
  const issues = useMemo(() => validateLab(fields, steps), [fields, steps]);
  const graphColumns = useMemo(() => {
    const groups: StructraStep[][] = [];
    steps.forEach((step) => {
      const depth = step.needs.length
        ? Math.max(
            ...step.needs.map(
              (need) =>
                groups.findIndex((group) =>
                  group.some((candidate) => candidate.id === need),
                ) + 1,
            ),
          )
        : 0;
      const index = Math.max(0, depth);
      groups[index] ??= [];
      groups[index].push(step);
    });
    return groups;
  }, [steps]);

  const updateField = (id: string, patch: Partial<StructraField>) =>
    setFields((current) =>
      current.map((field) =>
        field.id === id ? { ...field, ...patch } : field,
      ),
    );

  const updateStep = (id: string, patch: Partial<StructraStep>) =>
    setSteps((current) =>
      current.map((step) => (step.id === id ? { ...step, ...patch } : step)),
    );

  const addField = () => {
    const next = {
      id: `field-${Date.now().toString(36)}`,
      label: "New Field",
      binding: "new.field",
      kind: "string" as FieldKind,
      required: false,
      example: "value",
    };
    setFields((current) => [...current, next]);
    setSelectedFieldId(next.id);
  };

  const addStep = () => {
    const next = {
      id: `step-${slugify(selectedStep?.name || "new-step")}-${steps.length + 1}`,
      name: "New workflow step",
      kind: "run" as const,
      command: 'echo "run step"',
      needs: selectedStep ? [selectedStep.id] : [],
    };
    setSteps((current) => [...current, next]);
    setSelectedStepId(next.id);
  };

  const copyText = async (key: string, value: string) => {
    await navigator.clipboard.writeText(value);
    setCopied(key);
    window.setTimeout(() => setCopied(null), 1400);
  };

  const download = (name: string, value: string) => {
    const url = URL.createObjectURL(
      new Blob([value], { type: "text/plain;charset=utf-8" }),
    );
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = name;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen text-atl-archive">
      <MetaTags
        title="Structra Lab | Aptlantis Studio"
        description="Scaled-down browser lab for structure-oriented workflow assembly and export previews."
        canonicalUrl="https://aptlantis.studio/structra-lab"
        ogTitle="Structra Lab | Aptlantis Studio"
        ogDescription="A browser-safe teaching surface for Structra concepts: fields, dependencies, validation, and generated outputs."
      />

      <main className="atl-container py-8">
        <header className="atl-panel atl-ornament mb-6 grid gap-6 p-6 lg:grid-cols-[1fr_320px]">
          <div>
            <p className="atl-eyebrow">Structra / Teaching Lab</p>
            <h1 className="atl-title atl-gradient-text mt-3 text-5xl font-black">
              Visual Structure. Machine Output.
            </h1>
            <p className="atl-subtitle mt-4 max-w-3xl text-lg">
              This is a scaled-down browser version of Structra's core idea:
              assemble fields and workflow steps visually, then inspect the
              structured JSON, schema, and workflow output that falls out of the
              model.
            </p>
          </div>
          <div className="atl-card p-4">
            <div className="mb-3 flex items-center gap-2 text-atl-archive">
              <ShieldCheck className="h-5 w-5" />
              <h2 className="font-black">Scope note</h2>
            </div>
            <p className="text-sm leading-6 text-atl-silver">
              This lab demonstrates Structra concepts in-browser. It is not the
              full Tauri desktop app, does not use the Rust backend, and does
              not represent installer or release verification.
            </p>
          </div>
        </header>

        <section className="grid gap-5 xl:grid-cols-[280px_minmax(420px,1fr)_390px]">
          <aside className="atl-card p-4">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="font-black text-atl-archive">Structure Fields</h2>
              <button
                type="button"
                onClick={addField}
                className="atl-button min-h-[34px] px-3 text-xs"
              >
                <Plus className="h-4 w-4" />
                Field
              </button>
            </div>
            <div className="space-y-2">
              {fields.map((field) => (
                <button
                  key={field.id}
                  type="button"
                  onClick={() => setSelectedFieldId(field.id)}
                  className={`w-full rounded-[8px] border p-3 text-left transition ${
                    selectedFieldId === field.id
                      ? "border-atl-silver bg-atl-navy/70"
                      : "border-atl-ridge bg-atl-void/50 hover:border-atl-mist"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-atl-archive">
                      {field.label}
                    </span>
                    <span className="atl-tag px-2 py-1">{field.kind}</span>
                  </div>
                  <p className="mt-1 font-mono text-xs text-atl-frost">
                    {field.binding}
                  </p>
                </button>
              ))}
            </div>

            {selectedField && (
              <div className="mt-5 border-t border-atl-ridge/60 pt-4">
                <h3 className="mb-3 font-bold text-atl-archive">
                  Field Inspector
                </h3>
                <div className="grid gap-3 text-sm">
                  <label className="grid gap-1 text-atl-silver">
                    Label
                    <input
                      value={selectedField.label}
                      onChange={(event) =>
                        updateField(selectedField.id, {
                          label: event.target.value,
                        })
                      }
                      className="rounded-[6px] border border-atl-ridge bg-atl-void/70 px-3 py-2 text-atl-archive outline-none focus:border-atl-silver"
                    />
                  </label>
                  <label className="grid gap-1 text-atl-silver">
                    Binding path
                    <input
                      value={selectedField.binding}
                      onChange={(event) =>
                        updateField(selectedField.id, {
                          binding: event.target.value,
                        })
                      }
                      className="rounded-[6px] border border-atl-ridge bg-atl-void/70 px-3 py-2 font-mono text-atl-archive outline-none focus:border-atl-silver"
                    />
                  </label>
                  <label className="grid gap-1 text-atl-silver">
                    Type
                    <select
                      value={selectedField.kind}
                      onChange={(event) =>
                        updateField(selectedField.id, {
                          kind: event.target.value as FieldKind,
                        })
                      }
                      className="rounded-[6px] border border-atl-ridge bg-atl-void/70 px-3 py-2 text-atl-archive outline-none focus:border-atl-silver"
                    >
                      {fieldKinds.map((kind) => (
                        <option key={kind} value={kind}>
                          {kind}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="grid gap-1 text-atl-silver">
                    Example value
                    <input
                      value={selectedField.example}
                      onChange={(event) =>
                        updateField(selectedField.id, {
                          example: event.target.value,
                        })
                      }
                      className="rounded-[6px] border border-atl-ridge bg-atl-void/70 px-3 py-2 text-atl-archive outline-none focus:border-atl-silver"
                    />
                  </label>
                  <label className="flex items-center gap-2 text-atl-silver">
                    <input
                      type="checkbox"
                      checked={selectedField.required}
                      onChange={(event) =>
                        updateField(selectedField.id, {
                          required: event.target.checked,
                        })
                      }
                      className="h-4 w-4 accent-atl-silver"
                    />
                    Required field
                  </label>
                </div>
              </div>
            )}
          </aside>

          <section className="space-y-5">
            <div className="atl-card overflow-hidden">
              <div className="flex items-center justify-between border-b border-atl-ridge/60 px-4 py-3">
                <div className="flex items-center gap-2">
                  <Workflow className="h-5 w-5" />
                  <h2 className="font-black text-atl-archive">
                    Workflow Assembly
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={addStep}
                  className="atl-button min-h-[34px] px-3 text-xs"
                >
                  <Plus className="h-4 w-4" />
                  Step
                </button>
              </div>
              <div className="atl-grid-dense min-h-[320px] overflow-auto bg-atl-void/45 p-5">
                <div className="flex min-w-max gap-5">
                  {graphColumns.map((column, columnIndex) => (
                    <div key={columnIndex} className="grid content-start gap-4">
                      <p className="atl-eyebrow text-[0.6rem]">
                        Stage {columnIndex + 1}
                      </p>
                      {column.map((step) => (
                        <button
                          key={step.id}
                          type="button"
                          onClick={() => setSelectedStepId(step.id)}
                          className={`w-64 rounded-[8px] border p-4 text-left shadow-lg transition ${
                            selectedStepId === step.id
                              ? "border-atl-silver bg-atl-navy/80"
                              : "border-atl-ridge bg-atl-deep/92 hover:border-atl-mist"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-bold text-atl-archive">
                              {step.name}
                            </span>
                            <GitBranch className="h-4 w-4 text-atl-frost" />
                          </div>
                          <p className="mt-2 font-mono text-xs text-atl-frost">
                            {step.id}
                          </p>
                          {step.needs.length > 0 && (
                            <p className="mt-3 flex items-center gap-2 text-xs text-atl-silver">
                              <ArrowRight className="h-3.5 w-3.5" />
                              needs {step.needs.join(", ")}
                            </p>
                          )}
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="atl-card p-4">
              <h2 className="mb-3 font-black text-atl-archive">
                Step Inspector
              </h2>
              {selectedStep && (
                <div className="grid gap-3 md:grid-cols-2">
                  <label className="grid gap-1 text-sm text-atl-silver">
                    Step name
                    <input
                      value={selectedStep.name}
                      onChange={(event) =>
                        updateStep(selectedStep.id, {
                          name: event.target.value,
                        })
                      }
                      className="rounded-[6px] border border-atl-ridge bg-atl-void/70 px-3 py-2 text-atl-archive outline-none focus:border-atl-silver"
                    />
                  </label>
                  <label className="grid gap-1 text-sm text-atl-silver">
                    Step kind
                    <select
                      value={selectedStep.kind}
                      onChange={(event) =>
                        updateStep(selectedStep.id, {
                          kind: event.target.value as StructraStep["kind"],
                        })
                      }
                      className="rounded-[6px] border border-atl-ridge bg-atl-void/70 px-3 py-2 text-atl-archive outline-none focus:border-atl-silver"
                    >
                      <option value="run">run</option>
                      <option value="uses">uses</option>
                      <option value="approval">approval</option>
                    </select>
                  </label>
                  <label className="grid gap-1 text-sm text-atl-silver md:col-span-2">
                    Command / gate note
                    <input
                      value={selectedStep.command}
                      onChange={(event) =>
                        updateStep(selectedStep.id, {
                          command: event.target.value,
                        })
                      }
                      className="rounded-[6px] border border-atl-ridge bg-atl-void/70 px-3 py-2 font-mono text-atl-archive outline-none focus:border-atl-silver"
                    />
                  </label>
                  <label className="grid gap-1 text-sm text-atl-silver md:col-span-2">
                    Dependencies
                    <select
                      multiple
                      value={selectedStep.needs}
                      onChange={(event) =>
                        updateStep(selectedStep.id, {
                          needs: Array.from(event.target.selectedOptions).map(
                            (option) => option.value,
                          ),
                        })
                      }
                      className="min-h-[104px] rounded-[6px] border border-atl-ridge bg-atl-void/70 px-3 py-2 font-mono text-atl-archive outline-none focus:border-atl-silver"
                    >
                      {steps
                        .filter((step) => step.id !== selectedStep.id)
                        .map((step) => (
                          <option key={step.id} value={step.id}>
                            {step.id}
                          </option>
                        ))}
                    </select>
                  </label>
                </div>
              )}
            </div>
          </section>

          <aside className="space-y-5">
            <section className="atl-card p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h2 className="font-black text-atl-archive">Validation</h2>
                <span
                  className={`rounded-[6px] border px-2 py-1 text-xs font-black ${issues.length ? "border-atl-warning/50 bg-atl-warning/10 text-atl-warning" : "border-atl-success/50 bg-atl-success/10 text-atl-success"}`}
                >
                  {issues.length ? `${issues.length} notes` : "ready"}
                </span>
              </div>
              {issues.length ? (
                <ul className="space-y-2 text-sm text-atl-silver">
                  {issues.slice(0, 5).map((issue) => (
                    <li key={issue}>{issue}</li>
                  ))}
                </ul>
              ) : (
                <p className="flex items-center gap-2 text-sm text-atl-silver">
                  <CheckCircle2 className="h-4 w-4 text-atl-success" />
                  Fields and workflow dependencies are structurally consistent.
                </p>
              )}
            </section>

            <section className="atl-card overflow-hidden">
              <div className="flex items-center justify-between border-b border-atl-ridge/60 px-4 py-3">
                <h2 className="font-black text-atl-archive">Generated JSON</h2>
                <button
                  type="button"
                  onClick={() =>
                    void copyText("values", JSON.stringify(values, null, 2))
                  }
                  className="atl-button-ghost min-h-[32px] px-2 text-xs"
                >
                  <Copy className="h-3.5 w-3.5" />
                  {copied === "values" ? "Copied" : "Copy"}
                </button>
              </div>
              <pre className="max-h-[210px] overflow-auto whitespace-pre-wrap p-4 font-mono text-xs leading-5 text-atl-silver">
                {JSON.stringify(values, null, 2)}
              </pre>
            </section>

            <section className="atl-card overflow-hidden">
              <div className="flex items-center justify-between border-b border-atl-ridge/60 px-4 py-3">
                <h2 className="font-black text-atl-archive">Workflow YAML</h2>
                <select
                  value={target}
                  onChange={(event) =>
                    setTarget(event.target.value as ExportTarget)
                  }
                  className="rounded-[6px] border border-atl-ridge bg-atl-void/70 px-2 py-1 text-xs text-atl-archive"
                >
                  {exportTargets.map((item) => (
                    <option key={item} value={item}>
                      {titleCase(item)}
                    </option>
                  ))}
                </select>
              </div>
              <pre className="max-h-[260px] overflow-auto whitespace-pre-wrap p-4 font-mono text-xs leading-5 text-atl-silver">
                {yaml}
              </pre>
              <div className="grid grid-cols-2 gap-2 border-t border-atl-ridge/60 p-3">
                <button
                  type="button"
                  onClick={() => void copyText("yaml", yaml)}
                  className="atl-button-ghost min-h-[36px] px-3 text-xs"
                >
                  <Copy className="h-3.5 w-3.5" />
                  {copied === "yaml" ? "Copied" : "Copy YAML"}
                </button>
                <button
                  type="button"
                  onClick={() => download("structra-lab-workflow.yaml", yaml)}
                  className="atl-button min-h-[36px] px-3 text-xs"
                >
                  <Download className="h-3.5 w-3.5" />
                  Download
                </button>
              </div>
            </section>

            <section className="atl-card overflow-hidden">
              <div className="flex items-center gap-2 border-b border-atl-ridge/60 px-4 py-3">
                <Braces className="h-4 w-4" />
                <h2 className="font-black text-atl-archive">Schema Preview</h2>
              </div>
              <pre className="max-h-[210px] overflow-auto whitespace-pre-wrap p-4 font-mono text-xs leading-5 text-atl-silver">
                {JSON.stringify(schema, null, 2)}
              </pre>
            </section>
          </aside>
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-3">
          {[
            [
              "Desktop source",
              "The full Structra app uses React, Tauri, Zustand, and React Flow.",
            ],
            [
              "Browser lab",
              "This route keeps the same mental model while avoiding desktop-only backend claims.",
            ],
            [
              "SESM fit",
              "Exported workflow diagrams and project marks are good candidates for SVG plus SESM metadata.",
            ],
          ].map(([title, body]) => (
            <div key={title} className="atl-card-soft p-4">
              <div className="mb-2 flex items-center gap-2 text-atl-archive">
                <Layers3 className="h-4 w-4" />
                <h3 className="font-bold">{title}</h3>
              </div>
              <p className="text-sm leading-6 text-atl-silver">{body}</p>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
};

export default StructraLabPage;

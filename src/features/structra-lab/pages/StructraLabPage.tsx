import { useMemo, useState } from "react";
import {
  Box,
  CheckCircle2,
  ChevronDown,
  Copy,
  Download,
  FileJson2,
  Filter,
  Folder,
  Hash,
  Maximize2,
  Plus,
  Search,
  ShieldCheck,
  ToggleRight,
  Trash2,
  Type,
} from "lucide-react";
import MetaTags from "../../../components/MetaTags";

type FieldKind = "string" | "number" | "boolean" | "object";
type OutputFormat = "toml" | "json";

type StructraField = {
  id: string;
  label: string;
  binding: string;
  kind: FieldKind;
  required: boolean;
  example: string;
  description: string;
};

type TreeNode = {
  name: string;
  path: string;
  field?: StructraField;
  children: TreeNode[];
};

const initialFields: StructraField[] = [
  {
    id: "field-user-id",
    label: "UserID",
    binding: "profile.user_id",
    kind: "string",
    required: true,
    example: "550e8400-e29b-41d4-a716-446655440000",
    description: "Stable identifier for the profile record.",
  },
  {
    id: "field-name",
    label: "Name",
    binding: "profile.personal.name",
    kind: "string",
    required: true,
    example: "John Doe",
    description: "Full name of the user.",
  },
  {
    id: "field-email",
    label: "Email",
    binding: "profile.personal.email",
    kind: "string",
    required: true,
    example: "john.doe@example.com",
    description: "Primary contact email.",
  },
  {
    id: "field-dark-mode",
    label: "DarkMode",
    binding: "profile.settings.dark_mode",
    kind: "boolean",
    required: false,
    example: "true",
    description: "Whether the user prefers the dark interface.",
  },
  {
    id: "field-language",
    label: "Language",
    binding: "profile.settings.language",
    kind: "string",
    required: false,
    example: "English",
    description: "Display language preference.",
  },
  {
    id: "field-font-size",
    label: "FontSize",
    binding: "profile.settings.font_size",
    kind: "number",
    required: false,
    example: "14",
    description: "Preferred text size.",
  },
  {
    id: "field-order-status",
    label: "OrderStatus",
    binding: "profile.order_sample.status",
    kind: "string",
    required: false,
    example: "Shipped",
    description: "Representative nested value for structured output.",
  },
  {
    id: "field-order-total",
    label: "OrderTotal",
    binding: "profile.order_sample.total",
    kind: "number",
    required: false,
    example: "125.50",
    description: "Representative numeric value for structured output.",
  },
];

const fieldKinds: FieldKind[] = ["string", "number", "boolean", "object"];
const outputFormats: OutputFormat[] = ["toml", "json"];
const pathSegmentPattern = /^[A-Za-z_][A-Za-z0-9_-]*$/;

const kindIcon = {
  string: Type,
  number: Hash,
  boolean: ToggleRight,
  object: Folder,
} satisfies Record<FieldKind, typeof Type>;

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

const formatTomlKey = (key: string) =>
  /^[A-Za-z0-9_-]+$/.test(key) ? key : JSON.stringify(key);

const formatTomlValue = (value: unknown) => {
  if (typeof value === "number")
    return Number.isFinite(value) ? `${value}` : "0";
  if (typeof value === "boolean") return value ? "true" : "false";
  return JSON.stringify(String(value));
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

const writeTomlTable = (
  value: Record<string, unknown>,
  prefix: string[] = [],
): string[] => {
  const primitiveLines: string[] = [];
  const tableLines: string[] = [];

  Object.entries(value).forEach(([key, entry]) => {
    if (isRecord(entry)) {
      const tablePath = [...prefix, formatTomlKey(key)];
      tableLines.push("", `[${tablePath.join(".")}]`);
      tableLines.push(...writeTomlTable(entry, tablePath));
    } else {
      primitiveLines.push(`${formatTomlKey(key)} = ${formatTomlValue(entry)}`);
    }
  });

  return [...primitiveLines, ...tableLines];
};

const buildToml = (values: Record<string, unknown>) =>
  `${writeTomlTable(values).join("\n").trim()}\n`;

const validateFields = (fields: StructraField[]) => {
  const issues: string[] = [];
  const bindings = new Set<string>();

  fields.forEach((field) => {
    const label = field.label.trim() || "A field";
    const binding = field.binding.trim();
    const segments = binding.split(".").filter(Boolean);

    if (!field.label.trim()) issues.push("A field has no display label.");
    if (!binding) issues.push(`${label} has no binding path.`);
    if (bindings.has(binding))
      issues.push(`${binding} is used more than once.`);
    if (segments.some((segment) => !pathSegmentPattern.test(segment))) {
      issues.push(
        `${label} has a binding path segment that TOML cannot quote safely.`,
      );
    }

    bindings.add(binding);
  });

  return issues;
};

const buildTree = (fields: StructraField[]): TreeNode[] => {
  const root: TreeNode = { name: "root", path: "", children: [] };

  fields.forEach((field) => {
    const parts = field.binding.split(".").filter(Boolean);
    let cursor = root;

    parts.forEach((part, index) => {
      const path = parts.slice(0, index + 1).join(".");
      let next = cursor.children.find((node) => node.name === part);
      if (!next) {
        next = { name: part, path, children: [] };
        cursor.children.push(next);
      }
      if (index === parts.length - 1) next.field = field;
      cursor = next;
    });
  });

  return root.children;
};

const formatLabel = (value: string) =>
  value
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

const countLines = (value: string) => value.split(/\r?\n/).length;

const StructraLabPage = () => {
  const [fields, setFields] = useState(initialFields);
  const [selectedFieldId, setSelectedFieldId] = useState(initialFields[1].id);
  const [copied, setCopied] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [format, setFormat] = useState<OutputFormat>("toml");

  const selectedField =
    fields.find((field) => field.id === selectedFieldId) ?? fields[0];
  const filteredFields = useMemo(() => {
    const needle = search.trim().toLowerCase();
    if (!needle) return fields;
    return fields.filter(
      (field) =>
        field.label.toLowerCase().includes(needle) ||
        field.binding.toLowerCase().includes(needle) ||
        field.kind.includes(needle),
    );
  }, [fields, search]);
  const tree = useMemo(() => buildTree(filteredFields), [filteredFields]);
  const values = useMemo(() => buildValues(fields), [fields]);
  const json = useMemo(() => JSON.stringify(values, null, 2), [values]);
  const toml = useMemo(() => buildToml(values), [values]);
  const output = format === "toml" ? toml : json;
  const issues = useMemo(() => validateFields(fields), [fields]);

  const updateField = (id: string, patch: Partial<StructraField>) =>
    setFields((current) =>
      current.map((field) =>
        field.id === id ? { ...field, ...patch } : field,
      ),
    );

  const addField = () => {
    const next = {
      id: `field-${Date.now().toString(36)}`,
      label: "New Field",
      binding: "profile.new_field",
      kind: "string" as FieldKind,
      required: false,
      example: "value",
      description: "New structured data field.",
    };
    setFields((current) => [...current, next]);
    setSelectedFieldId(next.id);
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

  const renderTree = (nodes: TreeNode[], depth = 0) =>
    nodes.map((node) => {
      const field = node.field;
      const isSelected = field?.id === selectedFieldId;
      const Icon = field ? kindIcon[field.kind] : Folder;

      return (
        <div key={node.path}>
          <button
            type="button"
            onClick={() => field && setSelectedFieldId(field.id)}
            className={`grid min-h-[38px] w-full grid-cols-[22px_1fr_auto] items-center gap-2 rounded-[6px] px-2 text-left text-sm transition ${
              isSelected
                ? "border border-blue-400/45 bg-blue-500/18 text-atl-archive"
                : "border border-transparent text-atl-silver hover:bg-atl-abyss/70 hover:text-atl-archive"
            }`}
            style={{ paddingLeft: `${8 + depth * 18}px` }}
          >
            {field ? (
              <Icon className="h-4 w-4 text-atl-frost" />
            ) : (
              <ChevronDown className="h-4 w-4 text-atl-frost" />
            )}
            <span className="min-w-0 truncate">
              <span className="font-semibold">
                {field?.label ?? formatLabel(node.name)}
              </span>
              <span className="ml-1 text-atl-frost">
                ({field?.kind ?? "Object"})
              </span>
            </span>
            {field?.example && (
              <span className="max-w-[86px] truncate font-mono text-xs text-atl-frost">
                {field.example}
              </span>
            )}
          </button>
          {node.children.length > 0 && renderTree(node.children, depth + 1)}
        </div>
      );
    });

  return (
    <div className="min-h-screen text-atl-archive">
      <MetaTags
        title="Structra Lab | Aptlantis Studio"
        description="Reduced browser lab for Structra's core structured-data builder concept: modeled paths, JSON output, and TOML output."
        canonicalUrl="https://aptlantis.studio/structra-lab"
        ogTitle="Structra Lab | Aptlantis Studio"
        ogDescription="A browser-safe teaching surface for Structra's structured-data builder: fields, paths, validation, JSON, and TOML."
      />

      <main className="atl-container py-8">
        <section className="mb-4 grid gap-4 lg:grid-cols-[1fr_360px]">
          <div>
            <p className="atl-eyebrow">Structra / Web Lab</p>
            <h1 className="atl-title mt-2 text-3xl font-black">
              Structured Data Builder Preview
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-atl-silver">
              This web version mirrors the desktop app's core layout while
              keeping the option surface smaller: structure tree, field
              inspector, validation, and JSON/TOML output.
            </p>
          </div>
          <div className="rounded-[8px] border border-atl-ridge/70 bg-atl-void/55 p-3 text-sm leading-6 text-atl-silver">
            <div className="mb-1 flex items-center gap-2 font-bold text-atl-archive">
              <ShieldCheck className="h-4 w-4" />
              Web scope
            </div>
            Desktop can grow into deeper import, validation, schema, and file
            options. This route stays focused on the model-to-data slice.
          </div>
        </section>

        <section className="overflow-hidden rounded-[8px] border border-atl-ridge/70 bg-atl-void/80 shadow-2xl shadow-black/35">
          <header className="flex min-h-[58px] items-center justify-between border-b border-atl-ridge/70 bg-gradient-to-r from-atl-void via-atl-deep to-atl-void px-4">
            <div className="flex min-w-0 items-center gap-4">
              <div className="grid h-8 w-8 shrink-0 place-items-center rounded-[6px] border border-atl-mist/50 bg-atl-abyss/80">
                <Box className="h-5 w-5 text-atl-archive" />
              </div>
              <h2 className="text-xl font-black">Structra</h2>
              <nav className="hidden items-center gap-6 text-sm text-atl-silver md:flex">
                {["File", "Edit", "View", "Tools", "Help"].map((item) => (
                  <span key={item}>{item}</span>
                ))}
              </nav>
            </div>
            <div className="flex items-center gap-2 text-atl-frost">
              <span className="h-0.5 w-4 rounded bg-atl-frost" />
              <span className="h-3.5 w-3.5 rounded-[3px] border border-atl-frost" />
              <span className="text-xl leading-none">x</span>
            </div>
          </header>

          <div className="grid min-h-[690px] lg:grid-cols-[36%_27%_37%]">
            <aside className="border-b border-atl-ridge/70 bg-atl-deep/54 lg:border-b-0 lg:border-r">
              <div className="border-b border-atl-ridge/70 p-4">
                <h3 className="mb-3 text-lg font-black">Structure Tree</h3>
                <div className="grid grid-cols-[1fr_44px_44px] gap-2">
                  <label className="flex min-h-[42px] items-center gap-2 rounded-[6px] border border-atl-ridge bg-atl-void/60 px-3 text-sm text-atl-frost focus-within:border-atl-silver">
                    <Search className="h-4 w-4" />
                    <input
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Search structure..."
                      className="min-w-0 flex-1 bg-transparent text-atl-archive outline-none placeholder:text-atl-frost"
                    />
                  </label>
                  <button
                    type="button"
                    className="grid min-h-[42px] place-items-center rounded-[6px] border border-atl-ridge bg-atl-void/60 text-atl-silver hover:border-atl-silver"
                    aria-label="Filter structure"
                  >
                    <Filter className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={addField}
                    className="grid min-h-[42px] place-items-center rounded-[6px] border border-atl-ridge bg-atl-void/60 text-atl-silver hover:border-atl-silver"
                    aria-label="Add field"
                  >
                    <Plus className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="max-h-[560px] overflow-auto p-3">
                {tree.length > 0 ? (
                  renderTree(tree)
                ) : (
                  <p className="p-4 text-sm text-atl-frost">
                    No fields match the current search.
                  </p>
                )}
              </div>
            </aside>

            <section className="border-b border-atl-ridge/70 bg-atl-deep/42 lg:border-b-0 lg:border-r">
              <div className="border-b border-atl-ridge/70 px-5 py-4">
                <h3 className="text-lg font-black">Field Inspector</h3>
              </div>

              <div className="grid gap-4 p-5 text-sm">
                <label className="grid gap-1.5 text-atl-silver">
                  Field Name
                  <input
                    value={selectedField.label}
                    onChange={(event) =>
                      updateField(selectedField.id, {
                        label: event.target.value,
                      })
                    }
                    className="min-h-[36px] rounded-[6px] border border-atl-ridge bg-atl-void/60 px-3 text-atl-archive outline-none focus:border-atl-silver"
                  />
                </label>

                <label className="grid gap-1.5 text-atl-silver">
                  Binding Path
                  <input
                    value={selectedField.binding}
                    onChange={(event) =>
                      updateField(selectedField.id, {
                        binding: event.target.value,
                      })
                    }
                    className="min-h-[36px] rounded-[6px] border border-atl-ridge bg-atl-void/60 px-3 font-mono text-atl-archive outline-none focus:border-atl-silver"
                  />
                </label>

                <label className="grid gap-1.5 text-atl-silver">
                  Type
                  <select
                    value={selectedField.kind}
                    onChange={(event) =>
                      updateField(selectedField.id, {
                        kind: event.target.value as FieldKind,
                      })
                    }
                    className="min-h-[38px] rounded-[6px] border border-atl-ridge bg-atl-void/60 px-3 text-atl-archive outline-none focus:border-atl-silver"
                  >
                    {fieldKinds.map((kind) => (
                      <option key={kind} value={kind}>
                        {formatLabel(kind)}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="flex items-center justify-between gap-3 text-atl-silver">
                  Required
                  <span className="relative inline-flex h-5 w-10 items-center rounded-full border border-blue-300/40 bg-blue-500/40">
                    <input
                      type="checkbox"
                      checked={selectedField.required}
                      onChange={(event) =>
                        updateField(selectedField.id, {
                          required: event.target.checked,
                        })
                      }
                      className="peer sr-only"
                    />
                    <span className="ml-0.5 h-4 w-4 rounded-full bg-atl-frost transition peer-checked:translate-x-5 peer-checked:bg-atl-archive" />
                  </span>
                </label>

                <label className="grid gap-1.5 text-atl-silver">
                  Description
                  <textarea
                    value={selectedField.description}
                    onChange={(event) =>
                      updateField(selectedField.id, {
                        description: event.target.value,
                      })
                    }
                    maxLength={500}
                    className="min-h-[86px] resize-none rounded-[6px] border border-atl-ridge bg-atl-void/60 px-3 py-2 text-atl-archive outline-none focus:border-atl-silver"
                  />
                  <span className="text-right text-xs text-atl-frost">
                    {selectedField.description.length} / 500
                  </span>
                </label>

                <label className="grid gap-1.5 text-atl-silver">
                  Validation
                  <select className="min-h-[38px] rounded-[6px] border border-atl-ridge bg-atl-void/60 px-3 text-atl-archive outline-none focus:border-atl-silver">
                    <option>{formatLabel(selectedField.kind)}</option>
                  </select>
                </label>

                <div className="rounded-[6px] border border-atl-ridge/70 bg-atl-void/30 p-3">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <span className="font-bold text-atl-archive">
                      Additional Constraints
                    </span>
                    <ChevronDown className="h-4 w-4 text-atl-frost" />
                  </div>
                  <div className="grid gap-2 text-atl-frost">
                    {["Minimum Length", "Maximum Length", "Pattern"].map(
                      (label) => (
                        <label
                          key={label}
                          className="grid grid-cols-[18px_1fr_92px] items-center gap-2"
                        >
                          <input
                            type="checkbox"
                            className="accent-atl-silver"
                          />
                          <span>{label}</span>
                          <input
                            disabled
                            value={label === "Pattern" ? "" : "0"}
                            className="min-h-[30px] rounded-[5px] border border-atl-ridge bg-atl-deep/70 px-2 text-atl-frost"
                            readOnly
                          />
                        </label>
                      ),
                    )}
                  </div>
                </div>

                <label className="grid gap-1.5 text-atl-silver">
                  Example Value
                  <input
                    value={selectedField.example}
                    onChange={(event) =>
                      updateField(selectedField.id, {
                        example: event.target.value,
                      })
                    }
                    className="min-h-[36px] rounded-[6px] border border-atl-ridge bg-atl-void/60 px-3 text-atl-archive outline-none focus:border-atl-silver"
                  />
                </label>
              </div>
            </section>

            <aside className="bg-atl-deep/38">
              <div className="flex items-center justify-between border-b border-atl-ridge/70 px-5 py-4">
                <h3 className="text-lg font-black">Output Preview</h3>
                <div className="flex items-center gap-4 text-atl-frost">
                  <Copy className="h-4 w-4" />
                  <Maximize2 className="h-4 w-4" />
                </div>
              </div>

              <div className="p-3">
                <div className="overflow-hidden rounded-[8px] border border-atl-ridge/80 bg-atl-void/74">
                  <div className="grid grid-cols-2 border-b border-atl-ridge/70 bg-atl-abyss/60">
                    {outputFormats.map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => setFormat(item)}
                        className={`min-h-[42px] text-sm font-bold uppercase tracking-wide transition ${
                          format === item
                            ? "bg-blue-500/35 text-atl-archive"
                            : "text-atl-frost hover:bg-atl-deep"
                        }`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>

                  <pre className="min-h-[548px] overflow-auto p-5 font-mono text-sm leading-7 text-atl-silver">
                    {output}
                  </pre>
                </div>
              </div>
            </aside>
          </div>

          <footer className="border-t border-atl-ridge/70 bg-atl-void/80">
            <div className="flex flex-col gap-3 border-b border-atl-ridge/70 p-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={addField}
                  className="atl-button-ghost min-h-[40px] px-4 text-sm"
                >
                  <Plus className="h-4 w-4" />
                  Add Field
                </button>
                <button
                  type="button"
                  className="atl-button-ghost min-h-[40px] px-4 text-sm"
                >
                  <Folder className="h-4 w-4" />
                  Add Object
                </button>
                <button
                  type="button"
                  className="atl-button-ghost min-h-[40px] px-4 text-sm"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  className="atl-button-ghost min-h-[40px] px-4 text-sm"
                >
                  <ShieldCheck className="h-4 w-4" />
                  Validate
                </button>
                <button
                  type="button"
                  onClick={() => void copyText("output", output)}
                  className="atl-button-ghost min-h-[40px] px-4 text-sm"
                >
                  <Copy className="h-4 w-4" />
                  {copied === "output" ? "Copied" : "Copy Output"}
                </button>
                <button
                  type="button"
                  onClick={() => download(`structra-lab.${format}`, output)}
                  className="atl-button min-h-[40px] px-4 text-sm"
                >
                  {format === "json" ? (
                    <FileJson2 className="h-4 w-4" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                  Save
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-3 px-5 py-3 text-sm text-atl-silver md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle2
                  className={`h-5 w-5 ${issues.length ? "text-atl-warning" : "text-atl-success"}`}
                />
                <span
                  className={
                    issues.length ? "text-atl-warning" : "text-atl-success"
                  }
                >
                  {issues.length
                    ? `${issues.length} validation notes`
                    : "Schema valid"}
                </span>
                <span className="hidden h-5 w-px bg-atl-ridge md:block" />
                <span>{issues[0] ?? "No issues found"}</span>
              </div>
              <div className="flex items-center gap-5">
                <span>Lines: {countLines(output)}</span>
                <span>Characters: {output.length}</span>
                <span>Format: {format.toUpperCase()}</span>
                <span className="h-3 w-3 rounded-full bg-atl-success" />
              </div>
            </div>
          </footer>
        </section>
      </main>
    </div>
  );
};

export default StructraLabPage;

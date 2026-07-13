import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type DragEvent,
  type ReactNode,
} from "react";
import {
  BookOpen,
  CheckCircle2,
  Clipboard,
  Code2,
  Copy,
  Download,
  FileCode2,
  GitCompare,
  Grid2X2,
  Loader2,
  Search,
  ShieldCheck,
  Upload,
} from "lucide-react";
import MetaTags from "../../../components/MetaTags";

type LabMode =
  | "create"
  | "inspect"
  | "validate"
  | "compare"
  | "learn"
  | "examples";
type BackendStatus = "checking" | "online" | "offline";

type SvgLabFinding = {
  code: string;
  message: string;
  path?: string;
};

type SvgLabValidation = {
  status: string;
  profile: string;
  errors: SvgLabFinding[];
  warnings: SvgLabFinding[];
  metadataVersion: string | null;
  metadata: Record<string, unknown> | null;
};

type SvgLabMetadataForm = {
  assetTitle: string;
  assetRole: string;
  project: string;
  author: string;
  license: string;
  tags: string;
  accessibilitySummary: string;
  version: string;
};

type GenerateResponse = {
  svgText: string;
  metadata: Record<string, unknown>;
  validation: SvgLabValidation;
  diff: {
    beforeLineCount: number;
    afterLineCount: number;
    additions: number;
    metadataAdded: boolean;
  };
};

type SvgLabExample = {
  id: string;
  title: string;
  description: string;
  svgText: string;
  expectedStatus: string;
};

const starterSvg = `<svg width="600" height="240" viewBox="0 0 600 240" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="240" rx="16" fill="#081217"/>
  <path d="M102 174 L180 42 L258 174 H218 L180 106 L142 174 Z" fill="#22d3ee"/>
  <path d="M180 82 L232 174 H202 L180 132 L158 174 H128 Z" fill="#0e7490"/>
  <text x="300" y="146" fill="#f8fafc" font-family="Arial, sans-serif" font-size="72" font-weight="700">Aptlantis</text>
</svg>`;

const defaultMetadata: SvgLabMetadataForm = {
  assetTitle: "Aptlantis Logo",
  assetRole: "logo",
  project: "Aptlantis Studio",
  author: "Aptlantis",
  license: "CC0-1.0",
  tags: "brand, logo, aptlantis, vector",
  accessibilitySummary:
    "Decorative logo for brand identification. High contrast and scalable.",
  version: "1.0.0",
};

const imageMimeTypes = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "image/avif",
]);

const labModes: Array<{
  id: LabMode;
  label: string;
  icon: typeof FileCode2;
}> = [
  { id: "create", label: "Create", icon: FileCode2 },
  { id: "inspect", label: "Inspect", icon: Search },
  { id: "validate", label: "Validate", icon: ShieldCheck },
  { id: "compare", label: "Compare", icon: GitCompare },
  { id: "learn", label: "Learn", icon: BookOpen },
  { id: "examples", label: "Examples", icon: Grid2X2 },
];

const modeCopy: Record<
  LabMode,
  {
    description: string;
    uploadTitle: string;
    previewTitle: string;
    metadataTitle: string;
  }
> = {
  create: {
    description:
      "Generate SESM metadata and embed it into a new or uploaded SVG asset.",
    uploadTitle: "Source asset",
    previewTitle: "Generated SVG Preview",
    metadataTitle: "Draft SESM Metadata",
  },
  inspect: {
    description:
      "Inspect an existing SVG and show only metadata already embedded in the file.",
    uploadTitle: "Inspect SVG",
    previewTitle: "Uploaded SVG Preview",
    metadataTitle: "Detected SESM Metadata",
  },
  validate: {
    description: "Run the SESM safe-profile validator against the current SVG.",
    uploadTitle: "Validation target",
    previewTitle: "Validation Target",
    metadataTitle: "Validated Metadata",
  },
  compare: {
    description:
      "Generate SESM output and compare the original SVG against the updated file.",
    uploadTitle: "Compare source",
    previewTitle: "After Preview",
    metadataTitle: "Generated SESM Metadata",
  },
  learn: {
    description:
      "Review the SESM fields SVG Lab knows how to create and validate.",
    uploadTitle: "Reference SVG",
    previewTitle: "Reference Preview",
    metadataTitle: "Reference Metadata",
  },
  examples: {
    description:
      "Load sample SVGs and inspect how their SESM metadata validates.",
    uploadTitle: "Example source",
    previewTitle: "Example Preview",
    metadataTitle: "Example Metadata",
  },
};

const learnFields = [
  {
    name: "sesm_version",
    purpose:
      "Identifies the metadata profile so validators can apply the correct compatibility rules.",
  },
  {
    name: "asset.title",
    purpose:
      "Gives the SVG a human-readable identity that can travel with the asset.",
  },
  {
    name: "asset.role",
    purpose:
      "Explains what the SVG is for: logo, diagram, icon, proof image, interface asset, or other role.",
  },
  {
    name: "asset.tags",
    purpose:
      "Adds searchable semantic labels for indexing, automation, and portfolio organization.",
  },
  {
    name: "accessibility.summary",
    purpose:
      "Captures the intended accessibility context without pretending metadata replaces alt text.",
  },
  {
    name: "provenance",
    purpose:
      "Records generator, author, license, and timestamp context for review and reuse.",
  },
];

const statusTone = (status?: string) => {
  if (status === "ok")
    return "border-emerald-400/30 bg-emerald-400/10 text-emerald-100";
  if (status === "warning")
    return "border-amber-300/30 bg-amber-300/10 text-amber-100";
  return "border-rose-300/30 bg-rose-400/10 text-rose-100";
};

const truncate = (value: string, length = 2600) =>
  value.length > length ? `${value.slice(0, length)}\n...` : value;

const formatJson = (value: unknown) => JSON.stringify(value || {}, null, 2);

const formatBytes = (value: string) => {
  const bytes = new TextEncoder().encode(value).length;
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KiB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MiB`;
};

const copyText = async (text: string) => {
  await navigator.clipboard.writeText(text);
};

const fileToDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read image file."));
    reader.onload = () => resolve(String(reader.result || ""));
    reader.readAsDataURL(file);
  });

const readImageSize = (dataUrl: string) =>
  new Promise<{ width: number; height: number }>((resolve, reject) => {
    const image = new Image();
    image.onload = () =>
      resolve({
        width: image.naturalWidth || 1024,
        height: image.naturalHeight || 1024,
      });
    image.onerror = () =>
      reject(new Error("Could not decode image dimensions."));
    image.src = dataUrl;
  });

const xmlEscape = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

const titleFromFileName = (name: string) =>
  name
    .replace(/\.[^.]+$/, "")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase()) ||
  "Embedded Image Asset";

const rasterFileToSvg = async (file: File) => {
  const dataUrl = await fileToDataUrl(file);
  const { width, height } = await readImageSize(dataUrl);
  const title = titleFromFileName(file.name);
  return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="title desc">
  <title id="title">${xmlEscape(title)}</title>
  <desc id="desc">Embedded raster image generated by SVG Lab from ${xmlEscape(file.name)}.</desc>
  <image x="0" y="0" width="${width}" height="${height}" href="${dataUrl}" preserveAspectRatio="xMidYMid meet" />
</svg>`;
};

const Field = ({ label, children }: { label: string; children: ReactNode }) => (
  <label className="grid gap-1.5 text-xs font-semibold text-atl-silver">
    <span>{label}</span>
    {children}
  </label>
);

const LabButton = ({
  children,
  onClick,
  disabled,
  testId,
  variant = "primary",
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  testId?: string;
  variant?: "primary" | "secondary";
}) => (
  <button
    type="button"
    data-testid={testId}
    onClick={onClick}
    disabled={disabled}
    className={`min-h-[38px] px-3 text-sm font-black disabled:cursor-not-allowed disabled:opacity-50 ${
      variant === "primary" ? "atl-button" : "atl-button-ghost"
    }`}
  >
    {children}
  </button>
);

const StatusInspector = ({
  validation,
  metadata,
  loading,
  error,
  onValidate,
}: {
  validation: SvgLabValidation | null;
  metadata: Record<string, unknown> | null;
  loading: boolean;
  error: string | null;
  onValidate: () => void;
}) => {
  const findings = [
    ...(validation?.errors || []),
    ...(validation?.warnings || []),
  ];
  const fieldRows = useMemo(() => {
    const asset = (metadata?.asset || {}) as Record<string, unknown>;
    const provenance = (metadata?.provenance || {}) as Record<string, unknown>;
    const accessibility = (metadata?.accessibility || {}) as Record<
      string,
      unknown
    >;
    return [
      ["title", asset.title],
      ["role", asset.role],
      ["project", asset.ecosystem],
      ["author", provenance.author],
      ["license", provenance.license],
      [
        "tags",
        Array.isArray(asset.tags) ? `${asset.tags.length} items` : undefined,
      ],
      [
        "accessibility",
        accessibility.summary
          ? `${String(accessibility.summary).length} chars`
          : undefined,
      ],
      [
        "version",
        (provenance.generator as Record<string, unknown> | undefined)?.version,
      ],
      ["sesm_version", metadata?.sesm_version],
    ] as Array<[string, unknown]>;
  }, [metadata]);

  return (
    <aside className="atl-grid-dense border-t border-atl-ridge/60 bg-atl-deep/82 p-4 xl:min-w-[310px] xl:border-l xl:border-t-0">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-lg font-black text-atl-archive">SESM status</h2>
        <LabButton
          onClick={onValidate}
          disabled={loading}
          testId="svg-lab-revalidate"
          variant="secondary"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ShieldCheck className="h-4 w-4" />
          )}
          Re-validate
        </LabButton>
      </div>

      <section
        className={`rounded-[8px] border p-4 ${statusTone(validation?.status)}`}
      >
        <div className="flex items-start gap-3">
          <CheckCircle2 className="mt-0.5 h-9 w-9 flex-none" />
          <div>
            <h3 className="text-xl font-black capitalize">
              {validation?.status || "Unchecked"}
            </h3>
            <p className="mt-1 text-sm leading-5 text-atl-silver">
              {validation
                ? `${validation.profile} with ${validation.errors.length} errors and ${validation.warnings.length} warnings.`
                : "Upload or generate an SVG to inspect SESM metadata."}
            </p>
          </div>
        </div>
        {error && <p className="mt-3 text-sm text-rose-100">{error}</p>}
      </section>

      <section className="atl-card-soft mt-4 p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h3 className="font-black text-atl-archive">Safe profile</h3>
          <span
            className={`rounded-[6px] border px-2 py-1 text-xs font-black ${statusTone(validation?.status)}`}
          >
            {validation?.profile || "pending"}
          </span>
        </div>
        <div className="space-y-2">
          {findings.length > 0 ? (
            findings.slice(0, 7).map((finding) => (
              <div
                key={`${finding.code}-${finding.path || finding.message}`}
                className="text-sm leading-5 text-atl-silver"
              >
                <span className="font-bold text-atl-archive">
                  {finding.code}
                </span>
                {finding.path && (
                  <span className="text-atl-mist"> / {finding.path}</span>
                )}
                <p>{finding.message}</p>
              </div>
            ))
          ) : (
            <div className="space-y-2 text-sm text-atl-silver">
              {[
                "No scripts or event handlers",
                "No dangerous URIs",
                "Metadata is parseable",
              ].map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  {item}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="atl-card-soft mt-4 p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-black text-atl-archive">SESM fields</h3>
          <span className="text-xs text-atl-frost">
            {fieldRows.filter(([, value]) => value).length} / {fieldRows.length}{" "}
            present
          </span>
        </div>
        <dl className="divide-y divide-atl-ridge/55 text-sm">
          {fieldRows.map(([key, value]) => (
            <div
              key={String(key)}
              className="grid grid-cols-[1fr_1.2fr] gap-3 py-2"
            >
              <dt className="flex items-center gap-2 text-atl-frost">
                <span
                  className={`h-2 w-2 rounded-full ${value ? "bg-emerald-400" : "bg-atl-smoke"}`}
                />
                {key}
              </dt>
              <dd className="truncate text-right text-atl-silver">
                {value ? String(value) : "missing"}
              </dd>
            </div>
          ))}
        </dl>
      </section>
    </aside>
  );
};

const SVGLabPage = () => {
  const [mode, setMode] = useState<LabMode>("create");
  const [svgText, setSvgText] = useState(starterSvg);
  const [generatedSvg, setGeneratedSvg] = useState("");
  const [metadataForm, setMetadataForm] =
    useState<SvgLabMetadataForm>(defaultMetadata);
  const [validation, setValidation] = useState<SvgLabValidation | null>(null);
  const [generatedMetadata, setGeneratedMetadata] = useState<Record<
    string,
    unknown
  > | null>(null);
  const [diff, setDiff] = useState<GenerateResponse["diff"] | null>(null);
  const [examples, setExamples] = useState<SvgLabExample[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [backendStatus, setBackendStatus] = useState<BackendStatus>("checking");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const previewSvg = generatedSvg || svgText;
  const previewUrl = useMemo(() => {
    const blob = new Blob([previewSvg], { type: "image/svg+xml" });
    return URL.createObjectURL(blob);
  }, [previewSvg]);
  const downloadUrl = useMemo(() => {
    const blob = new Blob([generatedSvg || svgText], { type: "image/svg+xml" });
    return URL.createObjectURL(blob);
  }, [generatedSvg, svgText]);
  const activeMode = modeCopy[mode];
  const outputSvg = generatedSvg || svgText;
  const sourceLineCount = svgText.split(/\r?\n/).length;
  const outputLineCount = outputSvg.split(/\r?\n/).length;
  const metadataPresent = Boolean(generatedMetadata);

  useEffect(() => () => URL.revokeObjectURL(previewUrl), [previewUrl]);
  useEffect(() => () => URL.revokeObjectURL(downloadUrl), [downloadUrl]);

  useEffect(() => {
    let mounted = true;
    fetch("/api/health")
      .then((response) => {
        if (!response.ok) throw new Error("Backend health check failed.");
        if (mounted) setBackendStatus("online");
      })
      .catch(() => {
        if (mounted) setBackendStatus("offline");
      });

    fetch("/api/svg-lab/examples")
      .then((response) =>
        response.ok
          ? response.json()
          : Promise.reject(new Error("Examples did not load.")),
      )
      .then((items: SvgLabExample[]) => {
        if (mounted) setExamples(items);
      })
      .catch(() => {
        if (mounted) setExamples([]);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const updateMetadata = (key: keyof SvgLabMetadataForm, value: string) => {
    setMetadataForm((current) => ({ ...current, [key]: value }));
  };

  const validate = useCallback(
    async (targetSvg = generatedSvg || svgText) => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/svg-lab/validate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ svgText: targetSvg }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Validation failed.");
        setValidation(data as SvgLabValidation);
        setGeneratedMetadata((data as SvgLabValidation).metadata);
      } catch (err) {
        setValidation(null);
        setGeneratedMetadata(null);
        setError(err instanceof Error ? err.message : "Validation failed.");
      } finally {
        setLoading(false);
      }
    },
    [generatedSvg, svgText],
  );

  useEffect(() => {
    void validate(svgText);
  }, [svgText, validate]);

  const generateFromSvg = useCallback(
    async (targetSvg: string, metadata: SvgLabMetadataForm) => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/svg-lab/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ svgText: targetSvg, metadata }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Generation failed.");
        const result = data as GenerateResponse;
        setSvgText(targetSvg);
        setGeneratedSvg(result.svgText);
        setGeneratedMetadata(result.metadata);
        setValidation(result.validation);
        setDiff(result.diff);
      } catch (err) {
        setValidation(null);
        setGeneratedMetadata(null);
        setError(err instanceof Error ? err.message : "Generation failed.");
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const generate = async () => {
    await generateFromSvg(svgText, metadataForm);
  };

  const readFile = async (file: File) => {
    setError(null);
    setGeneratedSvg("");
    setDiff(null);

    if (file.type && imageMimeTypes.has(file.type)) {
      setMode("create");
      const title = titleFromFileName(file.name);
      const nextMetadata = {
        ...metadataForm,
        assetTitle: title,
        tags: metadataForm.tags.includes("embedded-image")
          ? metadataForm.tags
          : `${metadataForm.tags}, embedded-image, raster-source`,
        accessibilitySummary:
          metadataForm.accessibilitySummary ===
          defaultMetadata.accessibilitySummary
            ? `Embedded raster image from ${file.name}. Review and replace this summary with useful alt-context before publishing.`
            : metadataForm.accessibilitySummary,
      };
      setMetadataForm(nextMetadata);
      const wrappedSvg = await rasterFileToSvg(file);
      await generateFromSvg(wrappedSvg, nextMetadata);
      return;
    }

    try {
      const text = await file.text();
      if (mode === "learn" || mode === "examples") {
        setMode("inspect");
      }
      setSvgText(text);
      setGeneratedSvg("");
      setGeneratedMetadata(null);
      setDiff(null);
      await validate(text);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not read SVG file.");
    }
  };

  const handleSvgDrop = async (event: DragEvent<HTMLButtonElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file) {
      await readFile(file);
    }
  };

  const handleCopy = async (key: string, text: string) => {
    await copyText(text);
    setCopied(key);
    window.setTimeout(() => setCopied(null), 1400);
  };

  const draftMetadataPreview = {
    sesm_version: "0.3.0",
    asset: {
      title: metadataForm.assetTitle,
      role: metadataForm.assetRole,
      ecosystem: metadataForm.project,
      tags: metadataForm.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
    },
    accessibility: {
      summary: metadataForm.accessibilitySummary,
    },
    provenance: {
      author: metadataForm.author,
      license: metadataForm.license,
      generator: {
        name: "aptlantis-svg-lab",
        version: metadataForm.version,
      },
    },
  };
  const metadataPreview =
    generatedMetadata ||
    (mode === "create" || mode === "compare" ? draftMetadataPreview : null);

  return (
    <div className="min-h-screen overflow-x-hidden text-atl-archive">
      <MetaTags
        title="SVG Lab | Aptlantis Studio"
        description="Create, inspect, validate, and learn SESM metadata inside SVG files."
        canonicalUrl="https://aptlantis.studio/svg-lab"
        ogTitle="SVG Lab | Aptlantis Studio"
        ogDescription="A server-backed SESM utility for semantic SVG metadata."
      />

      <main className="grid min-h-[calc(100vh-84px)] grid-cols-1 overflow-x-hidden xl:grid-cols-[180px_minmax(0,1fr)_330px]">
        <nav
          className="atl-grid-dense border-b border-atl-ridge/60 bg-atl-void/76 xl:border-b-0 xl:border-r"
          aria-label="SVG Lab modes"
        >
          <div className="border-b border-atl-ridge/60 px-5 py-6">
            <p className="atl-eyebrow text-[0.65rem]">SESM</p>
            <h1 className="atl-title mt-2 text-xl font-black">SVG Lab</h1>
          </div>
          <div className="grid grid-cols-3 gap-1 p-2 sm:grid-cols-6 xl:grid-cols-1 xl:gap-0 xl:p-0">
            {labModes.map((item) => {
              const Icon = item.icon;
              const active = mode === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setMode(item.id)}
                  data-testid={`svg-lab-mode-${item.id}`}
                  className={`flex min-h-[52px] items-center justify-center gap-2 border-l-2 px-3 text-sm font-bold transition xl:justify-start xl:px-5 ${
                    active
                      ? "border-atl-archive bg-atl-navy/70 text-atl-archive"
                      : "border-transparent text-atl-frost hover:bg-atl-abyss/70 hover:text-atl-archive"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </button>
              );
            })}
          </div>
          <div className="hidden p-5 text-xs leading-5 text-atl-mist xl:block">
            <p>Studio v1.3.0</p>
            <p>Aptlantis Studio</p>
            <p className="mt-8 flex items-center gap-2 text-atl-frost">
              <span
                className={`h-2 w-2 rounded-full ${
                  backendStatus === "online"
                    ? "bg-emerald-400"
                    : backendStatus === "checking"
                      ? "bg-amber-300"
                      : "bg-rose-400"
                }`}
              />
              Backend {backendStatus}
            </p>
          </div>
        </nav>

        <section className="atl-grid-hero min-w-0 bg-atl-deep/64">
          <div className="border-b border-atl-ridge/60 bg-atl-void/22 p-5">
            <h2 className="atl-title text-3xl font-black">
              {labModes.find((item) => item.id === mode)?.label}
            </h2>
            <p className="mt-1 text-sm text-atl-silver">
              {activeMode.description}
            </p>
          </div>

          <div className="grid gap-5 p-5 lg:grid-cols-[minmax(320px,0.9fr)_minmax(380px,1.4fr)]">
            <section className="space-y-4">
              <div className="atl-card p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h3 className="font-black text-atl-archive">
                    {activeMode.uploadTitle}
                  </h3>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".svg,image/svg+xml,image/png,image/jpeg,image/webp,image/gif,image/avif"
                    className="hidden"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) void readFile(file);
                    }}
                  />
                  <LabButton
                    variant="secondary"
                    testId="svg-lab-browse"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-4 w-4" />
                    Browse
                  </LabButton>
                </div>
                <button
                  type="button"
                  data-testid="svg-lab-drop-zone"
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={(event) => void handleSvgDrop(event)}
                  className="atl-grid-dense grid min-h-[138px] w-full place-items-center rounded-[8px] border border-dashed border-atl-bluegray/70 bg-atl-deep/70 p-4 text-center text-sm text-atl-frost transition hover:border-atl-silver hover:text-atl-archive"
                >
                  <span>
                    <Upload className="mx-auto mb-3 h-8 w-8" />
                    Drop SVG or image file here or click to browse
                  </span>
                </button>
              </div>

              {mode === "inspect" && (
                <div className="atl-card p-4">
                  <h3 className="mb-3 font-black text-atl-archive">
                    Inspection summary
                  </h3>
                  <dl className="grid gap-2 text-sm">
                    <div className="atl-card-soft flex items-center justify-between gap-3 rounded-[6px] px-3 py-2">
                      <dt className="text-atl-frost">Source size</dt>
                      <dd className="font-bold text-atl-archive">
                        {formatBytes(svgText)}
                      </dd>
                    </div>
                    <div className="atl-card-soft flex items-center justify-between gap-3 rounded-[6px] px-3 py-2">
                      <dt className="text-atl-frost">Source lines</dt>
                      <dd className="font-bold text-atl-archive">
                        {sourceLineCount}
                      </dd>
                    </div>
                    <div className="atl-card-soft flex items-center justify-between gap-3 rounded-[6px] px-3 py-2">
                      <dt className="text-atl-frost">SESM block</dt>
                      <dd
                        className={`font-bold ${metadataPresent ? "text-emerald-300" : "text-rose-200"}`}
                      >
                        {metadataPresent ? "detected" : "missing"}
                      </dd>
                    </div>
                    <div className="atl-card-soft flex items-center justify-between gap-3 rounded-[6px] px-3 py-2">
                      <dt className="text-atl-frost">Validator profile</dt>
                      <dd className="font-bold text-atl-archive">
                        {validation?.profile || "unchecked"}
                      </dd>
                    </div>
                  </dl>
                </div>
              )}

              {mode === "validate" && (
                <div className="atl-card p-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <h3 className="font-black text-atl-archive">
                      Validation run
                    </h3>
                    <span
                      className={`rounded-[6px] border px-2 py-1 text-xs font-black ${statusTone(validation?.status)}`}
                    >
                      {validation?.status || "unchecked"}
                    </span>
                  </div>
                  <div className="grid gap-2 text-sm text-atl-silver">
                    <p>
                      {validation
                        ? `${validation.errors.length} errors and ${validation.warnings.length} warnings.`
                        : "Run the validator against the current SVG."}
                    </p>
                    <p>
                      Target size: {formatBytes(outputSvg)} across{" "}
                      {outputLineCount} lines.
                    </p>
                    <LabButton
                      variant="secondary"
                      onClick={() => void validate()}
                      disabled={loading}
                      testId="svg-lab-run-validation"
                    >
                      {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <ShieldCheck className="h-4 w-4" />
                      )}
                      Validate current SVG
                    </LabButton>
                  </div>
                </div>
              )}

              {(mode === "create" || mode === "compare") && (
                <div className="atl-card p-4">
                  <h3 className="mb-3 font-black text-atl-archive">
                    {mode === "compare"
                      ? "Comparison Metadata"
                      : "Metadata (SESM)"}
                  </h3>
                  <div className="grid gap-3">
                    <Field label="Asset title">
                      <input
                        value={metadataForm.assetTitle}
                        onChange={(event) =>
                          updateMetadata("assetTitle", event.target.value)
                        }
                        className="min-h-[36px] rounded-[6px] border border-atl-ridge bg-atl-void/60 px-3 text-sm text-atl-archive outline-none focus:border-atl-silver"
                      />
                    </Field>
                    <Field label="Asset role">
                      <select
                        value={metadataForm.assetRole}
                        onChange={(event) =>
                          updateMetadata("assetRole", event.target.value)
                        }
                        className="min-h-[36px] rounded-[6px] border border-atl-ridge bg-atl-void/60 px-3 text-sm text-atl-archive outline-none focus:border-atl-silver"
                      >
                        <option value="logo">logo / brand mark</option>
                        <option value="diagram">diagram</option>
                        <option value="icon">icon</option>
                        <option value="status-badge">status-badge</option>
                        <option value="decorative">decorative</option>
                      </select>
                    </Field>
                    {(
                      [
                        "project",
                        "author",
                        "license",
                        "tags",
                        "version",
                      ] as const
                    ).map((field) => (
                      <Field key={field} label={field}>
                        <input
                          value={metadataForm[field]}
                          onChange={(event) =>
                            updateMetadata(field, event.target.value)
                          }
                          className="min-h-[36px] rounded-[6px] border border-atl-ridge bg-atl-void/60 px-3 text-sm text-atl-archive outline-none focus:border-atl-silver"
                        />
                      </Field>
                    ))}
                    <Field label="Accessibility summary">
                      <textarea
                        value={metadataForm.accessibilitySummary}
                        onChange={(event) =>
                          updateMetadata(
                            "accessibilitySummary",
                            event.target.value,
                          )
                        }
                        rows={3}
                        className="rounded-[6px] border border-atl-ridge bg-atl-void/60 px-3 py-2 text-sm text-atl-archive outline-none focus:border-atl-silver"
                      />
                    </Field>
                    <LabButton
                      onClick={generate}
                      disabled={loading}
                      testId="svg-lab-generate"
                    >
                      {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Code2 className="h-4 w-4" />
                      )}
                      {mode === "compare"
                        ? "Generate comparison"
                        : "Generate SESM SVG"}
                    </LabButton>
                  </div>
                </div>
              )}

              {mode === "learn" && (
                <div className="atl-card p-4">
                  <h3 className="mb-3 font-black text-atl-archive">
                    Field guide
                  </h3>
                  <div className="space-y-3">
                    {learnFields.map((field) => (
                      <article key={field.name} className="atl-card-soft p-3">
                        <h4 className="font-mono text-sm font-black text-atl-archive">
                          {field.name}
                        </h4>
                        <p className="mt-1 text-sm leading-6 text-atl-silver">
                          {field.purpose}
                        </p>
                      </article>
                    ))}
                  </div>
                </div>
              )}

              {mode === "examples" && (
                <div className="atl-card p-4">
                  <h3 className="mb-3 font-black text-atl-archive">Examples</h3>
                  <div className="space-y-3">
                    {examples.map((example) => (
                      <button
                        key={example.id}
                        type="button"
                        onClick={() => {
                          setSvgText(example.svgText);
                          setGeneratedSvg("");
                          setDiff(null);
                          setMode("inspect");
                          void validate(example.svgText);
                        }}
                        className="atl-card-soft w-full p-3 text-left transition hover:border-atl-silver"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <h4 className="font-black text-atl-archive">
                            {example.title}
                          </h4>
                          <span
                            className={`rounded-[6px] border px-2 py-1 text-xs font-black ${statusTone(example.expectedStatus)}`}
                          >
                            {example.expectedStatus}
                          </span>
                        </div>
                        <p className="mt-1 text-sm leading-5 text-atl-silver">
                          {example.description}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </section>

            <section className="min-w-0 space-y-4">
              <div className="atl-card overflow-hidden">
                <div className="flex flex-col gap-3 border-b border-atl-ridge/55 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <h3 className="font-black text-atl-archive">
                    {activeMode.previewTitle}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    <LabButton
                      variant="secondary"
                      testId="svg-lab-validate"
                      onClick={() => void validate()}
                    >
                      <ShieldCheck className="h-4 w-4" />
                      Validate
                    </LabButton>
                    <a
                      download="svg-lab-output.svg"
                      href={downloadUrl}
                      className="atl-button min-h-[38px] px-3 text-sm font-black no-underline"
                    >
                      <Download className="h-4 w-4" />
                      Download SVG
                    </a>
                  </div>
                </div>
                <div className="atl-grid-dense grid min-h-[260px] place-items-center bg-atl-void/60 p-5">
                  <img
                    src={previewUrl}
                    alt="SVG preview"
                    className="max-h-[300px] max-w-full rounded-[8px] object-contain"
                  />
                </div>
              </div>

              <div className="atl-card overflow-hidden">
                <div className="flex flex-col gap-3 border-b border-atl-ridge/55 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <h3 className="font-black text-atl-archive">
                    {activeMode.metadataTitle}{" "}
                    <span className="font-normal text-atl-frost">
                      (JSON Preview)
                    </span>
                  </h3>
                  <LabButton
                    variant="secondary"
                    disabled={!metadataPreview}
                    onClick={() =>
                      void handleCopy("metadata", formatJson(metadataPreview))
                    }
                  >
                    <Copy className="h-4 w-4" />
                    {copied === "metadata" ? "Copied" : "Copy metadata"}
                  </LabButton>
                </div>
                {metadataPreview ? (
                  <pre className="max-h-[310px] overflow-auto whitespace-pre-wrap break-words p-4 font-mono text-xs leading-5 text-atl-silver">
                    {formatJson(metadataPreview)}
                  </pre>
                ) : (
                  <div className="grid min-h-[160px] place-items-center p-4 text-center text-sm leading-6 text-atl-frost">
                    No SESM metadata is embedded in the current SVG.
                  </div>
                )}
              </div>
            </section>
          </div>

          {mode === "compare" && (
            <section className="border-t border-atl-ridge/60 bg-atl-void/20 p-5">
              <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h3 className="text-lg font-black text-atl-archive">
                  Metadata Diff
                </h3>
                <div className="flex flex-wrap items-center gap-2 text-sm text-atl-frost">
                  <span>
                    Before: {diff?.beforeLineCount || sourceLineCount} lines
                  </span>
                  <span>
                    After: {diff?.afterLineCount || outputLineCount} lines
                  </span>
                  <span className="text-emerald-300">
                    Changes: {diff?.additions || 0} additions
                  </span>
                </div>
              </div>
              <div className="grid gap-4 lg:grid-cols-2">
                <div className="atl-card-soft overflow-hidden">
                  <div className="flex items-center justify-between border-b border-atl-ridge/55 px-3 py-2 text-sm font-bold text-atl-silver">
                    Before (Original SVG)
                    <button
                      type="button"
                      onClick={() => void handleCopy("before", svgText)}
                      className="text-atl-frost hover:text-atl-archive"
                      aria-label="Copy original SVG"
                    >
                      <Clipboard className="h-4 w-4" />
                    </button>
                  </div>
                  <pre className="max-h-[260px] overflow-auto whitespace-pre-wrap break-words p-3 font-mono text-xs leading-5 text-atl-silver">
                    {truncate(svgText)}
                  </pre>
                </div>
                <div className="atl-card-soft overflow-hidden">
                  <div className="flex items-center justify-between border-b border-atl-ridge/55 px-3 py-2 text-sm font-bold text-atl-archive">
                    After (SESM SVG)
                    <button
                      type="button"
                      onClick={() => void handleCopy("after", outputSvg)}
                      className="text-atl-frost hover:text-atl-archive"
                      aria-label="Copy generated SVG"
                    >
                      <Clipboard className="h-4 w-4" />
                    </button>
                  </div>
                  <pre className="max-h-[260px] overflow-auto whitespace-pre-wrap break-words p-3 font-mono text-xs leading-5 text-atl-silver">
                    {truncate(outputSvg)}
                  </pre>
                </div>
              </div>
            </section>
          )}
        </section>

        <StatusInspector
          validation={validation}
          metadata={generatedMetadata}
          loading={loading}
          error={error}
          onValidate={() => void validate()}
        />
      </main>
    </div>
  );
};

export default SVGLabPage;

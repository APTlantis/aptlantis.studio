// Client API for distributions with fallback to static JSON

export interface DbDistribution {
  _id: string;
  type: string;
  title: string;
  description: string;
  websiteUrl: string;
  isoUrl?: string | null;
  rsyncCommand: string;
  logoSrc: string;
  longDescription?: string | null;
  aboutText?: string | null;
  releaseYear?: number | null;
  features?: string[];
  desktopEnvironments?: string[];
  packageManager?: string | null;
  basedOn?: string | null;
  architectures?: string[];
  screenshots?: string[];
  communityLinks?: { type: string; url: string }[];
  documentation?: string | null;
  lastRelease?: string | null;
  isMuseum?: boolean;
  videos?: string[];
  historicalPosts?: string[];
  historicalContext?: string | null;
  yearDiscontinued?: number | null;
  requirements?: { minimum?: string | null; recommended?: string | null };
  tags?: string[];
}

export interface Distribution {
  id: string;
  title: string;
  description: string;
  websiteUrl: string;
  isoUrl?: string;
  rsyncCommand: string;
  logoSrc: string;
  longDescription?: string;
  aboutText?: string;
  releaseYear?: number;
  features?: string[];
  desktopEnvironments?: string[];
  packageManager?: string;
  basedOn?: string;
  architectures?: string[];
  screenshots?: string[];
  communityLinks?: { type: string; url: string }[];
  documentation?: string;
  lastRelease?: string;
  isMuseum?: boolean;
  videos?: string[];
  historicalPosts?: string[];
  historicalContext?: string;
  yearDiscontinued?: number;
  minimumRequirements?: string;
  recommendedRequirements?: string;
  tags?: string[];
  // UI-only defaults carried over from TS data
  buttonColor: string;
  buttonText: string;
}

export type DataSource = "api" | "fallback";

function mapDbToUi(d: DbDistribution): Distribution {
  return {
    id: d._id,
    title: d.title,
    description: d.description,
    websiteUrl: d.websiteUrl,
    isoUrl: d.isoUrl ?? undefined,
    rsyncCommand: d.rsyncCommand,
    logoSrc: d.logoSrc,
    longDescription: d.longDescription ?? undefined,
    aboutText: d.aboutText ?? undefined,
    releaseYear: d.releaseYear ?? undefined,
    features: d.features ?? [],
    desktopEnvironments: d.desktopEnvironments ?? [],
    packageManager: d.packageManager ?? undefined,
    basedOn: d.basedOn ?? undefined,
    architectures: d.architectures ?? [],
    screenshots: d.screenshots ?? [],
    communityLinks: d.communityLinks ?? [],
    documentation: d.documentation ?? undefined,
    lastRelease: d.lastRelease ?? undefined,
    isMuseum: d.isMuseum ?? false,
    videos: d.videos ?? [],
    historicalPosts: d.historicalPosts ?? [],
    historicalContext: d.historicalContext ?? undefined,
    yearDiscontinued: d.yearDiscontinued ?? undefined,
    minimumRequirements: d.requirements?.minimum ?? undefined,
    recommendedRequirements: d.requirements?.recommended ?? undefined,
    tags: d.tags ?? [],
    // Reasonable defaults for UI-only fields
    buttonColor:
      "bg-cyan-700 dark:bg-cyan-900 text-white hover:bg-cyan-800 dark:hover:bg-cyan-950",
    buttonText: "Visit Website",
  };
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.json();
}

export async function fetchDistributions(params?: {
  q?: string;
  tag?: string;
}): Promise<{ items: Distribution[]; source: DataSource }> {
  const q = params?.q ? `q=${encodeURIComponent(params.q)}` : "";
  const tag = params?.tag ? `tag=${encodeURIComponent(params.tag)}` : "";
  const qs = [q, tag].filter(Boolean).join("&");
  const apiUrl = qs ? `/api/distributions?${qs}` : "/api/distributions";
  try {
    const data = await fetchJson<{ items: DbDistribution[] }>(apiUrl);
    return { items: data.items.map(mapDbToUi), source: "api" };
  } catch (e) {
    // Fallback to static JSON
    const docs = await fetchJson<DbDistribution[]>(
      "/data/admin.Distributions.json",
    );
    return { items: docs.map(mapDbToUi), source: "fallback" };
  }
}

export async function fetchDistributionById(
  id: string,
): Promise<{ item: Distribution | null; source: DataSource }> {
  try {
    const data = await fetchJson<DbDistribution>(
      `/api/distributions/${encodeURIComponent(id)}`,
    );
    return { item: mapDbToUi(data), source: "api" };
  } catch (e) {
    const { items } = await fetchDistributions();
    const item = items.find((d) => d.id === id) || null;
    return { item, source: "fallback" };
  }
}

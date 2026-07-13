// Data loader for distros - transforms JSON to match the expected TypeScript interface
import distrosJson from "./aptlantis.distros.json";

// Define the interface that matches what the app expects (from distrosCurrent.tsx)
export interface Distro {
  id: string;
  title: string;
  description: string;
  longDescription?: string;
  buttonColor: string;
  buttonText: string;
  rsyncCommand: string;
  logoSrc: string;
  websiteUrl: string;
  isoUrl?: string;

  // Optional metadata
  aboutText?: string;
  architectures?: string[];
  basedOn?: string;
  desktopEnvironments?: string[];
  documentation?: string;
  eos?: string[];
  features?: string[];
  historicalContext?: string;
  historicalPosts?: string[];
  isMuseum?: boolean;
  lastRelease?: string;
  minimumRequirements?: string;
  packageManager?: string;
  recommendedRequirements?: string;
  releaseYear?: number;
  screenshots?: string[];
  yearDiscontinued?: number;
  communityLinks?: { type: string; url: string }[];
  version?: string;
  tags?: string[];
}

// Transform JSON data to match the Distro interface
export const distros: Distro[] = distrosJson.map((item: any) => ({
  id: item.id,
  title: item.name || item.title, // JSON uses 'name', but interface expects 'title'
  description: item.description,
  longDescription: item.longDescription,
  buttonColor:
    item.buttonColor ||
    "bg-blue-600 dark:bg-blue-800 text-white hover:bg-blue-700 dark:hover:bg-blue-900",
  buttonText: item.buttonText || "Visit Website",
  rsyncCommand: item.rsyncCommand || "",
  logoSrc: item.logoSrc || item.branding?.logo_svg || "/placeholder.svg",
  websiteUrl: item.homepage || item.websiteUrl || "",
  isoUrl: item.isoUrl,

  // Optional metadata
  aboutText: item.aboutText,
  architectures: item.architectures,
  basedOn: item.origin?.parent_distro || item.basedOn,
  desktopEnvironments: item.desktopEnvironments,
  documentation: item.documentation_url || item.documentation,
  eos: item.eos,
  features: item.features,
  historicalContext: item.historicalContext,
  historicalPosts: item.historicalPosts,
  isMuseum: item.isMuseum,
  lastRelease: item.lastRelease,
  minimumRequirements: item.minimumRequirements,
  packageManager: item.packageManager,
  recommendedRequirements: item.recommendedRequirements,
  releaseYear: item.origin?.first_release
    ? parseInt(item.origin.first_release)
    : item.releaseYear,
  screenshots:
    item.screenshots?.map((s: any) => s.url || s) || item.screenshots,
  yearDiscontinued: item.yearDiscontinued,
  communityLinks: item.communityLinks,
  version: item.releases?.[0]?.version || item.version,
  tags: item.tags || [],
}));

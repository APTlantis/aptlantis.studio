export interface QuickLink {
  id: string;
  label: string;
  url: string;
  icon?: string;
  buttonClass?: string;
}

export const quickLinks: QuickLink[] = [
  {
    id: "website",
    label: "Visit Website",
    url: "", // Will be populated dynamically with distro.websiteUrl
    icon: "external-link",
    buttonClass: "button-primary",
  },
  {
    id: "iso",
    label: "ISO Directory",
    url: "", // Will be populated dynamically with distro.isoUrl
    icon: "file-down",
    buttonClass: "button-secondary",
  },
  {
    id: "documentation",
    label: "Documentation",
    url: "", // Will be populated dynamically with distro.documentationUrl or fallback
    icon: "book",
    buttonClass: "button-info",
  },
];

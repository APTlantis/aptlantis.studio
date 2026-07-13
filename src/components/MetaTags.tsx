import { useEffect } from "react";

interface MetaTagsProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogImageAlt?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  twitterImageAlt?: string;
  structuredData?: Record<string, unknown>;
}

/**
 * MetaTags component for updating metadata dynamically for client-side routing
 *
 * This component uses React's useEffect to update the metadata in the document head
 * when navigating between pages using client-side routing.
 *
 * @param props - MetaTagsProps
 * @returns JSX.Element
 */
const MetaTags = ({
  title = "APTlantis - High-Speed Linux Mirrors, ISOs, and Open-Source Tools",
  description = "APTlantis is a blazing-fast Linux mirror hub hosting full repositories, ISOs, and open-source packages for the global FOSS community. Built for speed.",
  keywords = "APTlantis, Linux mirrors, Linux ISOs, open-source downloads, Debian mirror, Fedora mirror, Arch mirror, Linux repos, FOSS archive, open source hosting",
  canonicalUrl = "https://aptlantis.net/",
  ogTitle = "APTlantis - High-Speed Linux Mirrors & ISOs",
  ogDescription = "APTlantis provides lightning-fast access to Linux repos, ISO downloads, and open-source archives.",
  ogImage = "https://aptlantis.net/logos/aptlantis-usb.jpeg",
  ogImageAlt = "APTlantis Logo and Banner",
  twitterTitle = "APTlantis - High-Speed Linux Mirrors & ISOs",
  twitterDescription = "Blazing-fast Linux mirror hub hosting full repositories, ISOs, and open-source packages.",
  twitterImage = "https://aptlantis.net/logos/aptlantis-usb.jpeg",
  twitterImageAlt = "APTlantis Logo and Banner",
  structuredData,
}: MetaTagsProps) => {
  // Update the document title when the component mounts or updates
  useEffect(() => {
    if (title) {
      document.title = title;
    }

    // Update meta tags
    updateMetaTag("description", description);
    updateMetaTag("keywords", keywords);

    // Update canonical URL
    updateLink("canonical", canonicalUrl);

    // Update Open Graph meta tags
    updateMetaTag("og:title", ogTitle, "property");
    updateMetaTag("og:description", ogDescription, "property");
    updateMetaTag("og:url", canonicalUrl, "property");
    updateMetaTag("og:image", ogImage, "property");
    updateMetaTag("og:image:alt", ogImageAlt, "property");
    updateMetaTag("og:type", "website", "property");

    // Update Twitter Card meta tags
    updateMetaTag("twitter:card", "summary_large_image");
    updateMetaTag("twitter:title", twitterTitle);
    updateMetaTag("twitter:description", twitterDescription);
    updateMetaTag("twitter:image", twitterImage);
    updateMetaTag("twitter:image:alt", twitterImageAlt);

    // Update structured data
    if (structuredData) {
      let script = document.querySelector('script[type="application/ld+json"]');
      if (!script) {
        script = document.createElement("script");
        script.setAttribute("type", "application/ld+json");
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(structuredData);
    }

    // Cleanup function to remove tags when component unmounts
    return () => {
      // Cleanup could be implemented here if needed
    };
  }, [
    title,
    description,
    keywords,
    canonicalUrl,
    ogTitle,
    ogDescription,
    ogImage,
    ogImageAlt,
    twitterTitle,
    twitterDescription,
    twitterImage,
    twitterImageAlt,
    structuredData,
  ]);

  // Helper function to update meta tags
  const updateMetaTag = (
    name: string,
    content: string,
    attributeName: string = "name",
  ) => {
    if (!content) return;

    let meta = document.querySelector(`meta[${attributeName}="${name}"]`);
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute(attributeName, name);
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", content);
  };

  // Helper function to update link tags
  const updateLink = (rel: string, href: string) => {
    if (!href) return;

    let link = document.querySelector(`link[rel="${rel}"]`);
    if (!link) {
      link = document.createElement("link");
      link.setAttribute("rel", rel);
      document.head.appendChild(link);
    }
    link.setAttribute("href", href);
  };

  // This component doesn't render anything visible
  return null;
};

export default MetaTags;

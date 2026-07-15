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
  title = "Aptlantis Studio - Project Teaching Studio and Evidence Catalog",
  description = "Aptlantis Studio is an evidence-led project portfolio for Aptlantis tools, standards, release posture, screenshots, structured metadata, and operator-facing project notes.",
  keywords = "Aptlantis Studio, project portfolio, evidence catalog, release evidence, structured metadata, SESM, CityHall, FileCabinet, CloneCratesio, Structra",
  canonicalUrl = "https://aptlantis.studio/",
  ogTitle = "Aptlantis Studio - Project Teaching Studio",
  ogDescription = "Evidence-led project pages, standards maps, screenshots, manifests, and operator notes for the Aptlantis ecosystem.",
  ogImage = "https://aptlantis.studio/logos/aptlantis-organization-board.png",
  ogImageAlt = "Aptlantis organization identity board with blue-slate island tower and metallic wordmark",
  twitterTitle = "Aptlantis Studio - Project Teaching Studio",
  twitterDescription = "Evidence-led project pages, standards maps, screenshots, manifests, and operator notes for the Aptlantis ecosystem.",
  twitterImage = "https://aptlantis.studio/logos/aptlantis-organization-board.png",
  twitterImageAlt = "Aptlantis organization identity board with blue-slate island tower and metallic wordmark",
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

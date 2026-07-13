import { useState, useEffect } from "react";
import MetaTags from "../../../components/MetaTags";

interface ContentSection {
  heading: string;
  body: string;
}

interface FAQ {
  question: string;
  answer: string;
  tags?: string[];
}

interface Credit {
  name: string;
  role: string;
  url?: string;
}

interface Contact {
  email: string;
  url: string;
  note: string;
}

interface AboutPageData {
  title: string;
  slug: string;
  summary: string;
  mission: string;
  content_sections: ContentSection[];
  faq: FAQ[];
  contact: Contact;
  credits: Credit[];
}

const AboutPage = () => {
  const [data, setData] = useState<AboutPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const metaTitle = data?.title
    ? `${data.title} | APTlantis`
    : "About APTlantis";
  const metaDescription =
    data?.summary ||
    "Learn about APTlantis, a schema-driven mirror and archive platform for Linux distros, registries, and datasets.";
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: metaTitle,
    url: "https://aptlantis.net/about",
    description: metaDescription,
    mainEntity: {
      "@type": "Organization",
      name: "APTlantis",
      url: "https://aptlantis.net",
      contactPoint: data?.contact
        ? {
            "@type": "ContactPoint",
            email: data.contact.email,
            url: data.contact.url,
            contactType: "customer support",
          }
        : undefined,
    },
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/data/about_page.schema_completed.json");
        if (!response.ok) {
          throw new Error("Failed to load about page data");
        }
        const jsonData = await response.json();
        setData(jsonData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="atl-container py-12">
        <MetaTags
          title={metaTitle}
          description={metaDescription}
          canonicalUrl="https://aptlantis.net/about"
          ogTitle={metaTitle}
          ogDescription={metaDescription}
          structuredData={structuredData}
        />
        <div className="animate-pulse">
          <div className="mb-6 h-8 w-1/3 rounded bg-atl-steel"></div>
          <div className="space-y-4">
            <div className="h-4 w-full rounded bg-atl-steel"></div>
            <div className="h-4 w-5/6 rounded bg-atl-steel"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="atl-container py-12">
        <MetaTags
          title={metaTitle}
          description={metaDescription}
          canonicalUrl="https://aptlantis.net/about"
          ogTitle={metaTitle}
          ogDescription={metaDescription}
          structuredData={structuredData}
        />
        <h1 className="atl-title mb-6 text-3xl font-bold">About APTlantis</h1>
        <p className="text-red-400">Error loading page content: {error}</p>
      </div>
    );
  }

  return (
    <div className="atl-container py-12">
      <MetaTags
        title={metaTitle}
        description={metaDescription}
        canonicalUrl="https://aptlantis.net/about"
        ogTitle={metaTitle}
        ogDescription={metaDescription}
        structuredData={structuredData}
      />
      <h1 className="atl-title mb-4 text-3xl font-bold">{data.title}</h1>
      <p className="atl-subtitle mb-8 text-lg">{data.summary}</p>

      <div className="space-y-8">
        {/* Mission Section */}
        <section className="atl-card p-5">
          <h2 className="mb-3 text-2xl font-semibold text-atl-archive">
            Our Mission
          </h2>
          <p className="atl-subtitle">{data.mission}</p>
        </section>

        {/* Dynamic Content Sections */}
        {data.content_sections.map((section, index) => (
          <section key={index} className="atl-card p-5">
            <h2 className="mb-3 text-2xl font-semibold text-atl-archive">
              {section.heading}
            </h2>
            <p className="atl-subtitle">{section.body}</p>
          </section>
        ))}

        {/* FAQ Section */}
        {data.faq && data.faq.length > 0 && (
          <section className="atl-panel p-5">
            <h2 className="mb-4 text-2xl font-semibold text-atl-archive">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              {data.faq.map((item, index) => (
                <div key={index} className="atl-card-soft p-4">
                  <h3 className="mb-2 text-lg font-medium text-atl-archive">
                    {item.question}
                  </h3>
                  <p className="atl-subtitle">{item.answer}</p>
                  {item.tags && item.tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {item.tags.map((tag, tagIndex) => (
                        <span key={tagIndex} className="atl-tag px-2 py-1">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Credits Section */}
        {data.credits && data.credits.length > 0 && (
          <section className="atl-card p-5">
            <h2 className="mb-4 text-2xl font-semibold text-atl-archive">
              Credits
            </h2>
            <div className="space-y-3">
              {data.credits.map((credit, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div>
                    <span className="font-medium text-atl-archive">
                      {credit.url ? (
                        <a
                          href={credit.url}
                          className="text-atl-archive underline-offset-4 hover:underline"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {credit.name}
                        </a>
                      ) : (
                        credit.name
                      )}
                    </span>
                    <span className="text-atl-frost"> — {credit.role}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Contact Section */}
        {data.contact && (
          <section className="atl-card p-5">
            <h2 className="mb-3 text-2xl font-semibold text-atl-archive">
              Contact Us
            </h2>
            <p className="atl-subtitle mb-2">{data.contact.note}</p>
            <p className="atl-subtitle">
              Email:{" "}
              <a
                href={`mailto:${data.contact.email}`}
                className="text-atl-archive underline-offset-4 hover:underline"
              >
                {data.contact.email}
              </a>
            </p>
            <p className="atl-subtitle">
              Website:{" "}
              <a
                href={data.contact.url}
                className="text-atl-archive underline-offset-4 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                {data.contact.url}
              </a>
            </p>
          </section>
        )}
      </div>
    </div>
  );
};

export default AboutPage;

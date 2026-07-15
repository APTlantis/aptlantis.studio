import MetaTags from "../../../components/MetaTags";

const terms = [
  {
    title: "1. What This Site Provides",
    body: "Aptlantis Studio is a public project catalog and teaching surface. It presents project descriptions, screenshots, metadata, schemas, public manifests, release posture, and operator notes for Aptlantis-related work.",
  },
  {
    title: "2. Public Data And Crawling",
    body: "Public metadata, schemas, manifests, project records, screenshots, and media exposed through the site are intended to be indexed, archived, and inspected. Crawlers should use the public manifest, sitemap, and robots.txt as the first orientation points.",
  },
  {
    title: "3. Evidence And Completion Claims",
    body: "Project pages may describe draft work, incomplete tools, missing evidence, or unverified release steps. A claim should only be treated as verified when the page or linked artifact names the supporting evidence.",
  },
  {
    title: "4. Third-Party Content",
    body: "Some pages may reference third-party projects, upstream repositories, licenses, screenshots, tools, libraries, or standards. Those materials remain governed by their own authors, maintainers, and licenses.",
  },
  {
    title: "5. Acceptable Use",
    body: "You may browse, index, cite, and inspect the public site. Do not attempt to disrupt the service, submit malicious content, exploit contact forms, misrepresent Aptlantis project status, or remove attribution from copied public materials.",
  },
  {
    title: "6. No Warranty",
    body: "The site is provided as-is. Documentation, metadata, project records, and public assets may be incomplete, outdated, or draft. Use linked project tools, commands, or release artifacts only after reviewing their current evidence and source context.",
  },
  {
    title: "7. Changes",
    body: "Aptlantis Studio is under active cleanup and revision. Routes, data files, manifests, and page structures may change as legacy content is removed and current project records are normalized.",
  },
];

const TermsPage = () => {
  const title = "Terms of Service";
  const description =
    "Terms for using Aptlantis Studio, a public project catalog and evidence-led teaching surface.";

  return (
    <div className="atl-container py-12">
      <MetaTags
        title={`${title} | Aptlantis`}
        description={description}
        canonicalUrl="https://aptlantis.studio/terms"
        ogTitle={title}
        ogDescription={description}
      />

      <header className="atl-panel atl-ornament p-6 sm:p-8">
        <p className="atl-eyebrow">Aptlantis / Legal</p>
        <h1 className="atl-title atl-gradient-text mt-4 text-4xl font-black">
          Terms for a public project catalog.
        </h1>
        <p className="atl-subtitle mt-4 max-w-3xl">
          These terms describe use of Aptlantis Studio as a public
          documentation, metadata, and evidence site. They do not turn draft
          project pages into release guarantees or security audits.
        </p>
      </header>

      <div className="mt-8 grid gap-4">
        {terms.map((term) => (
          <section key={term.title} className="atl-card p-5">
            <h2 className="text-xl font-semibold text-atl-archive">
              {term.title}
            </h2>
            <p className="atl-subtitle mt-3">{term.body}</p>
          </section>
        ))}
      </div>

      <section className="atl-card mt-8 p-5">
        <h2 className="text-xl font-semibold text-atl-archive">8. Contact</h2>
        <p className="atl-subtitle mt-3">
          For corrections, attribution questions, metadata issues, or policy
          concerns, use the Contact page so the request can be routed with the
          right project context.
        </p>
      </section>

      <div className="mt-8 text-center text-sm text-atl-frost">
        Last updated: July 15, 2026
      </div>
    </div>
  );
};

export default TermsPage;

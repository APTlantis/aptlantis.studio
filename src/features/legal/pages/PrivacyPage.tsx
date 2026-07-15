import MetaTags from "../../../components/MetaTags";

const privacySections = [
  {
    title: "1. What The Site Publishes",
    body: "Aptlantis Studio intentionally publishes public project records, metadata, screenshots, schemas, manifests, and supporting evidence assets. Those public files are designed to be crawlable and archived.",
  },
  {
    title: "2. Information You Submit",
    body: "If you use a contact form, the submitted name, email address, category, and message are sent to the site operator for review. Do not submit secrets, credentials, private exports, or sensitive personal data through public contact channels.",
  },
  {
    title: "3. Operational Logs",
    body: "The hosting environment may create ordinary web server or application logs such as request path, user agent, timestamp, and IP address. These logs are used for debugging, abuse prevention, and operational troubleshooting.",
  },
  {
    title: "4. Public Metadata",
    body: "Public manifests and schemas describe site content, not visitors. They may include project names, public URLs, asset paths, status notes, update cadence, and crawler guidance.",
  },
  {
    title: "5. Third-Party Services",
    body: "Some infrastructure, previews, or linked resources may involve third-party platforms such as GitHub, browser preview services, hosting providers, or external project repositories. Their privacy practices are governed by their own policies.",
  },
  {
    title: "6. No Sale Of Personal Data",
    body: "Aptlantis Studio is not designed to sell personal data. Contact information submitted for correspondence is used to respond to the request or investigate the reported issue.",
  },
  {
    title: "7. Security Boundaries",
    body: "Public project pages and metadata are not a promise that every linked tool, artifact, or dependency has been independently audited. Security-sensitive reports should include enough context to reproduce or evaluate the issue without exposing secrets.",
  },
];

const PrivacyPage = () => {
  const title = "Privacy Policy";
  const description =
    "Privacy notes for Aptlantis Studio, including public metadata, contact submissions, ordinary operational logs, and crawler-friendly data.";

  return (
    <div className="atl-container py-12">
      <MetaTags
        title={`${title} | Aptlantis`}
        description={description}
        canonicalUrl="https://aptlantis.studio/privacy"
        ogTitle={title}
        ogDescription={description}
      />

      <header className="atl-panel atl-ornament p-6 sm:p-8">
        <p className="atl-eyebrow">Aptlantis / Privacy</p>
        <h1 className="atl-title atl-gradient-text mt-4 text-4xl font-black">
          Public metadata is intentional. Private data is not.
        </h1>
        <p className="atl-subtitle mt-4 max-w-3xl">
          Aptlantis Studio is designed around public project records and
          crawlable evidence assets. The site should not require visitors to
          provide personal data just to read the catalog.
        </p>
      </header>

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        <article className="atl-card p-5">
          <h2 className="text-xl font-bold text-atl-archive">Public</h2>
          <p className="atl-subtitle mt-3 text-sm">
            Project metadata, schemas, manifests, screenshots, and evidence
            paths.
          </p>
        </article>
        <article className="atl-card p-5">
          <h2 className="text-xl font-bold text-atl-archive">Submitted</h2>
          <p className="atl-subtitle mt-3 text-sm">
            Contact form details you choose to send for a correction, report, or
            collaboration note.
          </p>
        </article>
        <article className="atl-card p-5">
          <h2 className="text-xl font-bold text-atl-archive">Operational</h2>
          <p className="atl-subtitle mt-3 text-sm">
            Ordinary request logs used to keep the site running and investigate
            problems.
          </p>
        </article>
      </section>

      <div className="mt-8 grid gap-4">
        {privacySections.map((section) => (
          <section key={section.title} className="atl-card p-5">
            <h2 className="text-xl font-semibold text-atl-archive">
              {section.title}
            </h2>
            <p className="atl-subtitle mt-3">{section.body}</p>
          </section>
        ))}
      </div>

      <section className="atl-card mt-8 p-5">
        <h2 className="text-xl font-semibold text-atl-archive">
          8. Contact And Corrections
        </h2>
        <p className="atl-subtitle mt-3">
          If a public page or metadata file exposes something that should not be
          public, use the Contact page and include the URL, affected asset, and
          the reason it should be corrected.
        </p>
      </section>

      <div className="mt-8 text-center text-sm text-atl-frost">
        Last updated: July 15, 2026
      </div>
    </div>
  );
};

export default PrivacyPage;

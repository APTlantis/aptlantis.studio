import { Link } from "react-router-dom";
import MetaTags from "../../../components/MetaTags";

const pillars = [
  {
    title: "Mission",
    body: "Aptlantis Studio explains the projects, standards, and evidence that make up the Aptlantis ecosystem. It is built to help visitors understand what each tool does, how it is operated, and what proof exists.",
  },
  {
    title: "System",
    body: "The site connects project records, screenshots, manifests, schemas, release notes, and public metadata into one readable teaching surface instead of scattering context across repos.",
  },
  {
    title: "Longevity",
    body: "The goal is durable explanation: public data should be crawlable, pages should name missing pieces honestly, and evidence should stay close to the claims it supports.",
  },
];

const evidenceRows = [
  {
    label: "Project catalog",
    value: "/data/projects/portfolio.json",
    status: "public",
  },
  {
    label: "Crawler manifest",
    value: "/data/manifest.json",
    status: "draft",
  },
  {
    label: "Project media",
    value: "/projects/<project-slug>/",
    status: "curated",
  },
  {
    label: "Schema records",
    value: "/schemas/",
    status: "public",
  },
];

const principles = [
  {
    title: "Evidence before polish",
    body: "A strong page should show what exists: screenshots, command examples, manifests, diagrams, release notes, generated outputs, or explicit gaps.",
  },
  {
    title: "Operator-facing language",
    body: "Aptlantis pages should say what a tool does, what it produces, what still needs work, and what an operator should inspect before trusting it.",
  },
  {
    title: "Structured public data",
    body: "Public JSON and schemas are part of the site, not implementation leftovers. They should be stable, documented, and friendly to crawlers and archival tools.",
  },
  {
    title: "Distinct project shape",
    body: "Desktop apps, command-line tools, standards, labs, and visual metadata systems should each use the evidence format that proves them best.",
  },
];

const questions = [
  {
    question: "Is Aptlantis Studio a landing page?",
    answer:
      "No. It is a project teaching studio: part portfolio, part engineering catalog, part release-readiness dashboard, and part standards explanation layer.",
  },
  {
    question: "Why so much emphasis on manifests and metadata?",
    answer:
      "Because the site is meant to be useful to people and machines. Clear public records make the project catalog easier to index, archive, validate, and maintain.",
  },
  {
    question: "Does the site claim every project is finished?",
    answer:
      "No. Incomplete work should stay visible. Missing release evidence, unverified installers, draft schemas, and unfinished workflows are part of the public truth model.",
  },
  {
    question: "What should happen when a project is hard to explain?",
    answer:
      "Add better evidence: a diagram, artifact sample, validation panel, screenshot, command output, project map, or concise operator workflow.",
  },
];

const structuredData = {
  "@context": "https://schema.org",
  "@type": "AboutPage",
  name: "About Aptlantis Studio",
  url: "https://aptlantis.studio/about",
  description:
    "Aptlantis Studio is an evidence-led project teaching studio for Aptlantis tools, standards, public metadata, screenshots, manifests, and operator notes.",
  mainEntity: {
    "@type": "Organization",
    name: "Aptlantis",
    url: "https://aptlantis.studio",
  },
};

const AboutPage = () => {
  const metaTitle = "About Aptlantis Studio";
  const metaDescription =
    "Aptlantis Studio is an evidence-led project teaching studio for Aptlantis tools, standards, public metadata, screenshots, manifests, and operator notes.";

  return (
    <div className="atl-container py-12">
      <MetaTags
        title={`${metaTitle} | Aptlantis`}
        description={metaDescription}
        canonicalUrl="https://aptlantis.studio/about"
        ogTitle={metaTitle}
        ogDescription={metaDescription}
        structuredData={structuredData}
      />

      <header className="atl-panel atl-ornament overflow-hidden">
        <div className="grid gap-0 lg:grid-cols-[1fr_320px]">
          <div className="p-6 sm:p-8">
            <p className="atl-eyebrow">Aptlantis / About</p>
            <h1 className="atl-title atl-gradient-text atl-text-balance mt-4 text-4xl font-black sm:text-5xl">
              Project truth, organized for inspection.
            </h1>
            <p className="atl-subtitle mt-5 max-w-3xl text-base">
              Aptlantis Studio is the public explanation layer for Aptlantis
              projects. It connects tools, standards, screenshots, metadata, and
              release posture so a visitor can understand what exists, what is
              proven, and what still needs work.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <span className="atl-tag atl-tag-verified px-3 py-2">
                Evidence first
              </span>
              <span className="atl-tag px-3 py-2">Public metadata</span>
              <span className="atl-tag px-3 py-2">Operator notes</span>
            </div>
          </div>
          <aside className="border-t border-atl-ridge/60 bg-atl-void/40 p-6 lg:border-l lg:border-t-0">
            <p className="atl-eyebrow">Current focus</p>
            <div className="mt-4 space-y-3 text-sm">
              <div className="atl-card-soft p-3">
                <p className="font-semibold text-atl-archive">
                  Project portfolio
                </p>
                <p className="mt-1 text-atl-frost">
                  Teaching pages for tools, labs, and standards.
                </p>
              </div>
              <div className="atl-card-soft p-3">
                <p className="font-semibold text-atl-archive">Public catalog</p>
                <p className="mt-1 text-atl-frost">
                  Crawlable JSON, schemas, screenshots, and media evidence.
                </p>
              </div>
              <div className="atl-card-soft p-3">
                <p className="font-semibold text-atl-archive">Cleanup stage</p>
                <p className="mt-1 text-atl-frost">
                  Retiring legacy mirror-site surfaces and duplicate loaders.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </header>

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        {pillars.map((pillar) => (
          <article key={pillar.title} className="atl-card p-5">
            <h2 className="text-xl font-bold text-atl-archive">
              {pillar.title}
            </h2>
            <p className="atl-subtitle mt-3 text-sm">{pillar.body}</p>
          </article>
        ))}
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="atl-card p-5">
          <p className="atl-eyebrow">How to read this site</p>
          <h2 className="atl-title mt-3 text-3xl font-black">
            Each page should answer what it does and how we know.
          </h2>
          <p className="atl-subtitle mt-4">
            Aptlantis Studio is not trying to make every project sound equally
            complete. A project page should distinguish working interfaces from
            drafts, generated records from curated notes, and public evidence
            from future intent.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link className="atl-button px-4 py-2 text-sm" to="/#projects">
              Browse Projects
            </Link>
            <Link
              className="atl-button-ghost px-4 py-2 text-sm"
              to="/project/cityhall"
            >
              View Standards
            </Link>
          </div>
        </div>

        <div className="atl-code p-4">
          <div className="mb-3 flex items-center justify-between gap-3 border-b border-atl-ridge/60 pb-3">
            <span className="atl-eyebrow">Public evidence map</span>
            <span className="atl-tag px-2 py-1">crawlable</span>
          </div>
          <div className="space-y-2">
            {evidenceRows.map((row) => (
              <div
                key={row.value}
                className="grid gap-2 rounded-[6px] border border-atl-ridge/50 bg-atl-void/50 p-3 text-sm sm:grid-cols-[150px_1fr_90px]"
              >
                <span className="text-atl-archive">{row.label}</span>
                <code className="text-atl-silver">{row.value}</code>
                <span className="text-atl-frost">{row.status}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="atl-panel mt-8 p-5">
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="atl-eyebrow">Operating principles</p>
            <h2 className="atl-title mt-2 text-3xl font-black">
              What the studio optimizes for
            </h2>
          </div>
          <p className="max-w-xl text-sm text-atl-frost">
            These rules keep the site from sliding back into generic portfolio
            copy or inherited template structure.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {principles.map((principle) => (
            <article key={principle.title} className="atl-card-soft p-4">
              <h3 className="font-bold text-atl-archive">{principle.title}</h3>
              <p className="atl-subtitle mt-2 text-sm">{principle.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[320px_1fr]">
        <aside className="atl-card p-5">
          <p className="atl-eyebrow">Contact lanes</p>
          <h2 className="atl-title mt-3 text-2xl font-black">
            Corrections, context, and collaboration.
          </h2>
          <p className="atl-subtitle mt-4 text-sm">
            The Contact page is the right place for project corrections, missing
            evidence, metadata issues, collaboration notes, or security
            reporting channels as those are formalized.
          </p>
          <Link className="atl-button mt-5 px-4 py-2 text-sm" to="/contact">
            Contact Aptlantis
          </Link>
        </aside>

        <div className="space-y-4">
          {questions.map((item) => (
            <article key={item.question} className="atl-card p-5">
              <h3 className="text-lg font-bold text-atl-archive">
                {item.question}
              </h3>
              <p className="atl-subtitle mt-2">{item.answer}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};

export default AboutPage;

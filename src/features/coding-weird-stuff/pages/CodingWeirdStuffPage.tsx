import { lazy, Suspense, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import MetaTags from "../../../components/MetaTags";

const AsciiGenerator = lazy(() =>
  import("../components/AsciiGenerator").then((mod) => ({
    default: mod.default,
  })),
);

interface Experiment {
  id: string;
  title: string;
  constraint: string;
  proves: string;
  status: string;
  medium?: string;
}

interface ExperimentCatalog {
  id: string;
  title: string;
  description: string;
  lastUpdated: string;
  source: string;
  items: Experiment[];
}

const fallbackExperiments: Experiment[] = [
  {
    id: "ascii-art-generator",
    title: "ASCII Art Generator",
    constraint: "Terminal text and Figlet fonts",
    proves:
      "Typography can become an interface primitive when the output is meant for terminals, READMEs, and old-console aesthetics.",
    status: "live tool",
  },
  {
    id: "css-only-tic-tac-toe",
    title: "CSS-only Tic Tac Toe",
    constraint: "No JavaScript state",
    proves:
      "Inputs, selectors, and document structure can model simple interaction when the medium is treated as a runtime.",
    status: "catalog idea",
  },
  {
    id: "sql-raytracer",
    title: "SQL Raytracer",
    constraint: "Relational queries only",
    proves:
      "Declarative systems can express surprisingly procedural-looking computation when the problem is reframed.",
    status: "field note",
  },
  {
    id: "spreadsheet-games",
    title: "Spreadsheet Games",
    constraint: "Cells, formulas, and macros",
    proves:
      "A grid can become a display surface, state store, and control layer when the rows and columns are treated as machinery.",
    status: "catalog idea",
  },
];

const concepts = [
  "constraint-driven programming",
  "state in hostile media",
  "formats as runtimes",
  "terminal presentation",
  "esolang literacy",
  "deliberate wrong-tool design",
];

const notes = [
  {
    question: "Why keep this section?",
    answer:
      "It shows the playful edge of the same Aptlantis habit: taking structure seriously, even when the medium is strange.",
  },
  {
    question: "Is it only about esolangs?",
    answer:
      "No. Esolangs belong here, but the broader thesis is constraint-driven programming: CSS, SQL, spreadsheets, old languages, terminals, regex, and office tools can all become teaching surfaces.",
  },
  {
    question: "What makes an experiment worth cataloging?",
    answer:
      "It should teach something about state, parsing, rendering, automation, interfaces, or the boundary between data format and executable behavior.",
  },
];

const structuredData = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Coding Against The Grain",
  url: "https://aptlantis.studio/coding-against-the-grain",
  description:
    "Aptlantis Studio lab for unusual programming, constrained systems, esolang notes, terminal tools, and wrong-tool experiments.",
};

const CodingWeirdStuffPage = () => {
  const title = "Coding Against The Grain";
  const description =
    "Unusual programming labs, esolang notes, terminal tools, and constraint-driven experiments for learning how software behaves when the medium fights back.";
  const [catalog, setCatalog] = useState<ExperimentCatalog | null>(null);
  const [catalogError, setCatalogError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/data/coding-against-the-grain/experiments.json")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Catalog request failed: ${response.status}`);
        }
        return response.json() as Promise<ExperimentCatalog>;
      })
      .then((data) => {
        setCatalog(data);
        setCatalogError(null);
      })
      .catch((error) => {
        setCatalogError(
          error instanceof Error ? error.message : "Catalog did not load",
        );
      });
  }, []);

  const experiments = catalog?.items ?? fallbackExperiments;

  return (
    <div className="atl-container py-12">
      <MetaTags
        title={`${title} | Aptlantis`}
        description={description}
        canonicalUrl="https://aptlantis.studio/coding-against-the-grain"
        ogTitle={title}
        ogDescription={description}
        structuredData={structuredData}
      />

      <header className="atl-panel atl-ornament overflow-hidden">
        <div className="grid gap-0 lg:grid-cols-[1fr_320px]">
          <div className="p-6 sm:p-8">
            <p className="atl-eyebrow">Aptlantis / Lab</p>
            <h1 className="atl-title atl-gradient-text atl-text-balance mt-4 text-4xl font-black sm:text-5xl">
              Coding Against The Grain
            </h1>
            <p className="atl-subtitle mt-5 max-w-3xl text-base">
              Creative programming where the medium fights back. This section
              collects tools, notes, and experiments that use constrained or
              unexpected systems to teach how computation, state, and interfaces
              really work.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <span className="atl-tag atl-tag-verified px-3 py-2">
                Constraint-driven
              </span>
              <span className="atl-tag px-3 py-2">Terminal tools</span>
              <span className="atl-tag px-3 py-2">Esolang notes</span>
            </div>
          </div>
          <aside className="border-t border-atl-ridge/60 bg-atl-void/40 p-6 lg:border-l lg:border-t-0">
            <p className="atl-eyebrow">Section status</p>
            <div className="mt-4 space-y-3 text-sm">
              <div className="atl-card-soft p-3">
                <p className="font-semibold text-atl-archive">Renamed</p>
                <p className="mt-1 text-atl-frost">
                  Formerly Coding Weird Stuff. Old route remains compatible.
                </p>
              </div>
              <div className="atl-card-soft p-3">
                <p className="font-semibold text-atl-archive">First tool</p>
                <p className="mt-1 text-atl-frost">
                  ASCII / Figlet generator reframed as a lab instrument.
                </p>
              </div>
              <div className="atl-card-soft p-3">
                <p className="font-semibold text-atl-archive">Next layer</p>
                <p className="mt-1 text-atl-frost">
                  Language index, concepts, and field notes can grow here.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </header>

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        <article className="atl-card p-5">
          <h2 className="text-xl font-bold text-atl-archive">Constraint</h2>
          <p className="atl-subtitle mt-3 text-sm">
            Start with a limited or awkward medium and ask what it can express.
          </p>
        </article>
        <article className="atl-card p-5">
          <h2 className="text-xl font-bold text-atl-archive">Experiment</h2>
          <p className="atl-subtitle mt-3 text-sm">
            Build something recognizable enough to reveal the hidden machinery.
          </p>
        </article>
        <article className="atl-card p-5">
          <h2 className="text-xl font-bold text-atl-archive">Lesson</h2>
          <p className="atl-subtitle mt-3 text-sm">
            Capture what the constraint teaches about state, control, rendering,
            or representation.
          </p>
        </article>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="atl-card p-5">
          <p className="atl-eyebrow">Overview</p>
          <h2 className="atl-title mt-3 text-3xl font-black">
            Weird is not the point. The constraint is.
          </h2>
          <p className="atl-subtitle mt-4">
            The old page was a novelty shelf. This version treats unusual
            programming as a teaching method. A CSS game, SQL renderer, Excel
            interface, or terminal banner is worth keeping when it shows how a
            system stores state, accepts input, renders output, or bends a data
            format into a runtime.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {concepts.map((concept) => (
              <span key={concept} className="atl-tag px-3 py-2">
                {concept}
              </span>
            ))}
          </div>
        </div>

        <div className="atl-code p-4">
          <div className="mb-3 flex items-center justify-between gap-3 border-b border-atl-ridge/60 pb-3">
            <div>
              <span className="atl-eyebrow">Field catalog seed</span>
              <p className="mt-1 text-xs text-atl-frost">
                /data/coding-against-the-grain/experiments.json
              </p>
            </div>
            <span className="atl-tag px-2 py-1">
              {catalog ? `${experiments.length} items` : "loading"}
            </span>
          </div>
          {catalogError && (
            <div className="mb-3 rounded-[6px] border border-atl-warning/50 bg-atl-warning/10 p-3 text-sm text-atl-warning">
              Public catalog fallback active: {catalogError}
            </div>
          )}
          <div className="max-h-[460px] space-y-2 overflow-y-auto pr-2">
            {experiments.map((experiment) => (
              <article
                key={experiment.id}
                className="rounded-[6px] border border-atl-ridge/50 bg-atl-void/50 p-3"
              >
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <h3 className="font-bold text-atl-archive">
                    {experiment.title}
                  </h3>
                  <span className="text-xs uppercase tracking-[0.18em] text-atl-frost">
                    {experiment.status}
                  </span>
                </div>
                <p className="mt-2 text-sm text-atl-silver">
                  Constraint: {experiment.constraint}
                </p>
                <p className="mt-1 text-sm text-atl-frost">
                  What it proves: {experiment.proves}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="atl-panel mt-8 p-5">
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="atl-eyebrow">Lab instrument</p>
            <h2 className="atl-title mt-2 text-3xl font-black">
              ASCII / Figlet Generator
            </h2>
          </div>
          <p className="max-w-xl text-sm text-atl-frost">
            The first tool stays because it is practical, playful, and aligned
            with the site’s terminal/evidence language.
          </p>
        </div>
        <Suspense
          fallback={
            <div className="atl-card-soft p-4 text-center text-atl-silver">
              Loading ASCII generator...
            </div>
          }
        >
          <AsciiGenerator />
        </Suspense>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[320px_1fr]">
        <aside className="atl-card p-5">
          <p className="atl-eyebrow">Next buildout</p>
          <h2 className="atl-title mt-3 text-2xl font-black">
            Tools, language index, concepts, notes.
          </h2>
          <p className="atl-subtitle mt-4 text-sm">
            This page can grow into tabs later. For now, it establishes the
            section thesis and keeps the existing tool available.
          </p>
          <Link className="atl-button mt-5 px-4 py-2 text-sm" to="/contact">
            Suggest an experiment
          </Link>
        </aside>

        <div className="space-y-4">
          {notes.map((item) => (
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

export default CodingWeirdStuffPage;

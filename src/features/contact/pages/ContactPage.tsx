import type React from "react";
import { useState } from "react";
import MetaTags from "../../../components/MetaTags";
import SesmHeroImage from "../../../components/SesmHeroImage";

type MessageCategory =
  | "general"
  | "bug-report"
  | "contribution"
  | "support"
  | "other";

interface ContactFormData {
  name: string;
  email: string;
  category: MessageCategory;
  message: string;
}

const contactLanes = [
  {
    title: "Project corrections",
    body: "Use this for stale project descriptions, wrong status labels, missing evidence, broken links, or screenshots that no longer prove the current behavior.",
    category: "bug-report" as MessageCategory,
  },
  {
    title: "Metadata and manifests",
    body: "Report schema drift, public JSON issues, crawler manifest gaps, sitemap errors, or confusing public asset paths.",
    category: "support" as MessageCategory,
  },
  {
    title: "Collaboration notes",
    body: "Send context for project writeups, standards alignment, examples, screenshots, or documentation that would improve the teaching surface.",
    category: "contribution" as MessageCategory,
  },
  {
    title: "Sensitive concerns",
    body: "Use minimal detail first. Do not paste secrets, private exports, keys, tokens, or personal data into the form.",
    category: "other" as MessageCategory,
  },
];

const includeItems = [
  "The page URL or public data file involved.",
  "What looks wrong, stale, missing, or risky.",
  "What evidence would make the correction trustworthy.",
  "Whether the issue affects one project or the site structure.",
];

const ContactPage = () => {
  const [formData, setFormData] = useState<ContactFormData>({
    name: "",
    email: "",
    category: "general",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const metaTitle = "Contact Aptlantis";
  const metaDescription =
    "Contact Aptlantis Studio about project corrections, public metadata, evidence gaps, collaboration notes, or sensitive site concerns.";
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: metaTitle,
    url: "https://aptlantis.studio/contact",
    description: metaDescription,
    mainEntity: {
      "@type": "Organization",
      name: "Aptlantis",
      url: "https://aptlantis.studio",
    },
  };

  const handleChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const chooseLane = (category: MessageCategory, title: string) => {
    setFormData((prev) => ({
      ...prev,
      category,
      message: prev.message || `${title}:\n\n`,
    }));
    setSubmitResult(null);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setSubmitResult(null);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setSubmitResult({
          success: true,
          message: result.message,
        });

        setFormData({
          name: "",
          email: "",
          category: "general",
          message: "",
        });
      } else {
        setSubmitResult({
          success: false,
          message:
            result.message ||
            "There was an error sending your message. Please try again later.",
        });
      }
    } catch {
      setSubmitResult({
        success: false,
        message:
          "There was an error sending your message. Please try again later.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="atl-container py-12">
      <MetaTags
        title={`${metaTitle} | Aptlantis`}
        description={metaDescription}
        canonicalUrl="https://aptlantis.studio/contact"
        ogTitle={metaTitle}
        ogDescription={metaDescription}
        structuredData={structuredData}
      />

      <header className="atl-panel atl-ornament overflow-hidden p-3 sm:p-4">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-stretch">
          <SesmHeroImage
            src="/logos/aptlantis-contact-hero-logo.svg"
            alt="Aptlantis Contact hero artwork for routing corrections with evidence."
            title="Route corrections with evidence."
            description="Use this page for project corrections, metadata issues, missing evidence, public asset concerns, and collaboration notes."
            aspect="wide"
          />
          <aside className="rounded-[8px] border border-atl-ridge/70 bg-atl-void/45 p-5">
            <p className="atl-eyebrow">Do not send</p>
            <ul className="mt-4 space-y-3 text-sm text-atl-silver">
              <li className="atl-card-soft p-3">API keys or passwords</li>
              <li className="atl-card-soft p-3">Private exports or logs</li>
              <li className="atl-card-soft p-3">Personal data from archives</li>
              <li className="atl-card-soft p-3">Unredacted secrets</li>
            </ul>
          </aside>
        </div>
      </header>

      <section className="mt-8 grid gap-4 md:grid-cols-2">
        {contactLanes.map((lane) => (
          <article key={lane.title} className="atl-card p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-xl font-bold text-atl-archive">
                  {lane.title}
                </h2>
                <p className="atl-subtitle mt-3 text-sm">{lane.body}</p>
              </div>
              <button
                type="button"
                className="atl-button-ghost shrink-0 px-3 py-2 text-sm"
                onClick={() => chooseLane(lane.category, lane.title)}
              >
                Use lane
              </button>
            </div>
          </article>
        ))}
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <aside className="atl-card p-5">
          <p className="atl-eyebrow">Useful message shape</p>
          <h2 className="atl-title mt-3 text-3xl font-black">
            Give the page something concrete to fix.
          </h2>
          <ul className="mt-5 space-y-3">
            {includeItems.map((item) => (
              <li
                key={item}
                className="atl-card-soft p-3 text-sm text-atl-silver"
              >
                {item}
              </li>
            ))}
          </ul>
        </aside>

        <section className="atl-card p-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="name"
                  className="mb-1 block text-sm font-medium"
                >
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full rounded-md border border-atl-ridge bg-atl-void/60 p-2 text-atl-archive focus:outline-none focus:ring-2 focus:ring-atl-silver"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="mb-1 block text-sm font-medium"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full rounded-md border border-atl-ridge bg-atl-void/60 p-2 text-atl-archive focus:outline-none focus:ring-2 focus:ring-atl-silver"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="category"
                className="mb-1 block text-sm font-medium"
              >
                Category
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full rounded-md border border-atl-ridge bg-atl-void/60 p-2 text-atl-archive focus:outline-none focus:ring-2 focus:ring-atl-silver"
              >
                <option value="general">General context</option>
                <option value="bug-report">Correction or broken page</option>
                <option value="support">Metadata or manifest issue</option>
                <option value="contribution">
                  Collaboration or contribution
                </option>
                <option value="other">Sensitive or other concern</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="message"
                className="mb-1 block text-sm font-medium"
              >
                Message
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows={8}
                className="w-full rounded-md border border-atl-ridge bg-atl-void/60 p-2 text-atl-archive focus:outline-none focus:ring-2 focus:ring-atl-silver"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="atl-button min-h-[40px] px-4 py-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? "Sending..." : "Send Message"}
            </button>

            {submitResult && (
              <div
                className={`rounded-md p-3 ${
                  submitResult.success
                    ? "bg-green-500/20 text-green-300"
                    : "bg-red-500/20 text-red-300"
                }`}
              >
                {submitResult.message}
              </div>
            )}
          </form>
        </section>
      </section>
    </div>
  );
};

export default ContactPage;

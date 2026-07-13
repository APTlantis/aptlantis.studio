import type React from "react";
import { useState } from "react";
import MetaTags from "../../../components/MetaTags";

// Category options matching the incoming-message schema's classified_category enum
type MessageCategory =
  | "support"
  | "contribution"
  | "bug-report"
  | "general"
  | "other";

interface ContactFormData {
  name: string;
  email: string;
  category: MessageCategory;
  message: string;
}

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

  const metaTitle = "Contact APTlantis";
  const metaDescription =
    "Get in touch with APTlantis to report issues, contribute, or request support for mirrors, torrents, and datasets.";
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: metaTitle,
    url: "https://aptlantis.net/contact",
    description: metaDescription,
    mainEntity: {
      "@type": "Organization",
      name: "APTlantis",
      url: "https://aptlantis.net",
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "customer support",
        email: "hschumannhome@gmail.com",
        areaServed: "Global",
        availableLanguage: ["en"],
      },
    },
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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

        // Reset form
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
    } catch (error) {
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
        title={metaTitle}
        description={metaDescription}
        canonicalUrl="https://aptlantis.net/contact"
        ogTitle={metaTitle}
        ogDescription={metaDescription}
        structuredData={structuredData}
      />
      <h1 className="atl-title mb-6 text-3xl font-bold">Contact Us</h1>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div className="atl-card p-5">
          <h2 className="mb-3 text-2xl font-semibold text-atl-archive">
            Get in Touch
          </h2>
          <p className="atl-subtitle mb-6">
            Have questions about our mirrors? Want to report an issue? Or just
            want to say hello? Fill out the form and we&apos;ll get back to you
            as soon as possible.
          </p>

          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-2">Email</h3>
              <p className="text-atl-archive">contact@aptlantis.com</p>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">IRC</h3>
              <p className="text-atl-archive">#ComingSoon</p>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">Codeberg</h3>
              <p className="text-atl-archive">codeberg.org/aptlantis</p>
            </div>
          </div>
        </div>

        <div className="atl-card p-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-1">
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
              <label htmlFor="email" className="block text-sm font-medium mb-1">
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

            <div>
              <label
                htmlFor="category"
                className="block text-sm font-medium mb-1"
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
                <option value="general">General Inquiry</option>
                <option value="support">Support Request</option>
                <option value="bug-report">Bug Report</option>
                <option value="contribution">Contribution</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="message"
                className="block text-sm font-medium mb-1"
              >
                Message
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows={5}
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
                className={`p-3 rounded-md ${submitResult.success ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}
              >
                {submitResult.message}
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;

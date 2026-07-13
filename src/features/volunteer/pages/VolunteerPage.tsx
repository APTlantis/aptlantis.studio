import { useState } from "react";
import MetaTags from "../../../components/MetaTags";

const VolunteerPage = () => {
  const [iframeLoaded, setIframeLoaded] = useState(false);

  return (
    <div className="atl-container py-12">
      <MetaTags
        title="Volunteer with APTlantis"
        description="Apply to volunteer with APTlantis: help maintain mirrors, improve the site, and support the open-source community."
        canonicalUrl="https://aptlantis.net/volunteer"
        ogTitle="Volunteer with APTlantis"
        ogDescription="Join the APTlantis volunteer program to support mirrors, site improvements, and the open-source community."
        structuredData={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "Volunteer with APTlantis",
          url: "https://aptlantis.net/volunteer",
          description:
            "Volunteer with APTlantis to help maintain mirrors, improve the site, and support the open-source community.",
          isPartOf: {
            "@type": "WebSite",
            name: "APTlantis",
            url: "https://aptlantis.net",
          },
        }}
      />
      <h1 className="atl-title mb-6 text-3xl font-bold">
        Volunteer Application
      </h1>

      <div className="atl-card mb-8 p-5">
        <p className="atl-subtitle">
          Thank you for your interest in volunteering with APTlantis! We&apos;re
          always looking for passionate individuals to help maintain our
          mirrors, improve our website, and support the open-source community.
        </p>
        <p className="atl-subtitle mt-2">
          Please fill out the form below to apply. We&apos;ll review your
          application and get back to you as soon as possible.
        </p>
      </div>

      <div className="overflow-hidden rounded-md border border-atl-ridge">
        {!iframeLoaded && (
          <div className="atl-grid-dense flex h-[600px] items-center justify-center bg-atl-deep">
            <div className="h-12 w-12 animate-spin rounded-full border-2 border-atl-ridge border-t-atl-archive" />
          </div>
        )}
        <iframe
          src="/volunteer.html"
          className={`w-full h-[600px] ${iframeLoaded ? "block" : "hidden"}`}
          onLoad={() => setIframeLoaded(true)}
          title="QBASIC Volunteer Form"
        />
      </div>
    </div>
  );
};

export default VolunteerPage;

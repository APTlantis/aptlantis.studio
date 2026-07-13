const TermsPage = () => {
  return (
    <div className="atl-container py-12">
      <h1 className="atl-title mb-6 text-3xl font-bold">Terms of Service</h1>

      <div className="space-y-6">
        <section className="atl-card p-5">
          <h2 className="mb-3 text-2xl font-semibold text-atl-archive">
            1. Acceptance of Terms
          </h2>
          <p className="atl-subtitle">
            By accessing or using the Aptlantis website and services, you agree
            to be bound by these Terms of Service. If you do not agree to these
            terms, please do not use our services.
          </p>
        </section>

        <section className="atl-card p-5">
          <h2 className="mb-3 text-2xl font-semibold text-atl-archive">
            2. Use of Services
          </h2>
          <p className="atl-subtitle">
            Aptlantis provides mirror services for Linux distributions and
            open-source software. You may use our services for personal,
            educational, or commercial purposes, subject to the following
            restrictions:
          </p>
          <ul className="atl-subtitle mt-2 list-disc space-y-1 pl-6">
            <li>Do not attempt to overload or disrupt our servers</li>
            <li>
              Do not use automated tools to scrape or download content in a
              manner that could negatively impact service performance
            </li>
            <li>
              Do not redistribute our mirror content as your own without proper
              attribution
            </li>
            <li>Do not use our services for any illegal activities</li>
          </ul>
        </section>

        <section className="atl-card p-5">
          <h2 className="mb-3 text-2xl font-semibold text-atl-archive">
            3. Service Availability
          </h2>
          <p className="atl-subtitle">
            While we strive to maintain high availability of our services, we do
            not guarantee uninterrupted access. Services may be temporarily
            unavailable due to maintenance, updates, or factors beyond our
            control.
          </p>
        </section>

        <section className="atl-card p-5">
          <h2 className="mb-3 text-2xl font-semibold text-atl-archive">
            4. Intellectual Property
          </h2>
          <p className="atl-subtitle">
            The content mirrored on Aptlantis is subject to the respective
            licenses of the original projects. The Aptlantis name, logo, and
            website design are the property of Aptlantis and may not be used
            without permission.
          </p>
        </section>

        <section className="atl-card p-5">
          <h2 className="mb-3 text-2xl font-semibold text-atl-archive">
            5. Limitation of Liability
          </h2>
          <p className="atl-subtitle">
            Aptlantis provides mirror services &quot;as is&quot; without
            warranties of any kind. We are not responsible for any damages or
            issues that may arise from the use of our services or the software
            obtained through our mirrors.
          </p>
        </section>

        <section className="atl-card p-5">
          <h2 className="mb-3 text-2xl font-semibold text-atl-archive">
            6. Changes to Terms
          </h2>
          <p className="atl-subtitle">
            We reserve the right to modify these Terms of Service at any time.
            Changes will be effective immediately upon posting to the website.
            Your continued use of our services after changes constitutes
            acceptance of the updated terms.
          </p>
        </section>

        <section className="atl-card p-5">
          <h2 className="mb-3 text-2xl font-semibold text-atl-archive">
            7. Contact
          </h2>
          <p className="atl-subtitle">
            If you have any questions about these Terms of Service, please
            contact us at
            <a
              href="mailto:legal@aptlantis.com"
              className="ml-1 text-atl-archive underline-offset-4 hover:underline"
            >
              legal@aptlantis.com
            </a>
            .
          </p>
        </section>
      </div>

      <div className="mt-8 text-center text-sm text-atl-frost">
        Last updated: May 7, 2025
      </div>
    </div>
  );
};

export default TermsPage;

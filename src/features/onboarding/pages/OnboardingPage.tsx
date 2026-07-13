import React from "react";

const OnboardingPage = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-6">🛸 Aptlantis Onboarding</h1>

      <div className="space-y-8">
        <section>
          <p className="text-gray-300 text-lg mb-6">
            Welcome to <strong>Aptlantis</strong> — a mythic, modular,
            mirror-driven infrastructure built for the preservation,
            distribution, and celebration of open-source systems.
          </p>

          <p className="text-gray-300 mb-6">
            Aptlantis is <strong>not just a Linux mirror</strong> — it's a{" "}
            <strong>living archive</strong>, a{" "}
            <strong>lore-rich environment</strong>, and a{" "}
            <strong>modern, modular Docker-based app</strong> for syncing,
            storing, sharing, and showing the best of obscure, bleeding-edge,
            and legacy distros alike.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3 text-cyan-400">
            🚀 What Is Aptlantis?
          </h2>
          <p className="text-gray-300 mb-4">Aptlantis is:</p>
          <ul className="list-disc pl-6 space-y-2 text-gray-300">
            <li>
              🌀 A fully automated <strong>mirror hub</strong> (55+ distros,
              70TB+ of data)
            </li>
            <li>
              🧩 A <strong>modular containerized system</strong> built with Go,
              Rust, Python, Kotlin, and TypeScript
            </li>
            <li>
              🧠 A system of{" "}
              <strong>
                real-time rsync syncers, dashboards, and metadata analysis
              </strong>
            </li>
            <li>
              🖥️ A <strong>visually rich, dark-themed frontend</strong> with
              Bootstrap-powered cards and per-distro dashboards
            </li>
            <li>
              🧙 A project imbued with <strong>mythos</strong> (Akx Parsers,
              Relics, Conventicles, and Vanguard layers)
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3 text-cyan-400">
            📂 Directory & Network Structure
          </h2>
          <p className="text-gray-300 mb-4">
            Each layer of Aptlantis is logically namespaced and maps to a
            container network and functional domain:
          </p>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-gray-800 rounded-lg overflow-hidden">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-300">
                    Layer
                  </th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-300">
                    Purpose
                  </th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-300">
                    Namespace
                  </th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-300">
                    Example Services
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                <tr>
                  <td className="px-4 py-2 text-sm text-gray-300 font-mono">
                    `sudo-swupd-Nexus`
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-300">
                    Orchestration & Observability
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-300 font-mono">
                    `swupd-*`
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-300">
                    RepoPulse, Dispatcher, Grafana
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-2 text-sm text-gray-300 font-mono">
                    `sudo-eopkg-Vanguard`
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-300">
                    Security & Edge Defense
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-300 font-mono">
                    `eopkg-*`
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-300">
                    BunkerWeb, CrowdSec, Fail2Ban
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-2 text-sm text-gray-300 font-mono">
                    `sudo-dpkg-Conventicle`
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-300">
                    Social & Interaction
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-300 font-mono">
                    `dpkg-*`
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-300">
                    IRC, TheLounge, Chatbots
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-2 text-sm text-gray-300 font-mono">
                    `sudo-yum-RepoPulse`
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-300">
                    Mirror Services
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-300 font-mono">
                    `yum-*`
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-300">
                    ISO rsync, FileServer, HTTPD
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-2 text-sm text-gray-300 font-mono">
                    `sudo-zypper-Panacea`
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-300">
                    Support Tools
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-300 font-mono">
                    `zypper-*`
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-300">
                    Submission Secretary, Image Processors
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-2 text-sm text-gray-300 font-mono">
                    *(Planned)* `sudo-rpm-RelicVault`
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-300">
                    Cold Storage & Archives
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-300 font-mono">
                    `rpm-*`
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-300">
                    Ancient ISOs, Akx Relics
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-2 text-sm text-gray-300 font-mono">
                    *(Planned)* `sudo-zfs-Mythica`
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-300">
                    Tiered Storage & AI/ML
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-300 font-mono">
                    `myth-*`
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-300">
                    LLaMA Fine-Tuning, Inference APIs
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3 text-cyan-400">
            🔧 Getting Started (Dev)
          </h2>
          <ol className="list-decimal pl-6 space-y-2 text-gray-300">
            <li>
              <strong>Install Docker & Docker Compose</strong>
            </li>
            <li>
              Clone the repo:
              <pre className="bg-gray-800 p-3 rounded mt-2 overflow-x-auto">
                <code>
                  git clone https://github.com/aptlantis/aptlantis.git cd
                  aptlantis
                </code>
              </pre>
            </li>
            <li>
              Start the network:
              <pre className="bg-gray-800 p-3 rounded mt-2 overflow-x-auto">
                <code>docker compose up -d</code>
              </pre>
            </li>
          </ol>
          <p className="text-gray-300 mt-4">
            Services will come online based on your compose structure. For full
            functionality, ensure MongoDB, Caddy/BunkerWeb, and cloud DNS are
            configured.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3 text-cyan-400">
            🌍 Live Services
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-gray-800 rounded-lg overflow-hidden">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-300">
                    Service
                  </th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-300">
                    URL
                  </th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-300">
                    Description
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                <tr>
                  <td className="px-4 py-2 text-sm text-gray-300">
                    <strong>Main Site</strong>
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-300 font-mono">
                    https://aptlantis.net
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-300">
                    Web UI, distro cards, dashboards
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-2 text-sm text-gray-300">
                    <strong>IRC (SSL)</strong>
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-300 font-mono">
                    irc.aptlantis.net:6697
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-300">
                    Public chat
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-2 text-sm text-gray-300">
                    <strong>rsync</strong>
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-300 font-mono">
                    rsync://aptlantis.net
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-300">
                    Mirrored content
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-2 text-sm text-gray-300">
                    <strong>Tor</strong>
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-300 font-mono">
                    <em>coming soon</em>
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-300">
                    Privacy-respecting mirror access
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3 text-cyan-400">
            📜 Lore & Mythology
          </h2>
          <p className="text-gray-300 mb-4">
            Aptlantis is layered with terms and themes from myth, command-line
            culture, and mystic computing. Here's a quick cheat sheet:
          </p>
          <ul className="space-y-2 text-gray-300">
            <li>
              <strong>Conventicle</strong>: Publicly accessible, social service
              layer (chat, submissions)
            </li>
            <li>
              <strong>Vanguard</strong>: Security and protective edge,
              modernized WAF & rate-limiting
            </li>
            <li>
              <strong>Nexus</strong>: Orchestration of tasks, logs, and metrics
            </li>
            <li>
              <strong>Relics / Akx</strong>: Special artifacts (files,
              snapshots, metadata) with lore-rich labeling
            </li>
            <li>
              <strong>Reliquary</strong>: Reserved location for ultra-rare or
              retired content
            </li>
            <li>
              <strong>Dispatchers / Secretaries</strong>: Task managers for
              rsync jobs and metadata collection
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3 text-cyan-400">
            🧠 Technologies
          </h2>
          <ul className="space-y-2 text-gray-300">
            <li>
              Frontend: <code className="bg-gray-700 px-1 rounded">React</code>,{" "}
              <code className="bg-gray-700 px-1 rounded">Bootstrap</code>,{" "}
              <code className="bg-gray-700 px-1 rounded">TypeScript</code>
            </li>
            <li>
              Backend: <code className="bg-gray-700 px-1 rounded">Go</code>,{" "}
              <code className="bg-gray-700 px-1 rounded">Rust</code>,{" "}
              <code className="bg-gray-700 px-1 rounded">Kotlin</code>,{" "}
              <code className="bg-gray-700 px-1 rounded">Python</code>
            </li>
            <li>
              DB: <code className="bg-gray-700 px-1 rounded">MongoDB</code>
            </li>
            <li>
              Sync & Dashboards:{" "}
              <code className="bg-gray-700 px-1 rounded">rsync</code>,{" "}
              <code className="bg-gray-700 px-1 rounded">Grafana</code>,{" "}
              <code className="bg-gray-700 px-1 rounded">
                Prometheus-style exporters
              </code>
            </li>
            <li>
              Network: <code className="bg-gray-700 px-1 rounded">Caddy</code> /{" "}
              <code className="bg-gray-700 px-1 rounded">BunkerWeb</code>,{" "}
              <code className="bg-gray-700 px-1 rounded">Cloudflare</code>,{" "}
              <code className="bg-gray-700 px-1 rounded">Tor</code>
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3 text-cyan-400">
            📸 Submissions & Screenshots
          </h2>
          <p className="text-gray-300 mb-4">
            Users can submit screenshots for their favorite distros — these are
            displayed in distro dashboards. Submission is handled via:
          </p>
          <ul className="space-y-2 text-gray-300">
            <li>
              <code className="bg-gray-700 px-1 rounded">
                apt-SubmissionSecretary
              </code>
              : Metadata ingestion
            </li>
            <li>
              <code className="bg-gray-700 px-1 rounded">pillowtools</code>:
              Image processing and optimization
            </li>
            <li>
              <code className="bg-gray-700 px-1 rounded">MongoDB</code>:
              Structured entry storage
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3 text-cyan-400">
            🤝 Contributing
          </h2>
          <p className="text-gray-300 mb-4">
            We're open to contributors — but this is still in alpha development.
          </p>
          <p className="text-gray-300 font-semibold mb-2">Ways to help:</p>
          <ul className="list-disc pl-6 space-y-2 text-gray-300">
            <li>Suggest obscure distros to mirror</li>
            <li>Help us onboard new users with clearer docs</li>
            <li>Submit PRs to frontend or dashboards</li>
            <li>Submit Akx parser improvements</li>
          </ul>
          <p className="text-gray-300 mt-4">
            Open an issue or hop into our IRC channel to chat.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3 text-cyan-400">
            📡 Contact
          </h2>
          <ul className="space-y-2 text-gray-300">
            <li>
              IRC: <code className="bg-gray-700 px-1 rounded">#aptlantis</code>{" "}
              on{" "}
              <code className="bg-gray-700 px-1 rounded">
                irc.aptlantis.net
              </code>
            </li>
            <li>
              Web:{" "}
              <a
                href="https://aptlantis.net"
                className="text-cyan-400 hover:underline"
              >
                aptlantis.net
              </a>
            </li>
            <li>
              GitHub:{" "}
              <a
                href="https://github.com/aptlantis/aptlantis"
                className="text-cyan-400 hover:underline"
              >
                github.com/aptlantis/aptlantis
              </a>
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3 text-cyan-400">
            🧱 License
          </h2>
          <p className="text-gray-300">
            All code, content, and scripts are public domain unless otherwise
            noted.
          </p>
        </section>

        <div className="border-t border-gray-700 pt-6 mt-8">
          <blockquote className="italic text-gray-400 text-lg">
            "Overbuilt is what we shoot for."
          </blockquote>
          <p className="text-gray-300 mt-4">
            <em>Welcome to Aptlantis.</em>
          </p>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;

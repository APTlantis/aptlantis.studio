const IRCServerPage = () => {
  return (
    <div className="atl-container py-12">
      <h1 className="atl-title mb-6 text-3xl font-bold">IRC Server</h1>

      <div className="space-y-6">
        <section className="atl-card p-5">
          <h2 className="mb-3 text-2xl font-semibold text-atl-archive">
            About Our IRC Server
          </h2>
          <p className="atl-subtitle">
            Welcome to the Aptlantis IRC server! We provide a community chat
            platform for Linux enthusiasts, developers, and users to connect,
            share knowledge, and collaborate.
          </p>
        </section>

        <section className="atl-card p-5">
          <h2 className="mb-3 text-2xl font-semibold text-atl-archive">
            Connection Details
          </h2>
          <div className="atl-card-soft p-4">
            <p className="atl-subtitle mb-2">
              <span className="font-semibold">Server:</span> irc.aptlantis.net
            </p>
            <p className="atl-subtitle mb-2">
              <span className="font-semibold">Port:</span> 6667 (standard), 6697
              (SSL)
            </p>
            <p className="atl-subtitle">
              <span className="font-semibold">Channels:</span> #aptlantis,
              #linux-help, #distro-talk
            </p>
          </div>
        </section>

        <section className="atl-card p-5">
          <h2 className="mb-3 text-2xl font-semibold text-atl-archive">
            Web Client
          </h2>
          <p className="atl-subtitle mb-4">
            You can connect to our IRC server directly through your browser
            using the web client below:
          </p>
          <div className="overflow-hidden rounded-md border border-atl-ridge">
            <div className="border-b border-atl-ridge bg-atl-abyss p-3">
              <h3 className="text-lg font-medium text-atl-archive">
                IRC Web Client
              </h3>
            </div>
            <div className="h-96 bg-atl-void p-4">
              <iframe
                src="https://kiwiirc.com/nextclient/irc.aptlantis.net:6697/#aptlantis"
                style={{ width: "100%", height: "100%", border: "none" }}
                title="IRC Web Client"
              />
            </div>
          </div>
          <p className="atl-subtitle mt-2">
            If the embedded client doesn&apos;t work, you can also use:
          </p>
          <ul className="atl-subtitle mt-2 list-disc space-y-1 pl-5">
            <li>
              <a
                href="https://kiwiirc.com/nextclient/irc.aptlantis.net:6697/#aptlantis"
                target="_blank"
                rel="noopener noreferrer"
                className="text-atl-archive underline-offset-4 hover:underline"
              >
                KiwiIRC
              </a>{" "}
              - A browser-based IRC client
            </li>
            <li>
              <a
                href="https://webchat.oftc.net/?channels=aptlantis&uio=d4"
                target="_blank"
                rel="noopener noreferrer"
                className="text-atl-archive underline-offset-4 hover:underline"
              >
                OFTC WebChat
              </a>{" "}
              - Another browser-based option
            </li>
          </ul>
        </section>

        <section className="atl-card p-5">
          <h2 className="mb-3 text-2xl font-semibold text-atl-archive">
            IRC Clients
          </h2>
          <p className="atl-subtitle mb-3">
            For the best experience, we recommend using a dedicated IRC client.
            Here are some popular options:
          </p>
          <ul className="atl-subtitle list-disc space-y-2 pl-5">
            <li>
              <span className="text-atl-archive">HexChat</span> - A popular
              cross-platform IRC client
            </li>
            <li>
              <span className="text-atl-archive">Irssi</span> - A terminal-based
              IRC client
            </li>
            <li>
              <span className="text-atl-archive">WeeChat</span> - Another
              powerful terminal-based client
            </li>
            <li>
              <span className="text-atl-archive">mIRC</span> - A classic Windows
              IRC client
            </li>
            <li>
              <span className="text-atl-archive">Textual</span> - A macOS IRC
              client
            </li>
          </ul>
        </section>

        <section className="atl-card p-5">
          <h2 className="mb-3 text-2xl font-semibold text-atl-archive">
            Server Rules
          </h2>
          <ul className="atl-subtitle list-disc space-y-2 pl-5">
            <li>Be respectful to other users</li>
            <li>No spamming or flooding channels</li>
            <li>No offensive or inappropriate content</li>
            <li>Stay on topic in specialized channels</li>
            <li>Follow channel-specific rules</li>
          </ul>
        </section>

        <section className="atl-card p-5">
          <h2 className="mb-3 text-2xl font-semibold text-atl-archive">
            Support
          </h2>
          <p className="atl-subtitle">
            If you need help with connecting to our IRC server or have any
            questions, please join the #help channel or contact our
            administrators at{" "}
            <a
              href="mailto:irc-admin@aptlantis.net"
              className="text-atl-archive underline-offset-4 hover:underline"
            >
              irc-admin@aptlantis.net
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
};

export default IRCServerPage;

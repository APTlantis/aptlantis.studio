# Auth.md - Aptlantis Studio Agent Auth

Aptlantis Studio does not currently provide a public OAuth, OIDC, or agent registration flow.

The public site exposes crawlable project documentation, public JSON catalogs, schemas, screenshots, and metadata files without requiring authentication.

## Current Public Resources

- API catalog: `/.well-known/api-catalog`
- Public manifest: `/data/manifest.json`
- Agent skills index: `/.well-known/agent-skills/index.json`
- Web Bot Auth key directory: `/.well-known/http-message-signatures-directory`
- Sitemap: `/sitemap.xml`
- Security contact metadata: `/.well-known/security.txt`

## Web Bot Auth

Aptlantis Studio publishes a public Ed25519 JSON Web Key Set for Web Bot Auth discovery. The matching private signing key is not stored in this public repository and must be installed only in an outbound bot or agent runtime before Aptlantis Studio-originated requests can be signed.

## Agent Registration

Aptlantis Studio does not require pre-registration for agents that read public catalog, schema, screenshot, sitemap, Auth.md, WebMCP, or well-known discovery resources.

Audience: public crawlers, search agents, archival agents, project-catalog readers, and browser-based agents inspecting Aptlantis Studio with user direction.

Supported registration method: anonymous public access. No OAuth client, bearer token, API key, or per-agent credential is issued for the currently advertised public resources.

Registration URI: `https://aptlantis.studio/auth.md#agent-registration`

Claim URI: `https://aptlantis.studio/auth.md#anonymous-public-access`

### Anonymous Public Access

Agents may access the public resources listed above without credentials. If protected APIs are added later, Aptlantis Studio should publish a real registration endpoint, OAuth Authorization Server Metadata, OAuth Protected Resource Metadata, claim or provisioning instructions, and revocation behavior before asking agents to authenticate.

## Protected APIs

No protected public API is advertised for third-party agents at this time. If protected APIs are added later, Aptlantis Studio should publish OAuth Authorization Server Metadata, OAuth Protected Resource Metadata, and updated registration instructions before asking agents to authenticate.

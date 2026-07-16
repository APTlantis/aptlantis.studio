# Aptlantis Studio Agent Auth

Aptlantis Studio does not currently provide a public OAuth, OIDC, or agent registration flow.

The public site exposes crawlable project documentation, public JSON catalogs, schemas, screenshots, and metadata files without requiring authentication.

## Current Public Resources

- API catalog: `/.well-known/api-catalog`
- Public manifest: `/data/manifest.json`
- Agent skills index: `/.well-known/agent-skills/index.json`
- Sitemap: `/sitemap.xml`
- Security contact metadata: `/.well-known/security.txt`

## Protected APIs

No protected public API is advertised for third-party agents at this time. If protected APIs are added later, Aptlantis Studio should publish OAuth Authorization Server Metadata, OAuth Protected Resource Metadata, and updated registration instructions before asking agents to authenticate.

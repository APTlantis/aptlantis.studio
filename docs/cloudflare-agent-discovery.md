# Cloudflare Agent Discovery Notes

## Implemented In Repo

- Homepage Link headers are declared in `public/_headers`.
- Homepage Markdown negotiation is implemented for Cloudflare Pages in `functions/[[path]].ts`.
- The Markdown homepage source is `public/index.md`.
- Well-known discovery resources live under `public/.well-known/`.
- Agent registration guidance is published at `public/auth.md`.
- Content Signals are declared in `public/robots.txt`.

## DNS-AID Records

DNS for AI Discovery cannot be published from this repository. Add DNS records in Cloudflare DNS for `aptlantis.studio` when DNS-AID is ready to be enabled.

Candidate owner names from the Cloudflare audit:

```text
_index._agents.aptlantis.studio
_a2a._agents.aptlantis.studio
_mcp._agents.aptlantis.studio
```

Publish SVCB or HTTPS records according to the current DNS-AID draft and sign the public discovery zone with DNSSEC if authenticated discovery is required.

## Deployment Caveat

`public/_headers` and `functions/[[path]].ts` are Cloudflare Pages conventions. If production is served by Caddy in front of a Vite preview or another static server, mirror the same behavior in that server layer:

- Add the homepage `Link` header from `public/_headers`.
- Return `public/index.md` as `text/markdown` when `GET /` includes `Accept: text/markdown`.
- Serve extensionless well-known JSON files with the content types listed in `public/_headers`.

## Honest Capability Notes

Aptlantis Studio currently publishes public data, schemas, and documentation. It does not currently advertise a real OAuth enrollment flow, protected public API, Web Bot Auth signing requirement, or MCP transport endpoint.

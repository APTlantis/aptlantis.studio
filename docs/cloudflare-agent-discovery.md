# Cloudflare Agent Discovery Notes

## Implemented In Repo

- Homepage Link headers are declared in `public/_headers`.
- Homepage Markdown negotiation is implemented for Cloudflare Pages in `functions/[[path]].ts`.
- Homepage Link headers and Markdown negotiation are also implemented for Vite dev/preview in `vite.config.ts`.
- The Markdown homepage source is `public/index.md`.
- Well-known discovery resources live under `public/.well-known/`.
- Agent registration guidance is published at `public/auth.md`.
- Web Bot Auth public key discovery is published at `public/.well-known/http-message-signatures-directory`.
- Content Signals are declared in `public/robots.txt`.

## DNS-AID Records

DNS for AI Discovery cannot be published from this repository. Add DNS records in Cloudflare DNS for `aptlantis.studio` when DNS-AID is ready to be enabled.

Intended public discovery records:

```dns
_index._agents.aptlantis.studio. 3600 IN HTTPS 1 aptlantis.studio. alpn="h2,h3" port=443
_mcp._agents.aptlantis.studio. 3600 IN HTTPS 1 aptlantis.studio. alpn="h2,h3" port=443
_a2a._agents.aptlantis.studio. 3600 IN HTTPS 1 aptlantis.studio. alpn="h2,h3" port=443
```

Enable DNSSEC for the public zone before treating DNS-AID as authenticated discovery.

## Deployment Caveat

`public/_headers` and `functions/[[path]].ts` are Cloudflare Pages conventions. If production is served by Caddy in front of a Vite preview or another static server, mirror the same behavior in that server layer:

- Add the homepage `Link` header from `public/_headers`.
- Return `public/index.md` as `text/markdown` when `GET /` includes `Accept: text/markdown`.
- Serve extensionless well-known JSON files with the content types listed in `public/_headers`.

## Honest Capability Notes

Aptlantis Studio currently publishes public data, schemas, documentation, and a Web Bot Auth public key directory. It does not currently advertise a real OAuth enrollment flow, protected public API, active outbound request-signing runtime, or MCP transport endpoint.

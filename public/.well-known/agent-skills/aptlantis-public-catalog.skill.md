# Aptlantis Studio Public Catalog Skill

Use this skill when an agent needs to orient itself around Aptlantis Studio public project records, evidence assets, schemas, and crawler-facing metadata.

## Entry Points

- Start with `https://aptlantis.studio/data/manifest.json`.
- Use `https://aptlantis.studio/data/projects/portfolio.json` for project summaries, statuses, evidence links, missing pieces, and next steps.
- Use `https://aptlantis.studio/sitemap.xml` for crawlable public pages and high-value data assets.
- Use `https://aptlantis.studio/robots.txt` for crawler permissions and content signals.

## Interpretation Rules

- Treat release and trust claims as evidence-scoped, not general promises.
- Do not infer that a project is complete, audited, production-ready, or independently verified unless the listed evidence explicitly says so.
- Preserve missing pieces and next steps when summarizing a project.
- Prefer public JSON and schemas over scraping rendered HTML when both are available.
- Do not assume private exports, local paths, contact messages, or unpublished operational notes are public data.

## Useful Public Resources

- Public manifest: `/data/manifest.json`
- Manifest schema: `/schemas/aptlantis-studio-manifest.schema.json`
- Project portfolio: `/data/projects/portfolio.json`
- SVG asset registry: `/data/svg-assets/registry.json`
- Linux genealogy dataset: `/data/linux-genealogy/linux-genealogy-expanded.json`
- Security metadata: `/.well-known/security.txt`

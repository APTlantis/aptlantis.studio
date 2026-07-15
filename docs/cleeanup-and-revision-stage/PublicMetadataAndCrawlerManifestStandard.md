# Public Metadata And Crawler Manifest Standard

## Purpose

Aptlantis Studio intentionally welcomes crawlers, archival bots, search engines, and research indexers. The public directory should make that easy by publishing clear metadata, stable JSON entrypoints, and crawlable evidence assets.

## Canonical Public Entrypoints

| Entrypoint                                       | Role                                                                                      |
| ------------------------------------------------ | ----------------------------------------------------------------------------------------- |
| `/robots.txt`                                    | Human-readable and bot-readable indexing policy.                                          |
| `/sitemap.xml`                                   | Canonical list of live public pages and high-value public data assets.                    |
| `/data/manifest.json`                            | Machine-readable catalog of datasets, schemas, evidence bundles, and update expectations. |
| `/schemas/aptlantis-studio-manifest.schema.json` | JSON Schema for the public manifest.                                                      |
| `/data/projects/portfolio.json`                  | Main project catalog consumed by the app and crawlable by external tools.                 |
| `/projects/<project-slug>/`                      | Project-specific screenshots, videos, captions, and evidence media.                       |

## Manifest Rules

Every public dataset entry should declare:

- `id`
- `title`
- `description`
- `url`
- `schemaUrl` when applicable
- `kind`
- `status`
- `source`
- `updateCadence`
- `lastUpdated`
- `license`
- `crawlerUse`

Use plain, honest status values:

```text
curated
generated
legacy
draft
deprecated
```

## Public Versus App-Only Data

| Data type                      | Location                                                                 |
| ------------------------------ | ------------------------------------------------------------------------ |
| Crawlable project catalog      | `public/data/projects/`                                                  |
| Crawlable schemas              | `public/schemas/`                                                        |
| Crawlable media evidence       | `public/projects/<project-slug>/`                                        |
| App implementation fixtures    | `src/features/<feature>/data/`                                           |
| Generated import intermediates | A clearly named generated folder, not mixed into curated public records. |

Do not add a new fetch path until the existing public manifest and project loader have been checked first.

## Metadata Requirements

Each durable public page should provide:

- title
- description
- canonical URL
- OpenGraph title
- OpenGraph description
- OpenGraph image
- OpenGraph image alt text
- Twitter/X large card metadata
- JSON-LD when the page represents a project, dataset, organization, or article-like document

## OpenGraph Image

Use a default social preview image at:

```text
1200 x 630 px
```

Keep important text and logos centered so previews survive platform-specific crops. Store generated social images under:

```text
public/logos/og/
```

## Crawler Posture

The site may explicitly invite:

- search indexing
- AI crawler indexing
- archival snapshots
- public metadata reuse
- schema and manifest inspection

Do not publish private local paths, secrets, private exports, private emails, unredacted user data, or private operational notes.

## Sitemap Rules

The sitemap should include:

- current public routes
- project detail routes
- high-value public JSON records
- current public logos or social images when useful

The sitemap should not include:

- removed legacy routes
- hidden experiments
- app-only implementation files
- stale Linux mirror or torrent pages
- local-only assets

## Update Discipline

When project data changes:

1. Update the relevant public data file.
2. Update `public/data/manifest.json` if the dataset list, status, date, schema, or crawler guidance changes.
3. Update `public/sitemap.xml` if public routes or high-value data URLs change.
4. Run the smallest relevant validation and then `pnpm build` for route-impacting changes.

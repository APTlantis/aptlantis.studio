# Aptlantis Studio Website Structure Cleanup Plan

## Purpose

This plan governs the cleanup pass that moves Aptlantis Studio away from its older Linux distribution / mirror-site ancestry and into a public project teaching studio.

The site should become easier to maintain, easier to crawl, and easier to trust. That means removing abandoned routes, choosing one public data model, and keeping evidence assets visible instead of scattered through legacy feature folders.

## Cleanup Principles

1. Preserve project truth.
2. Remove legacy surfaces before polishing them.
3. Keep public data intentionally crawlable.
4. Keep app implementation data separate from public catalog data.
5. Prefer one typed loader per content domain.
6. Keep missing or incomplete work visible when it matters to visitor trust.

## Feature Decisions

| Feature directory                 | Decision                        | Notes                                                                                                                                       |
| --------------------------------- | ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/features/about`              | Kept and rewritten              | Authored React page now uses the canonical page frame and no longer fetches legacy public JSON.                                             |
| `src/features/coding-weird-stuff` | Kept and rebranded              | Public concept is now **Coding Against The Grain**. The old route remains compatible; live generator tooling was removed from this section. |
| `src/features/contact`            | Kept and expanded               | Now routes project corrections, metadata issues, collaboration notes, and sensitive concerns through the current studio framing.            |
| `src/features/distributions`      | Removed                         | Legacy Linux distribution, ISO, torrent, and mirror tooling were deleted from the live feature tree.                                        |
| `src/features/irc`                | Quarantine                      | Keep until a final content decision is made. Do not expand during the cleanup pass.                                                         |
| `src/features/legal`              | Kept and rewritten              | Terms and Privacy now describe the project catalog, public metadata, crawler posture, contact submissions, and operational logs.            |
| `src/features/linux-geneology`    | Kept with corrected route alias | Expanded public dataset now loads from `/data/linux-genealogy/`; `/linux-genealogy` is canonical and `/linux-geneology` remains compatible. |
| `src/features/museum`             | Removed                         | Legacy distro museum surface depended on removed distribution data.                                                                         |
| `src/features/onboarding`         | Removed                         | Legacy page outside the current public project catalog direction.                                                                           |
| `src/features/projects`           | Keep as core                    | Project records and detail pages are the main site product.                                                                                 |
| `src/features/structra-lab`       | Keep                            | Fits the teaching studio and standards demonstration role.                                                                                  |
| `src/features/svg-lab`            | Keep                            | Fits visual metadata, SESM, and safe-profile demonstration goals.                                                                           |
| `src/features/terry-davis-videos` | Removed                         | Hidden legacy page removed from the app cleanup path.                                                                                       |
| `src/features/volunteer`          | Removed                         | Legacy mirror volunteer surface removed; collaboration copy now belongs under Contact or About.                                             |

## Public Data Structure

The public directory is a publication surface, not a dumping ground.

Use this structure for crawlable records:

```text
public/
  data/
    manifest.json
    linux-genealogy/
      linux-genealogy-expanded.json
      linux-genealogy-map.svg
      linux-genealogy-map-nodes.json
    projects/
      portfolio.json
      cityhall-frameworks.json
  schemas/
    aptlantis-studio-manifest.schema.json
    incoming-message.schema.json
  logos/
    og/
      aptlantis-studio-opengraph.png
  .well-known/
    security.txt
    aptlantis.studio_0x0BE88A1564D5B232_public.asc
  projects/
  robots.txt
  sitemap.xml
```

### Rules

- Public data that should be indexed belongs under `public/data`.
- Public schemas belong under `public/schemas`.
- Project screenshots, videos, and evidence assets belong under `public/projects/<project-slug>`.
- App-only implementation data may stay under `src/features/<feature>/data`, but should not be fetched from arbitrary paths.
- Loaders should use one stable endpoint per domain, such as `/data/projects/portfolio.json`.
- Generated data should declare its source and update cadence in `public/data/manifest.json`.
- Slow-changing visualizations may be generated into static public SVG assets, with source data kept beside them.

## Public Directory Audit

| Public file or directory                   | Decision                  | Notes                                                                                                              |
| ------------------------------------------ | ------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `public/data/quickLinks.json`              | Removed                   | Stale distro-era quick links with empty URLs. Current quick-link logic, if needed, belongs in authored app data.   |
| `public/data/incoming-message.schema.json` | Moved to `public/schemas` | It is a schema, not a dataset. The public ID now matches `/schemas/incoming-message.schema.json`.                  |
| `public/framework-structure`               | Removed                   | Legacy design-export bundle duplicated logo/image assets and prompt files; it was not referenced by live app code. |
| `public/prism-components`                  | Removed                   | The live app loads `/prism.js` and `/prism.css`; individual component files were unused public bulk.               |
| `public/prism.js` and `public/prism.css`   | Keep as support assets    | Loaded by `index.html` for project code-block highlighting. Not listed as high-value crawl targets.                |
| `public/command-schemas`                   | Keep                      | Still loaded by the project portfolio loader for CommandWizard schema examples.                                    |
| `public/theme`                             | Keep narrowly             | Home currently references `/theme/aptlantis-blue-slate-banner.png`; revisit unused theme images later.             |

## Legacy Data Removal Targets

| File or area                                              | Action                                             |
| --------------------------------------------------------- | -------------------------------------------------- |
| `src/features/distributions/data/aptlantis.distros.json`  | Removed with distribution feature.                 |
| `src/features/distributions/data/aptlantis.torrents.json` | Removed with distribution feature.                 |
| `public/data/mirror-status.json`                          | Removed after SyncStatus context was retired.      |
| `public/data/aptlantis.dashboard_data.json`               | Removed because no current page consumed it.       |
| `public/schemas/aptlantis.dashboard_data.json`            | Removed with legacy dashboard data.                |
| `public/data/about_page.schema_completed.json`            | Removed after About became an authored React page. |
| `public/data/about_page.schema.json`                      | Removed after About stopped fetching public JSON.  |

## Route Cleanup

Remove routes for pages that are leaving:

```text
/volunteer
/museum
/terry-videos
```

Keep these routes during this cleanup stage:

```text
/
/about
/contact
/terms
/privacy
/project/:id
/svg-lab
/structra-lab
/irc
/coding-against-the-grain
/coding-weird-stuff
/linux-genealogy
/linux-geneology
```

Compatibility route aliases:

| Current route         | Future route                | Compatibility                                                             |
| --------------------- | --------------------------- | ------------------------------------------------------------------------- |
| `/coding-weird-stuff` | `/coding-against-the-grain` | New route added; old route remains as a compatibility alias.              |
| `/linux-geneology`    | `/linux-genealogy`          | New corrected route added; old spelling remains as a compatibility alias. |

## Metadata And Crawler Goals

Aptlantis Studio should openly invite indexing and archival capture.

Required publication assets:

- `robots.txt` with explicit crawler-friendly intent.
- `sitemap.xml` listing pages and public data files.
- `public/data/manifest.json` as the machine-readable crawl entrypoint.
- OpenGraph image at `1200 x 630`.
- Route-level title and description metadata.
- JSON-LD for site, organization, project records, and datasets where useful.
- `.well-known/security.txt` and a current public key reference if maintained.

## Work Sequence

1. Create governing cleanup and metadata docs.
2. Remove legacy routes and sitemap entries.
3. Delete agreed legacy feature directories.
4. Add `public/data/manifest.json` and schema.
5. Retire or repurpose mirror-era global status contexts and screensaver copy.
6. Rewrite About, Legal, and Contact.
7. Rebrand Coding Weird Stuff to Coding Against The Grain.
8. Absorb expanded Linux genealogy data and add spelling-compatible route migration.
9. Run `pnpm format:check`, `pnpm lint:strict`, and `pnpm build`.

## Verification Checklist

- `rg "volunteer|museum|terry-davis|features/distributions|aptlantis.distros|aptlantis.torrents"` has no live-route references after the removal pass.
- `pnpm lint:strict` passes after route and feature cleanup.
- `pnpm build` passes after deleted imports are removed.
- Public manifest validates against its schema.
- Sitemap contains only live routes and intentional public data files.
- Legacy mirror claims are removed from About, Legal, Footer, and Screensaver copy.

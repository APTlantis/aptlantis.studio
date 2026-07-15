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

| Feature directory                 | Decision                        | Notes                                                                                                                                |
| --------------------------------- | ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `src/features/about`              | Keep and rewrite                | Current content is legacy mirror-era copy. Reframe around project catalog, standards, evidence, and teaching studio identity.        |
| `src/features/coding-weird-stuff` | Keep and rebrand                | Rename public concept to **Coding Against The Grain**. Keep the Figlet / ASCII tool as an early lab instrument.                      |
| `src/features/contact`            | Keep and expand                 | Should become a practical contact surface for project questions, metadata corrections, security/contact channels, and collaboration. |
| `src/features/distributions`      | Remove                          | Legacy Linux distribution, ISO, torrent, and mirror tooling does not match the current portfolio mission.                            |
| `src/features/irc`                | Quarantine                      | Keep until a final content decision is made. Do not expand during the cleanup pass.                                                  |
| `src/features/legal`              | Keep and rewrite                | Replace mirror-service assumptions with project catalog, public metadata, and portfolio language.                                    |
| `src/features/linux-geneology`    | Keep, then absorb expanded data | Keep for now, but plan a spelling-compatible migration to `linux-genealogy` later.                                                   |
| `src/features/museum`             | Remove                          | Legacy distro museum surface depends on removed distribution data.                                                                   |
| `src/features/onboarding`         | Remove                          | Legacy page outside the current public project catalog direction.                                                                    |
| `src/features/projects`           | Keep as core                    | Project records and detail pages are the main site product.                                                                          |
| `src/features/structra-lab`       | Keep                            | Fits the teaching studio and standards demonstration role.                                                                           |
| `src/features/svg-lab`            | Keep                            | Fits visual metadata, SESM, and safe-profile demonstration goals.                                                                    |
| `src/features/terry-davis-videos` | Remove                          | Hidden legacy page. Remove from the app cleanup path.                                                                                |
| `src/features/volunteer`          | Remove                          | Legacy mirror volunteer surface. Future collaboration copy belongs under Contact or About.                                           |

## Public Data Structure

The public directory is a publication surface, not a dumping ground.

Use this structure for crawlable records:

```text
public/
  data/
    manifest.json
    projects/
      portfolio.json
      cityhall-frameworks.json
  schemas/
    aptlantis-studio-manifest.schema.json
  logos/
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

## Legacy Data Removal Targets

| File or area                                              | Action                                                                       |
| --------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `src/features/distributions/data/aptlantis.distros.json`  | Remove with distribution feature.                                            |
| `src/features/distributions/data/aptlantis.torrents.json` | Remove with distribution feature.                                            |
| `public/data/mirror-status.json`                          | Remove after SyncStatus context is retired or repurposed.                    |
| `public/data/aptlantis.dashboard_data.json`               | Audit and remove if no current page consumes it.                             |
| `public/schemas/aptlantis.dashboard_data.json`            | Audit with dashboard data; likely legacy.                                    |
| `public/data/about_page.schema_completed.json`            | Replace with current About content or remove if page becomes authored React. |
| `public/data/about_page.schema.json`                      | Remove if About page no longer fetches JSON.                                 |

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
/coding-weird-stuff
/linux-geneology
```

Later route migrations:

| Current route         | Future route                | Compatibility                                                          |
| --------------------- | --------------------------- | ---------------------------------------------------------------------- |
| `/coding-weird-stuff` | `/coding-against-the-grain` | Add redirect or alias before changing external links.                  |
| `/linux-geneology`    | `/linux-genealogy`          | Add redirect or alias because current spelling may already be indexed. |

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
8. Absorb expanded Linux genealogy data and plan spelling-compatible route migration.
9. Run `pnpm format:check`, `pnpm lint:strict`, and `pnpm build`.

## Verification Checklist

- `rg "volunteer|museum|terry-davis|features/distributions|aptlantis.distros|aptlantis.torrents"` has no live-route references after the removal pass.
- `pnpm lint:strict` passes after route and feature cleanup.
- `pnpm build` passes after deleted imports are removed.
- Public manifest validates against its schema.
- Sitemap contains only live routes and intentional public data files.
- Legacy mirror claims are removed from About, Legal, Footer, and Screensaver copy.

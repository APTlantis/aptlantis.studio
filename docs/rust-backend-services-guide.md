# Aptlantis Rust Backend Services Guide

This is the readable service atlas for the Aptlantis Studio Rust backend. Small usage sheets can stay close to the workflows they support; this document explains what each service area is for, which files it depends on, and where to go when running or extending it.

## Service Host

The Rust backend lives in `services/aptlantis-services`.

It is a single Axum service host for operational APIs that should not live inside the browser bundle. Right now it serves health checks, schema catalogs, SESM/SVG tooling, and registry-backed SVG asset embedding.

Primary files:

- `services/aptlantis-services/src/main.rs`
- `services/aptlantis-services/Cargo.toml`
- `services/aptlantis-services/README.md`
- `services/aptlantis-services/docker-compose.yml`
- `services/aptlantis-services/docker-compose.example.yml`

## Local Startup

From the repository root:

```powershell
$env:APTLANTIS_DATA_ROOT = "B:\aptlantis.studio\public"
$env:APTLANTIS_BIND = "127.0.0.1:8991"
cargo run --manifest-path services\aptlantis-services\Cargo.toml
```

The terminal stays open while the service is running. That is the expected success state. Run API calls from a second terminal, then press `Ctrl+C` in the service terminal when finished.

Health check:

```powershell
Invoke-RestMethod -Uri http://127.0.0.1:8991/api/health
```

Service registry:

```powershell
Invoke-RestMethod -Uri http://127.0.0.1:8991/api/services
```

## Environment Map

| Variable                        | Local Example                              | Purpose                                             |
| ------------------------------- | ------------------------------------------ | --------------------------------------------------- |
| `APTLANTIS_BIND`                | `127.0.0.1:8991`                           | Host and port for the API server.                   |
| `APTLANTIS_DATA_ROOT`           | `B:\aptlantis.studio\public`               | Public data root used by schema and asset services. |
| `APTLANTIS_COMMAND_SCHEMA_PATH` | `...\public\command-schemas\...json`       | Override for command schema catalog reads.          |
| `APTLANTIS_SVG_ASSET_REGISTRY`  | `...\public\data\svg-assets\registry.json` | Override for SVG asset registry reads/writes.       |
| `APTLANTIS_SESM_ROOT`           | `D:\.library\aptlantis_core\SESM`          | SESM standards and validator root.                  |
| `APTLANTIS_SESM_VALIDATOR`      | `...\Validate-SESM-Safe.py`                | Explicit SESM validator script path.                |
| `APTLANTIS_SESM_SCHEMA`         | `...\svg_asset.schema.json`                | Explicit SESM schema path.                          |
| `APTLANTIS_SESM_PYTHON`         | `python`                                   | Python executable used for SESM validation.         |
| `APTLANTIS_SVG_LAB_TIMEOUT_MS`  | `10000`                                    | Validator timeout per request.                      |

## Service Areas

### Health And Discovery

Purpose: prove that the backend process is alive and expose the current service list.

Routes:

- `GET /api/health`
- `GET /api/services`

Use this first when debugging. If these fail, the issue is startup, port binding, firewall, or process state rather than an individual service.

### Command Builder Schemas

Purpose: serve the public command schema catalog to UI tools that need stable structured command definitions.

Route:

- `GET /api/command-builder/schemas`

Primary data:

- `public/command-schemas/command-schemas.json`

Notes:

- This route is read-only.
- It should stay deterministic and crawler-friendly.
- If the schema file moves, prefer setting `APTLANTIS_COMMAND_SCHEMA_PATH` over hard-coding a new path.

### SVG Lab

Purpose: validate SVG text against the SESM safe profile, generate SESM metadata blocks, and serve validator examples.

Routes:

- `GET /api/svg-lab/examples`
- `POST /api/svg-lab/validate`
- `POST /api/svg-lab/generate`

Primary external dependency:

- SESM validator directory, usually configured with `APTLANTIS_SESM_ROOT`.

Notes:

- `validate` and `generate` operate on submitted SVG text.
- These endpoints do not manage the public asset registry.
- Use SVG Lab for one-off inspection, validation, and examples.

### SVG Asset Registry

Purpose: maintain a public JSON registry of served SVG assets and embed SESM metadata from that registry into the actual SVG files.

Routes:

- `GET /api/svg-assets/registry`
- `POST /api/svg-assets/scan`
- `POST /api/svg-assets/embed`

Primary data:

- `public/data/svg-assets/registry.json`
- `public/schemas/svg-asset.schema.json`
- `public/schemas/svg-asset-registry.schema.json`
- public SVG files, currently led by `public/logos/*.svg`

Usage sheet:

- `docs/svg-sesm-embedding-usage.md`

Operational rule:

1. Place or update SVG files under `public/`.
2. Scan the public folder into the registry.
3. Review registry metadata.
4. Dry-run embedding.
5. Embed for real with `dryRun = false`.
6. Run formatting and service checks.

Safety behavior:

- Scan writes the registry by default.
- Embed defaults to dry-run.
- Real embedding rewrites SVG files and refreshes registry hashes.
- The service only resolves public-root relative paths such as `/logos/name.svg`.

### Planned Project Index

Purpose: future normalized project metadata, search, refresh, and evidence services.

Route namespace:

- `/api/projects/*`

Status:

- Planned.

Expected data:

- `public/data/projects/portfolio.json`
- project evidence folders under `public/projects/`
- future generated search or index files if needed

Do not build this as a hidden database-only surface. The public JSON catalog remains the crawler-friendly source of truth unless there is a clear reason to add a generated index.

## Quick Service Decision Guide

Use the backend when:

- the operation reads or writes public data files,
- the workflow needs filesystem access,
- validation depends on local tools,
- a browser-only implementation would expose too much operational detail,
- the workflow should be scriptable with `curl`, `wget`, or PowerShell.

Keep it in the frontend when:

- the data is already public static JSON,
- the action is just presentation or filtering,
- no file mutation or validator subprocess is needed,
- the user needs immediate interactive UI feedback only.

## Verification

For backend code changes:

```powershell
pnpm services:check
```

For docs, JSON, and frontend-adjacent public data:

```powershell
pnpm format:check
```

For broad site changes or assets used by rendered pages:

```powershell
pnpm build
```

## Current Operating Notes

- The Rust service is intentionally small and explicit. Add new route groups only when they have a real operational job.
- Public JSON files remain the catalog surface for crawlers and archival tools.
- Registry-backed workflows should prefer dry-runs before writes.
- Do not use backend services to make incomplete projects look complete. If evidence is missing, preserve that truth in the public data.

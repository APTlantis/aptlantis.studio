# Aptlantis Services

Rust microservice host for Aptlantis Studio. This is the first container-ready service that can sit behind the Fedora server's existing Caddy and Cloudflared containers.

For the broader service map, operational boundaries, and workflow index, see `docs/rust-backend-services-guide.md`.

## Current Endpoints

| Route                              | Purpose                                                                             |
| ---------------------------------- | ----------------------------------------------------------------------------------- |
| `GET /api/health`                  | Process health, version, uptime, and service registry.                              |
| `GET /api/services`                | Registry of ready and planned Aptlantis Studio services.                            |
| `GET /api/command-builder/schemas` | Serves the Command Builder schema catalog from the mounted data directory.          |
| `GET /api/svg-lab/examples`        | Serves SESM fixture SVGs from the mounted SESM standards directory.                 |
| `POST /api/svg-lab/validate`       | Validates SVG text with the SESM safe-profile validator.                            |
| `POST /api/svg-lab/generate`       | Embeds SESM metadata, validates the generated SVG, and returns a line diff summary. |
| `GET /api/svg-assets/registry`     | Returns the public SVG asset registry from the mounted data directory.              |
| `POST /api/svg-assets/scan`        | Scans public SVG roots and updates the registry with paths, dimensions, and hashes. |
| `POST /api/svg-assets/embed`       | Embeds registry-backed SESM metadata into SVG files; defaults to dry-run mode.      |

## Local Run

```powershell
cd aptlantis.studio/services/aptlantis-services
cargo run
```

Default bind address: `0.0.0.0:8989`.

Useful environment variables:

| Variable                        | Default                                          | Purpose                                        |
| ------------------------------- | ------------------------------------------------ | ---------------------------------------------- |
| `APTLANTIS_BIND`                | `0.0.0.0:8989`                                   | Host and port for the API.                     |
| `APTLANTIS_DATA_ROOT`           | `/app/data`                                      | Root for mounted Studio public data in Docker. |
| `APTLANTIS_COMMAND_SCHEMA_PATH` | `/app/data/command-schemas/command-schemas.json` | Command Builder schema catalog path.           |
| `APTLANTIS_SVG_ASSET_REGISTRY`  | `/app/data/data/svg-assets/registry.json`        | Public SVG asset registry path.                |
| `APTLANTIS_SESM_ROOT`           | `/app/sesm`                                      | Mounted SESM standards directory.              |
| `APTLANTIS_SESM_VALIDATOR`      | `/app/sesm/Validate-SESM-Safe.py`                | SESM validator script path.                    |
| `APTLANTIS_SESM_SCHEMA`         | `/app/sesm/svg_asset.schema.json`                | SESM SVG schema path.                          |
| `APTLANTIS_SESM_PYTHON`         | `python3`                                        | Python executable used to run the validator.   |
| `APTLANTIS_SVG_LAB_TIMEOUT_MS`  | `10000`                                          | Validator timeout per request.                 |
| `RUST_LOG`                      | `aptlantis_services=info,tower_http=info`        | Logging filter.                                |

## Docker

```powershell
cd aptlantis.studio/services/aptlantis-services
docker build -t aptlantis/aptlantis-services:local -t aptlantis/aptlantis-services:latest .
docker push aptlantis/aptlantis-services:latest
docker run --rm -p 127.0.0.1:8989:8989 -v ${PWD}/../../public:/app/data -v D:/.library/aptlantis_core/SESM:/app/sesm:ro aptlantis/aptlantis-services:local
```

Mount `/app/data` read-write when using `POST /api/svg-assets/scan` or `POST /api/svg-assets/embed` with `dryRun: false`; read-only is fine for health, schema reads, SVG Lab validation, and dry runs.

Example registry workflow:

```powershell
curl.exe -X POST http://127.0.0.1:8989/api/svg-assets/scan `
  -H "Content-Type: application/json" `
  -d "{\"roots\":[\"/logos\"],\"writeRegistry\":true}"

curl.exe -X POST http://127.0.0.1:8989/api/svg-assets/embed `
  -H "Content-Type: application/json" `
  -d "{\"slugs\":[\"aptlantis-studio-logo\"],\"dryRun\":true}"
```

For the Fedora host, use `docker-compose.example.yml` as the service block to merge into the existing Caddy and Cloudflared stack. The example assumes an external Docker network named `aptlantis-edge`.

## Caddy Route Sketch

```caddyfile
aptlantis.studio {
  route /api/* {
    reverse_proxy aptlantis-services:8989
  }

  reverse_proxy aptlantis-web:80
}
```

## Growth Plan

- Add command schema validation and command rendering endpoints.
- Add project index/search endpoints backed by generated portfolio data.
- Add service-specific settings endpoints once the Fedora deployment shape settles.

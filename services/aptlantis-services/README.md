# Aptlantis Services

Rust microservice host for Aptlantis Studio. This is the first container-ready service that can sit behind the Fedora server's existing Caddy and Cloudflared containers.

## Current Endpoints

| Route                              | Purpose                                                                             |
| ---------------------------------- | ----------------------------------------------------------------------------------- |
| `GET /api/health`                  | Process health, version, uptime, and service registry.                              |
| `GET /api/services`                | Registry of ready and planned Aptlantis Studio services.                            |
| `GET /api/command-builder/schemas` | Serves the Command Builder schema catalog from the mounted data directory.          |
| `GET /api/svg-lab/examples`        | Serves SESM fixture SVGs from the mounted SESM standards directory.                 |
| `POST /api/svg-lab/validate`       | Validates SVG text with the SESM safe-profile validator.                            |
| `POST /api/svg-lab/generate`       | Embeds SESM metadata, validates the generated SVG, and returns a line diff summary. |

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
docker run --rm -p 127.0.0.1:8989:8989 -v ${PWD}/../../public:/app/data:ro -v D:/.library/aptlantis_core/SESM:/app/sesm:ro aptlantis/aptlantis-services:local
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

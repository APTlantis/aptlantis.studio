# SVG SESM Embedding Usage

This is the operator checklist for keeping public SVG assets registered and embedding SESM metadata into the SVG files served by Aptlantis Studio.

## Files Involved

- Public registry: `public/data/svg-assets/registry.json`
- Registry schema: `public/schemas/svg-asset-registry.schema.json`
- Asset record schema: `public/schemas/svg-asset.schema.json`
- Rust service: `services/aptlantis-services`

The registry is the review point. Add or scan assets there first, refine titles/roles/SESM metadata, then embed into SVG files.

## Start The Service Locally

From the repo root:

```powershell
$env:APTLANTIS_DATA_ROOT = "B:\aptlantis.studio\public"
$env:APTLANTIS_BIND = "127.0.0.1:8991"
cargo run --manifest-path services\aptlantis-services\Cargo.toml
```

Use another port if `8991` is already busy.

## Check The Registry

```powershell
Invoke-RestMethod -Uri http://127.0.0.1:8991/api/svg-assets/registry
```

Quick asset count:

```powershell
(Invoke-RestMethod -Uri http://127.0.0.1:8991/api/svg-assets/registry).registry.assets.Count
```
B:\aptlantis.studio\public\projects\logos-themes\logos
## Scan Public SVGs

Scan `/public/logos` and write new/updated records into the registry:
projects/logos-themes/logos
```powershell
$body = @{
  roots = @("projects/logos-themes/logos")
  writeRegistry = $true
} | ConvertTo-Json

Invoke-RestMethod `
  -Method Post `
  -Uri http://127.0.0.1:8991/api/svg-assets/scan `
  -ContentType "application/json" `
  -Body $body
```

Use `writeRegistry = $false` to preview what the scan would find without changing `registry.json`.

## Edit Registry Metadata

After scanning, review `public/data/svg-assets/registry.json`.

Good fields to improve before embedding:

- `title`
- `roles`
- `ai.summary`
- `ai.tags`
- `sesm`, when an asset needs hand-authored metadata instead of generated fallback metadata

If `sesm` is missing, the service generates a conservative metadata block from the registry record.

## Dry-Run Embedding

Dry-run one asset:

```powershell
$body = @{
  slugs = @("aptlantis-studio-logo")
  dryRun = $true
  validate = $false
} | ConvertTo-Json

Invoke-RestMethod `
  -Method Post `
  -Uri http://127.0.0.1:8991/api/svg-assets/embed `
  -ContentType "application/json" `
  -Body $body
```

Dry-run every asset in the registry:

```powershell
$body = @{
  dryRun = $true
  validate = $false
} | ConvertTo-Json

Invoke-RestMethod `
  -Method Post `
  -Uri http://127.0.0.1:8991/api/svg-assets/embed `
  -ContentType "application/json" `
  -Body $body
```

The response reports how many files would change. No SVG files are rewritten in dry-run mode.

## Embed For Real

Embed one reviewed asset:

```powershell
$body = @{
  slugs = @("aptlantis-studio-logo")
  dryRun = $false
  validate = $false
} | ConvertTo-Json

Invoke-RestMethod `
  -Method Post `
  -Uri http://127.0.0.1:8991/api/svg-assets/embed `
  -ContentType "application/json" `
  -Body $body
```

Embed all reviewed assets:

```powershell
$body = @{
  dryRun = $false
  validate = $false
} | ConvertTo-Json

Invoke-RestMethod `
  -Method Post `
  -Uri http://127.0.0.1:8991/api/svg-assets/embed `
  -ContentType "application/json" `
  -Body $body
```

Real embedding rewrites the SVG files and refreshes the registry hashes.

## Optional Validation

Set `validate = $true` only when the SESM validator path is configured and available locally:

```powershell
$env:APTLANTIS_SESM_ROOT = "D:\.library\aptlantis_core\SESM"
```

The service expects the validator and schema under that root unless these are set:

```powershell
$env:APTLANTIS_SESM_VALIDATOR = "D:\.library\aptlantis_core\SESM\Validate-SESM-Safe.py"
$env:APTLANTIS_SESM_SCHEMA = "D:\.library\aptlantis_core\SESM\svg_asset.schema.json"
$env:APTLANTIS_SESM_PYTHON = "python"
```

## After Running

Format and check the service:

```powershell
pnpm exec prettier --write public/data/svg-assets/registry.json
pnpm services:check
pnpm format:check
```

For broad site-impacting SVG changes, also run:

```powershell
pnpm build
```

## Safety Notes

- `/api/svg-assets/embed` defaults to `dryRun = true`.
- `/api/svg-assets/scan` writes the registry by default.
- The service only resolves public-root relative paths such as `/logos/name.svg`.
- Do not hand-edit SVG metadata blocks directly unless the registry cannot express the needed metadata.
- Keep the registry public and honest: missing embedded SESM means pending work, not failure.

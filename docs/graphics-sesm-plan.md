# Aptlantis Graphics and SESM Asset Plan

## Operating Rule

Aptlantis Studio should default to SVG assets with embedded SESM metadata. Bitmap assets are allowed only when the image is evidence that benefits from raster fidelity: screenshots, generated bitmap theme boards, video stills, or photographic source material.

This keeps the site aligned with the SESM standard by using the same metadata model it teaches.

## Asset Types

### SVG + SESM by default

Use SVG with rich SESM metadata for:

- project logos and badges,
- framework and governance marks,
- route icons and section ornaments,
- project maps and pipeline diagrams,
- trust, release, and evidence panels,
- blueprint/grid/interface motifs,
- downloadable diagram sources,
- status badges and lifecycle markers.

Each SVG should include:

- `title`,
- `role`,
- `project`,
- `author`,
- `license`,
- `tags`,
- `accessibility.summary`,
- `version`,
- `sesm_version`,
- provenance fields naming the generator or source workflow.

### Bitmap when justified

Use PNG/WebP/JPEG only for:

- screenshots that prove an application state,
- theme boards or generated concept art,
- photos or raster source material,
- video thumbnails or stills,
- images where pixel-level fidelity is the evidence.

When a bitmap is needed, prefer wrapping or pairing it with an SVG-sidecar asset that embeds SESM metadata and points to the raster evidence.

## Priority Graphics

### Highest Benefit

1. Project identity marks
   - One SESM SVG logo per active project.
   - Best for portfolio cards, project heroes, metadata validation demos, and visual consistency.

2. Standards framework diagrams
   - CityHall, WGS, AAMHS, CTS, DRS, NeonInk, PPS, SESM, and WDS.
   - Best for teaching how the Aptlantis governance layers connect.

3. Evidence model icons
   - Manifest present, release evidence recorded, hash generated, installer missing, verification pending, safe profile, metadata parseable.
   - Best for project detail pages where trust claims need quick visual support.

4. Pipeline and storage maps
   - CloneCratesio, ChatArchive, FileCabinet, ChromeArchivalPlugin, CommandWizard.
   - Best for replacing generic boxes with project-specific flow diagrams.

### Medium Benefit

5. Page-level hero marks
   - About, Museum, SVG Lab, Standards, Project index.
   - Keep these compact and technical, not marketing-style illustrations.

6. Download and artifact diagrams
   - CityHall resource cards, release bundles, sidecar outputs, JSONL streams, archive manifests.
   - Best where a visitor needs to understand a generated artifact before opening it.

7. UI texture assets
   - Blueprint grids, archival borders, compass/anchor/metadata ornaments.
   - Should remain subtle and reusable through CSS or small SVG motifs.

### Lower Benefit

8. Decorative standalone illustrations
   - Only create these when they carry project meaning.
   - Avoid generic atmosphere images that do not prove or teach anything.

## Suggested Workflow

1. Create the SVG in the Aptlantis blue-slate palette.
2. Embed SESM metadata before adding it to `public/`.
3. Validate the SVG safe profile in SVG Lab.
4. Add captions near the asset explaining what it proves or identifies.
5. Keep filenames stable and descriptive.
6. Prefer replacing placeholder art with project-specific SVGs before adding new decorative imagery.

## Current Notes

- The blue-slate banner and theme board are bitmap concept assets and can remain bitmap evidence.
- New project logos should be recreated or wrapped as SESM SVGs over time.
- Screenshots should stay raster because their purpose is to prove real UI state.
- Museum currently uses a temporary themed mark in UI and should receive a real SESM SVG mark later.

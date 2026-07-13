# aptlantis.studio Proposal

## Project Type

Website / project portfolio / operator documentation surface

## Readiness Level

draft

## Governing Standards

- Proposal: PPS
- Workspace: WGS
- Delivery: WDS
- Supporting: CTS, DRS, SFDS

## Problem Statement

APTlantis has many useful tools, standards, archives, and experiments, but a normal repository listing does not explain how the pieces relate, what each project is for, or what an operator can actually do with them. The previous `aptlantis.studio` site was shaped around Linux distributions, mirrors, ISOs, torrents, and package repository language, so it no longer matches the project portfolio mission.

## Mission

Turn `aptlantis.studio` into the Aptlantis project portfolio: a dark, compact, evidence-led site that teaches what each project does, where it sits in the Aptlantis ecosystem, what is complete, what is missing, and how an operator can use or evaluate it.

## Design Boundaries

This project includes the public portfolio site, normalized project data, curated media evidence, project cards, project detail pages, and client-side CommandWizard command construction.

This project does not replace GitHub, mirror raw README files, host Linux distribution downloads, manage torrents, perform release signing, or become the authoritative governance source for every project. It presents and teaches from analyzer output and curated evidence.

## Success Criteria

- [ ] Home page lists Aptlantis projects from analyzer output rather than distro records.
- [ ] Project detail pages expose Overview, Installation, and Screenshots tabs.
- [ ] CloneCratesio renders curated video, screenshots, help output, and a working command builder.
- [ ] Linux distro, ISO, torrent, mirror, and rsync language is removed from portfolio paths unless a project specifically requires it.
- [ ] The site builds cleanly with Vite and can be visually verified against the approved Aptlantis portfolio direction.

## Failure Criteria

- [ ] The rewrite still feels like GitHub with a different skin.
- [ ] Old distro routes or cards remain in the primary user flow.
- [ ] Project data becomes hand-maintained drift instead of being generated from analyzer outputs.
- [ ] CommandWizard controls produce invalid or uncopyable command strings.
- [ ] Curated screenshots or video fail to load in the browser.

## Constraints

- Technical: React, Vite, Tailwind, local static JSON assets, client-side command validation for the first pass.
- Scope: first pass focuses on portfolio home, project detail pages, CloneCratesio evidence, and schema-driven command construction.
- Runtime: static site behavior should work without a custom backend.
- Data: `.refs\Project-7-8-Summaries` is the initial project source; `.refs\CloneCratesio` is the initial curated evidence source.

## Risks

- Risk: Analyzer JSON may change shape in future runs.
  Mitigation: Keep a normalization script and central TypeScript data contract.

- Risk: CommandWizard TOML schemas are broad and not all tools map neatly to one UI.
  Mitigation: Start with a small converted schema catalog plus a custom CloneCratesio schema, then expand.

- Risk: Large media assets may affect local build or hosting size.
  Mitigation: Keep media references explicit and validate load behavior before publishing.

## Roadmap

1. Proposal.
2. Generate normalized portfolio and command-schema data.
3. Replace distro UI with project portfolio UI.
4. Validate home, project detail, command builder, and media evidence.
5. Expand project-specific curation after the first working portfolio pass.

# AGENTS.md

## Aptlantis Project Teaching Studio — Agent Operating Guide

This repository is the source for the Aptlantis project portfolio / teaching studio site. Treat it as a public-facing engineering catalog, not a throwaway demo. The site explains projects, standards, release evidence, screenshots, SVG metadata workflows, and operational trust models for the Aptlantis ecosystem.

The goal is to help visitors understand each project quickly while preserving the operator-first documentation style: what it does, how it is used, what it produces, what evidence exists, what is missing, and what should happen next.

---

## 1. Project Identity

This site is an **Aptlantis project teaching studio**.

It should feel like:

- a project portfolio,
- an internal engineering portal,
- a release-readiness dashboard,
- a standards demonstration space,
- and a public explanation layer for obscure or technical tools.

It should not feel like:

- a generic landing page,
- a marketing-only portfolio,
- a boilerplate React demo,
- a random pile of repositories,
- or a site that hides unfinished work.

The strongest pattern in this project is **evidence-first documentation**. When adding or editing content, prefer proof over hype.

---

## 2. Tech Stack

Use the stack already present in the repository.

Primary frontend:

- Vite
- React 19
- TypeScript
- React Router
- Radix UI components
- Tailwind-style utility patterns where already present
- Lucide icons
- Mermaid for diagrams when useful
- D3 / Recharts only when a real visualization is warranted

Backend / service layer:

- Express 5
- TypeScript via `tsx`
- MongoDB where database-backed import/catalog flows are used
- Rust service workspace under `services/aptlantis-services`

Package manager:

- pnpm 10.15.0

Do not introduce a second package manager. Do not add npm lockfiles or yarn lockfiles.

---

## 3. Commands

Use these commands from the repository root.

### Frontend development

```bash
pnpm dev
```

### Server development

```bash
pnpm dev:server
```

### Frontend + server together

```bash
pnpm dev:all
```

### Production build

```bash
pnpm build
```

### Preview built frontend

```bash
pnpm start
```

### Start server

```bash
pnpm start:server
```

### Rust service development

```bash
pnpm services:dev
```

### Rust service check

```bash
pnpm services:check
```

### Build local service image

```bash
pnpm services:docker
```

### Strict lint

```bash
pnpm lint:strict
```

### Auto-fix lint

```bash
pnpm lint
```

### Format all supported source/content files

```bash
pnpm format
```

### Check formatting

```bash
pnpm format:check
```

### Import all database content

```bash
pnpm import-all
```

When changing code, run the smallest relevant verification first, then run broader checks before handing off.

---

## 4. Agent Priorities

When working in this repository, optimize in this order:

1. **Preserve project truth.** Do not make a project sound more complete, safer, audited, packaged, released, or production-ready than the content says.
2. **Keep the evidence model intact.** Every project page should make clear what proof exists: screenshots, manifests, command examples, release evidence, generated outputs, PDFs, diagrams, or demo surfaces.
3. **Protect the Aptlantis design language.** Dark interface, cyan accent, compact cards, operator-console feel, restrained motion, clear hierarchy.
4. **Prefer structured content.** Reusable project records, schema-like objects, arrays of capabilities, outputs, missing pieces, dependencies, screenshots, and links are preferred over one-off page logic.
5. **Do not flatten distinct projects into one template.** Similar sections are good. Forced sameness is not. Each project should have evidence appropriate to its type.
6. **Keep public pages legible.** The site can be dense, but it must remain scannable.
7. **Respect local-first/operator-first framing.** Avoid cloud-first assumptions unless the page or feature explicitly calls for them.

---

## 5. Project Types and Evidence Rules

Not every project should be presented the same way. Choose the evidence format that best proves the project.

### Desktop applications

Examples: FileCabinet, ChatArchive, AptConsole, Structra.

Best evidence:

- screenshots,
- workflows,
- installer notes,
- storage model,
- repair / verification model,
- release evidence,
- PDFs or generated documentation,
- before/after views.

Do not force fake interactivity when screenshots explain the application better.

### CLI tools and pipelines

Examples: CloneCratesio, ArchiveHasher, AnalyzeProjects, DatasetPipelines.

Best evidence:

- pipeline diagrams,
- command examples,
- terminal output snippets,
- generated manifests,
- JSON/JSONL examples,
- run metrics,
- bundle layouts,
- verification results,
- restart/resume behavior,
- import/export surfaces.

Avoid showing only terminal output if a pipeline diagram or generated artifact would explain the project better.

### Standards and concepts

Examples: CityHall, CTS, DRS, SESM, governance standards.

Best evidence:

- interactive demos,
- diagrams,
- glossary cards,
- schema examples,
- validation results,
- comparison views,
- before/after explanation,
- examples embedded into real project pages.

These pages should teach the concept, not merely list files.

### Visual/metadata tooling

Examples: SVG Lab, AptlantisLogos, LangThemeGenerator.

Best evidence:

- live previews,
- metadata panels,
- validation states,
- compare views,
- generated output,
- safe/unsafe status,
- downloadable artifacts where applicable.

---

## 6. Content Model Guidelines

When adding or updating a project, prefer fields like these when they fit:

- `title`
- `slug`
- `status`
- `governance`
- `group`
- `summary`
- `description`
- `completion`
- `operationalCompletion`
- `productCompletion`
- `tags`
- `repositoryUrl`
- `screenshots`
- `capabilities`
- `interfaces`
- `outputs`
- `dependencies`
- `usageSteps`
- `storageModel`
- `trustModel`
- `missingPieces`
- `potentialImprovements`
- `nextSteps`
- `evidence`
- `explainerVideo`
- `projectMap`

Do not invent data to fill every field. Empty or absent fields are better than false confidence.

---

## 7. Page Structure Expectations

A strong project detail page usually contains:

1. breadcrumb,
2. project browser/navigation control,
3. hero area with logo, status badges, title, summary, repository/action buttons,
4. tabs appropriate to that project,
5. overview or usage section,
6. screenshots or evidence section if available,
7. capabilities/interfaces/outputs/dependencies,
8. storage/trust/release model where relevant,
9. project map or flow diagram,
10. next steps,
11. missing pieces,
12. potential improvements.

Do not add sections just to satisfy this list. Use the list as a menu, not a cage.

---

## 8. Design Language

Preserve the Aptlantis visual identity.

General feel:

- dark background,
- cyan/teal primary accent,
- quiet borders,
- compact cards,
- high information density,
- dashboard-like rhythm,
- technical but readable.

Avoid:

- bright marketing gradients unless already part of a specific asset,
- oversized hero sections that bury the evidence,
- generic SaaS language,
- emoji in UI copy,
- excessive animation,
- vague claims like "powerful", "revolutionary", or "next-gen" without evidence.

Use restrained animation only when it teaches state, flow, or progress.

---

## 9. Writing Style

Write like an operator explaining a real system.

Preferred language:

- concrete,
- specific,
- honest,
- calm,
- evidence-based,
- direct.

Good examples:

- "imports OpenAI conversation exports and normalizes conversation trees"
- "generates per-crate sidecars and bundle manifests"
- "release evidence folder is not present in the current snapshot"
- "installer verification has not been recorded yet"
- "operator-facing CLI wrapper around the download engine"

Avoid:

- "game-changing"
- "seamless experience"
- "industry-leading"
- "revolutionary"
- "production-grade" unless release evidence supports that claim
- "secure" unless the specific security property is named

When a project is incomplete, say exactly what is incomplete.

---

## 10. Trust, Release, and Safety Claims

Be strict with trust language.

Allowed:

- "release evidence recorded"
- "hashes generated"
- "manifest present"
- "self-signed"
- "not independently audited"
- "verification flags false"
- "missing release note"
- "installer lifecycle issue identified"
- "safe profile: no scripts, no dangerous URLs"

Avoid unsupported claims:

- "secure"
- "audited"
- "tamper-proof"
- "production-ready"
- "enterprise-ready"
- "guaranteed"
- "verified" unless a verification artifact exists

For SESM/SVG handling, distinguish clearly between:

- metadata parseability,
- safe profile validation,
- user-provided content,
- embedded metadata,
- and actual security guarantees.

---

## 11. Accessibility Rules

This site is visual, but it still needs to remain accessible.

For UI changes:

- keep keyboard navigation intact,
- maintain visible focus states,
- use semantic controls for buttons/links/tabs,
- preserve alt text or accessible summaries for screenshots/logos,
- do not rely on color alone for status,
- keep contrast high in dark mode,
- keep badge text readable,
- avoid tiny click targets for important actions.

For screenshots and diagrams:

- include captions that explain what the image proves,
- use text descriptions for diagrams where practical,
- do not use screenshots as the only source of critical information.

Run lint checks after UI changes.

---

## 12. Routing and Navigation

Preserve simple, predictable navigation.

Project pages should be directly addressable by stable slugs. Avoid breaking existing project URLs unless a redirect or compatibility layer is added.

Project browsing controls should help users move between projects without returning to the index.

When adding tabs, ensure the active tab is obvious and the content is meaningful. Do not add empty tabs.

---

## 13. Data and Import Rules

If editing project data or import scripts:

- preserve existing IDs and slugs unless intentionally migrating,
- keep generated/imported data separate from hand-authored content where possible,
- do not silently overwrite curated content with generated placeholders,
- validate imported records before rendering them publicly,
- keep missing fields visible as missing where appropriate,
- avoid lossy transformations of evidence, manifests, screenshots, and captions.

Use `pnpm import-all` only when intentionally refreshing database-backed content.

---

## 14. Server Rules

For Express/server work:

- keep routes small and understandable,
- validate inputs with Zod where practical,
- do not trust uploaded or imported content,
- do not expose secrets or local file paths in public responses,
- keep CORS intentional,
- log useful operational details without leaking sensitive data,
- prefer explicit JSON response shapes.

If a route powers a public demo, keep the demo deterministic unless live behavior is explicitly required.

---

## 15. Rust Service Rules

For `services/aptlantis-services`:

- run `pnpm services:check` before handoff when touching Rust code,
- avoid changing Docker tags or service names without a clear reason,
- keep service boundaries explicit,
- do not mix frontend concerns into Rust service code,
- preserve restart-friendly and operator-visible behavior where present.

If adding a new service endpoint, document what consumes it.

---

## 16. Dependency Rules

Before adding dependencies, ask whether the existing stack already covers the need.

Use existing dependencies where suitable:

- Radix for accessible primitives,
- Lucide for icons,
- Mermaid for diagrams,
- Recharts or D3 for real visualization needs,
- Zod for validation,
- MongoDB for database-backed catalog/import flows,
- Express for server routes.

Do not add large dependencies for small utilities.

Do not add dependencies that duplicate major existing choices without documenting why.

---

## 17. Generated Assets and SVG/SESM Rules

For generated SVGs or embedded metadata:

- keep the SVG safe profile intact,
- do not add scripts or event handlers,
- do not add remote references,
- keep metadata parseable,
- preserve title, role, project, author, license, tags, accessibility summary, version, and `sesm_version` when present,
- validate after generation or modification.

For project logos:

- do not replace an existing logo with a generic placeholder,
- preserve project-specific visual identity,
- keep captions and metadata aligned with the project.

---

## 18. Screenshots, PDFs, and Evidence Assets

When adding screenshots:

- use meaningful captions,
- explain what the screenshot proves,
- keep image filenames stable and descriptive,
- avoid oversized images where a compressed asset would work,
- do not crop away important context unless the crop is intentional.

When adding PDFs:

- link them as supporting evidence, not as the only explanation,
- include a short page summary near the link,
- do not make users open a PDF just to understand the project.

When adding command output:

- prefer short, representative snippets,
- include the command that produced the output where safe,
- redact local-only paths, tokens, and private hostnames if they are not meant to be public.

---

## 19. Security and Privacy

Never commit or expose:

- API keys,
- tokens,
- passwords,
- private SSH keys,
- private certificates,
- `.env` contents,
- private emails,
- private local paths that reveal sensitive machine layout,
- unredacted personal data from imported exports.

For ChatArchive-related content, be especially careful. Conversation exports may contain private messages, uploaded asset names, links, or personal context. Public examples should be curated, redacted, or synthetic unless explicitly approved.

For email/contact/server/database features, use mock data in demos unless the feature is intentionally wired to a safe backend.

---

## 20. Testing and Verification Checklist

Before handing off a change, run the relevant checks.

For content-only changes:

```bash
pnpm format:check
```

For frontend/UI changes:

```bash
pnpm lint:strict
```

For build-impacting frontend changes:

```bash
pnpm build
```

For server changes:

```bash
pnpm dev:server
```

For Rust service changes:

```bash
pnpm services:check
```

For broad changes:

```bash
pnpm format:check && pnpm lint:strict && pnpm build && pnpm services:check
```

If a check cannot be run, state that clearly in the handoff and explain why.

---

## 21. Git and Change Discipline

Agents should keep changes focused.

Do:

- make small, coherent edits,
- preserve existing naming patterns,
- explain structural changes,
- update content and UI together when necessary,
- keep generated data separate from curated content,
- avoid unrelated cleanup in the same change.

Do not:

- reformat the entire repository without being asked,
- rename large directories casually,
- replace curated copy with generic copy,
- remove evidence sections because they look incomplete,
- hide missing pieces to make a project look better,
- introduce breaking route changes without documenting them.

---

## 22. Handoff Format

When handing work back, include:

1. what changed,
2. files touched,
3. checks run,
4. checks not run and why,
5. any known risks or follow-up work.

Example:

```text
Changed: Added FileCabinet trust-model tab and release-evidence cards.
Files: src/data/projects/filecabinet.ts, src/pages/ProjectDetail.tsx
Checks: pnpm lint:strict, pnpm build
Not run: pnpm services:check because no Rust service files changed.
Risks: Release evidence content is still based on current manifest fields; installer verification remains marked missing.
```

---

## 23. Special Instruction for Future Agents

This repository should keep becoming more self-describing over time.

When a project is hard to explain, do not solve that by writing more vague text. Add better evidence:

- a diagram,
- a generated artifact sample,
- a tiny interactive demo,
- a before/after view,
- a mock terminal,
- a validation panel,
- a project map,
- or a release evidence card.

The best page is not the page with the most words. The best page is the page where a visitor can understand the project, trust the claims, and see what still needs work.

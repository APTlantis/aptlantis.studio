# Aptlantis Layout Pattern Library

## Brand Asset Rule

Treat the background, color system, spacing rhythm, and evidence styling as brand assets, not incidental CSS choices.

| Content type          | Suggested treatment                                    |
| --------------------- | ------------------------------------------------------ |
| Proof / evidence      | Darker, tighter, more terminal-like.                   |
| Explanation           | Slightly more spacious and prose-led.                  |
| Downloads / manifests | Compact file-card grid.                                |
| Interactive tools     | Framed like embedded instruments.                      |
| Diagrams              | Larger stage area with fewer surrounding distractions. |

The outer frame should always feel like Aptlantis: dark, compact, technical, cyan-accented, and evidence-first. The inner module should change shape based on what the content needs to prove or teach.

## Canonical Page Frame

The About page revision is the first approved example of the canonical page frame for core explanatory pages.

Use this pattern when a page needs to explain a concept, policy, standard, or project family without becoming a generic landing page:

```text
Hero panel:
  Eyebrow
  Large direct thesis
  Short current-purpose paragraph
  Compact tags
  Optional right-side focus rail

Three-pillar summary:
  Mission | System | Longevity

Split console:
  Explanation | Evidence map / manifest / artifact list

Operating principles:
  Two-column compact cards

Dossier / FAQ:
  Stacked cards with concrete questions
```

### Approved use

- About page
- Legal / privacy summaries
- Contact routing overview
- Standards pages
- Public metadata and crawler policy pages
- Project family explainers

### Rule

Keep the frame, but vary the content module. Do not force every page to use the exact same sections. The canonical part is the reading rhythm: thesis, summary, proof or structure, operating rules, then specific questions or next actions.

## 1. Dossier Stack

**Best for:** About sections, project overviews, FAQs, standards explanations, evidence summaries.

This is the pattern you already use heavily: vertical panels, each with a heading and compact explanatory text.

```text
[ Section Title ]

┌─────────────────────────────────────┐
│ Heading                             │
│ Paragraph text...                   │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ Heading                             │
│ Paragraph text...                   │
└─────────────────────────────────────┘
```

### Use when

The user should read top-to-bottom like a document.

### Good examples

- About page FAQ
- “Why it matters”
- Release/trust model explanations
- Standards definitions

### Variation tip

Every 3–5 stacked cards, interrupt with a split layout, metric row, or mini-index so the page does not become a wall.

---

## 2. Three-Pillar Summary

**Best for:** mission pages, landing pages, “what this is” summaries, product/project value statements.

```text
[ Intro Title ]
Short paragraph.

┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ Mission      │ │ System       │ │ Longevity    │
│ short text   │ │ short text   │ │ short text   │
└──────────────┘ └──────────────┘ └──────────────┘
```

### Use when

You want the reader to understand the page in 10 seconds.

### Good examples

For the **About** page:

```text
Mission | What APTlantis Is | Why It Matters
```

For **Coding Against The Grain**:

```text
Constraint | Experiment | Lesson
```

For **CityHall**:

```text
Governance | Standards | Evidence
```

### Design note

Keep these cards close in height. They should feel like a control panel, not three unrelated text blocks.

---

## 3. Split Console

**Best for:** “how it works,” architecture summaries, command tools, lab explainers, source/output comparisons.

```text
┌───────────────────────┬───────────────────────┐
│ Left: explanation     │ Right: artifact/output │
│ bullets, steps, notes │ code, preview, diagram │
└───────────────────────┴───────────────────────┘
```

### Use when

There are two things the viewer needs to compare or connect.

### Good examples

- Structra: model tree → TOML/JSON output
- CloneCratesio: command settings → generated command
- About: mirror network → automation layer
- AAMHS/ArchiveHasher: manifest → signatures/checksums

### Nice variants

```text
Explanation | Terminal Output
Inputs      | Generated Artifact
Diagram     | Relationship Notes
Checklist   | Resulting Files
```

This is probably one of your strongest reusable patterns because your work often has a **source → transform → artifact** shape.

---

## 4. Evidence Grid

**Best for:** outputs, release evidence, generated files, manifests, screenshots, docs, downloadable resources.

```text
[ Evidence / Outputs ]

┌──────────────┐ ┌──────────────┐
│ manifest     │ │ hashes       │
└──────────────┘ └──────────────┘
┌──────────────┐ ┌──────────────┐
│ screenshots  │ │ release note │
└──────────────┘ └──────────────┘
```

### Use when

You want to show that a project produces concrete artifacts.

### Good examples

- “What ChatArchive Produces”
- “Execution Evidence”
- “Resource Downloads”
- “Diagram Sources”
- “Release Artifacts”

### Design note

These should be denser and more file-like than prose panels. Smaller text, compact rows, maybe tiny icons: file, hash, manifest, doc, image, video.

### Optional metadata row

```text
artifact.json       generated
snapshot-hashes.txt verified
README.md          documented
diagram.svg        visual
```

That would fit Aptlantis extremely well.

---

## 5. Workflow Rail

**Best for:** usage instructions, operator workflows, migration plans, import/export flows, release pipelines.

```text
[ Workflow Title ]

1 ─ Clone source
2 ─ Validate inputs
3 ─ Generate artifacts
4 ─ Verify results
5 ─ Publish / archive
```

Or as cards:

```text
┌───┐ ┌──────────────────────────────┐
│ 1 │ │ Request OpenAI export        │
└───┘ └──────────────────────────────┘

┌───┐ ┌──────────────────────────────┐
│ 2 │ │ Preserve folder structure    │
└───┘ └──────────────────────────────┘
```

### Use when

The main question is: **how does someone operate this?**

### Good examples

- ChatArchive import path
- CloneCratesio mirror run
- AptDiskwright plan-first flow
- FileCabinet intake flow
- ArchiveHasher release flow

### Strong visual detail

Use numbered badges in a muted accent. It helps the page feel procedural without becoming a tutorial wall.

---

## 6. Instrument Panel

**Best for:** dashboards, status summaries, project health, completion, counts, categories, governance status.

```text
┌───────────────────────────────────────────────┐
│ Portfolio Note                                │
│                                               │
│ ┌───────┐ ┌───────┐ ┌───────┐                 │
│ │  88   │ │  8    │ │  3    │                 │
│ │ avg   │ │ proj  │ │ group │                 │
│ └───────┘ └───────┘ └───────┘                 │
│                                               │
│ status rows / governance rows                 │
└───────────────────────────────────────────────┘
```

### Use when

You want to give the page an operations-console feel.

### Good examples

- Project index top summary
- CityHall standard maturity
- APTlantis mirror/repo counts
- Archive status
- Completion/status blocks

### Design note

Use sparingly. These panels feel important, so too many of them can make every number look equally critical.

---

## 7. Gallery Matrix

**Best for:** screenshots, visualizations, UI states, diagrams, generated media.

```text
┌─────────────────────┐ ┌─────────────────────┐
│ Screenshot           │ │ Screenshot           │
│ Caption              │ │ Caption              │
└─────────────────────┘ └─────────────────────┘

┌─────────────────────┐ ┌─────────────────────┐
│ Screenshot           │ │ Screenshot           │
│ Caption              │ │ Caption              │
└─────────────────────┘ └─────────────────────┘
```

### Use when

The project is easiest to understand visually.

### Good examples

- Structra visualizations
- FileCabinet screenshots
- Command Wizard UI states
- SVG Lab examples
- ChatArchive reader/explorer screens

### Variation

For one important screenshot, use:

```text
┌─────────────────────────────────────┐
│ Large screenshot                     │
│ Caption / explanation                │
└─────────────────────────────────────┘

┌──────────────┐ ┌──────────────┐
│ detail shot  │ │ detail shot  │
└──────────────┘ └──────────────┘
```

That avoids every gallery feeling like a 2x2 grid.

---

## 8. Lab Stage

**Best for:** interactive modules, embedded demos, generators, concept explainers.

```text
[ Lab Title ]
Short explanation.

┌───────────────────────────────────────────────┐
│ Tool / demo / simulator                       │
│                                               │
│ inputs              preview/output            │
│ controls            generated artifact        │
└───────────────────────────────────────────────┘

[ What this demonstrates ]
```

### Use when

The module lets the visitor understand something faster by interacting with it.

### Good examples

- Structra Lab
- SVG Lab
- Coding Against The Grain tools
- CloneCratesio command builder
- ASCII/Figlet generator
- metadata inspector
- manifest previewer

### Rule

A Lab Stage should answer one question:

> “What does this system actually do?”

If it answers that, it belongs.

---

## 9. Segmented Explainer

**Best for:** concepts, standards, resource pages, educational pages, About page clusters.

This is the “three horizontal tabs that span down” idea.

```text
[ Mirror Network ] [ Automation ] [ Preservation ]

┌───────────────────────────────────────────────┐
│ Active segment content                        │
│                                               │
│ text, diagram, bullets, links, mini-cards      │
└───────────────────────────────────────────────┘
```

### Use when

Several related explanations are equal peers, but showing all of them stacked would feel heavy.

### Good examples

About page:

```text
Mission | Infrastructure | Preservation
```

Coding Against The Grain:

```text
Wrong Tool | Constraint | Lesson
```

Standards page:

```text
Governance | Release | Metadata
```

CityHall:

```text
Inputs | Relationships | Outputs
```

### Design note

This should not replace every tab system. Think of it as an **inline section switcher**, not full page navigation.

---

## 10. Resource Shelf

**Best for:** guides, wikis, links, templates, downloads, references.

```text
[ Resource Shelf ]

┌────────────────────────────┐
│ Brainfuck Guide            │
│ Tape model, loops, cells    │
│ guide · examples · notes    │
└────────────────────────────┘

┌────────────────────────────┐
│ CSS-only State             │
│ Inputs, selectors, toggles  │
│ concept · demo · notes      │
└────────────────────────────┘
```

### Use when

You are organizing external/internal references.

### Good examples

- Coding Against The Grain esolang guides
- Standards downloads
- CityHall templates
- project docs
- language/runtime resources

### Optional fields

```text
Type: Guide / Wiki / Example / Tool / Reference
Difficulty: Intro / Intermediate / Cursed
Focus: State / Parsing / Rendering / Constraints
```

That would make the esolang/resource pages much more navigable.

---

# Suggested Page Recipes

## About Page Recipe

```text
Page Intro

Three-Pillar Summary
Mission | What APTlantis Is | Why It Matters

Split Console
Mirror Network | Automation Infrastructure

Dossier Stack
Built for Longevity
Developer-Focused Philosophy

FAQ Dossier Stack

Two-Up Footer Panels
Credits | Contact
```

This keeps the page readable but less vertically repetitive.

---

## Project Detail Recipe

```text
Project Hero

Project Tabs

Overview:
  Three-Pillar Summary
  Dossier Stack
  Evidence Grid

Usage:
  Workflow Rail
  Split Console
  Outputs Grid

Screenshots:
  Gallery Matrix

Evidence:
  Evidence Grid
  Verification Steps
```

This gives every project the same shell but lets each tab breathe differently.

---

## Coding Against The Grain Recipe

```text
Hero / Thesis

Tabs:
  Overview
  Tools
  Language Index
  Concepts
  Field Notes

Overview:
  Three-Pillar Summary
  Gallery/Card grid of experiments
  “Why go weird?” Dossier panel

Tools:
  Lab Stage for Figlet
  Resource Shelf for other generators

Language Index:
  Resource Shelf cards
  filters by difficulty/concept

Concepts:
  Segmented Explainer
  Dossier Stack for deeper notes

Field Notes:
  Q/A cards
  experiments log
```

This would make it feel like a real Aptlantis lab, not just a novelty page.

---

## Standards Page Recipe

```text
Intro

Instrument Panel
number of standards, relationships, maturity

Segmented Explainer
Governance | Release | Metadata | Visual Semantics

Standards Resource Shelf

Framework Relationship Map

Downloads / Templates Evidence Grid
```

---

# Pattern Naming System

You could literally name these in your code/docs:

```text
DossierStack
PillarGrid
SplitConsole
EvidenceGrid
WorkflowRail
InstrumentPanel
GalleryMatrix
LabStage
SegmentedExplainer
ResourceShelf
```

That gives you a clean design vocabulary and makes it easier to decide what a page needs.

---

# The guiding rule

The outer frame should always feel like Aptlantis.

The inner module should match the content:

| Content purpose     | Best pattern         |
| ------------------- | -------------------- |
| Explain             | Dossier Stack        |
| Summarize           | Three-Pillar Summary |
| Compare             | Split Console        |
| Prove               | Evidence Grid        |
| Operate             | Workflow Rail        |
| Monitor             | Instrument Panel     |
| Show visuals        | Gallery Matrix       |
| Teach interactively | Lab Stage            |
| Switch concepts     | Segmented Explainer  |
| Organize references | Resource Shelf       |

That is probably enough variety for the whole site without making it feel like a bunch of unrelated pages.

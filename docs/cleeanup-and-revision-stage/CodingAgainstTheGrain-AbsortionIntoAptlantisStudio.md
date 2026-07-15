# Coding Against The Grain Absorption

## Current Direction

**Coding Against The Grain** should become the Aptlantis home for esolang notes, constrained-language literacy, and field explanations about programming systems that make ordinary assumptions visible.

This is no longer planned as a generator or transformation-tool section.

Remove from the section plan:

- Figlet / ASCII generator
- ANSI banner generator
- pseudo-terminal card generator
- README banner generator
- retro loading screen generator
- JSON-to-ASCII dashboard tools
- Markdown-to-terminal transformation tools
- image-to-character mosaic tools

Those ideas can exist elsewhere later if they become real projects, but they should not define this page.

## Section Thesis

Coding Against The Grain is about what strange programming environments teach:

- how memory can be modeled with almost nothing,
- how control flow can become spatial,
- how syntax can deliberately resist comfort,
- how state hides inside documents, selectors, cells, and stacks,
- and how constraints make normal programming concepts easier to inspect.

The section should be playful, but it should still read like Aptlantis: structured, evidence-aware, and honest about what is a note, a demo, a future idea, or a working artifact.

## Suggested Structure

```text
Overview | Esolang Index | Concepts | Field Notes
```

Avoid `Generators`, `Transformers`, and broad `Tools` tabs for now.

## Overview

The overview should explain the point:

> Creative programming where the medium fights back.

It should frame the page as a teaching catalog, not a toy shelf.

Keep the wider constraint-driven programming thesis, but let esolangs become the lead example set instead of terminal art or generated outputs.

## Esolang Index

This should become the main growth surface.

Starter entries:

- Brainfuck
- Befunge
- LOLCODE
- Shakespeare
- Piet
- INTERCAL
- Whitespace
- Malbolge
- FALSE
- Chef
- Ook!

Each entry should eventually carry:

| Field             | Purpose                                                  |
| ----------------- | -------------------------------------------------------- |
| Difficulty        | Reader-facing complexity label.                          |
| Runtime model     | Tape, stack, grid, text, image, whitespace, or dialogue. |
| Best for learning | The concept the language exposes clearly.                |
| Project ideas     | Small interpreters, visualizers, examples, or notes.     |
| Evidence          | Links, screenshots, sample programs, or local outputs.   |

## Concepts

The concepts section should explain ideas across weird programming systems:

- Turing tarpit
- tape machines
- stack machines
- two-dimensional control flow
- cellular logic
- finite-state machines
- parser abuse
- quines
- code golf
- self-modifying code
- computation in unexpected media

This section is where the weird material becomes educational rather than only novel.

## Field Notes

Field notes should be curated Q/A-style explanations:

- What makes something an esolang?
- Why is Brainfuck technically complete?
- How does Befunge make control flow spatial?
- Why do constraints improve normal programming skill?
- When does a data format start acting like a runtime?

These notes can carry more personality than the project catalog, but should still be grounded in concrete examples.

## Implementation Notes

- Remove the live Figlet generator from the Coding Against The Grain page.
- Remove generator/transformation entries from the public section catalog.
- Keep the page public-data backed through `/data/coding-against-the-grain/experiments.json`.
- Preserve the old `/coding-weird-stuff` compatibility route.
- Do not add this section to Linux Genealogy or other unrelated navigation decisions.

# Coding Against The Grain Ingestion

“Coding Weird Stuff” is fun, but **Coding Against The Grain** is much stronger. It has a better thesis, it sounds intentional, and it fits the Aptlantis teaching-studio framing way better.

The legacy page already has the seed of the right thing: unusual programming as a playground. The rebrand can turn it from “here are quirky examples” into:

> **A lab for learning programming constraints by deliberately using the wrong tool beautifully.**

That is a much stronger concept.

## Suggested structure

I’d absolutely borrow the project-detail tab pattern from ChatArchive. Something like:

### **Coding Against The Grain**

The landing / overview tab.

This should explain the philosophy:

- weird platforms
- constrained environments
- esolangs
- “wrong tool” experiments
- code as puzzle, artifact, and teaching device
- practical lessons hiding inside impractical builds

This tab can keep the card grid of examples, but I’d make it feel more curated and less like a list of novelty links.

Possible intro line:

> Experiments in writing useful, playful, or surprisingly capable software where it was never expected to exist.

### **Generators**

This is where Figlet belongs.

I’d group tools like:

- ASCII / Figlet generator
- ANSI terminal banner generator
- pseudo-terminal card generator
- code comment banner generator
- README badge/banner text generator
- retro loading screen generator
- table-to-ASCII formatter

These are practical enough to use, but still playful enough to belong.

### **Transformers**

This could be adjacent to generators but more “input becomes strange output.”

Examples:

- text → ASCII art
- JSON → weird table / terminal view
- Markdown → terminal document
- CSS box → ASCII box drawing
- CSV → fixed-width terminal report
- image → character mosaic, eventually
- code block → “ancient terminal printout” style

This would fit your broader Aptlantis thing too because you already like structured data, exports, manifests, and format conversion.

### **Esolang Index**

This is where the resource/wiki idea starts.

Cards for languages or environments:

- Brainfuck
- Befunge
- LOLCODE
- Shakespeare
- Piet
- INTERCAL
- Whitespace
- Malbolge
- QBasic oddities
- COBOL experiments
- SQL-as-programming
- CSS-only logic
- Excel/VBA abuse
- PowerPoint games
- Regex engines

Each card could have:

| Field             | Example                             |
| ----------------- | ----------------------------------- |
| Difficulty        | approachable / weird / cursed       |
| Best for learning | state, stacks, parsing, constraints |
| Runtime model     | tape, grid, cells, text, slides     |
| Project ideas     | calculator, game, renderer, parser  |
| Resources         | guide, wiki, examples               |

### **Concepts**

This is the teaching tab.

Instead of being language-specific, this explains ideas across weird programming:

- Turing tarpit
- constraint programming
- cellular logic
- stack machines
- tape machines
- code golf
- self-modifying code
- quines
- parser abuse
- finite-state machines
- computation in unexpected media
- “when a format becomes a runtime”

This tab could become quietly excellent because it makes the weird stuff educational, not just novelty.

### **Q/A + Notes**

A Stack Overflow-ish mini knowledge base could be really good here.

Not necessarily a real forum at first. More like curated entries:

- “How do you store state in CSS-only games?”
- “Why is Brainfuck technically complete?”
- “Can SQL raytrace?”
- “How do Excel games work?”
- “What makes something an esolang?”
- “Why do weird constraints improve normal programming skill?”

This is also where your voice can come through more than on the project catalog pages.

## Page personality

I’d let this area be a little more playful than the main portfolio, but not totally visually separate.

The purple gradient in the legacy page is fine as a temporary marker, but for the rebrand I’d probably bring it back into the Aptlantis design system:

- same dark graph-paper page background
- same panel/card language
- more accent color freedom inside modules
- terminal greens, purples, amber, cyan
- “lab” modules instead of standard project cards

So it still feels like Aptlantis, but slightly more mischievous.

## Name hierarchy

I’d avoid making the whole page feel like a random “fun stuff” corner. The name already gives it a strong thesis.

Maybe:

**Coding Against The Grain**
_Unusual programming labs, esolang notes, and constraint-driven experiments._

Or:

**Coding Against The Grain**
_Creative programming where the medium fights back._

That second one has bite.

## How I’d adapt the tabs visually

From the ChatArchive screenshot, the tab structure works because it makes the project page feel serious and navigable. For this section, I’d use the same mechanics but slightly different labels:

```text
Overview | Generators | Transformers | Esolangs | Concepts | Field Notes
```

Or, a little more Aptlantis-flavored:

```text
Overview | Tools | Transformations | Language Index | Concepts | Notes & Q/A
```

I think **Tools** may be better than splitting generators/transformers too early unless you have several of each. You could start with:

```text
Overview | Tools | Esolang Index | Concepts | Notes
```

Then split Tools later once it gets crowded.

## What to keep from the old page

Definitely keep the Figlet thing. It belongs perfectly. I’d just reframe it as the first “tool card” rather than the main attraction.

The “Against the Grain” card grid is also worth keeping, but I’d make each item feel like a catalog entry with a consistent purpose:

```text
Title
Medium / constraint
What it proves
Try / read / inspect
```

For example:

**CSS-only Tic Tac Toe**
Constraint: no JavaScript
What it proves: state can be modeled through selectors, inputs, and document structure.

**SQL Raytracer**
Constraint: relational queries only
What it proves: declarative systems can still express procedural-looking computation.

**Tetris in Excel**
Constraint: spreadsheet cells and macros
What it proves: grids are secretly runtimes.

## My strongest recommendation

Make the section less about “weird languages” and more about **constraint-driven programming**.

That gives it a wider range:

- esolangs
- office apps
- CSS
- SQL
- regex
- shell abuse
- terminal art
- weird UI experiments
- old languages
- intentionally limited tools

That is much richer than only esolangs.

The rebranded page could become one of the most memorable parts of the site because it shows a different side of the same core Aptlantis personality: structured, archival, systems-minded — but willing to play with the edges of what counts as software.

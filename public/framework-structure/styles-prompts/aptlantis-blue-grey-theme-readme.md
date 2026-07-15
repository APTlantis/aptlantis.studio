# Aptlantis Blue-Grey Tailwind Theme

A dark archival technical theme derived from the Aptlantis SGML logo palette.

## Core vibe

Cold blue-grey, midnight navy, steel, archive-paper text, restrained cyan glow.

Keywords:

- archival
- technical
- maritime
- midnight
- steel
- precise
- structured
- calm

## Tailwind version

This stylesheet uses Tailwind v4's CSS-first `@theme` syntax.

## Quick usage

```css
@import "./aptlantis-blue-grey.tailwind.css";
```

Or use it directly as your Tailwind input CSS.

## Semantic class examples

```html
<main class="atl-shell">
  <section class="atl-container py-16">
    <div class="atl-panel atl-ornament p-10">
      <p class="atl-eyebrow">Aptlantis / Buildline</p>
      <h1 class="atl-title atl-gradient-text text-6xl">Deep Structure. Clear Insight.</h1>
      <p class="atl-subtitle mt-6 max-w-2xl">A dark archival technical presentation and interface theme.</p>
      <div class="mt-8 flex gap-3">
        <a class="atl-button px-5 py-3" href="#">Primary Action</a>
        <a class="atl-button-ghost px-5 py-3" href="#">Secondary</a>
      </div>
    </div>
  </section>
</main>
```

## Color scale

| Token | Hex | Role |
|---|---:|---|
| `atl-void` | `#050913` | deepest background |
| `atl-deep` | `#0B1728` | soft background |
| `atl-abyss` | `#172536` | primary surface |
| `atl-slate` | `#262F39` | secondary surface |
| `atl-iron` | `#40423F` | warm dark neutral |
| `atl-navy` | `#192E46` | blue panel / accent base |
| `atl-steel` | `#29384A` | blue-grey surface |
| `atl-ridge` | `#36485A` | borders / dividers |
| `atl-smoke` | `#53606A` | muted structure |
| `atl-stone` | `#7E827E` | neutral steel |
| `atl-bluegray` | `#627786` | cool UI structure |
| `atl-mist` | `#768892` | accent / secondary text |
| `atl-frost` | `#98A2A2` | muted text |
| `atl-silver` | `#B9C9C5` | text / links |
| `atl-archive` | `#E1E7DB` | primary text / highlight |
```

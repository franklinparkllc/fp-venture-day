# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

`fp-venture-day` is a static site generator for Franklin Park's annual Venture Day biotech presentation archive. It catalogs presentations from 2021–2026, hosted at https://rncdev.github.io/fp-venture-day/

The site is fully self-contained: `build.js` reads `contents.yaml` and generates a single `index.html` file with all CSS and JavaScript inlined, requiring no external assets except Google Fonts.

## Build Commands

- `npm run build` — read `contents.yaml`, generate `index.html`
- `npm run dev` — build + serve at `http://localhost:8000`
- `npm run serve` — serve without rebuilding
- `npm run watch` — auto-rebuild on file changes *(note: currently watches `content.md` due to a bug in package.json; should be `contents.yaml`)*

## Architecture

**Content Model**
- `contents.yaml` is the sole source of truth for all site content
- Content structure: `site` (metadata), `hosts` (organizations), `years` (array of year objects with sessions)
- Session IDs auto-generate as `VD-{YY}-{talk-number}` (e.g., `VD-26-01`)

**Build Output**
- `build.js` generates `index.html` as a single 52 kB self-contained file
- All CSS is inlined in a `<style>` tag via the `STYLES` constant
- All client JavaScript is inlined in a `<script>` tag via the `RUNTIME` constant
- `index.html` is committed to the repo for GitHub Pages deployment

**Styling & Interactivity**
- Uses vanilla CSS (Grid, custom properties) with no frameworks
- Accordion behavior: CSS `grid-template-rows: 0fr → 1fr` transitions toggled via `data-open` attributes
- Vanilla ES6 JavaScript handles expand/collapse logic; no external JS libraries

**Legacy Files**
- `styles.css` and `script.js` at the root are unused artifacts from a prior version — ignore them

## Key Files

- `contents.yaml` — all presentations, years, hosts, and supporters
- `build.js` — the entire site generator (461 lines)
- `index.html` — generated output; do not edit manually

## Important Notes

- Always edit `contents.yaml` for content changes, then run `npm run build` to regenerate
- The `watch` script has a known bug (watches wrong file) — use `npm run build` or `npm run dev` instead
- No external analytics are integrated; see `CLARITY_SETUP.md` if adding Microsoft Clarity is desired

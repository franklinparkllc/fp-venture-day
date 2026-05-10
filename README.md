# Venture Day — Specimen Index

A clean, modern archive of biotech presentations from Venture Day (2021–2026). Built with a lightweight Node.js static site generator that converts structured YAML to a fully self-contained HTML page, deployed automatically to GitHub Pages.

## 🚀 Live Site

[https://rncdev.github.io/fp-venture-day/](https://rncdev.github.io/fp-venture-day/)

## ⚡ How to Update the Site

The standard workflow is:

1. **Edit `contents.yaml`** — add/update talks, supporters, hosts, or bump `site.version`
2. **Commit and push** — that's it

GitHub Actions automatically rebuilds `index.html` and deploys it to GitHub Pages on every push to `main`. You can do this entirely from the GitHub web UI (no local Node.js install needed) or from your editor.

> **Note**: `index.html` is a build artifact — it is `.gitignore`d and produced by CI. Do not edit it directly; edit `contents.yaml` and let the build regenerate it.

## 📁 Project Structure

```
fp-venture-day/
├── contents.yaml              # ✏️  Source of truth — edit this
├── build.js                   # Static site generator
├── package.json               # Node.js dependencies
├── .github/workflows/
│   └── deploy.yml             # CI: builds + deploys on push
├── index.html                 # Generated artifact (gitignored)
├── favicon.ico, *.png         # Site icons
└── README.md
```

## 🛠️ Local Preview (optional)

Useful for testing layout changes to `build.js` before pushing.

```bash
npm install
npm run dev      # builds + serves at http://localhost:8000
```

Other scripts:
- `npm run build` — regenerate `index.html` once
- `npm run watch` — auto-rebuild on `contents.yaml` changes
- `npm run serve` — serve without rebuilding

## 📝 Content Format (`contents.yaml`)

Three top-level keys: `site`, `hosts`, `years`.

```yaml
site:
  title: "Venture Day — Specimen Index"
  brand: "VENTURE.DAY"
  version: "v13"               # bump this when content changes
  current_year: 2026
  updated: "05.09.2026"
  hero:
    label: "Catalog · Twelfth annual gathering"
    headline: "Specimen index of <em>unreleased</em> biotech."
    lede: "..."

hosts:
  - { name: Franklin Park, url: "https://www.franklinparkllc.com/" }

years:
  - year: 2026
    tagline: "Twelfth annual gathering"
    supporters:
      - { name: Franklin Park, url: "https://..." }
    sessions:
      - { kind: remarks, time: "9:15 – 9:30", speaker: "Opening Remarks" }
      - kind: talk
        time: "9:30 – 9:50"
        speaker: "Name"
        affil: "Institution"
        topic: "Short title"
        bio: >-
          Full biography paragraph...
      - { kind: break, time: "11:40 – 1:00", label: "Lunch" }
```

### Session Types

- **`remarks`** — opening/closing remarks (no bio, no affiliation)
- **`talk`** — speaker session (speaker, affiliation, topic, bio)
- **`break`** — lunch/break block (just label and time)

Session IDs auto-generate as `VD-{YY}-{NN}` (e.g. `VD-26-01`).

## 🏗️ Build System

`build.js` (single file, ~460 lines) reads `contents.yaml` via `js-yaml`, renders the document via template-string functions, and writes a single ~52 kB `index.html` with:

- Inline CSS (the `STYLES` constant) — vanilla modern CSS, Grid + custom properties
- Inline JavaScript (the `RUNTIME` constant) — vanilla ES6 accordion logic
- IBM Plex fonts via Google Fonts CDN (the only external dependency)

Accordions use `grid-template-rows: 0fr → 1fr` transitions toggled via `data-open` attributes. The current year is open at build time; older years collapse.

## 🚢 Deployment

Pushes to `main` trigger `.github/workflows/deploy.yml`, which:

1. Checks out the repo
2. `npm ci` to install dependencies
3. `npm run build` to regenerate `index.html`
4. Uploads the working tree as a Pages artifact
5. Deploys to GitHub Pages

Deploy status: see the **Actions** tab on GitHub. Live URL is shown in the workflow summary.

## 🔧 Prerequisites (for local work only)

- Node.js 18+
- Python 3 (only for `npm run dev`/`serve` — uses `python -m http.server`)

## 📄 License

MIT

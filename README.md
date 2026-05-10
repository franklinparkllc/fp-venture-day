# Venture Day — Specimen Index

A clean, modern archive of biotech presentations from Venture Day (2021–2026). Built with a lightweight Node.js static site generator that converts structured YAML to a fully self-contained HTML page optimized for GitHub Pages.

## 🚀 Live Site

Visit: [https://rncdev.github.io/fp-venture-day/](https://rncdev.github.io/fp-venture-day/)

## 📋 Features

- **Single-File Output**: Fully self-contained HTML with inline CSS + JavaScript (no external dependencies)
- **Responsive Design**: Mobile-optimized with CSS Grid and media queries
- **Dark Theme**: Modern dark UI with accent colors and smooth transitions
- **Collapsible Archive**: Toggle years and expand talk bios with smooth animations
- **Fast Loading**: 52.8 kB total (compressed further by browser)
- **YAML-Based Content**: Easy-to-edit structured data format
- **IBM Plex Typography**: Professional fonts from Google Fonts
- **Navigation**: Sticky header with year links, scroll anchors

## 🎨 Design

- **Color Scheme**: Dark background (`#0d1014`) with light text, accent gold
- **Typography**: IBM Plex Sans/Serif/Mono for professional appearance
- **Layout**: CSS Grid for responsive multi-column layout
- **Interactions**: Smooth collapse/expand using CSS `grid-template-rows` transitions
- **Mobile**: Single-column stacked layout below 800px

## 📁 Project Structure

```
fp-venture-day/
├── contents.yaml           # Source of truth (structured YAML)
├── build.js                # Build script (reads YAML → HTML)
├── index.html              # Generated output (fully self-contained)
├── package.json            # Node.js dependencies
├── styles.css              # External CSS (optional, not used currently)
├── script.js               # External JS (optional, not used currently)
└── README.md               # This file
```

## 🔧 Development Workflow

### Installation

```bash
npm install
```

This installs `js-yaml` (required for YAML parsing) and `nodemon` (optional, for watching).

### Build Commands

- **`npm run build`** — Build `index.html` once from `contents.yaml`
- **`npm run dev`** — Build and serve locally on `http://localhost:8000`
- **`npm run watch`** — Watch `contents.yaml` for changes and auto-rebuild

### Making Changes

#### Content Updates (Speakers, Years, Bios)

1. **Edit `contents.yaml`** — Add/update speaker data, supporters, topics, bios
2. **Run build** — `npm run build`
3. **Test** — Open `index.html` in browser, verify layout and content
4. **Commit & push**:
   ```bash
   git add contents.yaml index.html
   git commit -m "Update: [brief description]"
   git push
   ```

#### UI/Design Changes

The new build system generates **fully self-contained HTML** (all CSS + JS inline). To modify:

1. **Edit `build.js`** — Change HTML structure, CSS styles, or JavaScript behavior
2. **Run build** — `npm run build` to regenerate `index.html`
3. **Test** — Open `index.html` in browser
4. **Commit & push**:
   ```bash
   git add build.js index.html
   git commit -m "UI: [brief description]"
   git push
   ```

Note: `styles.css` and `script.js` in the repo are not used by the new build; they're kept for reference only.

## 📝 Content Format (contents.yaml)

### File Structure

```yaml
site:
  title: "Venture Day — Specimen Index"
  brand: "VENTURE.DAY"
  version: "v12"
  current_year: 2026
  updated: "05.09.2026"
  city: "philadelphia"
  hero:
    label: "Catalog · Twelfth annual gathering"
    headline: "Specimen index of <em>unreleased</em> biotech."
    lede: "A working catalog of every talk given at Venture Day..."
  colophon: "A catalog of unreleased biotech presented at Venture Day."
  year_range: "2014 — 2026"

hosts:
  - name: Franklin Park
    url: https://www.franklinparkllc.com/

years:
  - year: 2026
    tagline: "Twelfth annual gathering"
    supporters:
      - { name: Franklin Park, url: "https://..." }
    sessions:
      - { kind: remarks, time: "9:15 – 9:30", speaker: "Opening Remarks" }
      - kind: talk
        time: "9:30 – 9:50"
        speaker: Name
        affil: "Institution"
        topic: "Short title"
        bio: >-
          Full biography paragraph...
      - { kind: break, time: "11:40 – 1:00", label: "Lunch" }
```

### Session Types

- **`remarks`** — Opening/closing remarks (no bio, no affiliation)
- **`talk`** — Speaker session (includes speaker, affiliation, topic, bio)
- **`break`** — Lunch/break block (just label and time)

### Adding a New Year

```yaml
years:
  - year: 2027
    tagline: "Thirteenth annual gathering"
    supporters:
      - { name: "Company", url: "https://example.com" }
    sessions:
      - { kind: remarks, time: "9:00 – 9:15", speaker: "Opening" }
      - kind: talk
        time: "9:15 – 9:45"
        speaker: "Jane Doe"
        affil: "MIT"
        topic: "Gene therapy advances"
        bio: "Jane is a professor..."
```

### Adding a New Speaker

1. Find the year in `contents.yaml`
2. Add a new entry to `sessions`:
   ```yaml
   - kind: talk
     time: "10:00 – 10:30"
     speaker: "Name"
     affil: "Institution"
     topic: "Research topic"
     bio: "Bio paragraph..."
   ```
3. Run `npm run build`
4. Test and commit

## 🛠️ Build System Details

### How It Works

1. **Read `contents.yaml`** using `js-yaml`
2. **Generate HTML** with:
   - Inline CSS (all styles, variables, responsive queries)
   - Inline JavaScript (accordion toggle logic)
   - Structured content from YAML
3. **Write `index.html`** (fully self-contained, ready to serve)

### Output Properties

- **File size**: ~52.8 kB (single HTML file, no external deps)
- **Runtime deps**: None (inline JS uses vanilla DOM APIs)
- **Hosting**: GitHub Pages (static file serving)
- **Fonts**: Google Fonts CDN (preconnected, optimized)

### Session ID Generation

Sessions get IDs based on year and talk number:
- `VD-26-01` = Venture Day, 2026, Talk #1
- `VD-26-00` = Remarks (always #00)
- Breaks/lunches don't have IDs

## 🚀 Deployment

The build outputs a single `index.html` file ready for GitHub Pages.

```bash
# Build locally
npm run build

# Commit both source and output
git add contents.yaml index.html build.js
git commit -m "Update: [description]"

# Push to GitHub
git push
```

GitHub Actions (if configured) or GitHub Pages will serve `index.html` automatically.

## 📱 Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Android)

Requires support for:
- CSS Grid
- CSS custom properties (variables)
- CSS `grid-template-rows` transitions
- ES6 JavaScript (arrow functions, const/let)

## 🔧 Prerequisites

- **Node.js 18+** (LTS recommended)
- **npm** (comes with Node.js)
- **Git** (for version control)

## 📝 Workflow Examples

### Update a Speaker Bio

```bash
# 1. Edit contents.yaml
# 2. Build
npm run build

# 3. Open index.html and verify
# 4. Commit
git add contents.yaml index.html
git commit -m "Update: Noor Momin bio"
git push
```

### Add a New Year

```bash
# 1. Add year block to contents.yaml
# 2. Update site.current_year if needed
# 3. Build
npm run build

# 4. Verify in browser
# 5. Commit
git add contents.yaml index.html
git commit -m "Add: 2027 speaker lineup"
git push
```

### Change UI Styling

```bash
# 1. Edit build.js (modify the STYLES constant)
# 2. Build
npm run build

# 3. Test in browser
# 4. Commit
git add build.js index.html
git commit -m "UI: Update color scheme"
git push
```

## 🛠️ Technical Stack

- **Language**: JavaScript (Node.js)
- **YAML Parser**: `js-yaml`
- **File Watcher**: `nodemon` (optional)
- **CSS**: Modern (CSS Grid, custom properties, media queries)
- **JavaScript**: Vanilla (no frameworks)
- **Fonts**: IBM Plex (Google Fonts)
- **Hosting**: GitHub Pages

## 📊 Statistics

- **Years**: 6 (2021–2026)
- **Talks**: 39 (varies by year)
- **File size**: ~52.8 kB (single HTML)
- **Build time**: <100ms

## 🐛 Troubleshooting

### Build fails with "Module not found: js-yaml"
```bash
npm install
```

### Changes don't appear after build
- Verify `contents.yaml` is valid YAML (check syntax)
- Clear browser cache or do a hard refresh (Cmd+Shift+R)
- Ensure you ran `npm run build`

### Layout looks wrong on mobile
- Check browser DevTools (Cmd+Option+I)
- Verify viewport meta tag is present (it's in build.js)
- Test in an actual mobile device or mobile emulator

### Specific session not appearing
- Check `contents.yaml` for YAML syntax errors
- Verify the session is nested under the correct year
- Ensure all required fields are present (time, speaker, etc.)

## 📄 License

[Add license info if applicable]

---

**Built with ❤️ for Venture Day**

Last updated: May 2026

#!/usr/bin/env node
/*
 * site-builder.js — render contents.yaml → static HTML for the Specimen Index page.
 *
 * Usage:
 *   npm i js-yaml
 *   node site-builder.js                           # writes ./dist/index.html
 *   node site-builder.js contents.yaml out/page.html   # custom in / out paths
 *
 * The output is fully self-contained: all schedule markup is rendered at
 * build time. A small inline <script> handles collapse/expand only — there
 * is no client-side data dependency.
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

// ---------- args ----------
const inPath  = process.argv[2] || 'contents.yaml';
const outPath = process.argv[3] || 'index.html';

// ---------- helpers ----------
const pad2 = n => String(n).padStart(2, '0');
const esc = s => String(s ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

// `topic` and `headline` are allowed to contain a single inline <em>… for
// emphasis. Escape everything else but pass <em>/</em> through.
const escAllowEm = s => esc(s).replace(/&lt;(\/?)em&gt;/g, '<$1em>');

// ---------- load ----------
const raw = fs.readFileSync(inPath, 'utf8');
const data = yaml.load(raw);

// ---------- render fragments ----------
function renderHostsStrip(hosts) {
  return hosts.map(h =>
    `<a href="${esc(h.url)}" target="_blank" rel="noopener">${esc(h.name)}</a>`
  ).join('\n    ');
}

function renderYearLinks(years, currentYear) {
  return years.map((y) =>
    `<a href="#year-${y.year}"${y.year === currentYear ? ' class="current"' : ''}>${y.year}</a>`
  ).join('');
}

function renderSupporters(supporters) {
  return supporters.map((s, i) =>
    (i ? '<span class="sep">·</span>' : '') +
    `<a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.name)}</a>`
  ).join('');
}

function renderSession(s, year, talkIdx) {
  const yy = String(year).slice(2);

  if (s.kind === 'break') {
    return `      <div class="session break" data-open="false">
        <div class="session-id">—</div>
        <div class="session-time">${esc(s.time)}</div>
        <div class="session-main"><h3 class="session-speaker">${esc(s.label)}</h3></div>
        <div class="session-mark"></div>
      </div>`;
  }

  if (s.kind === 'remarks') {
    return `      <div class="session remarks" data-open="false">
        <div class="session-id">VD-${yy}-00</div>
        <div class="session-time">${esc(s.time)}</div>
        <div class="session-main"><h3 class="session-speaker">${esc(s.speaker)}</h3></div>
        <div class="session-affil"></div>
        <div class="session-mark"></div>
      </div>`;
  }

  // talk
  const id = `VD-${yy}-${pad2(talkIdx)}`;
  const topic = s.topic ? `<p class="session-topic">${escAllowEm(s.topic)}</p>` : '';
  const bio = s.bio
    ? `<div class="session-bio-wrap"><div class="session-bio-inner"><p class="session-bio">${esc(s.bio)}</p></div></div>`
    : '';
  return `      <div class="session talk" data-open="false">
        <div class="session-id">${id}</div>
        <div class="session-time">${esc(s.time)}</div>
        <div class="session-main">
          ${topic}
          <h3 class="session-speaker">${esc(s.speaker)}</h3>
          ${bio}
        </div>
        <div class="session-affil">${esc(s.affil || '')}</div>
        <div class="session-mark">+</div>
      </div>`;
}

function renderYear(y, currentYear) {
  const isCurrent = y.year === currentYear;
  const talkCount = y.sessions.filter(s => s.kind === 'talk').length;

  let talkIdx = 0;
  const sessionsHtml = y.sessions.map(s => {
    if (s.kind === 'talk') talkIdx++;
    return renderSession(s, y.year, talkIdx);
  }).join('\n');

  return `<section class="year" id="year-${y.year}" data-open="${isCurrent}" data-current="${isCurrent}">
  <header class="year-head">
    <div class="year-id">
      <span class="num">${y.year}</span>
    </div>
    <div class="year-info">
      <div class="tag">${esc(y.tagline)}</div>
      <div class="supporters">
        <span class="lbl">Hosts:</span>
        ${renderSupporters(y.supporters)}
      </div>
    </div>
    <div class="year-status">
      <span class="badge">${isCurrent ? 'Live' : 'Archived'}</span>
      <span class="count">${pad2(talkCount)} talks</span>
    </div>
    <span class="chev">+</span>
  </header>
  <div class="year-body"><div class="inner"><div class="session-list">
${sessionsHtml}
    </div></div></div>
</section>`;
}

// ---------- styles (inline so output is one self-contained file) ----------
const STYLES = `
  :root {
    --bg: #0d1014;
    --paper: #161b22;
    --ink: #e6e1d6;
    --muted: #8b8a82;
    --dim: #5a5d62;
    --line: #232a34;
    --line-soft: #1b212a;
    --accent: oklch(0.68 0.13 40);
    --accent-soft: oklch(0.62 0.11 40);
    --serif: "IBM Plex Serif", Georgia, serif;
    --sans: "IBM Plex Sans", system-ui, sans-serif;
    --mono: "IBM Plex Mono", ui-monospace, Menlo, monospace;
  }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; }
  body {
    background: var(--bg); color: var(--ink);
    font-family: var(--sans); font-size: 15px; line-height: 1.5;
    -webkit-font-smoothing: antialiased;
  }
  ::selection { background: var(--accent); color: var(--bg); }
  a { color: inherit; }

  .wrap { max-width: 1180px; margin: 0 auto; padding: 0 32px; }

  .top {
    border-bottom: 1px solid var(--line);
    background: var(--bg);
    position: sticky; top: 0; z-index: 30;
  }
  .top-inner {
    max-width: 1180px; margin: 0 auto;
    padding: 12px 32px;
    display: flex; align-items: center; gap: 24px;
    font-family: var(--mono); font-size: 11.5px; color: var(--muted);
  }
  .top .brand { color: var(--ink); font-weight: 600; letter-spacing: 0.04em; }
  .top .meta { margin-left: auto; display: flex; gap: 18px; }

  .hero { padding: 64px 0 32px; }
  .hero .label {
    font-family: var(--mono); font-size: 11px;
    color: var(--accent); letter-spacing: 0.18em; text-transform: uppercase;
    margin-bottom: 14px;
  }
  .hero h1 {
    font-family: var(--serif); font-weight: 400;
    font-size: clamp(48px, 6.5vw, 84px); line-height: 0.98;
    letter-spacing: -0.025em; margin: 0;
    text-wrap: balance; max-width: 18ch;
  }
  .hero h1 em { font-style: italic; color: var(--accent); }
  .hero .lede {
    font-family: var(--serif); font-size: 19px; line-height: 1.5;
    color: var(--muted); max-width: 56ch;
    margin: 22px 0 0; text-wrap: balance;
  }
  .hero .cta {
    display: inline-flex; align-items: center; gap: 12px;
    margin-top: 28px;
    padding: 12px 22px;
    font-family: var(--mono); font-size: 12px;
    letter-spacing: 0.16em; text-transform: uppercase;
    color: var(--accent);
    border: 1px solid var(--accent);
    background: transparent;
    text-decoration: none;
    border-radius: 2px;
    transition: background 0.15s ease, color 0.15s ease;
  }
  .hero .cta:hover { background: var(--accent); color: var(--bg); }
  .hero .cta .arrow { font-family: var(--serif); font-size: 15px; line-height: 1; }

  .hosts-strip {
    border-top: 1px solid var(--line);
    border-bottom: 1px solid var(--line);
    padding: 18px 0;
    display: flex; align-items: center; gap: 22px;
    font-family: var(--mono); font-size: 11px; color: var(--muted);
    margin-top: 40px;
  }
  .hosts-strip .lbl { color: var(--dim); text-transform: uppercase; letter-spacing: 0.18em; }
  .hosts-strip .names { display: flex; flex-wrap: wrap; gap: 18px; flex: 1; font-size: 13px; }
  .hosts-strip .names a {
    text-decoration: none; color: var(--ink);
    border: 1px solid var(--line); padding: 6px 12px;
    background: var(--paper); transition: all .15s ease;
  }
  .hosts-strip .names a:hover { color: var(--accent); border-color: var(--accent); }

  .yearnav-bar {
    position: sticky; top: 49px; z-index: 25;
    background: var(--bg); border-bottom: 1px solid var(--line);
  }
  .yearnav-inner {
    max-width: 1180px; margin: 0 auto;
    padding: 10px 32px;
    display: flex; align-items: center; gap: 16px;
    font-family: var(--mono); font-size: 11px; color: var(--muted);
  }
  .yearnav-inner .lbl { color: var(--dim); text-transform: uppercase; letter-spacing: 0.18em; }
  .yearnav-inner .links { display: flex; margin-left: auto; gap: 0; }
  .yearnav-inner .links a {
    text-decoration: none; padding: 6px 12px;
    color: var(--muted); border: 1px solid var(--line); border-right: none;
    transition: all .15s ease; font-size: 12px;
  }
  .yearnav-inner .links a:last-child { border-right: 1px solid var(--line); }
  .yearnav-inner .links a:hover { color: var(--ink); background: var(--paper); }
  .yearnav-inner .links a.current { background: var(--accent); color: var(--bg); border-color: var(--accent); font-weight: 600; }

  .archive { padding: 28px 0 96px; }
  .year { border-top: 1px solid var(--line); scroll-margin-top: 100px; }

  .year-head {
    display: grid;
    grid-template-columns: 200px 1fr auto 30px;
    column-gap: 24px; padding: 28px 0;
    align-items: baseline; cursor: pointer; user-select: none;
    transition: padding .15s ease;
  }
  .year-head:hover .chev { background: var(--ink); color: var(--bg); border-color: var(--ink); }

  .year-id .num {
    font-family: var(--serif); font-weight: 400;
    font-size: 56px; line-height: 0.9; letter-spacing: -0.025em;
    color: var(--ink);
  }
  .year[data-current="true"] .year-id .num { color: var(--accent); }
  .badge {
    font-family: var(--mono); font-size: 10px;
    text-transform: uppercase; letter-spacing: 0.18em;
    color: var(--muted); border: 1px solid var(--line);
    padding: 3px 8px;
  }
  .year[data-current="true"] .badge { color: var(--bg); background: var(--accent); border-color: var(--accent); }

  .year-info { font-family: var(--mono); font-size: 11px; color: var(--muted); line-height: 1.7; }
  .year-info .tag {
    font-family: var(--serif); font-style: italic;
    font-size: 16px; letter-spacing: 0;
    color: var(--ink); margin-bottom: 4px;
  }
  .year-info .supporters { display: inline-flex; flex-wrap: wrap; gap: 4px 10px; align-items: center; }
  .year-info .supporters .lbl { color: var(--dim); text-transform: uppercase; letter-spacing: 0.18em; }
  .year-info .supporters a {
    text-decoration: none; color: var(--ink);
    border-bottom: 1px solid var(--line); padding-bottom: 1px;
  }
  .year-info .supporters a:hover { color: var(--accent); border-bottom-color: var(--accent); }
  .year-info .supporters .sep { color: var(--dim); }

  .year-status {
    display: flex; flex-direction: column; align-items: flex-end;
    gap: 10px;
    font-family: var(--mono); font-size: 11px;
    text-transform: uppercase; letter-spacing: 0.16em;
    color: var(--muted);
  }
  .year-status .count { color: var(--ink); }
  .chev {
    width: 30px; height: 30px;
    border: 1px solid var(--line);
    display: grid; place-items: center;
    color: var(--ink); font-family: var(--mono);
    align-self: center;
    transition: transform .25s ease, background .15s ease, color .15s ease, border-color .15s ease;
  }
  .year[data-open="true"] .chev { transform: rotate(45deg); background: var(--accent); border-color: var(--accent); color: var(--bg); }

  .year-body { display: grid; grid-template-rows: 0fr; transition: grid-template-rows .35s ease; }
  .year[data-open="true"] .year-body { grid-template-rows: 1fr; }
  .year-body > .inner { overflow: hidden; }

  .session-list { padding-bottom: 24px; }
  .session {
    display: grid;
    grid-template-columns: 80px 110px 1fr 220px 30px;
    gap: 20px; padding: 16px 0;
    border-top: 1px solid var(--line-soft);
    align-items: baseline; cursor: pointer;
  }
  .session:first-child { border-top: 1px solid var(--line); }
  .session-id { font-family: var(--mono); font-size: 11px; color: var(--accent); align-self: start; padding-top: 4px; }
  .session-time { font-family: var(--mono); font-size: 13px; color: var(--ink); align-self: start; padding-top: 3px; }
  .session-main { min-width: 0; }
  .session-topic {
    font-family: var(--serif); font-style: italic;
    font-size: 16px; color: var(--accent);
    margin: 0 0 4px; line-height: 1.3;
  }
  .session-speaker {
    font-family: var(--sans); font-size: 19px; font-weight: 500;
    margin: 0; color: var(--ink); letter-spacing: -0.005em;
  }
  .session-affil {
    font-family: var(--mono); font-size: 11px; color: var(--muted);
    text-align: right; line-height: 1.45; align-self: start; padding-top: 6px;
  }
  .session-mark {
    font-family: var(--mono); text-align: center;
    color: var(--muted); align-self: start; padding-top: 4px;
    transition: color .15s ease, transform .25s ease;
  }
  .session:hover .session-mark { color: var(--accent); }
  .session[data-open="true"] .session-mark { color: var(--accent); transform: rotate(45deg); }

  .session-bio-wrap { display: grid; grid-template-rows: 0fr; transition: grid-template-rows .35s ease; }
  .session[data-open="true"] .session-bio-wrap { grid-template-rows: 1fr; }
  .session-bio-inner { overflow: hidden; }
  .session-bio {
    padding: 10px 0 4px;
    font-family: var(--serif); font-size: 16px; line-height: 1.6;
    color: var(--muted); margin: 0; max-width: 70ch;
    border-left: 2px solid var(--accent); padding-left: 16px;
  }

  .session.break {
    grid-template-columns: 80px 110px 1fr 30px;
    cursor: default; padding: 10px 0;
  }
  .session.break .session-id { color: var(--dim); }
  .session.break .session-speaker {
    font-family: var(--mono); font-size: 11px;
    text-transform: uppercase; letter-spacing: 0.24em; color: var(--muted);
  }
  .session.break .session-mark { display: none; }
  .session.remarks { cursor: default; }
  .session.remarks .session-mark { visibility: hidden; }

  footer {
    border-top: 1px solid var(--line);
    padding: 28px 32px;
    max-width: 1180px; margin: 0 auto;
    display: flex; justify-content: space-between; gap: 24px; flex-wrap: wrap;
    font-family: var(--mono); font-size: 11px; color: var(--muted);
  }
  footer .colophon {
    font-family: var(--serif); font-style: italic;
    font-size: 15px; color: var(--ink); max-width: 56ch;
  }

  @media (max-width: 800px) {
    .year-head { grid-template-columns: 1fr auto; gap: 12px; }
    .year-id { grid-column: 1; }
    .year-info { grid-column: 1 / -1; order: 3; }
    .year-status { grid-column: 1 / -1; order: 4; flex-direction: row; align-items: center; gap: 14px; }
    .chev { grid-column: 2; grid-row: 1; align-self: start; }
    .session { grid-template-columns: 60px 90px 1fr 26px; gap: 12px; }
    .session-affil { display: none; }
  }`;

// ---------- inline behaviour script (no data dependency) ----------
const RUNTIME = `
  // Year nav: highlight on click
  const links = document.querySelectorAll('#year-links a');
  links.forEach(a => a.addEventListener('click', () => {
    links.forEach(x => x.classList.remove('current'));
    a.classList.add('current');
  }));
  // Year accordion
  document.querySelectorAll('.year').forEach(y => {
    y.querySelector('.year-head').addEventListener('click', () => {
      y.dataset.open = y.dataset.open === 'true' ? 'false' : 'true';
    });
  });
  // Session accordion (talks only)
  document.querySelectorAll('.session.talk').forEach(s => {
    s.addEventListener('click', () => {
      s.dataset.open = s.dataset.open === 'true' ? 'false' : 'true';
    });
  });`;

// ---------- assemble ----------
const { site, hosts, years } = data;

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(site.title)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Serif:ital,wght@0,400;0,500;1,400&family=IBM+Plex+Sans:wght@400;500;600&display=swap" rel="stylesheet">
<style>${STYLES}
</style>
</head>
<body>

<div class="top">
  <div class="top-inner">
    <span class="brand">${esc(site.brand)}</span>
    <span>${esc(site.version)} · ${site.current_year}</span>
    <div class="meta">
      <span>updated ${esc(site.updated)}</span>
      <span>${esc(site.city)}</span>
    </div>
  </div>
</div>

<header class="wrap hero">
  <div class="label">${esc(site.hero.label)}</div>
  <h1>${escAllowEm(site.hero.headline)}</h1>
  <p class="lede">${escAllowEm(site.hero.lede)}</p>
  ${site.hero.cta ? `<a class="cta" href="${esc(site.hero.cta.url)}" target="_blank" rel="noopener">${esc(site.hero.cta.label)} <span class="arrow">→</span></a>` : ''}
</header>

<section class="wrap hosts-strip" id="hosts">
  <span class="lbl">Hosted by ${site.current_year} →</span>
  <div class="names">
    ${renderHostsStrip(hosts)}
  </div>
</section>

<div class="yearnav-bar" id="archives">
  <div class="yearnav-inner">
    <span class="lbl">Index</span>
    <div class="links" id="year-links">${renderYearLinks(years, site.current_year)}</div>
  </div>
</div>

<main class="wrap archive" id="archive">
${years.map(y => renderYear(y, site.current_year)).join('\n\n')}
</main>

<footer>
  <p class="colophon">${esc(site.colophon)}</p>
  <span>${esc(site.year_range)}</span>
</footer>

<script>
${RUNTIME}
</script>
</body>
</html>
`;

// ---------- write ----------
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, html, 'utf8');

const talkTotal = years.reduce((n, y) => n + y.sessions.filter(s => s.kind === 'talk').length, 0);
console.log(`✓ wrote ${outPath}`);
console.log(`  ${years.length} years · ${talkTotal} talks · ${(html.length / 1024).toFixed(1)} kB`);

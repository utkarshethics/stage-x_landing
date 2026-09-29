#!/usr/bin/env node
/**
 * Normalise and enrich the Stage-X.Space page set into one interlinked
 * Schema.org entity graph.
 *
 * Three problems this fixes:
 *  1. No node carried an @id, so Organization/WebSite/Event were anonymous and
 *     could not be referenced or merged across pages.
 *  2. Some pages declared a non-www canonical while the rest declared www.
 *     Both hosts return 200, so nothing but the canonical told them apart.
 *  3. The 9 events/*.html pages are noindex redirect stubs into summits/, and
 *     were sitting in the sitemap. They are removed from the sitemap and
 *     given no schema, so each summit entity has exactly one canonical URL.
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';

const ORIGIN = 'https://www.stage-x.space';
const LOGO = `${ORIGIN}/public/logo.png`;
const LD = /<script[^>]*type="application\/ld\+json"[^>]*>[\s\S]*?<\/script>\s*/g;

const slug = (s) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/** Page-independent entities. Same @id on every page, so they merge. */
const globals = () => [
  {
    '@type': 'Organization',
    '@id': `${ORIGIN}/#organization`,
    name: 'Stage-X.Space',
    url: `${ORIGIN}/`,
    logo: { '@id': `${ORIGIN}/#logo` },
    image: { '@id': `${ORIGIN}/#logo` },
    description:
      'Forward Deployed Engineering - bridging research labs and operational reality. Embedding, integrating, and optimising frontier AI systems inside existing infrastructure.',
  },
  {
    '@type': 'ImageObject',
    '@id': `${ORIGIN}/#logo`,
    url: LOGO,
    contentUrl: LOGO,
    caption: 'Stage-X.Space',
  },
  {
    '@type': 'WebSite',
    '@id': `${ORIGIN}/#website`,
    url: `${ORIGIN}/`,
    name: 'Stage-X.Space',
    inLanguage: 'en',
    publisher: { '@id': `${ORIGIN}/#organization` },
  },
];

const read = (f) => readFileSync(resolve(process.cwd(), f), 'utf8');
const meta = (html, re) => (html.match(re) || [])[1]?.trim() || null;
const decode = (s) =>
  s ? s.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>') : s;

/** Force every canonical and og:url onto the www origin. */
function normaliseUrls(html) {
  return html
    .replace(/(<link[^>]*rel="canonical"[^>]*href=")https:\/\/(www\.)?stage-x\.space/g, `$1${ORIGIN}`)
    .replace(/(<meta[^>]*property="og:url"[^>]*content=")https:\/\/(www\.)?stage-x\.space/g, `$1${ORIGIN}`)
    .replace(/(<meta[^>]*property="og:image"[^>]*content=")https:\/\/(www\.)?stage-x\.space/g, `$1${ORIGIN}`)
    .replace(/(<meta[^>]*name="twitter:image"[^>]*content=")https:\/\/(www\.)?stage-x\.space/g, `$1${ORIGIN}`);
}

function inject(html, graph) {
  const body = html.replace(LD, '');
  const block = `<script type="application/ld+json">\n${JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }, null, 2)}\n</script>\n`;
  return body.includes('</head>')
    ? body.replace('</head>', `${block}</head>`)
    : block + body;
}

function pageNodes({ path, type, name, description, extra = {} }) {
  const url = `${ORIGIN}${path}`;
  const trail = [{ name: 'Home', url: `${ORIGIN}/` }];
  const seg = path.split('/').filter(Boolean);
  if (seg.length > 1) trail.push({ name: seg[0][0].toUpperCase() + seg[0].slice(1), url: `${ORIGIN}/${seg[0]}/` });
  trail.push({ name, url });

  return [
    {
      '@type': 'WebPage',
      '@id': `${url}#webpage`,
      url,
      name,
      description,
      isPartOf: { '@id': `${ORIGIN}/#website` },
      about: { '@id': `${ORIGIN}/#organization` },
      breadcrumb: { '@id': `${url}#breadcrumb` },
      inLanguage: 'en',
      ...extra,
    },
    {
      '@type': 'BreadcrumbList',
      '@id': `${url}#breadcrumb`,
      itemListElement: trail.map((c, i) => ({
        '@type': 'ListItem', position: i + 1, name: c.name, item: c.url,
      })),
    },
  ];
}

// ---------------------------------------------------------------- summits
// Venue/date data is read from the Event block already in the page, so the
// enriched graph reuses the real values instead of restating them by hand.
const summitFiles = readdirSync('summits').filter((f) => f.endsWith('.html')).sort();
const summitEntities = [];

for (const f of summitFiles) {
  const path = `/summits/${f}`;
  const url = `${ORIGIN}${path}`;
  const raw = read(`summits/${f}`).match(LD)?.[0] || '';
  let old = {};
  try { old = JSON.parse(raw.replace(/<[^>]+>/g, '')); } catch { /* no prior block */ }
  const html = read(`summits/${f}`);

  const name = old.name || decode(meta(html, /<title>([^<]*)<\/title>/)) || f;
  const description = old.description || meta(html, /<meta name="description" content="([^"]*)"/) || '';

  const venue = old.location || { '@type': 'Place', name: 'To be announced' };
  const venueId = `${url}#venue`;

  summitEntities.push({ file: `summits/${f}`, url, name, path });

  const graph = [
    ...globals(),
    {
      '@type': 'Event',
      '@id': `${url}#event`,
      name,
      description,
      url,
      startDate: old.startDate,
      endDate: old.endDate,
      eventAttendanceMode: old.eventAttendanceMode || 'https://schema.org/OfflineEventAttendanceMode',
      eventStatus: old.eventStatus || 'https://schema.org/EventScheduled',
      isAccessibleForFree: old.isAccessibleForFree ?? false,
      location: { '@id': venueId },
      organizer: { '@id': `${ORIGIN}/#organization` },
      mainEntityOfPage: { '@id': `${url}#webpage` },
    },
    { ...venue, '@id': venueId },
    ...pageNodes({ path, type: 'Event', name, description, extra: {} }),
  ];

  writeFileSync(`summits/${f}`, inject(normaliseUrls(html), graph));
}
console.log(`  summits: ${summitFiles.length} Event entities`);

// ----------------------------------------------------------------- papers
// No author or publication date is published on these pages, so the graph
// declares no author or date rather than inventing them.
const paperDir = 'papers/posts';
const paperFiles = readdirSync(paperDir).filter((f) => f.endsWith('.html')).sort();
const paperEntities = [];

for (const f of paperFiles) {
  const path = `/${paperDir}/${f}`;
  const url = `${ORIGIN}${path}`;
  const html = read(`${paperDir}/${f}`);

  const name = decode(meta(html, /<meta property="og:title" content="([^"]*)"/))
    || decode(meta(html, /<title>([^<]*)<\/title>/)) || f;
  const description = decode(meta(html, /<meta name="description" content="([^"]*)"/)) || '';

  paperEntities.push({ file: `${paperDir}/${f}`, url, name, path });

  const graph = [
    ...globals(),
    {
      '@type': 'TechArticle',
      '@id': `${url}#article`,
      headline: name,
      description,
      url,
      inLanguage: 'en',
      publisher: { '@id': `${ORIGIN}/#organization` },
      isPartOf: { '@id': `${ORIGIN}/#website` },
      mainEntityOfPage: { '@id': `${url}#webpage` },
    },
    ...pageNodes({ path, type: 'CollectionPage', name, description }),
  ];

  writeFileSync(`${paperDir}/${f}`, inject(normaliseUrls(html), graph));
}
console.log(`  papers: ${paperFiles.length} TechArticle entities (no author/date invented)`);

// --------------------------------------------------------- landing pages
const landings = [
  {
    file: 'index.html', path: '/', type: 'WebPage',
    name: 'Stage-X.Space - Forward Deployed Engineering',
    description: 'Forward deployed engineering - bridging research labs and operational reality.',
  },
  {
    file: 'summits.html', path: '/summits.html', type: 'CollectionPage',
    name: 'Stage-X Summits',
    description: 'Closed-door technical roundtables for infrastructure leaders.',
    list: summitEntities,
    listId: `${ORIGIN}/summits.html#summitlist`,
    listName: 'Stage-X Summit 2026 events',
  },
  {
    file: 'papers.html', path: '/papers.html', type: 'CollectionPage',
    name: 'Papers',
    description: 'Technical papers and field audits from Stage-X.Space.',
    list: paperEntities,
    listId: `${ORIGIN}/papers.html#paperlist`,
    listName: 'Stage-X technical papers',
  },
];

for (const p of landings) {
  const url = `${ORIGIN}${p.path}`;
  const extra = {};
  const before = [];
  if (p.list) {
    extra.mainEntity = { '@id': p.listId };
    before.push({
      '@type': 'ItemList',
      '@id': p.listId,
      name: p.listName,
      numberOfItems: p.list.length,
      itemListElement: p.list.map((e, i) => ({
        '@type': 'ListItem', position: i + 1, name: e.name, url: e.url,
      })),
    });
  }
  const graph = [
    ...globals(),
    ...before,
    ...pageNodes({ path: p.path, type: p.type, name: p.name, description: p.description, extra }),
  ];
  writeFileSync(p.file, inject(normaliseUrls(read(p.file)), graph));
  console.log(`  ${p.file}: ${graph.length} nodes${p.list ? ` (ItemList of ${p.list.length})` : ''}`);
}

// ---------------------------------------------------------------- sitemap
// The events/ stubs are noindex redirects into summits/. Keeping them listed
// would advertise redirect URLs as canonical content.
const smPath = resolve(process.cwd(), 'sitemap.xml');
const sm = readFileSync(smPath, 'utf8');
// Filter entry-by-entry. A regex spanning <url>.../events/...</url> would
// lazily consume everything from the first entry up to the first /events/,
// wiping unrelated pages.
const entries = sm.match(/<url>[\s\S]*?<\/url>/g) || [];
const keptEntries = entries.filter((e) => !e.includes('/events/'));
const removed = entries.length - keptEntries.length;
// Strip trailing whitespace from the header, otherwise the indent written
// before the first <url> is absorbed into the header and the whole file
// drifts two spaces further right on every run.
const header = sm.slice(0, sm.indexOf('<url>')).replace(/\s+$/, '\n');
const dedented = keptEntries.map((e) => e.replace(/^\s*/, ''));
writeFileSync(smPath, `${header}  ${dedented.join('\n  ')}\n</urlset>\n`);
console.log(`  sitemap.xml: removed ${removed} noindex redirect URLs -> ${keptEntries.length} entries`);

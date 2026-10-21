#!/usr/bin/env node
/**
 * Assemble the exact set of files Cloudflare Pages publishes for stage-x.space.
 *
 * The project is Git-connected with no build command, so Pages served the
 * repository root verbatim. That published AGENTS.md and deploy.sh alongside
 * the site. An allowlist is used so anything added to the root later - a
 * secret, a config file, an editor artefact - is not published by accident.
 */
import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';

const ROOT = resolve(process.cwd());
const OUT = resolve(ROOT, 'dist/site');

/** Directories published verbatim. None of them contain internal files. */
const PUBLISH_DIRS = ['events', 'papers', 'public', 'summits', 'briefs'];

/** Individual root files published verbatim, on top of every root *.html. */
const PUBLISH_FILES = [
  'robots.txt',
  'sitemap.xml',
  'llms.txt',
  'ontology.json',
  '_redirects',
  '_headers',
  // Cloudflare domain-verification file; must stay reachable at the root.
  '81e649f8-dfca-431a-8852-f157b8a1c48c.txt',
];

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

const copied = [];

for (const dir of PUBLISH_DIRS) {
  const from = join(ROOT, dir);
  if (!existsSync(from)) continue;
  cpSync(from, join(OUT, dir), { recursive: true });
  copied.push(`${dir}/ (${countFiles(from)} files)`);
}

for (const entry of readdirSync(ROOT)) {
  if (!entry.endsWith('.html')) continue;
  cpSync(join(ROOT, entry), join(OUT, entry));
  copied.push(entry);
}

for (const file of PUBLISH_FILES) {
  const from = join(ROOT, file);
  if (!existsSync(from)) {
    console.warn(`  skip (missing): ${file}`);
    continue;
  }
  cpSync(from, join(OUT, file));
  copied.push(file);
}

console.log(`staged -> ${OUT}`);
for (const c of copied) console.log(`  + ${c}`);

// Guard: the staged tree must never contain a dotfile, a .md or a shell script.
const strays = [];
(function walk(dir, prefix = '') {
  for (const entry of readdirSync(dir)) {
    const abs = join(dir, entry);
    const rel = prefix ? `${prefix}/${entry}` : entry;
    if (statSync(abs).isDirectory()) walk(abs, rel);
    else if (entry.startsWith('.') || /\.(md|sh|py)$/i.test(entry)) strays.push(rel);
  }
})(OUT);

if (strays.length) {
  console.error(`\nREFUSING TO DEPLOY - staged tree contains non-public files:\n  ${strays.join('\n  ')}`);
  process.exit(1);
}

console.log(`\nverify: ${countFiles(OUT)} files staged, no dotfiles, no .md, no .sh`);

function countFiles(dir) {
  let n = 0;
  for (const entry of readdirSync(dir)) {
    const abs = join(dir, entry);
    n += statSync(abs).isDirectory() ? countFiles(abs) : 1;
  }
  return n;
}

/**
 * Does the CyberFoil editor still decide what CyberFoil decides?
 *
 * The editor's checks and preview stand on a JS port of CyberFoil's theme
 * loader (source/util/theme.cpp in luketanti/CyberFoil). This runs that port
 * over every case in cyberfoil/cases.json and requires, line for line, what the
 * C++ printed for the same cases: which files the picker lists and in what
 * order, what each is called, which colours parse, which images survive, what
 * every unset role and every hard-coded UI colour resolves to, and what the
 * background ends up as with OLED mode on and off.
 *
 * cyberfoil/reference.txt is that C++ output; cyberfoil/dump_theme.cpp says
 * how to regenerate it from a CyberFoil checkout. A diff in it is the
 * notification that the editor needs the same change.
 *
 *     node tests/check-cyberfoil.mjs
 *
 * Needs playwright (npm i -D playwright) and a Chromium it can launch.
 */
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const PORT = 8792;
const cases = JSON.parse(readFileSync(path.join(here, 'cyberfoil', 'cases.json'), 'utf8'));

const srv = spawn('python3', ['-m', 'http.server', String(PORT), '--bind', '127.0.0.1'],
                  {cwd: root, stdio: 'ignore'});
await new Promise(r => setTimeout(r, 900));

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || undefined,
  args: ['--no-sandbox'],
});
const page = await browser.newPage();
const errors = [];
page.on('pageerror', e => errors.push(e.message));
await page.goto(`http://127.0.0.1:${PORT}/cyberfoil-theme-editor.html`, {waitUntil: 'networkidle'});

const got = await page.evaluate((cases) => {
  /* The same tree dump_theme.cpp writes to disk, as the port's vfs. */
  const vfs = new Map();
  const size = s => new TextEncoder().encode(s).length;
  for (const [name, spec] of Object.entries(cases.tree)){
    let e;
    if ('json' in spec){ const t = JSON.stringify(spec.json); e = {size: size(t), text: t, image: null}; }
    else if ('text' in spec){ e = {size: size(spec.text), text: spec.text, image: null}; }
    else if ('head' in spec){
      const t = spec.head + 'x'.repeat(spec.size - size(spec.head) - size(spec.tail)) + spec.tail;
      e = {size: spec.size, text: t, image: null};
    }
    else if ('bytes' in spec){ e = {size: spec.bytes, text: 'q'.repeat(spec.bytes), image: null}; }
    else { e = {size: spec.size || 40, image: {w: spec.png[0], h: spec.png[1]}}; }
    vfs.set(name, e);
  }
  const rgba = c => `${c.r},${c.g},${c.b},${c.a}`;
  const rel = p => /^(theme\/|background\.png$)/.test(p) ? '$APP/' + p : p;
  const b = v => (v ? 1 : 0);
  const out = [];

  for (const name of Object.keys(cases.tree).sort(cfCompare)){
    const r = cfReadManifest(vfs, name);
    out.push(`R|${name}|${b(r)}|${r ? cfManifestName(r, '<stem>') : ''}`);
  }
  for (const f of cases.loads) out.push(`V|${f}|${b(cfValidManifestPath(f))}`);
  cfDiscover(vfs).forEach((c, i) => out.push(`D|${i}|${c.file}|${c.name}`));

  for (const f of cases.loads){
    const st = cfLoad(vfs, f);
    const colors = [...st.colors.keys()].sort(cfCompare).map(k => `${k}=${rgba(st.colors.get(k))};`).join('');
    const images = [...st.images.keys()].sort(cfCompare).map(k => `${k}=${rel(st.images.get(k))};`).join('');
    out.push(`L|${f}|${st.name}|${b(st.noBg)}|${colors}|${images}`);
    for (const k of cases.colorKeys)
      out.push(`C|${f}|${k}|${b(st.colors.has(k))}|${rgba(cfColor(st, k, {r:1, g:2, b:3, a:4}))}`);
    for (const role of cases.roles) for (const fb of cases.fallbacks)
      out.push(`K|${f}|${role}|${fb}|${rgba(cfColor(st, role, cfFromHex(fb)))}`);
    for (const hex of cases.palette) out.push(`T|${f}|${hex}|${rgba(cfPalette(st, hex))}`);
    for (const a of cases.assets) out.push(`A|${f}|${a}|${rel(cfAsset(st, a))}`);
    for (const legacy of [0, 1]) for (const oled of [0, 1]){
      const bg = cfApplyBackground(st, !!oled, !!legacy);
      out.push(`B|${f}|${oled}|${legacy}|${rgba(bg.color)}|${rel(bg.image)}`);
    }
  }
  return out;
}, cases);

await browser.close();
srv.kill();

const ref = readFileSync(path.join(here, 'cyberfoil', 'reference.txt'), 'utf8').trim().split('\n');
let bad = 0;
if (ref.length !== got.length) console.error(`row count differs: reference ${ref.length}, editor ${got.length}`);
for (let i = 0; i < Math.max(ref.length, got.length); i++){
  if (ref[i] === got[i]) continue;
  if (++bad <= 12) console.error(`row ${i + 1}\n  C++:    ${ref[i]}\n  editor: ${got[i]}`);
}
if (errors.length) console.error('page errors:\n  ' + errors.join('\n  '));
if (bad || errors.length || ref.length !== got.length){
  console.error(`\nFAIL: ${bad} of ${ref.length} rows differ from CyberFoil's own loader.`);
  process.exit(1);
}
console.log(`OK: all ${ref.length} rows match CyberFoil's theme.cpp (${cases.loads.length} themes loaded, ` +
            `${Object.keys(cases.tree).length} files).`);

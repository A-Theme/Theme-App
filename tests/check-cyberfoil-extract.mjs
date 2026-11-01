/**
 * Palette from an image, in the CyberFoil editor.
 *
 * The flow is the Tinfoil editor's: extract swatches from the background (or
 * any local image), show them, and "Use this palette" turns them into the 11
 * CyberFoil roles - through rommColors(), the same mapping the presets take.
 * This proves:
 *
 *   - extraction is deterministic: the same image gives the same swatches
 *   - the dominant colours of a known image are found
 *   - the extract button follows the Background panel
 *   - both entry points (background, local file) show swatches, and "Use this
 *     palette" writes all 11 roles
 *   - a pale image gives a light palette, a dark one a dark palette
 *   - across a spread of generated images, used as the theme's own wallpaper,
 *     no extracted palette trips a readability error
 *
 *     node tests/check-cyberfoil-extract.mjs
 */
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PORT = 8794;
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
page.on('dialog', d => d.accept());
await page.goto(`http://127.0.0.1:${PORT}/cyberfoil-theme-editor.html`, {waitUntil: 'domcontentloaded'});
await page.waitForFunction(() => typeof view === 'object' && view !== null);

const results = await page.evaluate(async () => {
  const out = [];
  const check = (ok, what, detail) => out.push({ok: !!ok, what, detail: detail === undefined ? '' : JSON.stringify(detail)});
  const tick = () => new Promise(r => setTimeout(r, 60));
  const until = async (f, ms = 3000) => { const t0 = Date.now(); while (!f() && Date.now() - t0 < ms) await tick(); return f(); };

  /* A scene: a sky, ground, a sun and a block, in the given colours. */
  const scene = (sky, ground, sun, block) => {
    const cv = document.createElement('canvas'); cv.width = 1280; cv.height = 720;
    const c = cv.getContext('2d');
    c.fillStyle = sky; c.fillRect(0, 0, 1280, 720);
    c.fillStyle = ground; c.fillRect(0, 450, 1280, 270);
    c.fillStyle = sun; c.beginPath(); c.arc(1000, 180, 100, 0, 7); c.fill();
    c.fillStyle = block; c.fillRect(100, 300, 300, 150);
    return cv.toDataURL('image/png');
  };
  const dist = (a, b) => Math.hypot(a.r - b.r, a.g - b.g, a.b - b.b);

  /* ---- extraction ---- */
  const dark = scene('rgb(12,18,40)', 'rgb(20,60,50)', 'rgb(255,140,30)', 'rgb(70,40,110)');
  const a = await extractPalette(dark, 6), b = await extractPalette(dark, 6);
  check(JSON.stringify(a) === JSON.stringify(b), 'the same image gives the same swatches', a.map(x => toHex(x.c)));
  check(dist(a[0].c, {r:12, g:18, b:40}) < 6, 'the largest swatch is the sky', toHex(a[0].c));
  for (const [name, want] of [['ground', {r:20, g:60, b:50}], ['sun', {r:255, g:140, b:30}], ['block', {r:70, g:40, b:110}]])
    check(a.some(x => dist(x.c, want) < 12), `the ${name} is among the swatches`, a.map(x => toHex(x.c)));
  const flat = scene('#336699', '#336699', '#336699', '#336699');
  const f = await extractPalette(flat, 6);
  check(f.length === 1, 'a one-colour image gives one swatch, not six copies', f.map(x => toHex(x.c)));

  /* ---- the button follows the Background panel ---- */
  resetState(); render();
  check($('extractBtn').disabled, 'with no wallpaper, extract is disabled');
  state.bg = Object.assign(state.bg, await assetFromDataUrl('dark.png', dark), {mode: 'image'});
  render();
  check(!$('extractBtn').disabled, 'with a wallpaper, extract is enabled');
  check($('extractInfo').textContent.includes('dark.png'), 'and the row names the image', $('extractInfo').textContent);
  state.bg.mode = 'builtin'; render();
  check($('extractBtn').disabled, 'switching back to CyberFoil\'s own wallpaper disables it');
  state.bg.mode = 'image'; render();

  /* ---- from the background, then Use this palette ---- */
  check($('extractApplyRow').hidden, 'no swatches until something is extracted');
  $('extractBtn').click();
  await until(() => !$('extractApplyRow').hidden);
  check($('extractedSwatches').children.length === 6, 'extracting the background shows its swatches',
        $('extractedSwatches').children.length);
  check(!$('extractBtn').disabled && !/Extracting/.test($('extractBtn').textContent), 'and the button comes back');
  $('useExtractedBtn').click();
  check(ROLE_KEYS.every(k => parseHex(state.colors[k])), 'Use this palette sets all 11 roles', state.colors);
  check(luminance(parseHex(state.colors.panel)) < 0.1, 'a dark image gives a dark palette', state.colors.panel);
  check(dist(parseHex(state.colors.accent), {r:255, g:140, b:30}) < 60, 'the sun becomes the accent', state.colors.accent);

  /* ---- from a local file ---- */
  const light = scene('rgb(236,228,210)', 'rgb(200,190,170)', 'rgb(40,120,200)', 'rgb(220,210,190)');
  const blob = await (await fetch(light)).blob();
  const dt = new DataTransfer(); dt.items.add(new File([blob], 'pale.png', {type: 'image/png'}));
  $('extractFile').files = dt.files;
  $('extractFile').dispatchEvent(new Event('change'));
  await until(() => /pale\.png/.test($('extractNote').textContent));
  check(/pale\.png/.test($('extractNote').textContent), 'a browsed image is credited by name', $('extractNote').textContent);
  $('useExtractedBtn').click();
  check(luminance(parseHex(state.colors.panel)) > 0.5, 'a pale image gives a light palette', state.colors.panel);
  check(contrast(parseHex(state.colors.text), parseHex(state.colors.panel)) >= 4.5, 'with dark text that reads on it',
        [state.colors.text, state.colors.panel]);

  /* ---- readability, over a spread of images used as their own wallpaper ---- */
  let seed = 7;
  const rnd = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;
  const col = (lo, hi) => `rgb(${[0,1,2].map(() => Math.round(lo + rnd() * (hi - lo))).join(',')})`;
  const kinds = [[0, 70], [0, 255], [150, 255], [60, 190]];
  let clean = 0, total = 0; const bad = [];
  for (let i = 0; i < 24; i++){
    const [lo, hi] = kinds[i % kinds.length];
    const img = scene(col(lo, hi), col(lo, hi), col(0, 255), col(lo, hi));
    state.bg = Object.assign(state.bg, await assetFromDataUrl(`probe${i}.png`, img), {mode: 'image', dim: 0});
    state.colors = rommColors(paletteFromSwatches(await extractPalette(img, 6)));
    render();
    await new Promise(r => setTimeout(r, 120));   /* the wallpaper sample lands */
    render();
    const errs = [...document.querySelectorAll('#findings .tag.err')].map(t => t.parentNode.textContent);
    total++; if (!errs.length) clean++; else bad.push({i, errs});
  }
  check(clean === total, `${clean}/${total} extracted palettes have no readability errors`, bad);
  return out;
});

let failed = 0;
for (const r of results){
  console.log(`${r.ok ? 'ok  ' : 'FAIL'} ${r.what}${r.ok || !r.detail ? '' : '  ' + r.detail}`);
  if (!r.ok) failed++;
}
for (const e of errors){ console.log('FAIL page error: ' + e); failed++; }
await browser.close();
srv.kill();
console.log(failed ? `${failed} check(s) FAILED` : `OK: ${results.length} checks passed`);
process.exit(failed ? 1 : 0);

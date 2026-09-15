/**
 * Does the per-role alpha slider behave?
 *
 * Every role takes alpha in this client - the renderer blends all of them, not
 * just `scrim` - so every colour row carries a slider. The failures worth
 * guarding are all quiet ones: a slider that writes `#RRGGBBFF` at full opacity
 * would mark all 19 roles as changed against their 6-digit defaults and bloat
 * every exported theme.json; a colour picker that dropped the alpha would
 * silently make a translucent surface opaque the first time someone nudged the
 * hue.
 *
 *     node tests/check-color-alpha.mjs
 *
 * Needs playwright (npm i -D playwright) and a Chromium it can launch.
 */
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const PORT = 8793;

const srv = spawn('python3', ['-m', 'http.server', String(PORT), '--bind', '127.0.0.1'],
                  {cwd: root, stdio: 'ignore'});
await new Promise(r => setTimeout(r, 900));

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || undefined,
  args: ['--no-sandbox'],
});
const page = await browser.newPage();
const pageErrors = [];
page.on('pageerror', e => pageErrors.push(e.message));
await page.goto(`http://127.0.0.1:${PORT}/romm-theme-editor.html`, {waitUntil: 'networkidle'});

const results = await page.evaluate(() => {
  const out = [];
  const check = (ok, name, detail) => out.push({ok, name, detail});

  const rows = [...document.querySelectorAll('.crow')];
  check(rows.length === 19 && rows.every(r => r.querySelector('input.alpha')),
        'every one of the 19 roles has an alpha slider',
        `${rows.filter(r => r.querySelector('input.alpha')).length} of ${rows.length}`);

  const row = document.querySelector('.crow[data-role="surface_raised"]');
  const slider = row.querySelector('input.alpha');
  const hex = row.querySelector('input.hex');
  const drag = v => { slider.value = v; slider.dispatchEvent(new Event('input', {bubbles:true})); };

  drag(180);
  check(state.colors.surface_raised.toUpperCase().endsWith('B4') && hex.value === state.colors.surface_raised,
        'dragging writes the alpha into state and the hex box', hex.value);
  check(row.classList.contains('changed'), 'a translucent role counts as changed');
  check(/opacity 71%/.test(slider.title), 'the slider reports opacity as a percentage', slider.title);

  drag(255);
  check(hex.value.length === 7 && !row.classList.contains('changed'),
        'full opacity writes 6 digits, not #RRGGBBFF, so the role is unchanged', hex.value);

  drag(0);
  check(hex.value.toUpperCase().endsWith('00'), 'fully transparent is expressible', hex.value);

  row.querySelector('.reset').click();
  check(hex.value === '#281B18' && row.querySelector('input.alpha').value === '255',
        'reset restores the built-in colour and puts the slider back to opaque',
        `${hex.value} / ${row.querySelector('input.alpha').value}`);

  /* Picking a hue must not silently make a translucent surface opaque. */
  drag(100);
  const picker = row.querySelector('input[type=color]');
  picker.value = '#00ff00';
  picker.dispatchEvent(new Event('input', {bubbles:true}));
  check(hex.value.toUpperCase() === '#00FF0064',
        'the colour picker keeps the alpha the role already had', hex.value);

  /* And it has to survive the round trip the client actually reads. */
  state.colors.surface = '#150D0AB8';
  const written = JSON.parse(JSON.stringify(buildTheme())).colors.surface;
  check(written === '#150D0AB8', 'alpha survives into theme.json', String(written));

  return out;
});

await browser.close();
srv.kill();

let failed = 0;
for (const r of results){
  if (!r.ok) failed++;
  console.log(`${r.ok ? 'ok  ' : 'FAIL'} ${r.name}${r.detail ? `  [${r.detail}]` : ''}`);
}
if (pageErrors.length){
  failed += pageErrors.length;
  console.error('page errors:\n  ' + pageErrors.join('\n  '));
}
console.log(failed ? `FAILED: ${failed} of ${results.length}` : `OK: ${results.length} checks passed`);
process.exit(failed ? 1 : 0);

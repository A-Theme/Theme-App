/**
 * Does the editor actually DRAW the focus effect, and stay inside its budget?
 *
 * check-effects.mjs proves the maths matches the client's bit for bit. That is
 * necessary but not sufficient: correct numbers that never reach the canvas, an
 * overlay that paints over a neighbouring card, or a 60fps loop left running on
 * a still theme are all failures the arithmetic test cannot see. So this one
 * looks at the pixels.
 *
 *     node tests/check-effect-preview.mjs
 *
 * Needs playwright (npm i -D playwright) and a Chromium it can launch.
 */
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const PORT = 8792;

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

  /* Every pixel the overlay put down, and the box they occupy. */
  const painted = () => {
    const d = sfxCtx.getImageData(0, 0, 1280, 720).data;
    let n = 0, minx = 1e9, miny = 1e9, maxx = -1e9, maxy = -1e9;
    for (let i = 3; i < d.length; i += 4){
      if (!d[i]) continue;
      n++;
      const px = ((i - 3) / 4) % 1280, py = Math.trunc(((i - 3) / 4) / 1280);
      if (px < minx) minx = px;
      if (px > maxx) maxx = px;
      if (py < miny) miny = py;
      if (py > maxy) maxy = py;
    }
    return {n, minx, miny, maxx, maxy};
  };
  const draw = (kind, ms, amount = 70, screen = 'library') => {
    state.screen = screen;
    state.effect = {kind, speed: 1, amount, color: 'accent'};
    render();
    motionClockMs = ms;
    drawFocusEffect(ms);
    return painted();
  };

  /* 1. Every kind reaches the canvas, at every clock. A kind that draws
        nothing at some timestamp is a kind an author cannot judge. */
  for (const kind of ['smoke','embers','glow','shimmer','pulse','fade']){
    const counts = [0, 400, 800, 1500, 2100, 9000].map(ms => draw(kind, ms).n);
    check(counts.every(n => n > 0), `${kind} draws at every clock`, counts.join(', '));
  }

  /* 2. Off means off. */
  check(draw('none', 800).n === 0, 'kind "none" draws nothing');
  check(draw('smoke', 800, 0).n === 0, 'amount 0 draws nothing');

  /* 3. Nothing escapes the element plus the client's bleed budget - the whole
        point of kEffectBleed is that a caller can clip to it and lose nothing,
        and a preview that scribbled wider would be showing a lie. */
  for (const kind of ['smoke','embers','glow','shimmer','pulse','fade']){
    state.effect = {kind, speed: 1, amount: 100, color: 'accent'};
    render();
    const t = focusTarget();
    let worst = -1e9, at = 0;
    for (let ms = 0; ms < 6000; ms += 97){
      const b = draw(kind, ms, 100);
      if (!b.n) continue;
      const over = Math.max(t.x - EFFECT_BLEED - b.minx, t.y - EFFECT_BLEED - b.miny,
                            b.maxx - (t.x + t.w + EFFECT_BLEED),
                            b.maxy - (t.y + t.h + EFFECT_BLEED));
      if (over > worst){ worst = over; at = ms; }
    }
    check(worst <= 0, `${kind} stays inside the ${EFFECT_BLEED}px bleed budget`,
          `worst ${worst}px at ms=${at}`);
  }

  /* 4. Each screen puts the effect where the client puts focus - and a dialog
        takes it from the library it covers. */
  const targets = {};
  for (const screen of ['library','detail','modal','splash']){
    state.screen = screen;
    state.effect = {kind:'glow', speed:1, amount:70, color:'accent'};
    render();
    const t = focusTarget();
    targets[screen] = t ? `${t.x},${t.y} ${t.w}x${t.h}` : null;
  }
  check(targets.library && targets.detail && targets.modal,
        'library, detail and dialog each have a focus target',
        JSON.stringify(targets));
  check(targets.modal !== targets.library,
        'the dialog takes focus from the library behind it', targets.modal);
  check(targets.splash === null,
        'the splash has no focus target, so nothing is drawn there');

  /* 5. The 60fps loop runs only while something moves. */
  state.bg = {name:'', dataUrl:'', dim:0};
  state.motion = {kind:'none', speed:1, amount:24};
  const loopFor = kind => {
    state.effect = {kind, speed:1, amount:70, color:''};
    render();
    return motionRaf !== 0;
  };
  check(loopFor('glow'),  'a moving effect runs the loop with no background');
  check(!loopFor('fade'), 'fade is steady, so it holds no 60fps callback open');
  check(!loopFor('none'), 'no effect, no loop');

  /* 6. theme.json round trip. importTheme takes the TEXT of a theme.json and an
        options object - handing it a parsed object makes every assertion below
        pass by doing nothing at all, which is how this test first "passed". */
  state.effect = {kind:'embers', speed:2.5, amount:63, color:'warning'};
  const written = JSON.stringify(buildTheme().effects);
  const before = JSON.stringify(state.effect);
  state.effect = {kind:'none', speed:1, amount:40, color:''};   // must be restored, not left
  importTheme(JSON.stringify({effects: JSON.parse(written)}), {silent:true});
  check(JSON.stringify(state.effect) === before, 'effects survive a JSON round trip',
        `${written} -> ${JSON.stringify(state.effect)}`);

  /* 7. Import has to land where the CLIENT would land: an unknown kind and an
        unknown colour role are dropped, but speed and amount are clamped, not
        discarded - that is what theme_spec.cpp does with them. */
  const rejected = importTheme(JSON.stringify(
    {effects:{focus:{kind:'lasers', speed:99, amount:400, color:'nonsense'}}}), {silent:true});
  check(state.effect.kind === 'none' && state.effect.color === '',
        'an unknown kind and a bogus colour role are dropped',
        JSON.stringify(state.effect));
  check(state.effect.speed === 8 && state.effect.amount === 100,
        'speed and amount are clamped to the client\'s range, not discarded',
        `speed ${state.effect.speed}, amount ${state.effect.amount}`);
  check(rejected && rejected.unknown.filter(u => u.startsWith('effects.')).length === 2,
        'both rejected values are reported to the author, not swallowed',
        JSON.stringify(rejected && rejected.unknown));

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

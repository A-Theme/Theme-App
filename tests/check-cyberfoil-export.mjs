/**
 * Does a RomM theme come out of the CyberFoil editor as a theme CyberFoil
 * will actually load?
 *
 * check-cyberfoil.mjs proves the editor's port of CyberFoil's loader. This
 * one points that proven loader at the editor's own output: a RomM theme with
 * everything CyberFoil cannot carry (motion, an animation, a focus effect,
 * music, a font) is imported, converted, and exported as a pack, and then:
 *
 *   - the 19 RomM roles land on CyberFoil's 11 as ROMM_TO_CF says
 *   - the background is darkened by the theme's own dim, in the pixels
 *   - CyberFoil's picker lists the pack under the theme's name, and every
 *     colour and image in it survives the loader
 *   - what could not come across is reported, item by item
 *   - the zip reads back and re-imports to the same theme.json
 *   - every preview screen paints, OLED on and off
 *   - every starting palette passes the readability checks without an error
 *
 *     node tests/check-cyberfoil-export.mjs
 */
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PORT = 8793;
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

  /* ---- a RomM theme, built in memory ---- */
  const png = (w, h, fill) => {
    const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
    const c = cv.getContext('2d'); c.fillStyle = fill; c.fillRect(0, 0, w, h);
    return cv.toDataURL('image/png');
  };
  const romm = {
    name: 'Export Probe', author: 'tests', version: '1.2.0',
    colors: {bg:'#102030', surface:'#1A2A3AE0', surface_raised:'#22334480', surface_hover:'#334455',
             border:'#445566', text:'#E0E8F0', text_strong:'#FFFFFF', text_muted:'#99AABB',
             accent:'#FF8800', accent_alt:'#00FF88', focus_ring:'#FFFF00', scrim:'#00000080'},
    background: {image:'bg.png', dim:0.5, motion:{kind:'drift', speed:1, amount:24},
                 animation:{kind:'sheet', file:'sheet.png', frame_width:320, frame_height:180, frames:2, fps:2}},
    effects: {focus: {kind:'embers', amount:50}},
    assets: {mascot:'borb.png'},
    audio: {bgm:'song.ogg'}
  };
  const files = {'bg.png': png(1280, 720, 'rgb(200,100,50)'), 'borb.png': png(64, 48, 'rgb(0,255,0)')};
  const bundle = [{dir: 'Probe', base: 'theme.json', text: async () => JSON.stringify(romm), dataUrl: async () => ''},
    ...Object.entries(files).map(([base, url]) => ({dir: 'Probe', base, text: async () => '', dataUrl: async () => url}))];
  await importBundle(bundle, 'Probe');
  await settled();

  /* ---- the mapping ---- */
  const want = {background:'#102030', header:'#1A2A3AE0', footer:'#1A2A3AE0', panel:'#22334480',
                text:'#E0E8F0', selected_text:'#FFFFFF', muted_text:'#99AABB', accent:'#FF8800',
                highlight:'#334455', scrollbar:'#FF880080', progress_track:'#445566'};
  check(JSON.stringify(state.colors) === JSON.stringify(Object.assign({}, ...ROLE_KEYS.map(k => ({[k]: want[k]})))),
        'the 19 RomM roles map onto the 11 as ROMM_TO_CF says', state.colors);

  /* ---- the darkened background, measured in the exported pixels ---- */
  const bgFile = lastPack.files.find(f => f.path === 'background.png');
  check(bgFile, 'the pack carries background.png');
  if (bgFile){
    const d = await decodeImage(bgFile.dataUrl);
    const cv = document.createElement('canvas'); cv.width = 4; cv.height = 4;
    const c = cv.getContext('2d'); c.drawImage(d.img, 640, 360, 4, 4, 0, 0, 4, 4);
    const [r, g, b] = c.getImageData(1, 1, 1, 1).data;
    check(Math.abs(r - 100) <= 1 && Math.abs(g - 50) <= 1 && Math.abs(b - 25) <= 1,
          'dim 0.5 is baked in as c * (1 - dim)', [r, g, b]);
    check(d.w === 1280 && d.h === 720, 'the background keeps its 1280x720', [d.w, d.h]);
  }

  /* ---- CyberFoil's verdict, through the proven port ---- */
  const listed = cfDiscover(lastVfs.vfs);
  check(listed.length === 1 && listed[0].file === 'Probe/theme.json' && listed[0].name === 'Export Probe',
        'the picker lists the pack under its name', listed);
  const st = cfLoad(lastVfs.vfs, 'Probe/theme.json');
  check(st.colors.size === 11 && !st.ignored.length, 'all 11 colours survive the loader', {n: st.colors.size, ignored: st.ignored});
  check(['background.jpg', 'logo.png', 'awoos/5bbdbcf9a5625cd307c9e9bc360d78bd.png'].every(k => st.images.has(k)) && st.images.size === 3,
        'background, generated banner and mascot all survive the loader', [...st.images.keys()]);
  const doc = JSON.parse(lastPack.text);
  check(doc.version === 1 && doc.enabled === true, 'theme.json says version 1, as a number', doc.version);
  check(Object.values(doc.colors).every(v => cfParseColor(v)), 'every colour written is one CyberFoil parses');

  /* ---- what could not come across ---- */
  const dropped = (state.report && state.report.dropped || []).join(' | ');
  for (const w of ['motion (drift)', 'sheet animation', 'embers focus effect', 'music (song.ogg)', 'accent_alt', 'focus_ring', 'scrim'])
    check(dropped.includes(w), `the report names ${w}`, dropped);
  check(!dropped.includes('could not be read'), 'every file the theme names was found', dropped);

  /* ---- the zip, read back ---- */
  let zipBlob = null, zipName = '';
  const realDownload = download;
  window.download = (blob, name) => { zipBlob = blob; zipName = name; };
  await exportPack();
  window.download = realDownload;
  check(zipBlob && zipName === 'Probe.zip', 'the pack downloads as Probe.zip', zipName);
  const entries = readZip(await zipBlob.arrayBuffer()).map(e => e.name).sort();
  check(JSON.stringify(entries) === JSON.stringify(['Probe/background.png', 'Probe/banner.png', 'Probe/mascot-main.png', 'Probe/theme.json']),
        'the zip holds the folder and exactly its four files', entries);
  const before = lastPack.text;
  await importBundle(await bundleFromZip(new File([zipBlob], 'Probe.zip')), 'Probe');
  await settled();
  check(lastPack.text === before, 'the pack re-imports to the same theme.json', lastPack.text);

  /* ---- a CyberFoil theme with a value CyberFoil would ignore ---- */
  await importBundle([{dir: '', base: 'loose.json', dataUrl: async () => '',
    text: async () => JSON.stringify({name: 'Loose', colors: {accent: '#f80', text: '#EEEEEE', glow: '#FFFFFF'}})}], '');
  check(state.colors.accent === '#FF8800' && state.colors.text === '#EEEEEE' && !('glow' in state.colors),
        'a #RGB colour is rewritten to a form CyberFoil reads, an unknown role is dropped', state.colors);
  check(state.meta.folder === 'loose', 'a root-level .json keeps its stem as the folder', state.meta.folder);

  /* ---- every screen paints ---- */
  for (const oled of [false, true]) for (const scr of ['main', 'browser', 'queue', 'install']){
    state.oled = oled; state.screen = scr; render();
    const px = $('screen').getContext('2d').getImageData(0, 0, 1280, 720).data;
    let lit = 0; for (let i = 3; i < px.length; i += 4 * 97) if (px[i]) lit++;
    check(lit > 0, `the ${scr} screen paints${oled ? ' in OLED mode' : ''}`);
  }
  state.oled = false; state.screen = 'main';

  /* ---- every starting palette reads ---- */
  resetState();
  for (const name of Object.keys(ROMM_PRESETS)){
    state.colors = rommColors(ROMM_PRESETS[name]);
    render();
    const errs = [...document.querySelectorAll('#findings .tag.err')].map(t => t.parentNode.textContent);
    check(!errs.length, `the ${name} palette has no readability errors`, errs);
  }
  return out;
});

await browser.close();
srv.kill();

let bad = 0;
for (const r of results){
  console.log(`${r.ok ? 'ok  ' : 'FAIL'} ${r.what}${r.ok ? '' : '  ' + r.detail}`);
  if (!r.ok) bad++;
}
if (errors.length){ console.error('page errors:\n  ' + errors.join('\n  ')); bad++; }
if (bad){ console.error(`\nFAIL: ${bad} check${bad === 1 ? '' : 's'} failed`); process.exit(1); }
console.log(`OK: ${results.length} checks passed`);

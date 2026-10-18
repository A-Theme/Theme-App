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
  check(['background.jpg', 'logo.png', 'awoos/5bbdbcf9a5625cd307c9e9bc360d78bd.png'].every(k => st.images.has(k)),
        'background, generated banner and mascot all survive the loader', [...st.images.keys()]);
  check(st.images.get('awoos/7d8a05cddfef6da4901b20d2698d5a71.png') === 'theme/Probe/mascot-none.png' && st.images.size === 4,
        'the install mascot the theme has no art for is hidden with a clear pixel CyberFoil accepts', [...st.images.entries()]);
  const none = lastPack.files.find(f => f.path === 'mascot-none.png');
  if (none){
    const d = await decodeImage(none.dataUrl);
    const cv = document.createElement('canvas'); cv.width = 1; cv.height = 1;
    const c = cv.getContext('2d'); c.drawImage(d.img, 0, 0);
    const px = [...c.getImageData(0, 0, 1, 1).data];
    check(d.w === 1 && d.h === 1 && px[3] === 0, 'the clear pixel really is 1x1 and fully transparent', px);
  }
  const doc = JSON.parse(lastPack.text);
  check(doc.version === 1 && doc.enabled === true, 'theme.json says version 1, as a number', doc.version);
  check(Object.values(doc.colors).every(v => cfParseColor(v)), 'every colour written is one CyberFoil parses');

  /* ---- the generated banner survives "Remove anime", which draws it at x = -113 ---- */
  const banner = lastPack.files.find(f => f.path === 'banner.png');
  if (banner){
    const d = await decodeImage(banner.dataUrl);
    const cv = document.createElement('canvas'); cv.width = 480; cv.height = 93;
    const c = cv.getContext('2d'); c.drawImage(d.img, 0, 0);
    const px = c.getImageData(0, 0, 480, 93).data;
    let hidden = 0, shown = 0;
    for (let y = 0; y < 93; y++) for (let x = 0; x < 480; x++) if (px[(y * 480 + x) * 4 + 3]) (x < 113 ? hidden++ : shown++);
    check(d.w === 480 && d.h === 93 && hidden === 0 && shown > 500,
          'the generated banner is 480x93 and draws nothing in the 113px "Remove anime" cuts off', {hidden, shown});
  }

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
  check(JSON.stringify(entries) === JSON.stringify(['Probe/background.png', 'Probe/banner.png', 'Probe/mascot-main.png', 'Probe/mascot-none.png', 'Probe/theme.json']),
        'the zip holds the folder and exactly its five files', entries);
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

  /* ---- a Tinfoil theme ---- */
  const tinfoil = {color: 'FFFFFFFF', logo: 'sdmc:/switch/tinfoil/themes/Probe/logo.png',
    background: {color: '102030FF', image: 'sdmc:/switch/tinfoil/themes/Probe/bg.bmp'},
    selection: {color: 'FFEE00FF', background: {color: '00000080'}, border: {color: 'FF3366FF', width: 1}},
    menu: {selection: {color: 'FFFFFFFF', background: {color: '22446680'}}, background: {color: 'B4A27200'}},
    border: {color: '113355FF', width: 0.5},
    progressBar: {color: '2244AAFF', background: {color: '111111CC'}, width: 0.5},
    scrollBar: {color: '888888FF', background: {color: '00000055'}, width: 0.5},
    music: {url: 'sdmc:/switch/tinfoil/themes/Probe/shop-theme.mp3', volume: 5}};
  const bmp = (() => {   /* a 256x144 white 24-bit BMP: a type CyberFoil does not document */
    const W = 256, H = 144, size = 54 + W * H * 3;
    const b = new Uint8Array(size).fill(255), v = new DataView(b.buffer);
    b.fill(0, 0, 54); b[0] = 66; b[1] = 77; v.setUint32(2, size, true); v.setUint32(10, 54, true); v.setUint32(14, 40, true);
    v.setInt32(18, W, true); v.setInt32(22, H, true); v.setUint16(26, 1, true); v.setUint16(28, 24, true);
    let bin = ''; for (let i = 0; i < b.length; i += 8192) bin += String.fromCharCode(...b.subarray(i, i + 8192));
    return 'data:image/bmp;base64,' + btoa(bin);
  })();
  const tf = {'settings.json': JSON.stringify(tinfoil), 'bg.bmp': bmp, 'logo.png': png(300, 120, 'rgb(255,0,0)'), 'patch.ips': ''};
  await importBundle(Object.entries(tf).map(([base, v]) => ({dir: '', base,
    text: async () => v, dataUrl: async () => v})), 'Aramaki_Tinfoil_Probe');
  await settled();
  check(state.report && state.report.kind === 'Tinfoil' && state.meta.name === 'Tinfoil Probe' && state.meta.author === 'Aramaki',
        'a Tinfoil settings.json is recognised and named from its folder', [state.report && state.report.kind, state.meta.name]);
  check(state.colors.text === '#FFFFFF' && state.colors.selected_text === '#FFEE00' && state.colors.background === '#102030' &&
        state.colors.progress_track === '#111111CC' && state.colors.accent === '#FF3366',
        'Tinfoil colours map by role, and the more visible of its brand colours becomes accent', state.colors);
  check(parseHex(state.colors.panel).a > 0x33 && (state.report.adjusted || []).some(a => a.startsWith('panel')),
        'a see-through menu too faint for its text is made more opaque, and reported', [state.colors.panel, state.report.adjusted]);
  const tbg = lastPack.files.find(f => f.path.startsWith('background.'));
  check(tbg && tbg.type === 'image/png' && tbg.path === 'background.png', 'a BMP wallpaper is redrawn as PNG', tbg && tbg.path);
  check(tbg && tbg.image && tbg.image.w === 1280 && tbg.image.h === 720 && state.bg.fittedFrom === '256×144',
        'a wallpaper of any size is scaled to fill 1280x720, which CyberFoil draws unscaled', tbg && [tbg.image, state.bg.fittedFrom]);
  check(state.colors.panel.startsWith('#000000') && state.colors.header.startsWith('#000000'),
        'an invisible Tinfoil menu colour becomes black, not its leftover RGB, when made visible', [state.colors.panel, state.colors.header]);
  check(lastPack.files.some(f => f.path === 'banner.png' && f.image && f.image.w === 480 && f.image.h === 93),
        'the Tinfoil logo is fitted into a 480x93 banner');
  const tdrop = state.report.dropped.join(' | ');
  check(tdrop.includes('music') && tdrop.includes('patch file') && tdrop.includes('tile border'), 'the report names what Tinfoil had that CyberFoil does not', tdrop);
  check(cfDiscover(lastVfs.vfs).length === 1 && cfLoad(lastVfs.vfs, lastVfs.selected).colors.size === 11, 'CyberFoil lists the converted Tinfoil theme');

  /* ---- every screen paints ---- */
  for (const [oled, noAnime] of [[false, false], [true, false], [false, true]]) for (const scr of ['main', 'browser', 'queue', 'install']){
    state.oled = oled; state.noAnime = noAnime; state.screen = scr; render();
    const px = $('screen').getContext('2d').getImageData(0, 0, 1280, 720).data;
    let lit = 0; for (let i = 3; i < px.length; i += 4 * 97) if (px[i]) lit++;
    check(lit > 0, `the ${scr} screen paints${oled ? ' in OLED mode' : ''}${noAnime ? ' with Remove anime on' : ''}`);
  }
  state.oled = false; state.noAnime = false; state.screen = 'main';

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

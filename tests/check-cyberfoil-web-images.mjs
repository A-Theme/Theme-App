/**
 * Tinfoil themes whose wallpaper or logo is a web URL, in the CyberFoil editor.
 *
 * Most of those hosts send no CORS headers, so the browser refuses the page
 * the bytes and the direct download fails. The editor then lists them in the
 * import report with a button that retries through images.weserv.nl - never
 * automatically, since the proxy sees the address. Neither host is reached
 * for real: routes stand in for a CORS-less host, a proxy that answers, and
 * one image the proxy cannot fetch either. This proves:
 *
 *   - nothing goes to the proxy until the button is pressed
 *   - a failed web wallpaper and logo are listed, with the button
 *   - pressing it brings the wallpaper and banner in, through the proxy
 *   - an image the proxy cannot fetch stays listed, saying so
 *   - a wallpaper that arrives still gets the legibility pass
 *   - the addresses are kept as "remote_images" whether or not the download
 *     worked, so a CyberFoil with web-image support fetches them on the
 *     console; the field shows them, a bad address is not exported, and a
 *     CyberFoil theme.json carrying them round-trips
 *
 *     node tests/check-cyberfoil-web-images.mjs
 */
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import zlib from 'node:zlib';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PORT = 8796;
const srv = spawn('python3', ['-m', 'http.server', String(PORT), '--bind', '127.0.0.1'],
                  {cwd: root, stdio: 'ignore'});
await new Promise(r => setTimeout(r, 900));

/* A solid PNG, built by hand so the test needs no image library. */
function png(w, h, [r, g, b]){
  const crcT = [...Array(256)].map((_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
  const crc = buf => { let c = 0xFFFFFFFF; for (const x of buf) c = crcT[(c ^ x) & 255] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; };
  const chunk = (type, data) => { const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
    const td = Buffer.concat([Buffer.from(type), data]); const c = Buffer.alloc(4); c.writeUInt32BE(crc(td)); return Buffer.concat([len, td, c]); };
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 2;
  const row = Buffer.concat([Buffer.from([0]), Buffer.from([...Array(w)].flatMap(() => [r, g, b]))]);
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(Buffer.concat([...Array(h)].map(() => row))), chunk('IEND', Buffer.alloc(0)))]);
}

const browser = await chromium.launch({executablePath: process.env.CHROMIUM_PATH || undefined, args: ['--no-sandbox']});
const page = await browser.newPage();
const errors = [], proxied = [];
page.on('pageerror', e => errors.push(e.message));
page.on('dialog', d => d.accept());

/* The author's host, sending no CORS header. A page sees a CORS refusal as
   a plain network error - fetch() rejects with a TypeError - so that is what
   this stands in with. (A route.fulfill without the header is not refused:
   Playwright's interception sits outside the CORS check.) */
const direct = [];
await page.route('https://old-host.test/**', route => { direct.push(route.request().url()); route.abort('failed'); });
/* The proxy: answers with CORS, for the two images that still exist. */
await page.route('https://images.weserv.nl/**', route => {
  const u = new URL(route.request().url()).searchParams.get('url');
  proxied.push(u);
  const body = u === 'old-host.test/wall.png' ? png(1280, 720, [235, 235, 235])
             : u === 'old-host.test/logo.png' ? png(400, 120, [20, 120, 220]) : null;
  if (!body) return route.fulfill({status: 404, body: 'gone'});
  route.fulfill({status: 200, contentType: 'image/png', headers: {'Access-Control-Allow-Origin': '*'}, body});
});

await page.goto(`http://127.0.0.1:${PORT}/cyberfoil-theme-editor.html`, {waitUntil: 'domcontentloaded'});
await page.waitForFunction(() => typeof view === 'object' && view !== null);

const importTheme = (bg, logo) => page.evaluate(async ([bg, logo]) => {
  const doc = {background: {image: bg, color: '#101010'}, logo, color: '#F0F0F0',
               menu: {background: {color: '#20202080'}}, selection: {background: {color: '#303030'}, color: '#FFFFFF'}};
  await importBundle([{dir: 'Web Probe', base: 'settings.json', text: async () => JSON.stringify(doc), dataUrl: async () => ''}], 'Web Probe');
  await settled();
}, [bg, logo]);

const results = [];
const check = (ok, what, detail) => results.push({ok: !!ok, what, detail: detail === undefined ? '' : JSON.stringify(detail)});

await importTheme('https://old-host.test/wall.png', 'https://old-host.test/logo.png');
let s = await page.evaluate(() => ({bg: state.bg.mode, banner: state.banner.mode, remote: state.report && state.report.remote,
  report: $('report').textContent, button: !!$('reportProxy')}));
check(s.bg === 'none' && s.banner === 'generate', 'a CORS-less host leaves wallpaper and logo out', s);
check(direct.length === 2, 'the direct download is tried first', direct);
check(proxied.length === 0, 'nothing goes to the proxy on its own', proxied);
check(s.remote && s.remote.length === 2, 'both web images are listed for a retry', s.remote);
check(s.button && /weserv/.test(s.report), 'the report offers the proxy, by name', s.report);

await page.click('#reportProxy');
await page.waitForFunction(() => !state.report.remote.length, null, {timeout: 15000}).catch(() => {});
s = await page.evaluate(() => ({bg: state.bg.mode, w: state.bg.w, decoded: state.bg.decoded, banner: state.banner.mode,
  remote: state.report.remote, button: !!$('reportProxy'), panel: state.colors.panel, adjusted: state.report.adjusted}));
check(proxied.includes('old-host.test/wall.png') && proxied.includes('old-host.test/logo.png'), 'pressing it asks the proxy for both', proxied);
check(s.bg === 'image' && s.decoded && s.w === 1280, 'the wallpaper arrives', s);
check(s.banner === 'image', 'and the logo becomes the banner', s.banner);
check(!s.remote.length && !s.button, 'and the list and button go away', s);
check(s.adjusted.length > 0, 'a pale wallpaper that arrives still gets the legibility pass', s.adjusted);

await importTheme('https://old-host.test/gone.png', '');
await page.click('#reportProxy');
await page.waitForFunction(() => state.report.remote.every(x => x.failed), null, {timeout: 15000}).catch(() => {});
s = await page.evaluate(() => ({bg: state.bg.mode, remote: state.report.remote, report: $('report').textContent}));
check(s.bg === 'none' && s.remote.length === 1 && s.remote[0].failed, 'an image the proxy cannot fetch stays listed', s.remote);
check(/could not fetch it either/.test(s.report), 'and the report says the host may be gone', s.report);

/* ---- remote_images ---- */
await importTheme('https://old-host.test/wall.png', 'https://old-host.test/logo.png');
s = await page.evaluate(() => ({remote: lastPack.doc.remote_images, field: $('bgRemote').value, logo: $('bnRemote').value,
  checks: $('findings').textContent}));
check(s.remote && s.remote.background === 'https://old-host.test/wall.png' && s.remote.logo === 'https://old-host.test/logo.png',
      'a Tinfoil conversion keeps both web addresses as remote_images, download or not', s.remote);
check(s.field === 'https://old-host.test/wall.png' && s.logo === 'https://old-host.test/logo.png', 'and the fields show them', s);
check(/web-image support/.test(s.checks), 'the checks say what remote_images does', s.checks);
check(/no bundled image behind it/.test(s.checks), 'and warn when the web wallpaper has no bundled fallback');
await page.click('#reportProxy');
await page.waitForFunction(() => !state.report.remote.length, null, {timeout: 15000}).catch(() => {});
s = await page.evaluate(() => ({remote: lastPack.doc.remote_images, bg: lastPack.doc.images && lastPack.doc.images.background,
  checks: $('findings').textContent}));
check(s.remote && s.remote.background === 'https://old-host.test/wall.png' && /^background\./.test(s.bg || ''),
      'after the proxy fetch: a bundled fallback AND the address that rotates', s);
check(!/no bundled image behind it/.test(s.checks), 'and the fallback warning goes away');

await page.fill('#bgRemote', 'not a url');
s = await page.evaluate(() => ({remote: lastPack.doc.remote_images, bad: $('bgRemote').classList.contains('bad')}));
check(s.bad && !(s.remote && s.remote.background), 'a bad address is flagged and not exported', s);
await page.fill('#bgRemote', 'https://random.example/wall?seed=x');
s = await page.evaluate(() => lastPack.doc.remote_images);
check(s && s.background === 'https://random.example/wall?seed=x', 'typing an address exports it', s);
await page.fill('#bgRemote', '');
s = await page.evaluate(() => lastPack.doc.remote_images);
check(!s || !s.background, 'clearing the field removes it', s);

s = await page.evaluate(async () => {
  const doc = {version: 1, enabled: true, name: 'Round Trip',
               remote_images: {background: 'https://random.example/a.jpg', 'logo.png': 'https://random.example/l.png',
                               'icons/remote.png': 'https://random.example/i.png', bad: 'sdmc:/x'}};
  await importBundle([{dir: 'RT', base: 'theme.json', text: async () => JSON.stringify(doc), dataUrl: async () => ''}], 'RT');
  await settled();
  return lastPack.doc.remote_images;
});
check(s && s.background === 'https://random.example/a.jpg' && s.logo === 'https://random.example/l.png' && Object.keys(s).length === 2,
      'a CyberFoil theme.json with remote_images round-trips (background and logo)', s);

for (const r of results) console.log(`${r.ok ? 'ok  ' : 'FAIL'} ${r.what}${r.ok || !r.detail ? '' : '  ' + r.detail}`);
for (const e of errors) console.log('FAIL page error: ' + e);
const failed = results.filter(r => !r.ok).length + errors.length;
await browser.close();
srv.kill();
console.log(failed ? `${failed} check(s) FAILED` : `OK: ${results.length} checks passed`);
process.exit(failed ? 1 : 0);

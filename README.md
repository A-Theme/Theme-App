<div align="center">

<img src="https://raw.githubusercontent.com/A-Theme/Theme-App/main/assets/header.png" alt="Aramaki's Theme Editor - for Tinfoil and the RomM Switch client" width="100%"/>

[![Typing SVG](https://readme-typing-svg.demolab.com?font=Fira+Code&pause=1200&color=00C2FF&center=true&vCenter=true&width=660&lines=Two+editors.+Two+apps.+One+page.;No+installs.+No+command+line.;Drag+in+a+theme+and+start+editing.;Live+Switch+UI+preview+as+you+type.;Export+a+ready-to-use+pack+in+one+click.)](https://git.io/typing-svg)

[![Tinfoil editor](https://img.shields.io/badge/editor-Tinfoil-ff3c50?style=for-the-badge)](tinfoil-theme-editor.html)
[![RomM editor](https://img.shields.io/badge/editor-RomM%20client-4C8DFF?style=for-the-badge)](romm-theme-editor.html)
[![Runs in Browser](https://img.shields.io/badge/runs%20in-browser-00c2ff?style=for-the-badge)](#-quick-start)
[![Desktop App](https://img.shields.io/badge/windows-desktop%20app-9d4edd?style=for-the-badge)](#-desktop-app)
[![Mobile Friendly](https://img.shields.io/badge/android%20%26%20ios-friendly-5be27a?style=for-the-badge)](#-mobile-android--ios)
[![License: MIT](https://img.shields.io/badge/license-MIT-8A6BFF?style=for-the-badge)](#-license)

[Quick Start](#-quick-start) •
[Features](#-features) •
[How to Use](#-how-to-use) •
[Supported Format](#-supported-theme-format) •
[RomM Editor](#-also-here-the-romm-theme-editor) •
[Desktop App](#-desktop-app) •
[Mobile](#-mobile-android--ios) •
[On-Console](#-on-console-installer) •
[FAQ](#-faq)

</div>

---

## 🧾 What is this?

**Aramaki's Theme Editors** — two self-contained web apps in one repo, for
theming two different Switch apps. No hand-editing raw JSON and guessing what a
colour or path field does: load a theme, tweak every field through a proper UI,
preview it live, export it back out.

| editor | themes | file |
|---|---|---|
| **[Tinfoil Theme Editor](tinfoil-theme-editor.html)** | [Tinfoil](https://github.com/Huntereb/Tinfoil), the Switch shop app | `settings.json` |
| **[RomM Theme Editor](romm-theme-editor.html)** | the RomM Switch client, an SDL2 homebrew app | `theme.json` |

[`index.html`](index.html) is a launcher offering both — it is what the desktop
app opens. Each editor also carries its **own** web manifest, so they install as
two separate apps and can sit side by side on a home screen.

The Tinfoil one was built alongside the [A-Theme Tinfoil theme collection](https://github.com/A-Theme/Tinfoil-Themes);
the RomM one alongside [RomM-Themes](https://github.com/A-Theme/RomM-Themes).
Most of this README describes the Tinfoil editor, since it is the older and
larger of the two — the RomM editor has [its own section](#-also-here-the-romm-theme-editor).

Everything runs **entirely in your browser (or as a standalone desktop app)** — no server, no account, no build step. The editor never uploads your work anywhere; the only time a file leaves your machine is if *you* choose to submit a theme to the public collection, and even then your browser hands it straight to GitHub.

---

## ⚡ At a glance

<table>
<tr>
<td width="33%" valign="top" align="center">

**🎨 Design**

19 palette schemes · pull colors straight from your wallpaper · live Switch-accurate preview · readability warnings with one-click fixes

</td>
<td width="33%" valign="top" align="center">

**🗂️ Edit**

Auto-generated form from any theme · real color pickers with alpha · logo & audio preview · raw JSON when you want it

</td>
<td width="33%" valign="top" align="center">

**📦 Ship**

Browse the community collection · export a complete `.zip` · submit your theme for the public repo · install on-console with no PC

</td>
</tr>
</table>

---

## ✨ Features

- **🌐 Browse & load themes from the community database** — no file needed to get started: pull up the live list of every theme in [A-Theme/Tinfoil-Themes](https://github.com/A-Theme/Tinfoil-Themes), search it, and load one straight into the editor. Downloads and extracts the theme's `.zip` right in your browser (using an embedded copy of JSZip — nothing sent to any server), and keeps its bundled logo/background/audio files working automatically in every preview, no extra setup.
- **🗂️ Auto-generated editor** — drop in any theme config (`settings.json`, or the older `theme.json`) and get a full form built from its actual structure: nested objects become collapsible sections, arrays get add/remove controls, no schema hardcoding required.
- **🎨 Smart color fields** — automatically detects hex colors in *any* format Tinfoil themes use (`#rrggbb`, bare `rrggbbaa`, with or without alpha) and gives you a real color picker next to the raw value, always writing back in the exact original style.
- **🌗 Transparency (alpha) made visual** — any color with an alpha channel gets its own drag slider and a checkerboard live-preview swatch, plus a built-in diagram explaining how the hex format works, so you never have to guess what those last two digits do.
- **📱 Android & iOS friendly** — fully responsive touch layout, and installable straight to your home screen as a standalone app (see [Mobile](#-mobile-android--ios) below).
- **🖼️ Live 16:9 preview** — a pixel-accurate mockup of the actual Tinfoil layout (grid, selection highlight, scrollbar, progress bar, context menu) built from your theme's real values, with a generic fallback preview for non-standard schemas. **Hover any part of it** to see exactly which field controls it, and **click** to jump straight down to that field in the editor — no hunting for which setting does what.
- **🏷️ Logo preview panel** — see your logo at true size with real pixel dimensions, including themes that point at dynamic `.php` endpoints instead of static image files.
- **🎵 Music/audio tester** — play back any audio field directly in the browser, with a local-file fallback for `sdmc:/`-style paths a browser can't fetch on its own.
- **🌈 Palette generator** — 19 color scheme types (monochromatic, analogous, complementary, split-complementary, triadic, tetradic, pastel, vibrant/neon, shades, warm, cool, grayscale, earth tones, jewel tones, sunset, ocean, duotone, metallic, random) to design a cohesive theme from a single seed color. The palette automatically sizes itself to match how many distinct colors your theme actually uses, rather than always producing a fixed five.
- **🖌️ Extract palette from your background image** — real dominant-color clustering (k-means, not just averaging) pulls a ready-to-use palette straight out of your background art.
- **🧩 One-click palette apply** — map generated or extracted colors onto any field in your theme with a single click, with smart auto-suggestions based on each field's role.
- **📝 Raw JSON view** — for when you just want to paste or hand-edit directly.
- **⚠️ Readability warnings** — flags color pairs that would be hard to actually read on-console (text against its background, selection text against its highlight, progress bar against its track) using the real WCAG contrast formula, plus a separate check for colors so similar they'd be hard to tell apart. Every warning comes with a one-click suggested fix that accounts for transparency, not just the raw hex.
- **📦 Export as a complete `.zip`** — downloads your edited `settings.json` bundled with its background image, logo, and audio, ready to drop straight onto your SD card. Assets that genuinely can't be included (device paths with no local file, or hosts that block direct fetching) are reported rather than silently skipped.
- **📤 Submit your theme to the collection** — a guided flow that packages your theme and opens a prefilled submission on [A-Theme/Tinfoil-Themes](https://github.com/A-Theme/Tinfoil-Themes) for review. All you need is a free GitHub account — no tokens or setup.

---

## 🚀 Quick Start

1. **[Download `tinfoil-theme-editor.html`](tinfoil-theme-editor.html)** from this repo (or grab the [Windows desktop app](#-desktop-app) if you'd rather not use a browser).
2. Open the file in any modern browser (Chrome, Edge, or Firefox — just double-click it).
3. Click **🌐 Browse Themes** to pick a starting point from the live community collection — or drag your own `settings.json` onto the page, or use **Open theme file**.
   - Don't have one yet and don't want to browse? Grab **[`sample.json`](sample.json)** from this repo — a real, complete theme file you can load straight in and start tweaking.
4. Edit anything using the generated form — colors, image paths, numbers, toggles, all of it.
5. Hit **Download .zip** to export your theme complete with its background, logo, and audio — or **Submit to A-Theme** to send it in for the public collection.

No build step. No dependencies. No install. It's one HTML file.

---

## 📖 How to Use

### Loading a theme
You can get a theme into the editor four ways:
- **Browse the community database** — click **🌐 Browse Themes**, search the live list pulled from this repo's `themes.json`, and click one. It downloads and extracts that theme's `.zip` right in your browser (no server involved — an embedded copy of [JSZip](https://stuk.github.io/jszip/) does the unzipping client-side) and loads its config straight into the editor. Every other file bundled in that zip (logo, background image, audio) stays available too, so previews work immediately without any extra setup.
- **Drag and drop** your own `settings.json` (or an older `theme.json`) onto the page
- Click **📂 Open theme file** and pick it from a file dialog
- **Paste raw JSON** directly into the text box on the start screen

### Editing fields
Every field in your theme gets an appropriate control automatically:

| Field type | What you get |
|---|---|
| Hex color (any format) | Color picker + editable text, synced both ways |
| Image path | Thumbnail preview |
| Audio path | Tagged and testable in the Music panel |
| Number | Numeric input |
| Boolean | Checkbox |
| Nested object | Collapsible section |
| Array | List with add/remove controls |

Use the **filter box** in the sidebar to jump straight to a specific field in large files.

### Previewing
The **live preview** at the top updates as you type, rendering an approximation of the actual Tinfoil shop screen — background, icon grid, selection highlight, scrollbar, and progress bar — all driven by your current values.

### Building a color palette
1. Pick a seed color (or click **🎲 Random seed**).
2. Choose a scheme from the dropdown.
3. Click **Generate palette**.
4. For each color field in your theme, assign a palette slot (or leave it as **Keep original**).
5. Click **Apply palette to theme**.

You can also click **🎨 Extract palette from background** to pull a palette directly out of your theme's background image instead of starting from a seed color.

### Exporting
Click **⬇ Download .zip** at any time to save your theme as a complete package — the edited `settings.json` alongside its background image, logo, and audio file, ready to extract straight to `switch/tinfoil/themes/` on your SD card. If an asset can't be included (a `sdmc:/` device path with no local file browsed for it, or a host that blocks direct fetching), it's reported in the download message rather than quietly left out.

Use **↺ Reset** to discard changes and start over from the originally loaded file.

### Submitting your theme

Click **📤 Submit to A-Theme** to send your creation in for the public collection. The flow walks you through naming it, crediting yourself, and downloading your `.zip`, then opens a prefilled submission on [A-Theme/Tinfoil-Themes](https://github.com/A-Theme/Tinfoil-Themes) — you just drag your `.zip` into it and hit submit.

All you need is a free GitHub account; there are no tokens to create or settings to configure. Nothing is uploaded by the editor itself — your file goes straight from your computer to GitHub when you attach it. Submissions are reviewed before being added to the collection.

---

## 🧬 Supported Theme Format

This editor targets Tinfoil's theme config schema — the `settings.json` Tinfoil reads from each theme folder — structured like:

```json
{
  "color": "f0faf2d9",
  "logo": "sdmc:/switch/tinfoil/themes/YourTheme/logo.png",
  "background": {
    "color": "d0a993d9",
    "image": "https://example.com/background.jpg"
  },
  "selection": {
    "color": "f0faf2d9",
    "background": { "color": "f0faf28c" },
    "border": { "color": "07700ad9", "width": 0.5 }
  },
  "menu": {
    "selection": { "...": "..." },
    "background": { "color": "07700acc" }
  },
  "border": { "color": "07700ad9", "width": 0.5 },
  "progressBar": { "color": "191f1ad9", "background": { "color": "9a6843cc" }, "width": 0.5 },
  "scrollBar":   { "color": "9a6843d9", "background": { "color": "191f1acc" }, "width": 0.5 },
  "icons": {
    "small":  { "margin": 6, "width": 136 },
    "medium": { "margin": 6, "width": 184 }
  },
  "music": {
    "url": "sdmc:/switch/tinfoil/themes/YourTheme/shop-theme.mp3",
    "volume": 5
  }
}
```

> Colors are 6 or 8-digit hex (`RRGGBB` or `RRGGBBAA`), usually **without** a leading `#`. The editor detects and preserves whichever style your file already uses.

The editor isn't hardcoded to this exact shape — if it detects a different structure, it falls back to a generic field-by-field editor and a best-guess preview, so it's still usable for related or modified schemas.

📄 Want a real, working example instead of the illustration above? This repo includes **[`sample.json`](sample.json)** — an actual theme file you can open directly in the editor to see every field in action.

---

## 💻 Desktop App

Prefer not to open a browser? A packaged Windows desktop version is available on the [**Releases**](../../releases/latest) page — same apps, wrapped in their own window with a taskbar icon, no browser required.

**[⬇ Download the latest Windows build](../../releases/latest)**

It opens the launcher, so **both** editors are one click away in the same window.

> **Note:** it ships as a folder, not a single `.exe` — that's normal for Electron-based apps, which bundle a full runtime alongside the executable. Unzip the whole folder and run the `.exe` from inside it.

### Building it yourself

```bash
npm install
npm start            # run it
npm run package:win  # build a Windows folder into dist/
```

`main.js` opens [`index.html`](index.html) — the launcher — and sends external
links to your real browser rather than trapping them in a chromeless window.

---

## 📱 Mobile (Android & iOS)

The app is fully responsive and works right in your phone's browser — no app store, no install required. Open `tinfoil-theme-editor.html` in Chrome (Android) or Safari (iOS) and it lays out for a touch screen automatically: stacked fields, larger tap targets, a full-width live preview, everything.

It can also be **installed as a home-screen app** (a Progressive Web App) so it opens full-screen with its own icon, exactly like a native app. This requires the file to be served over `https://` rather than opened locally — the easiest way is enabling **GitHub Pages** for this repo (**Settings → Pages → Deploy from branch → `main`**), which gives you a URL like:

```
https://a-theme.github.io/Theme-App/tinfoil-theme-editor.html
```

Once that's live:

**On Android (Chrome):**
1. Open the URL above
2. Tap the **⋮** menu → **Add to Home screen** (Chrome may also prompt automatically)
3. Confirm — it now launches full-screen from your home screen, with offline support for the app itself

**On iOS (Safari):**
1. Open the URL above
2. Tap the **Share** icon → **Add to Home Screen**
3. Confirm — same result: a full-screen home-screen app with its own icon

> Note: your theme's own background image, logo, or audio URLs still need an internet connection to load if they're hosted remotely — installing the app itself works offline, but *your theme's own remote assets* don't get bundled into that.

---

## ❓ FAQ

**Does this upload my theme file anywhere?**
No — nothing you load, edit, or export is ever uploaded by the editor itself. Two features do talk to the network, both only when you choose to use them: **Browse Themes** fetches the public theme list and zip files from this repo (it never sends anything back), and **Submit to A-Theme** opens a GitHub page where *you* attach your file — the editor never transmits it, your browser hands it directly to GitHub when you drag it in.

**How does "Browse Themes" work without a server?**
It fetches `themes.json` and the selected theme's `.zip` directly from GitHub, then unzips it entirely client-side using an embedded copy of [JSZip](https://stuk.github.io/jszip/) — the same trust model as any other static webpage, just doing the unzipping in JavaScript instead of on a server.

**Can I use this for themes that don't quite follow the standard schema?**
Yes — the field editor works on arbitrary JSON structures. The live preview is most accurate for the standard schema shown above, but falls back gracefully otherwise.

**Why can't I see my logo or hear my music preview?**
If your theme config points to an `sdmc:/` path, that's a Nintendo Switch SD card path a browser can't reach on its own. If you loaded the theme via **🌐 Browse Themes**, this is already handled automatically — its bundled logo/audio files are used directly. If you loaded a config manually and it references local files you don't have, use the **Browse local file** option in the Logo or Music panel to preview the actual file from your computer instead.

**Where can I find more Tinfoil themes?**
Check out [A-Theme/Tinfoil-Themes](https://github.com/A-Theme/Tinfoil-Themes) for a large collection of ready-made themes (or just click **🌐 Browse Themes** right in the editor), or join the Discord linked there for requests.

---

## 🎮 On-Console Installer

This editor is intentionally a browser/desktop/mobile tool — a Switch controller is a poor fit for color pickers and JSON editing. But there's a companion project: **[A-Theme/Switch-Theme-Installer](https://github.com/A-Theme/Switch-Theme-Installer)**, a native homebrew `.nro` app that reads this repo's `themes.json` directly, lets you browse and preview themes with a controller, and installs whichever one you keep straight onto your SD card — no computer needed.

It's had real hardware testing and several rounds of fixes already. What it can do:
- Browse the full theme list, install any theme immediately
- **Preview a theme's actual colors and layout** before committing — background, logo, selection colors, border, progress bar, built from the theme's real values
- **Regenerate a theme's palette straight from its own background image**, right on the preview screen — real color clustering, applied directly to the theme's fields, with a live-updating preview and the option to try again for a different result

> ⚠️ **Status:** the core JSON/color logic has been independently verified (compiled and run against real theme data before ever touching a Switch), and the app has gone through multiple real build-and-fix cycles on hardware — but it's still an actively developed homebrew project, not a finished release. See that repo's README for the current state and its own build instructions.

---

## 🎨 Also here: the RomM Theme Editor

This repo now hosts a **second** editor: [`romm-theme-editor.html`](romm-theme-editor.html),
for theming the **RomM Switch client** rather than Tinfoil. Same idea, same house
style, separate file — and it installs as its own app (its own
[`manifest-romm.json`](manifest-romm.json)), so both editors can live side by side
on your home screen.

A RomM theme is a folder with a `theme.json` in it, and can change a lot more than
a Tinfoil theme:

| | |
|---|---|
| **19 colour roles** | semantic, not raw slots — `bg`, `surface_raised`, `accent`, `focus_ring`, `danger`… |
| **Background** | a 1280×720 image with a `dim` control, plus free `drift`/`pan`/`zoom` motion |
| **Animated background** | sprite sheets (cheap — one texture) or animated GIF, inside a 48 MB texture budget |
| **Font** | a `.ttf`/`.otf` replacing the UI face at all five sizes |
| **Mascot** | swap the Borb art |
| **Focus effect** | smoke, embers, glow, shimmer, pulse or fade around the selected item — procedural, so no art and no memory |
| **Music** | MP3, OGG, Opus, FLAC, and tracker modules (`.mod`/`.xm`/`.it`/`.s3m`) |

What the editor does for you:

- **Browse the published catalog** — it reads the same `manifest.json` the console
  reads and lists every theme in
  [RomM-Themes](https://github.com/A-Theme/RomM-Themes), with what each one changes.
  Opening one pulls its background, font, mascot and music down too, so the quickest
  way to start a new theme is usually to open the nearest existing one and change it.
- **Live preview of the real screens** — library, detail and a dialog, drawn at the
  console's actual 1280×720 with true relative type sizes. It stays pinned while
  you scroll the colour list.
- **Motion and animation that actually play.** `drift`, `pan` and `zoom` move, sprite
  sheets step through their frames, and moving a slider retunes it live. The
  arithmetic is a port of the client's own `theme_motion.cpp` — same triangle wave,
  same easing, same grow-before-translate — because a preview running its own
  approximation would be worse than none, looking authoritative while being wrong.
  [`tests/check-motion.mjs`](tests/check-motion.mjs) holds it to that: 6336 inputs
  through both implementations, byte-identical output required.
- **Focus effects, previewed the same way.** The six kinds the client can draw
  around whatever is selected — `smoke`, `embers`, `glow`, `shimmer`, `pulse`,
  `fade` — run live on the focused card, the focused button, the button in a
  dialog. They are procedural: no art ships with them and they cost no memory.
  The maths is a port of the client's `theme_effects.cpp`, held to the same
  standard as motion by [`tests/check-effects.mjs`](tests/check-effects.mjs) —
  8606 inputs, bit-identical floats required — and
  [`tests/check-effect-preview.mjs`](tests/check-effect-preview.mjs) checks the
  pixels that reach the canvas, including that nothing ever reaches more than
  26px outside the element it decorates.
- **20 starting palettes**, each setting all 19 roles and contrast-checked before
  it ships, so a palette is a safe base rather than a swatch dump you then have to
  make legible.
- **Readability checks** — WCAG contrast for body text on all three surfaces, and a
  hard warning when `focus_ring` blends into the card it outlines. A cursor nobody
  can see is the single easiest way to ruin a theme.
- **A live memory budget** — one 720p frame is 3.6 MB of texture, so an animated
  background is budgeted. The meter shows exactly what your settings cost, and an
  animation over budget falls back to the still image in the preview, because that
  is what the client does with it.
- **Import a folder, a `.zip` pack, or a bare `theme.json`**; **export** the JSON or
  a ready-to-drop `.zip` pack with every asset in it. Prefer the folder or the pack:
  a `theme.json` only *names* its background, so importing one on its own gives you
  colours and five dangling references.

Drop the unzipped folder into `sdmc:/switch/romm-client/themes/` and pick it in
**Settings → Theme** on the console. Themes live in
[**RomM-Themes**](https://github.com/A-Theme/RomM-Themes), which validates every
submission against the same rules the client enforces.

---

## 📜 License

MIT — do whatever you'd like with it.

---

## 🔗 The whole A-Theme project

<div align="center">

[![Theme-App](https://img.shields.io/badge/Theme--App-visual%20editor-00c2ff?style=for-the-badge)](https://github.com/A-Theme/Theme-App)
[![Tinfoil-Themes](https://img.shields.io/badge/Tinfoil--Themes-theme%20database-ff3c50?style=for-the-badge)](https://github.com/A-Theme/Tinfoil-Themes)
[![Switch-Theme-Installer](https://img.shields.io/badge/Switch--Theme--Installer-on--console%20installer-9d4edd?style=for-the-badge)](https://github.com/A-Theme/Switch-Theme-Installer)
[![RomM-Themes](https://img.shields.io/badge/RomM--Themes-romm%20theme%20database-5be27a?style=for-the-badge)](https://github.com/A-Theme/RomM-Themes)

[![A-Theme](https://img.shields.io/badge/A--Theme-org-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/A-Theme)
[![Website](https://img.shields.io/badge/Web-a--theme.ca-e60012?style=for-the-badge&logo=googlechrome&logoColor=white)](https://a-theme.ca)

<br/>

Made by **Aramaki** · part of the [A-Theme](https://github.com/A-Theme) project

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:00c2ff,50:9d4edd,100:ff3c50&height=100&section=footer" width="100%"/>

</div>

<div align="center">

<img src="assets/banner.png" alt="Aramaki's Tinfoil Theme Editor" width="100%">

### A visual, in-browser editor for Tinfoil `theme.json` files
No installs. No command line. Just open it and drag in a theme.

[![Made for Tinfoil](https://img.shields.io/badge/made%20for-Tinfoil-1e2327?style=flat-square)](https://github.com/Huntereb/Tinfoil)
[![Runs in Browser](https://img.shields.io/badge/runs%20in-browser-00c2ff?style=flat-square)](#-quick-start)
[![Windows App Available](https://img.shields.io/badge/windows-desktop%20app-ff3c50?style=flat-square)](#-desktop-app)
[![Mobile Friendly](https://img.shields.io/badge/android%20%26%20ios-friendly-5be27a?style=flat-square)](#-mobile-android--ios)
[![License: MIT](https://img.shields.io/badge/license-MIT-lightgrey?style=flat-square)](#-license)

[Quick Start](#-quick-start) •
[Features](#-features) •
[How to Use](#-how-to-use) •
[Supported Format](#-supported-theme-format) •
[Desktop App](#-desktop-app) •
[Mobile](#-mobile-android--ios) •
[On-Console](#-on-console-installer) •
[FAQ](#-faq)

</div>

---

## 🧾 What is this?

**Aramaki's Tinfoil Theme Editor** is a single self-contained web app for creating and editing [Tinfoil](https://github.com/Huntereb/Tinfoil) `theme.json` files — no more hand-editing raw JSON and guessing what a color or path field does. Load your theme, see and tweak every field through a proper UI, preview it live, and export it back out.

It was built alongside the [A-Theme Tinfoil theme collection](https://github.com/A-Theme/Tinfoil-Themes) to make creating and tweaking themes actually pleasant.

Everything runs **entirely in your browser (or as a standalone desktop app)** — no server, no account, no upload. Your theme file never leaves your machine.

---

## ✨ Features

- **🌐 Browse & load themes from the community database** — no file needed to get started: pull up the live list of every theme in [A-Theme/Tinfoil-Themes](https://github.com/A-Theme/Tinfoil-Themes), search it, and load one straight into the editor. Downloads and extracts the theme's `.zip` right in your browser (using an embedded copy of JSZip — nothing sent to any server), and keeps its bundled logo/background/audio files working automatically in every preview, no extra setup.
- **🗂️ Auto-generated editor** — drop in any `theme.json` and get a full form built from its actual structure: nested objects become collapsible sections, arrays get add/remove controls, no schema hardcoding required.
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
- **📦 Export as a complete `.zip`** — downloads your edited `theme.json` bundled with its background image, logo, and audio, ready to drop straight onto your SD card. Assets that genuinely can't be included (device paths with no local file, or hosts that block direct fetching) are reported rather than silently skipped.
- **📤 Submit your theme to the collection** — a guided flow that packages your theme and opens a prefilled submission on [A-Theme/Tinfoil-Themes](https://github.com/A-Theme/Tinfoil-Themes) for review. All you need is a free GitHub account — no tokens or setup.

---

## 🚀 Quick Start

1. **[Download `tinfoil-theme-editor.html`](tinfoil-theme-editor.html)** from this repo (or grab the [Windows desktop app](#-desktop-app) if you'd rather not use a browser).
2. Open the file in any modern browser (Chrome, Edge, or Firefox — just double-click it).
3. Click **🌐 Browse Themes** to pick a starting point from the live community collection — or drag your own `theme.json` onto the page, or use **Open theme.json**.
   - Don't have one yet and don't want to browse? Grab **[`sample.json`](sample.json)** from this repo — a real, complete theme file you can load straight in and start tweaking.
4. Edit anything using the generated form — colors, image paths, numbers, toggles, all of it.
5. Hit **Download .zip** to export your theme complete with its background, logo, and audio — or **Submit to A-Theme** to send it in for the public collection.

No build step. No dependencies. No install. It's one HTML file.

---

## 📖 How to Use

### Loading a theme
You can get a theme into the editor four ways:
- **Browse the community database** — click **🌐 Browse Themes**, search the live list pulled from this repo's `themes.json`, and click one. It downloads and extracts that theme's `.zip` right in your browser (no server involved — an embedded copy of [JSZip](https://stuk.github.io/jszip/) does the unzipping client-side) and loads its config straight into the editor. Every other file bundled in that zip (logo, background image, audio) stays available too, so previews work immediately without any extra setup.
- **Drag and drop** your own `theme.json` onto the page
- Click **📂 Open theme.json** and pick it from a file dialog
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
Click **⬇ Download .zip** at any time to save your theme as a complete package — the edited `theme.json` alongside its background image, logo, and audio file, ready to extract straight to `switch/tinfoil/themes/` on your SD card. If an asset can't be included (a `sdmc:/` device path with no local file browsed for it, or a host that blocks direct fetching), it's reported in the download message rather than quietly left out.

Use **↺ Reset** to discard changes and start over from the originally loaded file.

### Submitting your theme

Click **📤 Submit to A-Theme** to send your creation in for the public collection. The flow walks you through naming it, crediting yourself, and downloading your `.zip`, then opens a prefilled submission on [A-Theme/Tinfoil-Themes](https://github.com/A-Theme/Tinfoil-Themes) — you just drag your `.zip` into it and hit submit.

All you need is a free GitHub account; there are no tokens to create or settings to configure. Nothing is uploaded by the editor itself — your file goes straight from your computer to GitHub when you attach it. Submissions are reviewed before being added to the collection.

---

## 🧬 Supported Theme Format

This editor targets Tinfoil's `theme.json` schema, structured like:

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

Prefer not to open a browser? A packaged Windows desktop version is available on the [**Releases**](../../releases/latest) page — same app, wrapped in its own window with a taskbar icon, no browser required.

**[⬇ Download the latest Windows build](../../releases/latest)**

> **Note:** it ships as a folder, not a single `.exe` — that's normal for Electron-based apps, which bundle a full runtime alongside the executable. Unzip the whole folder and run the `.exe` from inside it.

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
If your `theme.json` points to an `sdmc:/` path, that's a Nintendo Switch SD card path a browser can't reach on its own. If you loaded the theme via **🌐 Browse Themes**, this is already handled automatically — its bundled logo/audio files are used directly. If you loaded a `theme.json` manually and it references local files you don't have, use the **Browse local file** option in the Logo or Music panel to preview the actual file from your computer instead.

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

## 📜 License

MIT — do whatever you'd like with it.

---

<div align="center">

Made by **Aramaki** · part of the [A-Theme](https://github.com/A-Theme) project

</div>

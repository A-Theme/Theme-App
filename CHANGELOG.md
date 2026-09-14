# Changelog

Notable changes per release. The release workflow reads the section matching
the version being built and uses it as the release body, so this file is the
one place release notes are written.

## 2.1.0

Two editors under one name, and the RomM one grew up.

### Browse the published catalog

The RomM editor now reads the same `manifest.json` the console reads, lists
every theme in [RomM-Themes](https://github.com/A-Theme/RomM-Themes) with what
each one changes, and opens one straight into the editor — background, font,
mascot and music downloaded with it. The quickest way to start a new theme is
usually to open the nearest published one and change what you want.

The URL handling deliberately mirrors the client's own `theme_catalog.cpp`:
percent-encoding matches byte for byte, and a manifest row whose folder is not
a plain safe name is dropped exactly as the client drops it.

### Motion and animation actually play

`drift`, `pan` and `zoom` move in the preview, sprite sheets step through their
frames, and moving a slider retunes the motion instead of restarting it.

The arithmetic is a port of the client's `theme_motion.cpp` — the same triangle
wave, the same cosine easing, the same grow-before-translate that stops a moving
background uncovering a screen edge. A preview running its own approximation
would be worse than none, because it would look authoritative while being wrong.
`tests/check-motion.mjs` holds it to that: 6336 inputs through both
implementations, byte-identical output required. It earned its place
immediately — the console computes in 32-bit float, and the first port was a
whole pixel off at some timestamps.

### Import a whole theme, not just its JSON

A `theme.json` only *names* its background, so importing one file used to give
you colours and five dangling references. Import now takes a **folder**, a
**`.zip` pack**, or a bare `theme.json`, and fills in exactly the files the
theme asks for. The zip reader handles both stored and deflated entries, so a
pack this editor exported and one re-zipped by any other tool both work.

### 20 starting palettes

Up from 4. Each sets all 19 colour roles and is contrast-checked on the pairs
that actually break a theme — body text over all three surfaces, muted text,
the focus ring, and whatever sits on an accent fill — so a palette is a safe
base rather than a swatch dump you then have to make legible.

### Honest previews

- An animation over the 48 MB texture budget or the 240-frame cap falls back to
  the still image, which is what the client does with it, and says so
- The sprite sheet on disk is measured, so declaring 30 frames of a sheet that
  holds 8 is an error naming the real grid rather than frames that never draw
- A background that is not 1280x720 is flagged, and `drift`/`pan` say how much
  of the edges they will crop

### One name

Both editors are now **Aramaki's Theme Editor**, each saying which app it edits
underneath. The browser tab and installed app keep the target, since that is
where two identically named pages would collide. The banners said "Tinfoil
Theme Editor" long after that stopped being true; they don't now.

### Under the hood

- The background layer survives a re-render, so dragging a slider no longer
  restarts a playing GIF or re-decodes a multi-megabyte data URL
- The animation loop stops entirely when nothing is moving, rather than holding
  a 60 fps callback open for the life of the tab
- Desktop builds are produced by CI on a tag, so release artifacts are built
  from exactly the commit the tag points at — and the Windows build runs on
  Windows, so the executable keeps its icon and version metadata

## 2.0.1

**Exported themes now use `settings.json`.** The zip export was writing the
config as `theme.json`, a filename Tinfoil does not read, so themes built in the
editor would appear installed and silently fall back to the default. The editor
still accepts either name when opening a zip; only the export path changed.

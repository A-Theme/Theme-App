# Changelog

Notable changes per release. The release workflow reads the section matching
the version being built and uses it as the release body, so this file is the
one place release notes are written.

## Unreleased

### Transparency on a slider

Every colour row now has an opacity slider beside its hex box. Every role takes
alpha in this client — the renderer blends all of them, not just `scrim` — but
a native colour input cannot express alpha, so until now the only way to make a
surface translucent was to hand-type two hex digits on the end of the value.

The slider's track runs from clear to that role's own colour over a checker, so
it shows what it does without a label. Dragging to full opacity writes six hex
digits rather than `#RRGGBBFF`, so an opaque role stays equal to its default
instead of showing up as changed in all 19 rows, and picking a new hue keeps
whatever alpha the role already had rather than quietly making it opaque.

### Focus effects in the preview

The six effects the client can draw around the selected item — `smoke`,
`embers`, `glow`, `shimmer`, `pulse` and `fade` — now run in the editor
preview, on the focused library card, the focused button on the detail screen,
and the button inside a dialog. They are procedural: no art ships with them and
they cost no memory, so the only thing to judge is whether they look right,
which is exactly what a preview is for.

Set through a new **Focus effect** panel: kind, speed, amount, and a colour
*role* rather than a hex, so the effect moves with the palette instead of being
the one part of a theme that ignores it. It writes and reads
`effects.focus` in `theme.json`.

As with motion, the maths is a port of the client's own `theme_effects.cpp` —
the same hash, the same particle lifetimes, the same clamps — and
`tests/check-effects.mjs` holds it there: 8606 inputs through both
implementations, with floats compared as raw 32-bit patterns rather than printed
decimals, because C and JavaScript break a rounding tie in opposite directions.
`tests/check-effect-preview.mjs` then checks the pixels: every kind paints, an
effect that is off paints nothing, and nothing ever reaches more than 26px
outside the element it decorates, which is the budget the client's renderer
clips to.

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

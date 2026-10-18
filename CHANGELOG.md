# Changelog

Notable changes per release. The release workflow reads the section matching
the version being built and uses it as the release body, so this file is the
one place release notes are written.

## 2.5.1

- **Tinfoil wallpapers are scaled to the screen.** CyberFoil draws a
  wallpaper at its own size and never scales it, so a 1920×1080 Tinfoil
  wallpaper showed only its top-left two-thirds, with the frame art Tinfoil
  themes bake into them cut off mid-shape. Every wallpaper is now fitted to
  1280×720 on the way in, and the checks say when one was.
- **Invisible Tinfoil colours stay invisible-looking.** A Tinfoil colour at
  zero alpha was never seen, so its RGB is whatever was left there —
  Mewtwo2's menu is a tan nobody chose. Making such a bar opaque for
  legibility now uses black, which CyberFoil's white icons are drawn for.
- **Best-effort legibility.** Where a theme's text and surface colours are
  too close to reach the contrast bar even opaque, the bar now takes the
  opacity that reads best rather than staying see-through, and the report
  gives the ratio it reached. Across the 170 Tinfoil themes, readability
  errors fall from 66 to 53.

## 2.5.0

### A third editor: CyberFoil

[CyberFoil](https://github.com/luketanti/CyberFoil) 1.5.0 reads external
themes, and `cyberfoil-theme-editor.html` makes them: eleven colour roles, a
wallpaper, a banner, seventeen icons and two mascots, previewed on its main
menu, SD card list, install queue and install screens, with an OLED-mode
toggle for the other set of defaults. It installs as its own app and has a
card on the launcher.

### Every RomM theme, converted

A RomM theme dropped into CyberFoil's theme folder does not show up at all —
CyberFoil skips any theme whose `version` is not the number 1, and RomM themes
carry version strings. The editor converts one instead: from the catalog, a
folder or a pack. Roles are mapped so the pairs that decide legibility stay
pairs, the background is darkened by the theme's own `dim` in the pixels, and
the theme's font draws its banner. Everything CyberFoil has no slot for is
listed after the conversion. Run over all 160 themes in RomM-Themes, every one
is listed by CyberFoil with all eleven colours and its images, and none fails a
readability check.

### Every Tinfoil theme, converted

*Convert a theme* has a Tinfoil tab reading the Tinfoil-Themes database, and
a Tinfoil `.zip` or folder imports the same way. Colours are read by what they
do in Tinfoil's layout, the logo is fitted into the part of the banner both
CyberFoil layouts show, BMPs are redrawn as PNG, and HOME-menu patch files are
listed and left out. Where a see-through Tinfoil menu would leave text
unreadable over its wallpaper, that bar's opacity is raised just far enough —
its hue is kept — and the report says so. All 170 themes in the database
convert and are listed by CyberFoil.

### Mascots, and "Remove anime"

CyberFoil's two anime mascots can each take your own art or be hidden. A
theme cannot delete a built-in image — an empty path is refused and the
built-in comes back — so hiding one ships a 1×1 transparent PNG, which
CyberFoil accepts and draws as nothing. Converted RomM themes hide them by
default. The preview has a **Remove anime** toggle for CyberFoil's setting of
that name, which also draws the banner 113px further left; generated banners
keep the theme's name in the part both layouts show.

### Checked by CyberFoil's own loader

The editor's verdicts — listed or not, under what name, which colours and
images survive — come from a port of CyberFoil's `theme.cpp`.
`tests/check-cyberfoil.mjs` compiles the real `theme.cpp` on the host and
requires the port to agree with it on 5186 cases;
`tests/check-cyberfoil-export.mjs` points the port at the editor's own
exported packs.

## 2.4.0

- **The catalog shows each theme's background.** A row used to carry four
  colour bands, which tell you a palette and nothing about what the theme
  looks like. It now shows the background art itself — animated, for the
  themes whose background moves.

  Not the background file: those average about 1.3 MB and a scroll through
  160 rows would have been a couple of hundred megabytes. RomM-Themes
  publishes a 16:9 crop of each one at around 19 KB and names it in the
  manifest, so a row costs roughly a seventieth of what the real background
  would — and one request fewer than the colour bands did, since those had
  to read the theme.json first. A theme published without a thumbnail, or
  one whose thumbnail cannot be fetched, still gets its colour bands.
- The splash preview said the console was running v2.3.0. That is the client's
  version, not the editor's, and the client has been on 2.4.5 since before the
  editor's own 2.3.0 went out. It now reads from a single named constant, so
  there is one place to change and one place to look.

## 2.3.0

- **Eleven border treatments.** The client gained focus effects that replace
  the ring rather than decorating it — `ring`, `runner`, `gradient`,
  `notched`, `ticks`, `breathe`, `rails`, `sidebar`, `brackets`,
  `inner_glow`, `lift` — and the editor now offers all of them and previews
  them live. The kind picker groups them apart from the six that decorate the
  ring, because they behave differently: the standard focus ring is not drawn
  over a border treatment.
- The effect parity test grew from 8606 rows to 16133, covering the border
  geometry as well: the inward normals, each point's segment, the per-kind
  cycle period, and `amount` mapped onto each kind's own range. Two float
  divergences it caught are worth knowing about — the C++ rounds a multiply to
  float before adding where JavaScript would keep double precision throughout,
  and it uses a 14-digit pi literal rather than `Math.PI`, which matters when
  the result is `sin(180°)` and the whole value is rounding error.
- Both test grids are now walked from the kind table instead of a hand-written
  list, so a kind added to either side is compared without anyone remembering.

## 2.2.0

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

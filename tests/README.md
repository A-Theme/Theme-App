# Tests

## `check-motion.mjs`

Proves the RomM editor's background-motion preview matches the client's, by
running both over the same grid of inputs and requiring identical output.

```bash
npm i -D playwright
node tests/check-motion.mjs
```

`motion-reference.txt` is the **client's** output, produced by
`tests/dump_motion.cpp` in `romm-switch-client`. It is checked in on purpose:
it is the contract between two codebases that have to agree, and a diff in it
is how you find out the editor needs updating.

The arithmetic is done in 32-bit float on the console, so the port rounds every
step through `Math.fround` and uses the client's own `3.14159265f` rather than
`Math.PI`. Without that the two drift a whole pixel apart at some timestamps —
which is exactly what this test caught the first time it ran.

## `check-effects.mjs`

The same contract, for the focus effect. `effects-reference.txt` is the client's
own output from `tests/dump_effects.cpp` in `romm-switch-client`:

```bash
g++ -std=c++17 -Isource -Itests/stubs tests/dump_effects.cpp \
    source/ui/theme_effects.cpp -o /tmp/dumpfx \
    && /tmp/dumpfx > ../Theme-App/tests/effects-reference.txt

node tests/check-effects.mjs
```

Floats are compared as their raw 32-bit patterns rather than as printed
decimals. The first run disagreed on eight rows out of 8606, all of them the
*same* number: C's `printf` rounds a tie to even and JavaScript's `toFixed`
rounds it away from zero, so `1031.0078125` prints as `...812` in one and
`...813` in the other. Comparing bits removes the question.

## `check-effect-preview.mjs`

`check-effects.mjs` proves the arithmetic. This one proves the arithmetic
reaches the screen: every kind paints at every clock, an effect that is off
paints nothing, nothing escapes the client's 26px bleed budget, each mock screen
puts the effect where the client puts focus, the 60fps loop runs only while
something is actually moving, and a `theme.json` round trip preserves the
effect while dropping exactly what the client would drop.

```bash
node tests/check-effect-preview.mjs
```

## `check-color-alpha.mjs`

The per-role opacity slider, and the two quiet ways it could go wrong: writing
`#RRGGBBFF` at full opacity (which would mark all 19 roles changed against
their 6-digit defaults and bloat every exported theme), and a colour picker that
drops the alpha, silently making a translucent surface opaque.

```bash
node tests/check-color-alpha.mjs
```

## `check-cyberfoil.mjs`

The CyberFoil editor's checks and preview stand on a port of CyberFoil's
theme loader, `source/util/theme.cpp` in
[luketanti/CyberFoil](https://github.com/luketanti/CyberFoil). This holds the
port to the C++ the same way `check-motion.mjs` does for the RomM client:

```bash
node tests/check-cyberfoil.mjs
```

`cyberfoil/cases.json` describes a theme folder — 58 files, valid and broken —
plus colour strings, fallbacks and asset paths. `cyberfoil/dump_theme.cpp`
compiles CyberFoil's own `theme.cpp`, unmodified, against the stubs in
`cyberfoil/stubs/` (Plutonium's `Color::FromHex` copied verbatim, a PNG-header
`IMG_Load`, no libnx), writes the folder to disk and prints every decision the
loader makes; `cyberfoil/reference.txt` is that output. CyberFoil is not our
repository, so the dump tool lives here, and is run from a CyberFoil checkout:

```bash
g++ -std=c++17 -I../Theme-App/tests/cyberfoil/stubs -Iinclude -I. \
    ../Theme-App/tests/cyberfoil/dump_theme.cpp -o /tmp/dumpcf \
  && /tmp/dumpcf ../Theme-App/tests/cyberfoil/cases.json \
     > ../Theme-App/tests/cyberfoil/reference.txt
```

The cases are the edges the format actually has: a name measured in UTF-8
bytes rather than characters, `"version": 1.0` accepted where `"1"` is not,
an extension test that treats `.json` alone as having none, object keys
visited in byte order (which decides `background` against `background.jpg`),
and a default's alpha multiplied into a theme colour with integer division.

## `check-cyberfoil-export.mjs`

Points that proven loader at the editor's own output. A RomM theme carrying
everything CyberFoil cannot — motion, a sprite sheet, a focus effect, music —
is converted and exported, and the pack must be listed by the picker under
its name, keep all 11 colours and every image, carry the background darkened
by its own `dim` in the pixels, report each thing it left behind, and read
back to the same `theme.json`. Every starting palette must also pass the
readability checks.

```bash
node tests/check-cyberfoil-export.mjs
```

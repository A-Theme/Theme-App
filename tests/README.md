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

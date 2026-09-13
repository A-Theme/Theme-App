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

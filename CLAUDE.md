# CLAUDE.md

## Project

Barline is a static lead sheet maker for bands. It runs directly from `index.html` with no server, build step, package manager, or external runtime dependency.

## Commands

```bash
node --test tests/app.test.js
node --check app.js
```

There is no install command.

## Development Rules

- Keep the app static: edit `index.html`, `style.css`, and `app.js` directly.
- Do not add external libraries unless explicitly requested.
- Prefer small pure helper functions for layout, normalization, and SVG generation.
- Preserve localStorage JSON compatibility through `normalizeState()`.
- User-authored chord spelling should be preserved. Generated preview output may follow accidental preference or transpose settings.
- Bundled fonts live in `assets/`; do not replace them with network font loading.

## Important Files

- `index.html`: static UI structure
- `style.css`: editor, preview, print, and bundled font declarations
- `app.js`: state, normalization, rendering, import/export, tests target this file
- `tests/app.test.js`: Node test suite using DOM/localStorage stubs
- `ARCHITECTURE.md`: implementation notes and layout model
- `LICENSE`: MIT license for project code

## Layout Notes

- Preview staff is SVG, not canvas.
- Page layout uses row-weight constants in `app.js`; if print spacing changes, update tests and verify print preview.
- `chords[].position` is serialized but not used for arbitrary placement. Chords are displayed by slot order across equally divided bar width.

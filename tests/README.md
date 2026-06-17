## Canonical Cases

`canonical-cases.js` holds fixed preview scenarios used for regression checks before and during layout work.

Current cases:

- `baseline`: simple 4/4 reference
- `denseChords`: long chords, many slots, degree notation
- `denseBarHead`: key/time changes at bar heads
- `topLane`: endings, section marks, segno, coda
- `bottomLane`: `to Coda`, `Fine`, `D.C.`, `D.S.`
- `multipage`: multi-page flow with `continued` and `sectionHead`
- `sparsePage`: short score for vertical-spacing regression
- `longText`: long ending text and long section note

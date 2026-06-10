# Architecture

Barline is a static HTML/CSS/JavaScript app. There is no build step, server, framework, or package dependency. The app state lives in `app.js` and is rendered into two surfaces:

- editor UI: `renderEditor()`
- print preview: `renderSheet()`

## State Shape

The normalized top-level state is:

```js
{
  title: string,
  artist: string,
  key: string,
  tempo: number,
  timeSignature: string,
  accidentalPreference: "sharp" | "flat",
  degreeNotation: boolean,
  transpose: {
    enabled: boolean,
    semitones: number
  },
  sections: [
    {
      label: string,
      note: string,
      bars: [
        {
          chords: [{ text: string, position: number }],
          key?: string,
          timeSignature?: string,
          repeatStart?: boolean,
          repeatEnd?: boolean,
          ending1?: boolean,
          ending2?: boolean,
          endingText?: string,
          toCoda?: boolean,
          coda?: boolean,
          segno?: boolean,
          fine?: boolean,
          dc?: boolean,
          ds?: boolean
        }
      ]
    }
  ]
}
```

`normalizeState()` is the boundary for imported JSON and localStorage. It also upgrades older `{ chord: "C" }` bars into `chords`.

## Render Flow

`saveAndRender()` persists to localStorage and then renders. Persistence is best-effort: if localStorage throws, the app still renders and shows a toast.

`renderEditor()` rebuilds the left editor panel from state. Because it replaces `innerHTML`, it preserves `sectionTabsScrollLeft` around re-rendering so horizontal section-tab scroll is not reset.

`renderSheet()` builds A4 pages through `paginateSections()`. The first page includes the title block; later pages use a continuation header.

## Preview Layout

Rows are selected by:

- `splitSectionRows()`
- `chooseRowBars()`
- `rowCanFit()`

The default target is up to four bars per staff row. If inline key/time changes or many chord slots would squeeze code text too much, the row drops to three, two, or one bar.

The row width model is:

- `STAFF_WIDTH`: full SVG staff width
- `STAFF_INFO_WIDTH`: minimum clef/key/time area
- `MIN_BAR_CONTENT_WIDTH`: minimum space reserved for chord text
- `MAX_BAR_WIDTH`: maximum width for sparse one- or two-bar rows

`distributeBarWidths()` expands bars from their minimum widths. If one bar reaches `MAX_BAR_WIDTH`, the leftover width is redistributed to remaining flexible bars.

## Pagination

`paginateSections()` uses row-weight units rather than live DOM measurement. These constants are intentionally named because they are coupled to print CSS:

- `FIRST_PAGE_ROW_CAPACITY`
- `CONTINUATION_PAGE_ROW_CAPACITY`
- `STAFF_ROW_WEIGHT`
- `STAFF_ROW_WITH_HEADING_WEIGHT`

Section headings are rendered only when `startIndex === 0`. If a page break occurs in the middle of a section, the continuation page intentionally omits the rehearsal mark to avoid confusing `[C]`-style marks with a new section start.

If print spacing changes, update these constants and verify with browser print preview or PDF output.

## SVG Coordinates

The staff is hand-rendered with SVG. Key constants:

- `STAFF_VERTICAL_SHIFT`: global vertical shift for staff symbols
- `CLEF_FONT_SIZE`, `CLEF_BASELINE_Y`
- `KEY_SIGNATURE_FONT_SIZE`
- `TIME_SIGNATURE_FONT_SIZE`
- `CHORD_FONT_SIZE`

Music glyphs use the bundled Bravura font. Degree roman numerals use the bundled `Barline Noto Serif` font.

## Chord Slots And `position`

`chords[].position` is stored for compatibility, but current rendering does not honor arbitrary position values. The preview divides a bar by the number of chord slots and places chords by slot order:

```js
chordX = chordAreaX + chordAreaWidth * (chordIndex / slotCount) + 6
```

On import and edit, `renumberChordPositions()` rewrites positions based on slot order. Treat `position` as serialized metadata for future compatibility, not as an active layout input.

## Accidental Preference

Switching `♯ 優先` / `♭ 優先` recalculates song and bar keys. It does not rewrite user-entered chord text. That is intentional: original chord spelling is user-authored data, while transposed preview chord names are generated and follow the selected accidental preference.

## Tests

Run:

```bash
node --test tests/app.test.js
node --check app.js
```

The test suite uses a small DOM/localStorage stub and evaluates `app.js` in a Node VM. Keep tests focused on normalization, layout decisions, generated SVG/HTML, and regression-prone constants.

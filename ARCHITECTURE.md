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
      continued: boolean,
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
          ds?: boolean,
          sectionHead?: boolean
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
- `MIN_BAR_CONTENT_WIDTH`: minimum space reserved for chord text
- `MAX_BAR_WIDTH`: maximum width for sparse one- or two-bar rows

Bar minimum width is no longer based on slot count alone. `minimumChordAreaWidth()` estimates the rendered chord demand from:

- slot count
- whether slots are empty
- approximate width of the displayed chord text after transpose / degree formatting
- extra density penalty for slots beyond four

`minimumBarWidth()` then adds inline key/time-change width on top of that chord-area estimate. This means long chords, degree notation, and high slot counts can reduce bars-per-row even when the raw slot count matches a simpler bar elsewhere.

`staffHeaderWidth()` sets where the first bar starts (`barStart`). It is the clef/key area plus a time-signature allowance sized to the time signature's digit count (`TIME_SIGNATURE_DIGIT_WIDTH` per digit) and a small `TIME_SIGNATURE_RIGHT_MARGIN`. This keeps two-digit meters such as `12/8` clear of the first bar line while removing the dead space narrow keys previously inherited from a fixed minimum. Because `barStart` also defines `availableWidth = STAFF_WIDTH - barStart`, changing these constants shifts how many bars fit per row; re-verify row splitting and print pagination after tuning them.

`distributeBarWidths()` expands bars from their minimum widths. If one bar reaches `MAX_BAR_WIDTH`, the leftover width is redistributed to remaining flexible bars.

## Pagination

`paginateSections()` uses row-weight units rather than live DOM measurement. These constants are intentionally named because they are coupled to print CSS:

- `FIRST_PAGE_ROW_CAPACITY`
- `CONTINUATION_PAGE_ROW_CAPACITY`
- `STAFF_ROW_WEIGHT`
- `STAFF_ROW_WITH_HEADING_WEIGHT`

Section headings are rendered only when `startIndex === 0`. If a page break occurs in the middle of a section, the continuation page intentionally omits the rehearsal mark to avoid confusing `[C]`-style marks with a new section start.

A section opens with a double bar line on the left of its head bar, drawn by `renderStaffRow()` for any section-start bar that does not already carry a repeat-start sign. `paginateSections()` collects these head offsets in a `sectionStarts` set and passes it to `renderStaffRow()`; when omitted (standalone calls) the row's first bar is treated as the start. A row that only continues a section midway does not get this line.

A bar flagged `sectionHead` moves a section's head off its first bar — for example a coda whose downbeat follows a pickup bar. `sectionHeadOffset()` returns the offset of the first such bar (default 0). Bars before the head render as a lead-in with no mark or double bar line. Because the head is no longer the section's first bar, its rehearsal mark is drawn inline rather than as a block heading. The editor only offers the toggle for bars after the first, and `normalizeState()` drops the flag if it lands on bar 0.

A section with `continued: true` is laid out on the same staff rows as the preceding section instead of starting a fresh line. `groupSections()` collects a lead section plus its continued followers, and `paginateSections()` concatenates their bars before row splitting. The lead section keeps its block heading when its head is the first bar; otherwise (and for every continued follower) the rehearsal mark is drawn inline (`inlineSectionMark()`) in the staff SVG above the head bar. The first section of a group can never be continued, so the editor only offers the continue toggle for sections after the first.

Segno and Coda signs (`segnoSymbol()` / `codaSymbol()`) are positioned from their own bar's left edge, not a fixed coordinate. The elements that share a bar's top-left are laid out left-to-right so they never collide: an ending bracket's number, then the inline section mark (`sectionMarkWidth()`), then the sign. A bar that begins with a repeat-start sign does not also get a plain double bar line — the repeat sign is the divider. Bottom-of-bar navigation labels (`barNavigationDirections()`) are clamped to the bar's left edge so a crowded bar never spills them into its neighbour, and an inline section note (`clampNoteText()`) is trimmed to the room left before the staff ends since SVG text cannot wrap.

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

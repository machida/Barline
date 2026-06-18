const assert = require("node:assert/strict");
const fs = require("node:fs");
const test = require("node:test");
const vm = require("node:vm");
const canonicalCases = require("./canonical-cases");

const DEFAULT_STATE = {
  title: "Audit",
  artist: "Tester",
  key: "C",
  tempo: 120,
  timeSignature: "4/4",
  sections: [
    {
      label: "A",
      bars: [
        { chords: [{ text: "C" }, { text: "" }, { text: "F" }, { text: "G" }, { text: "Am" }] },
        { key: "G", timeSignature: "3/4", repeatStart: true, chords: [{ text: "D" }, { text: "" }, { text: "G" }] }
      ]
    }
  ]
};

function makeElement() {
  return {
    value: "",
    checked: false,
    disabled: false,
    innerHTML: "",
    textContent: "",
    classList: { add() {}, remove() {}, toggle() {} },
    addEventListener() {},
    querySelector() { return null; },
    querySelectorAll() { return []; },
    setAttribute() {}
  };
}

function loadApp(savedState = DEFAULT_STATE, options = {}) {
  const nodes = new Map();
  const selectors = [
    "#title", "#artist", "#key", "#tempo", "#time-signature", "#accidental-preference",
    "#transpose-enabled", "#transpose-amount", "#degree-enabled", "#sections-editor", "#sheet",
    "#toast", ".song-editor", ".editor-tabs", "#add-section", "#export-json", "#import-json",
    "#reset-sheet", "#print-sheet"
  ];
  selectors.forEach((selector) => nodes.set(selector, makeElement()));

  const context = {
    console,
    setTimeout,
    clearTimeout,
    localStorage: {
      getItem() { return JSON.stringify(savedState); },
      setItem: options.setItem || (() => {})
    },
    document: {
      querySelector(selector) {
        if (!nodes.has(selector)) nodes.set(selector, makeElement());
        return nodes.get(selector);
      },
      querySelectorAll() { return []; }
    },
    window: { print() {} },
    Blob: function Blob() {},
    URL: { createObjectURL() { return ""; }, revokeObjectURL() {} }
  };

  vm.createContext(context);
  vm.runInContext(`${fs.readFileSync("app.js", "utf8")}
globalThis.__barlineTest = {
  elements,
  state,
  CLEF_BASELINE_Y,
  CLEF_FONT_SIZE,
  DEFAULT_TEMPO,
  FIRST_PAGE_ROW_CAPACITY,
  KEY_SIGNATURE_BASELINE_OFFSET,
  MAX_BAR_WIDTH,
  MAX_TEMPO,
  MIN_TEMPO,
  STAFF_VERTICAL_SHIFT,
  STAFF_WIDTH,
  CONTINUATION_PAGE_ROW_CAPACITY,
  codaSymbol,
  clampEndingLabel,
  chordSlotLayout,
  chordSlotMetrics,
  distributeBarWidths,
  endingLabel,
  formatPreviewChord,
  inlineSectionMark,
  isRecognizedChord,
  normalizeChordText,
  minimumBarWidth,
  minimumChordAreaWidth,
  normalizeState,
  parseChordRoot,
  previewChordText,
  paginateSections,
  saveAndRender,
  renderStaffRow,
  segnoSymbol,
  splitSectionRows,
  staffRowLayout,
  toCodaText
};
`, context);
  return context.__barlineTest;
}

test("normalizes chord slots without blank flags", () => {
  const app = loadApp();
  const normalized = app.normalizeState({
    title: "Slots",
    key: "C",
    timeSignature: "4/4",
    sections: [{ label: "S", bars: [{ chords: [
      { text: "C" }, { text: "" }, { text: "F" }, { text: "G" }, { text: "Am" }, { text: "" }
    ] }] }]
  });

  assert.equal(normalized.sections[0].bars[0].chords.length, 6);
  assert.deepEqual(normalized.sections[0].bars[0].chords.map((slot) => slot.text), ["C", "", "F", "G", "Am", ""]);
  assert.equal("blank" in normalized.sections[0].bars[0].chords[1], false);
});

test("normalizes common chord input mistakes", () => {
  const app = loadApp();

  assert.equal(app.normalizeChordText("ｃ＃△７ / ｇｂ"), "C♯maj7/G♭");
  assert.equal(app.normalizeChordText("A-7"), "Am7");
  assert.equal(app.normalizeChordText("C+7"), "Caug7");
  assert.equal(app.normalizeChordText("Cø"), "Cm7♭5");
  assert.equal(app.normalizeChordText("CM7"), "Cmaj7");
  assert.equal(app.normalizeChordText("CM9"), "Cmaj9");
  assert.equal(app.normalizeChordText("CM13"), "Cmaj13");
  assert.equal(app.normalizeChordText("CM6"), "Cmaj6");
  assert.equal(app.normalizeChordText("CMaj7"), "Cmaj7");
  assert.equal(app.normalizeChordText("CMAJ7"), "Cmaj7");
  assert.equal(app.normalizeChordText("Cm"), "Cm");
});

test("recognizes chord roots after normalization", () => {
  const app = loadApp();

  assert.equal(app.isRecognizedChord("Gm7b9"), true);
  assert.equal(app.isRecognizedChord("Gmm7"), false);
  assert.equal(app.isRecognizedChord("H7"), false);
  assert.equal(app.isRecognizedChord(""), true);
  assert.equal(app.isRecognizedChord("   "), true);
  const parsed = app.parseChordRoot("Em/G");
  assert.equal(parsed.root, "E");
  assert.equal(parsed.suffix, "m");
  assert.equal(parsed.bass, "G");
});

test("normalizes tempo consistently", () => {
  const app = loadApp();

  assert.equal(app.normalizeState({ key: "C", tempo: "", sections: [] }).tempo, app.DEFAULT_TEMPO);
  assert.equal(app.normalizeState({ key: "C", tempo: 1, sections: [] }).tempo, app.MIN_TEMPO);
  assert.equal(app.normalizeState({ key: "C", tempo: 999, sections: [] }).tempo, app.MAX_TEMPO);
});

test("continues rendering when localStorage save fails", () => {
  const app = loadApp(DEFAULT_STATE, {
    setItem() {
      throw new Error("quota exceeded");
    }
  });

  app.elements.sheet.innerHTML = "";
  assert.doesNotThrow(() => app.saveAndRender());
  assert.match(app.elements.sheet.innerHTML, /sheet-page/);
  assert.match(app.elements.toast.textContent, /自動保存に失敗/);
});

test("renders Bravura music symbols and fixed notation sizes", () => {
  const app = loadApp();
  const sheetHtml = app.elements.sheet.innerHTML;

  assert.match(sheetHtml, /Bravura/);
  assert.match(sheetHtml, /font-size="10.5"/);
  assert.match(sheetHtml, /font-size="36"/);
  assert.match(sheetHtml, /font-size="32"/);
  assert.match(sheetHtml, /font-size="30"/);
  assert.equal(app.CLEF_FONT_SIZE, 36);
  assert.equal(app.CLEF_BASELINE_Y, 70);
  assert.equal(app.KEY_SIGNATURE_BASELINE_OFFSET, 0);
  assert.equal(sheetHtml.includes("Key:"), false);
});

test("keeps repeat-start, inline key signature, and time change in order", () => {
  const app = loadApp();
  const repeatRowBars = app.state.sections[0].bars;
  const repeatRows = app.splitSectionRows(repeatRowBars, app.state.key, app.state.timeSignature);
  const firstRepeatRow = app.renderStaffRow([repeatRowBars[1]], app.state.key, app.state.timeSignature, repeatRowBars, 1).html;
  const changedBarX = app.staffRowLayout([repeatRowBars[1]], app.state.key, app.state.timeSignature).barStart;

  assert.equal(repeatRows.map((row) => row.bars.length).join(","), "2");
  assert.match(firstRepeatRow, new RegExp(`x1="${changedBarX}" y1="${43 + app.STAFF_VERTICAL_SHIFT}"`));
  assert.match(firstRepeatRow, new RegExp(`cx="${changedBarX + 10}"`));
  assert.match(firstRepeatRow, new RegExp(`x="${changedBarX + 24}"`));
});

test("auto-wraps preview rows when inline changes need more room", () => {
  const app = loadApp();
  const stress = app.normalizeState({
    title: "Stress",
    key: "C",
    timeSignature: "4/4",
    sections: [{ label: "S", bars: [
      { key: "F#", timeSignature: "7/8", repeatStart: true, chords: Array.from({ length: 8 }, (_, index) => ({ text: index % 2 ? "" : "F#" })) },
      { chords: Array.from({ length: 8 }, (_, index) => ({ text: index % 2 ? "" : "G#" })) },
      { chords: Array.from({ length: 8 }, (_, index) => ({ text: index % 2 ? "" : "A" })) },
      { chords: Array.from({ length: 8 }, (_, index) => ({ text: index % 2 ? "" : "B" })) }
    ] }]
  });
  const stressRows = app.splitSectionRows(stress.sections[0].bars, stress.key, stress.timeSignature);
  const threeBarLayout = app.staffRowLayout(stressRows[0].bars, stress.key, stress.timeSignature);

  assert.ok(stressRows.length > 1);
  assert.ok(stressRows[0].bars.length < 4);
  assert.ok(
    Math.round(threeBarLayout.barStart + threeBarLayout.barWidths.reduce((total, width) => total + width, 0)) <= app.STAFF_WIDTH
  );

  const singleLayout = app.staffRowLayout([stress.sections[0].bars[3]], "F#", "7/8");
  assert.ok(singleLayout.barWidths[0] >= app.minimumBarWidth(stress.sections[0].bars[3], "F#"));
});

test("redistributes extra row width after narrow bars hit their maximum", () => {
  const app = loadApp();
  const widths = app.distributeBarWidths([160, 112], 340);

  assert.equal(widths.map(Math.round).join(","), "178,162");
  assert.equal(Math.round(widths.reduce((total, width) => total + width, 0)), 340);
});

test("estimates wider minimum widths for denser displayed chord text", () => {
  const plainApp = loadApp({ ...DEFAULT_STATE, degreeNotation: false });
  const denseApp = loadApp({ ...DEFAULT_STATE, degreeNotation: true });
  const shortBar = { chords: [{ text: "C" }, { text: "" }, { text: "F" }, { text: "G" }] };
  const denseBar = { chords: [{ text: "E♭maj9" }, { text: "Gm11" }, { text: "A♭maj7" }, { text: "B♭13" }, { text: "Cm9" }, { text: "F7alt" }] };

  const shortWidth = plainApp.minimumBarWidth(shortBar, "C");
  const denseWidth = plainApp.minimumBarWidth(denseBar, "E♭");
  const denseDegreeWidth = denseApp.minimumBarWidth(denseBar, "E♭");

  assert.ok(denseWidth > shortWidth);
  assert.ok(denseDegreeWidth > denseWidth);
});

test("moves squeezed mid-row key or time changes to the next row", () => {
  const app = loadApp();
  const midChange = app.normalizeState({
    title: "Mid Change",
    key: "C",
    timeSignature: "4/4",
    sections: [{ label: "S", bars: [
      { chords: Array.from({ length: 5 }, () => ({ text: "C" })) },
      { chords: Array.from({ length: 5 }, () => ({ text: "D" })) },
      { chords: Array.from({ length: 5 }, () => ({ text: "E" })) },
      { key: "F#", timeSignature: "7/8", repeatStart: true, chords: Array.from({ length: 8 }, (_, index) => ({ text: index % 2 ? "" : "F#" })) }
    ] }]
  });
  const midRows = app.splitSectionRows(midChange.sections[0].bars, midChange.key, midChange.timeSignature);

  assert.equal(midRows[0].bars.length, 3);
  assert.equal(midRows[1].bars.length, 1);
});

test("wraps editor chord inputs instead of using slot-count scrolling", () => {
  const app = loadApp();

  assert.match(app.elements.sectionsEditor.innerHTML, /＋ コード枠/);
  assert.doesNotMatch(app.elements.sectionsEditor.innerHTML, /ブランク枠/);
  assert.doesNotMatch(app.elements.sectionsEditor.innerHTML, /--slot-count/);
  assert.match(fs.readFileSync("style.css", "utf8"), /grid-template-columns: repeat\(4, minmax\(0, 1fr\)\)/);
});

test("marks unrecognized chord inputs without flagging recognized chords", () => {
  const app = loadApp({
    title: "Recognition",
    key: "C",
    timeSignature: "4/4",
    sections: [{ label: "S", bars: [{ chords: [
      { text: "Gm7b9" },
      { text: "Gmm7" },
      { text: "H7" },
      { text: "" }
    ] }] }]
  });
  const html = app.elements.sectionsEditor.innerHTML;

  assert.match(html, /value="Gm7b9"/);
  assert.doesNotMatch(html, /is-unrecognized[^>]*value="Gm7b9"/);
  assert.match(html, /is-unrecognized[^>]*value="Gmm7"/);
  assert.match(html, /is-unrecognized[^>]*value="H7"/);
  assert.match(html, /title="移調・ディグリー非対応の表記です"/);
  assert.doesNotMatch(html, /is-unrecognized[^>]*value=""/);
});

test("renders degree notation with local Noto Serif only on roman numerals", () => {
  const app = loadApp({ ...DEFAULT_STATE, degreeNotation: true });

  assert.equal(app.formatPreviewChord("C7", "C"), "C7(I7)");
  assert.equal(app.formatPreviewChord("Am/G", "C"), "Am/G(vi/V)");
  assert.equal(app.formatPreviewChord("Dm7♭5", "C"), "Dm7♭5(ii7♭5)");
  assert.equal(app.formatPreviewChord("E7", "Am"), "E7(V7)");
  assert.equal(app.formatPreviewChord("Am", "Am"), "Am(i)");

  const preview = app.previewChordText("Am/G", "C", 100, 25);
  assert.match(preview, /font-family="Barline Noto Serif, serif">vi<\/tspan>/);
  assert.match(preview, /font-family="Barline Noto Serif, serif">V<\/tspan>/);
  assert.match(fs.readFileSync("style.css", "utf8"), /assets\/noto-serif-800\.ttf/);
});

test("renders coda, segno, and to Coda symbols with Bravura glyphs", () => {
  const app = loadApp();

  assert.match(app.codaSymbol(), /x="80" y="12"/);
  assert.match(app.codaSymbol(), /\uE048|/);
  assert.match(app.segnoSymbol(), /x="84" y="12"/);
  assert.match(app.segnoSymbol(), /\uE047|/);
  assert.match(fs.readFileSync("style.css", "utf8"), /top-lane-symbol/);
  assert.match(app.toCodaText(200, 96), />to<\/text>/);
  assert.match(app.toCodaText(200, 96), /font-family="&quot;Barline Directions Serif&quot;, serif"|font-family="\"Barline Directions Serif\", serif"/);
  assert.match(app.toCodaText(200, 96), /\uE048|/);
});

test("stacks Fine, D.C., D.S., and to Coda at the bar bottom-right without overlap", () => {
  const app = loadApp();

  const single = app.renderStaffRow([{ chords: [{ text: "C" }], dc: true }], "C", "4/4").html;
  assert.match(single, /D\.C\./);

  const all = app.renderStaffRow(
    [{ chords: [{ text: "C" }], fine: true, dc: true, ds: true, toCoda: true }],
    "C",
    "4/4"
  ).html;
  assert.match(all, /Fine/);
  assert.match(all, /D\.C\./);
  assert.match(all, /D\.S\./);
  assert.match(all, />to<\/text>/);

  const xOf = (label) => Number(all.match(new RegExp(`<text[^>]* x="([\\d.]+)"[^>]*>${label}<`))[1]);
  const fineX = xOf("Fine");
  const dcX = xOf("D\\.C\\.");
  const dsX = xOf("D\\.S\\.");
  const toX = xOf("to");
  // Each direction is right-aligned and shifted left of the previous, so all four differ.
  assert.equal(new Set([fineX, toX, dsX, dcX]).size, 4);
  // Layout order is right-to-left: Fine (rightmost), to Coda, D.S., D.C.
  assert.ok(dcX < dsX && dsX < toX && toX < fineX);
  assert.match(all, /font-family="\"Barline Directions Serif\", serif"/);
});

test("renders a unified section mark without continuation marker", () => {
  const app = loadApp();
  const heading = app.inlineSectionMark({ label: "C", note: "memo" }, 0, 680);

  assert.match(heading, /section-inline-mark/);
  assert.match(heading, /<div class="rehearsal-mark">C<\/div>/);
  assert.match(heading, /section-note-preview/);
  assert.doesNotMatch(heading, /section-continued|続/);
});

test("omits section mark when a section continues after a page break", () => {
  const app = loadApp();
  const section = {
    label: "C",
    bars: Array.from({ length: 60 }, () => ({ chords: [{ text: "C" }] }))
  };
  const pages = app.paginateSections([section]);
  const secondPageHtml = pages[1].blocks.join("");

  assert.doesNotMatch(secondPageHtml, /rehearsal-mark/);
  assert.doesNotMatch(secondPageHtml, /section-continued|続/);
});

test("packs a section without breakBefore onto the previous section's row", () => {
  const app = loadApp();
  const sections = [
    { label: "A", bars: [{ chords: [{ text: "C" }] }, { chords: [{ text: "F" }] }] },
    { label: "B", breakBefore: false, bars: [{ chords: [{ text: "G" }] }, { chords: [{ text: "C" }] }] }
  ];
  const pages = app.paginateSections(sections);
  const html = pages[0].blocks.join("");

  assert.equal(pages[0].blocks.length, 1);
  assert.match(html, /section-inline-mark/);
  assert.match(html, /<div class="rehearsal-mark">A<\/div>/);
  assert.match(html, /<div class="rehearsal-mark">B<\/div>/);
});

test("keeps breakBefore sections on separate rows", () => {
  const app = loadApp();
  const sections = [
    { label: "A", bars: [{ chords: [{ text: "C" }] }, { chords: [{ text: "F" }] }] },
    { label: "B", breakBefore: true, bars: [{ chords: [{ text: "G" }] }, { chords: [{ text: "C" }] }] }
  ];
  const pages = app.paginateSections(sections);
  const html = pages[0].blocks.join("");

  assert.equal(pages[0].blocks.length, 2);
  assert.match(html, /section-inline-mark/);
  assert.match(html, /<div class="rehearsal-mark">A<\/div>/);
  assert.match(html, /<div class="rehearsal-mark">B<\/div>/);
});

test("normalization maps legacy continued and keeps breakBefore", () => {
  const app = loadApp();
  const normalized = app.normalizeState({
    title: "T", key: "C", timeSignature: "4/4",
    sections: [
      { label: "A", bars: [{ chords: [{ text: "C" }] }] },
      { label: "B", continued: true, bars: [{ chords: [{ text: "G" }] }] },
      { label: "C", breakBefore: true, bars: [{ chords: [{ text: "Am" }] }] }
    ]
  });

  assert.equal(normalized.sections[0].breakBefore, true);
  assert.equal(normalized.sections[1].breakBefore, false);
  assert.equal(normalized.sections[2].breakBefore, true);
});

test("keeps a section-head flag only on later bars", () => {
  const app = loadApp();
  const normalized = app.normalizeState({
    title: "T", key: "C", timeSignature: "4/4",
    sections: [{ label: "A", bars: [
      { sectionHead: true, chords: [{ text: "C" }] },
      { sectionHead: true, chords: [{ text: "G" }] }
    ] }]
  });

  assert.equal(normalized.sections[0].bars[0].sectionHead, undefined);
  assert.equal(normalized.sections[0].bars[1].sectionHead, true);
});

test("moves a section's mark and double bar line to its head bar", () => {
  const app = loadApp();
  const section = {
    label: "Coda",
    bars: [
      { chords: [{ text: "C" }] },
      { chords: [{ text: "F" }] },
      { sectionHead: true, chords: [{ text: "G" }] },
      { chords: [{ text: "C" }] }
    ]
  };
  const pages = app.paginateSections([section]);
  const html = pages[0].blocks.join("");
  const layout = app.staffRowLayout(section.bars, "C", "4/4");
  const headX = layout.barStart + layout.barWidths.slice(0, 2).reduce((total, width) => total + width, 0);

  // The section mark is rendered inline above the head bar.
  assert.doesNotMatch(html, /section-heading/);
  assert.match(html, /section-inline-mark/);
  assert.match(html, /<div class="rehearsal-mark">Coda<\/div>/);

  // The double bar line sits at the head bar, not at the section's first bar.
  assert.match(html, new RegExp(`x1="${headX}"`));
  assert.match(html, new RegExp(`x1="${headX + 4}"`));
  assert.doesNotMatch(html, new RegExp(`x1="${layout.barStart + 4}"`));
});

test("positions coda relative to its bar and beside a section mark", () => {
  const app = loadApp();
  const bars = [{ chords: [{ text: "C" }] }, { coda: true, chords: [{ text: "F" }] }];
  const layout = app.staffRowLayout(bars, "C", "4/4");
  const bar2X = layout.barStart + layout.barWidths[0];

  // The coda sign follows the second bar instead of the old fixed x=80.
  const plain = app.renderStaffRow(bars, "C", "4/4", bars, 0).html;
  const plainX = Number(plain.match(/section-inline-mark top-lane-symbol-only" style="left:([\d.]+)px/)[1]);
  assert.ok(plainX > bar2X && plainX < bar2X + 20);

  // When that bar also opens a section, the sign is rendered inside the same inline mark.
  const withMark = app.renderStaffRow(bars, "C", "4/4", bars, 0, { 1: { label: "Coda" } }).html;
  assert.doesNotMatch(withMark, /top-lane-symbol-only/);
  assert.match(withMark, /<div class="rehearsal-mark">Coda<\/div>[\s\S]*top-lane-symbol/);
  assert.match(withMark, /top-lane-symbol/);
});

test("shifts a coda sign clear of an ending bracket on the same bar", () => {
  const app = loadApp();
  const plainBars = [{ chords: [{ text: "C" }] }, { coda: true, chords: [{ text: "F" }] }];
  const endingBars = [{ chords: [{ text: "C" }] }, { coda: true, ending1: true, chords: [{ text: "F" }] }];

  const plainX = Number(app.renderStaffRow(plainBars, "C", "4/4", plainBars, 0).html.match(/section-inline-mark top-lane-symbol-only" style="left:([\d.]+)px/)[1]);
  const endingX = Number(app.renderStaffRow(endingBars, "C", "4/4", endingBars, 0).html.match(/section-inline-mark top-lane-symbol-only" style="left:([\d.]+)px/)[1]);
  assert.ok(endingX > plainX);
});

test("does not stack a plain double bar line under a repeat-start sign", () => {
  const app = loadApp();
  const bars = [{ repeatStart: true, chords: [{ text: "C" }] }, { chords: [{ text: "G" }] }];
  const layout = app.staffRowLayout(bars, "C", "4/4");
  const html = app.renderStaffRow(bars, "C", "4/4", bars, 0).html;

  // Only the repeat sign's heavy line sits at the bar start — no extra double bar line.
  const atStart = html.match(new RegExp(`x1="${layout.barStart}"`, "g")) || [];
  assert.equal(atStart.length, 1);
  assert.match(html, /circle/);
});

test("trims an inline section note that would overflow the staff", () => {
  const app = loadApp();
  const longNote = "ねこ".repeat(60);
  const bars = [{ chords: [{ text: "C" }] }];
  const html = app.renderStaffRow(bars, "C", "4/4", bars, 0, { 0: { label: "A", note: longNote } }).html;

  assert.match(html, /…/);
  assert.doesNotMatch(html, new RegExp(longNote));
});

test("centralizes ending label precedence", () => {
  const app = loadApp();

  assert.equal(app.endingLabel({ ending1: true }), "1");
  assert.equal(app.endingLabel({ ending2: true }), "2");
  assert.equal(app.endingLabel({ ending3: true }), "3");
  assert.equal(app.endingLabel({ ending1: true, endingText: "3x" }), "3x");
  assert.equal(app.endingLabel(null), "");
});

test("compacts long custom ending labels for display only", () => {
  const app = loadApp();
  const compact = app.clampEndingLabel("Only second chorus repeat", false);
  const short = app.clampEndingLabel("3", false);

  assert.equal(short.text, "3");
  assert.equal(short.compact, false);
  assert.match(compact.text, /…/);
  assert.equal(compact.compact, true);
});

test("renders section final bar as double bar unless repeat-end is set", () => {
  const app = loadApp();
  const bars = [{ chords: [{ text: "C" }] }, { chords: [{ text: "G" }] }];
  const html = app.renderStaffRow(bars, "C", "4/4", bars, 0).html;
  const layout = app.staffRowLayout(bars, "C", "4/4");
  const endX = layout.barStart + layout.barWidths.reduce((total, width) => total + width, 0);

  assert.match(html, new RegExp(`x1="${endX - 4}"`));
  assert.match(html, new RegExp(`x1="${endX}"`));

  const repeatEndHtml = app.renderStaffRow([{ repeatEnd: true, chords: [{ text: "C" }] }], "C", "4/4", [{ repeatEnd: true, chords: [{ text: "C" }] }], 0).html;
  assert.doesNotMatch(repeatEndHtml, /x1="676"/);
});

test("opens a section's first bar with a double bar line unless it has a repeat sign", () => {
  const app = loadApp();
  const bars = [{ chords: [{ text: "C" }] }, { chords: [{ text: "G" }] }];
  const layout = app.staffRowLayout(bars, "C", "4/4");

  // A section start at the head of a row gets a left double bar line.
  const startHtml = app.renderStaffRow(bars, "C", "4/4", bars, 0).html;
  assert.match(startHtml, new RegExp(`x1="${layout.barStart}"`));
  assert.match(startHtml, new RegExp(`x1="${layout.barStart + 4}"`));

  // A row that merely continues a section midway (rowStartIndex > 0) does not.
  const continuationHtml = app.renderStaffRow(bars, "C", "4/4", bars, 3).html;
  assert.doesNotMatch(continuationHtml, new RegExp(`x1="${layout.barStart + 4}"`));

  // A continued section starting mid-row gets a double bar line at its first bar.
  const combined = [{ chords: [{ text: "C" }] }, { chords: [{ text: "F" }] }, { chords: [{ text: "G" }] }, { chords: [{ text: "C" }] }];
  const combinedLayout = app.staffRowLayout(combined, "C", "4/4");
  const startX = combinedLayout.barStart + combinedLayout.barWidths.slice(0, 2).reduce((total, width) => total + width, 0);
  const continuedHtml = app.renderStaffRow(combined, "C", "4/4", combined, 0, { 2: { label: "B" } }).html;
  assert.match(continuedHtml, new RegExp(`x1="${startX}"`));
  assert.match(continuedHtml, new RegExp(`x1="${startX + 4}"`));
});

test("keeps canonical preview scenarios renderable", () => {
  Object.entries(canonicalCases).forEach(([name, fixture]) => {
    const app = loadApp(fixture);
    const normalized = app.normalizeState(fixture);
    const pages = app.paginateSections(normalized.sections.filter((section) => section.bars.length > 0));
    const combinedHtml = pages.map((page) => page.blocks.join("")).join("");

    assert.ok(pages.length >= 1, `${name}: pages should exist`);
    assert.match(combinedHtml, /staff-svg/, `${name}: should render staff rows`);
    assert.doesNotMatch(combinedHtml, /undefined|null/, `${name}: should not emit placeholder text`);
  });
});

test("keeps baseline scenario on a single page with an inline first-bar section mark", () => {
  const app = loadApp(canonicalCases.baseline);
  const normalized = app.normalizeState(canonicalCases.baseline);
  const pages = app.paginateSections(normalized.sections);
  const html = pages[0].blocks.join("");

  assert.equal(pages.length, 1);
  assert.match(html, /section-inline-mark/);
  assert.match(html, /<div class="rehearsal-mark">Intro<\/div>/);
});

test("keeps dense chord scenario split across multiple rows", () => {
  const app = loadApp(canonicalCases.denseChords);
  const normalized = app.normalizeState(canonicalCases.denseChords);
  const rows = app.splitSectionRows(normalized.sections[0].bars, normalized.key, normalized.timeSignature);

  assert.ok(rows.length > 1);
});

test("allocates chord slots wide enough to avoid overlap in dense chords", () => {
  const app = loadApp(canonicalCases.denseChords);
  const normalized = app.normalizeState(canonicalCases.denseChords);
  const bar = normalized.sections[0].bars[0];
  const chordAreaWidth = app.minimumChordAreaWidth(bar, normalized.key);
  const layout = app.chordSlotLayout(bar, normalized.key, 0, chordAreaWidth);

  for (let index = 0; index < layout.length - 1; index += 1) {
    const current = layout[index];
    const next = layout[index + 1];
    assert.ok(current.x + current.textWidth <= next.x, `slot ${index} should not overlap slot ${index + 1}`);
  }
});

test("keeps dense bar-head scenario rendering inline key and time changes", () => {
  const app = loadApp(canonicalCases.denseBarHead);
  const normalized = app.normalizeState(canonicalCases.denseBarHead);
  const html = app.renderStaffRow(normalized.sections[0].bars, normalized.key, normalized.timeSignature, normalized.sections[0].bars, 0).html;

  assert.match(html, /\uE262|/);
  assert.match(html, /\uE087|\uE084||/);
});

test("reserves extra width when key and time changes share a bar head", () => {
  const app = loadApp();
  const keyOnly = { key: "D♭", chords: [{ text: "D♭maj7" }] };
  const timeOnly = { timeSignature: "12/8", chords: [{ text: "D♭maj7" }] };
  const both = { key: "D♭", timeSignature: "12/8", chords: [{ text: "D♭maj7" }] };

  assert.ok(app.minimumBarWidth(both, "D♭") > app.minimumBarWidth(keyOnly, "D♭"));
  assert.ok(app.minimumBarWidth(both, "D♭") > app.minimumBarWidth(timeOnly, "D♭"));
});

test("renders long custom ending text in compact form", () => {
  const app = loadApp();
  const bars = [{ endingText: "Only second chorus repeat", chords: [{ text: "C" }] }];
  const html = app.renderStaffRow(bars, "C", "4/4", bars, 0).html;

  assert.match(html, /font-size="10"/);
  assert.match(html, /…/);
});

test("keeps top-lane scenario rendering endings and navigation signs together", () => {
  const app = loadApp(canonicalCases.topLane);
  const normalized = app.normalizeState(canonicalCases.topLane);
  const pages = app.paginateSections(normalized.sections);
  const html = pages[0].blocks.join("");

  assert.match(html, /section-inline-mark/);
  assert.match(html, />1\.<\/text>/);
  assert.match(html, />2\.<\/text>/);
  assert.match(html, /\uE047|/);
  assert.match(html, /\uE048|/);
});

test("keeps bottom-lane scenario rendering all bottom-right directions", () => {
  const app = loadApp(canonicalCases.bottomLane);
  const normalized = app.normalizeState(canonicalCases.bottomLane);
  const html = app.renderStaffRow(normalized.sections[0].bars, normalized.key, normalized.timeSignature, normalized.sections[0].bars, 0).html;

  assert.match(html, /Fine/);
  assert.match(html, /D\.C\./);
  assert.match(html, /D\.S\./);
  assert.match(html, />to<\/text>/);
});

test("keeps multipage scenario spanning pages with continuation headers", () => {
  const app = loadApp(canonicalCases.multipage);
  const normalized = app.normalizeState(canonicalCases.multipage);
  const pages = app.paginateSections(normalized.sections);
  const firstPageHtml = pages[0].blocks.join("");
  const laterPagesHtml = pages.slice(1).map((page) => page.blocks.join("")).join("");

  assert.ok(pages.length > 1);
  assert.match(firstPageHtml, /section-inline-mark/);
  assert.match(laterPagesHtml, /staff-svg/);
});

test("keeps sparse-page scenario on a single compact page", () => {
  const app = loadApp(canonicalCases.sparsePage);
  const normalized = app.normalizeState(canonicalCases.sparsePage);
  const pages = app.paginateSections(normalized.sections);
  const html = pages[0].blocks.join("");

  assert.equal(pages.length, 1);
  assert.match(html, /section-inline-mark/);
  assert.match(html, /staff-svg/);
});

test("keeps long-text scenario compacting ending text and trimming note", () => {
  const app = loadApp(canonicalCases.longText);
  const normalized = app.normalizeState(canonicalCases.longText);
  const pages = app.paginateSections(normalized.sections);
  const html = pages[0].blocks.join("");

  assert.match(html, /section-inline-mark/);
  assert.match(html, /font-size="10"/);
  assert.match(html, /…/);
});

const assert = require("node:assert/strict");
const fs = require("node:fs");
const test = require("node:test");
const vm = require("node:vm");

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
  STAFF_ROW_WITH_HEADING_WEIGHT,
  codaSymbol,
  distributeBarWidths,
  endingLabel,
  formatPreviewChord,
  isRecognizedChord,
  normalizeChordText,
  normalizeState,
  parseChordRoot,
  previewChordText,
  paginateSections,
  saveAndRender,
  renderSectionHeading,
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

  assert.equal(stressRows[0].bars.length, 3);
  assert.equal(stressRows[1].bars.length, 1);
  assert.equal(
    Math.round(threeBarLayout.barStart + threeBarLayout.barWidths.reduce((total, width) => total + width, 0)),
    app.STAFF_WIDTH
  );

  const singleLayout = app.staffRowLayout([stress.sections[0].bars[3]], "F#", "7/8");
  assert.ok(singleLayout.barWidths[0] <= app.MAX_BAR_WIDTH);
});

test("redistributes extra row width after narrow bars hit their maximum", () => {
  const app = loadApp();
  const widths = app.distributeBarWidths([160, 112], 340);

  assert.equal(widths.map(Math.round).join(","), "178,162");
  assert.equal(Math.round(widths.reduce((total, width) => total + width, 0)), 340);
});

test("moves squeezed mid-row key or time changes to the next row", () => {
  const app = loadApp();
  const midChange = app.normalizeState({
    title: "Mid Change",
    key: "C",
    timeSignature: "4/4",
    sections: [{ label: "S", bars: [
      { chords: [{ text: "C" }] },
      { chords: [{ text: "D" }] },
      { chords: [{ text: "E" }] },
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

  assert.match(app.codaSymbol(), /x="80" y="29"/);
  assert.match(app.codaSymbol(), /\uE048|/);
  assert.match(app.segnoSymbol(), /x="84" y="29"/);
  assert.match(app.segnoSymbol(), /\uE047|/);
  assert.match(app.toCodaText(200, 96), />to<\/text>/);
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

  const xOf = (label) => Number(all.match(new RegExp(`<text x="([\\d.]+)"[^>]*>${label}<`))[1]);
  const fineX = xOf("Fine");
  const dcX = xOf("D\\.C\\.");
  const dsX = xOf("D\\.S\\.");
  const toX = xOf("to");
  // Each direction is right-aligned and shifted left of the previous, so all four differ.
  assert.equal(new Set([fineX, toX, dsX, dcX]).size, 4);
  // Layout order is right-to-left: Fine (rightmost), to Coda, D.S., D.C.
  assert.ok(dcX < dsX && dsX < toX && toX < fineX);
});

test("renders section heading without continuation marker", () => {
  const app = loadApp();
  const heading = app.renderSectionHeading({ label: "C", note: "memo" });

  assert.match(heading, /<div class="rehearsal-mark">C<\/div>/);
  assert.match(heading, /section-note-preview/);
  assert.doesNotMatch(heading, /section-continued|続/);
});

test("omits section mark when a section continues after a page break", () => {
  const app = loadApp();
  const section = {
    label: "C",
    bars: Array.from({ length: 40 }, () => ({ chords: [{ text: "C" }] }))
  };
  const pages = app.paginateSections([section]);
  const secondPageHtml = pages[1].blocks.join("");

  assert.doesNotMatch(secondPageHtml, /rehearsal-mark/);
  assert.doesNotMatch(secondPageHtml, /section-continued|続/);
});

test("centralizes ending label precedence", () => {
  const app = loadApp();

  assert.equal(app.endingLabel({ ending1: true }), "1");
  assert.equal(app.endingLabel({ ending2: true }), "2");
  assert.equal(app.endingLabel({ ending1: true, endingText: "3x" }), "3x");
  assert.equal(app.endingLabel(null), "");
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

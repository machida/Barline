const STORAGE_KEY = "barline-lead-sheet-v1";

const SAMPLE_DATA = {
  title: "Highway Star",
  artist: "Deep Purple",
  key: "Gm",
  tempo: 160,
  timeSignature: "4/4",
  sections: [
    {
      label: "Intro",
      note: "ここから歌",
      bars: [
        { chord: "Gm", repeatStart: true },
        { chord: "Gm" },
        { chord: "F" },
        { chord: "Gm", repeatEnd: true }
      ]
    },
    {
      label: "A",
      bars: [
        { chord: "Gm" },
        { chord: "Gm" },
        { chord: "F" },
        { chord: "Gm" }
      ]
    }
  ]
};

const EMPTY_DATA = {
  title: "Untitled",
  artist: "",
  key: "C",
  tempo: 120,
  timeSignature: "4/4",
  sections: [{ label: "Intro", bars: [{ chord: "" }, { chord: "" }, { chord: "" }, { chord: "" }] }]
};

const BAR_FLAGS = [
  ["repeatStart", "リピート開始"],
  ["ending1", "1カッコ"],
  ["ending2", "2カッコ"],
  ["ending3", "3カッコ"],
  ["repeatEnd", "リピート終了"],
  ["segno", "セーニョ記号"],
  ["coda", "Coda記号"],
  ["toCoda", "to Coda"],
  ["fine", "Fine"],
  ["ds", "D.S."],
  ["dc", "D.C."]
];

const SHARP_NOTES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const FLAT_NOTES = ["C", "D♭", "D", "E♭", "E", "F", "G♭", "G", "A♭", "A", "B♭", "B"];
const NOTE_PITCHES = {
  C: 0, "C#": 1, "C♯": 1, "D♭": 1, Db: 1,
  D: 2, "D#": 3, "D♯": 3, "E♭": 3, Eb: 3,
  E: 4,
  F: 5, "F#": 6, "F♯": 6, "G♭": 6, Gb: 6,
  G: 7, "G#": 8, "G♯": 8, "A♭": 8, Ab: 8,
  A: 9, "A#": 10, "A♯": 10, "B♭": 10, Bb: 10,
  B: 11
};
const KEY_ORDER = {
  sharp: [
    "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B",
    "Cm", "C#m", "Dm", "D#m", "Em", "Fm", "F#m", "Gm", "G#m", "Am", "A#m", "Bm"
  ],
  flat: [
    "C", "D♭", "D", "E♭", "E", "F", "G♭", "G", "A♭", "A", "B♭", "B",
    "Cm", "D♭m", "Dm", "E♭m", "Em", "Fm", "G♭m", "Gm", "A♭m", "Am", "B♭m", "Bm"
  ]
};
const KEY_SIGNATURES = {
  C: { pitch: 0, mode: "major", type: "sharp", count: 0 }, "C#": { pitch: 1, mode: "major", type: "sharp", count: 7 },
  "D♭": { pitch: 1, mode: "major", type: "flat", count: 5 }, D: { pitch: 2, mode: "major", type: "sharp", count: 2 },
  "D#": { pitch: 3, mode: "major", type: "flat", count: 3 }, "E♭": { pitch: 3, mode: "major", type: "flat", count: 3 },
  E: { pitch: 4, mode: "major", type: "sharp", count: 4 }, F: { pitch: 5, mode: "major", type: "flat", count: 1 },
  "F#": { pitch: 6, mode: "major", type: "sharp", count: 6 }, "G♭": { pitch: 6, mode: "major", type: "flat", count: 6 },
  G: { pitch: 7, mode: "major", type: "sharp", count: 1 }, "G#": { pitch: 8, mode: "major", type: "flat", count: 4 },
  "A♭": { pitch: 8, mode: "major", type: "flat", count: 4 }, A: { pitch: 9, mode: "major", type: "sharp", count: 3 },
  "A#": { pitch: 10, mode: "major", type: "flat", count: 2 }, "B♭": { pitch: 10, mode: "major", type: "flat", count: 2 },
  B: { pitch: 11, mode: "major", type: "sharp", count: 5 },
  Cm: { pitch: 0, mode: "minor", type: "flat", count: 3 }, "C#m": { pitch: 1, mode: "minor", type: "sharp", count: 4 },
  "D♭m": { pitch: 1, mode: "minor", type: "sharp", count: 4 }, Dm: { pitch: 2, mode: "minor", type: "flat", count: 1 },
  "D#m": { pitch: 3, mode: "minor", type: "sharp", count: 6 }, "E♭m": { pitch: 3, mode: "minor", type: "flat", count: 6 },
  Em: { pitch: 4, mode: "minor", type: "sharp", count: 1 }, Fm: { pitch: 5, mode: "minor", type: "flat", count: 4 },
  "F#m": { pitch: 6, mode: "minor", type: "sharp", count: 3 }, "G♭m": { pitch: 6, mode: "minor", type: "sharp", count: 3 },
  Gm: { pitch: 7, mode: "minor", type: "flat", count: 2 }, "G#m": { pitch: 8, mode: "minor", type: "sharp", count: 5 },
  "A♭m": { pitch: 8, mode: "minor", type: "flat", count: 7 }, Am: { pitch: 9, mode: "minor", type: "sharp", count: 0 },
  "A#m": { pitch: 10, mode: "minor", type: "sharp", count: 7 }, "B♭m": { pitch: 10, mode: "minor", type: "flat", count: 5 },
  Bm: { pitch: 11, mode: "minor", type: "sharp", count: 2 }
};
const KEY_ALIASES = {
  Bb: "B♭", Eb: "E♭", Ab: "A♭", Db: "D♭",
  Gb: "G♭", Bbm: "B♭m", Ebm: "E♭m", Dbm: "D♭m", Gbm: "G♭m", Abm: "A♭m"
};
const TIME_SIGNATURES = ["4/4", "3/4", "2/4", "6/8", "12/8", "5/4", "7/8"];
const DEFAULT_CHORD_SLOTS = 4;
const DEFAULT_TEMPO = 120;
const MIN_TEMPO = 20;
const MAX_TEMPO = 400;
const STAFF_WIDTH = 680;
// Header (clef/key/time) width is sized to the time signature's digit count so the
// first bar starts just past it, instead of a fixed minimum that left dead space for
// narrow keys. Roughly the rendered width of one time-signature glyph at font size 30.
const TIME_SIGNATURE_DIGIT_WIDTH = 16;
const TIME_SIGNATURE_RIGHT_MARGIN = 10;
const MAX_BARS_PER_ROW = 4;
const MIN_BAR_CONTENT_WIDTH = 112;
const MAX_BAR_WIDTH = 178;
const EMPTY_CHORD_SLOT_WIDTH = 8;
const CHORD_SLOT_PADDING = 28;
const CHORD_GAP_WIDTH = 7;
const CHORD_CHAR_WIDTH = 5.4;
const CHORD_SYMBOL_WIDTH = 4.2;
const EXTRA_CHORD_SLOT_WIDTH = 13;
const CHORD_SLOT_INNER_PADDING = 10;
const INLINE_CHANGE_DOUBLE_STACK_PADDING = 12;
const ENDING_TEXT_MAX_CHARS = 12;
const ENDING_TEXT_COMPACT_FONT_SIZE = 10;
// Page capacity is measured in staff-row units. Headings add fractional weight based on current print CSS.
const FIRST_PAGE_ROW_CAPACITY = 8;
const CONTINUATION_PAGE_ROW_CAPACITY = 9;
const CHORD_FONT_SIZE = 10.5;
const STAFF_VERTICAL_SHIFT = -6;
const ENDING_BRACKET_SHIFT = -2;
const CLEF_FONT_SIZE = 36;
const CLEF_BASELINE_Y = 70;
const KEY_SIGNATURE_FONT_SIZE = 32;
const KEY_SIGNATURE_BASELINE_OFFSET = 0;
const TIME_SIGNATURE_FONT_SIZE = 30;
const SVG_FONT = "Bravura, Noto Sans JP, Noto Sans, system-ui, sans-serif";
const TEXT_FONT = "Noto Sans JP, Noto Sans, system-ui, sans-serif";
const SERIF_TEXT_FONT = "Barline Noto Serif, serif";
const DIRECTION_TEXT_FONT = "\"Barline Directions Serif\", serif";
const STAFF_ROW_BASE_HEIGHT = 80;
const TOP_LANE_Y = 0;
const TOP_LANE_SYMBOL_Y = 12;
const CHORD_BASELINE_Y = 35 + STAFF_VERTICAL_SHIFT;
const INLINE_ROW_MARK_LEFT = 0;
const INLINE_SECTION_NOTE_CHAR_WIDTH = 4.2;
const INLINE_SECTION_MARK_GAP = 6;
const INLINE_SECTION_SIGN_GAP = 7;
const INLINE_SECTION_SYMBOL_GAP = 8;
const INLINE_SECTION_ENDING_CLEARANCE = 48;
const NAVIGATION_BASELINE_Y = 84;
const NAVIGATION_BOTTOM_LANE_Y = 92;

let state = loadSavedState();
let toastTimer;
let activeSectionIndex = 0;
let activeBarOptions = "";
let sectionTabsScrollLeft = 0;

const elements = {
  title: document.querySelector("#title"),
  artist: document.querySelector("#artist"),
  key: document.querySelector("#key"),
  tempo: document.querySelector("#tempo"),
  timeSignature: document.querySelector("#time-signature"),
  accidentalPreference: document.querySelector("#accidental-preference"),
  transposeEnabled: document.querySelector("#transpose-enabled"),
  transposeAmount: document.querySelector("#transpose-amount"),
  degreeEnabled: document.querySelector("#degree-enabled"),
  sectionsEditor: document.querySelector("#sections-editor"),
  sheet: document.querySelector("#sheet"),
  toast: document.querySelector("#toast")
};

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function clampNumber(value, min, max, fallback) {
  if (value === "") return fallback;
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.max(min, Math.min(max, number));
}

function keyForPitchWithPreference(pitch, mode, preference) {
  return KEY_ORDER[preference].find((key) => KEY_SIGNATURES[key].pitch === ((pitch % 12) + 12) % 12 && KEY_SIGNATURES[key].mode === mode);
}

function createChordSlots(count = DEFAULT_CHORD_SLOTS) {
  return Array.from({ length: count }, (_, index) => ({ text: "", position: index / count }));
}

function normalizeChordText(chord) {
  return String(chord ?? "")
    .replace(/[！-～]/g, (character) => String.fromCharCode(character.charCodeAt(0) - 0xFEE0))
    .replace(/\u3000/g, " ")
    .replace(/\s*\/\s*/g, "/")
    .replace(/(^|\/)([a-g])/g, (match, prefix, note) => `${prefix}${note.toUpperCase()}`)
    .replace(/(^|\/)([A-G])b/g, "$1$2♭")
    .replaceAll("#", "♯")
    .replace(/(^|\/)([A-G](?:♯|♭)?)(?:Maj|MAJ|M)(?=\d)/g, "$1$2maj")
    .replace(/(^|\/)([A-G](?:♯|♭)?)[\-−ー]/g, "$1$2m")
    .replace(/(^|\/)([A-G](?:♯|♭)?)[△▲]/g, "$1$2maj")
    .replace(/(^|\/)([A-G](?:♯|♭)?)[○〇°]/g, "$1$2dim")
    .replace(/(^|\/)([A-G](?:♯|♭)?)\+/g, "$1$2aug")
    .replace(/(^|\/)([A-G](?:♯|♭)?)ø/g, "$1$2m7♭5");
}

function normalizeChordSlots(bar) {
  if (Array.isArray(bar?.chords)) {
    const slots = bar.chords.map((chord) => ({
      text: normalizeChordText(chord?.text)
    }));
    return slots.length ? renumberChordPositions(slots) : createChordSlots();
  }

  const slots = createChordSlots();
  slots[0].text = normalizeChordText(bar?.chord);
  return slots;
}

function renumberChordPositions(chords) {
  const slotCount = Math.max(chords.length, 1);
  return chords.map((chord, index) => ({
    text: normalizeChordText(chord?.text),
    position: index / slotCount
  }));
}

function normalizeState(value) {
  if (!value || typeof value !== "object") throw new Error("JSONの形式が正しくありません。");
  const accidentalPreference = value.accidentalPreference === "flat" ? "flat" : "sharp";
  const rawSongKey = KEY_ALIASES[value.key] || value.key;
  const rawSongDefinition = KEY_SIGNATURES[rawSongKey] || KEY_SIGNATURES.C;
  const songKey = keyForPitchWithPreference(rawSongDefinition.pitch, rawSongDefinition.mode, accidentalPreference);
  const normalized = {
    title: String(value.title ?? ""),
    artist: String(value.artist ?? ""),
    key: KEY_SIGNATURES[songKey] ? songKey : "C",
    tempo: clampNumber(value.tempo, MIN_TEMPO, MAX_TEMPO, DEFAULT_TEMPO),
    timeSignature: /^\d+\/\d+$/.test(value.timeSignature) ? value.timeSignature : "4/4",
    accidentalPreference,
    degreeNotation: Boolean(value.degreeNotation),
    transpose: {
      enabled: Boolean(value.transpose?.enabled),
      semitones: Math.max(-11, Math.min(11, Number(value.transpose?.semitones) || 0))
    },
    sections: Array.isArray(value.sections) ? value.sections.map((section) => {
      const rawSectionKey = KEY_ALIASES[section.key] || section.key;
      const sectionDefinition = KEY_SIGNATURES[rawSectionKey];
      return {
        label: String(section.label ?? ""),
        note: String(section.note ?? ""),
        continued: Boolean(section.continued),
        bars: Array.isArray(section.bars) ? section.bars.map((bar, barIndex) => {
          const chords = normalizeChordSlots(bar);
          const result = { chords };
          const rawBarKey = KEY_ALIASES[bar?.key] || bar?.key;
          const barDefinition = KEY_SIGNATURES[rawBarKey] || (barIndex === 0 ? sectionDefinition : null);
          if (barDefinition) result.key = keyForPitchWithPreference(barDefinition.pitch, barDefinition.mode, accidentalPreference);
          const barTimeSignature = /^\d+\/\d+$/.test(bar?.timeSignature)
            ? bar.timeSignature
            : barIndex === 0 && /^\d+\/\d+$/.test(section.timeSignature) ? section.timeSignature : "";
          if (barTimeSignature) result.timeSignature = barTimeSignature;
          BAR_FLAGS.forEach(([flag]) => {
            if (bar?.[flag]) result[flag] = true;
          });
          if (bar?.endingText) result.endingText = String(bar.endingText);
          if (bar?.sectionHead && barIndex > 0) result.sectionHead = true;
          return result;
        }) : []
      };
    }) : []
  };
  return normalized;
}

function renderKeyOptions(selectedKey, preference = state.accidentalPreference) {
  const keys = KEY_ORDER[preference];
  const options = (mode) => keys.filter((key) => KEY_SIGNATURES[key].mode === mode)
    .map((key) => `<option ${key === selectedKey ? "selected" : ""}>${key}</option>`).join("");
  return `<optgroup label="メジャー">${options("major")}</optgroup><optgroup label="マイナー">${options("minor")}</optgroup>`;
}

function endingLabel(bar) {
  if (!bar) return "";
  return bar.endingText || (bar.ending1 ? "1" : bar.ending2 ? "2" : bar.ending3 ? "3" : "");
}

function clampEndingLabel(ending, appendDot = true) {
  const label = String(ending || "");
  const dotted = appendDot ? `${label}.` : label;
  if (label.length <= ENDING_TEXT_MAX_CHARS) {
    return { text: dotted, compact: false };
  }
  const truncated = `${label.slice(0, ENDING_TEXT_MAX_CHARS - 1)}…`;
  return { text: appendDot ? `${truncated}.` : truncated, compact: true };
}

function loadSavedState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? normalizeState(JSON.parse(saved)) : normalizeState(clone(EMPTY_DATA));
  } catch {
    return normalizeState(clone(EMPTY_DATA));
  }
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function saveAndRender({ editor = false } = {}) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    showToast("自動保存に失敗しました。書き出しで保存してください。");
  }
  if (editor) renderEditor();
  renderSheet();
}

function keyForPitch(pitch, mode, preference = state.accidentalPreference) {
  return keyForPitchWithPreference(pitch, mode, preference);
}

function transposeKey(key) {
  const definition = KEY_SIGNATURES[key];
  if (!definition) return key;
  const semitones = state.transpose.enabled ? state.transpose.semitones : 0;
  return keyForPitch(definition.pitch + semitones, definition.mode);
}

function transposeNote(note, semitones) {
  const normalized = note.replace("♯", "#").replace("b", "♭");
  const pitch = [...SHARP_NOTES, ...FLAT_NOTES].findIndex((candidate) => candidate === normalized);
  const sourcePitch = pitch >= 12 ? pitch - 12 : pitch;
  if (sourcePitch < 0) return note;
  const notes = state.accidentalPreference === "flat" ? FLAT_NOTES : SHARP_NOTES;
  return notes[(sourcePitch + semitones + 12) % 12].replaceAll("#", "♯");
}

function transposeChord(chord) {
  if (!state.transpose.enabled || !state.transpose.semitones) return chord;
  return chord.replace(/(^|\/)([A-G](?:#|♯|♭|b)?)/g, (match, prefix, note) =>
    `${prefix}${transposeNote(note, state.transpose.semitones)}`
  );
}

function formatPreviewChord(chord, effectiveKey) {
  const transposedChord = transposeChord(chord);
  if (!state.degreeNotation) return transposedChord;
  const degree = degreeChord(transposedChord, transposeKey(effectiveKey));
  return degree ? `${transposedChord}(${degree})` : transposedChord;
}

function previewChordText(chord, effectiveKey, x, y) {
  const transposedChord = transposeChord(chord);
  const degree = state.degreeNotation ? degreeChord(transposedChord, transposeKey(effectiveKey)) : "";
  if (!degree) {
    return `<text x="${x}" y="${y}" text-anchor="start" font-family="${TEXT_FONT}" font-size="${CHORD_FONT_SIZE}" font-weight="800">${escapeHtml(transposedChord)}</text>`;
  }
  return `
    <text x="${x}" y="${y}" text-anchor="start" font-family="${TEXT_FONT}" font-size="${CHORD_FONT_SIZE}" font-weight="800">
      <tspan>${escapeHtml(transposedChord)}(</tspan>${degreeTspans(degree)}<tspan>)</tspan>
    </text>
  `;
}

function degreeTspans(degree) {
  return String(degree).split(/([ivxlcdmIVXLCDM]+)/g).filter(Boolean).map((part) => {
    if (/^[ivxlcdmIVXLCDM]+$/.test(part)) {
      return `<tspan font-family="${SERIF_TEXT_FONT}">${escapeHtml(part)}</tspan>`;
    }
    return `<tspan>${escapeHtml(part)}</tspan>`;
  }).join("");
}

function parseChordRoot(chord) {
  const text = String(chord ?? "").trim();
  if (!text) return null;
  const match = text.match(/^([A-G](?:#|♯|♭|b)?)(.*?)(?:\/([A-G](?:#|♯|♭|b)?))?$/);
  if (!match) return null;
  const [, root, suffix = "", bass = ""] = match;
  const pitch = NOTE_PITCHES[root.replace("b", "♭").replace("#", "♯")];
  if (pitch === undefined) return null;
  if (bass) {
    const bassPitch = NOTE_PITCHES[bass.replace("b", "♭").replace("#", "♯")];
    if (bassPitch === undefined) return null;
  }
  if (!isRecognizedChordSuffix(suffix)) return null;
  return { root, suffix, bass };
}

function isRecognizedChordSuffix(suffix) {
  if (/^m{2,}(?!aj)/.test(suffix)) return false;
  if (/^maj/i.test(suffix) && !/^maj/.test(suffix)) return false;
  return true;
}

function isRecognizedChord(text) {
  if (!String(text ?? "").trim()) return true;
  return Boolean(parseChordRoot(text));
}

function degreeChord(chord, key) {
  const parsed = parseChordRoot(chord);
  if (!parsed) return "";
  const { root, suffix, bass } = parsed;
  const rootDegree = degreeForNote(root, key, suffix);
  if (!rootDegree) return "";
  if (!bass) return rootDegree;
  const bassDegree = degreeForNote(bass, key, "");
  return bassDegree ? `${rootDegree}/${bassDegree}` : rootDegree;
}

function degreeForNote(note, key, suffix) {
  const keyDefinition = KEY_SIGNATURES[key] || KEY_SIGNATURES.C;
  const pitch = NOTE_PITCHES[note.replace("b", "♭").replace("#", "♯")];
  if (pitch === undefined) return "";
  const interval = (pitch - keyDefinition.pitch + 12) % 12;
  const degrees = keyDefinition.mode === "minor"
    ? ["I", "♭II", "II", "III", "♯III", "IV", "♯IV", "V", "VI", "♯VI", "VII", "♯VII"]
    : ["I", "♭II", "II", "♭III", "III", "IV", "♯IV", "V", "♭VI", "VI", "♭VII", "VII"];
  const isMinorChord = chordLooksMinor(suffix);
  const degree = isMinorChord ? degrees[interval].toLowerCase() : degrees[interval];
  const degreeSuffix = isMinorChord ? suffix.replace(/^m(?!aj)/, "") : suffix;
  return `${degree}${degreeSuffix}`;
}

function chordLooksMinor(suffix) {
  return /^m(?!aj)/.test(String(suffix));
}

function renderEditor() {
  const currentSectionTabs = elements.sectionsEditor.querySelector(".section-tabs");
  if (currentSectionTabs) sectionTabsScrollLeft = currentSectionTabs.scrollLeft;

  activeSectionIndex = Math.min(activeSectionIndex, Math.max(state.sections.length - 1, 0));
  elements.title.value = state.title;
  elements.artist.value = state.artist;
  elements.key.innerHTML = renderKeyOptions(state.key);
  elements.tempo.value = state.tempo;
  elements.timeSignature.value = state.timeSignature;
  elements.accidentalPreference.value = state.accidentalPreference;
  elements.transposeEnabled.checked = state.transpose.enabled;
  elements.transposeAmount.value = state.transpose.semitones;
  elements.transposeAmount.disabled = !state.transpose.enabled;
  elements.degreeEnabled.checked = state.degreeNotation;

  elements.sectionsEditor.innerHTML = state.sections.length ? `
    <div class="section-tabs" role="tablist" aria-label="セクション切り替え">
      ${state.sections.map((section, sectionIndex) => `
        <button class="section-tab ${sectionIndex === activeSectionIndex ? "active" : ""}" type="button" role="tab" aria-selected="${sectionIndex === activeSectionIndex}" data-section-tab="${sectionIndex}">
          ${escapeHtml(section.label || `Section ${sectionIndex + 1}`)}
        </button>
      `).join("")}
    </div>
    ${state.sections.map((section, sectionIndex) => `
    <div class="section-block ${sectionIndex === activeSectionIndex ? "active" : ""}" data-section-index="${sectionIndex}">
      <div class="section-block-header">
        <div class="section-title-row">
          <input class="section-label" type="text" value="${escapeHtml(section.label)}" aria-label="セクション名" placeholder="セクション名">
          <div class="section-actions">
            <button class="button compact move-section" type="button" data-direction="-1" ${sectionIndex === 0 ? "disabled" : ""} aria-label="セクションを左へ移動">←</button>
            <button class="button compact move-section" type="button" data-direction="1" ${sectionIndex === state.sections.length - 1 ? "disabled" : ""} aria-label="セクションを右へ移動">→</button>
            <button class="button compact copy-section" type="button">コピー</button>
            <button class="button compact danger delete-section" type="button">削除</button>
          </div>
        </div>
        <input class="section-note" type="text" value="${escapeHtml(section.note || "")}" aria-label="セクションメモ" placeholder="メモ（例: ここから歌）">
        ${sectionIndex > 0 ? `
        <label class="modulation-toggle section-continue-toggle">
          <input class="section-continued" type="checkbox" ${section.continued ? "checked" : ""}>
          <span>前のセクションに続けて表示</span>
        </label>` : ""}
      </div>
      <div class="bars-editor">
        ${section.bars.map((bar, barIndex) => `
          <div class="bar-editor" data-bar-index="${barIndex}">
            <div class="bar-card-header">
              <span class="bar-number">${barIndex + 1}</span>
              <button class="icon-button delete-bar" type="button" title="小節を削除" aria-label="小節を削除">×</button>
            </div>
            <div class="bar-top">
              <div class="bar-chord-area">
                <div class="bar-chords">
                ${(() => {
                  const chordSlots = bar.chords || createChordSlots();
                  return chordSlots.map((slot, positionIndex) => {
                  const chord = slot?.text || "";
                  const isUnrecognized = chord.trim() && !isRecognizedChord(chord);
                  return `<label>
                    <span>${positionIndex + 1}</span>
                    <input class="bar-chord${isUnrecognized ? " is-unrecognized" : ""}" data-chord-index="${positionIndex}" type="text" value="${escapeHtml(chord)}" placeholder="${positionIndex === 0 ? "Gm7" : "—"}" aria-label="小節${barIndex + 1}の位置${positionIndex + 1}のコード"${isUnrecognized ? ' title="移調・ディグリー非対応の表記です"' : ""}>
                    ${chordSlots.length > 1 ? `<button class="slot-delete delete-chord-slot" type="button" data-chord-index="${positionIndex}" aria-label="コード枠${positionIndex + 1}を削除">×</button>` : ""}
                  </label>`;
                  }).join("");
                })()}
                </div>
                <div class="bar-chord-actions">
                  <button class="button compact add-chord-slot" type="button">＋ コード枠</button>
                </div>
              </div>
            </div>
            <details class="bar-settings" ${activeBarOptions === `${sectionIndex}:${barIndex}` ? "open" : ""}>
              <summary>
                <span>オプション</span>
                <span class="bar-option-summary">
                  ${BAR_FLAGS.filter(([flag]) => bar[flag]).map(([, label]) => `<span>${label}</span>`).join("")}
                  ${bar.endingText ? `<span>カッコ: ${escapeHtml(bar.endingText)}</span>` : ""}
                  ${bar.key ? `<span>Key: ${escapeHtml(bar.key)}</span>` : ""}
                  ${bar.timeSignature ? `<span>${escapeHtml(bar.timeSignature)}</span>` : ""}
                </span>
              </summary>
              <div class="bar-options">
                ${BAR_FLAGS.map(([flag, label]) => `
                  <label class="check-option">
                    <input type="checkbox" data-flag="${flag}" ${bar[flag] ? "checked" : ""}>
                    <span>${label}</span>
                  </label>
                `).join("")}
              </div>
              <label class="bar-ending-text-field">
                <span>任意カッコ</span>
                <input class="bar-ending-text" type="text" value="${escapeHtml(bar.endingText || "")}" placeholder="例: 3, Only 2nd time">
              </label>
              <div class="bar-change-options">
                <label class="modulation-toggle">
                  <input class="bar-key-enabled" type="checkbox" ${bar.key ? "checked" : ""}>
                  <span>転調</span>
                </label>
                <label class="bar-key-field ${bar.key ? "visible" : ""}">
                  <span>ここからのKey</span>
                  <select class="bar-key">${renderKeyOptions(bar.key)}</select>
                </label>
                <label class="modulation-toggle">
                  <input class="bar-time-enabled" type="checkbox" ${bar.timeSignature ? "checked" : ""}>
                  <span>拍子変更</span>
                </label>
                <label class="bar-time-field ${bar.timeSignature ? "visible" : ""}">
                  <span>ここからの拍子</span>
                  <select class="bar-time-signature">
                    ${TIME_SIGNATURES.map((time) => `<option ${time === bar.timeSignature ? "selected" : ""}>${time}</option>`).join("")}
                  </select>
                </label>
                ${barIndex > 0 ? `
                <label class="modulation-toggle bar-section-head-toggle">
                  <input class="bar-section-head" type="checkbox" ${bar.sectionHead ? "checked" : ""}>
                  <span>セクション先頭（前は弱起）</span>
                </label>` : ""}
              </div>
            </details>
          </div>
        `).join("")}
        <footer class="bars-footer">
          <button class="button compact add-bar" type="button">＋ 小節追加</button>
        </footer>
      </div>
    </div>
    `).join("")}
  ` : '<p class="empty-editor">セクションを追加してください</p>';

  const nextSectionTabs = elements.sectionsEditor.querySelector(".section-tabs");
  if (nextSectionTabs) nextSectionTabs.scrollLeft = sectionTabsScrollLeft;
}

function renderSheet() {
  const sections = state.sections.filter((section) => section.bars.length > 0);
  const previewKey = transposeKey(state.key);
  const pages = paginateSections(sections);
  elements.sheet.innerHTML = pages.map((page, pageIndex) => `
    <section class="sheet-page">
      <div class="page-number">${pageIndex + 1} / ${pages.length}</div>
      ${pageIndex === 0 ? `
    <header class="sheet-header">
      <h1 class="sheet-title">${escapeHtml(state.title || "Untitled")}</h1>
      <div class="sheet-subhead">
        <p class="sheet-artist">${escapeHtml(state.artist)}</p>
        <div class="sheet-meta">
          <div><span>KEY</span>${escapeHtml(previewKey)}</div>
          <div><span>BPM</span>${escapeHtml(state.tempo)}</div>
          <div><span>TIME</span>${escapeHtml(state.timeSignature)}</div>
          ${state.transpose.enabled && state.transpose.semitones ? `<div><span>TRANSPOSE</span>${state.transpose.semitones > 0 ? "+" : ""}${state.transpose.semitones}</div>` : ""}
        </div>
      </div>
    </header>` : `<header class="sheet-continuation-header"><strong>${escapeHtml(state.title || "Untitled")}</strong><span>continued</span></header>`}
    <div class="sheet-content">
      ${page.blocks.length ? page.blocks.join("") : '<p class="empty-sheet">セクションを追加してください</p>'}
    </div>
    </section>
  `).join("");
}

function groupSections(sections) {
  const groups = [];
  sections.forEach((section, index) => {
    if (index === 0 || !section.continued || !groups.length) groups.push([section]);
    else groups[groups.length - 1].push(section);
  });
  return groups;
}

// A section's head (where its rehearsal mark and double bar line sit) is normally its
// first bar, but a bar marked `sectionHead` moves it later — e.g. a coda whose downbeat
// follows a pickup bar. Bars before the head render as a lead-in with no section mark.
function sectionHeadOffset(section) {
  const index = section.bars.findIndex((bar) => bar.sectionHead);
  return index > 0 ? index : 0;
}

// Sections marked `continued` share staff rows with the preceding section. A group
// is the lead section plus its continued followers; their bars are concatenated so
// the row splitter can pack them onto the same lines. Every section head is rendered
// as the same inline mark above its head bar, including the group's first section.
// `sectionStarts` collects the combined-bar offsets that open a section so the staff
// can draw their double bar lines.
function paginateSections(sections) {
  const pages = [{ blocks: [], used: 0, capacity: FIRST_PAGE_ROW_CAPACITY }];
  let effectiveKey = state.key;
  let effectiveTimeSignature = state.timeSignature;

  groupSections(sections).forEach((group) => {
    const leadSection = group[0];
    const leadHeadOffset = sectionHeadOffset(leadSection);
    const combinedBars = [];
    const inlineMarks = {};
    const sectionStarts = new Set();
    group.forEach((section, memberIndex) => {
      const headOffset = memberIndex === 0 ? leadHeadOffset : sectionHeadOffset(section);
      const headIndex = combinedBars.length + headOffset;
      sectionStarts.add(headIndex);
      inlineMarks[headIndex] = section;
      combinedBars.push(...section.bars);
    });

    const rows = splitSectionRows(combinedBars, effectiveKey, effectiveTimeSignature);
    rows.forEach(({ bars, startIndex }) => {
      const renderedRow = renderStaffRow(bars, effectiveKey, effectiveTimeSignature, combinedBars, startIndex, inlineMarks, sectionStarts);
      effectiveKey = renderedRow.effectiveKey;
      effectiveTimeSignature = renderedRow.effectiveTimeSignature;

      let page = pages[pages.length - 1];
      if (page.used > 0 && page.used + 1 > page.capacity) {
        page = { blocks: [], used: 0, capacity: CONTINUATION_PAGE_ROW_CAPACITY };
        pages.push(page);
      }
      page.blocks.push(`
        <section class="sheet-section">
          ${renderedRow.html}
        </section>
      `);
      page.used += 1;
    });
  });
  return pages;
}

// Boxed rehearsal mark drawn inside the staff SVG for a section that continues on a
// shared row. It is lifted into the band above the staff (negative y) so it lines up
// with the block rehearsal mark of the group's lead section rather than sitting low
// over the chord text. Units: ~3.5 per mm, matching the 9pt/2mm-margin block heading.
function sectionMarkWidth(section) {
  const label = section.label || "Section";
  return Math.max(label.length * 6.5 + 12, 28);
}

// The inline note is plain SVG text and cannot wrap, so trim it to the room left before
// the staff ends (~5 units per character at font size 9) and drop it when there is none.
function clampNoteText(note, availableWidth) {
  const text = String(note || "").trim();
  if (!text) return "";
  const maxChars = Math.floor(availableWidth / 5);
  if (maxChars < 3) return "";
  return text.length > maxChars ? `${text.slice(0, maxChars - 1)}…` : text;
}

function estimatedInlineTextWidth(text, perCharacter = 5) {
  return String(text || "").length * perCharacter;
}

function inlineSectionMarkOccupiedWidth(section, maxRight = STAFF_WIDTH) {
  const boxWidth = sectionMarkWidth(section);
  const noteText = clampNoteText(section.note, maxRight - (boxWidth + INLINE_SECTION_MARK_GAP));
  return boxWidth + (noteText ? INLINE_SECTION_MARK_GAP + estimatedInlineTextWidth(noteText, INLINE_SECTION_NOTE_CHAR_WIDTH) : 0);
}

function sectionMarkContent(section, noteText = section.note, symbol = "") {
  return `
    <div class="rehearsal-mark">${escapeHtml(section.label || "Section")}</div>
    ${symbol}
    ${noteText ? `<p class="section-note-preview">${escapeHtml(noteText)}</p>` : ""}
  `;
}

function topLaneSymbolMarkup(bar) {
  if (bar?.segno) return '<span class="top-lane-symbol top-lane-symbol-segno" aria-hidden="true">\uE047</span>';
  if (bar?.coda) return '<span class="top-lane-symbol top-lane-symbol-coda" aria-hidden="true">\uE048</span>';
  return "";
}

function inlineSectionMark(section, x, maxRight = STAFF_WIDTH, bar = null) {
  const noteText = clampNoteText(section.note, maxRight - (sectionMarkWidth(section) + INLINE_SECTION_MARK_GAP));
  const symbol = topLaneSymbolMarkup(bar);
  return `
    <div class="section-inline-mark" style="left:${x}px;">
      ${sectionMarkContent(section, noteText, symbol)}
    </div>
  `;
}

function standaloneTopLaneSymbol(bar, x) {
  const symbol = topLaneSymbolMarkup(bar);
  if (!symbol) return "";
  return `<div class="section-inline-mark top-lane-symbol-only" style="left:${x}px;">${symbol}</div>`;
}

function splitSectionRows(sectionBars, initialKey, initialTimeSignature) {
  const rows = [];
  let effectiveKey = initialKey;
  let effectiveTimeSignature = initialTimeSignature;
  let index = 0;

  while (index < sectionBars.length) {
    const rowBars = chooseRowBars(sectionBars, index, effectiveKey, effectiveTimeSignature);
    rows.push({ bars: rowBars, startIndex: index });
    rowBars.forEach((bar) => {
      if (bar.key) effectiveKey = bar.key;
      if (bar.timeSignature) effectiveTimeSignature = bar.timeSignature;
    });
    index += rowBars.length;
  }

  return rows;
}

function chooseRowBars(sectionBars, startIndex, effectiveKey, effectiveTimeSignature) {
  const remainingCount = sectionBars.length - startIndex;
  const maxCount = Math.min(MAX_BARS_PER_ROW, remainingCount);
  for (let count = maxCount; count > 1; count -= 1) {
    const bars = sectionBars.slice(startIndex, startIndex + count);
    if (rowCanFit(bars, effectiveKey, effectiveTimeSignature)) return bars;
  }
  return sectionBars.slice(startIndex, startIndex + 1);
}

function rowCanFit(bars, effectiveKey, effectiveTimeSignature) {
  const layout = staffRowLayout(bars, effectiveKey, effectiveTimeSignature);
  return layout.fits
    && layout.barWidths.every((width, index) => width >= minimumBarWidth(bars[index]))
    && layout.barWidths.every((width, index) => !inlineChangeSqueezesBar(bars[index], width, index, layout.effectiveKeys[index]));
}

function staffRowLayout(bars, staffKey, timeSignature) {
  const headerWidth = staffHeaderWidth(staffKey, timeSignature);
  const availableWidth = STAFF_WIDTH - headerWidth;
  let effectiveKey = staffKey;
  const effectiveKeys = bars.map((bar) => {
    const barKey = bar?.key || effectiveKey;
    if (bar?.key) effectiveKey = bar.key;
    return barKey;
  });
  const minimumWidths = bars.map((bar, index) => minimumBarWidth(bar, effectiveKeys[index]));
  const totalMinimum = minimumWidths.reduce((total, width) => total + width, 0);
  const fits = totalMinimum <= availableWidth;
  const barWidths = fits
    ? distributeBarWidths(minimumWidths, availableWidth)
    : minimumWidths;
  return { barStart: headerWidth, barWidths, fits, effectiveKeys };
}

function distributeBarWidths(minimumWidths, availableWidth) {
  const minimumTotal = minimumWidths.reduce((total, width) => total + width, 0);
  if (minimumTotal >= availableWidth) return minimumWidths;
  const shouldFillRow = minimumWidths.length >= 3;
  const maxWidths = minimumWidths.map((width) => shouldFillRow ? availableWidth : Math.max(width, MAX_BAR_WIDTH));
  const targetTotal = Math.min(availableWidth, maxWidths.reduce((total, width) => total + width, 0));
  const widths = [...minimumWidths];
  let remainingExtra = Math.max(targetTotal - minimumTotal, 0);
  let flexible = widths.map((_, index) => index);

  while (remainingExtra > 0.001 && flexible.length) {
    const extraPerBar = remainingExtra / flexible.length;
    const nextFlexible = [];
    remainingExtra = 0;

    flexible.forEach((index) => {
      const nextWidth = widths[index] + extraPerBar;
      if (nextWidth >= maxWidths[index]) {
        widths[index] = maxWidths[index];
        remainingExtra += nextWidth - maxWidths[index];
      } else {
        widths[index] = nextWidth;
        nextFlexible.push(index);
      }
    });
    flexible = nextFlexible;
  }

  return widths;
}

function estimatedChordWidth(text) {
  return String(text ?? "").split("").reduce((total, character) => {
    if (!character.trim()) return total + CHORD_SYMBOL_WIDTH;
    if (/[A-Za-z0-9]/.test(character)) return total + CHORD_CHAR_WIDTH;
    return total + CHORD_SYMBOL_WIDTH;
  }, 0);
}

function chordSlotMetrics(bar, effectiveKey = state.key) {
  const slots = Array.isArray(bar?.chords) && bar.chords.length ? bar.chords : [{ text: bar?.chord || "" }];
  const estimatedSlots = slots.map((slot) => {
    if (!slot?.text) return {
      sourceText: "",
      renderedText: "",
      textWidth: 0,
      slotWidth: EMPTY_CHORD_SLOT_WIDTH + CHORD_SLOT_INNER_PADDING
    };
    const sourceText = slot.text;
    const renderedText = formatPreviewChord(sourceText, effectiveKey);
    const textWidth = estimatedChordWidth(renderedText);
    return {
      sourceText,
      renderedText,
      textWidth,
      slotWidth: Math.max(textWidth + CHORD_SLOT_INNER_PADDING, EMPTY_CHORD_SLOT_WIDTH + CHORD_SLOT_INNER_PADDING)
    };
  });
  return estimatedSlots;
}

function minimumChordAreaWidth(bar, effectiveKey = state.key) {
  const estimatedSlots = chordSlotMetrics(bar, effectiveKey);
  const slotWidths = estimatedSlots.reduce((total, slot) => total + slot.slotWidth, 0);
  const gaps = Math.max(estimatedSlots.length - 1, 0) * CHORD_GAP_WIDTH;
  const extraSlots = Math.max(estimatedSlots.length - 4, 0) * EXTRA_CHORD_SLOT_WIDTH;
  return Math.max(MIN_BAR_CONTENT_WIDTH, slotWidths + gaps + extraSlots);
}

function chordSlotLayout(bar, effectiveKey, chordAreaX, chordAreaWidth) {
  const slots = chordSlotMetrics(bar, effectiveKey);
  const minimumWidths = slots.map((slot) => slot.slotWidth);
  const gaps = Math.max(slots.length - 1, 0) * CHORD_GAP_WIDTH;
  const minimumTotal = minimumWidths.reduce((total, width) => total + width, 0) + gaps;
  const extra = Math.max(chordAreaWidth - minimumTotal, 0);
  const extraPerSlot = slots.length ? extra / slots.length : 0;
  let cursor = chordAreaX;

  return slots.map((slot, index) => {
    const width = minimumWidths[index] + extraPerSlot;
    const x = cursor + CHORD_SLOT_INNER_PADDING / 2;
    cursor += width + CHORD_GAP_WIDTH;
    return {
      ...slot,
      x,
      width
    };
  });
}

function minimumBarWidth(bar, effectiveKey = state.key) {
  return minimumChordAreaWidth(bar, effectiveKey) + inlineChangeWidth(bar);
}

function inlineChangeSqueezesBar(bar, barWidth, rowIndex, effectiveKey = state.key) {
  if (rowIndex === 0 || (!bar?.key && !bar?.timeSignature)) return false;
  return barWidth - inlineChangeWidth(bar) < minimumChordAreaWidth(bar, effectiveKey);
}

function staffHeaderWidth(staffKey, timeSignature) {
  const signature = KEY_SIGNATURES[transposeKey(staffKey)] || KEY_SIGNATURES.C;
  const keyStartX = 39;
  const timeX = keyStartX + keySignatureWidth(signature) + 14;
  const digits = Math.max(...(timeSignature || state.timeSignature).split("/").map((part) => part.trim().length), 1);
  return timeX + digits * TIME_SIGNATURE_DIGIT_WIDTH + TIME_SIGNATURE_RIGHT_MARGIN;
}

function renderStaffRow(bars, staffKey, timeSignature, sectionBars = bars, rowStartIndex = 0, inlineMarks = {}, sectionStarts = null) {
  const width = STAFF_WIDTH;
  const staffTop = 43 + STAFF_VERTICAL_SHIFT;
  const lineGap = 9;
  const hasInlineMarkRow = bars.some((_, index) => Boolean(inlineMarks[rowStartIndex + index]));
  const height = STAFF_ROW_BASE_HEIGHT;
  let effectiveKey = staffKey;
  let effectiveTimeSignature = timeSignature;
  const signature = KEY_SIGNATURES[transposeKey(staffKey)] || KEY_SIGNATURES.C;
  const timeParts = (timeSignature || state.timeSignature).split("/");
  const keyStartX = 39;
  const keySymbols = keySignatureSymbols(signature, keyStartX, STAFF_VERTICAL_SHIFT);
  const timeX = keyStartX + keySignatureWidth(signature) + 14;
  const { barStart, barWidths } = staffRowLayout(bars, staffKey, timeSignature);
  const staffEnd = barStart + barWidths.reduce((total, barWidth) => total + barWidth, 0);
  const lines = Array.from({ length: 5 }, (_, index) =>
    `<line x1="8" y1="${staffTop + index * lineGap}" x2="${staffEnd}" y2="${staffTop + index * lineGap}" stroke="#111" stroke-width="1"/>`
  ).join("");

  // A bar starts a section at its head bar; such bars get a double bar line on their
  // left unless they already carry a repeat-start sign. When `sectionStarts` is supplied
  // (by paginateSections) it is authoritative; otherwise a standalone row treats its
  // first bar as the start.
  const isSectionStart = (combinedIndex) =>
    sectionStarts ? sectionStarts.has(combinedIndex)
      : combinedIndex === 0 || Boolean(inlineMarks[combinedIndex]);

  const rowInlineMarks = [];

  const barsSvg = bars.map((bar, index) => {
    const sectionIndex = rowStartIndex + index;
    const x = barStart + barWidths.slice(0, index).reduce((total, barWidth) => total + barWidth, 0);
    const barWidth = barWidths[index];
    const endX = x + barWidth;
    const hasInlineChange = Boolean(bar.key || bar.timeSignature);
    const inlineChange = hasInlineChange ? inlineChangeSymbols(bar, x) : { html: "", width: 0 };
    const barEffectiveKey = bar.key || effectiveKey;
    if (bar.key) effectiveKey = bar.key;
    if (bar.timeSignature) effectiveTimeSignature = bar.timeSignature;
    const ending = endingLabel(bar);
    const previousBar = sectionBars[sectionIndex - 1];
    const nextBar = sectionBars[sectionIndex + 1];
    const isSectionLastBar = sectionIndex === sectionBars.length - 1;
    const previousEnding = endingLabel(previousBar);
    const nextEnding = endingLabel(nextBar);
    const chordAreaX = x + inlineChange.width;
    const chordAreaWidth = Math.max(barWidth - inlineChange.width, barWidth * .42);
    const chordTexts = chordSlotLayout(bar, barEffectiveKey, chordAreaX, chordAreaWidth)
      .map((slot) => slot.sourceText ? previewChordText(slot.sourceText, barEffectiveKey, slot.x, CHORD_BASELINE_Y) : "")
      .join("");
    const inlineMark = inlineMarks[sectionIndex];
    // Lay out the elements above the bar's left edge left-to-right so they never collide:
    // an ending bracket's number first, then the section mark, then the Segno/Coda sign
    // ("[1.] [A] 𝄋"). Bars without these just fall back toward the bar's left edge, and
    // the sign also clears any inline key/time change.
    const bracketClearance = ending && inlineMark ? INLINE_SECTION_ENDING_CLEARANCE : ending ? 18 : 0;
    const markLeft = x + bracketClearance;
    const markRight = inlineMark ? markLeft + inlineSectionMarkOccupiedWidth(inlineMark, staffEnd) : -Infinity;
    const signAnchorX = x + Math.max(inlineChange.width + 12, bracketClearance + 10);
    const signX = Math.max(signAnchorX, markRight + INLINE_SECTION_SIGN_GAP);
    if (inlineMark) {
      rowInlineMarks.push(inlineSectionMark(inlineMark, markLeft, staffEnd, bar));
    } else if (bar.segno || bar.coda) {
      const standaloneSymbolX = index === 0 ? x - 2 : signX;
      rowInlineMarks.push(standaloneTopLaneSymbol(bar, standaloneSymbolX));
    }
    return `
      ${chordTexts}
      ${index > 0 && !bar.repeatStart && (hasInlineChange || isSectionStart(sectionIndex)) ? doubleBarLine(x, staffTop, lineGap) : ""}
      ${inlineChange.html}
      ${ending ? endingBracket(x, endX, ending, previousEnding === ending, nextEnding === ending, ENDING_BRACKET_SHIFT, !bar.endingText) : ""}
      ${barNavigationDirections(bar, x, endX, NAVIGATION_BOTTOM_LANE_Y)}
      ${bar.repeatStart ? repeatSymbol(x, "start", staffTop, lineGap) : ""}
      ${bar.repeatEnd ? repeatSymbol(endX, "end", staffTop, lineGap) : ""}
      ${isSectionLastBar && !bar.repeatEnd ? doubleBarLine(endX - 4, staffTop, lineGap) : `<line x1="${endX}" y1="${staffTop}" x2="${endX}" y2="${staffTop + lineGap * 4}" stroke="#111" stroke-width="1.2"/>`}
    `;
  }).join("");

  return { html: `
    <div class="staff-row${hasInlineMarkRow ? " has-inline-mark-row" : ""}">
      ${rowInlineMarks.join("")}
      <svg class="staff-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="五線譜">
        ${lines}
        ${gClefSymbol(8, CLEF_BASELINE_Y + STAFF_VERTICAL_SHIFT)}
        ${keySymbols}
        ${timeSignatureSymbols(timeParts, timeX, STAFF_VERTICAL_SHIFT)}
        ${!bars[0]?.repeatStart && (bars[0]?.key || bars[0]?.timeSignature || isSectionStart(rowStartIndex))
          ? doubleBarLine(barStart, staffTop, lineGap)
          : ""}
        ${barsSvg}
      </svg>
    </div>
  `, effectiveKey, effectiveTimeSignature };
}

function keySignatureSymbols(signature, startX, yOffset = 0) {
  const sharpY = [43, 56.5, 38.5, 52, 65.5, 47.5, 61];
  const flatY = [61, 47.5, 65.5, 52, 70, 56.5, 74.5];
  return Array.from({ length: signature.count }, (_, index) => {
    const x = startX + index * 8.5;
    const y = (signature.type === "sharp" ? sharpY : flatY)[index] + yOffset;
    return signature.type === "sharp" ? sharpSymbol(x, y) : flatSymbol(x, y);
  }).join("");
}

function keySignatureWidth(signature) {
  return signature.count ? signature.count * 8.5 + 2 : 4;
}

function timeSignatureSymbols(timeParts, x, yOffset = 0) {
  return `
    <text x="${x}" y="${52 + yOffset}" font-family="${SVG_FONT}" font-size="${TIME_SIGNATURE_FONT_SIZE}" font-weight="400">${escapeHtml(timeSignatureGlyphs(timeParts[0] || ""))}</text>
    <text x="${x}" y="${70 + yOffset}" font-family="${SVG_FONT}" font-size="${TIME_SIGNATURE_FONT_SIZE}" font-weight="400">${escapeHtml(timeSignatureGlyphs(timeParts[1] || ""))}</text>
  `;
}

function timeSignatureGlyphs(value) {
  return String(value).replace(/\d/g, (digit) => String.fromCharCode(0xE080 + Number(digit)));
}

function inlineChangeSymbols(bar, barX) {
  const startOffset = bar.repeatStart ? 24 : 10;
  let cursor = barX + startOffset;
  const parts = [];
  if (bar.key) {
    const signature = KEY_SIGNATURES[transposeKey(bar.key)] || KEY_SIGNATURES.C;
    parts.push(keySignatureSymbols(signature, cursor, STAFF_VERTICAL_SHIFT));
    cursor += keySignatureWidth(signature) + 8;
  }
  if (bar.timeSignature) {
    parts.push(timeSignatureSymbols(bar.timeSignature.split("/"), cursor, STAFF_VERTICAL_SHIFT));
    cursor += 22;
  }
  return {
    html: parts.join(""),
    width: inlineChangeWidth(bar)
  };
}

function inlineChangeWidth(bar) {
  if (!bar?.key && !bar?.timeSignature) return 0;
  let width = bar.repeatStart ? 24 : 10;
  if (bar.key) {
    const signature = KEY_SIGNATURES[transposeKey(bar.key)] || KEY_SIGNATURES.C;
    width += keySignatureWidth(signature) + 8;
  }
  if (bar.timeSignature) width += 22;
  if (bar.key && bar.timeSignature) width += INLINE_CHANGE_DOUBLE_STACK_PADDING;
  return Math.max(width + 4, 34);
}

function doubleBarLine(x, top, gap) {
  return `
    <line x1="${x}" y1="${top}" x2="${x}" y2="${top + gap * 4}" stroke="#111" stroke-width="1.2"/>
    <line x1="${x + 4}" y1="${top}" x2="${x + 4}" y2="${top + gap * 4}" stroke="#111" stroke-width="1.2"/>
  `;
}

function musicGlyph(glyph, x, y, size, options = {}) {
  const anchor = options.anchor || "start";
  return `<text x="${x}" y="${y}" text-anchor="${anchor}" font-family="${SVG_FONT}" font-size="${size}" font-weight="400">${glyph}</text>`;
}

function sharpSymbol(x, y) {
  return musicGlyph("\uE262", x, y + KEY_SIGNATURE_BASELINE_OFFSET, KEY_SIGNATURE_FONT_SIZE);
}

function flatSymbol(x, y) {
  return musicGlyph("\uE260", x, y + KEY_SIGNATURE_BASELINE_OFFSET, KEY_SIGNATURE_FONT_SIZE);
}

function gClefSymbol(x, y) {
  return musicGlyph("\uE050", x, y, CLEF_FONT_SIZE);
}

function endingBracket(x, endX, ending, continuesFromPrevious, continuesToNext, yOffset = 0, appendDot = true) {
  const startX = continuesFromPrevious ? x : x + 2;
  const finishX = continuesToNext ? endX : endX - 2;
  const label = clampEndingLabel(ending, appendDot);
  const bracketOffset = yOffset - 2;
  return `
    <path d="${continuesFromPrevious ? `M ${startX} ${2 + bracketOffset}` : `M ${startX} ${24 + bracketOffset} V ${2 + bracketOffset}`} H ${finishX}" fill="none" stroke="#111" stroke-width="1"/>
    ${continuesFromPrevious ? "" : `<text x="${x + 7}" y="${16 + yOffset}" font-family="${SVG_FONT}" font-size="${label.compact ? ENDING_TEXT_COMPACT_FONT_SIZE : 12}" font-weight="800">${escapeHtml(label.text)}</text>`}
  `;
}

function codaSymbol(x = 80, y = TOP_LANE_SYMBOL_Y) {
  return musicGlyph("\uE048", x, y, 24);
}

function toCodaText(x, y) {
  return `
    <text class="direction-text direction-text-to" x="${x - 17}" y="${y}" text-anchor="end" font-family="${DIRECTION_TEXT_FONT}" font-size="14" font-weight="800">to</text>
    <text x="${x}" y="${y + 1}" text-anchor="end" font-family="${SVG_FONT}" font-size="15" font-weight="400">\uE048</text>
  `;
}

function navigationLabel(text, x, y) {
  return `<text class="direction-text" x="${x}" y="${y}" text-anchor="end" font-family="${DIRECTION_TEXT_FONT}" font-size="14" font-weight="800">${text}</text>`;
}

// Fine, D.C., D.S., and to Coda all sit at the bar's bottom-right, just under the staff.
// They are kept clear of the SVG's lower edge so they do not collide with an inline
// section mark on the row below (those marks protrude upward into the inter-row gap).
// When more than one is set on the same bar, lay them out right-to-left so they never overlap.
function barNavigationDirections(bar, barLeft, endX, y = NAVIGATION_BASELINE_Y) {
  const items = [];
  if (bar.fine) items.push({ width: 30, render: (right) => navigationLabel("Fine", right, y) });
  if (bar.toCoda) items.push({ width: 32, render: (right) => toCodaText(right, y) });
  if (bar.ds) items.push({ width: 26, render: (right) => navigationLabel("D.S.", right, y) });
  if (bar.dc) items.push({ width: 26, render: (right) => navigationLabel("D.C.", right, y) });
  const barWidth = endX - barLeft;
  let right = endX - Math.min(8, Math.max(4, barWidth * .04));
  return items.map((item) => {
    const idealRight = Math.min(right, barLeft + Math.max(item.width, barWidth - 10));
    const clampedRight = Math.max(idealRight, barLeft + item.width);
    const html = item.render(clampedRight);
    right = clampedRight - item.width - 6;
    return html;
  }).join("");
}

function segnoSymbol(x = 84, y = TOP_LANE_SYMBOL_Y) {
  return musicGlyph("\uE047", x, y, 24);
}

function repeatSymbol(x, side, top, gap) {
  const isStart = side === "start";
  const thinX = isStart ? x + 4 : x - 4;
  const thickX = x;
  const dotX = isStart ? x + 10 : x - 10;
  return `
    <line x1="${thinX}" y1="${top}" x2="${thinX}" y2="${top + gap * 4}" stroke="#111" stroke-width="1.2"/>
    <line x1="${thickX}" y1="${top}" x2="${thickX}" y2="${top + gap * 4}" stroke="#111" stroke-width="3"/>
    <circle cx="${dotX}" cy="${top + gap * 1.5}" r="2" fill="#111"/>
    <circle cx="${dotX}" cy="${top + gap * 2.5}" r="2" fill="#111"/>
  `;
}

function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.classList.add("visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => elements.toast.classList.remove("visible"), 2400);
}

document.querySelector(".editor-tabs").addEventListener("click", (event) => {
  const tab = event.target.closest("[data-editor-tab]");
  if (!tab) return;
  const target = tab.dataset.editorTab;
  document.querySelectorAll("[data-editor-tab]").forEach((button) => {
    const isActive = button === tab;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-selected", String(isActive));
  });
  document.querySelectorAll(".editor-card").forEach((panel) => {
    panel.classList.toggle("active", panel.id === `${target === "song" ? "song" : "section"}-editor-panel`);
  });
});

document.querySelector(".song-editor").addEventListener("input", (event) => {
  const fieldMap = {
    title: "title",
    artist: "artist",
    key: "key",
    tempo: "tempo",
    "time-signature": "timeSignature",
    "accidental-preference": "accidentalPreference"
  };
  const property = fieldMap[event.target.id];
  if (!property) return;
  if (property === "tempo") {
    state[property] = clampNumber(event.target.value, MIN_TEMPO, MAX_TEMPO, DEFAULT_TEMPO);
  }
  else if (property === "accidentalPreference") {
    const definition = KEY_SIGNATURES[state.key];
    state.accidentalPreference = event.target.value;
    state.key = keyForPitch(definition.pitch, definition.mode);
    state.sections.forEach((section) => {
      section.bars.forEach((bar) => {
        if (!bar.key) return;
        const barDefinition = KEY_SIGNATURES[bar.key];
        bar.key = keyForPitch(barDefinition.pitch, barDefinition.mode);
      });
    });
  } else state[property] = event.target.value;
  saveAndRender({ editor: property === "accidentalPreference" });
});

elements.tempo.addEventListener("change", (event) => {
  state.tempo = clampNumber(event.target.value, MIN_TEMPO, MAX_TEMPO, DEFAULT_TEMPO);
  event.target.value = state.tempo;
  saveAndRender();
});

elements.transposeEnabled.addEventListener("change", (event) => {
  state.transpose.enabled = event.target.checked;
  saveAndRender({ editor: true });
});

elements.transposeAmount.addEventListener("change", (event) => {
  state.transpose.semitones = Number(event.target.value);
  saveAndRender();
});

elements.degreeEnabled.addEventListener("change", (event) => {
  state.degreeNotation = event.target.checked;
  saveAndRender();
});

elements.sectionsEditor.addEventListener("input", (event) => {
  const sectionBlock = event.target.closest(".section-block");
  if (!sectionBlock) return;
  const sectionIndex = Number(sectionBlock.dataset.sectionIndex);
  if (event.target.classList.contains("section-label")) {
    state.sections[sectionIndex].label = event.target.value;
    const tab = elements.sectionsEditor.querySelector(`[data-section-tab="${sectionIndex}"]`);
    if (tab) tab.textContent = event.target.value || `Section ${sectionIndex + 1}`;
  }
  if (event.target.classList.contains("section-note")) {
    state.sections[sectionIndex].note = event.target.value;
  }
  if (event.target.classList.contains("bar-chord")) {
    const barIndex = Number(event.target.closest(".bar-editor").dataset.barIndex);
    const chordIndex = Number(event.target.dataset.chordIndex);
    const bar = state.sections[sectionIndex].bars[barIndex];
    bar.chords[chordIndex] = {
      text: normalizeChordText(event.target.value)
    };
    bar.chords = renumberChordPositions(bar.chords);
  }
  if (event.target.classList.contains("bar-ending-text")) {
    const barIndex = Number(event.target.closest(".bar-editor").dataset.barIndex);
    const bar = state.sections[sectionIndex].bars[barIndex];
    const value = event.target.value.trim();
    if (value) bar.endingText = value;
    else delete bar.endingText;
  }
  saveAndRender();
});

elements.sectionsEditor.addEventListener("change", (event) => {
  const sectionBlock = event.target.closest(".section-block");
  if (!sectionBlock) return;
  const sectionIndex = Number(sectionBlock.dataset.sectionIndex);
  if (event.target.classList.contains("section-continued")) {
    state.sections[sectionIndex].continued = event.target.checked;
    saveAndRender();
    return;
  }
  const barEditor = event.target.closest(".bar-editor");
  const barIndex = barEditor ? Number(barEditor.dataset.barIndex) : -1;
  const bar = barIndex >= 0 ? state.sections[sectionIndex].bars[barIndex] : null;
  if (event.target.classList.contains("bar-key-enabled")) {
    if (event.target.checked) bar.key = effectiveStateBeforeBar(sectionIndex, barIndex).key;
    else delete bar.key;
    activeBarOptions = `${sectionIndex}:${barIndex}`;
    saveAndRender({ editor: true });
    return;
  }
  if (event.target.classList.contains("bar-key")) {
    bar.key = event.target.value;
    activeBarOptions = `${sectionIndex}:${barIndex}`;
    saveAndRender({ editor: true });
    return;
  }
  if (event.target.classList.contains("bar-time-enabled")) {
    if (event.target.checked) bar.timeSignature = effectiveStateBeforeBar(sectionIndex, barIndex).timeSignature;
    else delete bar.timeSignature;
    activeBarOptions = `${sectionIndex}:${barIndex}`;
    saveAndRender({ editor: true });
    return;
  }
  if (event.target.classList.contains("bar-time-signature")) {
    bar.timeSignature = event.target.value;
    activeBarOptions = `${sectionIndex}:${barIndex}`;
    saveAndRender({ editor: true });
    return;
  }
  if (event.target.classList.contains("bar-section-head")) {
    if (event.target.checked) bar.sectionHead = true;
    else delete bar.sectionHead;
    activeBarOptions = `${sectionIndex}:${barIndex}`;
    saveAndRender({ editor: true });
    return;
  }
  if (!event.target.matches("[data-flag]")) return;
  const flag = event.target.dataset.flag;
  if (event.target.checked) bar[flag] = true;
  else delete bar[flag];
  activeBarOptions = `${sectionIndex}:${barIndex}`;
  saveAndRender({ editor: true });
});

elements.sectionsEditor.addEventListener("click", (event) => {
  const tab = event.target.closest("[data-section-tab]");
  if (tab) {
    activeSectionIndex = Number(tab.dataset.sectionTab);
    renderEditor();
    return;
  }
  const sectionBlock = event.target.closest(".section-block");
  if (!sectionBlock) return;
  const sectionIndex = Number(sectionBlock.dataset.sectionIndex);
  const summary = event.target.closest(".bar-settings summary");
  if (summary) {
    const barIndex = Number(summary.closest(".bar-editor").dataset.barIndex);
    activeBarOptions = summary.parentElement.open ? "" : `${sectionIndex}:${barIndex}`;
  }
  if (event.target.closest(".delete-section")) {
    state.sections.splice(sectionIndex, 1);
    activeSectionIndex = Math.min(sectionIndex, Math.max(state.sections.length - 1, 0));
    saveAndRender({ editor: true });
  }
  if (event.target.closest(".copy-section")) {
    const copiedSection = clone(state.sections[sectionIndex]);
    copiedSection.label = `${copiedSection.label || "Section"} Copy`;
    state.sections.splice(sectionIndex + 1, 0, copiedSection);
    activeSectionIndex = sectionIndex + 1;
    saveAndRender({ editor: true });
    showToast("セクションをコピーしました");
  }
  const moveButton = event.target.closest(".move-section");
  if (moveButton) {
    const targetIndex = sectionIndex + Number(moveButton.dataset.direction);
    if (targetIndex >= 0 && targetIndex < state.sections.length) {
      const [movedSection] = state.sections.splice(sectionIndex, 1);
      state.sections.splice(targetIndex, 0, movedSection);
      activeSectionIndex = targetIndex;
      saveAndRender({ editor: true });
    }
  }
  const addChordSlot = event.target.closest(".add-chord-slot");
  if (addChordSlot) {
    const barIndex = Number(addChordSlot.closest(".bar-editor").dataset.barIndex);
    const bar = state.sections[sectionIndex].bars[barIndex];
    bar.chords.push({ text: "" });
    bar.chords = renumberChordPositions(bar.chords);
    saveAndRender({ editor: true });
    return;
  }
  const deleteChordSlot = event.target.closest(".delete-chord-slot");
  if (deleteChordSlot) {
    const barIndex = Number(deleteChordSlot.closest(".bar-editor").dataset.barIndex);
    const chordIndex = Number(deleteChordSlot.dataset.chordIndex);
    const bar = state.sections[sectionIndex].bars[barIndex];
    if (bar.chords.length > 1) {
      bar.chords.splice(chordIndex, 1);
      bar.chords = renumberChordPositions(bar.chords);
      saveAndRender({ editor: true });
    }
    return;
  }
  if (event.target.closest(".add-bar")) {
    state.sections[sectionIndex].bars.push({ chords: createChordSlots() });
    saveAndRender({ editor: true });
  }
  if (event.target.closest(".delete-bar")) {
    const barIndex = Number(event.target.closest(".bar-editor").dataset.barIndex);
    state.sections[sectionIndex].bars.splice(barIndex, 1);
    activeBarOptions = "";
    saveAndRender({ editor: true });
  }
});

function effectiveStateBeforeBar(sectionIndex, barIndex) {
  let key = state.key;
  let timeSignature = state.timeSignature;
  state.sections.forEach((section, currentSectionIndex) => {
    section.bars.forEach((bar, currentBarIndex) => {
      if (currentSectionIndex === sectionIndex && currentBarIndex === barIndex) return;
      if (currentSectionIndex > sectionIndex || (currentSectionIndex === sectionIndex && currentBarIndex > barIndex)) return;
      if (bar.key) key = bar.key;
      if (bar.timeSignature) timeSignature = bar.timeSignature;
    });
  });
  return { key, timeSignature };
}

function exportFileName() {
  return `${(state.title || "lead-sheet").replace(/[\\/:*?"<>|]/g, "_")}.json`;
}

async function saveJsonWithPicker(blob, fileName) {
  if (typeof window.showSaveFilePicker !== "function") return false;
  const handle = await window.showSaveFilePicker({
    suggestedName: fileName,
    types: [
      {
        description: "JSON Files",
        accept: { "application/json": [".json"] }
      }
    ]
  });
  const writable = await handle.createWritable();
  await writable.write(blob);
  await writable.close();
  return true;
}

document.querySelector("#add-section").addEventListener("click", () => {
  state.sections.push({
    label: "New Section",
    note: "",
    bars: Array.from({ length: 4 }, () => ({ chords: createChordSlots() }))
  });
  activeSectionIndex = state.sections.length - 1;
  saveAndRender({ editor: true });
});

document.querySelector("#export-json").addEventListener("click", async () => {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const fileName = exportFileName();
  try {
    const saved = await saveJsonWithPicker(blob, fileName);
    if (saved) {
      showToast("保存先を選んでJSONを書き出しました");
      return;
    }
  } catch (error) {
    if (error?.name === "AbortError") return;
    console.error(error);
  }

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
  showToast("JSONを書き出しました");
});

document.querySelector("#import-json").addEventListener("change", async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  try {
    state = normalizeState(JSON.parse(await file.text()));
    activeSectionIndex = 0;
    saveAndRender({ editor: true });
    showToast("JSONを読み込みました");
  } catch (error) {
    showToast(error.message || "JSONを読み込めませんでした");
  } finally {
    event.target.value = "";
  }
});

document.querySelector("#reset-sheet").addEventListener("click", () => {
  if (!window.confirm("現在の編集内容をリセットします。よろしいですか？")) return;
  localStorage.removeItem(STORAGE_KEY);
  state = normalizeState(clone(EMPTY_DATA));
  activeSectionIndex = 0;
  activeBarOptions = "";
  saveAndRender({ editor: true });
  showToast("リセットしました");
});

document.querySelector("#print-sheet").addEventListener("click", () => window.print());

renderEditor();
renderSheet();

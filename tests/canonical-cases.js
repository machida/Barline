module.exports = {
  baseline: {
    title: "Case A Baseline",
    artist: "Tester",
    key: "C",
    tempo: 120,
    timeSignature: "4/4",
    sections: [
      {
        label: "Intro",
        bars: [
          { chords: [{ text: "C" }, { text: "" }, { text: "F" }, { text: "G" }] },
          { chords: [{ text: "Am" }, { text: "" }, { text: "Dm" }, { text: "G7" }] },
          { chords: [{ text: "C" }, { text: "" }, { text: "F" }, { text: "G" }] },
          { chords: [{ text: "C" }, { text: "" }, { text: "G" }, { text: "C" }] }
        ]
      }
    ]
  },
  denseChords: {
    title: "Case B Dense Chords",
    artist: "Tester",
    key: "E♭",
    tempo: 96,
    timeSignature: "4/4",
    accidentalPreference: "flat",
    degreeNotation: true,
    transpose: { enabled: true, semitones: 2 },
    sections: [
      {
        label: "Verse",
        bars: [
          { chords: [{ text: "E♭maj7" }, { text: "Gm7" }, { text: "A♭maj7" }, { text: "B♭7" }, { text: "Cm7" }, { text: "F7" }] },
          { chords: [{ text: "E♭/G" }, { text: "Gdim7" }, { text: "A♭6" }, { text: "Adim7" }, { text: "B♭7sus4" }, { text: "B♭7" }] },
          { chords: [{ text: "Cm7" }, { text: "B♭/D" }, { text: "E♭" }, { text: "F7" }, { text: "Gm7" }, { text: "A♭maj7" }] },
          { chords: [{ text: "B♭7" }, { text: "E♭maj7" }, { text: "A♭maj7" }, { text: "B♭7" }, { text: "Cm7" }, { text: "F7♭9" }] },
          { chords: [{ text: "E♭maj9" }, { text: "Gm11" }, { text: "A♭maj7" }, { text: "B♭13" }, { text: "Cm9" }, { text: "F7alt" }] }
        ]
      }
    ]
  },
  denseBarHead: {
    title: "Case C Dense Bar Head",
    artist: "Tester",
    key: "C",
    tempo: 120,
    timeSignature: "4/4",
    accidentalPreference: "sharp",
    sections: [
      {
        label: "Intro",
        bars: [
          { chords: [{ text: "Cmaj7" }, { text: "E7" }, { text: "Am7" }, { text: "D7" }] },
          { key: "E", chords: [{ text: "Emaj7" }, { text: "C#m7" }, { text: "F#7" }, { text: "B7" }] },
          { timeSignature: "7/8", chords: [{ text: "E" }, { text: "" }, { text: "F#7" }, { text: "B7" }] },
          { key: "A♭", timeSignature: "3/4", chords: [{ text: "A♭maj7" }, { text: "B♭m7" }, { text: "E♭7" }] }
        ]
      }
    ]
  },
  topLane: {
    title: "Case D Top Lane",
    artist: "Tester",
    key: "Gm",
    tempo: 132,
    timeSignature: "4/4",
    accidentalPreference: "flat",
    sections: [
      {
        label: "A",
        note: "歌",
        bars: [
          { repeatStart: true, segno: true, chords: [{ text: "Gm7" }, { text: "" }, { text: "Cm7" }, { text: "D7" }] },
          { ending1: true, chords: [{ text: "Gm7" }, { text: "F" }, { text: "E♭" }, { text: "D7" }] },
          { ending1: true, toCoda: true, chords: [{ text: "Gm7" }, { text: "B♭" }, { text: "Cm7" }, { text: "D7" }] },
          { repeatEnd: true, ending2: true, chords: [{ text: "Gm7" }, { text: "" }, { text: "Cm7" }, { text: "D7" }] }
        ]
      },
      {
        label: "B",
        continued: true,
        note: "2回目",
        bars: [
          { sectionHead: true, coda: true, chords: [{ text: "E♭maj7" }, { text: "D7" }, { text: "Gm" }, { text: "" }] },
          { chords: [{ text: "Cm7" }, { text: "D7" }, { text: "Gm" }, { text: "" }] }
        ]
      }
    ]
  },
  bottomLane: {
    title: "Case E Bottom Lane",
    artist: "Tester",
    key: "Gm",
    tempo: 132,
    timeSignature: "4/4",
    accidentalPreference: "flat",
    sections: [
      {
        label: "Coda",
        bars: [
          { fine: true, chords: [{ text: "Cm7" }, { text: "D7" }, { text: "Gm" }, { text: "" }] },
          { dc: true, chords: [{ text: "B♭" }, { text: "Am7♭5" }, { text: "D7" }, { text: "Gm" }] },
          { ds: true, chords: [{ text: "Gm" }, { text: "F" }, { text: "E♭" }, { text: "D7" }] },
          { toCoda: true, repeatEnd: true, chords: [{ text: "Gm" }, { text: "Cm7" }, { text: "D7" }, { text: "Gm" }] }
        ]
      }
    ]
  },
  multipage: {
    title: "Case F Multipage",
    artist: "Tester",
    key: "D♭",
    tempo: 88,
    timeSignature: "12/8",
    accidentalPreference: "flat",
    sections: [
      {
        label: "Verse",
        bars: Array.from({ length: 16 }, (_, index) => ({
          chords: [{ text: index % 4 === 0 ? "D♭maj7" : "G♭maj7" }, { text: "B♭m7" }, { text: "E♭m7" }, { text: "A♭7" }]
        }))
      },
      {
        label: "Bridge",
        continued: true,
        bars: [
          { chords: [{ text: "" }, { text: "A♭7" }] },
          { sectionHead: true, segno: true, key: "G♭", timeSignature: "7/8", chords: [{ text: "G♭maj7" }, { text: "D♭/F" }, { text: "E♭m7" }, { text: "A♭7" }] },
          ...Array.from({ length: 14 }, () => ({ chords: [{ text: "G♭maj7" }, { text: "A♭m7" }, { text: "D♭7" }, { text: "G♭maj7" }] }))
        ]
      },
      {
        label: "Outro",
        bars: Array.from({ length: 12 }, () => ({ chords: [{ text: "D♭maj7" }, { text: "B♭m7" }, { text: "E♭m7" }, { text: "A♭7" }] }))
      }
    ]
  },
  sparsePage: {
    title: "Case G Sparse Page",
    artist: "Tester",
    key: "C",
    tempo: 72,
    timeSignature: "4/4",
    sections: [
      {
        label: "Intro",
        bars: [
          { chords: [{ text: "Cmaj7" }, { text: "" }, { text: "Fmaj7" }, { text: "G7" }] },
          { chords: [{ text: "Cmaj7" }, { text: "" }, { text: "Am7" }, { text: "D7" }] }
        ]
      }
    ]
  },
  longText: {
    title: "Case H Long Text",
    artist: "Tester",
    key: "F",
    tempo: 92,
    timeSignature: "4/4",
    sections: [
      {
        label: "Verse",
        note: "このセクションメモは長めで、上部帯の省略と整列確認に使うケースです",
        bars: [
          { endingText: "Only second chorus repeat with fill", chords: [{ text: "Fmaj7" }, { text: "Gm7" }, { text: "Am7" }, { text: "B♭maj7" }] },
          { endingText: "Play melody only on last pass", chords: [{ text: "Gm7" }, { text: "C7" }, { text: "Fmaj7" }, { text: "D7" }] },
          { chords: [{ text: "Gm7" }, { text: "C7" }, { text: "Fmaj7" }, { text: "C7" }] },
          { toCoda: true, chords: [{ text: "Dm7" }, { text: "G7" }, { text: "Cmaj7" }, { text: "C7" }] }
        ]
      }
    ]
  }
};

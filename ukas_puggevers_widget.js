// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-brown; icon-glyph: magic;
// Ukas Bibelvers – Scriptable Widget
// Lagre bibelvers.json i iCloud Drive → Scriptable

const FILENAME = "bibelvers.json";

// ── YouVersion-bibel-ID ───────────────────────────────────────────
// Finn ID-en på bible.com/versions (tallet i URL-en).
// 102 -> Norsk Bibel 88/07
// 2216 -> BGO
// 29 -> Bibel 2011
// 119 -> Bibel 2011 nynorsk
const BIBLE_ID = 102;

// ── Fontstørrelser (Base) ────────────────────────────────────────
const BODY_SIZE   = { small: 16, medium: 19, large: 22 };
const REF_OFFSET  = 2;  // ref-tekst er alltid dette mange punkter mindre enn body

// ── Boknavn → USFM-forkortelse ────────────────────────────────────
const BOOK_MAP = {
  // Norsk
  "1. Mosebok": "GEN", "2. Mosebok": "EXO", "3. Mosebok": "LEV",
  "4. Mosebok": "NUM", "5. Mosebok": "DEU", "Josva": "JOS",
  "Dommerne": "JDG", "Rut": "RUT", "1. Samuelsbok": "1SA",
  "2. Samuelsbok": "2SA", "1. Kongebok": "1KI", "2. Kongebok": "2KI",
  "1. Krønikebok": "1CH", "2. Krønikebok": "2CH", "Esra": "EZR",
  "Nehemja": "NEH", "Ester": "EST", "Job": "JOB", "Salme": "PSA",
  "Ordspråkene": "PRO", "Forkynneren": "ECC", "Høysangen": "SNG",
  "Jesaja": "ISA", "Jeremia": "JER", "Klagesangene": "LAM",
  "Esekiel": "EZK", "Daniel": "DAN", "Hosea": "HOS", "Joel": "JOL",
  "Amos": "AMO", "Obadja": "OBA", "Jona": "JON", "Mika": "MIC",
  "Nahum": "NAH", "Habakkuk": "HAB", "Sefanja": "ZEP", "Haggai": "HAG",
  "Sakarja": "ZEC", "Malaki": "MAL", "Matteus": "MAT", "Markus": "MRK",
  "Lukas": "LUK", "Johannes": "JHN", "Apostlenes gjerninger": "ACT",
  "Romerne": "ROM", "1. Korinterbrev": "1CO", "2. Korinterbrev": "2CO",
  "Galaterne": "GAL", "Efeserne": "EPH", "Filipperne": "PHP",
  "Kolosserne": "COL", "1. Tessalonikerbrev": "1TH", "2. Tessalonikerbrev": "2TH",
  "1. Timoteus": "1TI", "2. Timoteus": "2TI",
  "Titus": "TIT", "Filemon": "PHM", "Hebreerne": "HEB", "Jakob": "JAS",
  "1. Peter": "1PE", "2. Peter": "2PE",
  "1. Johannesbrev": "1JN", "2. Johannesbrev": "2JN", "3. Johannesbrev": "3JN",
  "Judas": "JUD", "Åpenbaringen": "REV",

  // English
  "Genesis": "GEN", "Exodus": "EXO", "Leviticus": "LEV", "Numbers": "NUM",
  "Deuteronomy": "DEU", "Joshua": "JOS", "Judges": "JDG", "Ruth": "RUT",
  "1 Samuel": "1SA", "2 Samuel": "2SA", "1 Kings": "1KI", "2 Kings": "2KI",
  "1 Chronicles": "1CH", "2 Chronicles": "2CH", "Ezra": "EZR",
  "Nehemiah": "NEH", "Esther": "EST", "Psalms": "PSA", "Psalm": "PSA",
  "Proverbs": "PRO", "Ecclesiastes": "ECC", "Song of Solomon": "SNG",
  "Song of Songs": "SNG", "Isaiah": "ISA", "Jeremiah": "JER",
  "Lamentations": "LAM", "Ezekiel": "EZK", "Daniel": "DAN", "Hosea": "HOS",
  "Joel": "JOL", "Amos": "AMO", "Obadiah": "OBA", "Jonah": "JON",
  "Micah": "MIC", "Nahum": "NAH", "Habakkuk": "HAB", "Zephaniah": "ZEP",
  "Haggai": "HAG", "Zechariah": "ZEC", "Malachi": "MAL", "Matthew": "MAT",
  "Mark": "MRK", "Luke": "LUK", "John": "JHN", "Acts": "ACT",
  "Romans": "ROM", "1 Corinthians": "1CO", "2 Corinthians": "2CO",
  "Galatians": "GAL", "Ephesians": "EPH", "Philippians": "PHP",
  "Colossians": "COL", "1 Thessalonians": "1TH", "2 Thessalonians": "2TH",
  "1 Timothy": "1TI", "2 Timothy": "2TI", "Titus": "TIT", "Philemon": "PHM",
  "Hebrews": "HEB", "James": "JAS", "1 Peter": "1PE", "2 Peter": "2PE",
  "1 John": "1JN", "2 John": "2JN", "3 John": "3JN", "Jude": "JUD",
  "Revelation": "REV",
};

// Bøker med bare ett kapittel — referansen inneholder ikke kapittelnummer
const SINGLE_CHAPTER_BOOKS = new Set(["OBA", "PHM", "2JN", "3JN", "JUD"]);

// ── Bygg YouVersion-URL fra referanse ────────────────────────────
function refToUrl(ref) {
  const m = ref.match(/^(.+?)\s+(\d+)(?::(\d+)(?:-(\d+))?|-(\d+))?$/);
  if (!m) return `https://www.bible.com/bible/${BIBLE_ID}`;

  const bookName = m[1].trim();
  const abbr = BOOK_MAP[bookName];
  if (!abbr) return `https://www.bible.com/bible/${BIBLE_ID}`;

  let chapter, start, end;
  if (SINGLE_CHAPTER_BOOKS.has(abbr)) {
    chapter = 1;
    start = parseInt(m[2]);
    end = m[5] ? parseInt(m[5]) : start;
  } else {
    chapter = parseInt(m[2]);
    start = m[3] ? parseInt(m[3]) : null;
    end = m[4] ? parseInt(m[4]) : (start !== null ? start : null);
  }

  if (start === null) return `https://www.bible.com/bible/${BIBLE_ID}/${abbr}.${chapter}`;
  const verseStr = start === end ? `${start}` : `${start}-${end}`;
  return `https://www.bible.com/bible/${BIBLE_ID}/${abbr}.${chapter}.${verseStr}`;
}

// ── Hent verslisten ──────────────────────────────────────────────
async function loadVerses() {
  const fm = FileManager.iCloud();
  const dir = fm.documentsDirectory();
  const path = fm.joinPath(dir, FILENAME);

  if (!fm.fileExists(path)) {
    return [{ ref: "Oppsett mangler", text: `Lagre ${FILENAME} i iCloud Drive → Scriptable` }];
  }

  await fm.downloadFileFromiCloud(path);
  const raw = fm.readString(path);
  try {
    return JSON.parse(raw);
  } catch {
    return [{ ref: "Feil i bibelvers.json", text: "Filen kunne ikke leses. Sjekk at den er gyldig JSON." }];
  }
}

// ── Velg vers basert på ukenummer ────────────────────────────────
function weekNumber(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

function pickVerse(verses, week) {
  const match = verses.find(v => v.week === week);
  if (match) return match;

  // Fallback: roter gjennom listen
  return verses[week % verses.length];
}

// ── Dynamisk skriftstørrelse ──────────────────────────────────────
function getDynamicSize(text, sizeCategory) {
  let bodySize = BODY_SIZE[sizeCategory] || BODY_SIZE.large;
  const len = text.length;

  if (len > 200) bodySize -= 4;
  else if (len > 120) bodySize -= 2;
  else if (len < 50)  bodySize += 4;

  bodySize = Math.max(bodySize, 12);
  return {
    body: bodySize,
    ref:  Math.max(bodySize - REF_OFFSET, 11),
  };
}

// ── Bygg widget ───────────────────────────────────────────────────
async function buildWidget(verse, size, week) {
  const w = new ListWidget();
  w.backgroundColor = new Color("#1c1c1e");
  w.setPadding(18, 20, 18, 20);
  w.url = refToUrl(verse.ref);

  // Uke-label
  const weekLabel = w.addText(`UKE ${week}`.toUpperCase());
  weekLabel.textColor = new Color("#444444");
  weekLabel.font = Font.systemFont(12, "bold");
  weekLabel.minimumScaleFactor = 0.8;

  w.addSpacer(size === "small" ? 4 : 8);

  // Selve versteksten
  const fontSize = getDynamicSize(verse.text, size);
  const bodyText = w.addText("\u201C" + verse.text + "\u201D");
  bodyText.textColor = new Color("#F5F5F0");
  bodyText.font = new Font("Georgia", fontSize.body);
  bodyText.minimumScaleFactor = 0.5;

  w.addSpacer(6);

  // Referanse
  const refText = w.addText("— " + verse.ref);
  refText.textColor = new Color("#888880");
  refText.font = new Font("Georgia-Italic", fontSize.ref);
  refText.minimumScaleFactor = 0.7;

  w.addSpacer();

  return w;
}

// ── Kjør ─────────────────────────────────────────────────────────
const week = weekNumber(new Date());
const verses = await loadVerses();
const verse = pickVerse(verses, week);

const size = config.widgetFamily ?? "large";
const widget = await buildWidget(verse, size, week);

if (config.runsInWidget) {
  Script.setWidget(widget);
} else {
  if (size === "small") widget.presentSmall();
  else if (size === "medium") widget.presentMedium();
  else widget.presentLarge();
}

Script.complete();

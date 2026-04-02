const scrapeIt = require("scrape-it");
const cheerio = require("cheerio");
const fs = require("fs");
const path = require("path");

// ─── Configuration ────────────────────────────────────────────────────────────
// Kjøres fra prosjektets rotmappe:
//   node scraper/scrape-verses.js <translation_id> <verses-fil>
//
// Eksempel:  node scraper/scrape-verses.js 102 verses/NB88.json
// Finn translation ID-er på https://www.bible.com/versions (tallet i URL-en)
const TRANSLATION_ID = parseInt(process.argv[2]) || 102; // standard: NB 88/07

// Versfil — standard er verses/NB88.json relativt til prosjektets rotmappe
const JSON_FILE = process.argv[3] || path.join(__dirname, "../verses/NB88.json");
// ─────────────────────────────────────────────────────────────────────────────

const BASE_URL = `https://www.bible.com/bible/${TRANSLATION_ID}`;

// Maps book names to USFM abbreviations.
// Add entries here if your Bible translation uses different book names.
const BOOK_MAP = {
  // Norwegian (NB, NB88/07, etc.)
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
  "1. Timoteus": "1TI", "2. Timoteus": "2TI", "2. Timotheus": "2TI",
  "1. Timotheus": "1TI", "Titus": "TIT", "Filemon": "PHM",
  "Hebreerne": "HEB", "Jakob": "JAS", "1. Peter": "1PE", "2. Peter": "2PE",
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
  "Revelation": "REV"
};

// Books with only 1 chapter — verse number follows book name directly
// e.g. "Judas 24-25" means chapter 1, verses 24–25
const SINGLE_CHAPTER_BOOKS = new Set(["OBA", "PHM", "2JN", "3JN", "JUD"]);

function parseRef(ref) {
  const bookMatch = ref.match(/^(.+?)\s+(\d+)(?::(\d+)(?:-(\d+))?|-(\d+))?$/);
  if (!bookMatch) throw new Error(`Cannot parse ref: ${ref}`);

  const bookName = bookMatch[1].trim();
  const abbr = BOOK_MAP[bookName];
  if (!abbr) throw new Error(`Unknown book: "${bookName}" — add it to BOOK_MAP`);

  if (SINGLE_CHAPTER_BOOKS.has(abbr)) {
    const start = parseInt(bookMatch[2]);
    const end = bookMatch[5] ? parseInt(bookMatch[5]) : start;
    return { abbr, chapter: 1, start, end };
  }

  const chapter = parseInt(bookMatch[2]);
  const start = bookMatch[3] ? parseInt(bookMatch[3]) : null;
  const end = bookMatch[4] ? parseInt(bookMatch[4]) : (start !== null ? start : null);

  return { abbr, chapter, start, end };
}

async function fetchChapterVerses(abbr, chapter) {
  const url = `${BASE_URL}/${abbr}.${chapter}`;
  const { data } = await scrapeIt(url, {
    json: { selector: "script#__NEXT_DATA__", eq: 0 }
  });

  const nextData = JSON.parse(data.json || "{}");
  const html = nextData?.props?.pageProps?.chapterInfo?.content;
  if (!html) throw new Error(`No chapter HTML for ${abbr}.${chapter}`);

  const $ = cheerio.load(html);
  const verses = {};

  $("span.verse").each((_, el) => {
    const usfm = $(el).attr("data-usfm");
    if (!usfm) return;

    $("span.note", el).remove();   // strip cross-references
    $("span.label", el).remove();  // strip verse numbers
    const raw = $("span.content", el).map((_, s) => $(s).text()).get().join("").replace(/\s+/g, " ").trim();
    if (raw) {
      const verseNum = parseInt(usfm.split(".")[2]);
      // Accumulate — some translations split a single verse across multiple spans (e.g. poetry)
      verses[verseNum] = verses[verseNum] ? (verses[verseNum] + " " + raw).replace(/\s+/g, " ").trim() : raw;
    }
  });

  return verses;
}

async function fetchVerses(ref) {
  const { abbr, chapter, start, end } = parseRef(ref);
  const verses = await fetchChapterVerses(abbr, chapter);

  const verseStart = start !== null ? start : Math.min(...Object.keys(verses).map(Number));
  const verseEnd = end !== null ? end : Math.max(...Object.keys(verses).map(Number));

  const parts = [];
  for (let v = verseStart; v <= verseEnd; v++) {
    if (!verses[v]) throw new Error(`No content for verse ${v} in ${abbr}.${chapter}`);
    parts.push(verses[v]);
  }

  return parts.join(" ");
}

async function main() {
  console.log(`Translation ID: ${TRANSLATION_ID}`);
  console.log(`Input file:     ${JSON_FILE}\n`);

  const data = JSON.parse(fs.readFileSync(JSON_FILE, "utf8"));

  for (let i = 0; i < data.length; i++) {
    const entry = data[i];
    if (entry.text && entry.text.trim() !== "") {
      console.log(`[${i + 1}/${data.length}] Skipping (has text): ${entry.ref}`);
      continue;
    }

    try {
      console.log(`[${i + 1}/${data.length}] Fetching: ${entry.ref}`);
      entry.text = await fetchVerses(entry.ref);
      console.log(`  OK: ${entry.text.slice(0, 70)}...`);
      fs.writeFileSync(JSON_FILE, JSON.stringify(data, null, 2), "utf8");
    } catch (err) {
      console.error(`  ERROR for "${entry.ref}": ${err.message}`);
    }

    await new Promise(r => setTimeout(r, 1000));
  }

  console.log("\nDone!");
}

main().catch(console.error);

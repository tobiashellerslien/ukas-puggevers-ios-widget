// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-brown; icon-glyph: magic;
// Ukas Bibelvers – Scriptable Widget
// Lagre bibelvers.json i iCloud Drive → Scriptable

const FILENAME = "bibelvers.json";

// ── Fontstørrelser (Base) ────────────────────────────────────────
// Størrelsene er økt for å gjøre teksten tydeligere
const BODY_SIZE    = { small: 16, medium: 19, large: 22 };
const REF_SIZE     = { small: 12, medium: 14, large: 15 };

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
  let baseSize = BODY_SIZE[sizeCategory] || BODY_SIZE.large;
  const len = text.length;
  
  // Justerer skriftstørrelsen basert på antall tegn
  if (len > 200) baseSize -= 4;
  else if (len > 120) baseSize -= 2;
  else if (len < 50) baseSize += 4; // Gjør korte vers enda litt større
  
  return Math.max(baseSize, 12); // Sikrer at den aldri blir uleselig liten
}

// ── Bygg widget ───────────────────────────────────────────────────
async function buildWidget(verse, size, week) {
  const w = new ListWidget();
  w.backgroundColor = new Color("#1c1c1e");
  w.setPadding(18, 20, 18, 20);
  
  // Standard widget-handling hvis man trykker utenfor YouVersion-knappen
  w.url = "scriptable:///run/" + Script.name();

  // Uke-label
  const weekLabel = w.addText(`UKE ${week}`.toUpperCase());
  weekLabel.textColor = new Color("#444444");
  weekLabel.font = Font.systemFont(12, "bold");
  weekLabel.minimumScaleFactor = 0.8;

  w.addSpacer(size === "small" ? 4 : 8);

  // Selve versteksten
  const dynamicFontSize = getDynamicSize(verse.text, size);
  const bodyText = w.addText("\u201C" + verse.text + "\u201D");
  bodyText.textColor = new Color("#F5F5F0");
  bodyText.font = new Font("Georgia", dynamicFontSize);
  
  // Redusert minimumScaleFactor gir iOS lov til å krympe lange tekster mer for å unngå kutting
  bodyText.minimumScaleFactor = 0.5; 

  w.addSpacer(6);

  // Referanse
  const refText = w.addText("— " + verse.ref);
  refText.textColor = new Color("#888880");
  refText.font = new Font("Georgia-Italic", REF_SIZE[size] ?? REF_SIZE.large);
  refText.minimumScaleFactor = 0.7;

  w.addSpacer();

  // YouVersion Knapp
  const btnStack = w.addStack();
  btnStack.backgroundColor = new Color("#3a3a3c");
  btnStack.cornerRadius = 6;
  btnStack.setPadding(6, 12, 6, 12);
  
  // Universal Link som tvinger iOS til å åpne YouVersion-appen og søke opp verset
  const query = encodeURIComponent(verse.ref);
  btnStack.url = "https://www.bible.com/search/bible?q=" + query;

  const btnText = btnStack.addText("📖 Åpne i YouVersion");
  btnText.font = Font.boldSystemFont(12);
  btnText.textColor = new Color("#ffffff");
  btnText.minimumScaleFactor = 0.8;

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
  // Presentasjon i selve appen for testing
  if (size === "small") widget.presentSmall();
  else if (size === "medium") widget.presentMedium();
  else widget.presentLarge();
}

Script.complete();

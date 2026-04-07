// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-brown; icon-glyph: magic;
// Ukas Bibelvers – Scriptable Widget
// Lagre bibelvers.json i iCloud Drive → Scriptable

const FILENAME = "bibelvers.json";

// ── Fontstørrelser ────────────────────────────────────────────────
const BODY_SIZE    = { small: 14, medium: 15, large: 16 };
const REF_SIZE     = { small: 13, medium: 14, large: 15 };
const LINE_SPACING = 15;

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

// ── Bygg widget ───────────────────────────────────────────────────
async function buildWidget(verse, size, week) {
  const w = new ListWidget();
  w.backgroundColor = new Color("#1c1c1e");
  w.setPadding(18, 20, 18, 20);
  w.url = "scriptable:///run/" + Script.name();

  // Uke-label
  const weekLabel = w.addText(`UKE ${week}`.toUpperCase());
  weekLabel.textColor = new Color("#444444");
  weekLabel.font = Font.systemFont(13);
  weekLabel.minimumScaleFactor = 0.65;

  w.addSpacer(size === "small" ? 6 : 10);

  // Selve versteksten
  const bodyText = w.addText("\u201C" + verse.text + "\u201D");
  bodyText.textColor = new Color("#F5F5F0");
  bodyText.font = new Font("Georgia", BODY_SIZE[size] ?? BODY_SIZE.large);
  bodyText.lineSpacing = LINE_SPACING;
  bodyText.minimumScaleFactor = 0.75;

  w.addSpacer();

  // Referanse
  const refText = w.addText("— " + verse.ref);
  refText.textColor = new Color("#888880");
  refText.font = new Font("Georgia-Italic", REF_SIZE[size] ?? REF_SIZE.large);
  refText.minimumScaleFactor = 0.8;

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
  widget.presentLarge();
}

Script.complete();

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

An iOS widget that displays the weekly Norwegian Bible verse ("puggevers"), built for the [Scriptable](https://scriptable.app/) app. Two parts:

1. **Widget** (`widget/ukas_puggevers_widget.js`) — Scriptable JS that reads `bibelvers.json` from iCloud Drive and renders the current week's verse as a large (4×4) iOS widget
2. **Scraper** (`scraper/scrape-verses.js`) — Node.js script that fetches verse text from bible.com and stores it in a verses JSON file

## File Structure

```
widget/
  ukas_puggevers_widget.js   – Scriptable widget script
verses/
  NB88.json                  – Norwegian NB 88/07 verses (52 weeks)
  NB88.json.bak              – Backup of previously scraped NB88 data
  template.json              – Empty verse list template
scraper/
  scrape-verses.js           – Scraper script
package.json / node_modules  – npm deps at project root (scrape-it, cheerio)
```

## Running the Scraper

From project root:

```bash
npm install
node scraper/scrape-verses.js [translation_id] [verses-file]

# Default (NB 88/07, verses/NB88.json):
node scraper/scrape-verses.js

# Other translation:
node scraper/scrape-verses.js 111 verses/NIV.json
```

Translation IDs are found at bible.com/versions (number in the URL).

## Scraper Architecture (`scraper/scrape-verses.js`)

- `BOOK_MAP` — maps Norwegian and English book names to USFM abbreviations
- `SINGLE_CHAPTER_BOOKS` — set of books where ref format is `Book VerseStart-VerseEnd` (no chapter)
- `parseRef(ref)` — parses a reference string into `{ abbr, chapter, start, end }`
- `fetchChapterVerses(abbr, chapter)` — fetches `__NEXT_DATA__` from bible.com chapter page, parses the embedded HTML via cheerio, strips `span.note` (cross-references) and `span.label` (verse numbers), returns `{ verseNum: text }` map
- `fetchVerses(ref)` — calls `fetchChapterVerses` and joins the requested verse range
- Rate limit: 1000ms between entries

## Widget Architecture (`widget/ukas_puggevers_widget.js`)

- Reads `bibelvers.json` from `FileManager.iCloud().documentsDirectory()` (= iCloud Drive → Scriptable)
- `weekNumber(date)` — ISO 8601 week number calculation
- `pickVerse(verses)` — finds entry where `v.week === currentWeek`; falls back to `verses[week % verses.length]`
- `buildWidget(verse, size)` — dark background (#1c1c1e), Georgia font, quote marks around verse text, italic reference line
- Font sizes configurable via `BODY_SIZE` and `REF_SIZE` constants at top of file

## Verse Data Format

```json
{ "week": 14, "ref": "Salme 103:1-4", "text": "Av David. Min sjel..." }
```

Verse list is based on John MacArthur's Bible memorization list, with additions. Starts at week 14 (when the project began).

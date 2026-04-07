"""
Fyller inn tekst i en JSON-fil med bibelreferanser.

Bruk:
    python fill_json.py --file template.json --translation-id 102

JSON-filen må være en liste av objekter med feltene "ref" og "text".
Oppføringer som allerede har tekst hoppes over, så kjøringen er resumable.
Filen skrives etter hver vellykket fetch.
"""

import argparse
import json
import re
import time

from bible_scraper import fetch_verse, fetch_verse_range, fetch_verse_range_cross_chapter
from book_maps import NORWEGIAN

# Omvendt oppslag: norsk boknavn → USFM-forkortelse
_NAME_TO_USFM = {v: k for k, v in NORWEGIAN.items()}

# Bøker med kun ett kapittel, versnummer følger direkte etter boknavn
_SINGLE_CHAPTER_BOOKS = {"OBA", "PHM", "2JN", "3JN", "JUD"}


def parse_ref(ref: str) -> tuple:
    """
    Parser en norsk bibelreferanse til (usfm_bok, kapittel_start, vers_start, kapittel_slutt, vers_slutt).

    Støttede formater:
        "Johannes 3:16"         → enkeltvers
        "Johannes 3:16-18"      → versrange i ett kapittel
        "Jesaja 52:13-53:12"    → versrange over kapittelgrense
        "Judas 24-25"           → enkeltkapittelbok
    """
    ref = ref.strip()

    # Finn boknavnet: alt frem til siste tall-sekvens
    book_match = re.match(r"^(.+?)\s+(\d.*)$", ref)
    if not book_match:
        raise ValueError(f"Kan ikke parse referanse: '{ref}'")

    book_name = book_match.group(1).strip()
    rest = book_match.group(2).strip()

    usfm = _NAME_TO_USFM.get(book_name)
    if not usfm:
        raise ValueError(f"Ukjent boknavn: '{book_name}' — legg det til i book_maps.NORWEGIAN")

    if usfm in _SINGLE_CHAPTER_BOOKS:
        parts = rest.split("-")
        verse_start = int(parts[0])
        verse_end = int(parts[1]) if len(parts) > 1 else verse_start
        return usfm, 1, verse_start, 1, verse_end

    cross = re.match(r"^(\d+):(\d+)-(\d+):(\d+)$", rest)
    if cross:
        return usfm, int(cross.group(1)), int(cross.group(2)), int(cross.group(3)), int(cross.group(4))

    single_ch = re.match(r"^(\d+):(\d+)(?:-(\d+))?$", rest)
    if single_ch:
        chapter = int(single_ch.group(1))
        verse_start = int(single_ch.group(2))
        verse_end = int(single_ch.group(3)) if single_ch.group(3) else verse_start
        return usfm, chapter, verse_start, chapter, verse_end

    raise ValueError(f"Kan ikke parse versangivelse: '{rest}' i '{ref}'")


def fetch_ref(ref: str, translation_id: int) -> str:
    """Henter teksten for en referanse og returnerer den som én streng."""
    book, ch_start, v_start, ch_end, v_end = parse_ref(ref)

    if ch_start == ch_end:
        if v_start == v_end:
            verses = fetch_verse(book, ch_start, v_start, translation_id)
        else:
            verses = fetch_verse_range(book, ch_start, v_start, v_end, translation_id)
    else:
        verses = fetch_verse_range_cross_chapter(book, ch_start, v_start, ch_end, v_end, translation_id)

    return " ".join(verses.values())


def main():
    parser = argparse.ArgumentParser(description="Fyll inn bibeltekst i en JSON-fil.")
    parser.add_argument("--file", "-f", required=True, help="Sti til JSON-filen")
    parser.add_argument("--translation-id", "-t", required=True, type=int, help="bible.com oversettelse-ID, f.eks. 102")
    args = parser.parse_args()

    with open(args.file, encoding="utf-8") as f:
        data = json.load(f)

    total = len(data)

    for i, entry in enumerate(data):
        if entry.get("text", "").strip():
            print(f"[{i+1}/{total}] Hopper over (har tekst): {entry['ref']}")
            continue

        print(f"[{i+1}/{total}] Henter: {entry['ref']}")

        try:
            entry["text"] = fetch_ref(entry["ref"], args.translation_id)
            print(f"  OK: {entry['text'][:70]}...")

            with open(args.file, "w", encoding="utf-8") as f:
                json.dump(data, f, ensure_ascii=False, indent=2)

        except Exception as e:
            print(f"  FEIL: {e}")

        time.sleep(0.4)

    print("\nFerdig!")


if __name__ == "__main__":
    main()
# Ukas puggevers – iOS-widget

![](widget_example.jpg)

En iOS-widget som viser ukas puggevers. Bygget med [Scriptable](https://scriptable.app/), som lar deg kjøre JavaScript-skript direkte i iOS-widgets.

Verslisten er basert på John MacArthur sin liste for "52 bibeltekster en kristen burde lære seg", med noen vers lagt til der det var naturlig. Listen starter på uke 14, siden det var da vi begynte med dette. Den dekker alle 52 uker.

>DISCLAIMER: Dobbeltsjekk verset mot bibelen hver uke, kan ikke garantere at det ikke har skjedd noen små feil under scrapingen, og har ikke manuelt sjekket alle versene.

## Del 1 – Enkel oppsett

Følg disse stegene for å sette opp widgeten med en ferdig oversettelse.

### 1. Installer Scriptable

Last ned [Scriptable](https://apps.apple.com/app/scriptable/id1405459188) fra App Store og åpne appen én gang. Dette oppretter mappen `Scriptable` i iCloud Drive automatisk.

### 2. Last ned nødvendinge filer

Last ned disse 2 filene:

- `widget/ukas_puggevers_widget.js` – widget-skriptet
- `verses/[oversettelse].json` – versene

Velg ønsket oversettelse fra `verses/` mappen. Hvis du vil ha en annen, se Del 2.

### 3. Legg filene i iCloud Drive

Åpne Filer-appen og naviger til **iCloud Drive → Scriptable**. Legg begge filene inni her. De vil bli synkronisert mellom iOS enhetene dine, så det er enkelt å sette opp på f.eks iPhone + iPad.

### 4. Rename vers-filen

Gi `[oversettelse].json` filen nytt navn til `bibelvers.json`.

### 5. Opprett widgeten på hjemskjermen

1. Hold fingeren på hjemskjermen til ikonene begynner å riste
2. Trykk **+** øverst til venstre
3. Søk etter **Scriptable** og velg størrelsen **stor (4×4)**
4. Legg widgeten til på hjemskjermen
5. Trykk på widgeten og velg **Rediger widget**
6. Under **Script** velger du **ukas_puggevers_widget**

> Widgeten er testet på iPhone 13 Pro Max og iPad Pro 11". På mindre iPhoner kan det hende at teksten ikke får plass – se avsnittet om fontstørrelse nedenfor.

### 6. Endre fontstørrelse (valgfritt)

Åpne `ukas_puggevers_widget.js` i Scriptable og juster disse konstantene øverst i filen:

```js
const BODY_SIZE    = { small: 14, medium: 15, large: 16 };
const REF_SIZE     = { small: 13, medium: 14, large: 15 };
```

`large` brukes for 4×4-widgeten. Senk verdiene litt hvis teksten ikke får plass på din skjermstørrelse.

---

## Del 2 – Scrape egne vers / andre oversettelser

Scraperen henter verstekst fra [bible.com](https://www.bible.com) og lagrer den i en JSON-fil. Allerede hentede vers hoppes over, så du kan stoppe og fortsette uten å miste fremgang.

>OBS! Noen oversettelser (særlig engelske) tar ikke med intro-verset i salmene (eks. Av David) som vers 1, disse versene blir da forskyvd med 1. Versintervallet må da manuelt endres i .json filen.

### Forutsetninger

[Node.js](https://nodejs.org/) må være installert. Kjør denne fra prosjektmappen for å laste ned avhengigheter til scraperen.

```bash
npm install
```

### Bruk

Kjøres fra prosjektets rotmappe:

```bash
node scraper/scrape-verses.js <translation_id> <verses-fil>
```

Eksempler:

```bash
# Norsk NB 88/07 (standard)
node scraper/scrape-verses.js

# NIV (engelsk)
node scraper/scrape-verses.js 111 verses/NIV.json

# Egendefinert fil
node scraper/scrape-verses.js 102 verses/min-liste.json
```

### Finn translation ID

Gå til [bible.com/versions](https://www.bible.com/versions), finn ønsket oversettelse og åpne den. Tallet i URL-en er ID-en:

```
https://www.bible.com/bible/111/JHN.3.NIV  →  111
```

### Lag en ny versliste

Kopier malen og rediger refs-feltene:

```bash
cp verses/template.json verses/MinOversettelse.json
```

Formatet er:

```json
[
  { "week": 1,  "ref": "Psalms 23:1-3", "text": "" },
  { "week": 2,  "ref": "John 3:16",     "text": "" }
]
```

- **`week`** – ukenummer (1–52), brukes av widgeten til å velge riktig vers
- **`ref`** – boknavn + kapittel:vers. Boknavnet må stemme med det som er i `BOOK_MAP` i scraperen (se nedenfor)
- **`text`** – la stå tom; scraperen fyller inn

Etter scraping, kopier filen til Scriptable-mappen i iCloud og gi den nytt navn til `bibelvers.json`.

### Boknavn og andre språk

`BOOK_MAP` øverst i `scraper/scrape-verses.js` oversetter boknavn til USFM-koder. Norske og engelske boknavn er inkludert. For andre språk legger du til egne oppføringer:

```js
"Psaume": "PSA",   // Fransk
"Psalm":  "PSA",   // allerede inkludert (engelsk)
"Salme":  "PSA",   // allerede inkludert (norsk)
```

### Bøker med bare ett kapittel

For Obadja, Filemon, 2. Johannesbrev, 3. Johannesbrev og Judas skrives versnummeret direkte etter boknavnet:

```json
{ "week": 38, "ref": "Judas 24-25", "text": "" }
```

---

## Takk til

- [bible-scraper](https://github.com/IonicaBizau/bible-scraper) av [Ionică Bizău](https://github.com/IonicaBizau)
- Claude Code

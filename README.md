# Ukas puggevers iOS-widget

![](widget_example.jpg)

En iOS-widget som viser ukas puggevers. Bygget med [Scriptable](https://scriptable.app/), som lar deg kjøre JavaScript-skript direkte i iOS-widgets.

Verslisten er basert på John MacArthur sin liste for "52 bibeltekster en kristen burde lære seg", med noen vers lagt til der det var naturlig. Listen starter på uke 14, siden det var da vi begynte med dette. Den dekker alle 52 uker. Har scrapet de vanligste norske oversettelsene (NB88/07, Bibel2011 bokmål og nynorsk, BGO). Vil du ha en annen, se Del 2.
> DISCLAIMER: Dobbeltsjekk verset mot bibelen hver uke, kan ikke garantere at det ikke har skjedd noen feil under scrapingen.

## Del 1 - Oppsett

1. Last ned [Scriptable](https://apps.apple.com/app/scriptable/id1405459188) fra App Store og åpne appen. Dette oppretter mappen `Scriptable` i iCloud Drive automatisk.
2. Last ned `widget/ukas_puggevers_widget.js` og ønsket `verses/[oversettelse].json` (vil du ha en annen oversettelse, se Del 2).
3. Legg begge filene i **iCloud Drive → Scriptable** (via Filer-appen).
4. Gi vers-filen nytt navn til `bibelvers.json`.
5. Legg til en **4x4** (stor) Scriptable widget på hjemskjermen. Trykk på widgeten, velg **Rediger widget**, og sett **Script** til **ukas_puggevers_widget**.

### Endre skriftstørrelse (valgfritt):
Skriftstørrelsen er testet på iPhone 13 Pro Max. Hvis du har en mindre iPhone og hele teksten ikke vises, må du endre fontstørrelsen.
Åpne `ukas_puggevers_widget.js` i Scriptable og juster konstantene øverst i filen. `large` brukes for 4×4-widgeten.

```js
const BODY_SIZE = { small: 14, medium: 15, large: 16 };
const REF_SIZE  = { small: 13, medium: 14, large: 15 };
```
**Tips:** Den lengste bibelteksten i denne listen er Salme 23, som er i uke 46. Hvis du i scriptet midlertidig bytter ut linje 83
```
const week = weekNumber(new Date());
``` 
med 
```
const week = 46 //weekNumber(new Date());
```
kan du se om Salme 23 får plass på widgeten din. Hvis du stiller skriftstørrelsen til denne får plass, vet du at alle andre også vil få plass.

---

## Del 2 - Scrape en ny oversettelse 

Scraperen henter verstekst fra [bible.com](https://www.bible.com) og lagrer den i en JSON-fil. Den er basert på [bible-scraper](https://github.com/IonicaBizau/bible-scraper), og i tillegg rensker den outputen og kombinerer vers på en ryddig måte.


**Forutsetninger:** [Node.js](https://nodejs.org/) og `npm install` fra prosjektmappen.

### 1. Finn oversettelsens ID

Gå til [bible.com/versions](https://www.bible.com/versions), åpne ønsket oversettelse og les av tallet i URL-en:

```
https://www.bible.com/bible/100/GEN.1.NASB1995  →  100
```
> OBS! Noen oversettelser tar ikke med intro-verset i salmene (f.eks. "Av David") som vers 1. Da forskyves versintervallet med 1 og må rettes manuelt i JSON-filen.

### 2. Lag en ny versfil

Lag en kopi av ``verses/template.json`` malen, og gi den et nytt navn. Denne inneholder referanser på norsk, bytt disse til engelsk om du scraper en engelsk oversettelse. Boknavnene må stemme med `BOOK_MAP` i scraperen (enten norsk eller engelsk, andre språk krever ny `BOOK_MAP`).
La `text` stå tom, scraperen fyller disse inn. 

### 3. Kjør scraperen

```bash
node scraper/scrape-verses.js <translation_id> <verses-fil>

# Eksempel:
node scraper/scrape-verses.js 100 verses/NASB1995.json
```

Allerede hentede vers hoppes over, så du kan stoppe og fortsette uten å miste fremgang.

Når scraping er ferdig, kopier filen til Scriptable-mappen i iCloud Drive og gi den nytt navn til `bibelvers.json`.

---

## Takk til

- [bible-scraper](https://github.com/IonicaBizau/bible-scraper) av [Ionică Bizău](https://github.com/IonicaBizau)
- Claude Code

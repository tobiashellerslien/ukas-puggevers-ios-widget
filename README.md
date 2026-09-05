# Ukas puggevers iOS-widget

![](widget_example.jpg)

En iOS-widget som viser ukas puggevers. Bygget med [Scriptable](https://scriptable.app/), som lar deg kjøre JavaScript-skript direkte i iOS-widgets.

Verslisten er basert på John MacArthur sin liste for "52 bibeltekster en kristen burde lære seg", med noen vers lagt til der det var naturlig. Listen starter på uke 14, siden det var da vi begynte med dette. Den dekker alle 52 uker. Inkluderer NB88/07.
> DISCLAIMER: Dobbeltsjekk verset mot bibelen hver uke, kan ikke garantere at det ikke har småfeil.

## Oppsett

1. Last ned [Scriptable](https://apps.apple.com/app/scriptable/id1405459188) fra App Store og åpne appen. Dette oppretter mappen `Scriptable` i iCloud Drive automatisk.
2. Last ned `ukas_puggevers_widget.js` og ønsket `scraped_verses/NB88.json` (vil du ha en annen oversettelse, se Del 2).
3. Legg begge filene i **iCloud Drive → Scriptable** (via Filer-appen).
4. Gi vers-filen nytt navn til `bibelvers.json`.
>OBS: Hvis man laster ned på iOS, kan det være filen blir bibelvers.json.txt, og da vil scriptet ikke klare å finne den. Hvis dette er tilfelllet: I Filer, trykk på de 3 prikkene > Visningsvalg > skru på "Vis alle filendelser". Gi nytt navn og fjern .txt i slutten av filnavnet. Godta advarselen.
5. Legg til en **4x4** (stor) Scriptable widget på hjemskjermen. Trykk på widgeten, velg **Rediger widget**, og sett **Script** til **ukas_puggevers_widget**.
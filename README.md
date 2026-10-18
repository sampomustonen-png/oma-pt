# Oma PT

Henkilökohtainen treeniohjelma sali- ja juoksuharjoitteluun. Toimii puhelimessa myös ilman verkkoyhteyttä.

## Julkaisu GitHub Pagesissa
1. Pura tämä zip-tiedosto tietokoneella.
2. Luo github.com:ssa uusi julkinen repository, esimerkiksi nimellä `oma-pt`.
3. Valitse Add file → Upload files ja vedä kaikki puretut tiedostot (ei kansiota) repositorion juureen. Paina Commit changes.
4. Avaa Settings → Pages. Valitse Deploy from a branch, haara `main` ja kansio `/ (root)`. Tallenna.
5. Odota noin minuutti. Sovelluksen osoite on `https://KÄYTTÄJÄNIMI.github.io/oma-pt/`.

## Asennus iPhonelle
1. Avaa osoite Safarissa. Anna sivun latautua kerran verkossa, jotta offline-tuki asentuu.
2. Valitse Jaa → Lisää Koti-valikkoon.
3. Käytä sovellusta aina Koti-valikon kuvakkeesta.

Koti-valikon sovelluksella on oma tallennustilansa, joka ei jaa tietoja Safarin kanssa. Kirjaa treenit vain Koti-valikon sovelluksessa. Jos olet jo kirjannut tietoja muualla (esimerkiksi Clauden esikatselussa), kopioi varmuuskopio Ohjelma-välilehdeltä ja palauta se Koti-valikon sovelluksessa.

## Päivittäminen
Kun muutat tiedostoja, vaihda `sw.js`-tiedoston ensimmäisellä rivillä oleva versionumero (esimerkiksi `oma-pt-v2`). Silloin puhelin hakee uuden version.

## Tiedostot
- `index.html`: koko sovellus
- `manifest.webmanifest`: Koti-valikon asetukset
- `sw.js`: offline-tuki
- `icon-192.png`, `icon-512.png`, `apple-touch-icon.png`: kuvakkeet

# Oma PT

Henkilökohtainen treeniohjelma sali- ja juoksuharjoitteluun. Toimii puhelimessa myös ilman verkkoyhteyttä.

## Julkaisu GitHub Pagesissa (ensimmäinen kerta)
1. Pura tämä zip-tiedosto.
2. Luo github.com:ssa julkinen repository, esimerkiksi `oma-pt`.
3. Valitse Add file → Upload files, vedä kaikki puretut tiedostot (ei kansiota) juureen ja paina Commit changes.
4. Settings → Pages → Deploy from a branch → `main` ja `/ (root)` → Save.
5. Sovelluksen osoite: `https://KÄYTTÄJÄNIMI.github.io/oma-pt/`
6. iPhonella: avaa osoite Safarissa → Jaa → Lisää Koti-valikkoon. Käytä sovellusta sen jälkeen aina Koti-valikon kuvakkeesta.

## Uuden version päivitys ilman tulosten menetystä
Treenitulokset ovat puhelimen muistissa, ja ne säilyvät, kun päivität tiedostot samaan osoitteeseen.
1. Ota varmuuskopio: sovelluksessa Ohjelma → Jaa varmuuskopio tiedostona → Tallenna Tiedostoihin.
2. Avaa repository GitHubissa: Add file → Upload files. Vedä uudet tiedostot (`index.html`, `sw.js`, `manifest.webmanifest`, kuvakkeet). Tiedostojen nimien pitää olla samat kuin ennen, jolloin uusi tiedosto korvaa vanhan. Paina Commit changes.
3. Odota 1–2 minuuttia. Sulje sovellus puhelimessa kokonaan (pyyhkäise ylös sovellusvalitsimessa) ja avaa se uudelleen. Tee tämä tarvittaessa kahdesti.
4. Tarkista Ohjelma-välilehdeltä, että treenihistoria näkyy.

Älä tee näitä, ne tyhjentävät tiedot:
- älä poista Koti-valikon kuvaketta äläkä poista tai nimeä uudelleen repositoriota, koska osoite muuttuu
- älä tyhjennä Safarin tietoja
Jos tiedot katoavat, palauta ne: Ohjelma → Palauta tiedostosta.

## Tiedostot
- `index.html`: koko sovellus
- `manifest.webmanifest`: Koti-valikon asetukset
- `sw.js`: offline-tuki (vaihda ensimmäisellä rivillä oleva versionumero aina päivityksessä)
- `icon-192.png`, `icon-512.png`, `apple-touch-icon.png`: kuvakkeet

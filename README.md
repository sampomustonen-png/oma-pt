# Oma PT

Henkilökohtainen treeniohjelma sali- ja juoksuharjoitteluun. Toimii puhelimessa myös ilman verkkoyhteyttä.

## Tiedostot
- `index.html`: sivun runko
- `styles.css`: ulkoasu
- `data.js`: liikkeet, ohjeet ja oletusohjelma (versionumero on tämän tiedoston alussa)
- `app.js`: sovelluksen toiminta
- `cloud.js`: valinnainen pilvisynkronointi
- `firebase-config.js`: omat Firebase-asetuksesi (älä korvaa omaa tiedostoasi tällä mallilla)
- `sw.js`: offline-tuki
- `manifest.webmanifest` ja `.png`-kuvakkeet: Koti-valikon asetukset
- `tests/`: automaattiset testit kehitystä varten (ei tarvita GitHubissa)

## Päivitys GitHubiin ilman tulosten menetystä
Treenitulokset ovat puhelimen muistissa (ja pilvessä, jos olet kirjautunut). Ne säilyvät, kun päivität tiedostot samaan osoitteeseen.
1. Ota varmuuskopio: Asetukset → Jaa varmuuskopio tiedostona → Tallenna Tiedostoihin.
2. Avaa repository GitHubissa: Add file → Upload files.
3. Lataa kaikki tiedostot paitsi `firebase-config.js` ja `tests`-kansio. Tiedostot menevät repositorion juureen, ei kansioon.
4. Paina Commit changes ja odota 2 minuuttia.
5. Sulje sovellus puhelimessa kokonaan ja avaa se uudelleen. Tarkista Asetukset-välilehden alareunasta versionumero.

Jatkossa sovellus hakee aina uusimman version verkosta, joten `sw.js`-tiedostoon ei tarvitse tehdä muutoksia päivityksissä.

Älä tee näitä, ne tyhjentävät tiedot:
- älä poista Koti-valikon kuvaketta
- älä poista tai nimeä uudelleen repositoriota, koska osoite muuttuu
- älä tyhjennä Safarin tietoja

Jos tiedot katoavat, palauta ne: Asetukset → Palauta tiedostosta.

## Testit
Testit ajetaan tietokoneella, jossa on Node.js ja Playwright:
```
npm install playwright
npx playwright install chromium
node tests/app.test.js
```

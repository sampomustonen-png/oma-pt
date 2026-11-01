// Oma PT: liikkeet, ohjeet ja oletusohjelma.
// Muuta liikkeen nimeä vain lisäämällä vanha nimi ALIAS-taulukkoon, jotta historia säilyy.
'use strict';
const VERSION=19;
// liike ohjelmassa: [nimet (parittomat jaksot|parilliset jaksot), sarjat, toistot min, toistot max, painon askel, tauko s]
const DEF={
A:['Päivä A: jalat ja työntö',[
['Back squat|Front squat',4,5,8,5,150],['Bench press|Incline dumbbell press',4,6,10,2.5,150],['Barbell row|Chest-supported row',3,8,10,2.5,120],['Dumbbell shoulder press|Machine shoulder press',3,8,12,2,90],['Triceps pushdown|Skull crusher',3,10,15,2.5,60],['Standing calf raise|Seated calf raise',3,10,15,5,60],['Cable crunch|Dumbbell side bend',3,10,15,2.5,60]]],
B:['Päivä B: selkä ja takaketju',[
['Romanian deadlift|Conventional deadlift',4,5,8,5,150],['Wide-grip lat pulldown|Close-grip lat pulldown',4,6,10,2.5,150],['Machine chest press|Incline machine press',3,8,12,2.5,120],['Bulgarian split squat|Dumbbell lunge',3,8,12,2,120],['Dumbbell biceps curl|Hammer curl',3,10,15,2,60],['Lateral raise|Cable lateral raise',3,12,15,1,60],['Back extension|Weighted back extension',3,10,15,2.5,60]]],
C:['Päivä C: koko vartalo',[
['Leg press|Goblet squat',4,8,12,5,120],['Overhead press|Arnold press',4,5,8,2.5,150],['Seated cable row|One-arm dumbbell row',3,8,12,2.5,90],['Lying leg curl|Barbell hip thrust',3,8,12,2.5,90],['Cable fly|Dumbbell fly',3,10,15,1,60],['Cable face pull|Rear delt dumbbell raise',3,12,15,1,60],['Hanging leg raise|Decline sit-up',3,10,15,1,60]]]};
// ohjeet: lihakset|vaihe 1|vaihe 2|vaihe 3
const G={
'Back squat':'Reidet, pakarat, selän ojentajat|Tanko lapojen päällä, jalat hartioiden leveydellä, selkä suorana|Laskeudu lantio taakse ja alas, kunnes reidet ovat vähintään vaakatasossa|Työnnä jaloilla ylös, polvet suunnassa varpaiden kanssa',
'Front squat':'Reidet, pakarat, keskivartalo|Tanko olkapäiden etuosan päällä, kyynärpäät korkealla|Laskeudu syvään ylävartalo pystyssä|Nouse ylös kyynärpäät koholla',
'Bench press':'Rinta, olkapäiden etuosa, ojentajat|Makaa penkillä lavat yhteen puristettuna, jalat tukevasti lattiassa|Laske tanko hallitusti rinnan alaosaan|Paina ylös, kyynärpäät noin 45 asteen kulmassa vartaloon',
'Incline dumbbell press':'Ylärinta, olkapäät, ojentajat|Penkki 30–45 asteen kallistuksessa, käsipainot rinnan korkeudella|Paina painot ylös hieman toisiaan kohti|Laske hallitusti rinnan sivuille',
'Barbell row':'Leveä selkä, yläselkä, hauikset|Etunoja noin 45 astetta, selkä suorana, tanko polvien alla|Vedä tanko navan suuntaan ja purista lapoja yhteen|Laske hallitusti alas',
'Chest-supported row':'Ylä- ja keskiselkä, takaolkapäät|Makaa rinta penkkiä vasten, käsipainot roikkuvat suorina|Vedä kyynärpäät taakse ja purista lapoja yhteen|Laske hallitusti ilman heilutusta',
'Dumbbell shoulder press':'Olkapäät, ojentajat|Istu selkä tuettuna, käsipainot korvien korkeudella|Paina painot suoraan ylös|Laske hallitusti takaisin leuan korkeudelle',
'Machine shoulder press':'Olkapäät, ojentajat|Säädä istuin niin, että kahvat ovat olkapäiden korkeudella|Paina kahvat ylös niin, ettei selkä notkistu|Laske hallitusti alas',
'Triceps pushdown':'Ojentajat|Seiso taljan edessä, kyynärpäät kiinni kyljissä|Paina kahva suoraksi alas|Anna käden palata hallitusti, kyynärpäät pysyvät paikallaan',
'Skull crusher':'Ojentajat|Makaa penkillä, tanko ojennetuin käsin rinnan yllä|Taivuta vain kyynärnivelistä ja laske tanko otsan suuntaan|Ojenna kädet takaisin ylös',
'Standing calf raise':'Pohkeet|Seiso varpaat korokkeella, kantapäät ilmassa|Nouse varpaille mahdollisimman korkealle ja pidä hetki|Laske hitaasti, kunnes pohkeessa tuntuu venytys',
'Seated calf raise':'Pohkeet|Istu pohjekoneeseen, tyyny reisien päällä|Nouse varpaille ja pidä hetki yläasennossa|Laske hitaasti täyteen venytykseen',
'Cable crunch':'Vatsalihakset|Polvistu taljan eteen, köysi niskan tuntumassa|Pyöristä selkä ja vie kyynärpäät kohti polvia|Palaa hallitusti ylös, lantio pysyy paikallaan',
'Dumbbell side bend':'Vinot vatsalihakset|Seiso käsipaino toisessa kädessä, jalat hartioiden leveydellä|Taivuta vartaloa sivulle kohti painoa|Palaa pystyyn vatsalihaksilla, älä kallistu eteen tai taakse',
'Romanian deadlift':'Takareidet, pakarat, selän ojentajat|Tanko lantion edessä, polvet hieman koukussa, selkä suorana|Työnnä lantiota taakse ja laske tanko reittä pitkin sääreen puoliväliin|Nouse ylös työntämällä lantio eteen',
'Conventional deadlift':'Koko takaketju, reidet|Jalat lantion leveydellä, tanko säären päällä, selkä suorana|Työnnä jaloilla lattiaa poispäin ja nosta tanko vartalon läheltä|Ojenna lantio ylös ja laske tanko hallitusti alas',
'Wide-grip lat pulldown':'Leveä selkä, hauikset|Ote hartioita leveämmin, rinta ylhäällä|Vedä tanko solisluiden korkeudelle, kyynärpäät alas ja taakse|Palauta hallitusti, kädet venyvät täyteen mittaan',
'Close-grip lat pulldown':'Leveä selkä, hauikset|Käytä kapeaa kahvaa ja pidä rinta ylhäällä|Vedä kahva rintaan kyynärpäät kylkiä pitkin|Palauta hallitusti ylös',
'Machine chest press':'Rinta, ojentajat, olkapäiden etuosa|Säädä istuin niin, että kahvat ovat rinnan korkeudella|Paina kahvat suoriksi, lavat pysyvät selkänojassa|Palauta hallitusti, älä anna painopakan iskeä yhteen',
'Incline machine press':'Ylärinta, olkapäät, ojentajat|Säädä istuin niin, että kahvat ovat ylärinnan korkeudella|Paina kahvat ylös ja eteen|Palauta hallitusti',
'Bulgarian split squat':'Reidet, pakarat|Aseta takajalan jalkaterä penkille ja ota pitkä askel eteen|Laske takapolvi kohti lattiaa, etupolvi seuraa varpaiden linjaa|Työnnä etujalalla ylös',
'Dumbbell lunge':'Reidet, pakarat|Käsipainot käsissä, astu pitkä askel eteen|Laske takapolvi kohti lattiaa, vartalo pysyy pystyssä|Työnnä etujalalla takaisin alkuasentoon',
'Dumbbell biceps curl':'Hauikset|Seiso kyynärpäät kiinni kyljissä|Nosta käsipainot ylös hauiksilla kämmenet kohti olkapäitä|Laske hitaasti, älä heilauta vartalolla',
'Hammer curl':'Hauikset, kyynärvarret|Pidä käsipainoja peukalot ylöspäin|Nosta paino olkapäälle, kyynärpäät pysyvät kyljissä|Laske hallitusti alas',
'Lateral raise':'Olkapäiden sivuosa|Seiso käsipainot sivuilla, kyynärpäät hieman koukussa|Nosta kädet sivulle olkapäiden korkeudelle|Laske hitaasti, älä heilauta',
'Cable lateral raise':'Olkapäiden sivuosa|Seiso sivuttain taljaan, kahva kauempana olevassa kädessä|Nosta käsi sivulle olkapään korkeudelle|Laske hallitusti, vastus säilyy koko liikeradan',
'Back extension':'Selän ojentajat, pakarat|Aseta lantio tuen reunalle, vartalo suorana|Laskeudu vyötäröstä alas selkä suorana|Nouse takaisin suoraksi, älä yliojenna selkää',
'Weighted back extension':'Selän ojentajat, pakarat|Pidä painolevyä rinnan edessä|Laskeudu vyötäröstä alas selkä suorana|Nouse takaisin suoraksi, älä yliojenna selkää',
'Leg press':'Reidet, pakarat|Istu selkä tuettuna, jalat levyllä hartioiden leveydellä|Laske polvet kohti rintaa, lantio pysyy penkissä|Työnnä ylös, älä lukitse polvia täysin',
'Goblet squat':'Reidet, pakarat, keskivartalo|Pidä käsipainoa rinnan edessä kahdella kädellä|Laskeudu syvään, kyynärpäät polvien sisäpuolella|Nouse ylös rinta pystyssä',
'Overhead press':'Olkapäät, ojentajat, keskivartalo|Seiso tanko solisluilla, vatsa ja pakarat tiukkoina|Paina tanko suoraan ylös pään ohi|Laske hallitusti takaisin solisluille',
'Arnold press':'Olkapäät, ojentajat|Aloita käsipainot rinnan edessä, kämmenet itseesi päin|Paina ylös ja kierrä kämmenet ulospäin|Laske kiertäen takaisin alkuasentoon',
'Seated cable row':'Keskiselkä, lavat, hauikset|Istu jalat tuettuna, selkä suorana|Vedä kahva vatsaan ja purista lapoja yhteen|Palauta hallitusti niin, ettei selkä pyöristy',
'One-arm dumbbell row':'Leveä selkä, hauis|Tue toinen käsi ja polvi penkille, selkä vaakasuorassa|Vedä käsipaino lantion suuntaan, kyynärpää ylös|Laske hallitusti alas',
'Lying leg curl':'Takareidet|Makaa vatsallasi, tyyny nilkkojen yläpuolella|Koukista polvet kohti pakaroita|Laske hallitusti alas',
'Barbell hip thrust':'Pakarat, takareidet|Selkä penkkiä vasten, tanko lantion päällä|Työnnä lantio ylös, kunnes vartalo on suora|Purista pakaroita yläasennossa ja laske hallitusti',
'Cable fly':'Rinta|Seiso taljojen välissä, kyynärpäät hieman koukussa|Vedä kädet kaarena yhteen rinnan eteen|Palauta hitaasti, kunnes rinnassa tuntuu venytys',
'Dumbbell fly':'Rinta|Makaa penkillä painot ylhäällä, kyynärpäät hieman koukussa|Laske kädet kaarena sivuille rinnan tasolle|Nosta takaisin ylös rintalihaksilla',
'Cable face pull':'Takaolkapäät, yläselkä|Aseta talja kasvojen korkeudelle, köysi käsissä|Vedä köysi kohti kasvoja, kyynärpäät korkealla|Purista lapoja yhteen ja palauta hallitusti',
'Rear delt dumbbell raise':'Takaolkapäät, yläselkä|Taivu eteen selkä suorana, painot roikkuvat|Nosta kädet sivulle, kyynärpäät hieman koukussa|Laske hallitusti',
'Hanging leg raise':'Alavatsa, lonkankoukistajat|Ripu tangossa, vartalo vakaana|Nosta jalat lantion yläpuolelle suorina tai koukussa|Laske hallitusti ilman heilumista',
'Decline sit-up':'Vatsalihakset|Aseta jalat penkin tukiin, vartalo kalteella alustalla|Nosta ylävartalo kohti polvia|Laske hallitusti, älä vedä niskasta'};
Object.assign(G,{
'Hack squat':'Reidet, pakarat|Selkä tukea vasten, jalat levyllä hartioiden leveydellä|Laske polvet koukkuun hallitusti syvään|Työnnä ylös, älä lukitse polvia täysin',
'Step-up':'Reidet, pakarat|Aseta toinen jalka penkille, käsipainot käsissä|Nouse ylös etujalan voimalla, älä työnnä takajalalla|Laske hallitusti alas ja vaihda jalkaa sarjan jälkeen',
'Leg extension':'Etureidet|Säädä tuki nilkkojen yläpuolelle, selkä tuettuna|Ojenna polvet suoriksi ja pidä hetki|Laske hitaasti alas',
'Dumbbell Romanian deadlift':'Takareidet, pakarat, selän ojentajat|Käsipainot reisien edessä, polvet hieman koukussa|Työnnä lantiota taakse ja laske painot säärten suuntaan, selkä suorana|Nouse ylös työntämällä lantio eteen',
'Glute bridge':'Pakarat, takareidet|Makaa selällä, polvet koukussa, paino lantion päällä|Nosta lantio ylös, kunnes vartalo on suora|Purista pakaroita yläasennossa ja laske hallitusti',
'Seated leg curl':'Takareidet|Säädä tuki nilkkojen yläpuolelle ja istu selkä tuettuna|Vedä kantapäät alas ja taakse|Palauta hitaasti',
'Cable pull-through':'Pakarat, takareidet|Seiso selin taljaan, köysi jalkojen välistä käsissä|Työnnä lantio taakse, selkä suorana|Ojenna lantio eteen ja purista pakaroita',
'Single-leg Romanian deadlift':'Takareidet, pakarat, tasapaino|Seiso yhdellä jalalla, käsipaino kädessä|Kallista vartalo eteen ja nosta vapaa jalka taakse|Palaa pystyyn ja pidä lantio suorassa',
'Dumbbell bench press':'Rinta, olkapäiden etuosa, ojentajat|Makaa penkillä, painot rinnan sivuilla|Paina painot ylös rinnan yläpuolelle|Laske hallitusti rinnan tasolle',
'Machine row':'Keskiselkä, lavat, hauikset|Tue rinta pehmusteeseen ja tartu kahvoihin|Vedä kyynärpäät taakse ja purista lapoja yhteen|Palauta hallitusti',
'Straight-arm pulldown':'Leveä selkä|Seiso taljan edessä, kädet suorina ylhäällä|Paina tanko alas reisiin, kädet pysyvät suorina|Palauta hitaasti ylös',
'Barbell curl':'Hauikset|Seiso tanko alaotteella, kyynärpäät kyljissä|Nosta tanko olkapäille ilman heilutusta|Laske hallitusti',
'Cable curl':'Hauikset|Seiso taljan edessä, kyynärpäät kyljissä|Vedä kahva kohti olkapäitä|Laske hallitusti, jännitys säilyy koko liikeradan',
'Incline dumbbell curl':'Hauikset|Istu kallistetulla penkillä, kädet roikkuvat suorina|Nosta painot olkapäille, kyynärpäät pysyvät paikallaan|Laske hitaasti täyteen venytykseen',
'Overhead triceps extension':'Ojentajat|Pidä käsipainoa kahdella kädellä pään takana|Ojenna kädet ylös, kyynärpäät osoittavat eteen|Laske hallitusti pään taakse',
'Pull-up':'Leveä selkä, hauikset|Ota myötäote hartioiden leveydeltä ja riipu kädet suorina|Vedä rinta kohti tankoa, kunnes leuka on tangon yläpuolella|Laske hallitusti suorille käsille ilman heilautusta',
'Chin-up':'Leveä selkä, hauikset|Ota vastaote (kämmenet itseesi päin) hartioiden leveydeltä|Vedä leuka tangon yläpuolelle kyynärpäät kylkiä kohti|Laske hallitusti suorille käsille',
'Neutral-grip pull-up':'Leveä selkä, hauikset, kyynärvarret|Tartu rinnakkaisiin kahvoihin kämmenet vastakkain|Vedä leuka kahvojen yläpuolelle|Laske hallitusti suorille käsille. Ote on usein olkapäille mukavin',
'Wide-grip pull-up':'Leveä selkä|Ota myötäote selvästi hartioita leveämmältä|Vedä rinta kohti tankoa kyynärpäät alas ja sivuille|Laske hallitusti. Jätä pois, jos olkapäät oireilevat',
'Weighted pull-up':'Leveä selkä, hauikset|Kiinnitä lisäpaino painovyöhön tai pidä käsipainoa nilkkojen välissä|Vedä leuka tangon yläpuolelle hallitusti|Laske suorille käsille. Kirjaa painoksi vain lisäpaino',
'Weighted chin-up':'Leveä selkä, hauikset|Kiinnitä lisäpaino painovyöhön ja ota vastaote|Vedä leuka tangon yläpuolelle|Laske hallitusti. Kirjaa painoksi vain lisäpaino',
'Weighted neutral-grip pull-up':'Leveä selkä, hauikset, kyynärvarret|Kiinnitä lisäpaino painovyöhön ja tartu rinnakkaisiin kahvoihin|Vedä leuka kahvojen yläpuolelle|Laske hallitusti. Kirjaa painoksi vain lisäpaino',
'Assisted pull-up':'Leveä selkä, hauikset|Polvistu avustuskoneen tasolle ja valitse avustus|Vedä leuka tangon yläpuolelle|Laske hallitusti. Mitä pienempi avustus, sitä raskaampi liike',
'Negative pull-up':'Leveä selkä, hauikset|Nouse yläasentoon hyppäämällä tai korokkeen avulla|Laske itsesi hitaasti 3–5 sekunnissa suorille käsille|Palaa yläasentoon korokkeen avulla. Hyvä tapa oppia leuanveto',
'Dumbbell calf raise':'Pohkeet|Seiso toisella jalalla käsipaino kädessä, varvas korokkeella|Nouse varpaille ja pidä hetki|Laske hitaasti venytykseen'});
// kirjasto: nimi|lihasryhmä|m=moninivel a=apuliike|s=sali b=käsipainot|toistot min|max|askel|tauko|rajoitteet (a=alaselkä p=polvet o=olkapäät)|l=lisäpaino v=avustus
const LIB=`Back squat|jk|m|s|5|8|5|150|ap
Front squat|jk|m|s|5|8|5|150|p
Leg press|jk|m|s|8|12|5|120|
Goblet squat|jk|m|b|8|12|2|90|
Hack squat|jk|m|s|8|12|5|120|p
Bulgarian split squat|jk|a|b|8|12|2|120|p
Dumbbell lunge|jk|a|b|8|12|2|90|p
Step-up|jk|a|b|8|12|2|90|p
Leg extension|jk|a|s|10|15|2.5|60|p
Romanian deadlift|jt|m|s|5|8|5|150|a
Conventional deadlift|jt|m|s|5|8|5|150|a
Dumbbell Romanian deadlift|jt|m|b|8|12|2|120|a
Barbell hip thrust|jt|m|s|8|12|5|90|
Glute bridge|jt|a|b|10|15|2|60|
Lying leg curl|jt|a|s|8|12|2.5|90|
Seated leg curl|jt|a|s|8|12|2.5|90|
Cable pull-through|jt|a|s|10|15|2.5|60|
Single-leg Romanian deadlift|jt|a|b|8|12|2|90|
Bench press|rt|m|s|6|10|2.5|150|o
Incline dumbbell press|rt|m|b|6|10|2|120|o
Dumbbell bench press|rt|m|b|8|12|2|120|o
Machine chest press|rt|m|s|8|12|2.5|120|
Incline machine press|rt|a|s|8|12|2.5|90|
Cable fly|rt|a|s|10|15|1|60|
Dumbbell fly|rt|a|b|10|15|1|60|o
Barbell row|sl|m|s|8|10|2.5|120|a
Chest-supported row|sl|m|b|8|12|2|90|
Wide-grip lat pulldown|sl|m|s|6|10|2.5|120|
Close-grip lat pulldown|sl|m|s|8|12|2.5|90|
One-arm dumbbell row|sl|m|b|8|12|2|90|
Seated cable row|sl|a|s|8|12|2.5|90|
Machine row|sl|a|s|8|12|2.5|90|
Straight-arm pulldown|sl|a|s|10|15|2.5|60|
Overhead press|ol|m|s|5|8|2.5|150|o
Dumbbell shoulder press|ol|m|b|8|12|2|90|o
Machine shoulder press|ol|m|s|8|12|2.5|90|
Arnold press|ol|m|b|8|12|2|90|o
Lateral raise|ol|a|b|12|15|1|60|
Cable lateral raise|ol|a|s|12|15|1|60|
Cable face pull|ol|a|s|12|15|1|60|
Rear delt dumbbell raise|ol|a|b|12|15|1|60|
Dumbbell biceps curl|hk|a|b|10|15|2|60|
Hammer curl|hk|a|b|10|15|2|60|
Barbell curl|hk|a|s|8|12|2.5|60|
Cable curl|hk|a|s|10|15|2.5|60|
Incline dumbbell curl|hk|a|b|10|15|1|60|
Triceps pushdown|oj|a|s|10|15|2.5|60|
Skull crusher|oj|a|s|8|12|2.5|60|
Overhead triceps extension|oj|a|b|10|15|2|60|
Standing calf raise|po|a|s|10|15|5|60|
Seated calf raise|po|a|s|10|15|5|60|
Dumbbell calf raise|po|a|b|12|20|2|60|
Cable crunch|va|a|s|10|15|2.5|60|
Dumbbell side bend|va|a|b|10|15|2.5|60|
Hanging leg raise|va|a|b|8|15|1|60|
Decline sit-up|va|a|b|10|15|1|60|
Back extension|jt|a|s|10|15|2.5|60|a
Weighted back extension|jt|a|s|10|15|2.5|60|a
Pull-up|sl|m|s|5|10|2.5|150||l
Chin-up|sl|m|s|5|10|2.5|150||l
Neutral-grip pull-up|sl|m|s|5|10|2.5|150||l
Wide-grip pull-up|sl|m|s|5|10|2.5|150|o|l
Weighted pull-up|sl|m|s|4|8|2.5|180||l
Weighted chin-up|sl|m|s|4|8|2.5|180||l
Weighted neutral-grip pull-up|sl|m|s|4|8|2.5|180||l
Assisted pull-up|sl|m|s|6|12|5|120||v
Negative pull-up|sl|a|s|3|6|2.5|120||l`.split('\n').map(r=>{const[n,g,k,q,lo,hi,st,rs,f,w]=r.split('|');return{n,g,k,q,lo:+lo,hi:+hi,st:+st,rs:+rs,f:f||'',w:w||''}});
const GN={jk:'Jalat, etureidet',jt:'Takareidet ja pakarat',rt:'Rinta',sl:'Selkä',ol:'Olkapäät',hk:'Hauikset',oj:'Ojentajat',po:'Pohkeet',va:'Vatsa'},FK={jk:'j',jt:'j',po:'j',sl:'s',rt:'r',ol:'o',hk:'k',oj:'k',va:'v'};
const TM={f:['jkm4 rtm4 slm3 ola3 oja3 poa3 vaa3','jtm4 slm4 rta3 jka3 hka3 ola3 vaa3','jkm4 olm4 sla3 jta3 rta3 ola3 hka3'],u:['rtm4 slm4 olm3 sla3 rta3 hka3 oja3','olm4 slm4 rta4 ola3 sla3 oja3 hka3'],l:['jkm4 jtm4 jka3 jta3 poa3 vaa3','jtm4 jkm4 jka3 jta3 poa3 vaa3']};
// vanhat liikkeiden nimet → nykyiset (historia säilyy nimien muuttuessa)
const ALIAS={"Takakyykky": "Back squat", "Etukyykky": "Front squat", "Penkkipunnerrus": "Bench press", "Vinopenkki käsipainoilla": "Incline dumbbell press", "Kulmasoutu tangolla": "Barbell row", "Rintatuettu soutu": "Chest-supported row", "Pystypunnerrus käsipainoilla": "Dumbbell shoulder press", "Pystypunnerrus koneessa": "Machine shoulder press", "Ojentajat ylätaljassa": "Triceps pushdown", "Ranskalainen punnerrus": "Skull crusher", "Pohkeennousu seisten": "Standing calf raise", "Pohkeennousu istuen": "Seated calf raise", "Vatsarutistus taljassa": "Cable crunch", "Sivutaivutus käsipainolla": "Dumbbell side bend", "Romanialainen maastaveto": "Romanian deadlift", "Perinteinen maastaveto": "Conventional deadlift", "Ylätalja leveällä otteella": "Wide-grip lat pulldown", "Ylätalja kapealla otteella": "Close-grip lat pulldown", "Rintaprässi koneessa": "Machine chest press", "Vinopenkkiprässi koneessa": "Incline machine press", "Bulgarialainen askelkyykky": "Bulgarian split squat", "Askelkyykky käsipainoilla": "Dumbbell lunge", "Hauiskäännöt käsipainoilla": "Dumbbell biceps curl", "Vasarakäännöt": "Hammer curl", "Olkapäiden sivunosto": "Lateral raise", "Sivunosto taljassa": "Cable lateral raise", "Selkäojennus penkissä": "Back extension", "Selkäojennus levyllä": "Weighted back extension", "Jalkaprässi": "Leg press", "Goblet-kyykky": "Goblet squat", "Pystypunnerrus tangolla": "Overhead press", "Arnold-punnerrus": "Arnold press", "Istumasoutu taljassa": "Seated cable row", "Yhden käden käsipainosoutu": "One-arm dumbbell row", "Reisikoukistus makuulla": "Lying leg curl", "Lonkannosto tangolla": "Barbell hip thrust", "Rintalennot taljassa": "Cable fly", "Käsipainolennot": "Dumbbell fly", "Face pull taljassa": "Cable face pull", "Takaolkapäänosto käsipainoilla": "Rear delt dumbbell raise", "Jalannosto riipunnassa": "Hanging leg raise", "Vatsarutistus penkissä": "Decline sit-up"};

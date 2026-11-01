// Oma PT: valinnainen pilvisynkronointi Firebaseen.
// Toimii vain, kun firebase-config.js sisältää omat asetuksesi. Muuten sovellus toimii ilman pilveä.
// Treenit ja juoksut yhdistetään tunnisteiden mukaan, joten kahden laitteen tallennukset eivät korvaa toisiaan.
(async()=>{try{
  const{firebaseConfig:fc}=await import('./firebase-config.js');
  if(!fc||!fc.apiKey||/LIITÄ|\.\.\./.test(fc.apiKey))return;
  const B='https://www.gstatic.com/firebasejs/10.14.1/';
  const[A,U,F]=await Promise.all([import(B+'firebase-app.js'),import(B+'firebase-auth.js'),import(B+'firebase-firestore.js')]);
  const app=A.initializeApp(fc),au=U.getAuth(app),db=F.getFirestore(app),api=window.APP;
  api.cloud({st:'out'});
  let ref=null,tm=0,busy=false,again=false;
  const strip=o=>{const c=Object.assign({},o);delete c.draft;return c};
  const ids=o=>(o.hist||[]).map(h=>h.id).join()+'/'+(o.runs||[]).map(r=>r.id).join();
  async function sync(){if(!ref)return;if(busy){again=true;return}busy=true;
    try{
      const snap=await F.getDoc(ref);let cur=api.get();
      if(snap.exists()){
        const c=JSON.parse(snap.data().d),m=api.merge(cur,c);
        if(ids(m)!==ids(cur)||(c.ts||0)>(cur.ts||0)){try{localStorage.setItem('omapt1-ennen-synkronointia',JSON.stringify(cur))}catch(e){}api.set(m);cur=api.get()}
      }
      await F.setDoc(ref,{d:JSON.stringify(strip(cur)),ts:Date.now()});
    }catch(e){}
    busy=false;if(again){again=false;sync()}}
  window.onSv=()=>{clearTimeout(tm);tm=setTimeout(sync,1500)};
  window.cloudIn=async()=>{const p=new U.GoogleAuthProvider();try{await U.signInWithPopup(au,p)}catch(e){try{await U.signInWithRedirect(au,p)}catch(x){}}};
  window.cloudOut=()=>U.signOut(au);
  U.onAuthStateChanged(au,async u=>{if(!u){ref=null;api.cloud({st:'out'});return}
    ref=F.doc(db,'users',u.uid);api.cloud({st:'in',email:u.email});await sync()});
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState=='visible')sync()});
}catch(e){}})();

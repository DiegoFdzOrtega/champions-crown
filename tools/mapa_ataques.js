// Saca qué imágenes usa cada ataque (para js/precarga.js). Uso: servidor local en el puerto 8784 (python -m http.server 8784) y luego: node tools/mapa_ataques.js -> vt/mapa.json
const {chromium}=require('playwright');
(async()=>{
const b=await chromium.launch(); const pg=await (await b.newContext({viewport:{width:1280,height:720}})).newPage();
await pg.goto('http://localhost:8784/index.html'); await pg.waitForTimeout(2500);
await pg.getByRole('button',{name:/Jugar sin cuenta/}).click().catch(()=>{}); await pg.waitForTimeout(1200);
await pg.evaluate(()=>{ if(window.guiaClose) guiaClose(); team.length=0; team.push(131,4,7,10,13,16); floorFight(0); });
let k=0; while(!(await pg.evaluate(()=>!!g&&g.t>3.5))&&k<80){await pg.keyboard.press('Enter'); await pg.waitForTimeout(300);k++;}
await pg.waitForTimeout(4000);
await pg.evaluate(()=>{ window.aiThink=()=>{}; const C=CanvasRenderingContext2D.prototype, o=C.drawImage; window.__s=new Set(); C.drawImage=function(im){ const s=(im&&(im.__tarde||im.src))||''; if(/assets\/(fx|objetos)\//.test(s)) __s.add(s.replace(/^.*?(assets\/)/,'$1').replace(/\?.*/,'').replace(/\.webp$/,'.png')); return o.apply(this,arguments); }; });
const L=await pg.evaluate(()=>Object.entries(MOVES).map(([n,o])=>[n,o.s]));
const res={};
for(const [mv,slot] of L){
  await pg.evaluate(()=>{ __s.clear(); }); await pg.waitForTimeout(250);
  const antes=await pg.evaluate(()=>[...__s]);
  await pg.evaluate(([mv,slot])=>{ __s.clear(); const P=g.p[g.pi],E=g.e[g.ei]; P.x=W/2-120; P.y=320; E.x=W/2+100; E.y=320; E.cd=[9,9,9,9,9]; E.hp=E.max; P.m.mv[slot-1]=mv; P.en=100; P.cd=[0,0,0,0,0]; P.hp=P.max; P.truant=0; P.burst=null; P.wind=null; try{ use(P,slot,0,true); }catch(e){} },[mv,slot]);
  await pg.waitForTimeout(slot===4?2600:1500);
  res[mv]=(await pg.evaluate(()=>[...__s])).filter(x=>!antes.includes(x));
}
require('fs').writeFileSync('vt/mapa.json', JSON.stringify(res,null,0));
console.log(Object.keys(res).length, Object.values(res).reduce((a,v)=>a+v.length,0)); await b.close();})();

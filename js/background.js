"use strict";
/* =====================================================================
   FONDO DEL MENÚ: pixel art dibujado con código (la Torre Batalla de noche)
   ===================================================================== */
const BW = 640, BH = 270, TX = 440;           // tamaño del dibujo y posición de la torre
let bgC = null, bgStars = [], beacon = [TX, 4];
function rng(a){ return ()=>{ a|=0; a=a+0x6D2B79F5|0; let t=Math.imul(a^a>>>15,1|a); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; }

function buildBg(){
  bgC = document.createElement('canvas'); bgC.width = BW; bgC.height = BH;
  const c = bgC.getContext('2d'), r = rng(7);
  const rect = (col,x,y,w,h)=>{ c.fillStyle = col; c.fillRect(x,y,w,h); };
  const sky = ['#04060d','#060a16','#0a0d20','#0f1030','#17103d','#221248','#31164f','#47195a','#5e1e63'], bh = 26;
  sky.forEach((col,i)=> rect(col, 0, i*bh, BW, bh+1)); rect(sky[8], 0, sky.length*bh, BW, BH);   // cielo en franjas
  for(let i=0;i<170;i++){                                                                         // estrellas
    const x = r()*BW|0, y = r()*150|0, k = r();
    rect(k<.15 ? '#ffcc33' : k<.5 ? '#9cc9ff' : '#ffffff', x, y, 1, 1);
    if(i < 50) bgStars.push([x,y]);
  }
  for(let rad=34; rad>16; rad-=6){ c.fillStyle = 'rgba(120,160,255,.06)'; c.beginPath(); c.arc(150,58,rad,0,7); c.fill(); }
  c.fillStyle = '#c9d6f5'; c.beginPath(); c.arc(150,58,16,0,7); c.fill();                         // luna
  rect('#9fb0d8',144,52,5,5); rect('#9fb0d8',154,62,4,4); rect('#b3c2e6',150,50,3,3);
  const mount = (col,base,amp,f,s)=>{ for(let x=0;x<BW;x++){ const h = base - Math.round(Math.sin(x*f+s)*amp + Math.sin(x*f*2.3+s)*amp*.5); rect(col,x,h,1,BH-h); } };
  mount('#111a33',200,22,.013,1); mount('#0b1224',216,14,.02,4);                                  // montañas
  for(let rad=190; rad>50; rad-=14){                                                              // brillo tras la torre
    c.fillStyle = rad>110 ? 'rgba(255,62,165,.035)' : 'rgba(62,166,255,.045)';
    c.beginPath(); c.ellipse(TX,110,rad,rad*.8,0,0,7); c.fill();
  }
  let y = 224;                                                                                    // la torre, piso a piso
  [[132,26],[100,34],[74,36],[54,34],[38,30]].forEach(([w,h])=>{
    const x0 = TX - w/2, top = y - h;
    rect('#0f1626',x0,top,w,h); rect('#223356',x0,top,w,1); rect('#223356',x0,top,1,h); rect('#223356',x0+w-1,top,1,h);
    rect('#3ea6ff',x0-1,top+2,1,h-4); rect('#3ea6ff',x0+w,top+2,1,h-4);                          // luces azules laterales
    for(let mx=x0; mx<x0+w-3; mx+=8) rect('#223356',mx,top-3,4,3);                                // almenas
    for(let wy=top+5; wy<y-5; wy+=9) for(let wx=x0+6; wx<x0+w-8; wx+=9){                         // ventanas
      const k = r(); rect(k<.32 ? '#ffcc33' : k<.5 ? '#3ea6ff' : '#16203a', wx, wy, 4, 5);
    }
    y = top - 3;
  });
  rect('#223356',TX-3,y-26,6,26); rect('#223356',TX-1,y-44,2,18); rect('#ff3ea5',TX-1,y-47,3,3);   // antena
  beacon = [TX+.5, y-45.5];
  rect('#090d16',0,224,BW,BH-224); rect('#16203a',0,224,BW,1);                                    // suelo
  c.strokeStyle = 'rgba(62,166,255,.12)';
  for(let i=-8;i<=8;i++){ c.beginPath(); c.moveTo(TX+i*3,224); c.lineTo(TX+i*34,BH); c.stroke(); }
  for(let i=0;i<60;i++) rect(r()<.5 ? '#ffcc33' : '#3ea6ff', r()*BW|0, 228+(r()*40|0), 1, 1);
}

// Los 3 Pokémon que dan vueltas por la torre son los de TU EQUIPO (si no tienes 3, se rellenan con Dragonite, Charizard y Gengar).
// Si usas la versión shiny de uno (Equipo Pokémon), sale shiny y con brillo dorado en vez de azul.
// MENU_MONS_COLOR = true: se ven a color, oscurecidos para que encajen con la noche · false: siluetas negras (el shiny solo se nota por el brillo dorado).
const MENU_MONS_COLOR = true;
function menuMon(t, dex, cx, cy, rx, ry, sp, ph){
  const a = t*sp + ph, x = cx + Math.cos(a)*rx, y = cy + Math.sin(a)*ry + Math.sin(t*3+ph)*3;
  const right = Math.sin(a)*sp < 0, sh = typeof useShiny === 'function' && useShiny(dex);
  ctx.save();
  if('filter' in ctx) ctx.filter = MENU_MONS_COLOR ? 'brightness(.66) saturate(.95)' : 'brightness(.12) saturate(0)';
  ctx.shadowColor = sh ? '#ffd23a' : '#3ea6ff'; ctx.shadowBlur = sh ? 18 : 14;
  drawFrame(ctx, dex, 'Walk', t, right ? 2 : 6, x, y, ESCALA, 0, sh);
  ctx.restore();
  if(sh){                                                                         // destellos dorados alrededor del shiny
    ctx.save(); ctx.fillStyle = '#fff3a0';
    for(let k = 0; k < 3; k++){ const q = (t*1.3 + k/3 + ph) % 1, sx = x + Math.sin(k*2.4 + ph)*30, sy = y - 34 + Math.cos(k*3.1 + ph)*26, z = Math.sin(q*Math.PI);
      ctx.globalAlpha = z; ctx.fillRect(Math.round(sx) - 1, Math.round(sy) - 4*z, 2, 8*z); ctx.fillRect(Math.round(sx) - 4*z, Math.round(sy) - 1, 8*z, 2); }
    ctx.restore();
  }
}

function menuBg(t){
  if(!bgC) buildBg();
  const s = H/BH, ox = (W - BW*s)/2;
  ctx.imageSmoothingEnabled = false; ctx.drawImage(bgC, ox, 0, BW*s, BH*s);
  bgStars.forEach(([x,y],i)=>{ ctx.fillStyle = `rgba(255,255,255,${.2 + .5*Math.abs(Math.sin(t*1.6+i))})`; ctx.fillRect(ox+x*s, y*s, s, s); });
  const tx = ox + TX*s;
  const tm = [0, 1, 2].map(i => (typeof team !== 'undefined' && team[i]) || [149, 6, 94][i]);   // tu equipo (antes: Dragonite, Charizard y Gengar fijos)
  menuMon(t, tm[0], tx, 130, 190, 34, .5, 0);        // 1.er Pokémon: órbita alta
  menuMon(t, tm[1], tx, 215, 250, 40, -.38, 2);      // 2.º: órbita baja y ancha
  menuMon(t, tm[2], tx-280, 400, 26, 7, .9, 1);      // 3.º: círculo pequeño delante
  const a = .5 + .5*Math.sin(t*3);                   // luz de la antena
  ctx.save(); ctx.shadowColor = '#ff3ea5'; ctx.shadowBlur = 22; ctx.fillStyle = `rgba(255,62,165,${.45 + .55*a})`;
  ctx.beginPath(); ctx.arc(ox + beacon[0]*s, beacon[1]*s, 3 + 3*a, 0, 7); ctx.fill(); ctx.restore();
  const v = ctx.createRadialGradient(W/2, H/2, H*.4, W/2, H/2, Math.hypot(W,H)*.55);   // viñeta
  v.addColorStop(0, 'rgba(5,7,12,0)'); v.addColorStop(1, 'rgba(5,7,12,.6)');
  ctx.fillStyle = v; ctx.fillRect(0,0,W,H);
}

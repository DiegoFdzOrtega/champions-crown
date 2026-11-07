"use strict";
/* =====================================================================
   FONDO DEL MENÚ: pixel art dibujado con código (la Torre Batalla de noche)
   ===================================================================== */
const BW = 640, BH = 270, TX = 440;           // tamaño del dibujo y posición de la torre
let bgC = null, bgStars = [], beacon = [TX, 4], bgKey = '', bgGold = false, bgTower = [], bgWins = [];
// El fondo cambia con tu progreso: cada Liga superada enciende una luz de su color en la base de la torre,
// y cuantas más Ligas tienes, más ventanas encendidas. Con las 9 Ligas, la torre se corona de oro.
const LEAGUE_COL = ['#e23b3b','#ffcc33','#4ccf6a','#3ea6ff','#e6edf7','#ff3ea5','#ff9f43','#b06cff','#46e0d0'];   // un color por región, en el orden de REGIONS (Kanto ... Paldea)
const bgWon = () => (typeof REGIONS !== 'undefined' && typeof champAny === 'function') ? REGIONS.map(r => !!champAny(r)) : [];
function rng(a){ return ()=>{ a|=0; a=a+0x6D2B79F5|0; let t=Math.imul(a^a>>>15,1|a); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; }

function buildBg(){
  const won = bgWon(), nWon = won.filter(Boolean).length, pr = nWon/9, gold = nWon === 9;      // pr = progreso de 0 a 1
  bgKey = won.join(''); bgStars = []; bgGold = gold; bgTower = []; bgWins = [];
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
  if(nWon === 9) for(let rad=170; rad>40; rad-=14){ c.fillStyle = 'rgba(255,204,51,.05)'; c.beginPath(); c.ellipse(TX,90,rad*.8,rad,0,0,7); c.fill(); }   // aura dorada
  let y = 224;                                                                                    // la torre, piso a piso
  [[132,26],[100,34],[74,36],[54,34],[38,30]].forEach(([w,h])=>{
    const x0 = TX - w/2, top = y - h;
    bgTower.push([x0-1, top-3, w+2, h+3]);                                                      // (silueta de la torre: los voladores pasan por detrás)
    rect('#0f1626',x0,top,w,h); rect('#223356',x0,top,w,1); rect('#223356',x0,top,1,h); rect('#223356',x0+w-1,top,1,h);
    rect(gold ? '#ffcc33' : '#3ea6ff',x0-1,top+2,1,h-4); rect(gold ? '#ffcc33' : '#3ea6ff',x0+w,top+2,1,h-4);                          // luces azules laterales
    for(let mx=x0; mx<x0+w-3; mx+=8) rect(gold ? '#c9a227' : '#223356',mx,top-3,4,3);                                // almenas
    for(let wy=top+5; wy<y-5; wy+=9) for(let wx=x0+6; wx<x0+w-8; wx+=9){                         // ventanas
      const k = r(); bgWins.push([wx, wy]); rect(k<.32+.3*pr ? '#ffcc33' : k<.5+.4*pr ? '#3ea6ff' : '#16203a', wx, wy, 4, 5);
    }
    y = top - 3;
  });
  rect('#223356',TX-3,y-26,6,26); rect('#223356',TX-1,y-44,2,18); rect(gold ? '#ffcc33' : '#ff3ea5',TX-1,y-47,3,3);   // antena
  beacon = [TX+.5, y-45.5]; bgTower.push([TX-3, y-47, 6, 48]);
  rect('#090d16',0,224,BW,BH-224); rect('#16203a',0,224,BW,1);                                    // suelo
  for(let i=0;i<9;i++){                                                                           // 9 farolillos delante de la torre: uno por Liga
    const lx = TX - 196 + i*18, on = won[i];
    rect('#223356', lx+2, 227, 2, 7);                                                             // poste
    if(on){ c.fillStyle = LEAGUE_COL[i] + '33'; c.beginPath(); c.arc(lx+3, 224, 10, 0, 7); c.fill(); }   // brillo
    rect(on ? LEAGUE_COL[i] : '#1a2440', lx, 221, 6, 6);
    if(on) rect('#ffffff', lx+1, 222, 2, 2);
  }
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

// ---- VIDA EN EL FONDO ----
// Nubes que pasan, Pokémon voladores que cruzan POR DETRÁS de la torre, un foco que gira en la antena y ventanas que parpadean.
const MENU_FLYERS = [18, 142, 334, 398, 628, 277, 149, 6, 823, 663];   // quiénes cruzan el cielo (Pidgeot, Aerodactyl, Altaria, Staraptor, Braviary, Swellow, Dragonite, Charizard, Corviknight, Talonflame)
const MENU_FLY_SLOTS = [{dur:16, gap:14, off:2, y:.14, dir:1}, {dur:22, gap:20, off:19, y:.30, dir:-1}, {dur:18, gap:26, off:37, y:.2, dir:1}];   // dur = segundos cruzando · gap = pausa entre uno y otro
function menuClouds(t){
  ctx.save();
  [[.5, 26, .05, 0], [1, 40, .075, 1]].forEach(([sz, sp, al, layer]) => {
    for(let i = 0; i < 6; i++){
      const w = (120 + (i*53 % 90)) * sz * (H/270), x = ((t*sp*(H/270)*.5 + i*(W+300)/6) % (W + 300)) - 200, y = H*(.06 + ((i*37 + layer*19) % 46)/100*.5);
      ctx.fillStyle = `rgba(150,172,235,${al})`;
      const u = Math.max(3, Math.round(H/90));                                    // nube hecha de bloques (estilo pixel art)
      for(let k = 0; k < 5; k++){ const bw = w*(.35 + .13*((k*3 + i) % 4)), bx = x + k*w*.17, by = y - ((k % 2) ? u*2 : 0) - (k === 2 ? u*3 : 0);
        ctx.fillRect(Math.round(bx/u)*u, Math.round(by/u)*u, Math.round(bw/u)*u, u*3); }
    }
  });
  ctx.restore();
}
function menuFlyers(t, ox, s){
  ctx.save();
  ctx.beginPath(); ctx.rect(0, 0, W, H);                                          // todo el lienzo MENOS la torre → pasan por detrás
  bgTower.forEach(([x,y,w,h]) => ctx.rect(ox + x*s, y*s, w*s, h*s));
  ctx.clip('evenodd');
  MENU_FLY_SLOTS.forEach((f, i) => {
    const cyc = f.dur + f.gap, n = Math.floor((t + f.off)/cyc), q = ((t + f.off) % cyc)/f.dur;
    if(q > 1) return;
    const dex = MENU_FLYERS[(n*3 + i*4) % MENU_FLYERS.length], x = f.dir > 0 ? -70 + q*(W + 140) : W + 70 - q*(W + 140);
    const y = H*f.y + Math.sin(t*1.7 + i*2 + n)*H*.025 + ((n*29 + i*17) % 20)/100*H*.2;
    if('filter' in ctx) ctx.filter = 'brightness(.3) saturate(.6)';              // lejos y de noche: casi siluetas
    ctx.globalAlpha = .9; drawFrame(ctx, dex, 'Walk', t, f.dir > 0 ? 2 : 6, x, y, ESCALA*.8, 0, false);
  });
  ctx.restore();
}
function menuLights(t, ox, s){
  const bx = ox + beacon[0]*s, by = beacon[1]*s, a = t*.55, L = H*.9;           // foco giratorio en la punta de la torre
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  [a, a + Math.PI].forEach(an => {
    const g = ctx.createLinearGradient(bx, by, bx + Math.cos(an)*L, by + Math.sin(an)*L*.35);
    g.addColorStop(0, bgGold ? 'rgba(255,204,51,.22)' : 'rgba(255,90,190,.22)'); g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(bx, by);
    ctx.lineTo(bx + Math.cos(an - .09)*L, by + Math.sin(an - .09)*L*.35); ctx.lineTo(bx + Math.cos(an + .09)*L, by + Math.sin(an + .09)*L*.35); ctx.fill();
  });
  ctx.restore();
  bgWins.forEach(([wx, wy], i) => {                                               // ventanas que se encienden y se apagan solas
    const k = Math.abs(Math.sin(i*12.9898 + Math.floor(t*.6 + i*.37)*78.233)*43758.5453) % 1;
    if(k > .86){ ctx.fillStyle = k > .93 ? 'rgba(255,204,51,.95)' : 'rgba(62,166,255,.9)'; ctx.fillRect(ox + wx*s, wy*s, 4*s, 5*s); }
  });
  const ph = (t*.18) % 1;                                                         // estrella fugaz de vez en cuando
  if(ph < .12){ const q = ph/.12, sx = ox + (60 + 400*((Math.floor(t*.18)*0.37) % 1))*s - q*90*s, sy = (14 + q*50)*s;
    const g = ctx.createLinearGradient(sx, sy, sx + 40*s, sy - 18*s); g.addColorStop(0, `rgba(255,255,255,${1 - q})`); g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.strokeStyle = g; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(sx + 40*s, sy - 18*s); ctx.stroke(); }
}

function menuBg(t){
  if(!bgC || bgKey !== bgWon().join('')) buildBg();       // se redibuja solo cuando cambian tus Ligas superadas
  const s = H/BH, ox = (W - BW*s)/2;
  ctx.imageSmoothingEnabled = false; ctx.drawImage(bgC, ox, 0, BW*s, BH*s);
  bgStars.forEach(([x,y],i)=>{ ctx.fillStyle = `rgba(255,255,255,${.2 + .5*Math.abs(Math.sin(t*1.6+i))})`; ctx.fillRect(ox+x*s, y*s, s, s); });
  menuClouds(t);                                       // (los voladores ya no cruzan el menú: quedan para la pantalla de la Torre)
  const tx = ox + TX*s;
  const tm = [0, 1, 2].map(i => (typeof team !== 'undefined' && team[i]) || [149, 6, 94][i]);   // tu equipo (antes: Dragonite, Charizard y Gengar fijos)
  menuMon(t, tm[0], tx, 130, 190, 34, .5, 0);        // 1.er Pokémon: órbita alta
  menuMon(t, tm[1], tx, 215, 250, 40, -.38, 2);      // 2.º: órbita baja y ancha
  menuMon(t, tm[2], tx-280, 400, 26, 7, .9, 1);      // 3.º: círculo pequeño delante
  const a = .5 + .5*Math.sin(t*3);                   // luz de la antena
  ctx.save(); ctx.shadowColor = bgGold ? '#ffcc33' : '#ff3ea5'; ctx.shadowBlur = 22; ctx.fillStyle = bgGold ? `rgba(255,204,51,${.45 + .55*a})` : `rgba(255,62,165,${.45 + .55*a})`;
  ctx.beginPath(); ctx.arc(ox + beacon[0]*s, beacon[1]*s, 3 + 3*a, 0, 7); ctx.fill(); ctx.restore();
  menuLights(t, ox, s);
  const v = ctx.createRadialGradient(W/2, H/2, H*.4, W/2, H/2, Math.hypot(W,H)*.55);   // viñeta
  v.addColorStop(0, 'rgba(5,7,12,0)'); v.addColorStop(1, 'rgba(5,7,12,.6)');
  ctx.fillStyle = v; ctx.fillRect(0,0,W,H);
}

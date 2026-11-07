"use strict";
/* =====================================================================
   FONDO DEL MENÚ (v20261386): el Palacio de la Corona, en pixel art dibujado con código.
   Cambia con la HORA REAL de tu dispositivo: amanecer → día → atardecer → noche. El sol cruza el cielo y se esconde
   tras las montañas; luego sale la luna. Con tu progreso se encienden las 9 antorchas y banderas (una por Liga).
   ===================================================================== */
const BW = 640, BH = 270, TX = 385;           // tamaño del dibujo y posición del palacio
let bgC = null, bgF = null, bgCl = null, bgStars = [], bgKey = '', bgNight = 0, bgDusk = 0, bgGold = false;
const LEAGUE_COL = ['#e23b3b','#ffcc33','#4ccf6a','#3ea6ff','#e6edf7','#ff3ea5','#ff9f43','#b06cff','#46e0d0'];   // un color por región, en el orden de REGIONS (Kanto ... Paldea)
const bgWon = () => (typeof REGIONS !== 'undefined' && typeof champAny === 'function') ? REGIONS.map(r => !!champAny(r)) : [];
function rng(a){ return ()=>{ a|=0; a=a+0x6D2B79F5|0; let t=Math.imul(a^a>>>15,1|a); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; }

// Hora del día (0-24). Para probar: window.BG_HORA = 21 en la consola.
const bgHour = () => (typeof window.BG_HORA === 'number') ? window.BG_HORA : (() => { const d = new Date(); return d.getHours() + d.getMinutes()/60; })();
const _hx = h => [1,3,5].map(i => parseInt(h.substr(i,2),16));
const _mix = (a,b,t) => { const A = _hx(a), B = _hx(b); return '#' + A.map((v,i) => Math.round(v + (B[i]-v)*t).toString(16).padStart(2,'0')).join(''); };
// Paletas del cielo (de arriba a abajo) y de las nubes según la fase del día
const SKY = {
  night: {sky:['#03050d','#060a18','#0b1030','#141848','#1f1c58','#2f2166'], cl:['#1b1f4e','#3a4296'], tint:'rgba(10,14,50,.72)'},
  dawn:  {sky:['#2a2a6a','#5a3a86','#b24a86','#f0706a','#ffa65c','#ffe0a0'], cl:['#9a4a8c','#ffb070'], tint:'rgba(120,50,90,.16)'},
  day:   {sky:['#2f7bd8','#4a96e8','#78b6f2','#a6d3f6','#d2eaf9','#f4f3dc'], cl:['#e8f2fb','#ffffff'], tint:'rgba(120,170,220,.5)'},
  dusk:  {sky:['#1d1346','#4a2370','#9a3a76','#e5606a','#ffa65c','#ffe3a0'], cl:['#8b3f86','#ffb36a'], tint:'rgba(0,0,0,0)'},
};
// fases: [hora, paleta]; entre dos fases se mezcla
const SKY_KEYS = [[0,'night'],[5,'night'],[6.8,'dawn'],[8.6,'day'],[17,'day'],[19,'dusk'],[20.6,'night'],[24,'night']];
function bgPhase(h){ let i = 0; while(i < SKY_KEYS.length-2 && h > SKY_KEYS[i+1][0]) i++;
  const [h0,a] = SKY_KEYS[i], [h1,b] = SKY_KEYS[i+1], t = Math.min(1, Math.max(0, (h-h0)/(h1-h0))); return {a, b, t}; }
const bgPal = (ph, f) => { const A = SKY[ph.a], B = SKY[ph.b]; return f(A, B, ph.t); };

function buildBg(){
  const won = bgWon(), nWon = won.filter(Boolean).length, h = bgHour(), X = TX;
  bgKey = won.join('') + '|' + Math.floor(h*12); bgGold = nWon === 9;                       // se redibuja con tu progreso y cada 5 minutos
  const ph = bgPhase(h), mk = (n) => bgPal(ph, (A,B,t) => _mix(A.sky[n], B.sky[n], t));
  const clA = bgPal(ph, (A,B,t) => _mix(A.cl[0], B.cl[0], t)), clB = bgPal(ph, (A,B,t) => _mix(A.cl[1], B.cl[1], t));
  const nightOf = k => k === 'night' ? 1 : 0, duskOf = k => (k === 'dusk' || k === 'dawn') ? 1 : 0;
  bgNight = nightOf(ph.a)*(1-ph.t) + nightOf(ph.b)*ph.t; bgDusk = duskOf(ph.a)*(1-ph.t) + duskOf(ph.b)*ph.t;
  const mkc = () => { const c = document.createElement('canvas'); c.width = BW; c.height = BH; return c; };
  const r = rng(21), hz = 178;
  // ---- cielo ----
  bgC = mkc(); let c = bgC.getContext('2d');
  const R = (col,x,y,w,hh)=>{ c.fillStyle = col; c.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(hh)); };
  const stops = [0,.2,.42,.62,.82,1].map((p,i) => [p, mk(i)]);
  for(let y = 0; y < BH; y += 4){ const t = Math.min(1, y/hz); let i = 0; while(i < stops.length-2 && t > stops[i+1][0]) i++;
    const [t0,c0] = stops[i], [t1,c1] = stops[i+1], u = Math.min(1, Math.max(0, (t-t0)/(t1-t0)));
    R(_mix(c0, c1, u), 0, y, BW, 5); }
  bgStars = []; for(let i = 0; i < 90; i++){ const x = r()*BW|0, y = r()*120|0; bgStars.push([x, y, r() < .2 ? '#ffe7b0' : '#ffffff']); }
  // ---- nubes (capa aparte: se desplazan despacio) ----
  bgCl = mkc(); c = bgCl.getContext('2d');
  const cloud = (x,y,w) => { const u = 3; for(let k = 0; k < 5; k++){ const bw = w*(.34+.12*((k*3)%4)), bx = x + k*w*.17, by = y - ((k%2) ? u*2 : 0) - (k === 2 ? u*3 : 0);
    for(const o of [0, -BW]){ R(clA, Math.round(bx/u)*u+o, Math.round(by/u)*u, Math.round(bw/u)*u, u*3); R(clB, Math.round(bx/u)*u+o, Math.round(by/u)*u+u*2, Math.round(bw/u)*u, u); } } };
  [[40,34,130],[250,22,160],[560,40,120],[120,74,170],[340,60,140],[520,84,150],[20,110,180],[300,100,120]].forEach(([x,y,w]) => cloud(x,y,w));
  // ---- escenario (capa delantera transparente) ----
  bgF = mkc(); c = bgF.getContext('2d');
  const mount = (col,base,amp,f,s,rim) => { for(let x = 0; x < BW; x++){ const hh = base - Math.round(Math.sin(x*f+s)*amp + Math.sin(x*f*2.3+s)*amp*.5 + Math.sin(x*f*5+s)*amp*.15); R(col,x,hh,1,BH-hh); if(rim) R(rim,x,hh,1,1); } };
  mount('#a8497a',176,16,.014,2,'#ff9b63'); mount('#7c3a78',188,20,.011,5,'#e56a68'); mount('#522f6c',200,16,.017,1,null);
  c.fillStyle = 'rgba(255,170,100,.16)'; c.fillRect(0,176,BW,20);
  const cliff = [[330,230],[300,214],[270,200],[246,188],[220,176],[200,164],[186,152],[176,140]];
  cliff.forEach(([w,y],i) => { const nxt = i < cliff.length-1 ? cliff[i+1][1] : y-12; R('#1d1032',X-w/2,y,w,BH-y); R('#2b1844',X-w/2,y,w,2); R('#ff9a5a',X-w/2,y,2,Math.max(2,Math.min(14,y-nxt+12))); R('#ff9a5a',X+w/2-2,y,2,12); });
  for(let i = 0; i < 60; i++){ const y = 140 + r()*80|0, w = (y < 176 ? 176 : y < 200 ? 220 : 300); R('#150a26',X-w/2+r()*w,y,2+r()*5,1); }
  const P = '#150a26', P2 = '#1d1036';
  R(P,X-88,114,176,28); R(P2,X-88,114,176,2); for(let x = X-88; x < X+88; x += 8) R(P,x,110,4,4);
  R(P,X-36,86,72,30); R(P2,X-36,86,72,2); for(let x = X-34; x < X+34; x += 7) R(P2,x,92,2,22);
  R('#02030a',X-8,98,16,16);
  R(P,X-28,72,56,14); R(P,X-18,60,36,12); R(P,X-9,50,18,10); R(P,X-2,36,4,16);
  [[-70,84,18,28],[70,84,18,28],[-54,96,14,18],[54,96,14,18]].forEach(([dx,y,w,hh]) => { R(P,X+dx-w/2,y,w,hh); R(P,X+dx-w/2+2,y-8,w-4,8); R(P,X+dx-w/2+4,y-14,w-8,6); R(P,X+dx-1,y-22,2,8); });
  for(let i = 0; i < 22; i++){ const y = 142 + i*4, w = 28 + i*5.2; R(i%2 ? '#3b2556' : '#4a2f68',X-w/2,y,w,4); R('#ff9a5a55',X-w/2,y,w,1); }
  R('#120824',0,236,BW,BH-236); R('#2b1844',0,236,BW,1);
  const pine = (x,y,s,col) => { for(let k = 0; k < 9; k++){ const w = (2+k*2.6)*s; R(col,x-w/2,y-(9-k)*6*s,w,6*s+1); if(k%3 === 2) R(col,x-w/2-1.5*s,y-(9-k)*6*s+4*s,w+3*s,2*s); } R(col,x-2*s,y,4*s,12*s); };
  [[20,262,1.6],[70,270,1.9],[118,266,1.3],[600,262,1.5],[640,270,1.9],[560,268,1.1]].forEach(([x,y,s]) => pine(x,y,s,'#0d0620'));
  [[40,255,1.0],[580,255,1.0]].forEach(([x,y,s]) => pine(x,y,s,'#1a0e30'));
  // tinte según la hora: todo el escenario se aclara de día y se oscurece de noche
  const tA = bgPal(ph, (A,B,t) => A.tint), tB = bgPal(ph, (A,B,t) => B.tint);
  c.save(); c.globalCompositeOperation = 'source-atop';
  const al = s => +s.match(/[\d.]+\)$/)[0].replace(')',''), rgb = s => s.match(/\d+/g).slice(0,3).map(Number);
  const a1 = al(tA), a2 = al(tB), cA = rgb(tA), cB = rgb(tB), a = a1*(1-ph.t) + a2*ph.t;
  const col = cA.map((v,i) => Math.round(v*(1-ph.t) + cB[i]*ph.t)); c.fillStyle = `rgba(${col},${a})`; c.fillRect(0,0,BW,BH); c.restore();
  // luces (después del tinte para que brillen): ventanas, portón, banderas y antorchas
  const lit = .25 + .75*Math.max(bgNight, bgDusk);                                               // de día casi apagadas
  c.save(); c.globalAlpha = lit;
  const r2 = rng(33); for(let i = 0; i < 22; i++){ const wx = X-84 + r2()*168|0, wy = 118 + r2()*18|0; R('#ffb24a',wx,wy,2,3); }
  [[-71,88],[-69,92],[69,88],[71,92],[-55,100],[-53,104],[53,100],[55,104]].forEach(([dx,y]) => R('#ffb24a',X+dx,y,2,3));
  R('#ffcf6a',X-6,100,12,14); R('#fff0b8',X-3,103,6,11);
  c.restore();
  for(let i = 0; i < 9; i++){ const bx = X-80+i*20, on = won[i]; R('#3a2552',bx,104,1,10); R(on ? LEAGUE_COL[i] : '#5a4470',bx+1,104,7,5); if(on){ c.fillStyle = LEAGUE_COL[i]+'55'; c.beginPath(); c.arc(bx+4,107,9,0,7); c.fill(); } }
  for(let i = 0; i < 9; i++){ const side = i%2 ? 1 : -1, step = 1 + ((i/2)|0)*4 + (i%2), y = 142 + step*4, w = 28 + step*5.2, tx = X + side*(w/2+5), on = won[i], cc = LEAGUE_COL[i];
    R('#2b1844',tx-1,y-4,3,12); R('#3b2556',tx-2,y-5,5,2);
    if(on){ c.fillStyle = cc+'44'; c.beginPath(); c.arc(tx,y-9,11,0,7); c.fill(); R(cc,tx-2,y-11,4,6); R('#fff',tx-1,y-9,2,3); } else R('#5a3a5a',tx-1,y-8,3,3); }
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


// ---- sol y luna: siguen la hora real. Salen por la izquierda, suben y se ponen por la derecha ----
function bgBody(u, kind){      // u = 0..1 recorrido por el cielo
  const X = TX, x = X - 130 + u*380, y = 186 - Math.sin(Math.PI*u)*150; return {x, y};
}
function menuBg(t){
  if(!bgC || bgKey !== bgWon().join('') + '|' + Math.floor(bgHour()*12)) buildBg();
  const hr = bgHour(), s = H/BH, ox = (W - BW*s)/2, P = (x,y) => [ox + x*s, y*s];
  ctx.imageSmoothingEnabled = false; ctx.drawImage(bgC, ox, 0, BW*s, BH*s);
  // estrellas (solo de noche)
  if(bgNight > .02) bgStars.forEach(([x,y,col],i) => { ctx.fillStyle = col; ctx.globalAlpha = bgNight*(.25 + .6*Math.abs(Math.sin(t*1.6+i))); ctx.fillRect(ox+x*s, y*s, s, s); }); ctx.globalAlpha = 1;
  // SOL: sale a las 6:30, cruza el cielo y se pone a las 20:00
  const su = (hr - 6.5)/13.5;
  if(su > -.05 && su < 1.05){ const {x,y} = bgBody(su), low = 1 - Math.sin(Math.PI*Math.min(1,Math.max(0,su))), [px,py] = P(x,y);
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    const rr = (60 + 70*low)*s, g = ctx.createRadialGradient(px,py,0,px,py,rr); g.addColorStop(0, `rgba(255,${210-60*low|0},${130-60*low|0},${.5+.2*low})`); g.addColorStop(1, 'rgba(255,150,70,0)'); ctx.fillStyle = g; ctx.fillRect(px-rr,py-rr,rr*2,rr*2);
    if(low > .25) for(let i = 0; i < 13; i++){ const a = -Math.PI/2 + (i-6)*.2 + Math.sin(t*.2)*.02; ctx.fillStyle = `rgba(255,215,140,${(i%2 ? .03 : .05)*low})`; ctx.beginPath(); ctx.moveTo(px,py); ctx.lineTo(px+Math.cos(a-.045)*300*s,py+Math.sin(a-.045)*300*s); ctx.lineTo(px+Math.cos(a+.045)*300*s,py+Math.sin(a+.045)*300*s); ctx.fill(); }
    ctx.restore();
    ctx.fillStyle = low > .3 ? '#fff0b8' : '#fffbe0'; ctx.beginPath(); ctx.arc(px,py,(low > .3 ? 22 : 17)*s,0,7); ctx.fill(); ctx.fillStyle = low > .3 ? '#ffd770' : '#fff3b0'; ctx.beginPath(); ctx.arc(px,py,(low > .3 ? 17 : 13)*s,0,7); ctx.fill(); }
  // LUNA: sale a las 19:30, cruza la noche y se pone a las 6:30
  const mu = hr >= 19.5 ? (hr - 19.5)/11 : (hr + 4.5)/11;
  if(mu > -.05 && mu < 1.05 && (hr >= 19.2 || hr < 6.8)){ const {x,y} = bgBody(mu), [px,py] = P(x,y), vis = Math.min(1, bgNight*1.4 + .2);
    ctx.save(); ctx.globalAlpha = vis;
    for(let rad = 36; rad > 16; rad -= 6){ ctx.fillStyle = 'rgba(150,185,255,.07)'; ctx.beginPath(); ctx.arc(px,py,rad*s,0,7); ctx.fill(); }
    ctx.fillStyle = '#d6e0fa'; ctx.beginPath(); ctx.arc(px,py,16*s,0,7); ctx.fill();
    ctx.fillStyle = '#a9b8e0'; [[-6,-5,5],[3,3,4],[-1,-9,3],[6,-6,2.4]].forEach(([dx,dy,rd]) => { ctx.beginPath(); ctx.arc(px+dx*s,py+dy*s,rd*s*.5,0,7); ctx.fill(); });
    ctx.restore(); }
  // nubes que pasan despacio
  const off = (t*3 % BW)*s; ctx.drawImage(bgCl, ox+off, 0, BW*s, BH*s); ctx.drawImage(bgCl, ox+off-BW*s, 0, BW*s, BH*s);
  // escenario delante (montañas, meseta, palacio)
  ctx.drawImage(bgF, ox, 0, BW*s, BH*s);
  // luciérnagas de noche / destellos de polvo de día
  for(let i = 0; i < 26; i++){ const x = ox + ((i*97 + t*(4+i%5)) % BW)*s, y = (150 + ((i*53)%110) + Math.sin(t*.8+i)*6)*s, k = Math.max(bgNight, bgDusk*.7);
    if(k > .05){ ctx.fillStyle = `rgba(255,205,120,${k*(.25+.45*Math.abs(Math.sin(t*1.3+i)))})`; ctx.fillRect(x,y,s*1.5,s*1.5); } }
  const tx = ox + TX*s;
  const tm = [0, 1, 2].map(i => (typeof team !== 'undefined' && team[i]) || [149, 6, 94][i]);   // tu equipo
  menuMon(t, tm[0], tx, 250, 260, 40, .45, 0);       // vuelan alrededor del palacio
  menuMon(t, tm[1], tx, 360, 330, 30, -.35, 2);
  const v = ctx.createRadialGradient(W/2, H/2, H*.4, W/2, H/2, Math.hypot(W,H)*.55);   // viñeta
  v.addColorStop(0, 'rgba(5,7,12,0)'); v.addColorStop(1, 'rgba(5,7,12,.55)');
  ctx.fillStyle = v; ctx.fillRect(0,0,W,H);
}

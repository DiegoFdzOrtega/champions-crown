"use strict";
/* =====================================================================
   5) DIBUJO: arena, Pokémon y HUD retro oscuro
   ===================================================================== */
function text(t, x, y, size, col, align){
  ctx.font = `${size}px ${FONT}`; ctx.fillStyle = col || '#fff';
  ctx.textAlign = align || 'left'; ctx.textBaseline = 'alphabetic'; ctx.fillText(t, x, y);
}
const HUD_SCALE = .74;                                   // tamaño del HUD en combate (1 = como antes; más pequeño = molesta menos)
function hudAt(ax, ay, fn){ ctx.save(); ctx.translate(ax, ay); ctx.scale(HUD_SCALE, HUD_SCALE); ctx.translate(-ax, -ay); fn(); ctx.restore(); }   // dibuja fn() reducido desde la esquina (ax, ay)
function bar(x, y, w, h, v, max, col){
  ctx.fillStyle = '#05070c'; ctx.fillRect(x, y, w, h);
  ctx.fillStyle = col; ctx.fillRect(x+1, y+1, Math.max(0, (w-2) * v/max), h-2);
  ctx.strokeStyle = 'rgba(255,255,255,.22)'; ctx.lineWidth = 1; ctx.strokeRect(x+.5, y+.5, w-1, h-1);
}
// Caja oscura semitransparente con borde fino iluminado
function hudBox(x, y, w, h, col){
  ctx.fillStyle = 'rgba(16,20,30,.9)'; ctx.fillRect(x, y, w, h);
  ctx.save(); ctx.shadowColor = col; ctx.shadowBlur = 10;
  ctx.strokeStyle = col; ctx.lineWidth = 1.5; ctx.strokeRect(x+.5, y+.5, w-1, h-1); ctx.restore();
  ctx.strokeStyle = 'rgba(255,255,255,.07)'; ctx.lineWidth = 1; ctx.strokeRect(x+4.5, y+4.5, w-9, h-9);
}
// Sombra suave bajo cada Pokémon
function shadow(x, y, rx){
  ctx.save(); ctx.translate(x, y); ctx.scale(1, .3);
  const gr = ctx.createRadialGradient(0,0,0,0,0,rx);
  gr.addColorStop(0, 'rgba(0,0,0,.6)'); gr.addColorStop(.6, 'rgba(0,0,0,.3)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(0,0,rx,0,7); ctx.fill(); ctx.restore();
}

// Fondo antiguo (lava): solo se usa si un rival no tiene arena propia en arenas.js
function arenaFallback(){
  ctx.fillStyle = '#3b2c2a'; ctx.fillRect(0,0,W,H);
  ctx.strokeStyle = 'rgba(0,0,0,.18)'; ctx.lineWidth = 1;
  for(let x=0; x<W; x+=48){ ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke(); }
  for(let y=0; y<H; y+=48){ ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }
  const gr = ctx.createRadialGradient(W/2, H/2, H*.3, W/2, H/2, Math.hypot(W,H)/2);   // lava en los bordes
  gr.addColorStop(0, 'rgba(255,90,20,0)'); gr.addColorStop(.65, 'rgba(255,90,20,.2)'); gr.addColorStop(1, 'rgba(255,130,30,.65)');
  ctx.fillStyle = gr; ctx.fillRect(0,0,W,H);
  ctx.strokeStyle = 'rgba(255,255,255,.22)'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(W/2, 70); ctx.lineTo(W/2, H-90); ctx.stroke();
  ctx.beginPath(); ctx.arc(W/2, H/2+10, 140, 0, 7); ctx.stroke();
  ctx.beginPath(); ctx.arc(W/2, H/2+10, 40, 0, 7); ctx.stroke();
}

// Fondo del combate: cada líder / Alto Mando / Campeón tiene el suyo (ver arenas.js)
function arena(){ drawArena(g && g.o ? (g.o.arena || g.o.leader) : '', g ? g.t : 0); }

function drawF(f, col){
  if(f.ghost || (g.mega && g.mega.f === f)) return;   // en pleno cambio (o megaevolucionando): lo dibuja su animación (swap.js / mega.js)
  const I = idleInfo(f.m.dex);
  const hid = f.hide > 0, lg = fxLunge(f);                                   // hide: bajo tierra (Excavar) · lg: avance visual al atacar
  if(!hid) shadow(f.x, f.y + I.foot*ESCALA - 2, Math.max(30, I.fw*ESCALA*.42));
  if(!hid && !drawFrame(ctx, f.m.dex, f.act, f.at, f.dir, f.x + lg.x, f.y + lg.y, ESCALA, 0, f.shiny) && sheet(f.m.dex, 'Idle', false).bad){      // sin sprite (de verdad, no solo cargando): círculo
    ctx.fillStyle = TC[f.m.types[0]]; ctx.beginPath(); ctx.arc(f.x + lg.x, f.y + lg.y, 30, 0, 7); ctx.fill();
    text(f.m.name[0], f.x + lg.x, f.y+8 + lg.y, 20, '#10141e', 'center');
  }
  if(f.buff > 0 && !hid) fxAura(f, I);                                         // aura de la mejora activa (5 s)
  if(!hid && !f.dead && hasStatus(f)) fxStatusAura(f, I);                      // aura del estado (paralizado, veneno, quemadura, sueño, confusión)
  if(!f.dead) bar(f.x-30, f.y + I.top*ESCALA - 14, 60, 7, f.hp, f.max, col);
  if(!f.dead && hasStatus(f)) statusChips(f, f.x-30, f.y + I.top*ESCALA - 26, 28, 10, 6);   // etiquetas PAR · TOX · QUE · DRM · CNF
}

// Cuadritos del equipo (debajo de tu tarjeta): posición en el mundo del juego. La usan hud() para dibujarlos y ui.js para saber si hiciste clic en uno.
function hudIconRect(i){ const k = HUD_SCALE; return {x:(10 + i*52) * k, y:(10 + 84) * k, w:46 * k, h:46 * k}; }
function hudIconAt(mx, my){                      // nº del cuadrito que hay en (mx, my), o -1
  if(!g || g.over) return -1;
  for(let i = 0; i < g.p.length; i++){ const r = hudIconRect(i); if(mx >= r.x && mx <= r.x + r.w && my >= r.y && my <= r.y + r.h) return i; }
  return -1;
}
function hud(x, y, list, idx, col){
  const f = list[idx], w = 340, r = f.hp / f.max;
  hudBox(x, y, w, 76, col);
  ctx.fillStyle = '#0a0d15'; ctx.fillRect(x+8, y+10, 56, 56);                // retrato
  ctx.strokeStyle = col; ctx.lineWidth = 1; ctx.strokeRect(x+8.5, y+10.5, 55, 55);
  drawFrame(ctx, f.m.dex, 'Idle', 0, 0, x+36, y+38, 2, 50, f.shiny);
  if(hasStatus(f)) statusChips(f, x+8, y+55, 27, 11, 6);                    // estado en el retrato
  text(f.m.name.toUpperCase(), x+74, y+24, f.m.name.length > 9 ? 8 : 10);                 // nombres largos (Mega-Charizard X...) un poco más pequeños para no tapar los tipos
  f.m.types.forEach((t,j)=>{
    const tx = x + w - 8 - 64*(f.m.types.length - j);
    ctx.fillStyle = TC[t]; ctx.fillRect(tx, y+12, 60, 12);
    text(t.toUpperCase(), tx+30, y+21, 6, '#10141e', 'center');
  });
  bar(x+74, y+32, 254, 12, f.hp, f.max, r > .5 ? '#4ccf6a' : r > .2 ? '#e8c33a' : '#e8493a');
  bar(x+74, y+48, 254, 5, f.en, 100, '#4fb3ff');
  text(`${Math.ceil(f.hp)}/${Math.ceil(f.max)}`, x+328, y+69, 8, '#fff', 'right');
  {                                                                                                        // objeto y habilidad (el nivel del rival no se muestra)
    let tx = x+74;
    const im = f.item && itemImg(f.item);
    if(im && im.ok){ ctx.imageSmoothingEnabled = false; ctx.drawImage(im, tx, y+57, 16, 16); tx += 19; }
    if(f.item){ text(ITEMS[f.item].n.toUpperCase(), tx, y+69, 6, '#c9d6f5'); tx += ctx.measureText(ITEMS[f.item].n.toUpperCase()).width + 8; }
    if(f.ab && tx + f.ab.length * 6 < x+252) text(f.ab.toUpperCase(), tx, y+69, 6, '#9be29b');
  }
  list.forEach((u,i)=>{                                                      // mini-iconos del equipo
    const px = x + i*52, py = y + 84;
    ctx.fillStyle = 'rgba(16,20,30,.9)'; ctx.fillRect(px, py, 46, 46);
    ctx.strokeStyle = i === idx ? '#ffcc33' : 'rgba(255,255,255,.25)'; ctx.lineWidth = i === idx ? 2 : 1; ctx.strokeRect(px+.5, py+.5, 45, 45);
    ctx.globalAlpha = u.dead ? .35 : 1;
    drawFrame(ctx, u.m.dex, 'Idle', 0, 0, px+23, py+20, 1, 34, u.shiny);
    bar(px+4, py+37, 38, 5, u.hp, u.max, '#4ccf6a'); ctx.globalAlpha = 1;
    if(list === g.p){                                                        // solo tus cuadritos: se pueden pulsar para cambiar de Pokémon
      const can = !u.dead && i !== idx, wait = can && g.swCd > 0, hov = hudIconAt(mouse.x, mouse.y) === i;
      if(wait){                                                              // en espera: se oscurece y muestra los segundos que faltan
        ctx.fillStyle = 'rgba(5,7,12,.62)'; ctx.fillRect(px+1, py+1, 44, 44);
        ctx.fillStyle = '#ffcc33'; ctx.fillRect(px+1, py+43, 44 * Math.min(1, g.swCd / SWITCH_CD), 2);          // barrita que se vacía
        text(String(Math.ceil(g.swCd)), px+23, py+30, 16, '#ffcc33', 'center');
      }
      if(hov && can){ ctx.strokeStyle = wait ? '#ff9a3a' : '#7dffa0'; ctx.lineWidth = 2; ctx.strokeRect(px+1, py+1, 44, 44); }
      text(String(i + 1), px+6, py+11, 7, can ? '#c9d6f5' : 'rgba(201,214,245,.4)');          // la tecla que hace lo mismo (1 · 2 · 3)
    }
  });
  if(list === g.p){                                                          // mensajes bajo los cuadritos
    const hv = hudIconAt(mouse.x, mouse.y), ty = y + 84 + 46 + 12;
    if(g.swNote > 0) text(`ESPERA ${Math.ceil(g.swCd)} s PARA CAMBIAR`, x, ty, 7, '#ff9a3a');
    else if(hv >= 0 && hv !== idx && !list[hv].dead) text(g.swCd > 0 ? `ESPERA ${Math.ceil(g.swCd)} s` : `CAMBIAR A ${list[hv].m.name.toUpperCase()}`, x, ty, 7, '#7dffa0');
    else if(g.clock < 8 && g.count <= 0 && !g.over) text('CLIC EN UN CUADRO O TECLAS 1 · 2 · 3 PARA CAMBIAR', x, ty, 6, 'rgba(201,214,245,.75)');
  }
}

function draw(){
  ctx.setTransform(cv.width / W, 0, 0, cv.height / H, 0, 0);
  ctx.clearRect(0,0,W,H);
  if(!g){ menuBg(performance.now()/1000); return; }
  ctx.save(); fxShakeApply();                      // temblor de pantalla (solo el campo, no el HUD)
  arena();
  const P = g.p[g.pi], E = g.e[g.ei];

  [[P,'#4ccf6a'],[E,'#ff5a5a']].sort((a,b)=>a[0].y-b[0].y).forEach(([f,c]) => drawF(f,c));
  g.shots.forEach(s=>{
    if(fxShot(s)) return;                          // proyectil con sprite; si no, el círculo de siempre
    ctx.save(); ctx.fillStyle = TC[s.type]; ctx.shadowColor = TC[s.type]; ctx.shadowBlur = 14;
    ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, 7); ctx.fill(); ctx.restore();
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, 7); ctx.stroke();
  });
  fxDraw();                                        // impactos, golpes, polvo y partículas
  swapDraw();                                      // animación de cambio de Pokémon (rayo, Poké Ball y destello)
  megaDraw();                                      // animación de megaevolución (js/mega.js)
  abDrawWeather();                                 // clima (sol, lluvia, granizo, arena): js/abilities.js
  ctx.restore();
  if(!P.dead){                                                               // cruz de puntería
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.beginPath();
    ctx.moveTo(mouse.x-9, mouse.y); ctx.lineTo(mouse.x+9, mouse.y); ctx.moveTo(mouse.x, mouse.y-9); ctx.lineTo(mouse.x, mouse.y+9); ctx.stroke();
  }
  g.pops.forEach(p => text(p.txt, p.x, p.y - (1-p.t)*20, p.s || 9, p.c || '#ffe066', 'center'));

  hudAt(0, 0, () => hud(10, 10, g.p, g.pi, '#4a8cff'));
  hudAt(W, 0, () => hud(W-350, 10, g.e, g.ei, '#ff4a5a'));
  abDrawHud();                                                               // clima activo (js/abilities.js)

  // Panel central: piso y temporizador
  const s = g.clock | 0;
  hudAt(W/2, 0, () => {
  hudBox(W/2-110, 8, 220, 52, '#4a8cff');
  if(g.o.title) text('CAMPO', W/2, 29, 12, '#ffcc33', 'center'); else text('PISO ' + g.o.floor, W/2, 29, 12, '#ffcc33', 'center');
  text(`${(s/60|0)}:${String(s%60).padStart(2,'0')}`, W/2, 49, 10, '#fff', 'center');
  text(g.o.sub, W/2, 76, 8, '#c9d6f5', 'center');
  const L = leaderImg(g.o.leader, g.o.portrait);                                             // retrato del líder
  if(L && L.ok){ const h = 54, w = L.width/L.height*h; ctx.imageSmoothingEnabled = false; ctx.drawImage(L, W/2 - w/2, 84, w, h); }
  });
  text('ESC · PAUSA', W - 14, H - 12, 6, '#6d7899', 'right');
  if(g.count > 0) text(String(Math.ceil(g.count)), W/2, H/2+22, 64, '#ffcc33', 'center');

  // Barra de ataques, centrada abajo
  ctx.save(); ctx.translate(W/2, H); ctx.scale(HUD_SCALE, HUD_SCALE); ctx.translate(-W/2, -H);       // reducida desde el borde de abajo
  const bw = 104, gap = 8, tw = 5*bw + 4*gap + 24, x0 = (W - tw)/2, y0 = H - 82;
  // Barra de energía grande, siempre visible, con las marcas de Q (20) y E (40) y el tiempo que falta
  { const ey = y0 - 38, bx = x0 + 78, bwid = tw - 78 - 12, bh = 10, by = ey + 16;
    hudBox(x0, ey, tw, 34, '#4fb3ff');
    text('ENERGÍA', x0 + 12, by + 8, 7, '#4fb3ff');
    bar(bx, by, bwid, bh, P.en, 100, '#4fb3ff');
    [[3, 'Q'], [4, 'E']].forEach(([i, k]) => {
      const need = Math.round(enCost(P, i)), mx = bx + 1 + (bwid - 2) * need / 100, ready = P.en >= need, col = i === 3 ? '#b07bff' : '#ffcc33';
      ctx.fillStyle = col; ctx.fillRect(Math.round(mx) - 1, by - 3, 2, bh + 6);
      const wait = Math.max(0, (need - P.en) / EN_REGEN);
      text(`${k} ${need}` + (ready ? ' ✔' : ` · ${wait.toFixed(1)}s`), mx, by - 5, 6, ready ? '#9be29b' : col, 'center');
    });
    text(String(Math.floor(P.en)), bx + bwid - 4, by + 8, 7, '#fff', 'right'); }
  hudBox(x0, y0, tw, 72, '#4a8cff');
  MV.forEach((m,i)=>{
    const x = x0 + 12 + i*(bw+gap), y = y0 + 10, h = 52, cost = Math.round(enCost(P, i));      // cost: energía real (Presión del rival)
    const enWait = Math.max(0, (cost - P.en) / EN_REGEN), cdWait = Math.max(0, P.cd[i]), wait = Math.max(enWait, cdWait);   // segundos hasta poder usarlo
    const ok = wait <= 0;
    const col = i === 0 ? '#9aa6b8' : i === 3 ? '#b07bff' : TC[mtype(P, i)];
    ctx.fillStyle = '#161c2c'; ctx.fillRect(x, y, bw, h);
    ctx.strokeStyle = ok ? col : '#2c3550'; ctx.lineWidth = 2; ctx.strokeRect(x+1, y+1, bw-2, h-2);
    ctx.fillStyle = ok ? col : '#2c3550'; ctx.fillRect(x+4, y+4, m.key.length*6 + 6, 10);      // tecla
    text(m.key, x+7, y+12, 6, '#10141e');
    const nm = mvName(P, i).toUpperCase();
    text(nm, x+bw/2, y+32, nm.length > 10 ? 7 : 8, ok ? '#fff' : '#6d7899', 'center');
    if(m.en) text('EN ' + cost, x+bw-5, y+14, 6, P.en >= cost ? '#4fb3ff' : '#e8493a', 'right');
    if(m.en){ const fr = Math.min(1, P.en / cost); ctx.fillStyle = '#05070c'; ctx.fillRect(x+4, y+h-6, bw-8, 3);          // mini barra de energía de ese ataque
      ctx.fillStyle = fr >= 1 ? '#9be29b' : '#4fb3ff'; ctx.fillRect(x+4, y+h-6, (bw-8)*fr, 3); }
    if(!ok){
      const total = Math.max(m.cd, cost / EN_REGEN, .01);
      ctx.fillStyle = 'rgba(5,7,12,.72)'; ctx.fillRect(x+2, y+2, bw-4, (h-4) * Math.min(1, wait/total));
      text(wait.toFixed(1) + 's', x+bw/2, y+47, 8, cdWait >= enWait ? '#fff' : '#4fb3ff', 'center');       // blanco = enfriamiento · azul = falta energía
    }
  });
  ctx.restore();
  megaHud();                                       // aviso «R · MEGAEVOLUCIÓN» (js/mega.js)
  megaTop();                                       // destello y cartel de la megaevolución, encima de todo
}

let last = performance.now();
function loop(now){
  const dt = Math.min(.05, (now-last)/1000); last = now;
  update(dt); draw(); requestAnimationFrame(loop);
}

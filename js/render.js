"use strict";
/* =====================================================================
   5) DIBUJO: arena, Pokémon y HUD retro oscuro
   ===================================================================== */
function text(t, x, y, size, col, align){
  ctx.font = `${size}px ${FONT}`; ctx.fillStyle = col || '#fff';
  ctx.textAlign = align || 'left'; ctx.textBaseline = 'alphabetic'; ctx.fillText(t, x, y);
}
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
  const I = idleInfo(f.m.dex);
  const hid = f.hide > 0, lg = fxLunge(f);                                   // hide: bajo tierra (Excavar) · lg: avance visual al atacar
  if(!hid) shadow(f.x, f.y + I.foot*ESCALA - 2, Math.max(30, I.fw*ESCALA*.42));
  if(!hid && !drawFrame(ctx, f.m.dex, f.act, f.at, f.dir, f.x + lg.x, f.y + lg.y, ESCALA, 0, f.shiny)){      // sin sprite: círculo
    ctx.fillStyle = TC[f.m.types[0]]; ctx.beginPath(); ctx.arc(f.x + lg.x, f.y + lg.y, 30, 0, 7); ctx.fill();
    text(f.m.name[0], f.x + lg.x, f.y+8 + lg.y, 20, '#10141e', 'center');
  }
  if(f.buff > 0 && !hid) fxAura(f, I);                                         // aura de la mejora activa (5 s)
  if(!f.dead) bar(f.x-30, f.y + I.top*ESCALA - 14, 60, 7, f.hp, f.max, col);
}

function hud(x, y, list, idx, col){
  const f = list[idx], w = 340, r = f.hp / f.max;
  hudBox(x, y, w, 76, col);
  ctx.fillStyle = '#0a0d15'; ctx.fillRect(x+8, y+10, 56, 56);                // retrato
  ctx.strokeStyle = col; ctx.lineWidth = 1; ctx.strokeRect(x+8.5, y+10.5, 55, 55);
  drawFrame(ctx, f.m.dex, 'Idle', 0, 0, x+36, y+38, 2, 50, f.shiny);
  text(f.m.name.toUpperCase(), x+74, y+24, 10);
  f.m.types.forEach((t,j)=>{
    const tx = x + w - 8 - 64*(f.m.types.length - j);
    ctx.fillStyle = TC[t]; ctx.fillRect(tx, y+12, 60, 12);
    text(t.toUpperCase(), tx+30, y+21, 6, '#10141e', 'center');
  });
  bar(x+74, y+32, 254, 12, f.hp, f.max, r > .5 ? '#4ccf6a' : r > .2 ? '#e8c33a' : '#e8493a');
  bar(x+74, y+48, 254, 5, f.en, 100, '#4fb3ff');
  text(`${Math.ceil(f.hp)}/${Math.ceil(f.max)}`, x+328, y+69, 8, '#fff', 'right');
  if(f.lvl){                                                                                               // rival: nivel, objeto y habilidad
    text('NV ' + f.lvl, x+74, y+69, 7, '#ffcc33'); let tx = x+112;
    const im = f.item && itemImg(f.item);
    if(im && im.ok){ ctx.imageSmoothingEnabled = false; ctx.drawImage(im, tx, y+57, 16, 16); tx += 19; }
    if(f.item){ text(ITEMS[f.item].n.toUpperCase(), tx, y+69, 6, '#c9d6f5'); tx += ctx.measureText(ITEMS[f.item].n.toUpperCase()).width + 8; }
    if(f.m.ab && tx < x+300) text(f.m.ab.toUpperCase(), tx, y+69, 6, '#9be29b');
  }
  else if(f.item){                                                                                         // objeto equipado: icono + nombre
    const im = itemImg(f.item); let tx = x+74;
    if(im && im.ok){ ctx.imageSmoothingEnabled = false; ctx.drawImage(im, x+74, y+57, 16, 16); tx = x+94; }
    text(ITEMS[f.item].n.toUpperCase(), tx, y+69, 6, '#c9d6f5');
  }
  list.forEach((u,i)=>{                                                      // mini-iconos del equipo
    const px = x + i*52, py = y + 84;
    ctx.fillStyle = 'rgba(16,20,30,.9)'; ctx.fillRect(px, py, 46, 46);
    ctx.strokeStyle = i === idx ? '#ffcc33' : 'rgba(255,255,255,.25)'; ctx.lineWidth = i === idx ? 2 : 1; ctx.strokeRect(px+.5, py+.5, 45, 45);
    ctx.globalAlpha = u.dead ? .35 : 1;
    drawFrame(ctx, u.m.dex, 'Idle', 0, 0, px+23, py+20, 1, 34, u.shiny);
    bar(px+4, py+37, 38, 5, u.hp, u.max, '#4ccf6a'); ctx.globalAlpha = 1;
  });
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
  ctx.restore();
  if(!P.dead){                                                               // cruz de puntería
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.beginPath();
    ctx.moveTo(mouse.x-9, mouse.y); ctx.lineTo(mouse.x+9, mouse.y); ctx.moveTo(mouse.x, mouse.y-9); ctx.lineTo(mouse.x, mouse.y+9); ctx.stroke();
  }
  g.pops.forEach(p => text(p.txt, p.x, p.y - (1-p.t)*20, p.s || 9, p.c || '#ffe066', 'center'));

  hud(10, 10, g.p, g.pi, '#4a8cff');
  hud(W-350, 10, g.e, g.ei, '#ff4a5a');

  // Panel central: piso y temporizador
  const s = g.clock | 0;
  hudBox(W/2-110, 8, 220, 52, '#4a8cff');
  if(g.o.title) text('CAMPO', W/2, 29, 12, '#ffcc33', 'center'); else text('PISO ' + g.o.floor, W/2, 29, 12, '#ffcc33', 'center');
  text(`${(s/60|0)}:${String(s%60).padStart(2,'0')}`, W/2, 49, 10, '#fff', 'center');
  text(g.o.sub, W/2, 76, 8, '#c9d6f5', 'center');
  const L = leaderImg(g.o.leader, g.o.portrait);                                             // retrato del líder
  if(L && L.ok){ const h = 54, w = L.width/L.height*h; ctx.imageSmoothingEnabled = false; ctx.drawImage(L, W/2 - w/2, 84, w, h); }
  text('ESC · PAUSA', W - 14, H - 12, 6, '#6d7899', 'right');
  if(g.count > 0) text(String(Math.ceil(g.count)), W/2, H/2+22, 64, '#ffcc33', 'center');

  // Barra de ataques, centrada abajo
  const bw = 104, gap = 8, tw = 5*bw + 4*gap + 24, x0 = (W - tw)/2, y0 = H - 82;
  hudBox(x0, y0, tw, 72, '#4a8cff');
  MV.forEach((m,i)=>{
    const x = x0 + 12 + i*(bw+gap), y = y0 + 10, h = 52;
    const ok = P.cd[i] <= 0 && P.en >= m.en;
    const col = i === 0 ? '#9aa6b8' : i === 3 ? '#b07bff' : TC[mtype(P, i)];
    ctx.fillStyle = '#161c2c'; ctx.fillRect(x, y, bw, h);
    ctx.strokeStyle = ok ? col : '#2c3550'; ctx.lineWidth = 2; ctx.strokeRect(x+1, y+1, bw-2, h-2);
    ctx.fillStyle = ok ? col : '#2c3550'; ctx.fillRect(x+4, y+4, m.key.length*6 + 6, 10);      // tecla
    text(m.key, x+7, y+12, 6, '#10141e');
    const nm = mvName(P, i).toUpperCase();
    text(nm, x+bw/2, y+32, nm.length > 10 ? 7 : 8, ok ? '#fff' : '#6d7899', 'center');
    if(m.en) text('EN ' + m.en, x+bw-5, y+47, 6, P.en >= m.en ? '#4fb3ff' : '#e8493a', 'right');
    if(P.cd[i] > 0){
      ctx.fillStyle = 'rgba(5,7,12,.72)'; ctx.fillRect(x+2, y+2, bw-4, (h-4) * (P.cd[i]/m.cd));
      text(P.cd[i].toFixed(1), x+bw/2, y+47, 8, '#fff', 'center');
    }
  });
}

let last = performance.now();
function loop(now){
  const dt = Math.min(.05, (now-last)/1000); last = now;
  update(dt); draw(); requestAnimationFrame(loop);
}

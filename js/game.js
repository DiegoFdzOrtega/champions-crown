'use strict';
/* =====================================================================
   1) TUS DATOS: aquí cambias Pokémon, líderes y carpeta de sprites
   ===================================================================== */
const W = 960, H = 540;
const ESCALA = 3;            // los sprites son pequeños: se dibujan 3 veces más grandes
const CARPETA = 'pokemon';   // carpeta de sprites: pokemon/<número>/Walk.png ...

// Colores de los 18 tipos
const TC = {normal:'#a8a878',fuego:'#f08030',agua:'#6890f0',planta:'#78c850',electrico:'#f8d030',
  hielo:'#98d8d8',lucha:'#c03028',veneno:'#a040a0',tierra:'#e0c068',volador:'#a890f0',
  psiquico:'#f85888',bicho:'#a8b820',roca:'#b8a038',fantasma:'#705898',dragon:'#7038f8',
  siniestro:'#705848',acero:'#b8b8d0',hada:'#ee99ac'};

// Tabla de tipos: tipo del ataque -> [muy eficaz contra, poco eficaz contra, no afecta a]
const CH = {
  normal:[[],['roca','acero'],['fantasma']],
  fuego:[['planta','hielo','bicho','acero'],['fuego','agua','roca','dragon'],[]],
  agua:[['fuego','tierra','roca'],['agua','planta','dragon'],[]],
  planta:[['agua','tierra','roca'],['fuego','planta','veneno','volador','bicho','dragon','acero'],[]],
  electrico:[['agua','volador'],['electrico','planta','dragon'],['tierra']],
  hielo:[['planta','tierra','volador','dragon'],['fuego','agua','hielo','acero'],[]],
  lucha:[['normal','hielo','roca','siniestro','acero'],['veneno','volador','psiquico','bicho','hada'],['fantasma']],
  veneno:[['planta','hada'],['veneno','tierra','roca','fantasma'],['acero']],
  tierra:[['fuego','electrico','veneno','roca','acero'],['planta','bicho'],['volador']],
  volador:[['planta','lucha','bicho'],['electrico','roca','acero'],[]],
  psiquico:[['lucha','veneno'],['psiquico','acero'],['siniestro']],
  bicho:[['planta','psiquico','siniestro'],['fuego','lucha','veneno','volador','fantasma','acero','hada'],[]],
  roca:[['fuego','hielo','volador','bicho'],['lucha','tierra','acero'],[]],
  fantasma:[['psiquico','fantasma'],['siniestro'],['normal']],
  dragon:[['dragon'],['acero'],['hada']],
  siniestro:[['psiquico','fantasma'],['lucha','siniestro','hada'],[]],
  acero:[['hielo','roca','hada'],['fuego','agua','electrico','acero'],[]],
  hada:[['lucha','dragon','siniestro'],['fuego','veneno','acero'],[]]
};
function eff(a, d){ const c = CH[a]; return c[2].includes(d)?0 : c[0].includes(d)?2 : c[1].includes(d)?.5 : 1; }

// Tus Pokémon. dex = el número de su carpeta de sprites.
// Solo sé que la carpeta 1 existe; cambia nombres y tipos por los reales y añade más.
const ROSTER = [
  {dex:1, name:'Pokémon 1', type:'planta',   hp:130, spd:130},
  {dex:2, name:'Pokémon 2', type:'fuego',    hp:120, spd:140},
  {dex:3, name:'Pokémon 3', type:'agua',     hp:125, spd:135},
  {dex:4, name:'Pokémon 4', type:'electrico',hp:100, spd:170},
  {dex:5, name:'Pokémon 5', type:'dragon',   hp:166, spd:125},
  {dex:6, name:'Pokémon 6', type:'psiquico', hp:110, spd:160}
];

// Líderes de gimnasio (su equipo usa su tipo). Añade o cambia los que quieras.
const LEADERS = [
  {name:'Líder Roca', type:'roca'}, {name:'Líder Marea', type:'agua'},
  {name:'Líder Trueno', type:'electrico'}, {name:'Líder Selva', type:'planta'},
  {name:'Líder Veneno', type:'veneno'}, {name:'Líder Mente', type:'psiquico'},
  {name:'Líder Llama', type:'fuego'}, {name:'Campeón', type:'dragon'}
];

// Hojas de sprites: tamaño de cada cuadro (w x h), nº de cuadros por fila (n) y velocidad (fps).
// Cada hoja tiene 8 filas, una por dirección.
const ANIMS = {
  Idle:  {w:32, h:40, n:3,  fps:4,  loop:true},
  Walk:  {w:40, h:40, n:6,  fps:10, loop:true},
  Attack:{w:64, h:72, n:11, fps:24, loop:false},
  Shoot: {w:32, h:32, n:6,  fps:16, loop:false},
  Charge:{w:32, h:40, n:10, fps:16, loop:false},
  Hurt:  {w:40, h:56, n:2,  fps:8,  loop:false},
  Faint: {w:32, h:24, n:4,  fps:6,  loop:false}
};

// Los 5 ataques (mismas teclas que la página de referencia)
const MV = [
  {n:'Carrera', key:'Espacio', cd:2,  en:0},
  {n:'Garra',   key:'Clic',    cd:.5, en:8,  dmg:14},
  {n:'Pulso',   key:'Clic der',cd:.8, en:14, dmg:12},
  {n:'Danza',   key:'Q',       cd:10, en:20},
  {n:'Meteoro', key:'E',       cd:8,  en:40, dmg:42}
];

/* =====================================================================
   2) SPRITES
   ===================================================================== */
const sheets = {};
function sheet(dex, a){
  const k = dex + a;
  if(!sheets[k]){ const im = new Image(); im.onload = ()=> im.ok = true; im.src = `${CARPETA}/${dex}/${a}.png`; sheets[k] = im; }
  return sheets[k];
}
// Dirección 0..7 (abajo, abajo-der, der, arriba-der, arriba, arriba-izq, izq, abajo-izq)
function dirOf(ang){ return ((Math.round((Math.PI/2 - ang) / (Math.PI/4)) % 8) + 8) % 8; }

function drawFrame(c, dex, anim, t, dir, x, y, sc){
  const A = ANIMS[anim], im = sheet(dex, anim);
  if(!im.ok) return false;
  let f = Math.floor(t * A.fps); f = A.loop ? f % A.n : Math.min(f, A.n - 1);
  c.imageSmoothingEnabled = false;
  c.drawImage(im, f*A.w, dir*A.h, A.w, A.h, Math.round(x - A.w*sc/2), Math.round(y - A.h*sc/2), A.w*sc, A.h*sc);
  return true;
}

/* =====================================================================
   3) ESTADO
   ===================================================================== */
const cv = document.getElementById('c'), ctx = cv.getContext('2d');
let team = [1, 2, 3];
const save = {record:0, badges:[]};
try{
  const s = JSON.parse(localStorage.getItem('arena2d') || 'null');
  if(s){ team = s.team || team; save.record = s.record || 0; save.badges = s.badges || []; }
}catch(e){}
function persist(){ try{ localStorage.setItem('arena2d', JSON.stringify({team, record:save.record, badges:save.badges})); }catch(e){} }

let g = null;
const keys = {}, mouse = {x:W/2, y:H/2, l:false, r:false};
const clamp = (v,a,b)=> Math.max(a, Math.min(b, v));
const rnd = a => a[Math.floor(Math.random()*a.length)];
const mon = dex => ROSTER.find(r => r.dex === dex);

function mk(m, hm, dm){
  return {m, hp:m.hp*hm, max:m.hp*hm, en:100, dmg:dm, x:0, y:0, cd:[0,0,0,0,0], dir:0,
          act:'Idle', at:0, lock:0, dead:false, dt:0, buff:0, dash:0, da:0, mv:false};
}

function startBattle(o){
  const make = (id, hm, dm, ft)=> mk(ft ? {...mon(id), type:ft} : mon(id), hm, dm);
  const p = team.map(id => make(id,1,1)), e = o.enemies.map(id => make(id,o.hm,o.dm,o.ft));
  p.forEach(f=>{ f.x=220; f.y=H/2; f.dir=2; });
  e.forEach(f=>{ f.x=W-220; f.y=H/2; f.dir=6; });
  g = {o, p, e, pi:0, ei:0, shots:[], pops:[], t:0, clock:0, count:3, over:false};
  show('none');
}

/* =====================================================================
   4) COMBATE EN TIEMPO REAL
   ===================================================================== */
const foe = mine => mine ? g.e[g.ei] : g.p[g.pi];
function setAct(f, name, dur){ f.act = name; f.at = 0; f.lock = dur; }

function hit(T, from, dmg, type){
  if(T.dead) return;
  const mult = eff(type, T.m.type);
  T.hp -= dmg * mult;
  const txt = mult===0 ? 'Sin efecto' : mult>1 ? '¡Muy eficaz!' : mult<1 ? 'Poco eficaz' : '';
  if(txt) g.pops.push({x:T.x, y:T.y-90, txt, t:.9});
  if(T.hp <= 0){ T.hp = 0; T.dead = true; T.dt = 0; setAct(T, 'Faint', 99); }
  else if(mult > 0) setAct(T, 'Hurt', .3);
}
function melee(f, ang, dmg, mine){
  const T = foe(mine), dx = T.x-f.x, dy = T.y-f.y;
  if(T.dead || Math.hypot(dx,dy) > 110) return;
  let d = Math.abs(Math.atan2(dy,dx) - ang); d = Math.min(d, 2*Math.PI - d);
  if(d < 1) hit(T, f, dmg, f.m.type);
}
function shot(f, ang, dmg, speed, r, mine){
  g.shots.push({x:f.x, y:f.y, vx:Math.cos(ang)*speed, vy:Math.sin(ang)*speed, dmg, r, type:f.m.type, mine, life:2});
}

function use(f, i, ang, mine){
  const m = MV[i];
  if(f.dead || f.cd[i] > 0 || f.en < m.en) return;
  f.cd[i] = m.cd; f.en -= m.en; f.dir = dirOf(ang);
  const d = f.dmg * (f.buff > 0 ? 1.3 : 1);
  if(i === 0){ f.dash = .25; f.da = ang; }
  if(i === 1){ setAct(f,'Attack',.45); melee(f, ang, m.dmg*d, mine); }
  if(i === 2){ setAct(f,'Shoot',.4);   shot(f, ang, m.dmg*d, 520, 9, mine); }
  if(i === 3){ setAct(f,'Charge',.6);  f.buff = 5; }
  if(i === 4){ setAct(f,'Charge',.6);  shot(f, ang, m.dmg*d, 380, 22, mine); }
}

function move(f, dx, dy, dt){
  const l = Math.hypot(dx,dy), sp = f.m.spd * (f.buff > 0 ? 1.25 : 1);
  let vx = 0, vy = 0;
  if(f.dash > 0){ vx = Math.cos(f.da)*sp*3; vy = Math.sin(f.da)*sp*3; }
  else if(l){ vx = dx/l*sp; vy = dy/l*sp; }
  f.mv = l > 0 || f.dash > 0;
  f.x = clamp(f.x + vx*dt, 40, W-40); f.y = clamp(f.y + vy*dt, 120, H-90);
}

function update(dt){
  if(!g || g.over) return;
  g.t += dt;
  if(g.count > 0){ g.count -= dt; return; }
  g.clock += dt;
  const P = g.p[g.pi], E = g.e[g.ei];

  if(!P.dead){
    const dx = (keys.KeyD||keys.ArrowRight?1:0) - (keys.KeyA||keys.ArrowLeft?1:0);
    const dy = (keys.KeyS||keys.ArrowDown?1:0) - (keys.KeyW||keys.ArrowUp?1:0);
    const aim = Math.atan2(mouse.y-P.y, mouse.x-P.x);
    move(P, dx, dy, dt); P.dir = dirOf(aim);
    if(mouse.l) use(P,1,aim,true);
    if(mouse.r) use(P,2,aim,true);
    if(keys.Space) use(P,0, (dx||dy) ? Math.atan2(dy,dx) : aim, true);
    if(keys.KeyQ) use(P,3,aim,true);
    if(keys.KeyE) use(P,4,aim,true);
  }
  if(!E.dead){                                   // IA del rival
    const sk = g.o.skill, ang = Math.atan2(P.y-E.y, P.x-E.x), dist = Math.hypot(P.x-E.x, P.y-E.y);
    const want = dist > 230 ? 1 : dist < 130 ? -1 : 0, side = Math.sin(g.t*1.2 + g.ei*2);
    move(E, (Math.cos(ang)*want + Math.cos(ang+1.57)*side)*sk, (Math.sin(ang)*want + Math.sin(ang+1.57)*side)*sk, dt);
    E.dir = dirOf(ang);
    const err = (1-sk)*.6*(Math.random()-.5), r = Math.random;
    if(dist < 100 && r() < dt*6) use(E,1,ang,false);
    else if(r() < dt*(1+3*sk)) use(E,2,ang+err,false);
    if(r() < dt*.5*sk) use(E,4,ang+err,false);
    if(r() < dt*.25*sk) use(E,3,ang,false);
    if(r() < dt*.3*sk) use(E,0,ang+1.57,false);
  }
  for(const f of [P,E]){                         // tiempos de cada uno
    for(let i=0;i<5;i++) f.cd[i] = Math.max(0, f.cd[i]-dt);
    f.en = Math.min(100, f.en + 12*dt); f.buff -= dt; f.dash -= dt; f.at += dt; f.lock -= dt;
    if(!f.dead && f.lock <= 0){ const w = f.mv ? 'Walk' : 'Idle'; if(f.act !== w){ f.act = w; f.at = 0; } }
  }
  for(const s of g.shots){                       // proyectiles
    s.x += s.vx*dt; s.y += s.vy*dt; s.life -= dt;
    const T = foe(s.mine);
    if(!T.dead && Math.hypot(s.x-T.x, s.y-T.y) < 30 + s.r){ hit(T, null, s.dmg, s.type); s.life = 0; }
    if(s.x<0 || s.x>W || s.y<0 || s.y>H) s.life = 0;
  }
  g.shots = g.shots.filter(s => s.life > 0);
  g.pops.forEach(p => p.t -= dt); g.pops = g.pops.filter(p => p.t > 0);

  if(E.dead){ E.dt += dt; if(E.dt > 1){ const n = g.e.findIndex(f=>!f.dead); if(n<0) return endBattle(true);  g.e[n].x=E.x; g.e[n].y=E.y; g.ei=n; g.shots=[]; } }
  if(P.dead){ P.dt += dt; if(P.dt > 1){ const n = g.p.findIndex(f=>!f.dead); if(n<0) return endBattle(false); g.p[n].x=P.x; g.p[n].y=P.y; g.pi=n; g.shots=[]; } }
}

function switchMon(i){
  if(!g || g.over || g.count > 0) return;
  if(i === undefined){ for(let k=1;k<=3;k++){ const j=(g.pi+k)%3; if(!g.p[j].dead){ i=j; break; } } }
  if(i===undefined || g.p[i].dead || i===g.pi || g.p[g.pi].dead) return;
  const o = g.p[g.pi]; g.pi = i; g.p[i].x = o.x; g.p[i].y = o.y;
}

/* =====================================================================
   5) DIBUJO
   ===================================================================== */
function bar(x,y,w,h,v,max,col){
  ctx.fillStyle = '#0009'; ctx.fillRect(x,y,w,h);
  ctx.fillStyle = col; ctx.fillRect(x,y,w*Math.max(0,v/max),h);
}
function drawF(f, col){
  ctx.fillStyle = '#0006'; ctx.beginPath(); ctx.ellipse(f.x, f.y+36, 30, 9, 0, 0, 7); ctx.fill();
  if(f.buff > 0){ ctx.strokeStyle = '#c07bff'; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(f.x, f.y+36, 38, 12, 0, 0, 7); ctx.stroke(); }
  if(!drawFrame(ctx, f.m.dex, f.act, f.at, f.dir, f.x, f.y, ESCALA)){   // sin sprite: círculo
    ctx.fillStyle = TC[f.m.type]; ctx.beginPath(); ctx.arc(f.x, f.y, 30, 0, 7); ctx.fill();
    ctx.fillStyle = '#111'; ctx.font = 'bold 24px sans-serif'; ctx.textAlign = 'center'; ctx.fillText(f.m.name[0], f.x, f.y+8);
  }
  if(!f.dead) bar(f.x-32, f.y-72, 64, 7, f.hp, f.max, col);
}
function hud(x, list, idx, col){
  const f = list[idx];
  ctx.fillStyle = '#14234acc'; ctx.fillRect(x,10,330,76); ctx.strokeStyle = col; ctx.lineWidth = 3; ctx.strokeRect(x,10,330,76);
  ctx.fillStyle = '#fff'; ctx.font = 'bold 16px monospace'; ctx.textAlign = 'left'; ctx.fillText(f.m.name.toUpperCase(), x+12, 32);
  ctx.fillStyle = TC[f.m.type]; ctx.fillRect(x+240,18,78,16);
  ctx.fillStyle = '#111'; ctx.font = 'bold 10px monospace'; ctx.textAlign = 'center'; ctx.fillText(f.m.type.toUpperCase(), x+279, 30);
  bar(x+12,40,306,12,f.hp,f.max,'#4ccf6a');
  ctx.fillStyle = '#fff'; ctx.font = '11px monospace'; ctx.textAlign = 'right'; ctx.fillText(`${Math.ceil(f.hp)}/${Math.ceil(f.max)}`, x+318, 68);
  bar(x+12,72,220,6,f.en,100,'#4fb3ff');
  list.forEach((u,i)=>{
    const px = x + i*52, py = 94;
    ctx.fillStyle = '#14234acc'; ctx.fillRect(px,py,46,46);
    ctx.strokeStyle = i===idx ? '#ffcc33' : '#2c4a7c'; ctx.lineWidth = 2; ctx.strokeRect(px,py,46,46);
    ctx.globalAlpha = u.dead ? .35 : 1; drawFrame(ctx, u.m.dex, 'Idle', 0, 0, px+23, py+20, 1);
    bar(px+3, py+39, 40, 4, u.hp, u.max, '#4ccf6a'); ctx.globalAlpha = 1;
  });
}
function draw(){
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle = '#2b2430'; ctx.fillRect(0,0,W,H);
  if(!g) return;
  const P = g.p[g.pi], E = g.e[g.ei];
  ctx.fillStyle = TC[E.m.type] + '2a'; ctx.fillRect(0,0,W,H);          // el suelo toma el color del rival
  ctx.strokeStyle = '#ffffff30'; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(W/2,100); ctx.lineTo(W/2,H-60); ctx.stroke();
  ctx.beginPath(); ctx.arc(W/2,H/2+10,150,0,7); ctx.stroke();
  ctx.beginPath(); ctx.arc(W/2,H/2+10,45,0,7); ctx.stroke();

  [[P,'#4ccf6a'],[E,'#ff5a5a']].sort((a,b)=>a[0].y-b[0].y).forEach(([f,c]) => drawF(f,c));
  g.shots.forEach(s=>{
    ctx.fillStyle = TC[s.type]; ctx.shadowColor = TC[s.type]; ctx.shadowBlur = 14;
    ctx.beginPath(); ctx.arc(s.x,s.y,s.r,0,7); ctx.fill(); ctx.shadowBlur = 0;
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke();
  });
  if(!P.dead){                                                         // cruz de puntería
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.beginPath();
    ctx.moveTo(mouse.x-10,mouse.y); ctx.lineTo(mouse.x+10,mouse.y); ctx.moveTo(mouse.x,mouse.y-10); ctx.lineTo(mouse.x,mouse.y+10); ctx.stroke();
  }
  g.pops.forEach(p=>{ ctx.fillStyle = '#ffe066'; ctx.font = 'bold 18px monospace'; ctx.textAlign = 'center'; ctx.fillText(p.txt, p.x, p.y - (1-p.t)*20); });

  hud(10, g.p, g.pi, '#3a7bff'); hud(W-340, g.e, g.ei, '#ff4a5a');
  const s = g.clock | 0;
  ctx.fillStyle = '#14234acc'; ctx.fillRect(W/2-60,8,120,44);
  ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.font = 'bold 20px monospace';
  ctx.fillText(`${(s/60|0)}:${String(s%60).padStart(2,'0')}`, W/2, 30);
  ctx.font = '11px monospace'; ctx.fillText(g.o.label, W/2, 46);
  if(g.count > 0){ ctx.font = 'bold 90px monospace'; ctx.fillStyle = '#ffcc33'; ctx.fillText(Math.ceil(g.count), W/2, H/2+30); }

  MV.forEach((m,i)=>{                                                  // barra de ataques
    const x = W/2 - 270 + i*110, y = H-56, ready = P.cd[i] <= 0 && P.en >= m.en;
    ctx.fillStyle = ready ? (i===0 ? '#8a9a7a' : i===3 ? '#8a5cff' : TC[P.m.type]) : '#2a3350';
    ctx.fillRect(x,y,102,44);
    ctx.fillStyle = '#0006'; ctx.fillRect(x, y, 102 * (P.cd[i] / m.cd), 44);
    ctx.fillStyle = ready ? '#111' : '#8fa0c8'; ctx.textAlign = 'center';
    ctx.font = 'bold 14px monospace'; ctx.fillText(m.n.toUpperCase(), x+51, y+27);
    ctx.font = '10px monospace'; ctx.fillText(m.key + (m.en ? ' · ' + m.en : ''), x+51, y+39);
  });
}

let last = performance.now();
function loop(now){
  const dt = Math.min(.05, (now-last)/1000); last = now;
  update(dt); draw(); requestAnimationFrame(loop);
}

/* =====================================================================
   6) TORRE DE BATALLA Y GIMNASIOS
   ===================================================================== */
function towerFight(n){
  startBattle({mode:'tower', label:'Torre · piso '+(n+1), enemies:[1,2,3].map(()=>rnd(ROSTER).dex),
    hm:1+n*.08, dm:1+n*.05, skill:Math.min(1,.4+n*.05), n});
}
function gymFight(i){
  const L = LEADERS[i];
  startBattle({mode:'gym', label:L.name, enemies:[1,2,3].map(()=>rnd(ROSTER).dex), ft:L.type,
    hm:1+i*.12, dm:1+i*.08, skill:Math.min(1,.5+i*.07), gym:i});
}
function endBattle(won){
  g.over = true;
  const o = g.o, b = document.getElementById('rBtns'); b.innerHTML = '';
  const add = (t,fn,main)=>{ const x = document.createElement('button'); x.textContent = t; if(main) x.className = 'main'; x.onclick = fn; b.appendChild(x); };
  const set = (t,p)=>{ document.getElementById('rTitle').textContent = t; document.getElementById('rText').textContent = p; };
  if(o.mode === 'tower'){
    if(won){ set('¡Piso '+(o.n+1)+' superado!','El siguiente rival será más fuerte.');
      if(o.n+1 > save.record){ save.record = o.n+1; persist(); }
      add('Siguiente piso', ()=>towerFight(o.n+1), true);
    }else{ set('Has caído en el piso '+(o.n+1),'Tu récord: '+save.record+' pisos.'); add('Reintentar torre', ()=>towerFight(0), true); }
  }else{
    const L = LEADERS[o.gym];
    if(won){ if(!save.badges.includes(o.gym)) save.badges.push(o.gym); persist(); set('¡Has vencido a '+L.name+'!','Medalla conseguida.'); }
    else{ set(L.name+' te ha derrotado','Prueba otro equipo o inténtalo otra vez.'); add('Reintentar', ()=>gymFight(o.gym), true); }
  }
  add('Menú', ()=>{ g = null; buildMenu(); show('menu'); });
  setTimeout(()=>show('result'), 900);
}

/* =====================================================================
   7) MENÚS Y CONTROLES
   ===================================================================== */
const $ = id => document.getElementById(id);
function show(w){ $('menu').classList.toggle('hide', w!=='menu'); $('result').classList.toggle('hide', w!=='result'); }

const thumbs = [];
function buildMenu(){
  const r = $('roster'); r.innerHTML = ''; thumbs.length = 0;
  ROSTER.forEach(m=>{
    const d = document.createElement('div'); d.className = 'card' + (team.includes(m.dex) ? ' sel' : '');
    const c = document.createElement('canvas'); c.width = c.height = 48; d.appendChild(c);
    d.append(m.name); thumbs.push({c, m});
    d.onclick = ()=>{
      if(team.includes(m.dex)) team = team.filter(x => x !== m.dex);
      else{ team.push(m.dex); if(team.length > 3) team.shift(); }
      persist(); buildMenu();
    };
    r.appendChild(d);
  });
  $('record').textContent = ' Récord: ' + save.record + ' pisos';
  $('btnTower').disabled = team.length < 3;
  const gy = $('gyms'); gy.innerHTML = '';
  LEADERS.forEach((L,i)=>{
    const b = document.createElement('button'); b.className = 'gym' + (save.badges.includes(i) ? ' done' : '');
    b.textContent = (save.badges.includes(i) ? '★ ' : '') + L.name + ' (' + L.type + ')';
    b.disabled = team.length < 3; b.onclick = ()=>gymFight(i); gy.appendChild(b);
  });
}
setInterval(()=>{                                   // dibuja las miniaturas cuando cargan los sprites
  if($('menu').classList.contains('hide')) return;
  thumbs.forEach(({c,m})=>{
    const x = c.getContext('2d'); x.clearRect(0,0,48,48);
    if(!drawFrame(x, m.dex, 'Idle', 0, 0, 24, 24, 1.2)){ x.fillStyle = TC[m.type]; x.beginPath(); x.arc(24,24,18,0,7); x.fill(); }
  });
}, 400);
$('btnTower').onclick = ()=>towerFight(0);

addEventListener('keydown', e=>{
  keys[e.code] = true;
  if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code) && g) e.preventDefault();
  if(e.code==='KeyR') switchMon();
  if(e.code==='Digit1') switchMon(0); if(e.code==='Digit2') switchMon(1); if(e.code==='Digit3') switchMon(2);
});
addEventListener('keyup', e=> keys[e.code] = false);
addEventListener('blur', ()=>{ for(const k in keys) keys[k] = false; mouse.l = mouse.r = false; });
function setMouse(e){ const r = cv.getBoundingClientRect(); mouse.x = (e.clientX-r.left)*W/r.width; mouse.y = (e.clientY-r.top)*H/r.height; }
cv.addEventListener('mousemove', setMouse);
cv.addEventListener('mousedown', e=>{ setMouse(e); if(e.button===0) mouse.l = true; if(e.button===2) mouse.r = true; });
addEventListener('mouseup', e=>{ if(e.button===0) mouse.l = false; if(e.button===2) mouse.r = false; });
cv.addEventListener('contextmenu', e=>e.preventDefault());

buildMenu(); show('menu'); requestAnimationFrame(loop);
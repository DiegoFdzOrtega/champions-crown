"use strict";
/* =====================================================================
   12) REGALOS PARA QUE EL PRINCIPIO SEA MÁS RÁPIDO
     1) REGALO DE BIENVENIDA: 10 tickets, una sola vez, al crear una partida NUEVA (las partidas que ya existían no lo reciben).
     2) LOGIN DIARIO de 7 días: cada día distinto que entras puedes reclamar el regalo del día (botón «Recompensa diaria» del menú).
        Si entras días seguidos, avanzas por el ciclo; si te saltas un día, empiezas otra vez en el día 1. Tras el día 7, vuelve al día 1.
     3) PRIMERA VICTORIA DEL DÍA: los tickets de la primera victoria de cada día (Historia o Campo) se DUPLICAN. Lo aplica giveReward() (teams.js).
   TODO se cambia en la tabla DAILY de aquí abajo. La fecha es la del reloj del ordenador (día local, cambia a medianoche).
   Se guarda en save.welcome (1 = ya recibido), save.login = {streak, last} y save.firstWin (fecha de la última victoria con bonus).
   ===================================================================== */
const DAILY = {
  welcome:  {tickets:10},
  days: [                                           // el ciclo de 7 días (día 7 = el premio gordo)
    {tickets:2,  bp:50},
    {tickets:2,  bp:50},
    {tickets:3,  bp:50},
    {tickets:3,  bp:50},
    {tickets:4,  bp:50},
    {tickets:4,  bp:50},
    {tickets:10, ticketsL:1, bp:150}
  ],
  firstWinMult: 2                                   // multiplicador de tickets en la primera victoria del día
};

// ---- Fechas (día local, 'AAAA-MM-DD') ----
const dayKey = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const dayDiff = (a, b) => Math.round((new Date(b + 'T12:00:00') - new Date(a + 'T12:00:00')) / 86400000);   // días entre dos fechas
const dailyText = r => [r.tickets ? `${r.tickets} ticket${r.tickets > 1 ? 's' : ''}` : '', r.ticketsL ? `${r.ticketsL} legendario${r.ticketsL > 1 ? 's' : ''}` : '', r.bp ? `${r.bp} BP` : ''].filter(Boolean).join(' + ');
function dailyGive(r){ save.tickets += r.tickets || 0; save.ticketsL += r.ticketsL || 0; save.bp += r.bp || 0; }

// ---- 1) Bienvenida ----
function welcomeGift(){
  if(save.welcome) return false;
  save.welcome = 1; dailyGive(DAILY.welcome); persist(); if(typeof refreshHud === 'function') refreshHud();
  toast(`🎁 ¡Bienvenido! Regalo de bienvenida: +${dailyText(DAILY.welcome)}`); if(typeof Sfx !== 'undefined') Sfx.play('logro');
  return true;
}

// ---- 2) Login diario ----
function dailyState(){                              // qué toca hoy: {pending, idx (0-6 = día del ciclo)}
  const today = dayKey(), L = save.login;
  if(L.last === today) return {pending:false, idx:Math.max(0, (L.streak - 1) % 7), today};
  if(L.last && dayDiff(L.last, today) === 1) return {pending:true, idx:L.streak % 7, today};     // sigues la racha
  return {pending:true, idx:0, today};                                                          // primera vez o te saltaste un día: día 1
}
function dailyClaim(){
  const s = dailyState(); if(!s.pending) return false;
  const streak = (s.idx === 0 ? 0 : save.login.streak) + 1;
  save.login = {streak, last:s.today}; dailyGive(DAILY.days[s.idx]); persist();
  if(typeof refreshHud === 'function') refreshHud();
  toast(`🎁 Día ${s.idx + 1} de 7 · +${dailyText(DAILY.days[s.idx])}`); if(typeof Sfx !== 'undefined') Sfx.play('logro');
  return true;
}
function dailyRefresh(){                            // muestra u oculta el botón del menú
  const b = document.getElementById('dailyBtn'); if(!b) return;
  const s = dailyState(); b.classList.toggle('hide', !s.pending);
  if(s.pending) b.textContent = `🎁 Recompensa diaria · Día ${s.idx + 1}/7`;
}
function dailyClose(){ const o = document.getElementById('dailyOv'); if(o) o.remove(); }
function openDaily(){
  dailyClose(); const s = dailyState(), o = document.createElement('div'); o.id = 'dailyOv'; o.className = 'dlOv';
  const cards = DAILY.days.map((r, i) => {
    const st = i < s.idx || (i === s.idx && !s.pending) ? 'done' : i === s.idx ? 'today' : '';
    return `<div class="dlc ${st}${i === 6 ? ' big' : ''}"><b>Día ${i + 1}</b><span>${dailyText(r).replace(/ \+ /g, '<br>+ ')}</span><em>${st === 'done' ? '✓' : st === 'today' ? '¡HOY!' : ''}</em></div>`;
  }).join('');
  o.innerHTML = `<div class="dlBox"><button class="dlx" id="dailyX" aria-label="Cerrar">✕</button><h2>Recompensa diaria</h2>
    <p class="help">Entra cada día para ganar tickets. Si te saltas un día, la racha vuelve al día 1.</p><div class="dlg">${cards}</div>
    ${s.pending ? '<button class="main" id="dailyGo">Reclamar</button>' : '<p class="help">Hoy ya la has reclamado. ¡Vuelve mañana!</p>'}</div>`;
  document.body.appendChild(o);
  document.getElementById('dailyX').onclick = dailyClose; o.onclick = e => { if(e.target === o) dailyClose(); };
  const go = document.getElementById('dailyGo'); if(go) go.onclick = () => { dailyClaim(); openDaily(); dailyRefresh(); };
}
addEventListener('keydown', e => { if(e.code === 'Escape' && document.getElementById('dailyOv')){ dailyClose(); e.stopImmediatePropagation(); } }, true);

// ---- 3) Primera victoria del día: tickets x2 (lo llama giveReward en teams.js solo si la recompensa lleva tickets) ----
function firstWinToday(){
  const today = dayKey(); if(save.firstWin === today) return false;
  save.firstWin = today; return true;
}

// ---- Arranque: bienvenida y aviso del login diario ----
setTimeout(() => {
  welcomeGift();
  const b = document.getElementById('dailyBtn'); if(b) b.onclick = openDaily;
  dailyRefresh();
  if(dailyState().pending) setTimeout(() => toast('🎁 ¡Tienes tu recompensa diaria! Pulsa el botón del menú'), welcomeGift.done ? 0 : 1800);
}, 1100);

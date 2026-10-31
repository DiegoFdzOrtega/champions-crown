"use strict";
/* =====================================================================
   REGALOS DE LA CUENTA (tickets, BP...): tú los apuntas en Supabase y el jugador los recibe al entrar.
   Cómo funciona (el SQL está en el README, apartado «Regalos»):
     1) En Supabase hay una tabla "gifts" (user_id, bp, tickets, tickets_l, note, claimed_at). Solo se rellena desde el SQL Editor (tú):
        el juego NO puede crear ni cambiar regalos, así que nadie puede regalarse nada a sí mismo.
     2) Al iniciar sesión (y cada vez que vuelves al menú, como mucho cada 90 s) el juego llama a la función claim_gifts().
        Esa función marca como «cobrados» los regalos de ESA cuenta y los devuelve, todo de una vez (nunca se cobra dos veces).
     3) Los regalos cobrados se guardan primero en una cola en este navegador (arena2d_giftq) y después se suman a la partida.
        Así, si se cierra la pestaña justo en medio, el regalo no se pierde: se aplica la próxima vez.
     4) Sale la ventana «¡Has recibido un regalo!» con lo que te han dado.
   Los números se limpian aquí otra vez (enteros entre 0 y GIFT_MAX por regalo) por si algún día llegara algo raro.
   ===================================================================== */
const GIFT_Q = 'arena2d_giftq';                   // localStorage: regalos ya cobrados en la nube pero aún no sumados a la partida
const GIFT_SEEN = 'arena2d_giftseen';             // localStorage: ids de los últimos 50 regalos ya sumados (por si la nube repitiera alguno)
const GIFT_MAX = 1000000;                         // tope por regalo y por tipo (evita errores de escritura en el SQL)
const GIFT_EVERY = 90000;                         // ms mínimos entre dos comprobaciones al volver al menú
const gift = {busy:false, last:0};

const giftNum = v => Math.min(GIFT_MAX, Math.max(0, Math.floor(Number(v)) || 0));
const giftFmt = n => n.toLocaleString('es-ES');
const giftClean = g => ({id:String((g && g.id) || '').slice(0, 40), bp:giftNum(g && g.bp), tickets:giftNum(g && g.tickets), ticketsL:giftNum(g && (g.tickets_l != null ? g.tickets_l : g.ticketsL)), note:String((g && g.note) || '').slice(0, 80)});
function giftQGet(){ try{ const q = JSON.parse(localStorage.getItem(GIFT_Q) || '[]'); return Array.isArray(q) ? q : []; }catch(e){ return []; } }
function giftSeenGet(){ try{ const q = JSON.parse(localStorage.getItem(GIFT_SEEN) || '[]'); return Array.isArray(q) ? q : []; }catch(e){ return []; } }
function giftQSet(q){ try{ if(q.length) localStorage.setItem(GIFT_Q, JSON.stringify(q)); else localStorage.removeItem(GIFT_Q); }catch(e){} }

// Suma a la partida lo que haya en la cola y enseña la ventana. (Si se está cambiando la partida por la de la nube, espera a la siguiente carga.)
function giftApplyQ(){
  if(typeof cloud !== 'undefined' && cloud.lock) return;
  const q = giftQGet().map(giftClean); if(!q.length) return;
  const tot = {bp:0, tickets:0, ticketsL:0}, notes = [];
  q.forEach(g => { tot.bp += g.bp; tot.tickets += g.tickets; tot.ticketsL += g.ticketsL; if(g.note) notes.push(g.note); });
  save.bp += tot.bp; save.tickets += tot.tickets; save.ticketsL += tot.ticketsL;
  persist(); giftQSet([]);                                                                         // primero se guarda la partida, después se vacía la cola
  try{ localStorage.setItem(GIFT_SEEN, JSON.stringify(giftSeenGet().concat(q.map(g => g.id).filter(Boolean)).slice(-50))); }catch(e){}
  if(typeof refreshHud === 'function') refreshHud();
  giftShow(tot, notes);
}

async function cloudGifts(){
  if(gift.busy || typeof cloud === 'undefined' || !cloud.ok || !cloud.user || cloud.lock || cloud.conflict || cloud.needName) return;
  gift.busy = true; gift.last = Date.now();
  try{
    giftApplyQ();                                                                                  // restos de una vez anterior
    const {data, error} = await cloud.sb.rpc('claim_gifts');
    if(error || !Array.isArray(data) || !data.length) return;                                      // sin tabla o sin regalos: no pasa nada
    const q = giftQGet(), ids = new Set(q.map(x => x.id).concat(giftSeenGet()));                  // ya en cola o ya sumados: no se repiten
    data.forEach(g => { const c = giftClean(g); if(!c.id || !ids.has(c.id)) q.push(c); });
    giftQSet(q); giftApplyQ();
  }catch(e){}
  finally{ gift.busy = false; }
}
function cloudGiftsCheck(){ if(Date.now() - gift.last > GIFT_EVERY) cloudGifts(); }                // lo llama goMain (menu.js)

// ---- Ventana «¡Has recibido un regalo!» ----
function giftIcon(c){                                                                              // caja de regalo en pixel art (16x16)
  c.width = c.height = 16; const x = c.getContext('2d'), r = (col, a, b, w, h) => { x.fillStyle = col; x.fillRect(a, b, w, h); };
  r('#0a0d14', 1, 4, 14, 3); r('#ff3ea5', 2, 5, 12, 1); r('#0a0d14', 2, 7, 12, 8); r('#e23b8d', 3, 8, 10, 6);          // tapa y caja
  r('#ffcc33', 7, 4, 2, 11); r('#ffcc33', 2, 10, 12, 1);                                                                // cintas
  r('#ffcc33', 4, 1, 3, 3); r('#ffcc33', 9, 1, 3, 3); r('#0a0d14', 5, 2, 1, 1); r('#0a0d14', 10, 2, 1, 1);             // lazo
}
function giftShow(t, notes){
  const old = document.getElementById('giftOv'); if(old) old.remove();
  const o = document.createElement('div'); o.id = 'giftOv'; o.className = 'dlOv';
  const row = (id, txt) => `<div class="gf-row"><canvas id="${id}"></canvas><b>${txt}</b></div>`;
  const rows = (t.bp ? row('gfCoin', `+${giftFmt(t.bp)} <small>Puntos de Batalla</small>`) : '') + (t.tickets ? row('gfTk', `+${giftFmt(t.tickets)} <small>Tickets de Gachapon</small>`) : '') + (t.ticketsL ? row('gfTkL', `+${giftFmt(t.ticketsL)} <small>Tickets legendarios</small>`) : '');
  o.innerHTML = `<div class="dlBox gfBox"><canvas id="gfIcon" class="gf-icon"></canvas><h2>¡Has recibido un regalo!</h2>
    ${notes.length ? `<p class="gf-note">${notes.map(n => cloudEsc(n)).join(' · ')}</p>` : ''}<div class="gf-rows">${rows}</div>
    <button class="main" id="giftOk">Aceptar</button></div>`;
  document.body.appendChild(o);
  giftIcon(document.getElementById('gfIcon'));
  if(typeof ICONS !== 'undefined' && typeof bitmap === 'function'){
    const a = document.getElementById('gfCoin'), b = document.getElementById('gfTk'), c = document.getElementById('gfTkL');
    if(a) bitmap(a, ICONS.coin, '#ffcc33'); if(b) bitmap(b, ICONS.ticket, '#ff3ea5'); if(c) bitmap(c, ICONS.ticket, '#ffcc33');
  }
  const close = () => { o.remove(); };
  document.getElementById('giftOk').onclick = close; o.onclick = e => { if(e.target === o) close(); };
  if(typeof Sfx !== 'undefined') Sfx.play('logro');
}
addEventListener('keydown', e => {                                                                  // Esc o Enter la cierran
  const o = document.getElementById('giftOv'); if(o && (e.code === 'Escape' || e.code === 'Enter')){ o.remove(); e.stopImmediatePropagation(); e.preventDefault(); }
}, true);

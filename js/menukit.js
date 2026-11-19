"use strict";
/* =====================================================================
   MENÚ CON EL KIT DE GEMINI: los marcos (assets/menu/ui/, ver css/menukit.css) y los iconos (assets/menu/ic/) del menú principal.
   Pone los iconos nuevos en los cuadros, en los botones de arriba, en las monedas, en la recompensa diaria.
   Las monedas llevan un «+»: la de Puntos de Batalla abre la Tienda y la de tickets el Gachapon.
   MKIT.on = false lo quita y vuelve todo como antes.
   ===================================================================== */
const MKIT = {on: true};
const MKIT_IC = k => 'assets/menu/ic/' + k + '.webp?v=1';
if(MKIT.on && typeof MM_HEAD !== 'undefined'){
  Object.assign(MM_HEAD, {story: MKIT_IC('historia'), rank: MKIT_IC('clasificatoria'), campo: MKIT_IC('entrenamiento'), tower: MKIT_IC('torre'),
    team: MKIT_IC('equipo'), dex: MKIT_IC('pokedex'), gacha: MKIT_IC('gachapon'), inv: MKIT_IC('invocacion'), shop: MKIT_IC('tienda')});
}
const MKIT_TOP = {profile: 'perfil', ach: 'logros', friends: 'amigos', bag: 'mochila', account: 'cuenta', guide: 'guia', set: 'ajustes'};
function mkitDecor(){
  const m = $('main'); if(!m || !MKIT.on) return;
  m.classList.add('mkit');
  m.querySelectorAll('#mm2 .m2-ic button[data-k]').forEach(b => { const k = MKIT_TOP[b.dataset.k]; const s = b.querySelector('svg'); if(k && s){ const i = new Image(); i.className = 'mk'; i.alt = ''; i.src = MKIT_IC(k); s.replaceWith(i); } });
  const cur = m.querySelectorAll('#mm2 .m2-cur > span');
  [['moneda', 'shop'], ['ticket', 'gacha']].forEach(([ic, go], i) => { const s = cur[i]; if(!s) return; const im = s.querySelector('img'); if(im) im.src = MKIT_IC(ic);
    s.dataset.mm = 'go'; s.dataset.k = go; s.title = go === 'shop' ? 'Tienda' : 'Gachapon'; });
  const gift = m.querySelector('#mm2 .m2-daily .gift'); if(gift) gift.innerHTML = `<img src="${MKIT_IC('regalo')}" alt="">`;
}
if(typeof mmRender === 'function'){ const _mmRender = mmRender; mmRender = function(){ _mmRender.apply(this, arguments); try{ mkitDecor(); }catch(e){} }; }

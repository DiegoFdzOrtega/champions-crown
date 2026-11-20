"use strict";
/* =====================================================================
   MENÚ DE PAUSA MEJORADO (la base sigue en js/modes.js · pauseBattle):
   - A la izquierda: tu equipo y el del rival, con su sprite, su vida y su estado (los rivales que aún no han salido se ven como «?»).
   - A la derecha: los botones de siempre, el volumen de la música de combate y de los efectos, y los controles.
   ===================================================================== */
const PZ_ST = {par: ['PAR', '#f8d030'], psn: ['ENV', '#a040a0'], brn: ['QUE', '#f08030'], slp: ['DOR', '#8fb0ff'], frz: ['CON', '#98d8d8']};
function pzMon(f, cur, rival, seen){
  if(!seen) return `<div class="pz-m unk"><span class="pz-sp">?</span><div class="pz-mi"><b>???</b><i class="pz-hp"><s style="width:100%"></s></i></div></div>`;
  const hp = Math.max(0, f.hp / f.max), col = hp > .5 ? '#4ccf6a' : hp > .2 ? '#ffcc33' : '#e8503a', st = f.st && PZ_ST[f.st.k];
  return `<div class="pz-m${f.dead ? ' ko' : ''}${cur ? ' cur' : ''}" title="${esc(f.m.name)} · ${Math.ceil(f.hp)}/${Math.round(f.max)} PS">
    <canvas class="pz-sp" width="48" height="48" data-d="${f.m.dex}" data-s="${f.shiny ? 1 : 0}"></canvas>
    <div class="pz-mi"><b>${esc(f.m.name)}${cur ? ' <em>EN CAMPO</em>' : ''}${st ? ` <u style="background:${st[1]}">${st[0]}</u>` : ''}${f.dead ? ' <u class="ko">K.O.</u>' : ''}</b>
      <i class="pz-hp"><s style="width:${hp * 100}%;background:${col}"></s></i></div>
    <span class="pz-ty">${(f.m.types || []).map(t => typeof tIco === 'function' ? tIco(t, 'pz-ti') : '').join('')}</span></div>`;
}
function pzTeamsDraw(){
  const el = $('pzTeams'); if(!el || !g) return;
  const me = g.p, rv = g.e, pi = g.pi, ei = g.ei;
  el.innerHTML = `<div class="pz-side"><h3>Tu equipo <small>${me.filter(f => !f.dead).length}/${me.length}</small></h3>${me.map((f, i) => pzMon(f, i === pi, false, true)).join('')}</div>
    <div class="pz-side rv"><h3>${esc((g.o && (g.o.leaderName || g.o.title)) || 'Rival')} <small>${rv.filter(f => !f.dead).length}/${rv.length}</small></h3>${rv.map((f, i) => pzMon(f, i === ei, true, f.dead || i <= ei || f.pzSeen)).join('')}</div>`;
  rv.forEach((f, i) => { if(i <= ei) f.pzSeen = 1; });
  el.querySelectorAll('canvas[data-d]').forEach(c => { try{ paintSprite(c, +c.dataset.d, {sc: 1, fit: 44, shiny: c.dataset.s === '1'}); }catch(e){} });
}
function pzExtraDraw(){
  const el = $('pzExtra'); if(!el) return;
  const v = k => save[k] == null ? 70 : save[k];
  el.innerHTML = `<div class="pz-vol"><label><i class="nota"></i>Música <span class="pk-sl" style="--p:${v('volBattle')}%"><s></s><input type="range" min="0" max="100" value="${v('volBattle')}" data-v="b"></span><b>${v('volBattle')}</b></label>
      <label><i class="brillo"></i>Efectos <span class="pk-sl" style="--p:${v('volSfx')}%"><s></s><input type="range" min="0" max="100" value="${v('volSfx')}" data-v="s"></span><b>${v('volSfx')}</b></label></div>
    <div class="pz-keys"><h4>Controles</h4>
      <span><kbd>Clic izq.</kbd>Golpe</span><span><kbd>Clic dcho.</kbd>Disparo</span><span><kbd>Q</kbd>Mejora</span><span><kbd>E</kbd>Fuerte (mantén = más)</span>
      <span><kbd>Espacio</kbd>Carrera</span><span><kbd>1-6</kbd>Cambiar</span><span><kbd>M</kbd>Sonido</span><span><kbd>Esc</kbd>Pausa</span></div>`;
  el.querySelectorAll('input[type=range]').forEach(r => r.oninput = () => { const n = +r.value; r.parentNode.nextElementSibling.textContent = n; r.parentNode.style.setProperty('--p', n + '%');
    if(r.dataset.v === 'b') Music.setBattleVolume(n); else { Music.setSfxVolume(n); if(typeof Sfx !== 'undefined') Sfx.play('swing', .6); } });
}
if(typeof pauseBattle === 'function'){ const o = pauseBattle; pauseBattle = function(on){ const r = o.apply(this, arguments); try{ if(on && g && !g.pvp && g.paused){ pzTeamsDraw(); pzExtraDraw(); pzMudo(); } }catch(e){ console.warn('pausa', e); } return r; }; }
// el icono del botón de sonido: altavoz o altavoz tachado (css/pausakit.css)
function pzMudo(){ const b = $('pMus'); if(b) b.classList.toggle('mudo', !!save.mute); }
{ const b = document.getElementById('pMus'); if(b) b.addEventListener('click', () => setTimeout(pzMudo, 0)); }
{ const b = document.getElementById('pGo'); if(b && b.firstChild && b.firstChild.nodeType === 3) b.firstChild.textContent = b.firstChild.textContent.replace('▶', '').trimStart(); }   // el triángulo ya va como icono

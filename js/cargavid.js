"use strict";
/* =====================================================================
   CARGA COMO EN POKÉMON BATTLEGROUNDS (21-11-2026): al cargar la E ya no sale el remolino/bola en la boca o alrededor.
   En su lugar, en el suelo, aros dorados que se van cerrando hacia el Pokémon (cada vez más rápido según carga) y,
   al soltar el ataque, un fogonazo con rayos de luz y un aro que se abre. Como en el vídeo «Gary vs Paul».
   Solo dibujo. CV.on = false vuelve a la carga de antes.
   ===================================================================== */
const CV = {on: true, aros: 3, R: 70, col: '255,214,90', suelta: .35};   // [AJUSTE] nº de aros · radio de salida (px) · color · lo que dura el fogonazo al soltar (s)
// fuera la bola de la boca y el remolino del cuerpo
if(typeof cargaBoca === 'function'){ const o = cargaBoca; cargaBoca = function(){ if(CV.on) return; return o.apply(this, arguments); }; }
if(typeof nvWindFx === 'function'){ const o = nvWindFx; nvWindFx = function(f, w){ if(CV.on && w && !(typeof CARGA !== 'undefined' && CARGA.propias.includes(w.nm))) return; return o.apply(this, arguments); }; }
if(typeof v5ChgTop === 'function'){ const o = v5ChgTop; v5ChgTop = function(){
  if(!CV.on || !g) return o.apply(this, arguments);
  const L = [...g.p, ...g.e].filter(f => f && f.wind && !f.ghost && !(typeof CARGA !== 'undefined' && CARGA.propias.includes(f.wind.nm)));
  L.forEach(f => { f.ghost = true; }); try{ return o.apply(this, arguments); } finally { L.forEach(f => { f.ghost = false; }); } }; }

function cvPie(f){ const b = typeof bodyOf === 'function' ? bodyOf(f) : {foot: f.y + 20}; return b.foot - 2; }
function cvAro(x, y, r, A, w){ if(r <= 2 || A <= 0) return; ctx.save(); ctx.globalAlpha = A; ctx.lineWidth = w; ctx.strokeStyle = `rgb(${CV.col})`;
  ctx.beginPath(); ctx.ellipse(x, y, r, r * .42, 0, 0, 6.283); ctx.stroke(); ctx.globalAlpha = A * .35; ctx.lineWidth = w * 2.6; ctx.stroke(); ctx.restore(); }
function cvDraw(){
  if(!CV.on || !g) return;
  for(const f of [...g.p, ...g.e]){ if(!f || !f.m || f.dead) continue;
    const w = f.wind, x = f.x, y = cvPie(f);
    if(w && !(typeof CARGA !== 'undefined' && CARGA.propias.includes(w.nm))){
      const k = typeof cgK === 'function' ? cgK(w) : .5, vel = 1.1 + 1.6 * k, ready = w.hold ? w.c >= FEEL.wind : k > .3;
      f.cvW = 1; f.cvK = k;
      for(let i = 0; i < CV.aros; i++){ const p = (g.t * vel + i / CV.aros) % 1, r = CV.R * (1 - p) + 14;   // se cierran hacia el Pokémon
        cvAro(x, y, r, (p < .15 ? p / .15 : 1) * (1 - p * .35) * (.55 + .45 * k), ready ? 3 : 2.2); }
      if(ready){ ctx.save(); ctx.globalCompositeOperation = 'lighter'; const gr = ctx.createRadialGradient(x, y, 0, x, y, 34);
        gr.addColorStop(0, `rgba(${CV.col},${.35 + .15 * Math.sin(g.t * 20)})`); gr.addColorStop(1, `rgba(${CV.col},0)`); ctx.fillStyle = gr; ctx.beginPath(); ctx.ellipse(x, y, 34, 15, 0, 0, 6.283); ctx.fill(); ctx.restore(); }
    } else if(f.cvW){ f.cvW = 0; if(f.cvK > .15 || !w) f.cvSuelta = g.t; }
    const u = f.cvSuelta != null ? (g.t - f.cvSuelta) / CV.suelta : 2;
    if(u >= 0 && u < 1){                                                                                // al soltar: rayos y aro que se abre
      const cy = y - 30, A = 1 - u;
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = `rgba(255,240,190,${.55 * A})`; ctx.lineCap = 'round';
      for(let i = 0; i < 14; i++){ const an = i / 14 * 6.283 + (f.cvSuelta * 3) % 1, r0 = 30 + 40 * u, r1 = r0 + 90 + (i % 3) * 30;
        ctx.lineWidth = i % 2 ? 2 : 4; ctx.beginPath(); ctx.moveTo(x + Math.cos(an) * r0, cy + Math.sin(an) * r0 * .7); ctx.lineTo(x + Math.cos(an) * r1, cy + Math.sin(an) * r1 * .7); ctx.stroke(); }
      const gr = ctx.createRadialGradient(x, cy, 0, x, cy, 70); gr.addColorStop(0, `rgba(255,250,220,${.6 * A})`); gr.addColorStop(1, 'rgba(255,250,220,0)'); ctx.fillStyle = gr; ctx.fillRect(x - 70, cy - 70, 140, 140);
      ctx.restore();
      cvAro(x, y, 20 + 90 * (1 - Math.pow(1 - u, 2)), A, 3);
    }
  }
}
if(typeof windDraw === 'function'){ const o = windDraw; windDraw = function(){ const r = o.apply(this, arguments); try{ cvDraw(); }catch(e){} return r; }; }

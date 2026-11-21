"use strict";
/* =====================================================================
   GARRAS COMO EN POKÉMON BATTLEGROUNDS (Garra Metal de Scizor en el vídeo): tres arcos curvos con borde oscuro que
   barren al rival, un impacto en forma de estrella, cuadraditos brillantes que saltan y una sombra oscura redonda en el
   suelo bajo el que recibe. Cada garra con su color. Sustituye al dibujo de antes de esas garras (que queda de reserva).
   Solo dibujo. GBG.on = false vuelve al de antes.
   ===================================================================== */
const GBG = {on: true, R: 54, ini: .06, fin: .36, estrella: 38, cuadros: 10};    // [AJUSTE] tamaño de los arcos · cuándo barren (s) · tamaño de la estrella · nº de cuadraditos
const GBG_COL = {                                                                // [relleno claro, relleno, borde]
  'Garra Metal': ['#fff6c4', '#ffcf3a', '#5a3a08'], 'Arañazo': ['#ffffff', '#e4e8f0', '#3a3c48'],
  'Garra Dragón': ['#e8dcff', '#8a6bff', '#28145e'], 'Garra Umbría': ['#e6c8ff', '#6a2a9a', '#1c0a2c'],
  'Furia Cortante': ['#ffffff', '#cfe8a0', '#2c3a10']};
function garCreciente(cx, cy, R, a0, a1, w, C, A){                              // una media luna de a0 a a1 (puntas finas)
  if(Math.abs(a1 - a0) < .02) return; const d = a1 > a0 ? 1 : -1, am = (a0 + a1) / 2;
  ctx.save(); ctx.globalAlpha = A; ctx.beginPath(); ctx.arc(cx, cy, R, a0, a1, d < 0);
  const ix = cx + Math.cos(am) * w, iy = cy + Math.sin(am) * w; ctx.arc(ix, iy, R - w * .4, a1, a0, d > 0); ctx.closePath();
  const gr = ctx.createRadialGradient(cx, cy, R * .6, cx, cy, R); gr.addColorStop(0, C[1]); gr.addColorStop(1, C[0]);
  ctx.fillStyle = gr; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = C[2]; ctx.stroke(); ctx.restore();
}
function garEstrella(x, y, r, A, C, rot){                                        // estrella de 8 puntas con centro blanco
  ctx.save(); ctx.globalAlpha = A; ctx.translate(x, y); ctx.rotate(rot); ctx.beginPath();
  for(let i = 0; i < 16; i++){ const rr = i % 2 ? r * .42 : r * (i % 4 ? .8 : 1), an = i / 16 * 6.283; ctx[i ? 'lineTo' : 'moveTo'](Math.cos(an) * rr, Math.sin(an) * rr); }
  ctx.closePath(); ctx.fillStyle = C[1]; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = C[2]; ctx.stroke();
  ctx.beginPath(); for(let i = 0; i < 16; i++){ const rr = (i % 2 ? r * .2 : r * .5), an = i / 16 * 6.283 + .2; ctx[i ? 'lineTo' : 'moveTo'](Math.cos(an) * rr, Math.sin(an) * rr); }
  ctx.closePath(); ctx.fillStyle = '#ffffff'; ctx.fill(); ctx.restore();
}
function garDib(nombre, viejo){
  return (e, a) => {
    if(!GBG.on) return viejo && (viejo.draw || viejo)(e, a);
    const C = GBG_COL[nombre], x = e.x, y = e.y - 6, ang = e.ang || 0, T = e.T;
    // sombra oscura en el suelo bajo el que recibe
    if(a > GBG.ini && a < .7){ const v = Math.min(1, (a - GBG.ini) / .1) * (a > .5 ? (.7 - a) / .2 : 1); const gy = T && typeof bodyOf === 'function' ? bodyOf(T).foot : y + 24;
      ctx.save(); ctx.globalAlpha = .45 * v; ctx.fillStyle = '#1a120c'; ctx.beginPath(); ctx.ellipse(x, gy, 34, 13, 0, 0, 6.283); ctx.fill(); ctx.restore(); }
    // tres arcos que barren
    const u = (a - GBG.ini) / (GBG.fin - GBG.ini);
    if(u > 0 && u < 1.4){ const p = Math.min(1, u * 1.5), A = u < 1 ? 1 : 1 - (u - 1) / .4, sw = 1.9, base = ang + Math.PI * .75;
      for(let k = -1; k <= 1; k++){ const px = -Math.sin(ang) * k * 13, py = Math.cos(ang) * k * 10, a0 = base, a1 = base + sw * p;
        garCreciente(x + px - Math.cos(ang) * 8, y + py, GBG.R * (k ? .88 : 1), a0, a1, 12, C, A); } }
    // estrella, cuadraditos
    const s = (a - GBG.fin * .7) / .35;
    if(s > 0 && s < 1){ const sc = s < .25 ? s / .25 : 1, A = s < .6 ? 1 : (1 - s) / .4; garEstrella(x + Math.cos(ang) * 6, y, GBG.estrella * (.6 + .5 * sc), A, C, s * 1.2);
      ctx.save(); for(let i = 0; i < GBG.cuadros; i++){ const an = (i / GBG.cuadros) * 6.283 + i * .7, d = 14 + s * (40 + (i * 17) % 23), z = 5 - s * 2;
        ctx.globalAlpha = A; ctx.fillStyle = i % 3 ? C[1] : C[0]; ctx.strokeStyle = C[2]; ctx.lineWidth = 1;
        const qx = x + Math.cos(an) * d, qy = y + Math.sin(an) * d * .8 + s * s * 20; ctx.save(); ctx.translate(qx, qy); ctx.rotate(.785 + s * 3); ctx.fillRect(-z / 2, -z / 2, z, z); ctx.strokeRect(-z / 2, -z / 2, z, z); ctx.restore(); }
      ctx.restore(); }
  };
}
Object.keys(GBG_COL).forEach(n => { if(FXR.melee[n] || n === 'Garra Metal'){ const v = FXR.melee[n]; FXR.melee[n] = garDib(n, v); } });

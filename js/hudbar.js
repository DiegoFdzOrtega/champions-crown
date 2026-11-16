"use strict";
/* =====================================================================
   BARRA DE ABAJO CON LAS PIEZAS DIBUJADAS (assets/iconos/hud/): energía, botones de ataque y megaevolución.
   energia.png = marco de la barra de energía · boton.png = botón de ataque (gris: se tiñe del color del ataque)
   mega.png = botón de megaevolución · base.png = placa de detrás de los botones · tecla.png (de reserva)
   Si alguna pieza no carga, se dibuja la barra de siempre (render.js). HB_ON = false la apaga.
   ===================================================================== */
const HB_ON = true;
const HB = {}; ['energia', 'boton', 'boton_on', 'mega', 'base'].forEach(k => { const im = new Image(); im.onload = () => im.ok = true; im.src = 'assets/iconos/hud/' + k + '.png?v=1'; HB[k] = im; });
const hbOk = () => HB_ON && ['energia', 'boton', 'mega', 'base'].every(k => HB[k].ok);
// huecos de cada pieza (fracciones de su ancho y alto)
const HB_SLOT = {
  enTrough: [.035, .27, .965, .73],          // canal de la barra de energía
  btTab: [.064, .078, .30, .24],             // pestaña de la tecla (arriba a la izquierda)
  btIn: [.04, .07, .96, .70],                // zona oscura del botón
  btStrip: [.06, .76, .94, .88],             // tira de abajo (energía de ese ataque)
  megaRing: [.504, .522, .245]               // centro (x, y) y radio (parte del ancho) del hueco redondo
};
const hbTints = {};
function hbTint(key, col){                                                  // la pieza teñida de un color (se guarda para no repetirlo cada fotograma)
  const k = key + col; if(hbTints[k]) return hbTints[k];
  const im = HB[key], c = document.createElement('canvas'); c.width = im.width; c.height = im.height; const x = c.getContext('2d');
  x.drawImage(im, 0, 0); x.globalCompositeOperation = 'multiply'; x.fillStyle = col; x.fillRect(0, 0, c.width, c.height);
  x.globalCompositeOperation = 'destination-in'; x.drawImage(im, 0, 0);
  return hbTints[k] = c;
}
const hbR = (q, x, y, w, h) => ({x: x + q[0] * w, y: y + q[1] * h, w: (q[2] - q[0]) * w, h: (q[3] - q[1]) * h});

// Devuelve true si la ha dibujado (render.js entonces no dibuja la de siempre). Se llama ya escalada (HUD_SCALE) y con la transparencia puesta.
function hudBarImg(M){
  if(!hbOk() || !M) return false;
  const bw = 104, gap = 8, tw = 5 * bw + 4 * gap + 24, x0 = (W - tw) / 2, y0 = H - 82;
  ctx.save(); ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
  // energía
  { const ey = y0 - 40, eh = 36, T = hbR(HB_SLOT.enTrough, x0, ey, tw, eh);
    ctx.drawImage(HB.energia, x0, ey, tw, eh);
    const fr = Math.max(0, Math.min(1, M.en / 100)), gr = ctx.createLinearGradient(0, T.y, 0, T.y + T.h);
    gr.addColorStop(0, '#9fdcff'); gr.addColorStop(.45, '#4fb3ff'); gr.addColorStop(1, '#2a6fd6');
    ctx.fillStyle = gr; ctx.fillRect(T.x, T.y, T.w * fr, T.h);
    ctx.fillStyle = 'rgba(255,255,255,.25)'; ctx.fillRect(T.x, T.y, T.w * fr, Math.max(1, T.h * .25));
    text('ENERGÍA', T.x + 6, T.y + T.h - 2, 6, fr > .14 ? '#0b1a33' : '#4fb3ff');
    text(String(Math.floor(M.en)), T.x + T.w - 5, T.y + T.h - 2, 7, '#ffffff', 'right');
    [3, 4].forEach(i => { const k = ctlKey(i).slice(0, 4), need = Math.round(enCost(M, i)), mx = T.x + T.w * need / 100, ready = M.en >= need, col = i === 3 ? '#b07bff' : '#ffcc33';
      ctx.fillStyle = col; ctx.fillRect(Math.round(mx) - 1, T.y - 3, 2, T.h + 6);
      const wait = Math.max(0, (need - M.en) / EN_REGEN);
      text(`${k} ${need}` + (ready ? ' ✔' : ` · ${wait.toFixed(1)}s`), mx, ey - 1, 6, ready ? '#9be29b' : col, 'center'); });
  }
  // placa y botones
  ctx.drawImage(HB.base, x0 - 14, y0 - 2, tw + 28, 76);
  const bh = Math.round(bw * HB.boton.height / HB.boton.width);
  MV.forEach((m, i) => {
    const x = x0 + 12 + i * (bw + gap), y = y0 + 36 - bh / 2, cost = Math.round(enCost(M, i));
    const enWait = Math.max(0, (cost - M.en) / EN_REGEN), cdWait = Math.max(0, M.cd[i]), wait = Math.max(enWait, cdWait), ok = wait <= 0;
    const col = i === 0 ? '#9aa6b8' : i === 3 ? '#b07bff' : TC[mtype(M, i)];
    ctx.drawImage(hbTint('boton', ok ? col : '#3a4560'), x, y, bw, bh);
    const In = hbR(HB_SLOT.btIn, x, y, bw, bh), Tb = hbR(HB_SLOT.btTab, x, y, bw, bh), St = hbR(HB_SLOT.btStrip, x, y, bw, bh);
    const kl = ctlKey(i).slice(0, 7);
    { ctx.font = `5px ${FONT}`; const tw0 = ctx.measureText(kl).width, k = Math.min(1, (Tb.w - 6) / tw0);      // la tecla cabe siempre en su pestaña
      ctx.save(); ctx.translate(Tb.x + 2, Tb.y + Tb.h - 1.5); ctx.scale(k, 1); text(kl, 0, 0, 5, '#10141e'); ctx.restore(); }
    const nm = mvName(M, i).toUpperCase();
    text(nm, x + bw / 2, In.y + In.h * .62, nm.length > 10 ? 6 : 7, ok ? '#ffffff' : '#6d7899', 'center');
    if(ok && (i === 1 || i === 2)) text((i === 1 ? meleeKind(M) : shotKind(M)).n.toUpperCase(), x + bw / 2, In.y + In.h * .9, 5, col, 'center');
    if(m.en) text('EN ' + cost, x + bw * .82, Tb.y + Tb.h - 1.5, 5, M.en >= cost ? '#4fb3ff' : '#e8493a', 'right');
    if(m.en){ const fr = Math.min(1, M.en / cost); ctx.fillStyle = fr >= 1 ? '#9be29b' : '#4fb3ff'; ctx.fillRect(St.x + 1, St.y + 1, (St.w - 2) * fr, St.h - 2); }
    if(!ok){ const total = Math.max(m.cd, cost / EN_REGEN, .01);
      ctx.fillStyle = 'rgba(5,7,12,.7)'; ctx.fillRect(In.x, In.y, In.w, In.h * Math.min(1, wait / total));
      text(wait.toFixed(1) + 's', x + bw / 2, In.y + In.h * .9, 7, cdWait >= enWait ? '#ffffff' : '#4fb3ff', 'center'); }
  });
  ctx.restore();
  return true;
}

// Botón de megaevolución con su pieza (mismo sitio y mismo clic que antes: megaBadgeRect en js/mega.js)
{ const o = megaHud; megaHud = function(){
    if(!hbOk()) return o.apply(this, arguments);
    const st = megaBadgeState(); if(!st) return;
    const P = myMon(), r = megaBadgeRect(), t = performance.now() / 1000, hov = megaBadgeAt(mouse.x, mouse.y), ok = st === 'ready';
    hudAt(W / 2, H, () => {
      const h = r.lh + 4, w = h * HB.mega.width / HB.mega.height, x = r.lx + (r.lw - w) / 2, y = r.ly - 2;
      ctx.save(); ctx.imageSmoothingEnabled = true;
      if(!ok) ctx.filter = 'grayscale(1) brightness(.55)';
      else { ctx.shadowColor = hue(t * 180, .9); ctx.shadowBlur = hov ? 18 : 8 + 4 * Math.sin(t * 6); }
      ctx.drawImage(HB.mega, x, y, w, h); ctx.restore();
      const R = HB_SLOT.megaRing, cx = x + w * R[0], cy = y + h * R[1], rr = w * R[2];
      const im = itemImg(P.item);
      if(im && im.ok){ ctx.save(); ctx.imageSmoothingEnabled = false; ctx.globalAlpha = ok ? 1 : .35; ctx.drawImage(im, cx - rr * .8, cy - rr * .8, rr * 1.6, rr * 1.6); ctx.restore(); }
      const mk = ctlShort('mega').slice(0, 4);
      text(mk, x + w * .085, y + h * .19, 6, '#10141e');
      text(ok ? 'MEGA' : st === 'used' ? 'YA USADA' : 'SIN ARO', x + w / 2, y + h * .94, 5, ok ? '#ffd9fb' : '#6d7899', 'center');
    });
  }; }

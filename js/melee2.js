"use strict";
/* =====================================================================
   ATAQUES A MELÉ CON IMÁGENES DE GEMINI (21-11-2026). Cada ataque tiene una hoja de 5 filas x 6 cuadros, recortada en
   assets/objetos/ataques/m/<pre>_<fila>.png:
     carga ... en el puño / delante del Pokémon al empezar el golpe
     estela .. el recorrido del golpe, girado hacia donde pega
     golpe ... el impacto en el rival
     chispas . partículas que salen del impacto
     marca ... la huella en el suelo (dura M2.marca segundos y se va borrando)
   Sustituye al dibujo por código de esos ataques (FXR.melee); si las imágenes aún no han cargado, se ve el de antes.
   Solo dibujo: no cambia nada del combate. M2.on = false lo apaga.
   ===================================================================== */
const M2 = {on: true, marca: 2.6, tam: {carga: 60, estela: 1, golpe: 110, chispas: 130, marca: 84}};   // [AJUSTE] tamaños en px del campo
const M2_ATAQUES = {'Puño Fuego': 'pf', 'Puño Trueno': 'pt', 'Puño Hielo': 'ph', 'Puño Bala': 'pb', 'Placaje': 'pl',
  'Acua Cola': 'ac', 'Látigo Cepa': 'lc', 'Golpe Roca': 'gr', 'Tijera X': 'tx', 'Carantoña': 'ca', 'Cabezazo': 'cb'};
const M2_FILAS = ['carga', 'estela', 'golpe', 'chispas', 'marca'];
const M2_IMG = {};
Object.values(M2_ATAQUES).forEach(pre => M2_FILAS.forEach(fl => {
  const im = new Image(); im.onload = () => { im.ok = true; im.fw = im.width / 6; }; im.src = `assets/objetos/ataques/m/${pre}_${fl}.png?v=1`; M2_IMG[pre + '_' + fl] = im;
}));
const m2Ok = pre => M2_FILAS.every(fl => M2_IMG[pre + '_' + fl].ok);

// dibuja el cuadro fr (0-5) de una fila, centrado en (x, y), con ancho w (alto proporcional) y girado ang
function m2Dib(pre, fl, fr, x, y, w, ang, alpha, alto){
  const im = M2_IMG[pre + '_' + fl]; if(!im || !im.ok || alpha <= 0) return;
  const f = Math.max(0, Math.min(5, fr | 0)), h = alto || w * im.height / im.fw;
  ctx.save(); ctx.globalAlpha = Math.min(1, alpha); ctx.translate(x, y); if(ang) ctx.rotate(ang);
  ctx.drawImage(im, f * im.fw, 0, im.fw, im.height, -w / 2, -h / 2, w, h); ctx.restore();
}
const m2Fase = (a, a0, a1) => (a - a0) / (a1 - a0);

let m2Marcas = [], m2G = null;
function m2Render(nombre, pre, viejo){
  return (e, a) => {
    if(!M2.on || !m2Ok(pre)) return viejo ? viejo(e, a) : undefined;
    const f = e.fol, co = Math.cos(e.ang), si = Math.sin(e.ang);
    const L = f && typeof fxLunge === 'function' ? fxLunge(f) : {x: 0, y: 0};
    const ox = f ? f.x + L.x + co * 16 : e.x - co * 40, oy = f ? f.y + L.y - 6 + si * 16 : e.y - si * 40;
    const q = typeof punchPos === 'function' && /^Puño/.test(nombre) && f ? punchPos(e, a) : {x: ox + (e.x - ox) * Math.min(1, a / .3), y: oy + (e.y - oy) * Math.min(1, a / .3)};
    // 1) carga en el puño
    let u = m2Fase(a, 0, .32); if(u >= 0 && u < 1) m2Dib(pre, 'carga', u * 6, q.x, q.y, M2.tam.carga, 0, 1 - Math.max(0, u - .7) / .3);
    // 2) estela del golpe, desde el atacante hasta el impacto
    u = m2Fase(a, .08, .5); if(u >= 0 && u < 1){ const d = Math.max(50, Math.hypot(e.x - ox, e.y - oy) * 1.15);
      m2Dib(pre, 'estela', u * 6, (ox + e.x) / 2, (oy + e.y) / 2, d, e.ang, 1 - Math.max(0, u - .75) / .25, d * .45); }
    // 3) impacto y 4) chispas
    u = m2Fase(a, .3, 1); if(u >= 0 && u < 1){
      m2Dib(pre, 'golpe', u * 6, e.x, e.y - 4, M2.tam.golpe, 0, 1);
      m2Dib(pre, 'chispas', u * 6, e.x, e.y - 6, M2.tam.chispas, 0, .95);
      if(!e.m2m){ e.m2m = 1; if(m2G !== g){ m2G = g; m2Marcas = []; } m2Marcas.push({pre, x: e.x, y: e.y + 16, t0: g ? g.t : 0}); if(m2Marcas.length > 24) m2Marcas.shift(); }
    }
  };
}
Object.entries(M2_ATAQUES).forEach(([nombre, pre]) => { const viejo = FXR.melee[nombre]; FXR.melee[nombre] = m2Render(nombre, pre, viejo); });

// 5) marcas en el suelo (debajo de los Pokémon)
function m2MarcasDib(){
  if(!M2.on || !g || g !== m2G || !m2Marcas.length) return;
  for(let i = m2Marcas.length - 1; i >= 0; i--){
    const m = m2Marcas[i], u = (g.t - m.t0) / M2.marca; if(u >= 1){ m2Marcas.splice(i, 1); continue; }
    m2Dib(m.pre, 'marca', Math.min(5, u * 7), m.x, m.y, M2.tam.marca, 0, u < .7 ? .9 : .9 * (1 - u) / .3);
  }
}
if(typeof fxhdGround === 'function'){ const o = fxhdGround; fxhdGround = function(){ const r = o.apply(this, arguments); try{ m2MarcasDib(); }catch(e){} return r; }; }

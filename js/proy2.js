"use strict";
/* =====================================================================
   PROYECTILES CON IMÁGENES DE GEMINI (21-11-2026): los ataques a distancia pequeños (clic derecho) que antes se
   dibujaban solo con código. Cada ataque tiene una hoja de 5 filas x 6 cuadros, recortada en
   assets/objetos/ataques/p/<pre>_<fila>.png:
     salida ... el destello en la boca al disparar
     bala ..... el proyectil en vuelo (mirando a la derecha, se gira hacia donde va)
     estela ... lo que deja detrás (en los chorros como Lanzallamas o Pistola Agua, va desde la boca hasta la punta)
     golpe .... el impacto en el rival
     marca .... la huella en el suelo (dura P2.marca segundos y se va borrando)
   Si las imágenes aún no han cargado, se ve el dibujo de antes. Solo dibujo: no cambia nada del combate.
   P2.on = false lo apaga.
   ===================================================================== */
const P2 = {on: true, marca: 2.4, fps: 14, tam: {salida: 56, bala: 46, estela: 90, golpe: 96, marca: 70}, chorro: 30};   // [AJUSTE] tamaños en px del campo · chorro = grosor de los chorros
// p2Alta(nombre, prefijo, es chorro (va desde la boca hasta la punta), escala del proyectil)
const P2_ATAQUES = {};
const P2_FILAS = ['salida', 'bala', 'estela', 'golpe', 'marca'];
const P2_IMG = {};
const P2_VER = {as: 2};                                                      // versión de las imágenes de cada ataque (subir si se rehacen)
function p2Alta(nombre, pre, chorro, escala){
  P2_ATAQUES[nombre] = {pre, chorro: !!chorro, esc: escala || 1};
  P2_FILAS.forEach(fl => { const im = new Image(); im.onload = () => { im.ok = true; im.fw = im.width / 6; }; im.src = `assets/objetos/ataques/p/${pre}_${fl}.png?v=${P2_VER[pre] || 1}`; P2_IMG[pre + '_' + fl] = im; });
}
const p2Ok = pre => P2.on && P2_FILAS.every(fl => P2_IMG[pre + '_' + fl].ok);

// cuadro fr (0-5) de una fila: centrado en (x, y) con ancho w (alto proporcional, o «alto») y girado ang
function p2Dib(pre, fl, fr, x, y, w, ang, alpha, alto, voltea){
  const im = P2_IMG[pre + '_' + fl]; if(!im || !im.ok || alpha <= 0) return;
  const f = Math.max(0, Math.min(5, fr | 0)), h = alto || w * im.height / im.fw;
  ctx.save(); ctx.globalAlpha = Math.min(1, alpha); ctx.translate(x, y); if(ang) ctx.rotate(ang); if(voltea) ctx.scale(1, -1);
  ctx.drawImage(im, f * im.fw, 0, im.fw, im.height, -w / 2, -h / 2, w, h); ctx.restore();
}
// rectángulo estirado desde (x0, y0) hasta (x1, y1): para estelas y chorros
function p2Tira(pre, fl, fr, x0, y0, x1, y1, grosor, alpha){
  const L = Math.hypot(x1 - x0, y1 - y0); if(L < 4) return;
  const an = Math.atan2(y1 - y0, x1 - x0);
  p2Dib(pre, fl, fr, (x0 + x1) / 2, (y0 + y1) / 2, L, an, alpha, grosor, Math.cos(an) < 0);
}
const p2Boca = f => typeof mouthOf === 'function' && f ? mouthOf(f) : null;

// el proyectil en vuelo
function p2Vuelo(nombre, cfg, viejo){
  const w = function(s, a, an){
    if(!p2Ok(cfg.pre)) return viejo && (viejo.draw || viejo).apply(this, arguments);
    const pre = cfg.pre, fr = Math.floor(a * P2.fps) % 6, T = P2.tam;
    if(s.p2x === undefined){ const m = p2Boca(s.o); s.p2x = m ? m[0] : s.x; s.p2y = m ? m[1] : s.y; }
    const sp = Math.hypot(s.vx, s.vy) || 1, ux = s.vx / sp, uy = s.vy / sp, big = (s.big ? 1.35 : 1) * cfg.esc;
    if(cfg.chorro){                                                              // chorro: de la boca a la punta
      p2Tira(pre, 'estela', fr, s.p2x, s.p2y, s.x, s.y, P2.chorro * big * (1 + .06 * Math.sin(a * 40)), 1);
    } else {                                                                     // estela detrás de la bala
      const L = Math.min(T.estela * big, Math.hypot(s.x - s.p2x, s.y - s.p2y));
      p2Tira(pre, 'estela', fr, s.x - ux * L, s.y - uy * L, s.x, s.y, T.bala * .55 * big, .9);
    }
    if(!cfg.chorro) p2Dib(pre, 'bala', fr, s.x, s.y, T.bala * big, an, 1, 0, Math.cos(an) < 0);   // (los chorros ya traen la punta)
    if(a < 6 / P2.fps) p2Dib(pre, 'salida', a * P2.fps, s.p2x, s.p2y, T.salida * big, 0, 1);
  };
  if(viejo) Object.assign(w, viejo); delete w.draw; return w;
}
// el impacto (y deja la marca en el suelo)
let p2Marcas = [], p2G = null;
function p2Golpe(nombre, cfg, viejo){
  return (e, a) => {
    if(!p2Ok(cfg.pre)) return viejo ? (viejo.draw || viejo)(e, a) : undefined;
    const u = a / .45; if(u < 1) p2Dib(cfg.pre, 'golpe', u * 6, e.x, e.y, P2.tam.golpe * (e.big ? 1.3 : 1) * (e.k || 1), 0, 1);
    if(!e.p2m){ e.p2m = 1; if(p2G !== g){ p2G = g; p2Marcas = []; } p2Marcas.push({pre: cfg.pre, x: e.x, y: e.y + 22, t0: g ? g.t : 0}); if(p2Marcas.length > 24) p2Marcas.shift(); }
  };
}
function p2MarcasDib(){
  if(!P2.on || !g || g !== p2G || !p2Marcas.length) return;
  for(let i = p2Marcas.length - 1; i >= 0; i--){
    const m = p2Marcas[i], u = (g.t - m.t0) / P2.marca; if(u >= 1){ p2Marcas.splice(i, 1); continue; }
    p2Dib(m.pre, 'marca', Math.min(5, u * 7), m.x, m.y, P2.tam.marca, 0, u < .7 ? .85 : .85 * (1 - u) / .3);
  }
}
if(typeof fxhdGround === 'function'){ const o = fxhdGround; fxhdGround = function(){ const r = o.apply(this, arguments); try{ p2MarcasDib(); }catch(e){} return r; }; }

// conecta cada ataque: vuelo, impacto, sin la estela de chispas de antes y sin el chorro dibujado por código (si hay imágenes)
function p2Conecta(){
  for(const [nombre, cfg] of Object.entries(P2_ATAQUES)){
    FXR.flight[nombre] = p2Vuelo(nombre, cfg, FXR.flight[nombre]);
    FXR.impact[nombre] = p2Golpe(nombre, cfg, FXR.impact[nombre]);
    const tr = FXR.trail[nombre] === undefined ? FXR.trail._ : FXR.trail[nombre];
    Object.defineProperty(FXR.trail, nombre, {configurable: true, enumerable: true, get: () => p2Ok(cfg.pre) ? null : tr, set(){}});
    const st = FXR.stream[nombre]; if(st){ const o = st.draw || st; const w = function(e){ if(p2Ok(cfg.pre)) return; return o.apply(this, arguments); }; Object.assign(w, st); delete w.draw; FXR.stream[nombre] = w; }
  }
}

// ---------------- LISTA DE ATAQUES (añadir aquí los nuevos) ----------------
p2Alta('Ascuas', 'as');
p2Alta('Pistola Agua', 'pa', true);
p2Alta('Tajo Aéreo', 'ta', false, 1.45);
p2Alta('Confusión', 'cf', false, 1.2);
p2Alta('Pin Misil', 'pm', false, 1.2);
p2Alta('Disparo Lodo', 'dl', false, 1.1);
p2Alta('Viento Feérico', 'vf', false, 1.4);
p2Alta('Zumbido', 'zb', false, 1.2);
p2Alta('Shuriken de Agua', 'sa', false, 1.2);
p2Alta('Voz Cautivadora', 'vc', false, 1.3);
// (22-11-2026) los que faltaban (Gemini)
p2Alta('Burbuja', 'bu', false, 1.45);
p2Alta('Rayo Burbuja', 'rb', false, 1.35);
p2Alta('Giro Fuego', 'gf', false, 1.55);
p2Alta('Bomba Imán', 'bi', false, 1.5);
p2Alta('Triataque', 'tr', false, 1.55);
p2Alta('Fuego Fatuo', 'ff', false, 1.75);
p2Alta('Onda Trueno', 'ot', false, 1.9);
p2Alta('Tóxico', 'to', false, 1.7);
p2Conecta();

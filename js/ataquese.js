"use strict";
/* =====================================================================
   ATAQUES FUERTES (E) CON HOJAS DE GEMINI (assets/objetos/ataques/e/*.png)
   - Bolas que se lanzan: Bola Sombra, Llamarada, Onda Certera, Fuerza Lunar → la bola en vuelo, su estela, la explosión y la marca en el suelo.
   - Trueno: al dar, sale una nube negra encima del rival, cae el rayo, explosión eléctrica y queda el suelo quemado.
   - Roca Afilada: los pinchos de piedra nuevos (en lugar de ra_pinchos de js/fxvideo5.js) y el aviso en el suelo antes de que salgan.
   Si falta alguna imagen, se ve el efecto de antes. Todo es dibujo: no cambia el juego (ni el online).
   ===================================================================== */
const AE = {img: {}, marcas: [], dura: 3};                                         // [AJUSTE] dura: segundos que se ven las marcas del suelo
function aeImg(k, n){ const i = new Image(), o = AE.img[k] = {i, n, ok: false}; i.onload = () => { o.ok = true; o.fw = i.width / n; o.fh = i.height; }; i.src = 'assets/objetos/ataques/e/' + k + '.png?v=1'; return o; }
const aeOk = (...k) => AE.on !== false && k.every(n => !n || (AE.img[n] && AE.img[n].ok));
// dibuja la figura fr de la hoja k centrada en (x, y) con ALTO h (o anclada abajo si pie)
function aeFr(k, fr, x, y, h, rot, flip, pie){
  const S = AE.img[k]; if(!S || !S.ok) return; const w = h * S.fw / S.fh;
  ctx.save(); ctx.imageSmoothingEnabled = false; ctx.translate(x, y); if(rot) ctx.rotate(rot); if(flip) ctx.scale(-1, 1);
  ctx.drawImage(S.i, (fr % S.n) * S.fw, 0, S.fw, S.fh, -w / 2, pie ? -h : -h / 2, w, h); ctx.restore();
}
const aePie = e => { const T = e.T; if(T && typeof idleInfo === 'function'){ try{ return T.y + idleInfo(T.m.dex).foot * ESCALA - 4; }catch(_){} } return e.y + 26; };
function aeMarca(k, x, y, w){ if(!aeOk(k)) return; AE.marcas.push({k, x, y, w, t0: g.t}); if(AE.marcas.length > 14) AE.marcas.shift(); }

// ---------------- BOLAS QUE SE LANZAN ----------------
// [AJUSTE] tam: alto de la bola en vuelo · golpe: alto de la explosión · marca: ancho de la marca · gira: la bola apunta hacia donde va · rueda: la bola da vueltas
const AE_BOLAS = {
  'Bola Sombra':  {pre: 'bs2', tam: 62, golpe: 140, marca: 110, rueda: 3},
  'Llamarada':    {pre: 'll2', tam: 78, golpe: 150, marca: 120},
  'Onda Certera': {pre: 'oc2', bola: 'oc2_bola', estela: null, tam: 46, golpe: 140, marca: 110, gira: 1},
  'Fuerza Lunar': {pre: 'fl2', tam: 56, golpe: 130, marca: 110},
  'Lanzamugre':   {pre: 'lm2', tam: 58, golpe: 140, marca: 110, gira: 1}
};
Object.entries(AE_BOLAS).forEach(([nm, C]) => {
  C.bola = C.bola || C.pre + '_bola'; if(C.estela !== null) C.estela = C.pre + '_estela'; C.gol = C.pre + '_golpe'; C.mar = C.pre + '_marca';
  [C.bola, C.estela, C.gol].forEach(k => { if(k && !AE.img[k]) aeImg(k, 6); }); aeImg(C.mar, 1);
  const oF = FXR.flight[nm], oI = FXR.impact[nm];
  const wF = function(s, a, an){
    if(!aeOk(C.bola, C.estela)) return oF && (oF.draw || oF).apply(this, arguments);
    const fr = Math.floor(g.t * 12), y = s.y - 6;
    if(C.estela){ ctx.save(); ctx.globalAlpha = .9; aeFr(C.estela, fr, s.x - Math.cos(an) * C.tam * .9, y - Math.sin(an) * C.tam * .9, C.tam * .8, an, true); ctx.restore(); }   // la estela, detrás
    if(C.gira){ const S = AE.img[C.bola], w = C.tam * S.fw / S.fh; ctx.save(); ctx.imageSmoothingEnabled = false; ctx.translate(s.x, y); ctx.rotate(an); if(Math.cos(an) < 0) ctx.scale(1, -1);   // apunta hacia donde va (sin quedar boca abajo)
      ctx.drawImage(S.i, (fr % S.n) * S.fw, 0, S.fw, S.fh, -w / 2, -C.tam / 2, w, C.tam); ctx.restore(); }
    else aeFr(C.bola, fr, s.x, y, C.tam, C.rueda ? g.t * C.rueda : 0);
  };
  const wI = function(e, a){
    if(!aeOk(C.gol)) return oI && (oI.draw || oI).apply(this, arguments);
    if(!e.aeM){ e.aeM = 1; aeMarca(C.mar, e.x, aePie(e), C.marca * (e.k || 1)); }
    const u = a / (e.dur || .6); if(u >= 1) return;
    aeFr(C.gol, Math.min(5, Math.floor(u * 6)), e.x, e.y - 4, C.golpe * (e.k || 1));
  };
  if(oF) Object.assign(wF, oF); if(oI) Object.assign(wI, oI); delete wF.draw; delete wI.draw;
  FXR.flight[nm] = wF; FXR.impact[nm] = wI;
  FXR.trail[nm] = null;                                                            // sin la estela de chispas de antes (la estela ya va en el dibujo)
  FXC[nm] = Object.assign({}, FXC[nm] || {}, {idur: .6});
});

// ---------------- TRUENO ----------------
// al dar: nube negra encima del rival → cae el rayo hasta sus pies → explosión eléctrica → suelo quemado
const AE_TN = {nube: 190, alto: 230, rayo: .15, golpe: 150, marca: 120, dura: 1.1};     // [AJUSTE] ancho de la nube · a qué altura está · cuándo cae el rayo (s) · alto de la explosión · ancho de la marca · duración (s)
['tn_nube', 'tn_rayo', 'tn_golpe'].forEach(k => aeImg(k, 6)); aeImg('tn_marca', 1);
{ const oI = FXR.impact['Trueno'];
  const wI = function(e, a){
    if(!aeOk('tn_nube', 'tn_rayo', 'tn_golpe')) return oI && (oI.draw || oI).apply(this, arguments);
    const pie = aePie(e), x = e.T && !e.T.dead ? e.T.x : e.x, ny = pie - AE_TN.alto, D = AE_TN.dura, k = e.k || 1;
    const N = AE.img.tn_nube, nh = AE_TN.nube * N.fh / N.fw, ap = Math.min(1, a / .12, (D - a) / .25);
    ctx.save(); ctx.globalAlpha = Math.max(0, ap); aeFr('tn_nube', Math.floor(g.t * 10), x, ny, nh * k); ctx.restore();          // la nube
    const r = a - AE_TN.rayo;
    if(r >= 0){
      if(!e.aeM){ e.aeM = 1; aeMarca('tn_marca', x, pie, AE_TN.marca * k); if(typeof fx !== 'undefined' && !(g && g.pvp)) fx.shake = Math.max(fx.shake, 9); }
      const fr = Math.min(5, Math.floor(r / .09)); if(fr < 5){ const R = AE.img.tn_rayo, L = pie - ny - nh * .2;               // el rayo, de la nube a los pies
        ctx.save(); ctx.imageSmoothingEnabled = false; const w = L * R.fw / R.fh * .7; ctx.drawImage(R.i, fr * R.fw, 0, R.fw, R.fh, x - w / 2, ny + nh * .2, w, L); ctx.restore(); }
      const u = r / (D - AE_TN.rayo); if(u < 1) aeFr('tn_golpe', Math.min(5, Math.floor(u * 6)), x, pie + 6, AE_TN.golpe * k, 0, false, true);
    }
  };
  if(oI) Object.assign(wI, oI); delete wI.draw; FXR.impact['Trueno'] = wI;
  FXC['Trueno'] = Object.assign({}, FXC['Trueno'] || {}, {idur: AE_TN.dura}); }

// ---------------- ROCA AFILADA ----------------
// los pinchos nuevos sustituyen a ra_pinchos (js/fxvideo5.js); antes de salir, el aviso agrietado en el suelo
const AE_RA = {esc: 1, aviso: 130};                                              // [AJUSTE] tamaño de los pinchos · ancho del aviso
{ const P = aeImg('ra2_pinchos', 6); aeImg('ra2_aviso', 5); aeImg('ra2_marca', 1);
  const pon = () => { if(typeof V9IMG === 'undefined') return; const im = P.i; im.n = 6; im.fw = P.fw; im.ok = true; V9IMG.ra_pinchos = im; if(typeof RA9 !== 'undefined') RA9.esc = AE_RA.esc; };
  if(P.ok) pon(); else P.i.addEventListener('load', pon); }
function aeRocaAviso(){
  if(typeof V9sp === 'undefined' || !V9sp.length || !aeOk('ra2_aviso')) return;
  for(const S of V9sp){ if(S.mini) continue;
    if(S.t < 0){ const u = 1 + S.t / (RA9.espera + RA9.entre * 2); aeFr('ra2_aviso', Math.max(0, Math.min(4, Math.floor(u * 5))), S.x, S.y, AE_RA.aviso * .5); }
    else if(S.last && !S.aeM){ S.aeM = 1; aeMarca('ra2_marca', S.x, S.y, 120); } }
}

// ---------------- VENTISCA ----------------
// un CONO DE NIEVE (vt3_cono) que sale de la boca y se abre hasta donde llega el ataque. Se queda QUIETO donde lo lanzaste, mirando hacia donde apuntabas
// (aunque luego te muevas). Al rival que toca le crecen cristales de hielo (vt3_golpe) y queda una capa de nieve en el suelo (vt3_marca).
const AE_VT = {dura: .9, ancho: .55, golpe: 120, marca: 110};                     // [AJUSTE] lo que dura el cono (s) · su ancho (× su largo) · alto de los cristales · ancho de la nieve del suelo
const AE_CONOS = [];
{ aeImg('vt3_cono', 6); aeImg('vt3_golpe', 6); aeImg('vt3_marca', 1);
  if(typeof gustStart === 'function'){ const o = gustStart; gustStart = function(f, w){
    const r = o.apply(this, arguments);
    try{ const [mx, my] = typeof mouthOf === 'function' ? mouthOf(f) : [f.x, f.y - 16]; AE_CONOS.push({x: mx, y: my, ang: w.ang, t0: g.t}); }catch(e){}
    return r; }; }
  if(typeof v8VentDraw === 'function'){ const o = v8VentDraw; v8VentDraw = function(){
    if(!aeOk('vt3_cono')) return o.apply(this, arguments);
    if(typeof V8vent !== 'undefined') V8vent.length = 0;                            // el cono de antes (pegado a la boca) ya no se usa
    const S = AE.img.vt3_cono, R = typeof GUST !== 'undefined' ? GUST.range : 430, H = R * AE_VT.ancho;
    for(let i = AE_CONOS.length - 1; i >= 0; i--){ const C = AE_CONOS[i], u = (g.t - C.t0) / AE_VT.dura; if(u >= 1 || u < 0){ AE_CONOS.splice(i, 1); continue; }
      const fr = Math.min(5, Math.floor(u * 6));
      ctx.save(); ctx.imageSmoothingEnabled = false; ctx.translate(C.x, C.y); ctx.rotate(C.ang); if(Math.cos(C.ang) < 0) ctx.scale(1, -1); ctx.globalAlpha = .95;
      ctx.drawImage(S.i, fr * S.fw, 0, S.fw, S.fh, -6, -H / 2, R, H); ctx.restore(); }
  }; }
  ['Ventisca', '_ventisca'].forEach(nm => { const oI = FXR.impact[nm];
    const wI = function(e, a){
      if(!aeOk('vt3_golpe')) return oI && (oI.draw || oI).apply(this, arguments);
      const T = e.T; if(!e.aeV){ e.aeV = 1; if(T && T.aeVt && g.t - T.aeVt < .5){ e.aeNo = 1; } else { if(T) T.aeVt = g.t; aeMarca('vt3_marca', e.x, aePie(e), AE_VT.marca); } }
      if(e.aeNo) return; const u = a / (e.dur || .9); if(u >= 1) return;                 // (los 7 copos: solo un grupo de cristales por rival)
      aeFr('vt3_golpe', Math.min(5, Math.floor(u * 6)), T && !T.dead ? T.x : e.x, aePie(e) + 6, AE_VT.golpe, 0, false, true);
    };
    if(oI) Object.assign(wI, oI); delete wI.draw; FXR.impact[nm] = wI; FXC[nm] = Object.assign({}, FXC[nm] || {}, {idur: .9}); }); }

// ---------------- marcas en el suelo ----------------
function aeMarcasDraw(){
  for(let i = AE.marcas.length - 1; i >= 0; i--){ const M = AE.marcas[i], u = (g.t - M.t0) / AE.dura; if(u >= 1 || u < 0){ AE.marcas.splice(i, 1); continue; }
    const S = AE.img[M.k]; if(!S || !S.ok) continue; const h = M.w * S.fh / S.fw;
    ctx.save(); ctx.globalAlpha = .9 * Math.min(1, (1 - u) * 3, (g.t - M.t0) / .1); ctx.imageSmoothingEnabled = false; ctx.drawImage(S.i, M.x - M.w / 2, M.y - h / 2, M.w, h); ctx.restore(); }
}
if(typeof fxhdGround === 'function'){ const o = fxhdGround; fxhdGround = function(){ const r = o.apply(this, arguments); try{ if(g){ aeMarcasDraw(); aeRocaAviso(); } }catch(e){} return r; }; }

// ---------------- EQUILIBRIO: Vuelo y Excavar (saltos del clic) ----------------
// [AJUSTE] segundos de espera hasta poder repetirlos (los demás saltos siguen con JUMP.cd = 4 s, js/combat.js)
if(typeof JUMP_MOVE !== 'undefined'){ if(JUMP_MOVE.Vuelo) JUMP_MOVE.Vuelo.cd = 5.5; if(JUMP_MOVE.Excavar) JUMP_MOVE.Excavar.cd = 5.5; }

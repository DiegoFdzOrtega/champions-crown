"use strict";
/* =====================================================================
   SONIDO EN ESTÉREO DEL COMBATE (usa Music.sfxAt de js/music.js)
   Antes de que suene un ataque o un golpe, se apunta DÓNDE pasa: lo que lanza o recibe el Pokémon de la izquierda suena más por el
   altavoz izquierdo, y al revés. Solo es sonido: no cambia nada del combate (ni del online).
   ===================================================================== */
const snMid = () => { try{ const a = g.p[g.pi], b = g.e[g.ei]; return (a.x + b.x) / 2; }catch(e){ return 0; } };
const snAt = x => { try{ if(g && typeof Music !== 'undefined' && Music.sfxAt) Music.sfxAt(x, snMid()); }catch(e){} };
if(typeof use === 'function'){ const o = use; use = function(f){ if(f) snAt(f.x); return o.apply(this, arguments); }; }                  // al lanzar: suena donde está el que ataca
if(typeof hit === 'function'){ const o = hit; hit = function(T){ if(T) snAt(T.x); return o.apply(this, arguments); }; }                  // al golpear: suena donde está el que recibe

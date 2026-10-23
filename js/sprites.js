"use strict";
/* =====================================================================
   2) SPRITES: cada Pokémon puede tener cuadros de un tamaño distinto,
      así que el tamaño se detecta solo al cargar cada hoja.
   ===================================================================== */
const sheets = {};
function sheet(dex, a, shiny){                    // shiny = usa la carpeta pokemon/<nº>/s/
  const sd = shiny ? 's/' : '';
  const k = dex + '/' + sd + a;
  if(!sheets[k]){
    const im = new Image(); im.ok = false; im.bad = false;
    im.onload = ()=>{ im.info = analyze(im, a); im.ok = true; };
    im.onerror = ()=>{ im.bad = true; };
    im.src = `${CARPETA}/${dex}/${sd}${a}.png`;
    sheets[k] = im;
  }
  return sheets[k];
}

// Cada hoja tiene 8 filas (una por dirección), así que el alto del cuadro es alto/8.
// El ancho es el divisor más pequeño en el que ningún dibujo cruza el borde entre cuadros.
function analyze(im, a){
  const D = ANIMS[a], w = im.width, h = im.height, fh = Math.floor(h/8);
  let fw = D.w, top = -fh*.4, foot = fh*.25;
  try{
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    const x = c.getContext('2d', {willReadFrequently:true}); x.drawImage(im, 0, 0);
    const d = x.getImageData(0, 0, w, h).data;
    // Cuántos píxeles dibujados cruzan los bordes si los cuadros miden "cand" de ancho
    const crossOf = cand => { let n = 0;
      for(let bx = cand; bx < w; bx += cand) for(let y = 0; y < h; y++) if(d[(y*w+bx-1)*4+3] && d[(y*w+bx)*4+3]) n++;
      return n; };
    let found = 0;
    for(let cand = 16; cand <= w && !found; cand++){
      if(w % cand) continue;
      if(cand > fh*3) break;                       // un cuadro nunca es mucho más ancho que alto
      if(crossOf(cand) <= 2 * (w/cand - 1)){ fw = cand; found = 1; }    // se toleran 1-2 píxeles sueltos por borde (p. ej. Swampert)
    }
    if(found && fw === w && w > fh*2) found = 0;   // una hoja no es "un solo cuadro" si es mucho más ancha que alta: se busca el ancho real
    if(!found){                                    // sprites que tocan el borde (p. ej. Regirock): elige el ancho con menos cruces
      let best = Infinity;
      for(let cand = Math.ceil(fh*.5); cand <= Math.min(w, fh*3); cand++){
        if(w % cand || cand === w) continue;
        const sc = crossOf(cand) / (w/cand - 1) + Math.abs(cand - fh) * .01;      // cruces por borde, y mejor si es casi cuadrado
        if(sc < best){ best = sc; fw = cand; found = 1; }
      }
      if(!found) fw = w % fh === 0 ? fh : (w >= fh ? w : fw);   // último recurso: cuadro cuadrado
    }
    let y0 = -1, y1 = -1;                         // cabeza y pies del primer cuadro (mirando abajo)
    for(let y = 0; y < fh; y++) for(let xx = 0; xx < fw; xx++) if(d[(y*w+xx)*4+3]){ if(y0 < 0) y0 = y; y1 = y; break; }
    if(y0 >= 0){ top = y0 - fh/2; foot = y1 - fh/2; }
  }catch(e){}                                      // (si el navegador lo impide, usa los tamaños por defecto)
  return {fw, fh, n:Math.max(1, Math.round(w/fw)), top, foot};
}
function idleInfo(dex){
  const im = sheet(dex, 'Idle');
  return im.ok ? im.info : {fw:32, fh:40, top:-16, foot:10};
}

// Dirección 0..7 (abajo, abajo-der, der, arriba-der, arriba, arriba-izq, izq, abajo-izq)
function dirOf(ang){ return ((Math.round((Math.PI/2 - ang) / (Math.PI/4)) % 8) + 8) % 8; }

const singles = {};
function single(dex){
  if(!singles[dex]){ const im = new Image(); im.onload = ()=> im.ok = true; im.src = `${CARPETA}/${dex}.png`; singles[dex] = im; }
  return singles[dex];
}

// Dibuja un cuadro centrado en (x, y). fit = tamaño máximo en píxeles (para retratos).
function drawFrame(c, dex, anim, t, dir, x, y, sc, fit, shiny){
  let sh = !!shiny, im = sheet(dex, anim, sh);
  if(sh && im.bad){ sh = false; im = sheet(dex, anim, false); }      // sin sprite shiny: usa el normal
  if(im.bad && anim !== 'Idle'){ anim = 'Idle'; im = sheet(dex, 'Idle', sh); if(sh && im.bad) im = sheet(dex, 'Idle', false); }
  c.imageSmoothingEnabled = false;
  if(im.ok){
    const A = ANIMS[anim], I = im.info;
    if(fit) sc = Math.min(sc, fit / Math.max(I.fw, I.fh));
    if((dir+1)*I.fh > im.height) dir = 0;
    let f = Math.floor(t * A.fps); f = A.loop ? f % I.n : Math.min(f, I.n - 1);
    const w = Math.round(I.fw*sc), h = Math.round(I.fh*sc);
    c.drawImage(im, f*I.fw, dir*I.fh, I.fw, I.fh, Math.round(x - w/2), Math.round(y - h/2), w, h);
    return true;
  }
  if(!im.bad) return false;                        // la hoja todavía está cargando: espera
  const st = single(dex);                          // plan B: imagen suelta pokemon/<número>.png
  if(st.ok){
    const h = (fit ? Math.min(fit, ANIMS[anim].h*sc) : ANIMS[anim].h*sc), w = st.width/st.height*h;
    c.drawImage(st, Math.round(x - w/2), Math.round(y - h/2), Math.round(w), Math.round(h));
    return true;
  }
  return false;
}

// Retratos de los líderes, Alto Mando y Campeón: se prueba cada ruta de LEADER_PATHS hasta que una cargue
const leaders = {};
function leaderPaths(id){
  const reg = (typeof save !== 'undefined' && save.region) || 'Kanto';                     // carpeta de la región
  const cap = n => n.charAt(0).toUpperCase() + n.slice(1);                             // azul -> Azul
  const cap2 = n => n.split('_').map(cap).join('_');                                   // lt_surge -> Lt_Surge
  const names = [id, ...((typeof LEADER_FILE !== 'undefined' && LEADER_FILE[id]) || [])];   // nombres de archivo posibles (LEADER_FILE en data.js)
  const out = [];
  names.forEach(n => LEADER_PATHS.forEach(p => out.push(p.replace('{id}', n).replace('{ID}', n.toUpperCase()).replace('{Id}', cap(n)).replace('{Id2}', cap2(n)).replace('{Region}', reg))));
  return [...new Set(out)];
}
function loadLeaderInto(im, id, onfail){          // pone en 'im' el primer retrato que exista
  const list = leaderPaths(id); let k = 0;
  im.onerror = ()=>{ if(++k < list.length) im.src = list[k]; else if(onfail) onfail(); };
  im.src = list[0];
}
function leaderImg(id, path){                       // path (opcional): ruta fija del retrato (entrenadores del Campo de Entrenamiento)
  if(!id) return null;
  if(!leaders[id]){ const im = new Image(); im.onload = ()=> im.ok = true; if(path) im.src = path; else loadLeaderInto(im, id); leaders[id] = im; }
  return leaders[id];
}

// Imágenes de los objetos (carpeta objetos/): se cargan una vez. Devuelve null si el objeto no existe; mira .ok antes de dibujar.
const itemImgs = {};
function itemImg(id){
  if(!ITEMS[id]) return null;
  if(!itemImgs[id]){ const im = new Image(); im.ok = false; im.onload = ()=> im.ok = true; im.src = imgOf(id); itemImgs[id] = im; }
  return itemImgs[id];
}

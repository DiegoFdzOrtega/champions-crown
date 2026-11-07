"use strict";
/* =====================================================================
   GUÍA PARA JUGADORES NUEVOS (botón «Guía» de la barra de arriba del menú)
   Explica cómo empezar, los controles, los modos, las monedas, IVs / EVs / naturaleza y cómo instalar el juego en el móvil.
   Se abre sola UNA vez en una partida nueva (sin combates) y se puede volver a abrir cuando se quiera.
   Para añadir un apartado: una entrada más en GUIA_SECCIONES ([id, título, html]).
   ===================================================================== */
const GUIA_SECCIONES = [
  ['empezar', '1 · Cómo empezar', `
    <ol>
      <li>En el menú pulsa <b>¡COMBATIR!</b> (o entra en <b>Historia</b> y elige <b>Kanto</b>). Vas venciendo a los <b>líderes de gimnasio</b>, luego al <b>Alto Mando</b> y por último al <b>Campeón</b>.</li>
      <li>Cada victoria te da <b>Puntos de Batalla</b> y, en los combates importantes, <b>tickets</b> y <b>estrellas</b>.</li>
      <li>Gasta los tickets en el <b>Gachapon</b> para conseguir <b>Pokémon nuevos</b>.</li>
      <li>En <b>Equipo</b> eliges <b>3 Pokémon</b> para combatir (puedes guardar hasta 18 equipos distintos).</li>
      <li>Cuando seas Campeón de Kanto se abre la <b>Torre Batalla</b> y puedes seguir con las demás regiones.</li>
    </ol>
    <p class="gn">Consejo: empieza en dificultad <b>Fácil</b>. Cada dificultad guarda su propio avance, así que puedes cambiar sin perder nada.</p>`],
  ['combate', '2 · Cómo se combate', `
    <p>Los combates son <b>en tiempo real</b> (no por turnos): tú mueves a tu Pokémon por la arena y lanzas ataques.</p>
    <p class="gh">En ordenador</p>
    <ul>
      <li><b>W A S D</b> o las <b>flechas</b>: moverte · <b>Espacio</b>: carrera rápida.</li>
      <li><b>Clic izquierdo</b>: golpe · <b>Clic derecho</b>: disparo (apuntas con el ratón).</li>
      <li><b>Q</b>: mejora · <b>E</b>: ataque fuerte · <b>R</b>: megaevolución (si tu Pokémon lleva la megapiedra).</li>
      <li><b>1 · 2 · 3</b>: cambiar de Pokémon · <b>Esc</b>: pausa.</li>
      <li>Puedes cambiar las teclas en <b>Ajustes › Controles</b>.</li>
    </ul>
    <p class="gh">En móvil</p>
    <ul>
      <li><b>Joystick</b> a la izquierda (aparece donde pongas el dedo) para moverte.</li>
      <li><b>Botones</b> a la derecha: tocas un ataque y se lanza solo hacia el rival. Si <b>mantienes y arrastras</b>, apuntas tú.</li>
      <li>Toca los <b>cuadritos del equipo</b> de arriba para cambiar de Pokémon.</li>
    </ul>
    <p class="gn">Los <b>tipos</b> importan: un ataque de Agua hace más daño a un Pokémon de Fuego. En <b>Equipo</b> ves las debilidades y resistencias de tu equipo.</p>`],
  ['modos', '3 · Modos de juego', `
    <ul>
      <li><b>Historia</b>: las regiones una a una (líderes, Alto Mando y Campeón). Es la forma normal de progresar.</li>
      <li><b>Clasificatoria</b>: combates contra otros jugadores. Necesitas una <b>cuenta</b> (es gratis y opcional).</li>
      <li><b>Campo de Entrenamiento</b>: combates sin riesgo (perder no cuesta nada). Cada victoria da <b>Chapas</b> para mejorar a tus Pokémon.</li>
      <li><b>Torre Batalla</b>: 50 pisos de rivales seguidos, con premios y tronos de Campeón. Se abre al vencer a Kanto.</li>
      <li><b>Amigos</b>: con una cuenta puedes añadir amigos y desafiarlos a un <b>combate online</b>.</li>
    </ul>`],
  ['monedas', '4 · Monedas y tienda', `
    <ul>
      <li><b>Puntos de Batalla (PB)</b>: la moneda de la <b>Tienda</b> (objetos, MTs, megapiedras, tickets…).</li>
      <li><b>Tickets Gachapon</b>: se gastan en el <b>Gachapon</b>, que da <b>Pokémon</b>.</li>
      <li><b>Estrellas</b>: se gastan en <b>Invocación</b>, que da <b>entrenadores</b> (personajes con los que te presentas). Se ganan en el Alto Mando, el Campeón y los logros.</li>
      <li><b>Chapas Doradas y Plateadas</b>: sirven para subir IVs y EVs (mira el apartado siguiente). Se consiguen en el Campo de Entrenamiento y en la Tienda.</li>
      <li>Cada día hay <b>Ofertas del día</b> en la Tienda con descuentos, y una <b>recompensa diaria</b> en el menú.</li>
    </ul>`],
  ['stats', '5 · IVs, EVs, naturaleza y habilidad', `
    <p>Son los <b>ajustes de fuerza de cada Pokémon</b>. Se cambian en <b>Equipo › Ver datos</b>.</p>
    <ul>
      <li><b>IV</b> (valor individual): lo «bueno» que nace el Pokémon en cada estadística. Va de <b>0 a 31</b>. Cada <b>Chapa Dorada</b> sube <b>+5</b> un IV.</li>
      <li><b>EV</b> (puntos de esfuerzo): entrenamiento extra. Máximo <b>252</b> en una estadística y <b>510</b> en total. Cada <b>Chapa Plateada</b> da <b>+10</b> EV.</li>
      <li><b>Estadísticas</b>: PS (vida), Ataque, Defensa, At. Esp., Def. Esp. y Velocidad.</li>
      <li><b>Naturaleza</b>: sube una estadística y baja otra un poco. Se cambia con una <b>Menta</b>.</li>
      <li><b>Habilidad</b>: un poder pasivo (por ejemplo, Intimidación baja el ataque del rival). Se cambia con una <b>Cápsula de Habilidad</b>.</li>
      <li><b>Objeto</b>: cada Pokémon lleva uno que le da una ventaja (se compran en la Tienda y se equipan en Equipo).</li>
    </ul>
    <p class="gn">Todos empiezan con IV 0 y EV 0. Como los dos tienen tope, piensa qué quiere tu Pokémon: un atacante necesita Ataque y Velocidad; un tanque, PS y Defensa. Con «Restablecer» recuperas las chapas gastadas.</p>`],
  ['extras', '6 · Megaevolución, MTs y mochila', `
    <ul>
      <li><b>Megapiedras</b>: se compran en la Tienda y se equipan a un Pokémon compatible. En combate pulsa <b>R</b> (o el botón MEGA) para megaevolucionar; solo una vez por combate.</li>
      <li><b>MTs</b>: enseñan un ataque nuevo a un Pokémon compatible. Se usan desde la <b>Mochila</b> o desde Ver datos.</li>
      <li><b>Mochila</b> (arriba en el menú): aquí ves todos tus objetos y puedes usarlos.</li>
      <li><b>Logros</b>: retos que dan premios (estrellas, tickets…).</li>
    </ul>`],
  ['movil', '7 · Jugar en el móvil a pantalla completa', `
    <p>Si lo abres desde el navegador verás la barra de direcciones y se pierde espacio. Para jugar a <b>pantalla completa</b>, <b>ancla el juego a la pantalla de inicio</b>:</p>
    <p class="gh">Android (Chrome)</p>
    <ol><li>Abre el juego en <b>Chrome</b>.</li><li>Pulsa el menú <b>⋮</b> (tres puntos, arriba a la derecha).</li><li>Elige <b>«Instalar aplicación»</b> o <b>«Añadir a la pantalla de inicio»</b>.</li><li>Abre el juego desde el <b>icono nuevo</b> de tu pantalla de inicio.</li></ol>
    <p class="gh">iPhone / iPad (Safari)</p>
    <ol><li>Abre el juego en <b>Safari</b> (en otro navegador no aparece la opción).</li><li>Pulsa el botón <b>Compartir</b> (un cuadrado con una flecha hacia arriba).</li><li>Baja y elige <b>«Añadir a pantalla de inicio»</b> y pulsa <b>Añadir</b>.</li><li>Abre el juego desde el icono.</li></ol>
    <p class="gn">Juega con el móvil en <b>horizontal</b> (tumbado). Si no cambia solo, activa el giro automático de pantalla en los ajustes del móvil.</p>`],
  ['consejos', '8 · Consejos rápidos', `
    <ul>
      <li>Crea una <b>cuenta</b> (menú › Cuenta) para guardar tu partida en internet y jugar desde otro dispositivo.</li>
      <li>Si un combate se te atraga, mejora a tu equipo en el <b>Campo de Entrenamiento</b> y vuelve.</li>
      <li>No repitas Pokémon del mismo tipo débil: combina tipos para cubrir debilidades.</li>
      <li>Mira las <b>Notas del parche</b> (abajo en el menú) para ver las novedades.</li>
    </ul>`]
];

function guiaClose(){
  const d = document.getElementById('guiaM'); if(d) d.remove();
  if(typeof save !== 'undefined' && !save.guideSeen){ save.guideSeen = true; try{ persist(); }catch(e){} }
}
function openGuia(sec){
  guiaClose();
  const d = document.createElement('div'); d.id = 'guiaM'; d.className = 'v-gd guia';
  d.innerHTML = `<div class="box"><button class="gx" data-g="x" aria-label="Cerrar">✕</button><h2>Guía del jugador</h2>
    <p class="gl">¡Bienvenido a <b>Champions Crown</b>! Aquí tienes lo básico para empezar.</p>
    <nav class="gnav">${GUIA_SECCIONES.map(([id, t]) => `<button type="button" data-g="${id}">${t.replace(/^\d+ · /, '')}</button>`).join('')}</nav>
    ${GUIA_SECCIONES.map(([id, t, h]) => `<section id="g-${id}"><h3>${t}</h3>${h}</section>`).join('')}
    <button type="button" class="gok" data-g="x">¡A jugar!</button></div>`;
  d.addEventListener('click', e => {
    const b = e.target.closest('[data-g]');
    if(e.target === d || (b && b.dataset.g === 'x')) return guiaClose();
    if(b){ const s = d.querySelector('#g-' + b.dataset.g); if(s) s.scrollIntoView({behavior:'smooth', block:'start'}); }
  });
  document.body.appendChild(d);
  if(sec){ const s = d.querySelector('#g-' + sec); if(s) s.scrollIntoView({block:'start'}); }
}
document.addEventListener('keydown', e => { if(e.key === 'Escape' && document.getElementById('guiaM')){ guiaClose(); e.stopPropagation(); } }, true);

// se abre sola la primera vez en una partida nueva (sin combates), cuando ya estás en el menú y no hay otra ventana encima
(function(){
  let n = 0;
  const t = setInterval(() => {
    if(++n > 40 || typeof save === 'undefined' || save.guideSeen || Object.keys(save.used || {}).length){ clearInterval(t); return; }
    const m = document.getElementById('main'), lg = document.getElementById('login') || document.querySelector('.lg-wrap, #lgBox, .login');
    if(m && !m.classList.contains('hide') && !(lg && lg.offsetParent)){ clearInterval(t); setTimeout(() => { if(!document.getElementById('guiaM')) openGuia(); }, 600); }
  }, 1500);
})();

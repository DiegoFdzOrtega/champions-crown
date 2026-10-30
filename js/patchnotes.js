"use strict";
/* =====================================================================
   NOTAS DEL PARCHE: el botón de abajo a la izquierda del menú principal.
   Para añadir un parche nuevo: pon un bloque NUEVO ARRIBA del todo en PATCHES (el más nuevo va primero).
   Cada bloque: {v:'nombre del parche', date:'fecha', sections:[{t:'título del grupo', i:['frase 1','frase 2']}]}
   El botón enseña un punto rojo "NUEVO" hasta que abres las notas (save.patchSeen guarda el último que viste).
   ===================================================================== */
const PATCHES = [
  {v:'Megaevolución', date:'30 oct 2026', sections:[
    {t:'Kalos', i:[
      'Nuevos equipos en los 13 combates de Kalos (los de tu lista), con EVs, IVs, naturaleza, habilidad, objeto y movimientos.',
      'Los rivales con mega disponible megaevolucionan: Tyranitar y Aerodactyl (Lino), Lucario y Gallade (Corelia), Manectric (Lem), Mawile y Gardevoir (Valeria), Glalie (Édel), Gengar (Tileo) y Gardevoir (Dianta). Solo una por combate.',
      'Alto Mando: Tileo pasa a ser de tipo Fantasma (con un salón encantado nuevo) y el cuarto es Ágata, de tipo Acero. Sustituye a Drácena.']},
    {t:'Pantalla de combate', i:[
      'Tarjetas de Pokémon rediseñadas: la habilidad tiene su propia línea y ya no desaparece cuando el objeto tiene nombre largo; las barras llevan etiqueta (PS / EN) y la de vida marca el 50 % y el 20 %.',
      'Los cuadritos del equipo enseñan una «M» si ese Pokémon puede megaevolucionar (arcoíris), si ya lo hizo (rosa) o si otra mega ya se usó (gris). Los debilitados llevan una ✖ roja. Un Pokémon megaevolucionado tiene el borde de su tarjeta en arcoíris.',
      'El retrato del líder ya no va debajo del subtítulo: ahora está en un marco a la izquierda del panel del piso, sin tapar ningún texto.',
      'Los avisos flotantes y el subtítulo del gimnasio llevan contorno o fondo oscuro para leerse sobre cualquier fondo.']},
    {t:'Combate', i:[
      'Ya puedes megaevolucionar: equipa la Megapiedra de tu Pokémon, ten el Mega-Aro y pulsa R (o haz clic en el hueco MEGA que sale junto a tus ataques). Solo una megaevolución por combate (para todo tu equipo).',
      'Animación al estilo de Pokémon X e Y: hélice de luz, silueta blanca, destello y símbolo mega. Cambian sprite, tipos, habilidad, ataque y velocidad; los PS no.',
      'Los rivales también megaevolucionan: Lucario de Corelia, Alakazam y Gardevoir de Dianta.',
      'Cambio de teclas: R ya no cambia de Pokémon. Usa 1 · 2 · 3 o haz clic en sus cuadritos.']},
    {t:'Habilidades de las megas', i:[
      'Estadísticas y habilidades de las 22 megas comprobadas con Bulbapedia: todas coinciden con los juegos.',
      'Nuevas habilidades que ya funcionan: Garra Dura, Amor Filial, Poder Arena, Potencia, Piel Feérica, Piel Helada y Rastro (copia la habilidad del rival). Las demás ya existían.']},
    {t:'Tienda', i:[
      'Nueva pestaña Megapiedras: 22 piedras a 3000 BP. Cada una solo se puede equipar en su Pokémon.',
      'Megas disponibles: Charizard X, Alakazam, Gengar, Kangaskhan, Aerodactyl, Mewtwo Y, Steelix, Houndoom, Tyranitar, Gardevoir, Mawile, Manectric, Camerupt, Altaria, Banette, Glalie, Latias, Latios, Lopunny, Lucario, Gallade y Diancie.']}
  ]},
  {v:'Kalos: la sexta Liga', date:'30 oct 2026', sections:[
    {t:'Historia', i:[
      'Llega Kalos: 8 gimnasios (Violeta, Lino, Corelia, Amaro, Lem, Valeria, Ástrid y Édel), Alto Mando de 4 (Malva, Narciso, Tileo y Ágata) y la Campeona Dianta. 13 combates con 6 Pokémon cada uno. Se abre al ser Campeón de Teselia.',
      'Cada gimnasio tiene su fondo animado: invernadero, rocódromo con cascadas, pista de patinaje y dojo, casa del árbol, torre tecnológica, pasarela con sakuras, observatorio sobre el cosmos y laberinto de hielo con ventisca.',
      'Recompensa: 5 Chapas Doradas + 5 Plateadas + 10 tiradas por victoria.']},
    {t:'Música', i:[
      'Música por regiones: Kanto, Johto, Hoenn, Sinnoh, Teselia y Kalos tienen su carpeta con la música de sus líderes, su Alto Mando y su Campeón, y su tema de victoria al ganar.']},
    {t:'Mega-Aro', i:[
      'Nuevo logro «Mega-Aro»: al ser Campeón de Teselia recibes el Mega-Aro (se guarda en Mochila › Objetos clave). Con él puedes megaevolucionar en combate.',
      'Nuevos logros: Líderes, Alto Mando y Campeona de Kalos, y Maestro de seis Ligas (6000 BP + 35 tickets).']}
  ]},
  {v:'Panel VS', date:'30 oct 2026', sections:[
    {t:'Combate', i:[
      'Antes de cada combate de Historia y del Campo de Entrenamiento sale el panel VS: tú en rojo a la izquierda y el rival en azul a la derecha, con sus nombres, sus retratos y los Pokémon de cada equipo.',
      'Se cierra solo a los pocos segundos. Clic o Enter lo salta, y Esc lo cancela y vuelves al menú.']},
    {t:'Perfil', i:[
      'Nuevo apartado «Personaje»: elige si sales como chico o como chica en el panel VS.']}
  ]},
  {v:'Amuleto Arcoíris', date:'26 oct 2026', sections:[
    {t:'Colección', i:[
      'Nuevos logros «Pokédex de Kanto, Johto, Hoenn...»: completa la Pokédex de una región y, al reclamar el logro, te dan el Amuleto Arcoíris de esa región (más 1500 BP y 10 tickets).',
      'Con el amuleto, el shiny sale al 3% en vez del 1% en el Gachapon de esa región. Cada región tiene el suyo.',
      'Lo ves en la Mochila, en el logro y en la tabla de probabilidades del Gachapon.']}
  ]},
  {v:'Teselia: la quinta Liga', date:'26 oct 2026', sections:[
    {t:'Historia', i:[
      'Llega Teselia (Unova): 10 combates de gimnasio, Alto Mando de 4 y el Campeón Mirto, 15 combates con 6 Pokémon cada uno. Se abre al ser Campeona de Sinnoh.',
      'En Ciudad Gres vences a los tres hermanos, uno detrás de otro: Zeo (fuego), Maíz (agua) y Millo (planta).',
      'El gimnasio de Iris en Ciudad Caolín sale al azar en su versión Blanco (oriental) o Negro (tecnológica).',
      'Cada uno tiene su fondo propio: restaurante, museo, panal, parque de atracciones, mina, hangar, cueva helada, dojo, casino y más. Recompensa: 5 Chapas Doradas + 5 Plateadas + 10 tiradas.']},
    {t:'Logros', i:[
      'Nuevos logros: Líderes, Alto Mando y Campeón de Teselia, y Maestro de cinco Ligas (5000 BP + 30 tickets).']}
  ]},
  {v:'Rivales rápidos, más justos', date:'26 oct 2026', sections:[
    {t:'Combate', i:[
      'Los rivales que sumaban Agilidad y Pañuelo Elección (como el Aerodactyl de Lance o el de Hoenn) iban más de dos veces más rápidos y no había manera de alcanzarlos.',
      'Ahora en un rival la velocidad extra de la mejora, el Pañuelo y la habilidad juntos tiene un tope (×1,35, como un Pañuelo solo). Tus Pokémon siguen igual.']}
  ]},
  {v:'Shuriken de Agua e Ímpetu Arena', date:'26 oct 2026', sections:[
    {t:'Ataques nuevos', i:[
      'Llega el Shuriken de Agua, el ataque de Greninja: lanza tres shuriken de agua giratorios que se clavan en el rival. Greninja ya lo lleva de serie.',
      'Se puede enseñar con MT en la tienda a Greninja y a Accelgor, los únicos Pokémon que lo aprenden en los juegos.']},
    {t:'Habilidades', i:[
      'Nueva habilidad Ímpetu Arena: dobla la Velocidad con tormenta de arena y no sufre la arena. Es la de Drilbur y Excadrill (cambia a Robustez, que tenían antes).',
      'El Excadrill del Duque Wikstrom la usa con Tormenta de Arena para activarla.']}
  ]},
  {v:'7 entrenadores nuevos en Difícil', date:'26 oct 2026', sections:[
    {t:'Campo de Entrenamiento', i:[
      'La dificultad Difícil pasa de 3 a 10 entrenadores: Ocultista, Ivor, Maestro Kamado, Chica Kimono, Palmer, Veterano y Duque Wikstrom.',
      'Cada uno lleva un equipo de 4 Pokémon pensado para su aspecto: fantasmas, puños, fuego, danza, pesos pesados, los iniciales de Kanto y acero.',
      'Para desbloquear el final del Campo ahora hay que vencer a los 10.']}
  ]},
  {v:'Chapas: más baratas y más premios', date:'25 oct 2026', sections:[
    {t:'Tienda', i:['La Chapa Dorada (antes 60 PB) y la Chapa Plateada (antes 40 PB) cuestan ahora 20 PB cada una.']},
    {t:'Campo de Entrenamiento', i:['Cada victoria da ahora más premio según la dificultad: Fácil 50 BP y 5 chapas de cada tipo, Media 100 BP y 10 de cada, Difícil 150 BP y 15 de cada (antes siempre 50 BP y 5 de cada).',
      'La tirada de Gachapon por victoria sigue igual.']}
  ]},
  {v:'Nuevos puños', date:'25 oct 2026', sections:[
    {t:'Ataques nuevos', i:[
      'Llegan 5 golpes de puño para el clic izquierdo: Puño Fuego, Puño Hielo, Puño Trueno, Puño Bala y Puño Sombra.',
      'Cada uno tiene su propia animación: el puño sale disparado y deja llamas, cristales de hielo, rayos, destellos de acero o sombras.',
      'Se compran como MT en la tienda y algunos Pokémon que pueden aprenderlos ya los llevan de serie.']}
  ]},
  {v:'El rival se aparta cuando caes', date:'25 oct 2026', sections:[
    {t:'Combate', i:[
      'Cuando se debilita tu Pokémon, el rival ya no se queda esperando a pegarte: se aleja en el momento en que caes, igual que cuando cambias tú.',
      'Sigue sin atacar mientras entra tu siguiente Pokémon y un momento después.']}
  ]},
  {v:'Las mejoras (Q) ya hacen lo que dicen', date:'25 oct 2026', sections:[
    {t:'Combate', i:[
      'Antes todos los ataques de la tecla Q daban lo mismo (+30 % de daño y +25 % de velocidad). Ahora cada uno hace lo suyo durante 5 segundos.',
      'Ataque: Danza Espada, Maquinación, Afilar, Desarrollo... Velocidad: Agilidad, Pulimento, Viento Afín. Defensa: Defensa Férrea, Armadura Ácida, Amnesia, Refugio.',
      'Neblina evita que te bajen las estadísticas y Campo Neblinoso evita que te pongan estados.',
      'Día Soleado, Danza Lluvia y Tormenta de Arena cambian el clima del combate.',
      'Los rivales que usan estos ataques también los aprovechan, así que algunos combates cambian un poco.']},
    {t:'Tienda', i:['La descripción de cada MT de mejora dice exactamente lo que hace.']}
  ]},
  {v:'Tienda: nuevo diseño y todos los MTs', date:'25 oct 2026', sections:[
    {t:'Tienda', i:[
      'Los MTs ya no cambian cada día: están los 98 siempre a la venta y sin límite de unidades.',
      'La pestaña ahora se llama «MTs» y tiene filtros por hueco y por tipo.',
      'Nuevo buscador por nombre, que funciona en todas las pestañas.']},
    {t:'Nuevo diseño', i:[
      'La tienda estrena diseño de escaparate: toldo, categorías a la izquierda, objetos en estantes y un panel de detalle a la derecha.',
      'Cada MT tiene ahora su descripción: qué es el ataque y qué hace en el juego (daño, energía, recarga o estado que pone).',
      'El panel de cada MT te dice si tu equipo puede aprenderlo y qué Pokémon.']}
  ]},
  {v:'Habilidades en combate', date:'25 oct 2026', sections:[
    {t:'Habilidades', i:[
      'Las habilidades ya funcionan en combate, las de tus Pokémon y las de los rivales. Se ven en el marcador y sale su nombre cuando se activan.',
      'Hay clima: Sequía, Llovizna, Nevada y Chorro Arena cambian el combate durante 20 s.',
      'Estado nuevo: Enamorado (Gran Encanto).',
      'Cuatro habilidades todavía no hacen nada porque el juego no tiene lo que mencionan: Humedad, Viscosidad, Metal Pesado y Escudo Magma.']},
    {t:'Equilibrio', i:[
      'Probamos las 96 habilidades en miles de combates simulados y bajamos las que ganaban casi solas (Energía Pura, Técnico, Adaptable, Intimidación, Presión, Piel Tosca, Cuerpo Maldito, Superguardia...). Intimidación y Presión ahora son un 7 %.']},
    {t:'Ataques (MT)', i:[
      'Nueva MT Hipnosis (duerme al rival) y MT Bola Sombra, las dos siempre en la tienda.']},
    {t:'Equipos', i:[
      'Los equipos sin usar ahora empiezan vacíos: ya no copian el que tenías.']}
  ]}
];
const patchLatest = () => PATCHES[0] ? PATCHES[0].v : '';
function patchOpen(){
  if(document.getElementById('patchOv')) return;
  const o = document.createElement('div'); o.id = 'patchOv'; o.className = 'dlOv';
  const esc = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;');
  o.innerHTML = `<div class="dlBox pnBox"><button class="dlx" id="patchX">✕ Cerrar</button><h2>Notas del parche</h2>` +
    PATCHES.map((p,k) => `<section class="pn${k ? ' old' : ''}"><h3>${esc(p.v)}${k ? '' : ' <em>ÚLTIMO</em>'}<small>${esc(p.date || '')}</small></h3>` +
      p.sections.map(s => `<h4>${esc(s.t)}</h4><ul>${s.i.map(x => `<li>${esc(x)}</li>`).join('')}</ul>`).join('') + `</section>`).join('') + `</div>`;
  document.body.appendChild(o);
  o.onclick = e => { if(e.target === o) patchClose(); };
  document.getElementById('patchX').onclick = patchClose;
  save.patchSeen = patchLatest(); persist(); patchDot();
}
function patchClose(){ const o = document.getElementById('patchOv'); if(o) o.remove(); }
function patchDot(){ const b = document.getElementById('patchBtn'); if(b) b.classList.toggle('new', save.patchSeen !== patchLatest()); }
addEventListener('keydown', e => { if(e.code === 'Escape' && document.getElementById('patchOv')){ patchClose(); e.stopImmediatePropagation(); } }, true);
document.getElementById('patchBtn').onclick = patchOpen;
patchDot();

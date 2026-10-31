"use strict";
/* =====================================================================
   NOTAS DEL PARCHE: el botón de abajo a la izquierda del menú principal.
   Para añadir un parche nuevo: pon un bloque NUEVO ARRIBA del todo en PATCHES (el más nuevo va primero).
   Cada bloque: {v:'nombre del parche', date:'fecha', sections:[{t:'título del grupo', i:['frase 1','frase 2']}]}
   El botón enseña un punto rojo "NUEVO" hasta que abres las notas (save.patchSeen guarda el último que viste).
   ===================================================================== */
const PATCHES = [
  {v:'Pantalla VS online', date:'31 oct 2026', sections:[
    {t:'Combate online', i:[
      'Antes de cada combate online sale ahora la pantalla VS, igual que en la Historia: tú a la izquierda con tu personaje y tus 3 Pokémon, y tu rival a la derecha con el suyo.',
      'El combate empieza cuando los dos la habéis cerrado (se cierra sola a los pocos segundos, o con clic / Enter). Esc la cancela y vuelves al menú.',
      'Si ganas un combate online, sale el mismo cartel de «★ VICTORIA ★» que en la Historia, con el personaje de tu rival. Sigue sin dar recompensas.']}
  ]},
  {v:'Fondos de la tarjeta', date:'31 oct 2026', sections:[
    {t:'Perfil', i:[
      'Nuevo apartado Perfil › Fondo de la tarjeta: 54 ilustraciones de lugares de Pokémon Masters para poner de fondo en tu tarjeta de entrenador. Tus amigos también lo ven.',
      'Se desbloquean al derrotar al líder de gimnasio, al miembro del Alto Mando o al Campeón de ese lugar (en Fácil o en Difícil). Los bloqueados salen en gris con candado y al pulsarlos te dicen qué combate te falta.',
      'Algunos se consiguen de otra forma: el Monte Plateado de Red es gratis, la Cima de la Liga se desbloquea con tu primera Liga y los mapas de Kanto, Johto y Teselia con ser Campeón de esa región.']}
  ]},
  {v:'Sonidos al atacar', date:'31 oct 2026', sections:[
    {t:'Sonidos de combate', i:[
      'Ahora suena también el momento de lanzar cada ataque, y cada tipo suena distinto: golpe de brazo (cuerpo a cuerpo), disparo, brillo que sube (mejoras), onda rara (ataques de estado) y carga con «bum» (ataque fuerte).',
      'Los ataques del rival en la Historia suenan un poco más bajos que los tuyos para que no tapen el combate. Se controlan con el volumen de Efectos.']}
  ]},
  {v:'Cynthia', date:'31 oct 2026', sections:[
    {t:'Historia', i:['La campeona de Sinnoh ahora se escribe Cynthia en todo el juego (combates, logros y panel VS).']}
  ]},
  {v:'Más personajes', date:'31 oct 2026', sections:[
    {t:'Personajes', i:[
      'Hay 10 personajes nuevos para el panel VS y tu tarjeta de entrenador: Ash, Lucas, Lyra, Maya, Nate, Akari, la chica kimono y N, más las versiones Masters de Lance y de N.',
      'Se desbloquean con logros nuevos (pestaña Entrenadores en Logros): consigue en shiny a tres Pokémon de su equipo (seis en las versiones Masters) y reclama el logro.',
      'En Perfil › Personaje salen todos; los que aún no tienes se ven como una silueta con candado, y al pulsarlos te dicen qué logro te falta.']}
  ]},
  {v:'Tu entrenador en la tarjeta', date:'31 oct 2026', sections:[
    {t:'Perfil de amigos', i:[
      'En la tarjeta de entrenador, el recuadro de «Logros destacados» se ha sustituido por tu personaje (Red, Leaf o Red Masters, el que elijas en Perfil › Personaje), centrado abajo a la derecha. Se sigue viendo el número de logros en las cifras de arriba.',
      'Los personajes nuevos se desbloquean con logros (mira «Más personajes»).']}
  ]},
  {v:'Controles y música', date:'31 oct 2026', sections:[
    {t:'Ajustes', i:[
      'Música separada: ahora tienes un volumen para la música del menú y otro para la música de combate (y de victoria), además del volumen general y el de efectos. Se pueden subir más que antes.',
      'Controles editables: en Ajustes › Controles pulsa un recuadro y luego la tecla (o el botón del ratón, incluida la rueda y los botones laterales) que quieras para cada acción. Cada acción tiene dos huecos.',
      'Se pueden cambiar movimiento, Carrera, Golpe, Disparo, Mejora, Ataque fuerte, Megaevolución y el cambio de Pokémon 1 · 2 · 3. Si eliges una tecla que ya usa otra acción, se intercambian. Retroceso vacía un hueco, Esc cancela.',
      'Esc (pausa) y M (silenciar) siguen siendo fijas. «Restablecer controles» vuelve a las de siempre.',
      'La barra de ataques, los cuadritos del equipo y el aviso de megaevolución enseñan tus teclas. Tus controles se guardan también en tu cuenta. En los combates online cada jugador usa los suyos.']},
    {t:'Logros', i:[
      'Pantalla de Logros nueva, en lista compacta: cada logro es una fila fina con su icono, el nombre, la descripción, la barra de progreso y el botón de reclamar a la derecha. Caben muchos a la vez.',
      'Arriba ves cuántos llevas, una barra de progreso, «Reclamar todo» y «Ocultar reclamados». Los que ya puedes reclamar salen juntos en una sección verde al principio.',
      'Pestañas: Todos, Historia, Campo, Colección y Secretos. Los de Historia se agrupan por región.',
      'Logros secretos: hay 9 que salen como «???» con una pista. Hasta que los consigas no se sabe qué piden ni qué dan.',
      'Recompensas especiales: algunos logros dan un título (aparece bajo tu nombre) o un marco para tu avatar. Se desbloquean al reclamar el logro y los eliges en Perfil › Título y marco.']},
    {t:'Perfil de amigos', i:[
      'Ahora puedes abrir la tarjeta de entrenador de tus amigos: en Amigos, junto a cada uno, hay un botón «Perfil». La tarjeta tiene el color de su marco, un número de entrenador y enseña su avatar, su título, sus cifras (Pokémon, shinies, logros, secretos, Ligas y victorias del Campo), los trofeos de las 9 Ligas en una estantería (los que no has ganado salen apagados), sus 3 Pokémon favoritos y sus logros más destacados. Si tiene un favorito shiny, la tarjeta brilla.',
      'Al lado de cada cifra sale la tuya («Tú: ...») para comparar. Si está en línea, también puedes desafiarle desde su perfil.',
      'Tu propia tarjeta sale arriba de la pantalla Perfil y se actualiza sola al cambiar el avatar, el marco, el título, el nombre o los favoritos. Solo la ven tus amigos aceptados; no se ve tu partida ni tus BP o tickets. Abajo del Perfil puedes ocultarla.']},
    {t:'Equipo Pokémon', i:[
      'Pantalla rehecha con estilo PC de Pokémon, sobre un fondo oscuro liso: a la izquierda tus equipos, en el centro el equipo activo (3 huecos) y debajo toda tu Caja, y a la derecha la ficha del Pokémon que marques.',
      'La Caja es una rejilla con buscador (nombre o número), tipo, rareza, región, orden (número, nombre, rareza, más usados, favoritos) y filtros de favoritos y shiny. Los que ya llevas en el equipo salen en verde con su número.',
      'Para armar el equipo: pulsa un Pokémon de la Caja y usa «Añadir al equipo» o «Sustituir a...», haz doble clic para añadirlo directo, o arrástralo a un hueco. Arrastrando los huecos entre sí cambias el orden.',
      'La lista de equipos tiene buscador y filtros (Todos, Favoritos, Completos, Vacíos). Sigues teniendo hasta 18 equipos, con nombre, favorito y borrar.',
      'El objeto de cada Pokémon se cambia directamente en su hueco del equipo. La ficha de la derecha enseña habilidad, naturaleza, ataques y estadísticas (más claras y sin amontonarse), y «Ver datos» abre el entrenamiento de siempre.',
      'Todo es más grande y se adapta al tamaño de la ventana; en la lista de equipos los sprites son grandes para reconocer cada equipo.']},
    {t:'Marcos de avatar', i:[
      'Marcos rediseñados: ahora son una banda de metal con luz y sombra, línea oscura por fuera y por dentro y un remache en cada esquina. Bronce, Plata y Oro tienen su propio acabado metálico.',
      'Brillo lleva un destello que recorre el borde; Arcoíris y Mewtwo shiny tienen los colores girando alrededor del avatar.']},
    {t:'Cuenta', i:[
      'Nuevo enlace «¿Has olvidado la contraseña?» al entrar: te llega un correo para elegir una nueva.',
      'Con la sesión iniciada puedes cambiar la contraseña (Amigos › Cambiar contraseña). El botón Cerrar sesión sale ahora en todas las pantallas de la cuenta.']},
    {t:'Personajes', i:[
      'El chico del panel VS ahora es Red de 3.ª generación (el anterior salía mal recortado). La chica sigue igual.',
      'Nuevo personaje «Red Masters», exclusivo de la cuenta yumbax: aparece en Perfil › Personaje solo con esa cuenta.']},
    {t:'Combate online', i:[
      'Arreglada la causa principal del aviso «Combate cancelado: los dos combates se han descuadrado»: el campo medía distinto según la forma de la ventana de cada jugador, así que los dos combates no eran idénticos. Ahora el combate online usa una arena de tamaño fijo para los dos (si tu ventana es más ancha, salen barras oscuras a los lados). Los dos tenéis que recargar la página (Ctrl+F5).',
      'Si vuelve a pasar, la consola del navegador (F12) ahora dice qué dato exacto difiere, para poder arreglarlo.',
      'Arreglado el aviso «Combate cancelado: los dos combates se han descuadrado»: lo causaban los nuevos sonidos de golpe. Los dos jugadores tenéis que recargar la página (Ctrl+F5) para tener la versión nueva; con versiones distintas el juego no deja jugar.']},
    {t:'Gachapón', i:[
      'Resumen de las 10 tiradas rediseñado: cartas más grandes con la bola de su rareza arriba, sprites mucho más grandes y nítidos (y animados), sombra en el suelo, naturaleza si es nuevo y brillo en las raras y shiny.']},
    {t:'Panel VS', i:[
      'Pantalla VS rediseñada: corte en diagonal, retratos grandes recortados como pegatinas, nombres en placas inclinadas y destello al aparecer el VS.',
      'El fondo del rival toma el color de su tipo cuando es un líder (Brock en tonos roca, Misty en agua...). Tus Pokémon y los del rival salen en aros del color de su tipo.']},
    {t:'Sonidos de combate', i:[
      'Los golpes ahora suenan según la eficacia: golpe normal seco, «¡Muy eficaz!» más fuerte y crujiente con doble impacto, «Poco eficaz» sordo y flojo, y casi silencio cuando «Sin efecto».',
      'También suenan la carrera (dash), el golpe crítico (una chispa extra), la esquiva y cuando un Pokémon se debilita. Se controlan con el volumen de Efectos de sonido y se silencian con la tecla M.']},
    {t:'Música', i:[
      'La música del combate empieza a sonar ya en la pantalla VS (líderes, Alto Mando, Campeones y Campo de Entrenamiento), sin esperar a que empiece la pelea. Si cancelas con Esc, vuelve la del menú.']},
    {t:'Dificultad de la Historia', i:[
      'La Historia tiene ahora dos dificultades, Fácil y Difícil, con un botón arriba de la pantalla Historia. Cada una tiene su propio avance: puedes cambiar cuando quieras y sigues donde lo dejaste en esa.',
      'En Fácil los rivales tienen bastante menos vida, hacen menos daño y reaccionan más despacio. En Difícil todo es como siempre.',
      'Las partidas que ya llevaban progreso están en Difícil, con su avance intacto. Las partidas nuevas empiezan en Fácil.',
      'Lo que superas en Difícil cuenta también en Fácil, así que si ya habías avanzado en Difícil lo tienes hecho en Fácil. Al revés no: lo que haces en Fácil no adelanta Difícil.',
      'Una Liga superada en cualquiera de las dos cuenta para los trofeos, la Torre Batalla, los logros y tu perfil. Las recompensas de cada combate solo se dan la primera vez que lo superas.']},
    {t:'Marcos', i:[
      'Marco nuevo «Mewtwo shiny»: cambia de verde esmeralda a morado psíquico. Se desbloquea con un logro secreto: consigue a Mewtwo shiny.',
      'Los marcos que se mueven (Brillo, Arcoíris y el nuevo) ahora cambian de color de forma suave.']},
    {t:'Combate online', i:[
      'Estadio nuevo para el PvP: el Coliseo. Es de noche, con focos que barren el campo, una grada llena de público (azul a la izquierda, rojo a la derecha) que hace la ola, agita barras de luz y saca flashes, y una gran Poké Ball pintada en el centro.',
      'El suelo se tiñe de azul a la izquierda y de rojo a la derecha, con líneas de neón y un círculo de salida para cada bando.']}
  ]},
  {v:'Barras de IV y EV', date:'31 oct 2026', sections:[
    {t:'Equipo Pokémon', i:[
      'Pantalla nueva y más cómoda: arriba tienes la barra con el buscador, el orden, el filtro por tipo y el botón «+ Nuevo equipo».',
      'Ahora puedes tener hasta 18 equipos. Cada uno se puede marcar como favorito (★), renombrar (✏️) o borrar (🗑️, pulsando dos veces).',
      'Las tarjetas enseñan sprite, tipos, naturaleza, habilidad, objeto y los 4 ataques. «Ver detalles» y «Cambiar» actúan sobre el Pokémon que tengas seleccionado.',
      'Los sprites se ven mucho más grandes, tanto en la lista de equipos como en las cajas del selector «Cambiar».',
      'Bajo cada trofeo de la estantería aparece el nombre de su región.',
      'Debajo se ven las debilidades y resistencias del equipo. Se sigue pudiendo arrastrar las tarjetas para ordenar.']},
    {t:'Cuenta', i:[
      'Nuevo: en Amigos puedes crear una cuenta (nombre de jugador, email y contraseña) para guardar tu partida en internet y jugarla desde otro ordenador. Es opcional.',
      'Tu partida se sube sola unos segundos después de cada cambio. Si ya tenías partida y la cuenta tiene otra, el juego te pregunta cuál conservar (y guarda una copia de seguridad).',
      'Lista de amigos: busca a un jugador por su nombre, envíale una solicitud y, cuando la acepte, aparecerá en tu lista. Las solicitudes recibidas se aceptan o se rechazan desde la misma pantalla.',
      'Verás qué amigos están en línea (punto verde) y podrás desafiarlos. Te avisa una ventana con Aceptar o Rechazar en cualquier pantalla del juego (el desafío caduca a los 30 segundos).',
      '¡Combate online en tiempo real! Cuando un amigo acepta tu desafío, los dos entráis a la arena con vuestros equipos de 3 Pokémon (hace falta un equipo completo). Cada uno controla el suyo con sus teclas de siempre, incluidos el cambio de Pokémon (1·2·3) y la megaevolución (R).',
      'Es un combate amistoso: no da recompensas ni toca tu progreso. Con Esc puedes abandonar (el combate no se pausa) y al terminar tienes un botón de Revancha.',
      'El combate online intenta una conexión directa entre los dos jugadores para que haya menos retraso. Abajo a la izquierda se ve el retraso y si va por «conexión directa» o «por servidor».',
      'Los dos jugadores deben tener la misma versión del juego: si no coincide, el juego te lo dice y basta con recargar la página (Ctrl+F5).']},
    {t:'Ver datos', i:[
      'Los IVs y los EVs se suben con barras que arrastras (antes eran botones +5 / +10). Cada paso gasta una Chapa Dorada (+5 IV) o Plateada (+10 EV).',
      'Los cambios se aplican con el botón «Aplicar cambios» (o «Deshacer» para soltarlos); no se gasta ninguna chapa hasta entonces.']}
  ]},
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

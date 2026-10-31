# Champions Crown

**Autor:** Diego Fernández Ortega · GitHub: [DiegoFdzOrtega](https://github.com/DiegoFdzOrtega) · Código bajo licencia [MIT](LICENSE) (los sprites y la música tienen sus propias licencias: ver «Créditos y avisos legales»).


*Road to Champion · juego de combates 2D en tiempo real. La **Torre Batalla** es el modo final del juego: se desbloquea al vencer a todas las Ligas.*

Cómo ejecutarlo: abre la carpeta en VS Code y usa Live Server sobre `index.html`.

Carpetas de imágenes (junto a `index.html`):
- `pokemon/<número de Pokédex>/Idle.png, Walk.png ...` y los shiny en `pokemon/<número>/s/Idle.png ...`
- `lideres/brock.png, misty.png, lt_surge.png, erika.png, koga.png, sabrina.png, blaine.png, giovanni.png, lorelei.png, bruno.png, agatha.png, lance.png, azul.png` (tu carpeta real es `lideres/Kanto/Brock.png`, `Lt_Surge.png`, `Azul.png`...; las rutas que se prueban están en `LEADER_PATHS` en data.js)

## Estructura
- index.html: la página (lienzo a pantalla completa y todas las pantallas)
- css/style.css: el aspecto
- js/pokedata.js: los 1025 Pokémon (nombre, tipos y estadísticas base), una línea por Pokémon y región. Se carga ANTES que data.js
- js/data.js: tipos, rareza, naturalezas, equipos de los líderes, objetos, tienda y reglas del Gachapon (lo que más vas a editar). Aquí puedes rellenar LORE[nº] y ABILITIES[nº] para la Pokédex
- js/sprites.js: carga las hojas y detecta solo el tamaño de cada cuadro; retratos de líderes (si dos cuadros seguidos se leen como uno y el Pokémon sale duplicado, como Dreepy o Dugtrio, `analyze()` lo corrige solo comparando las dos mitades de cada cuadro; afectaba a 19 Pokémon)
- js/state.js: tamaño del lienzo, partida guardada (save) y creación de combates
- js/friendprofile.js: perfil de amigos (tarjeta pública de cada jugador, pantalla para verla y botón en Amigos; ver «Perfil de amigos»)
- js/combat.js: movimiento, ataques, daño, efectos de los objetos y cambio de Pokémon (la IA del rival se llama desde aquí)
- js/status.js: estados (paralizado, envenenado, quemado, dormido, confuso, enamorado) y los 7 ataques que los ponen; los números están en `STX`
- js/abilities.js: las habilidades en combate (las ~100 que usan tus Pokémon y los rivales) y el clima; los números están en `ABX`
- js/shop.js: la Tienda con diseño «Escaparate» (categorías a la izquierda, estantes con los objetos, panel de detalle a la derecha).
- js/moveinfo.js: la descripción de cada ataque (`MOVE_DESC`, una frase por ataque) y `moveInfo()`, que saca daño, energía y recarga de los números reales del juego.
- js/qmoves.js: lo que hace cada ataque de la tecla Q (tabla `Q_FX`).
- js/patchnotes.js: el botón «Notas del parche» (abajo a la izquierda del menú) y el texto de cada parche. Para añadir uno nuevo, copia un bloque de `PATCHES` y ponlo el primero
- js/dificultad.js: la ventana para elegir Fácil o Difícil en la Historia (se elige una vez)
- js/vspanel.js: el **panel VS** que sale antes de cada combate (tu personaje chico/chica sale de `avatares/RED Y LEAF.png`)
- js/ai.js: la **IA del rival** (estilo melee / a distancia / mixto, esquiva, apunta con ventaja, gasta la energía con cabeza)
- js/background.js: fondo pixel art del menú
- js/teams.js: equipos competitivos de los 8 líderes, el Alto Mando y el Campeón (naturaleza, habilidad, objeto, IVs, EVs y movimientos) + la recompensa por vencer
- js/johto.js: la **Historia de Johto** (8 líderes, Alto Mando de 4 y Campeón, con sus equipos y recompensas)
- js/arenasjohto.js: los 13 fondos de combate de Johto
- js/hoenn.js: la **Historia de Hoenn** (8 líderes, Alto Mando de 4 y Campeón Plubio, con sus equipos de Pokémon Esmeralda y recompensas)
- js/arenashoenn.js: los 13 fondos de combate de Hoenn
- js/sinnoh.js: la **Historia de Sinnoh** (8 líderes, Alto Mando de 4 y Campeona Cintia, con sus equipos de Pokémon Platino y recompensas)
- js/arenassinnoh.js: los 13 fondos de combate de Sinnoh
- js/teselia.js: la **Historia de Teselia / Unova** (10 combates de gimnasio —Gres son tres: Zeo, Maíz y Millo—, Alto Mando de 4 y Campeón Mirto, con sus equipos de Pokémon Blanco 2 / Negro 2 y recompensas)
- js/arenasteselia.js: los 14 fondos de combate de Teselia (el de Caolín tiene dos versiones: Blanco y Negro)
- js/kalos.js: la **Historia de Kalos** (8 líderes, Alto Mando de 4 y Campeona Dianta, con sus equipos de Pokémon X e Y y recompensas)
- js/arenaskalos.js: los 13 fondos de combate de Kalos (8 gimnasios + Alto Mando + Campeona)
- js/mega.js: el **Mega-Aro** (objeto clave), la tabla `MEGA` (22 megaevoluciones), las **Megapiedras** de la Tienda y toda la **Megaevolución** en combate (tecla R, aviso, animación estilo X/Y e IA del rival)
- js/campo.js: el **Campo de Entrenamiento** (30 entrenadores temáticos con equipos de 3-4 Pokémon; farmeo de chapas)
- js/bag.js: la pantalla **Mochila** (lo que tienes: tickets, mejoras, MTs y objetos de combate); cada MT tiene «Enseñar a un Pokémon» (mismas reglas que Ver datos)
- js/learnsets.js: qué Pokémon puede aprender cada movimiento (archivo generado por tools/gen_learnsets.py; ver «MTs y compatibilidad real de movimientos»)
- tools/gen_learnsets.py: genera js/learnsets.js a partir de los CSV de PokéAPI
- js/casa.js: la **casa del Equipo Pokémon** (fondo `fondos/casa.png` + trofeos de las Ligas y los 3 favoritos del perfil animados). Interruptor `TEAM_HOUSE` para volver al diseño antiguo
- js/room.js: la habitación antigua del Equipo Pokémon (chimenea con fuego animado, vitrina, estanterías, ventana de noche y la estantería de trofeos de las Ligas). Sigue ahí como alternativa y como plan B si la casa no carga
- js/arenas.js: los 13 estadios de combate de Kanto (un fondo pixel art por líder / Alto Mando / Campeón)
- js/render.js: arena (llama a drawArena), sombras, Pokémon y HUD del combate
- js/modes.js: Historia (un combate por líder)
- js/moves.js: lista de movimientos REALES de Pokémon por tipo y hueco (MOVESET) y asignación automática de 4 movimientos a cada Pokémon (los de CUSTOM en data.js se respetan)
- js/fxpunch.js: los 5 puños (Puño Fuego, Hielo, Trueno, Bala y Sombra): el dibujo del puño y la animación de cada uno
- js/fx.js: motor de efectos de ataque (lista de efectos, partículas, temblor, aura) y los "ganchos" que usa combat.js: fxMelee, fxShotStart, fxShot, fxHit, fxBuff, fxAura
- js/fxlib.js: herramientas de dibujo pixel art (polígonos, rayos, esferas, llamas, marcas de garra...)
- js/fxmelee.js: animaciones de los ataques cuerpo a cuerpo (Placaje, Arañazo, Mordisco, Excavar, Golpe Roca...)
- js/fxshots.js: chorros, rayos y proyectiles en vuelo (Lanzallamas, Rayo, Hoja Afilada...) y sus estelas
- js/fxextra.js: impactos de cada movimiento y animaciones de las mejoras (Danza Espada, Día Soleado...)
- js/fxstatus.js: dibujos de los ataques de estado, al estilo del anime (proyectil, estela, impacto, aura y etiquetas PAR/TOX/QUE/DRM/CNF)
  Los efectos se dibujan por código sobre el lienzo (no usan imágenes). Para añadir un movimiento nuevo: ponlo en MOVESET (moves.js) y crea su receta en FXR.melee / FXR.flight (+ FXR.stream) / FXR.buff+FXR.aura; FXR.impact es opcional (si no, usa el impacto de su tipo).
- js/victoria.js: la **pantalla de victoria** con las recompensas en tarjetas con icono (ver la sección «Pantalla de victoria»)
- js/swap.js: la **animación de cambio de Pokémon** estilo anime (rayo rojo de retirada, Poké Ball que vuela y se abre, salida con destello); ver la sección «Animación de cambio de Pokémon»
- js/economy.js: comprar en la tienda y tirar del Gachapon (solo reglas)
- js/menu.js: menú principal, Historia, Tienda, Ajustes
- js/team.js: Equipo Pokémon estilo PC (equipos, 3 huecos, caja en rejilla con filtros, ficha del Pokémon y arrastrar y soltar)
- js/pokedex.js: Pokédex avanzada (pestañas por región, filtros, orden, rejilla y panel de detalle)
- js/avatars.js: avatares (carpeta avatares/, save.avatar) y la barra de usuario con las migas Perfil › Logros › Amigos. Un avatar con nombre de Pokémon se desbloquea al conseguir ese Pokémon. Para añadir uno: copia la imagen a avatares/ (si abres el juego con un servidor que muestre el listado de carpetas sale sola; si no, añade el nombre a AVATAR_FILES). El juego ya no tiene nivel de jugador
- js/gachapon.js: pantalla del Gachapon multi-región y la animación de la tirada. La máquina tiene Poké Balls por rareza dentro de la cúpula (BALLS: Común=Poké Ball, Poco común=Superball, Rara=Ultra Ball, Épica=Honor Ball, Legendaria=Master Ball, Shiny=bola dorada). En cada tirada una bola del tipo del premio real baja por el desagüe, sale por la ranura, cae con gravedad, rebota con sombra y se abre (startEngine). Los efectos por rareza están en impactFx(); los tiempos, en T_SHAKE/T_PICK/T_SINK/T_CHUTE/T_EXIT. Las probabilidades NO se tocan aquí (están en economy.js/data.js). **Pantalla de entrada (rediseño):** a la izquierda hay una máquina de pixel-art animada (flota, brilla y las bolas del interior se mueven; si la tocas, se agita y no gasta tickets). El fondo (`#gcBg`, un canvas) tiene partículas y se tiñe con el color de cada región (`--c` en `#gachav`, `.banner`). Los 6 destacados son tarjetas grandes que flotan, con brillo propio por rareza y un ✔ si ya los tienes. Los botones de tirada llevan icono de ticket y se apagan si no hay tickets. La barra de garantía de legendaria se llena con degradado y, al llegar a 69/70, avisa «¡La próxima tirada es legendaria!». Los chips de arriba (tickets, especiales, PB) se actualizan solos. Con `prefers-reduced-motion` se quitan las animaciones. Los estilos están en la zona `/* Gachapon */` de css/style.css
- js/ui.js: teclado y ratón; arranca el juego

Los archivos se cargan en ese orden (está en index.html) y comparten sus variables.
La partida se guarda en el navegador (localStorage, clave arena2d_v2): save.bp, save.tickets, save.items, save.equip, save.box...

Equipo Pokémon: los Pokémon que tienes shiny muestran un botón ⭐ (en la tarjeta y en la ranura del equipo) para elegir entre su versión shiny o la normal; lo elegido se guarda en save.shinyOff (lista de los que NO se usan shiny) y useShiny(nº) lo consulta en combate y retratos.
Pokédex y Gachapon usan save.box (los que tienes), save.shiny, save.fav, save.nat (naturaleza), save.pity (tiradas sin legendaria por región) y save.used (veces usado).
(Los botones de MODO PRUEBA de Ajustes ya se han eliminado; el menú de Ajustes solo tiene Pantalla completa y Audio.)


## Liga de Kanto (Historia)
- Orden: 8 líderes (DIFÍCIL, NV 120) -> Alto Mando: Lorelei, Bruno, Agatha, Lance (MUY DIFÍCIL, NV 125-132) -> Campeón Azul (MUY DIFÍCIL, NV 135, equipo fijo siempre igual).
- Todo está en `FLOORS` y `DIFF` (js/data.js). El motor no tiene niveles: `floorStats()` convierte el nivel en multiplicadores de vida, daño y velocidad.
- Un rival del Alto Mando/Campeón se define como `{dex, mv:[golpe, disparo, mejora, ataque fuerte]}` con movimientos reales; los líderes usan solo el nº de Pokédex.
- Cada victoria nueva desbloquea al siguiente; Azul se abre al vencer a Lance.

## Perfil y Logros
- `js/profile.js`: botón PERFIL. Nombre, avatar y 3 Pokémon favoritos distintos (se guardan en `save.profileFav`, aparte de los favoritos de la Pokédex y del equipo de combate). `PROFILE_ONLY_OWNED` decide si solo se pueden elegir los que ya tienes.
- `js/achievements.js`: botón LOGROS (ver la sección «Recompensas, Logros y Ajustes» más abajo). Ya **no hay regalo de tickets de prueba**: se empieza con 0 tickets.
- **Partida nueva:** empiezas con **0 BP y 0 tickets** (normales y legendarios) y solo con **Venusaur, Charizard y Blastoise** (la caja y el equipo son esos 3; está en `js/state.js`, `team` y `save.box`). El resto de Pokémon se consiguen en el Gachapon con tickets, que se ganan venciendo a líderes, Alto Mando y Campeones. Las partidas ya guardadas no cambian; para empezar de cero borra los datos del sitio en el navegador.
- En pantallas de menos de 880 px de alto, el menú principal pasa a 2 columnas para que quepan los 11 botones.

## Equipo Pokémon y entrenamiento (IVs, EVs, MTs, Chapas, Mentas, Cápsulas)
- `js/team.js`: panel del equipo con 3 tarjetas grandes (sprite, nombre, tipos, naturaleza, habilidad, **desplegable de objetos** con su descripción, **Ver datos**, **Cambiar**, ⭐ Shiny, ✕ quitar). «＋ Añadir Pokémon» abre un selector con toda tu colección (buscador, tipo, rareza, favoritos ★, shiny ⭐, regiones). Se cierra con «✕ Cerrar» o Esc. Siempre debe quedar al menos 1 Pokémon.
- `js/teamdata.js`: la ficha técnica (**Ver datos**): a la izquierda las **Estadísticas** a nivel 50 (solo se miran: Base + IV + EV, más la naturaleza = Total) y a la derecha el apartado **Entrenamiento** con los IVs y los EVs (aquí se suben con las Chapas), más naturaleza, habilidad y los 4 ataques. Desde ahí se gastan los objetos de mejora (con botón *Confirmar* para no gastarlos sin querer).
- `js/training.js`: toda la lógica y los datos. Los números están en `TRAIN` (precios, +IV por Chapa, EVs por rival, tope de stock…).
- **Chapa Dorada** (20 PB, `objetos/ivs/chapa-dorada.png`): +5 a un IV. **Chapa Plateada** (20 PB, `objetos/ivs/Chapa-plateada.png`): +10 EV a un stat. Los límites son los reales de los juegos: IV 0-31 por stat (186 en total) y EV 252 por stat útiles (el máximo teórico es 255) y 510 en total.
- **Restablecer** (en Ver datos): «↺ Restablecer IVs» vuelve los IV a 0 y devuelve las Chapas Doradas gastadas en ese Pokémon; «↺ Restablecer EVs» quita los EVs que dieron las Chapas Plateadas (los ganados en combate se quedan) y las devuelve. Pide confirmación. Datos: `save.ivBase`, `save.evCap`, `save.capUsed`.
- **Todos los Pokémon empiezan con IV 0 y EV 0 en todo** (da igual cuál sea o cómo lo consigas). La única forma de subirlos es gastar Chapas Doradas (IV) y Plateadas (EV) en la ficha. Las chapas se consiguen en la tienda y como recompensa al vencer a los líderes (5 + 5). Así cada chapa tiene sentido. **Menta** (120 PB): cambia la naturaleza a la que elijas. **Cápsula de Habilidad** (150 PB): cambia a la otra habilidad. **MT**: enseña un movimiento y sustituye al que haya en ese hueco (golpe, disparo, mejora o fuerte).
- **MTs en la tienda:** están **todos siempre a la venta** (103: todos los ataques de `MOVES` que algún Pokémon puede aprender; Afilar y Bomba Imán no entran porque nadie los aprende). Sin límite de unidades y sin cambio diario. Se ordenan por hueco, tipo y nombre.
- **Tienda > MTs:** precio según el hueco (Golpe 80, Disparo 90, Mejora 70, Fuerte 130 PB, en `TRAIN.price.mt`). Arriba hay un buscador y filtros de **Hueco** y **Tipo** (`shopSt` en `js/shop.js`).
- **Diseño de la tienda («Escaparate»):** toldo rojo y blanco con tus saldos, categorías a la izquierda, los objetos en estantes de madera con su precio colgando (punto de color = tipo del MT, `×N` = cuántos tienes) y, a la derecha, el panel del objeto elegido. En un MT el panel enseña **Qué es** (frase de `MOVE_DESC`), **Qué hace aquí** (daño, energía y recarga, o el estado que pone) y si **tu equipo puede aprenderlo** (con los sprites) y cuántos de tus Pokémon lo aprenden. Los colores y tamaños están en el bloque `sa-` de `css/style.css`. Para cambiar la descripción de un ataque, edita su línea en `MOVE_DESC`.
- Los IV y EV ya **no se sortean ni se ganan en combate** (`TRAIN.evPerFoe = 0`; si quieres que los rivales vuelvan a dar EVs, ponlo en 4). Para que el juego siga siendo justo, la referencia de las estadísticas es ahora «IV 0, EV 0, naturaleza neutra» (multiplicador ×1,00 en `refStat`), así que los rivales (que sí llevan IV 31 y EV) resultan relativamente más difíciles hasta que entrenes con chapas. Si te pasas de difícil, baja `ENEMY_POWER`.
- **Partidas antiguas:** al cargar un guardado anterior (`trainV` menor que 2) se ponen a 0 todos los IV y EV y se **devuelven las chapas** que habías gastado, para que las vuelvas a gastar como quieras.
- En combate (solo tus Pokémon) IV, EV y naturaleza cambian PS, daño, velocidad y resistencia. `TRAIN.power` (0.6) controla cuánto se nota (1 = igual que los juegos). Los ataques cambiados con MT también cambian el tipo del golpe.
- Habilidades: cada Pokémon tiene 2. Para poner las oficiales: `ABILITIES[25] = ['Elec. Estática', 'Pararrayos']` (data.js); si no, se reparten por tipo (`ABIL_POOL`). **Ya funcionan en el combate** (ver «Habilidades en combate»).
- En la partida (`save`): `iv`, `ev`, `abil`, `mv` (solo los huecos cambiados) y `nat` (ya existía). Los consumibles están en `save.items` como los demás objetos.

## Objetos y Tienda
- Las imágenes de los objetos están en `objetos/` (la ruta de cada una se define en `ITEMS`, js/data.js). Hay 16 objetos en 4 categorías: Ataque, Defensa, Tipos y Utilidad.
- Para añadir un objeto: una línea nueva en `ITEMS` (nombre, imagen, categoría, precio, descripción) y su efecto en `js/combat.js`. Los números de cada efecto están en `IFX` (data.js).
- `js/shop.js`: la Tienda (pestañas por categoría, orden, tarjetas con imagen, saldo, «Tienes / Equipados»). Los precios están en `ITEMS` (campo `p`).
- Las imágenes también salen en Equipo Pokémon (ranuras, tarjetas y mochila) y en el marcador del combate.
- Críticos: `CRIT` en data.js. El Periscopio suma `IFX.periscopio` a la probabilidad.

## Estadios de combate (js/arenas.js)
- Cada rival tiene su fondo, inspirado en los de Rojo/Azul/Amarillo y Rojo Fuego/Verde Hoja: **brock** (baldosa gris y muro de piedra), **misty** (rejilla azul y piscina), **lt_surge** (metal oscuro con paneles eléctricos), **erika** (madera/tatami, setos y macetas), **koga** (baldosa oscura y muros morados), **sabrina** (damero psicodélico), **blaine** (roca volcánica con grietas de magma), **giovanni** (metal gris con emblema y terminales), **lorelei** (bloques de hielo), **bruno** (roca marrón de cueva), **agatha** (baldosa sepulcral y ladrillo agrietado), **lance** (piedra pulida y almenas de castillo) y **azul** (baldosa clara con estrella, columnas y altar).
- `render.js` llama a `drawArena(id, t)` con el id del rival (`g.o.leader`) y el tiempo del combate. También valen los alias de `ARENA_ALIAS` (`blue`, `champion`, `campeon`, `surge`). Si el id no existe, se usa el fondo antiguo (`arenaFallback`), así que el juego nunca se queda sin fondo.
- **Rendimiento:** cada estadio se dibuja UNA vez en un lienzo pequeño (180 px de alto, ampliado x3 sin suavizar para que se vean los píxeles) y se guarda en `arCache`. Solo se vuelve a dibujar si cambia el ancho de la ventana. Por fotograma solo se pintan las animaciones ligeras (agua, chispas, brasas, velas...).
- **No tapa nada:** el fondo se pinta antes que sombras, Pokémon y HUD. Encima lleva una capa oscura (`dark`), una viñeta y dos degradados arriba y abajo para que el marcador y la barra de ataques se lean bien. Los muros laterales (`side`) existen porque el HUD tapa casi todo el muro de arriba.
- **Añadir un estadio:** en `ARENAS` pon `mi_id: { dark: .2, side: {base:'#...', mortar:'#...'}, build(P, w, h, WH){ ...dibuja el suelo y el muro, devuelve datos para anim... }, anim(c, t, data, w){ ...opcional... } }`. Después añade el id en `FLOORS` (data.js). `P` es el lienzo de píxeles (helpers `arHex`, `arMix`, `arLit`, `arDrk`).
- El emblema de Giovanni es una «G» roja original dentro de un círculo (no el logo exacto de Team Rocket).

## Equipos de los rivales (js/teams.js)
- Cada rival tiene 6 Pokémon distintos, sacados de sus apariciones oficiales (Rojo/Azul/Amarillo, Oro/Plata, Rojo Fuego/Verde Hoja y revanchas, Corazón/Alma, Let's Go, Stadium, anime). Como en cada juego llevan 4-5, el equipo junta los de todas sus apariciones: por ejemplo Brock usa su equipo de revancha de HGSS y Koga mezcla su gimnasio con el Alto Mando de Oro/Plata. Azul va sin su inicial, porque depende de lo que elijas tú.
- Cada Pokémon es una línea: `P(nº, 'Naturaleza', 'Habilidad', 'objeto', {EVs}, ['golpe','disparo','mejora','fuerte'])`. Todos tienen **IVs a 31**.
- **EVs** (puntos de esfuerzo): 252 como máximo en una estadística y 510 en total (se usan 252 + 252 + 4 = 508). Reparto por papel: atacante físico = Ataque + Velocidad, atacante especial = At. Esp. + Velocidad, tanque = PS + Defensa.
- **Naturaleza** según el papel (por ejemplo Alegre = +Velocidad −At. Esp. para los físicos rápidos; Osada = +Defensa para los tanques) y **habilidad** más competitiva que puede tener ese Pokémon.
- **Objeto**: uno de los de la Tienda (Restos, Vidasfera, Banda Aguante, Cinta/Gafas/Pañuelo Elección, Chaleco Asalto, Casco Dentado, etc.). Ojo: las Bayas no existen en este juego todavía; la Banda Focus es la Banda Aguante. En combate los objetos del rival funcionan igual que los tuyos.
- Cómo se nota en el combate: `enemyBoost()` convierte IVs, EVs y naturaleza en vida, daño, velocidad y resistencia con la misma fórmula que tus Pokémon. `ENEMY_POWER` (por defecto igual que `TRAIN.power`, 0,6) controla cuánto se nota y `ENEMY_SPEED_CAP` (1,25) limita el extra de velocidad. El nivel de cada rival y la dificultad (`FLOORS` y `DIFF` en data.js) se aplican encima. Si te resulta demasiado difícil, baja `ENEMY_POWER`.
- **Tope de velocidad del rival:** la mejora (Q, p. ej. Agilidad ×1,9), el Pañuelo Elección (×1,35) y la habilidad se multiplicaban entre sí y un rival como el Aerodactyl de Lance iba ×2,5 más rápido: imposible de alcanzar. Ahora, en un **rival**, esas tres cosas juntas no pasan de ×1,35 (`ENEMY_SPEED_BUFF_CAP` en `js/teams.js`, se aplica en `move()` de `js/combat.js`). Tus Pokémon no tienen este tope.
- La habilidad aparece en el marcador del rival (junto al objeto) y **funciona en el combate**, igual que las tuyas (ver «Habilidades en combate»).
- Al cargar la página se comprueban las reglas (6 sin repetir, IV 31, EV ≤ 252 y ≤ 510, objeto y movimientos válidos en su hueco). Si algo falla, sale un aviso en la consola; también puedes escribir `validateTeams()` en ella.
- **Recompensa:** al vencer a cualquier líder de gimnasio recibes **5 Chapas Doradas + 5 Chapas Plateadas + 10 tiradas de Gachapon** (`REWARD` en teams.js; ya no dan BP, ver "Recompensas, Logros y Ajustes" más abajo). Se dan en cada victoria; si prefieres solo la primera, pon `once: true`. El Alto Mando y el Campeón no las dan (para añadirlas: `alto: {...}` o `campeon: {...}` en `REWARD`). Las tarjetas de la Historia muestran la recompensa.

## Cinco equipos (js/state.js `initTeams`/`selectTeam`, js/team.js, final de css/style.css)
- Puedes tener **hasta 5 equipos** (`TEAM_MAX`), cada uno con **sus 3 Pokémon y sus propios objetos**. Uno está **activo**: es el que se usa al combatir y el que ven la Historia, el Campo y el menú.
- **Pestañas arriba** en Equipo Pokémon (con los Pokémon de cada equipo en miniatura) y un cuadro **Nombre del equipo** para renombrarlo (máx. 14 letras). Un equipo que aún no has usado pone «Vacío»: al abrirlo **empieza sin Pokémon** (tres huecos «＋ Añadir Pokémon») y lo rellenas tú. Mientras no tenga 3 Pokémon no se puede combatir con él (los botones de Historia y Campo se desactivan y el aviso te lo dice). El Equipo 1 nunca queda vacío.
- **Objetos por equipo:** el mismo Pokémon puede estar en varios equipos con objetos distintos. Los objetos «libres» se cuentan solo dentro del equipo activo, así que un Restos que tengas puede usarse en un equipo y en otro a la vez (es como un conjunto de objetos guardado para cada equipo). Para el resto del código no cambia nada: `team` y `save.equip` son siempre los del equipo activo.
- **Selector «Equipo»** en la pantalla de Historia y en la del Campo de Entrenamiento (`fillTeamSel` en team.js): cambias de equipo sin entrar a Equipo Pokémon.
- **Franja de debilidades** (`renderCov`): tipos a los que **2 o más** de tus Pokémon son débiles («Débiles a: Eléctrico 2/3») y tipos que resisten («Resisten bien»). Usa la tabla de tipos del combate (`CH`/`eff()`).
- **Cartas alineadas:** las tres cartas tienen ahora la misma estructura (la zona del objeto se reparte el hueco), así la naturaleza y la habilidad quedan a la misma altura.
- **Guardado:** `save.teams` = lista de `{n, mons, equip}` y `save.tsel` = el activo. Las partidas anteriores se migran solas: tu equipo de siempre y sus objetos pasan a ser el «Equipo 1». `persist()` guarda siempre el equipo activo (`teamSync`).

## Dificultad de la Historia: Fácil y Difícil, cada una con su avance (js/dificultad.js, `trk()` y `EASY` en js/data.js, `save.storyMode`, `save.easy`)
- **Qué es:** arriba de la pantalla Historia hay un botón doble **Fácil | Difícil** (con los combates superados de cada una). Puedes cambiar cuando quieras y **cada dificultad tiene su propio avance**: sus líderes superados, su Alto Mando y sus Ligas (para abrir la región siguiente hay que ser Campeón en la misma dificultad).
- **Dónde se guarda:** Difícil usa los campos de siempre (`save.record` para Kanto, `save.prog` para el resto, `save.champ`), así las partidas antiguas siguen intactas. Fácil usa `save.easy = {record, prog, champ}`. `trk(m)` (data.js) devuelve el objeto de la dificultad `m` (por defecto la activa, `save.storyMode`); `progOf(region, m)`, `setProg(region, n, m)` y `champOf(region, m)` lo usan. `progAny` y `champAny` miran las dos. **Lo que superas en Difícil cuenta también en Fácil** (en Fácil, `progOf` y `champOf` devuelven el mejor de los dos), así quien ya iba en Difícil lo tiene todo hecho en Fácil; lo de Fácil no adelanta Difícil.
- **Partidas antiguas / nuevas:** al cargar (`state.js`), una partida con progreso y sin `storyMode` empieza en `'dificil'` (como estaba). Una partida nueva empieza en `'facil'`. La elección se guarda y viaja a la nube con la partida.
- **Cómo cambia el combate:** `floorStats(n)` multiplica la vida (`hm`), el daño (`dm`), la reacción (`skill`) y la velocidad (`spdm`) del rival por `EASY = {hm:.60, dm:.50, skill:.70, spdm:.90}` (data.js) cuando la dificultad activa es Fácil. Difícil no multiplica nada. Los equipos del rival (Pokémon, objetos, ataques) son los mismos. Para equilibrar Fácil basta con tocar esos cuatro números.
- **Qué cuenta de las dos a la vez:** una Liga superada en **cualquiera** de las dos dificultades da el trofeo (room.js, casa.js), cuenta para la Torre Batalla (`leaguesWon`), los logros (`ACH_PROG`, `champion`) y la tarjeta del perfil. Las **recompensas** de un combate (`giveReward`) solo se dan la primera vez que lo superas en total (`o.floor > progAny(R)` en modes.js), así que no se pueden repetir cambiando de dificultad.
- **No afecta a:** el Campo de Entrenamiento (tiene sus niveles), el PvP ni la Torre.
- **Dónde se ve:** el botón está en la pantalla Historia (`#rMode`, lo pinta `storyToggle` desde `buildRegions` en menu.js). El título de la región también dice la dificultad («Historia · Kanto · Fácil») y la tarjeta Historia del menú.

## Equipo Pokémon estilo PC (js/team.js, final de css/style.css bajo `#teamv.pcv`)
**Esta sección sustituye a las tres de abajo sobre el Equipo Pokémon («diseño y fondo», «pantalla en lista» y «la casa»)**: ese código ya no está en `team.js` (sigue en el historial de git). `js/room.js` y `js/casa.js` siguen en el proyecto pero esta pantalla ya no los usa: el fondo es un degradado oscuro liso. `teamBgStop()` se sigue llamando al cerrar solo por seguridad.
- **Idea:** una sola pantalla como el PC de Pokémon, con tres zonas: **Equipos** (izquierda), **Equipo activo + Caja** (centro) y **Ficha** (derecha). Se abre con `openTeam(from)` (`from` = `'shop'`, `'story'` o `'campo'` para volver ahí al cerrar; Esc también cierra).
- **Equipos (`#tmTabs`, `#tmQuick`, `#tmSearch`):** hasta 18 (`TEAM_MAX`), con buscador (nombre del equipo o de un Pokémon), filtros Todos / Favoritos / Completos / Vacíos, miniaturas de los Pokémon, «+ Nuevo». El equipo activo sale marcado en dorado.
- **Equipo activo:** número y nombre editables (`#tmName`, 14 letras), ☆ favorito y 🗑️ borrar (hay que pulsarlo dos veces). Debajo, **3 huecos** (`.pcs`) con sprite grande, tipos y el **selector de objeto** (`itemDd`, se edita ahí mismo; los ataques se ven en la ficha), y la franja de debilidades / resistencias / cobertura (`renderCov`).
- **Caja (`#tmList`, `.pct`):** toda tu colección en rejilla, con buscador (nombre o nº), tipo, orden (número, nombre, rareza, más usados, favoritos), ★ Favoritos, ⭐ Shiny, rareza (varias a la vez) y pestañas de región con el contador de cada una (`TEAM_REGIONS`; Hisui sale de Galar, nº 899-905). Los Pokémon que ya van en el equipo salen en verde con su número. Los sprites se pintan al verse (`IntersectionObserver`).
- **Cómo se arma un equipo:** (1) clic en la caja = verlo en la ficha y desde ahí «Añadir al equipo» (o «Sustituir a ...» si ya hay 3); (2) doble clic = añadirlo directamente; (3) **arrastrarlo** de la caja a un hueco (solo ratón o lápiz; con el dedo se usa la ficha). Arrastrar un hueco sobre otro cambia el orden (el nº 1 sale primero). La ✕ de cada hueco lo quita (siempre queda 1). Un Pokémon ya en el equipo que se suelta en otro hueco se mueve ahí.
- **Ficha (`#tmSel`, `.pci`):** sprite, rareza, tipos, habilidad y naturaleza, ★ favorito, ⭐ Shiny/Normal, icono y nombre del objeto equipado (solo lectura; se cambia en el hueco), 4 ataques, barras de estadísticas (una línea por estadística; el EV/IV de cada una sale al pasar el ratón y los totales debajo) y los botones de acción. «Ver datos» abre la ventana de entrenamiento de siempre (`js/teamdata.js`, `#tmData`).
- **Datos:** no cambian (`save.box`, `team`, `save.teams`, `save.tsel`, `save.equip`, `save.fav`, `save.shiny`/`shinyOff`). Estado de la pantalla en `tm` (`tm.selD` = Pokémon de la ficha) y `tl` (filtro de la lista de equipos). Funciones que usan otros archivos y se mantienen: `openTeam`, `closeTeam`, `fillTeamSel`, `renderTeamSlots`, `typeBadges`, `closePick` (vacía), `tm.built`, `tm.from`.
- **Tamaño:** todo va en `em` y `#teamv.pcv` usa `font-size:clamp(9px,min(1.6vh,.85vw),19px)`, así que crece con la ventana. Hasta 1500 px de ancho las columnas laterales se estrechan (21em / 24em).
- **Pantallas pequeñas (≤1100 px):** las tres zonas se apilan en una columna con scroll.

## Equipo Pokémon: diseño y fondo (js/team.js, js/room.js, final de css/style.css)
- **Cabecera:** «Equipo Pokémon» a la izquierda y, a la derecha, «Equipo 3/3 • N Pokémon» y «✕ Cerrar». Ya no hay secciones de Mochila ni Mejoras: lo que tienes se ve en el propio desplegable de objetos (con la cantidad, ×n) y las mejoras se gastan en «Ver datos».
- **Tarjetas:** ocupan toda la altura de la pantalla. Arriba el sprite (los mismos sprites tuyos, solo más grandes), el nombre y los tipos; en medio naturaleza y habilidad; debajo el objeto equipado y los botones.
- **Desplegable de objetos:** botón con icono + lista con icono, nombre, efecto y cantidad. Debajo, el efecto en este juego y lo que hace en los juegos de Pokémon. Se maneja con el ratón o con el teclado (↑ ↓ y Intro), se cierra con Esc o con un clic fuera, y si abajo no cabe se abre hacia arriba. Un objeto ya equipado en otro Pokémon no sale (como antes).
- **Fondo (`room.js`):** una habitación de madera oscura pintada por código en un lienzo de 480×270 que se amplía sin suavizar y se ancla arriba a la izquierda. A la izquierda hay una **chimenea de piedra con el fuego siempre animado** (llamas, chispas y luz cálida); en el resto, una vitrina de cristal, estanterías con libros y Poké Balls y una ventana de noche con telescopio. El fondo fijo se vuelve a dibujar cada vez que abres el panel y solo se anima (unas 15 imágenes por segundo) mientras está abierto (`roomStart` / `roomStop`). Para cambiar colores toca `RM.pal`; para mover muebles, las coordenadas de `rmBuild`.
- **Estantería de trofeos:** arriba hay 9 peanas, una por Liga Pokémon (`ROOM_LEAGUES`, mismas regiones que `REGIONS` en menu.js). Al derrotar al Campeón de una Liga, `modes.js` guarda `save.champ[región] = 1` y ese trofeo aparece dorado, con una gema del color de la región y un brillo; los que aún no tienes se ven como una silueta apagada. Ahora mismo solo se puede conseguir el de Kanto (la Historia solo tiene esa región).
- **Encaje con el panel:** `--sc` (en el CSS) es el tamaño de cada píxel del dibujo en pantalla; con él el panel deja libre el hueco de la chimenea (izquierda) y de la estantería (arriba).

## Pantalla de equipo en lista (js/team.js, js/state.js, final de css/style.css)
- **Qué es:** el diseño actual de la pantalla de equipo (`const TEAM_LIST = true;` al principio de team.js), inspirado en un constructor de equipos tipo Showdown. Va sobre la habitación antigua del fondo (room.js), oscurecida.
- **Ventana:** el panel no ocupa toda la pantalla: es una ventana semitransparente que deja libre la estantería de trofeos (arriba, `margin-top: calc(var(--sc) * 66)`) y se ve el fondo alrededor. Tamaño del texto y del sprite (`.tsprite`) en `#teamv.lista`.
- **Trofeos con nombre:** el tablón de la estantería (room.js, 12 px de alto) lleva el nombre de la región bajo cada trofeo (`roomLabels`, texto HTML colocado con `--sc`; dorado si la Liga está ganada). En esta pantalla el fondo se oscurece menos por arriba (`#teamv.lista::before`) para que se vean.
- **Sprites grandes:** las miniaturas de la lista de equipos (`.tmt-m canvas`, 6.4em, lienzo 96×96) y las tarjetas del selector «Cambiar» (`.tcard canvas`, 13em, lienzo 192×192) son mucho mayores; la lista de equipos va en una sola columna y se desplaza.
- **Barra superior:** título, contador «N Equipos», buscador (mira el nombre del equipo y los nombres de sus Pokémon), Orden (número, nombre o favoritos), Filtro por tipo de Pokémon, **+ Nuevo equipo** y Cerrar. Ids: `#tmCount`, `#tmSearch`, `#tmOrder`, `#tmFilt`, `#tmNew`. El estado de búsqueda/orden/filtro vive en el objeto `tl`.
- **Hasta 18 equipos:** `TEAM_MAX = 18` y `TEAM_START = 5` (js/state.js). Las partidas viejas conservan sus 5 equipos; «Nuevo equipo» añade hasta 18. Se puede borrar hasta quedarse con 1.
- **Columna izquierda:** filtros rápidos (`#tmQuick`: Todos, Favoritos, Completos, Vacíos) y la lista de equipos en 2 columnas (`#tmTabs`) con número, nombre, ★ si es favorito y miniaturas de sus Pokémon.
- **Cabecera del equipo (`.tmdh`):** número y nombre editable (`#tmName`), y tres botones: ★ favorito (`save.teams[i].fav`), ✏️ renombrar y 🗑️ borrar (hay que pulsarlo dos veces en 3,5 s; al borrar se pierden los objetos asignados a ese equipo).
- **Tarjetas (3 Pokémon por equipo):** sprite grande, nombre, tipos, naturaleza, habilidad, objeto (desplegable `itemDd`) y los 4 ataques con su tipo. Sin barras de estadísticas (están en «Ver detalles»). Un clic en una tarjeta la selecciona (`tm.selD`); se arrastran para ordenar. La estrella ⭐ de cada tarjeta alterna shiny si lo tienes.
- **Fila de abajo (`#tmCov`):** Debilidades y Resistencias del equipo, y los botones **Ver detalles** (abre «Ver datos» del Pokémon seleccionado) y **Cambiar** (elegir otro Pokémon para esa casilla).
- **Ventana flotante:** el panel (`.tmx`) no ocupa toda la pantalla: empieza justo debajo de la estantería de trofeos (`margin-top: calc(var(--sc) * 66)`) para que se vean las copas, y su tamaño de letra se calcula con la altura que queda (`font-size` de `#teamv.lista`). Si quieres más grande o más pequeño, cambia ese `66` (más alto = ventana más baja) o el divisor `70` de la letra. El sprite de las tarjetas mide `13em` (`.tsprite`).
- **CSS:** todo bajo `#teamv.lista`. `.tmx` es una rejilla (2 columnas); `.tmL`, `.tmR`, `.tmteams`, `.tmdh`, `.cvres` y `.cvwk` son `display:contents` en los otros diseños para que un solo HTML sirva a todos. Con menos de 1100 px de ancho pasa a una sola columna (y se desplaza).
- **▶ Volver al diseño anterior:** pon `TEAM_LIST = false`. Ojo: ese diseño se pensó para 5 equipos; con más saldrían muchas pestañas. Con `TEAM_HOUSE = true` (casa.js) manda la casa y este diseño no se aplica.

## La casa del Equipo Pokémon (js/casa.js, fondos/casa.png, final de css/style.css)
- **Estado: DESACTIVADA.** Ahora mismo `const TEAM_HOUSE = false;` en `js/casa.js`, así que la pantalla de equipo usa la habitación antigua (chimenea). Todo lo de esta sección sigue en el código listo para activarse poniendo `true`. Las barras de IV/EV de «Ver datos» sí están activas.
- **Qué es:** el fondo actual de la pantalla de equipo: una casa vista desde arriba (imagen `fondos/casa.png`, 750×750, generada con IA y retocada con detalles Pokémon) **en el centro**, con un panel a cada lado. En pantallas de menos de 1100 px la casa pasa a ocupar todo el fondo y los paneles quedan encima.
- **Panel izquierdo (`.tmL`, `#tmSel`):** pestañas de los 5 equipos, nombre del equipo, chips (Chapas Doradas, Chapas Plateadas y Ligas superadas n/9) y la **ficha del Pokémon elegido**: nombre, tipos (y «MEGA» si puede megaevolucionar), sprite, habilidad, naturaleza, desplegable de objetos, sus 4 ataques, estadísticas a nivel 50 con EV/IV, la megaevolución si lleva su megapiedra, y los botones Cambiar, Ver datos, Shiny y Quitar. Abajo, la **cobertura del equipo**: debilidades compartidas y a cuántos de los 18 tipos le hacen daño súper efectivo tus ataques (`renderCov` en team.js). Se dibuja con `renderSel()`.
- **Panel derecho (`.tmR`, `#tmSlots`):** las 3 tarjetas del equipo (sprite grande, nombre, tipos, objeto equipado). Un clic en una tarjeta la enseña en la ficha (`tm.selD`); se arrastran para ordenar como siempre.
- **Trofeos:** la vitrina del salón está vacía en la imagen. `casa.js` dibuja encima 9 copas (`HOUSE.slots`, un cristal por Liga, mismo orden que `ROOM_LEAGUES`). Las Ligas ganadas (`save.champ`) salen doradas, con la gema de su región y destellos; las demás, como silueta apagada.
- **Favoritos:** los 3 Pokémon favoritos del perfil (`favSaved()` / `favShinySaved()`) están en reposo animado en el salón, el dormitorio y la cocina (`HOUSE.pos`, coordenadas de los pies en píxeles de la imagen). No llevan ningún rótulo: se cambian desde el Perfil.
- **CSS:** todo está al final de css/style.css bajo `#teamv.casa`. `--pw` es el ancho de cada panel y `--hs` el lado de la casa. Con la habitación antigua, `.tmL` y `.tmR` son `display:contents` y lo nuevo (chips, ficha, texto de ayuda) está oculto.
- **IVs y EVs con barras (js/teamdata.js, «Ver datos»):** cada stat tiene una barra que se arrastra y salta de 5 en 5 (IV, Chapa Dorada) o de 10 en 10 (EV, Chapa Plateada). Los cambios son un borrador (`dt.tr`) hasta pulsar «Aplicar cambios»; «Deshacer» lo descarta. Al aplicar se llama a `useChapa` / `useChapaPlata` una vez por chapa, así que las reglas y topes siguen en `training.js`.
- **▶ Volver al diseño antiguo:** en `js/casa.js` pon `const TEAM_HOUSE = false;` y vuelve la habitación de madera con chimenea (las barras de IV/EV se quedan). Si `fondos/casa.png` no carga, el juego usa solo la habitación antigua.

## Torre Batalla: cuándo se desbloquea
- Se desbloquea **al derrotar a los Campeones de todas las Ligas** (las 9 regiones de `REGIONS`). Antes de eso aparece bloqueada con el contador «Ligas superadas: n / 9» (`leaguesWon()` en menu.js, que lee `save.champ`). En la pantalla de regiones se marca «🏆 Campeón» en cada Liga superada.
- **Legibilidad:** el CSS (`#teamv::before`) oscurece el fondo con un degradado, y las tarjetas son de cristal oscuro con un ligero desenfoque, así que flotan sobre la habitación sin perder contraste.


## Tienda: comprar varias unidades escribiendo la cantidad
- Cada artículo tiene un cuadro **Cantidad**: escribe el número (solo cifras, hasta 9999) o usa **−**, **+** y **Máx** (todo lo que puedas pagar). El botón muestra el total («Comprar × 12 · 720 PB»); también vale pulsar **Enter** dentro del cuadro. Tras comprar la cantidad vuelve a 1.
- Si pides más de lo que puedes pagar, el botón se desactiva y dice cuántos PB te faltan; en los MTs el tope es el stock que queda hoy.
- Código: `buyMany(id, n)` y `maxBuy(id)` en economy.js (`buy(id)` sigue existiendo y compra 1); la cantidad escrita está en `shopSt.qty` (shop.js).
- **Tarjetas alineadas (Tienda y Campo de Entrenamiento):** cada tarjeta de la tienda es una cuadrícula de 3 filas (imagen y texto · cantidad · botón «Comprar»). La primera fila ocupa el espacio sobrante, así la cantidad y el botón quedan siempre a la misma altura en todas las tarjetas de una fila, aunque unas descripciones sean más largas (final de `css/style.css`, secciones «Tienda: tarjetas alineadas» y «Campo de Entrenamiento: tarjetas alineadas»). En el Campo, la imagen y el texto van arriba y el botón «Combatir» siempre abajo, a la misma altura en cada fila.

## Mochila (js/bag.js)
- Se abre desde la barra de arriba: **Perfil › Logros › Amigos › Mochila** (`CRUMBS` en avatars.js; también sale en la cabecera del menú). Se mira, y los MTs se pueden enseñar desde aquí con «Enseñar a un Pokémon»: muestra por secciones los tickets, las mejoras (chapas, mentas, cápsulas), los MTs y los objetos de combate que tienes, con su cantidad y, en los objetos, cuántos están equipados y cuántos libres. Tiene buscador por nombre y atajos a la Tienda y al Equipo.

## Menú principal
- Los botones van en **una columna** hacia abajo. Solo en pantallas muy bajas (menos de 680 px de alto) pasan a 2 columnas para que quepan (`@media (max-height:680px)` en style.css).


## Pausa, reiniciar y salir del combate (tecla Esc)
- En cualquier combate (Historia, Campo de Entrenamiento...) pulsa **Esc** para **pausar**. Sale un cuadro con el nombre del combate (por ejemplo «Piso 1 · Brock · Roca»), tres datos (**Tiempo** del combate, **Tu equipo** y **Rival** con cuántos Pokémon siguen en pie) y cuatro botones: **Continuar (Esc)**, **Reiniciar combate**, **Sonido: sí/no (M)** y **Salir del combate** (en rojo).
- Mientras está en pausa el combate se para del todo: no corre el reloj, ni te mueves, ni cambias de Pokémon (también vale durante la cuenta atrás).
- **Reiniciar combate** pide confirmación («Sí, reiniciar» / «No, volver») y empieza el mismo combate desde cero: vida y energía completas para los dos equipos, reloj a 0 y cuenta atrás otra vez. No da ni quita recompensas y no vuelve a contar el uso de tus Pokémon para «más usados» (`startBattle(o, true)`). Sirve igual en la Historia y en el Campo.
- **Salir del combate** también pide confirmación («Sí, salir» / «No, volver»). Si sales **no ganas ninguna recompensa** ni avanzas de piso. Vuelves a la pantalla de la Historia o, si estabas en el Campo, a la lista del Campo. «No, volver» te devuelve al menú de pausa; Esc cierra la pausa y sigues luchando.
- Con el combate ya terminado (pantalla de resultado) Esc no abre la pausa. Fuera de un combate, Esc sigue sirviendo para volver atrás.
- Código: `pauseBattle()`, `restartBattle()` y `exitBattle()` en js/modes.js; `g.paused` en js/combat.js; tecla en js/ui.js; overlay `#pause` en index.html; estilos `.pz-*` al final de css/style.css.

## Campo de Entrenamiento (js/campo.js, carpeta entrenadores/)
Zona para **farmear Chapas**. Se abre desde el menú principal (segundo botón). Cada entrenador se puede combatir **todas las veces que quieras** y cada victoria da siempre **1 tirada de Gachapon + BP + Chapas Plateadas y Doradas según la dificultad: Fácil 50 BP + 5 de cada chapa, Media 100 BP + 10 de cada, Difícil 150 BP + 15 de cada** (`REWARD.campo` y `REWARD_CAMPO` en teams.js; para cambiar las cantidades edita `REWARD_CAMPO`). Perder no da nada. No cuenta para el progreso de la Historia y no toca `save.record`.

- **Entrenadores:** uno por cada imagen de `entrenadores/` (30, sin contar el Cazabichos, que aún no tiene imagen). Cada uno tiene un equipo temático según su dibujo, por ejemplo: Montañero → Rhyperior, Steelix, Golem, Machamp · Marinero → Poliwrath, Tentacruel, Kingler, Sharpedo · Médium → Gardevoir, Reuniclus, Xatu, Meowstic · Entrenador Guay → Garchomp, Metagross, Salamence, Tyranitar · Pescador → Gyarados, Milotic, Seaking · Criador → Vaporeon, Umbreon, Leafeon, Sylveon. Están todos en el array `CAMPO` de campo.js, con el tema de cada uno.
- **Dificultad (`CAMPO_TIER`):** 1 = fácil (nivel 110, 3 Pokémon), 2 = media (nivel 118, 4 Pokémon), 3 = difícil (nivel 125, 4 Pokémon: Entrenador Guay, Maestro Li, Maestro Magnus, Ocultista, Ivor, Maestro Kamado, Chica Kimono, Palmer, Veterano y Duque Wikstrom: 10 entrenadores). Usa la misma fórmula que la Historia (`DIFF.dificil`): tier 1 ≈ Brock-Misty, tier 2 ≈ Erika-Koga, tier 3 ≈ Sabrina-Blaine, pero con menos Pokémon para poder repetirlo muchas veces. Para cambiarla, toca `CAMPO_TIER` (nivel `lvl` y posición equivalente `n`).
- **Equipos competitivos:** todos con IV 31 (los pone `P()`), EVs coherentes con el papel (atacante físico = Ataque + Velocidad, especial = At. Esp. + Velocidad, tanque = PS + Defensa; máx 252 por stat y 510 en total), naturaleza que sube lo que usan y objeto que encaja (Restos, Vidasfera, Cinta/Gafas Elección, Banda Aguante, Cinturón de Experto...). Se comprueba al cargar (`validateTeams()` ahora revisa también el Campo; 6 Pokémon en los líderes y 3-4 en el Campo). El «Mineral Evolutivo» no existe en este juego, así que no se usa (el juego solo tiene los 16 objetos de ITEMS).
- **Fondo:** cada entrenador usa el estadio de su tema (`arena`: Montañero → Brock, Marinero/Surfista/Pescador → Misty, Médium/Jugador/Li → Sabrina...). Su retrato sale en el marcador del combate (`portrait`).
- **Entrenadores nuevos de Difícil:** Ocultista (Gengar, Mismagius, Chandelure, Dusknoir) · Ivor (Conkeldurr, Infernape, Lucario, Annihilape: llevan los **puños** Hielo, Fuego, Trueno y Sombra) · Maestro Kamado (Coalossal, Typhlosion, Volcarona, Magmortar) · Chica Kimono (Milotic, Gardevoir, Lilligant, Ninetales) · Palmer (Snorlax, Dragonite, Rhyperior, Mamoswine) · Veterano (Charizard, Blastoise, Venusaur, Arcanine) · Duque Wikstrom (Aegislash, Scizor, Corviknight, Excadrill, con el Puño Bala). Sus ataques de partida son de especies que de verdad pueden aprenderlos (salvo el golpe de Chandelure, que no tiene ninguno disponible).
- **Añadir un entrenador:** copia una entrada de `CAMPO`, cambia sus datos y pon su imagen en `entrenadores/`. Ya hay una entrada para el **Cazabichos** (`bugcatcher.png`, marcada `opt:true`): solo aparece cuando existe esa imagen.

## Campo de Entrenamiento rediseñado (js/campo.js `openCampo`/`renderCampo`, final de css/style.css)
- **Banner verde** (césped) con el título, la recompensa de cada victoria en iconos (×1 tirada y los BP y las chapas de la dificultad que estés viendo; cambia al pulsar cada pestaña), tus Chapas Plateadas y Doradas con icono y el botón «Equipo Pokémon →».
- **Pestañas de dificultad** (Fácil · Media · Difícil): cada una con estrellas, nivel, barra de progreso y «N de M vencidos» (✓ Superada cuando la completas). Las bloqueadas llevan 🔒 y se pueden mirar, pero sus botones están desactivados y un aviso rojo dice cuántos entrenadores faltan para abrirlas. Al entrar se abre sola la primera dificultad que aún no has superado (`campoTab`).
- **Tarjetas** con el mismo estilo que los líderes de la Historia (clases `.lcard`, `.lc-*`): en dos columnas (una en pantallas estrechas), teñidas con el color del tipo del primer Pokémon del entrenador (`campoColor`), retrato grande, insignia con su clase, tema, miniaturas de sus Pokémon (al pasar el ratón: nombre y objeto), ✓ en los vencidos y botón **Combatir** (dorado en el siguiente sin vencer) / **Repetir** / **Bloqueado**.
- **«Ir al siguiente sin vencer»:** botón que salta a la dificultad del primer entrenador pendiente y lo centra en pantalla (`campoNext`).
- **Volver al Campo:** «Equipo Pokémon →» abre el equipo con `openTeam('campo')`; al cerrarlo (o con Esc) vuelves al Campo (`closeTeam` en js/team.js).
- La lógica de combates, recompensas y desbloqueos no cambia. Se han quitado las reglas CSS antiguas `.cmp-*`.

## Menú: Clasificatoria "Próximamente"
- El botón **CLASIFICATORIA** está ahora justo debajo de **AJUSTES** y aparece cerrado, con la etiqueta "PRÓXIMAMENTE". Al pulsarlo sale un aviso.
- Motivo: una clasificatoria de verdad (mejores puntuaciones de todos los jugadores) necesita cuentas de usuario y un servidor. Se hará cuando el juego esté publicado en internet.
- La pantalla antigua (`openRank()` en js/menu.js) sigue en el código, sin usarse, por si hace falta.

## Historia de Johto (js/johto.js, js/arenasjohto.js)
La Historia ahora tiene **varias regiones**. Cada combate (`FLOORS` en data.js) lleva `region`, `idx` (posición dentro de su región), `dn` (índice de dificultad) y `place` (ciudad).
Ayudantes en data.js: `floorsOf(region)`, `progOf(region)` y `setProg(region, n)`. El progreso de Kanto sigue en `save.record` (así no se pierde ninguna partida) y el de las demás regiones en `save.prog`.

**Cómo se desbloquea:** Johto se abre al ser **Campeón de Kanto** (vencer a Azul). Hoenn se abre al ser **Campeón de Johto** (ver más abajo), Sinnoh al ser **Campeón de Hoenn**, Teselia al ser **Campeona de Sinnoh** y el resto aparecen como "Próximamente". (Antes se podía saltar Kanto con un botón de prueba de Ajustes, ya eliminado: usa la consola con `setProg('Kanto', 13); save.champ.Kanto = 1; persist()`.) Texto antiguo: "Modo prueba: dar por terminado Kanto (abre Johto)" (quítalo al final).
Cada combate se desbloquea al vencer al anterior, igual que en Kanto. Al vencer a Lance recibes el **trofeo de Johto** en tu habitación y cuenta para la Torre Batalla.

**Los 13 combates (en orden) y sus equipos** (6 Pokémon cada uno, sin repetir especie, IV 31, EV 252 máx. por estadística y 510 en total; el último es el As):
| # | Entrenador | Tipo | Ciudad | Equipo |
|---|---|---|---|---|
| 1 | Pegaso | Volador | Ciudad Malva | Pelipper, Noctowl, Swellow, Honchkrow, Staraptor, Pidgeot |
| 2 | Antón | Bicho | Pueblo Azalea | Shedinja, Vespiquen, Pinsir, Heracross, Yanmega, Scizor |
| 3 | Blanca | Normal | Ciudad Trigal | Delcatty, Bibarel, Lickilicky, Girafarig, Clefable, Miltank |
| 4 | Morti | Fantasma | Ciudad Iris | Drifblim, Sableye, Dusknoir, Mismagius, Haunter, Gengar |
| 5 | Aníbal | Lucha | Ciudad Orquídea | Breloom, Medicham, Hitmonchan, Hitmonlee, Primeape, Poliwrath |
| 6 | Yasmina | Acero | Ciudad Olivo | Bronzong, Skarmory, Empoleon, Metagross, Magnezone, Steelix |
| 7 | Fredo | Hielo | Pueblo Caoba | Abomasnow, Glalie, Froslass, Walrein, Dewgong, Mamoswine |
| 8 | Débora | Dragón | Ciudad Endrino | Dragonair, Aerodactyl, Charizard, Kingdra, Gyarados, Dragonite |
| 9 | Mento (Will) | Psíquico | Liga | Wobbuffet, Slowbro, Exeggutor, Espeon, Jynx, Xatu |
| 10 | Koga | Veneno | Liga | Ariados, Forretress, Weezing, Muk, Venomoth, Crobat (el mismo equipo que en Kanto) |
| 11 | Bruno | Lucha | Liga | Onix, Steelix, Hitmonlee, Hitmonchan, Hitmontop, Machamp (el mismo que en Kanto) |
| 12 | Karen | Siniestro | Liga | Vileplume, Murkrow, Umbreon, Weavile, Gengar, Houndoom |
| 13 | Lance (Campeón) | Dragón | Liga | Dragonair, Kingdra, Aerodactyl, Charizard, Gyarados, Dragonite |

Origen de los equipos: los 8 líderes llevan su equipo de **revancha de HeartGold/SoulSilver** (los 6 Pokémon del Dojo Lucha de Ciudad Azafrán; Morti lleva un Haunter, el de su gimnasio, en lugar de su segundo Gengar para no repetir especie).
Mento, Koga, Bruno y Karen llevan sus 5 Pokémon de la Liga de Oro/Plata/HGSS + 1 de su temática (Mento: Espeon; Karen: Weavile; Koga y Bruno: el sexto de su equipo de Kanto). Lance lleva Gyarados, Dragonite, Aerodactyl y Charizard + Dragonair y Kingdra (su combate múltiple con Débora en HGSS).

**Dificultad:** `lvl` (nivel) y `dn` de cada combate en johto.js. Líderes: nivel 123-130 y dn 2-9 (Pegaso ≈ Giovanni). Alto Mando: nivel 131-134 y dn 9-12. Lance: nivel 140 y dn 14 (algo más duro que Azul). Para hacerlo más fácil o difícil, baja o sube esos números (o `ENEMY_POWER` en teams.js para todos los rivales).

**Recompensa:** `REWARD_REGION.Johto` en teams.js = **5 Chapas Doradas + 5 Plateadas + 10 tiradas de Gachapon** (Tickets Gachapon Normales) por **cada victoria**, también al repetir un combate. Va para líderes, Alto Mando y Campeón. Para que solo se den la primera vez: `REWARD.once = true`. (Además, como en Kanto, la primera victoria da 1 ticket extra y Puntos de Batalla.)

**Retratos:** el juego busca `lideres/Johto/<Nombre>.png`: Pegaso.png, Anton.png, Blanca.png, Morti.png (vale también Moti.png), Anibal.png, Yasmina.png, Fredo.png, Debora.png, Mento.png, Karen.png, y para Koga, Bruno y Lance (si no hay en Johto usa los de `lideres/Kanto/`). Si falta un retrato, el combate funciona igual, solo sin la imagen.

**Fondos de combate (js/arenasjohto.js)**, dibujados con código como los de Kanto, uno por entrenador:
- Pegaso: tarima de madera en altura, con cielo, nubes que pasan y viento.
- Antón: bosque interior con telarañas por el suelo y luciérnagas.
- Blanca: tarima pulida con el dibujo de Clefairy repetido y pared rosa con estrellas.
- Morti: suelo de templo de madera oscura, círculo ritual, niebla y espíritus.
- Aníbal: dojo con suelo de madera, cuadrilátero de cuerda y cascadas.
- Yasmina: acero pulido con remaches, tuberías, un engranaje enorme y luces de aviso.
- Fredo: pista de hielo cristalino con grietas, bloques helados y nieve.
- Débora: plataforma de piedra rodeada de lava, con estatuas de dragón y chispas.
- Mento: sala mística con columnas, alfombra púrpura y cristales flotantes.
- Koga: cueva ninja con sombras que pasan y faroles violeta.
- Bruno: arena de roca maciza con losas enormes, rocas y polvo.
- Karen: sala de mármol negro con ventanales a una noche estrellada y velas.
- Lance: sala del trono con alfombra roja, trono, estatuas de dragón y antorchas.

## Historia de Hoenn (js/hoenn.js, js/arenashoenn.js)
Hoenn usa **el mismo sistema que Johto** (`FLOORS` con `region:'Hoenn'`, `floorsOf('Hoenn')`, `save.prog.Hoenn`, `save.champ.Hoenn`), así que no se ha tocado nada de Kanto ni de Johto. Se abre al ser **Campeón de Johto** (vencer a Lance). Los 13 combates se desbloquean uno a uno y, como en el resto de regiones, los rivales que aún no has vencido salen como "misteriosos".

**Versión de referencia: Pokémon Esmeralda** (por eso el 8.º líder es **Galano/Juan** y el Campeón es **Plubio/Wallace**). Fuentes: pokemondb.net/emerald, Bulbapedia y Serebii (Match Call de Esmeralda).

| # | Entrenador | Tipo | Lugar | Equipo (en su orden oficial; el último es el As) |
|---|---|---|---|---|
| 1 | Petra (Roxanne) | Roca | Ciudad Férrica | Aerodactyl, Golem, Omastar, Kabutops, Steelix, Nosepass |
| 2 | Marcial (Brawly) | Lucha | Pueblo Azuliza | Hitmonlee, Hitmonchan, Machamp, Medicham, Hitmontop, Hariyama |
| 3 | Erico (Wattson) | Eléctrico | Ciudad Malvalona | Electabuzz, Raichu, Ampharos, Electrode, Magneton, Manectric |
| 4 | Candela (Flannery) | Fuego | Pueblo Lavacalda | Arcanine, Magcargo, Houndoom, Rapidash, Camerupt, Torkoal |
| 5 | Norman | Normal | Ciudad Petalia | Slaking, Blissey, Kangaskhan, Tauros, Spinda, Slaking |
| 6 | Alana (Winona) | Volador | Ciudad Arborada | Noctowl, Tropius, Pelipper, Dragonite, Skarmory, Altaria |
| 7 | Vito y Leti (Tate y Liza) | Psíquico | Ciudad Algaria | Hypno, Claydol, Slowking, Xatu, Lunatone, Solrock |
| 8 | Galano (Juan) | Agua | Arrecípolis | Lapras, Whiscash, Politoed, Walrein, Crawdaunt, Kingdra |
| 9 | Sixto (Sidney) | Siniestro | Liga | Mightyena, Cacturne, Shiftry, Crawdaunt, **Sharpedo**, Absol |
| 10 | Fátima (Phoebe) | Fantasma | Liga | Dusclops, Banette, Banette, Sableye, Dusclops, **Dusknoir** |
| 11 | Nívea (Glacia) | Hielo | Liga | Glalie, Sealeo, Glalie, Sealeo, **Froslass**, Walrein |
| 12 | Dracón (Drake) | Dragón | Liga | **Dragonair**, Shelgon, Altaria, Kingdra, Flygon, Salamence |
| 13 | Plubio (Campeón) | Agua | Liga | Wailord, Tentacruel, Whiscash, Ludicolo, Gyarados, Milotic |

**Cómo se han adaptado los equipos al motor** (el motor pide exactamente 6 Pokémon por entrenador):
- Los 8 **líderes** llevan su equipo de **revancha final de Esmeralda** (el del gimnasio normal solo tiene 2-4 Pokémon). Se respeta el orden oficial.
- **Alto Mando**: en Esmeralda llevan 5, así que se añade **1 Pokémon más de su temática** (en negrita). Sixto: Sharpedo (el de Rubí/Zafiro); Fátima: Dusknoir (la evolución de su As); Nívea: Froslass; Dracón: Dragonair. El **Campeón** Plubio lleva sus 6 oficiales.
- **Especies repetidas**: Norman (2 Slaking), Fátima (2 Dusclops y 2 Banette) y Nívea (2 Glalie y 2 Sealeo) las repiten en el juego original. Esos equipos tienen la marca `dupOk` (TEAMS[id].dupOk = true en hoenn.js) y `validateTeams()` (teams.js) no se queja por ello. En el resto de equipos sigue prohibido repetir especie.
- **Combate doble**: el motor solo tiene un rival, así que Vito y Leti son un único combate con sus 6 Pokémon de la revancha (retrato `Vito_y_Leti.png`).
- **Movimientos**: cada Pokémon tiene los 4 huecos del motor (golpe / disparo / mejora / ataque fuerte). Se usan los movimientos oficiales más parecidos que existen en `MOVESET` (moves.js); los que el motor no tiene (Focus Punch, Explosion, Protect...) se sustituyen por uno del mismo tipo. Habilidades y objetos: los de la generación 3 o equivalentes; las habilidades nuevas tienen su descripción en `ABIL_DESC`.

**Dificultad:** `lvl` y `dn` en hoenn.js. Líderes: nivel 127-134 y dn 4-11. Alto Mando: nivel 135-138 y dn 11-14. Plubio: nivel 145 y dn 16 (el más duro de las tres Ligas; Azul es 135/12 y Lance 140/14).
**Recompensa:** `REWARD_REGION.Hoenn` (teams.js) = 5 Chapas Doradas + 5 Plateadas + 10 tiradas de Gachapon por cada victoria, igual que Johto.
**Logros nuevos:** Líderes de Hoenn (500 BP + 5 tickets), Alto Mando de Hoenn (400 BP + 3), Campeón de Hoenn (1000 BP + 10) y **Maestro de tres Ligas** (3000 BP + 20 tickets).
**Música:** pistas `lider_hoenn`, `alto_hoenn` (usa `alto.ogg`) y `campeon_plubio` (usa `jefe.ogg`). Si no existe `musica/lider_hoenn.ogg` suena la música generada; para poner una canción real, copia el archivo con ese nombre.

**Retratos:** `lideres/Hoenn/<Nombre>.png` con los nombres que ya tienes: Petra, Marcial, Erico, Candela, Norman, Alana, Vito_y_Leti, Galano, Sixto, Fátima, Nívea, Dracón, Plubio. (`Máximo.png` y `Leti.png` no se usan: Máximo es el Campeón de Rubí/Zafiro y Leti ya sale en el retrato de Vito_y_Leti.) El juego prueba primero el nombre sin tilde y después el que tiene tilde (LEADER_FILE en data.js). Los nombres distinguen mayúsculas y minúsculas en GitHub Pages.

**Fondos de combate (js/arenashoenn.js)**, dibujados con código como los de Kanto y Johto; el centro del suelo siempre queda libre para ver a los dos Pokémon:
- Petra (Férrica): cueva-taller de roca con suelo de tierra, vetas de cristal, lámparas colgantes que parpadean y peñascos.
- Marcial (Azuliza): gimnasio oscuro con ring de cuerdas, tablas de surf, sacos de boxeo y focos que se balancean.
- Erico (Malvalona): acero con franjas de peligro, barreras eléctricas que parpadean y bobinas Tesla con rayos.
- Candela (Lavacalda): roca volcánica cálida con boca de volcán, aguas termales con vapor, plataformas de teletransporte y chispas.
- Norman (Petalia): sala luminosa de parqué con las puertas de pruebas, friso verde, plantas y el círculo central.
- Alana (Arborada): casa en las copas de los árboles: cielo, dosel de hojas, plataforma de madera con barandilla de cuerda y viento con hojas.
- Vito y Leti (Algaria): espacio con el Sol y la Luna, planeta con anillo, suelo de cristal con cuadrícula luminosa y estrellas fugaces.
- Galano (Arrecípolis): losas de hielo sobre el agua, templo claro con arcos y cortinas de agua, reflejos que se mueven.
- Sixto: escenario negro y rojo con cortinas, luna, murciélagos y focos que barren la sala.
- Fátima: sala fría de piedra con ventanales a la luna, fuegos fatuos morados, círculo de invocación y niebla.
- Nívea: salón de cristal helado con columnas, aurora, copos grabados en el mármol y nieve.
- Dracón: sala marina de escamas azules con estatuas de dragón de ojos brillantes, emblema dorado y braseros turquesa.
- Plubio: salón de mármol con columnas de cristal llenas de agua y burbujas, vetas doradas y la puerta del Salón de la Fama.

## Historia de Sinnoh (js/sinnoh.js, js/arenassinnoh.js)
Sinnoh usa **el mismo sistema que Johto y Hoenn** (`FLOORS` con `region:'Sinnoh'`, `floorsOf('Sinnoh')`, `save.prog.Sinnoh`, `save.champ.Sinnoh`), así que no se ha tocado nada de Kanto, Johto ni Hoenn. Se abre al ser **Campeón de Hoenn** (vencer a Plubio). Los 13 combates se desbloquean uno a uno y los rivales que aún no has vencido salen como "misteriosos".

**Versión de referencia: Pokémon Platino** (orden de gimnasios: Roco, Gardenia, Fantina, Brega, Mananti, Acerón, Inverna, Lectro; Campeona Cintia). Fuentes: Bulbapedia, Serebii y WikiDex.

| # | Entrenador | Tipo | Lugar | Equipo (en su orden; el último es el As) |
|---|---|---|---|---|
| 1 | Roco (Roark) | Roca | Ciudad Pirita | Aerodactyl, Probopass, Rampardos, Golem, **Rhyperior**, Tyranitar |
| 2 | Gardenia | Planta | Ciudad Vetusta | Jumpluff, Cherrim, Bellossom, **Leafeon**, Torterra, Roserade |
| 3 | Fantina | Fantasma | Ciudad Corazón | Banette, Mismagius, Drifblim, Dusknoir, **Rotom**, Gengar |
| 4 | Brega (Maylene) | Lucha | Ciudad Rocavelo | Hitmontop, Breloom, Medicham, **Toxicroak**, Machamp, Lucario |
| 5 | Mananti (Crasher Wake) | Agua | Ciudad Pradera | Sharpedo, Quagsire, **Gastrodon**, Floatzel, Gyarados, Ludicolo |
| 6 | Acerón (Byron) | Acero | Ciudad Canal | Skarmory, Magnezone, **Bronzong**, Steelix, Bastiodon, Aggron |
| 7 | Inverna (Candice) | Hielo | Ciudad Puntaneva | **Medicham**, Weavile, Mamoswine, Abomasnow, Froslass, Glaceon |
| 8 | Lectro (Volkner) | Eléctrico | Ciudad Marina | **Ambipom**, Jolteon, Raichu, Lanturn, Luxray, Electivire |
| 9 | Alecrán (Aaron) | Bicho | Liga | **Beautifly**, Yanmega, Scizor, Vespiquen, Heracross, Drapion |
| 10 | Gaia (Bertha) | Tierra | Liga | **Quagsire**, Whiscash, Gliscor, Golem, Hippowdon, Rhyperior |
| 11 | Fausto (Flint) | Fuego | Liga | **Lopunny**, Houndoom, Flareon, Rapidash, Infernape, Magmortar |
| 12 | Delos (Lucian) | Psíquico | Liga | **Mr. Mime**, Girafarig, Espeon, Bronzong, Alakazam, Gallade |
| 13 | Cintia (Campeona) | Dragón | Liga | Spiritomb, Roserade, Togekiss, Lucario, Milotic, Garchomp |

**Cómo se han adaptado los equipos al motor** (6 Pokémon por entrenador, en negrita los añadidos):
- Los 8 **líderes** llevan su equipo de **revancha de Platino** (Zona de Batalla, 5 Pokémon) y se añade 1 Pokémon más que usan en Diamante/Perla/Platino.
- **Alto Mando**: en Platino llevan 5, así que se añade 1 más de su equipo de Diamante/Perla. **Cintia** lleva sus 6 oficiales.
- ⚠️ **Lectro** es el equipo menos seguro: Jolteon y Raichu están confirmados y Lanturn sale en sus revanchas, pero Luxray y Electivire (su As) son los de su equipo normal. Si no coincide con tu juego, cámbialos en `TEAMS.lectro` (sinnoh.js).
- Ningún equipo repite especie (no hace falta `dupOk`). Los movimientos son los más parecidos que permite el motor (4 huecos: golpe / disparo / mejora / ataque fuerte).
- Todos llevan IVs 31, EVs (máx. 252 por stat y 510 en total), naturaleza, habilidad, objeto y 4 movimientos; las habilidades nuevas tienen su descripción en `ABIL_DESC` (sinnoh.js).

**Dificultad:** `lvl` y `dn` en sinnoh.js. Líderes: nivel 135-142 y dn 6-13. Alto Mando: nivel 143-146 y dn 13-16. Cintia: nivel 153 y dn 18 (la más dura de las cuatro Ligas; Plubio es 145/16).
**Recompensa:** `REWARD_REGION.Sinnoh` (teams.js) = 5 Chapas Doradas + 5 Plateadas + 10 tiradas de Gachapon por cada victoria, igual que Johto y Hoenn.
**Logros nuevos:** Líderes de Sinnoh (500 BP + 5 tickets), Alto Mando de Sinnoh (400 BP + 3), Campeona de Sinnoh (1000 BP + 10) y **Maestro de cuatro Ligas** (4000 BP + 25 tickets).
**Música:** pistas `lider_sinnoh`, `alto_sinnoh` (usa `alto.ogg`) y `campeon_cintia` (usa `jefe.ogg`). Si no existe `musica/lider_sinnoh.ogg` suena la música generada.
**Retratos:** `lideres/Sinnoh/<Nombre>.png`: Roco, Gardenia, Fantina, Brega, Mananti, Acerón, Inverna, Lectro, Alecrán, Gaia, Fausto, Delos, Cintia (las tildes se resuelven con LEADER_FILE en data.js; las mayúsculas importan en GitHub Pages).

**Fondos de combate (js/arenassinnoh.js)**, dibujados con código (sin imágenes) y rediseñados con mucho más detalle. Cada uno dibuja sus propios laterales y tiene luces y partículas animadas. El centro del suelo siempre queda libre para ver a los dos Pokémon. Ayudantes nuevos al principio del archivo (`arEll`, `arPool`, `arBeam`, `arStrata`, `arPlank`, `arCrystal`, `arGear`, `arBolt`, `arMote`...):
- Roco (Pirita): mina subterránea con paredes de roca por capas, túnel con marco de madera, raíles con traviesas, vagonetas (una con cristales), pilares rocosos, cristales de colores que brillan y lámparas mineras que iluminan el suelo.
- Gardenia (Vetusta): jardín botánico bajo una cúpula de cristal, con árboles enormes, raíces sobre el suelo, enredaderas, columnas con musgo, flores, macetas y rayos de sol con polen y pétalos.
- Brega (Rocavelo): dojo de madera con tatami, círculo de combate, paneles shoji, estandartes rojos con el puño, vigas, sacos de entrenamiento que se balancean, muñeco de madera y soporte de bokken.
- Fantina (Corazón): teatro encantado con escenario oscuro, focos violetas, telón con luna, cortinas de terciopelo, palcos con espectadores fantasma y candelabros flotantes con llamas violetas.
- Acerón (Canal): fábrica con suelo de chapa y franjas de peligro, tuberías, pasarela, engranajes giratorios, cadenas, horno encendido, calderas con manómetros y vapor.
- Mananti (Pradera; tú le llamas Mencía): pabellón de mármol blanco con arcos de cristal azul, estanque con cascadas y puente, canales de agua a los lados con puentecillos y fuentes, y agua que se mueve.
- Inverna (Puntaneva): caverna glacial con suelo de hielo brillante y grietas, pared de hielo translúcido, cristal gigante, carámbanos, columnas congeladas, acantilados con cristales y nieve cayendo.
- Lectro (Marina): central eléctrica futurista con suelo oscuro y circuitos luminosos, monitores, neones, generadores, reactor central, bobinas Tesla con cables y rayos decorativos.
- Alecrán: bosque primitivo y oscuro con troncos gigantes, raíces, telarañas con capullos, plantas exóticas, setas, luciérnagas y rayos de luz.
- Gaia: caverna geológica con acantilados escalonados de capas de roca de colores, pilares naturales, estalactitas, geodas y cristales, y una abertura de luz cálida.
- Fausto (tú le llamas Faiano): cámara volcánica de basalto negro con grietas incandescentes, ríos de lava a los lados con puentes de basalto, pinchos de obsidiana, el volcán al fondo, brasas y ceniza.
- Delos: dimensión misteriosa con fondo espacial violeta y azul, plataforma de cristal con dibujo simétrico, plataformas flotantes, anillos luminosos que giran y esferas que flotan.
- Cintia: templo antiguo de la Liga con columnas colosales acanaladas con capiteles dorados, escalinata, portal de luz, friso con relieves, ventanales con haces de luz dorada, suelo de mármol negro con juntas de oro, emblema ancestral, símbolos tallados y braseros.

## Historia de Teselia / Unova (js/teselia.js, js/arenasteselia.js)
Teselia usa **el mismo sistema que las demás Ligas** (`FLOORS` con `region:'Unova / Teselia'`, `floorsOf(...)`, `save.prog`, `save.champ`). Se abre al ser **Campeona de Sinnoh** (vencer a Cintia). Son **15 combates** (10 de gimnasio —Zeo, Maíz y Millo son tres combates seguidos en Ciudad Gres—, Alto Mando de 4 y el Campeón) y salen como "misteriosos" hasta que vences al anterior.

**Versión de referencia:** Pokémon Blanco 2 / Negro 2 y el torneo de Líderes del Mundo, mezclando juego y anime. ⚠️ Los equipos de **Camila, Yakón, Gerania, Junco e Iris** están en parte aproximados (no pude leer su tabla completa): si no coinciden con tu juego, edita `TEAMS` en teselia.js. Todos llevan IVs 31, EVs (máx. 252 y 510 en total), naturaleza, habilidad, objeto y 4 movimientos; el último Pokémon de cada equipo es el As.

| # | Entrenador | Tipo | Lugar | Equipo (objeto) |
|---|---|---|---|---|
| 1 | Zeo | Fuego | Ciudad Gres | Heatmor, Darmanitan, Arcanine, Camerupt, Emboar, Magmortar |
| 2 | Maíz | Agua | Ciudad Gres | Crawdaunt, Samurott, Azumarill, Slowking, Seismitoad, Starmie |
| 3 | Millo | Planta | Ciudad Gres | Ferrothorn, Serperior, Jumpluff, Whimsicott, Lilligant, Simisage |
| 4 | Aloe | Normal | Ciudad Esmalte | Braviary, Cinccino, Kangaskhan, Sawsbuck, Lickilicky, Watchog |
| 5 | Camus | Bicho | Ciudad Porcelana | Vespiquen, Pinsir, Heracross, Accelgor, Durant, Leavanny |
| 6 | Camila | Eléctrico | Ciudad Mayólica | Emolga, Galvantula, Ampharos, Eelektross, Jolteon, Manectric |
| 7 | Yakón | Tierra | Ciudad Fayenza | Sandslash, Seismitoad, Krookodile, Hippowdon, Rhyperior, **Excadrill** (Ímpetu Arena) |
| 8 | Gerania | Volador | Ciudad Loza | Swoobat, Unfezant, Skarmory, Sigilyph, Mandibuzz, Swanna |
| 9 | Junco | Hielo | Ciudad Teja | Cryogonal, Vanilluxe, Glalie, Weavile, Mamoswine, Beartic |
| 10 | Iris (tú le llamas Lirio) | Dragón | Ciudad Caolín | Druddigon, Archeops, Lapras, Aggron, Hydreigon, Haxorus (gimnasio **Blanco o Negro al azar**) |
| 11 | Anís | Fantasma | Liga Pokémon | Cofagrigus, Drifblim, Golurk, Mismagius, Gengar, Chandelure |
| 12 | Aza | Lucha | Liga Pokémon | Mienshao, Hariyama, Sawk, Lucario, Machamp, Conkeldurr |
| 13 | Lotto | Siniestro | Liga Pokémon | Liepard, Mandibuzz, Houndoom, Scrafty, Krookodile, Bisharp |
| 14 | Catleya | Psíquico | Liga Pokémon | Sigilyph, Musharna, Espeon, Gardevoir, Reuniclus, Gothitelle |
| 15 | **Mirto** (Campeón) | Campeón | Liga Pokémon | Accelgor, Snorlax, Druddigon, Vanilluxe, Escavalier, Volcarona |

**Cosas especiales**
- **Sin sprite:** Simipour, Simisear, Crustle, Zebstrika, Jellicent, Throh y Bouffalant están en `NO_SPRITE` (data.js) y en el menú salen como un círculo, así que en Teselia se sustituyeron por Starmie, Magmortar, Pinsir, Manectric, Mismagius, Hariyama y Snorlax. Cuando añadas sus sprites, bórralos de `NO_SPRITE` y vuelve a ponerlos en `teselia.js`.
- **Gres (Zeo, Maíz y Millo):** son **tres combates seguidos** (hay que vencer a uno para pasar al siguiente) que comparten el fondo del restaurante (`arena:'gres'`).
- **Menú:** el número de líderes de cada región se cuenta con `floorsOf(región)` (menu.js), así que Teselia muestra 10 casillas y el Alto Mando se abre al vencer a los 10.
- **Caolín (Iris):** `arenas:['iris','iris_negro']`; `floorFight()` elige al azar el gimnasio oriental (Blanco) o el tecnológico (Negro) en cada intento.
- **Rivales rápidos:** el Excadrill de Yakón usa Ímpetu Arena, pero la velocidad extra de los rivales tiene tope ×1,35 (`ENEMY_SPEED_BUFF_CAP`).
- Las regiones con nombre largo usan `REGION_DIR` (data.js) para la carpeta de retratos: `lideres/Unova/<Nombre>.png` (Zeo, Maiz, Millo —o Cilan—, Aloe, Camus, Camila, Yakon, Gerania, Junco, Iris —o Lirio—, Anis, Aza, Lotto, Catleya, Mirto).

**Progreso al añadir combates:** el progreso de cada región es un número (combates superados). Al final de teselia.js, `healProgress()` sube ese número al total a quien ya es Campeón de la región, para que añadir combates nuevos no «reinicie» una región que ya terminó (pasó al separar a Zeo, Maíz y Millo: de 13 a 15 combates). Quien iba a medias conserva su número, que ahora apunta a un combate distinto.
**Dificultad:** `lvl` y `dn` en teselia.js. Gimnasios: nivel 143-151 y dn 7-15. Alto Mando: nivel 152-155 y dn 15-18. Mirto: nivel 162 y dn 20 (el más duro hasta ahora).
**Recompensa:** `REWARD_REGION['Unova / Teselia']` (teams.js) = 5 Chapas Doradas + 5 Plateadas + 10 tiradas de Gachapon por victoria.
**Música:** ver la tabla de pistas (`lider_teselia`, `alto_teselia`, `campeon_mirto`).

**Fondos de combate (js/arenasteselia.js)**, dibujados con código como los de las otras regiones (centro del suelo libre, laterales y luces animadas):
- Gres (Zeo, Maíz y Millo, los tres combates): restaurante con suelo ajedrezado, tres cortinas de colores (verde, roja y azul), mesas con mantel y velas, mostrador con cocina, ollas con vapor y lámparas.
- Aloe (Esmalte): museo-biblioteca con estanterías, vitrinas con fósiles, columnas de piedra y mosaico espiral.
- Camus (Porcelana): sala blanca con paneles y suelo de panal, cortinas translúcidas, telas de araña y columnas de panal.
- Camila (Mayólica): parque de atracciones cubierto con raíl de montaña rusa (los vagones circulan), guirnaldas de bombillas que parpadean y plataformas metálicas con franjas amarillas.
- Yakón (Fayenza): mina con suelo de tierra, paredes rocosas, cinta transportadora con piedras en movimiento, vagonetas con mineral, engranajes y máquinas.
- Gerania (Loza): hangar con ventanales (pasan nubes), cerchas metálicas, plataformas elevadas con barandilla, bidones y neumáticos, luz de aviso roja.
- Junco (Teja): cueva helada con suelo de hielo pulido y grietas, bloques de hielo, carámbanos, cristales que brillan y nieve.
- Iris (Caolín, Blanco): gimnasio oriental con tejado curvo, pilares rojos, paneles shoji con emblema de dragón, linternas y estatuas de dragón sobre pedestales.
- Iris (Caolín, Negro): gimnasio tecnológico con suelo de rejilla luminosa, pantallas con dragón holográfico, tuberías con impulsos y engranajes.
- Anís (Fantasma): mansión-biblioteca con ventanas ojivales y luna, cortinas moradas, telarañas, estanterías y candelabros con llama morada.
- Aza (Lucha): dojo de madera con estandartes de puño, sacos de arena que se balancean, muñeco de madera y rastrillo de bastones.
- Lotto (Siniestro): casino con moqueta roja, neones de palos de cartas que parpadean, tragaperras, ruleta y cortinas de terciopelo.
- Catleya (Psíquico): sala de cielo estrellado con luna, espejos de plata, esferas flotantes sobre cristales y runas.
- Mirto (Campeón): gran salón de mármol con vidrieras de llamas, columnas estriadas, estandartes y braseros dorados con chispas.

## Historia de Kalos (js/kalos.js, js/arenaskalos.js)
Kalos usa **el mismo sistema que las demás Ligas** (`FLOORS` con `region:'Kalos'`, `floorsOf('Kalos')`, `save.prog`, `save.champ`). Se abre al ser **Campeón de Teselia** (vencer a Mirto). Son **13 combates con 6 Pokémon cada uno**: 8 gimnasios, Alto Mando de 4 y la Campeona Dianta.
**Versión de referencia:** Pokémon X e Y (equipos de WikiDex, Bulbapedia y Serebii). Los líderes llevan 2-3 Pokémon en los juegos: aquí tienen 6, con los de X e Y más otros del anime y de otros juegos.
| # | Líder | Ciudad / gimnasio | Tipo |
|---|---|---|---|
| 1 | Violeta | Novarte | Bicho |
| 2 | Lino | Relieve | Roca |
| 3 | Corelia | Yantra | Lucha |
| 4 | Amaro | Tiriópolis | Planta |
| 5 | Lem | Luminalia | Eléctrico |
| 6 | Valeria | Romantis | Hada |
| 7 | Ástrid | Anistar | Psíquico |
| 8 | Édel | Fractal | Hielo |
Alto Mando: **Malva** (Fuego), **Narciso** (Agua), **Tileo** (Fantasma) y **Ágata** (Acero). Campeona: **Dianta**. (Ágata sustituye a Drácena; usa el retrato `drasna.png` hasta que haya un `lideres/kalos/agata.png`: `LEADER_FILE` ya lo busca primero.)
- **Equipos (los que dio Diego):** 6 Pokémon por entrenador, con IVs 31, EVs, naturaleza, habilidad, objeto y 4 movimientos (en `kalos.js`). En tu lista Lem se llamaba «Électra», Valeria «Ástrid» y Ástrid «Áureo»; el juego conserva los nombres de WikiDex.
- **Megas de los rivales:** todo Pokémon con mega disponible la lleva (`PM(...)`, con su Megapiedra como objeto): Lino (Tyranitar, Aerodactyl), Corelia (Lucario, Gallade), Lem (Manectric), Valeria (Mawile, Gardevoir), Édel (Glalie), Tileo (Gengar) y Dianta (Gardevoir). Si un equipo tiene dos, megaevoluciona el primero que salga al campo (solo una mega por combate). Heracross, Pinsir, Venusaur, Metagross, etc. tienen mega en los juegos pero aún no están en `MEGA`.
- **Retratos:** carpeta `lideres/kalos/` (en minúsculas; `LEADER_FILE` y `REGION_DIR` en data.js dicen qué archivo es de quién). El panel VS usa estos retratos normales. (Si algún día quieres arte VS grande, `VS_ART_REGIONS` en vspanel.js está vacío: ponle `['kalos']` y añade `lideres/kalos/VS_<Nombre>.webp`.)
- **Sin sprite:** Pyroar (668) está en `NO_SPRITE`; Malva lleva a Houndoom en su lugar (sin mega). Cuando tenga sprite, se cambia en kalos.js.
- **Dificultad:** `lvl` 150-170 y `dn` 8-22 en kalos.js (Dianta es la más dura). **Recompensa:** `REWARD_REGION['Kalos']` (teams.js) = 5 Chapas Doradas + 5 Plateadas + 10 tiradas de Gachapon por victoria.
- **Modo ver:** `PREVIEW.Kalos` en data.js está en `false`; ponlo en `true` para ver los 13 combates sin tocar tu partida.
- **Megaevolución:** los Pokémon que tienen mega disponible llevan el campo `mega` en su plantilla (`PM('lucario', 448, ...)`) y **megaevolucionan solos** unos segundos después de salir (ver «Mega-Aro y Megaevolución» más abajo).

**Fondos de combate (js/arenaskalos.js)**, al estilo de los gimnasios dinámicos de Blanco y Negro (centro del suelo libre, laterales y luces animadas):
- Violeta (Bicho): invernadero gigante de cristal con enredaderas, flores flotando y un haz de luz cenital.
- Lino (Roca): rocódromo excavado en la roca con cascadas laterales y antorchas / neón.
- Corelia (Lucha): pista de patinaje y dojo con suelo LED, barandillas, estatuas de Lucario y paneles de luz.
- Amaro (Planta): estructura de madera en la copa de un árbol milenario, plataformas con cuerdas y hojas gigantes que se mecen.
- Lem (Eléctrico): torre tecnológica con engranajes gigantes, pantallas holográficas y circuitos con corriente.
- Valeria (Hada): pasarela de moda con celosías japonesas y cerezos; los pétalos de sakura caen durante el combate.
- Ástrid (Psíquico): observatorio con suelo de cristal sobre el cosmos, planetario, galaxias y estrellas fugaces.
- Édel (Hielo): laberinto ártico de hielo pulido que refleja, pinos nevados y ventisca en bucle.
- Malva, Narciso, Tileo (salón encantado, fantasma), Ágata (cámara acorazada, acero) y Dianta: salas de la Liga de Kalos (cada una con su tipo y su ambiente).

**Música de Kalos:** carpeta `musica/Kalos/` (ver la sección de música).

## Mega-Aro y Megaevolución (js/mega.js)
- **Objetos clave:** `save.keys` guarda objetos únicos que no se gastan. Hoy solo existe el **Mega-Aro** (`KEY_ITEMS` en mega.js). Se ve en **Mochila › Objetos clave**. Sprites: `objetos/megapiedras/` (`mega-bracelet.png` es el Mega-Aro; el resto son las Piedras Activadoras, con el nombre en inglés: `lucarionite.png`, `alakazite.png`, `gardevoirite.png`...; la ruta está en `MEGA_DIR`, mega.js).
- **Cómo se consigue:** el logro **«Mega-Aro»** se completa al ser **Campeón de Teselia** (vencer a Mirto). El anillo se entrega **solo, al completar el logro** (no hace falta reclamarlo; los 1000 BP + 10 tickets sí se reclaman en Logros). Si ya eras Campeón de Teselia, lo recibes al abrir el juego.
- **Megapiedras (Tienda):** pestaña **Megapiedras**, 22 piedras a **3000 BP** (`MEGA_PRICE`). Se equipan en Equipo Pokémon como cualquier objeto, pero **solo en su Pokémon** (`itemFits`, mega.js, usada por el desplegable de team.js). Comprarlas y equiparlas no exige el Mega-Aro; **megaevolucionar sí**.
- **En combate:** con la piedra equipada y el Mega-Aro, a la derecha de la barra de ataques sale el hueco **«R · MEGAEVOLUCIÓN»** (también al empezar sale el cartel «¡MEGAEVOLUCIÓN LISTA! (R)»). Pulsa **R** o haz clic en el hueco. **Solo una megaevolución por combate** para todo tu equipo (`megaUsed`, mega.js; el rival también tiene la suya): al usarla, el hueco de los demás Pokémon con piedra pasa a «YA USADA». Si llevas la piedra pero no tienes el Mega-Aro, el hueco dice «SIN MEGA-ARO» y R muestra «¡NECESITAS EL MEGA-ARO!». **R ya no cambia de Pokémon** (se cambia con 1 · 2 · 3 o clic en los cuadritos).
- **Tarjeta de combate (render.js, `hud()`):** nombre, tipos, barras PS / EN (con marcas al 50 % y 20 % en la de vida), objeto en una línea y habilidad en otra (`HUD_H` = alto de la tarjeta, `ICON_DY` = dónde empiezan los cuadritos). Los cuadritos del equipo llevan una «M» (arcoíris = mega lista, rosa = ya megaevolucionó, gris = otra mega ya usada) y una ✖ si están debilitados; la tarjeta de un Pokémon megaevolucionado tiene borde arcoíris. El retrato del líder va en un marco a la izquierda del panel «PISO / tiempo» (no debajo, para no mezclarse con el subtítulo ni el aviso del clima). `textO()` dibuja texto con contorno (avisos flotantes y subtítulo).
- **Qué cambia al megaevolucionar** (`megaApply`): sprite (`pokemon_mega/<nº>-mega/`; si no existe usa el normal), tipos, habilidad, ataque (el mayor entre Atq y Atq. Esp. de la mega) y velocidad. Los PS no cambian. Los movimientos son los mismos.
- **Animación (estilo X/Y):** el combate se detiene ~2,8 s: el escenario se oscurece, la piedra baja una hélice de luz arcoíris, el Pokémon se vuelve una silueta blanca, destello, símbolo mega, ondas arcoíris y cartel «¡X HA MEGAEVOLUCIONADO!». Constantes en `MEGA_T`; el sonido es `Sfx.play('mega')` (music.js).
- **Rival:** el campo `mega:'<clave>'` de su plantilla (kalos.js, helper `PM`) hace que megaevolucione `MEGA_FOE_DELAY` (4) s después de salir al campo.
- **Las 22 megas:** Charizard X, Alakazam, Gengar, Kangaskhan, Aerodactyl, Mewtwo Y, Steelix, Houndoom, Tyranitar, Gardevoir, Mawile, Manectric, Camerupt, Altaria, Banette, Glalie, Latias, Latios, Lopunny, Lucario, Gallade y Diancie. Solo entraron las que tienen piedra y sprites completos. **Lucario y Gardevoir no tienen «Shoot»** y usan la animación de reposo al disparar hasta que la tengan.
- **Habilidades de las megas (todas hechas):** las 22 llevan la habilidad oficial de los juegos y el motor la aplica al megaevolucionar (se reaplica «al entrar»). Las que se añadieron para las megas están en la tabla de habilidades de abajo (fila «Megas»). Estadísticas y habilidades comprobadas con Bulbapedia (octubre 2026).
- **Añadir una mega:** carpeta `pokemon_mega/<nº>-mega/` + piedra en `objetos/megapiedras/` + una línea en `MEGA` (mega.js). La Tienda y el equipo la cogen solos.
- **Créditos:** los sprites de `pokemon_mega/` son de PMD SpriteCollab (CC BY-NC 4.0).

## Música dinámica (js/music.js, carpeta musica/)
El juego cambia la música solo según el entrenador al que te enfrentas. La música está organizada en **una carpeta por región** (`musica/Kanto/`, `Johto/`, `Hoenn/`, `Sinnoh/`, `Unova/`, `Kalos/`) y cada archivo tiene un **nombre que dice para qué es** (`Combate Lideres`, `Combate Alto Mando`, `Combate Campeon`, `Victoria Lideres y Alto Mando`...). Si falta un archivo, suena una música **generada por el propio juego** (original), así que nunca hay silencio. El menú y el Campo de Entrenamiento usan siempre música generada.

**Archivos por región** (`musica/<Región>/<archivo>.ogg`)
| Región | Líderes | Alto Mando | Campeón | Victoria |
|---|---|---|---|---|
| Kanto | `Combate Lideres y Alto Mando` | (el mismo) | `Combate Campeon Azul` | `Victoria Lideres y Alto Mando` (Azul: jingle) |
| Johto | `Combate Lideres y Alto Mando` | (el mismo) | `Combate Campeon` | `Victoria Lideres y Alto Mando` (Lance: jingle) |
| Hoenn | `Combate Lideres` | `Combate Alto Mando` | `Combate Campeon` | `Victoria Lideres y Alto Mando` · `Victoria Campeon` |
| Sinnoh | `Combate Lideres` | `Combate Alto Mando` | `Combate Campeona Cintia` | `Victoria Lideres y Alto Mando` · `Victoria Campeona` |
| Unova (Teselia) | `Combate Lideres` | `Combate Alto Mando` | `Combate Campeon` | `Victoria Lideres y Alto Mando` · `Victoria Campeon` |
| Kalos | `Combate Lideres` | `Combate Alto Mando` | `Combate Campeona` | `Victoria Lideres` · `Victoria Campeona` |

**Pistas (ids de `MUSIC_TRACKS`)**
| id | Cuándo suena |
|---|---|
| `menu` | Menús, equipo, tienda, ajustes (música generada) |
| `lider_<región>` | Los 8 líderes de la región (en Teselia, los 10 gimnasios) |
| `alto_<región>` | Los 4 del Alto Mando de la región |
| `campeon_azul`, `campeon_lance`, `campeon_plubio`, `campeon_cintia`, `campeon_mirto`, `campeon_dianta` | Los campeones de Kanto, Johto, Hoenn, Sinnoh, Teselia y Kalos |
| `win_lider_<región>`, `win_campeon_<región>` | Tema de victoria: suena **una sola vez** al ganar. Si la pista no tiene tema de victoria (Azul y Lance) suena el jingle de siempre |
| `campo` | Campo de Entrenamiento (música generada) |

**Cómo se indica un archivo:** en `MUSIC_TRACKS` (music.js), `file:'Kalos/Combate Lideres'` = `musica/Kalos/Combate Lideres.ogg` (admite carpeta y espacios) y `win:'<id de la pista de victoria>'`. Las pistas con `once:true` suenan una vez, sin bucle. **Peso:** todo se recodificó a Ogg Vorbis ~92 kbps (los originales en `musica/Musica2/` pesaban ~120 MB; ahora son **~29 MB** las 6 regiones). Comando: `ffmpeg -i original.ogg -c:a libvorbis -q:a 2 "Combate Lideres.ogg"`. Los originales de `musica/Musica2/` no se suben a GitHub (`.gitignore`). Los archivos antiguos de la raíz (`lider_kanto.ogg`, `lider_johto.ogg`, `alto.ogg`, `jefe.ogg`) ya no se usan y se pueden borrar.

**Cómo funciona**
- `MUSIC_TRACKS`: lista de pistas (nombre, `loop:[inicio,fin]` opcional en segundos, receta de la música generada).
- `MUSIC_BY_TRAINER`: id de entrenador → pista. Para añadir un entrenador nuevo, añade una línea ahí.
- `MUSIC_EXT=['ogg','mp3']`: extensiones que se prueban en orden.
- `file:` en una pista elige el archivo (con su carpeta); varias pistas pueden compartir el mismo (en Kanto y Johto, líderes y Alto Mando).
- `Music.play(id)`, `Music.stop()`, `Music.battle(o)`, `Music.scene(vista)`, `Music.setVolume(0-100)`, `Music.setMute(bool)`, `Music.duck(bool)`.
- Al empezar un combate (`startBattle`) se hace un fundido cruzado a la pista del entrenador; al salir al menú vuelve la música tranquila; en la pantalla de resultado se apaga suavemente.
- Bucle sin cortes con Web Audio (`AudioBuffer`). Si abres con doble clic (`file://`) usa `<audio>`, que puede dejar un pequeño hueco en el bucle.
- El navegador solo deja sonar tras el primer clic o tecla; es normal.

**Controles**: tecla **M** = silenciar/activar; Ajustes → Audio (volumen general, música, efectos y silenciar; ver la sección de Ajustes más abajo). Para ver qué pistas usan tu archivo: `await Music.probe()` en la consola (F12); en la pausa (Esc) la música baja y hay botón "Música: sí/no". Volumen y silencio se guardan.

**Aviso**: la música de las 6 regiones es **oficial de Pokémon** (© Nintendo / Game Freak / The Pokémon Company), aportada por el autor para uso personal y educativo. Si el repositorio es público puede acarrear una reclamación, y no se puede monetizar: en ese caso, retírala y el juego usa música generada. Mejor usar un servidor (o GitHub Pages) que doble clic.

**Créditos de la música:** ver «Créditos y avisos legales» al final. El menú y el Campo usan música generada por el propio juego.

## Campo de Entrenamiento: estadio y desbloqueo de dificultades
**Estadio (js/arenascampo.js, arena `campo`)**: todos los combates del Campo se juegan en el mismo estadio de entrenamiento, de día y dibujado con código: césped en franjas, líneas de tiza, círculo central con Poké Ball, dos zonas de tierra pisada para los Pokémon, grada con público (algunos animan), banderines que ondean, vallas con el emblema de Poké Ball, conos, vallas de salto, neumáticos, saco de golpeo y barreras acolchadas a los lados. El campo `arena` de cada entrenador en `campo.js` ya no se usa.

**Desbloqueo**:
- **Fácil**: siempre abierta.
- **Media**: se abre al vencer a los 9 entrenadores de Fácil.
- **Difícil**: se abre al vencer a los 11 entrenadores de Media (y tiene 10 entrenadores propios).
- Las dificultades bloqueadas se ven en gris con 🔒, botón "Bloqueado" y un aviso de cuántos faltan; cada dificultad muestra "N de M entrenadores vencidos" y los vencidos llevan ✓. Al terminar una dificultad, la pantalla de victoria avisa de la que se desbloquea. No se puede entrar a una bloqueada ni desde la consola.
- Las victorias se guardan en `save.campoWins` (`{id:1}`). Las partidas antiguas empiezan con 0 victorias (la Fácil está abierta).
- Los entrenadores con `opt:true` (por ejemplo Cazabichos, que solo sale si existe su imagen) no cuentan.
- Si prefieres que baste con vencer a UNO de cada dificultad, pon `CAMPO_BASTA_UNO = true` al principio de la sección "COMBATE Y RECOMPENSA" de `js/campo.js`.

## Panel VS antes del combate (js/vspanel.js, final de css/style.css bajo `#vs`)
- **Resumen del Gachapón (`showSummary` en js/gachapon.js):** una carta `.sc` por tirada con la bola de su rareza (`ballURL`), el sprite en un canvas de 160x160 dibujado a escala 5 (`sc:5, fit:150`, con `image-rendering:pixelated` para que los píxeles salgan nítidos), sombra (`.sp::after`), nombre, naturaleza (solo si es nuevo) y premio. Las legendarias, épicas y shiny llevan `.hi` (brillo que late). Los sprites se animan con el intervalo de 120 ms que ya usa la pantalla de revelado (`stage === 'summary'`).
- **Personajes del panel VS:** `save.gender` vale `'m'` (chico = `avatares/red-gen3.png`), `'f'` (chica = mitad derecha de `avatares/RED Y LEAF.png`) o `'r'` (Red Masters = `avatares/red-masters.png`). `setPlayerSkin` (js/vspanel.js) dibuja el elegido; para las imágenes sueltas, `vsTrim` recorta el margen transparente (mira el rectángulo de píxeles dibujados) para que el personaje salga grande. El Masters es exclusivo de la cuenta cuyo nombre en Amigos es `VS_MASTERS_USER` (`'yumbax'`): `skinAllowed('r')` mira `cloud.name`; con otra cuenta (o sin sesión) se usa el chico y el botón ni aparece en el Perfil. Es solo adorno, no una protección (cualquiera puede escribir `r` en su partida guardada local). Esas tres imágenes no salen en la lista de avatares (`VS_SKIN_FILES`). Si falta la imagen nueva, se usa la mitad izquierda de la antigua.
- **Diseño del panel VS:** `.vs-me` y `.vs-foe` ocupan toda la pantalla y se recortan con `clip-path` (diagonal del 57 % arriba al 43 % abajo); la franja blanca `.vs-cut` tapa la unión y se «dibuja» con una animación. Cada lado lleva `--t` (su color base) y de ahí salen el degradado, los rayos y la barra de la placa. El rival usa el color de su tipo: `vsTint(lista)` cuenta el primer tipo de sus Pokémon y, si la mitad o más lo comparten (un líder de gimnasio), `--t` es `TC[tipo]` y la placa pone «Tipo Roca»; si no, queda azul. El retrato (`.vs-pic`) lleva contorno blanco con `drop-shadow` y flota suave (`vsFloat`). Cada Pokémon va en un aro `.vs-mon` del color de su primer tipo (`--tc`). `.vs-flash` es el destello blanco inicial. Para cambiar colores o tamaños: bloque «PANEL VS» de css/style.css.
- **Sonidos de combate (golpes):** `hit()` de js/combat.js llama a `hitSfx(mult, crit, dead)` justo después de `fxHit`. Según la eficacia (`mult`, la misma que decide el aviso «¡Muy eficaz!») suena `hit_super` (mult ≥ 2), `hit_weak` (< 1), `hit_none` (0) o `hit` (normal); si es crítico se suma `crit`, si el golpe lo debilita suena `faint` 230 ms después, y si una habilidad lo para suena `dodge` (esquiva) o `hit_none` (inmune). La carrera (Espacio, ataque 0) suena con `dash` desde `use()`. Los sonidos están en la tabla `SFX` de js/music.js, generados con WebAudio (sin archivos): osciladores que bajan de tono en curva (`x:1`, el «tump» del golpe) más ruido filtrado (`n:1`, el «chasquido»). El mismo efecto no suena dos veces en menos de 45 ms (`sfxLast`) para que las ráfagas no saturen. Usan el volumen de **Efectos de sonido**. Para retocarlos, cambia `f`, `to`, `v` o `d` de cada nota.
- **Música en la pantalla VS:** al abrirse el panel suena ya la música del combate (`music:o` en las llamadas `vsIntro` de modes.js y campo.js; `vsIntro` llama a `Music.battle(o.music)`). Cuando empieza el combate, `startBattle` la pide otra vez y, como ya suena, no se reinicia. Si cancelas con Esc, vuelve la música del menú (`Music.play('menu')` en `vsEnd`).
- Sale antes de **cada combate de Historia** (`floorFight`, js/modes.js) y del **Campo de Entrenamiento** (`campoFight`, js/campo.js). Reiniciar desde la pausa **no** lo vuelve a enseñar.
- Mitad **roja** (tú): tu nombre de entrenador, tu personaje y tus Pokémon de equipo. Mitad **azul** (rival): su nombre, su retrato (`lideres/...` o `entrenadores/...`) y sus 6 Pokémon. En el centro el **VS** y abajo la etiqueta «3 vs 6 · Región · Líder / Alto Mando / Campeón».
- Se cierra solo a los 4,6 s (`VS_AUTO_MS`). **Clic / Enter / Espacio** lo salta (no se puede saltar en los primeros 0,7 s: `VS_MIN_MS`). **Esc** lo cancela y vuelves al menú sin empezar el combate.
- **Tu personaje (chico / chica):** sale de una sola imagen, **`avatares/RED Y LEAF.png`**, que trae a Red (izquierda = chico) y a Leaf (derecha = chica); el juego enseña una mitad u otra (clase `.skin` en css/style.css). Se elige en **Perfil › Personaje** (`save.gender`: `'m'` chico, `'f'` chica; por defecto chico). Esa imagen **no sale en la lista de avatares**. Si falta se usa el avatar clásico. Si algún día quieres un sprite por separado, basta con cambiar `setPlayerSkin` en js/vspanel.js.
- Uso desde el código: `vsIntro({name, id, path, label, enemies, go})` (`go` es la función que empieza el combate).

## Amuleto Arcoíris (shiny más probable): `CHARM_RATE` en js/data.js
- **Cómo se consigue:** al completar la Pokédex de una región sale el logro **«Pokédex de <región>»** (Kanto 151, Johto 100, Hoenn 135, Sinnoh 107, Teselia 142, Kalos 71, Alola 84, Galar 89, Paldea 99: son los Pokémon de cada región que ya tienen sprite). Al **reclamarlo** recibes 1500 BP + 10 tickets + el **Amuleto Arcoíris de esa región**.
- **Qué hace:** en el Gachapon **de esa región** el shiny sale al **3 %** en vez del 1 % (el triple, como en los juegos). Cada región tiene su propio amuleto; el de Kanto no afecta al Gachapon de Johto. Para cambiar el porcentaje: `CHARM_RATE` (y `SHINY_RATE` es el normal) en data.js.
- **Dónde se ve:** en el logro (con su imagen), en la **Mochila › Amuletos** y en el Gachapon de esa región (tabla de probabilidades con 🌈 y una línea en Reglas). Se guarda en `save.charms` (`{Kanto:true}`) y sale en el JSON de la partida.
- **Imagen:** `objetos/amuleto/Amuleto_Iris.png` (la misma para todas las regiones).
- **Código:** la recompensa de un logro puede llevar `charm:'Kanto'` (achievements.js: `achGrant` lo guarda, `achRewardText` lo escribe); la métrica nueva es `dex_region`; la probabilidad la da `shinyRate(región)` (economy.js), que usa `rollOne`.
- Si más adelante añades sprites a una región, su objetivo sube solo; quien ya reclamó el amuleto lo conserva.

## Shinys en el perfil y Pokémon de tu equipo en el menú
- **Perfil › Pokémon favoritos**: al elegir un favorito que tengas en versión shiny (⭐ en su tarjeta) salen los botones **Normal / ⭐ Shiny**. Al elegir uno nuevo se marca la versión que usas en tu equipo (Equipo Pokémon). El favorito shiny se ve con su sprite shiny y el marco dorado. Solo se puede mostrar shiny si lo has conseguido. Se guarda en `save.profileSh` (`1` por cada favorito shiny; las partidas antiguas siguen valiendo).
- **Menú principal**: los 3 Pokémon que dan vueltas por la torre (`menuMon()` en `js/background.js`) son los 3 de tu equipo, en el mismo orden. Si usas la versión shiny de alguno, sale shiny con brillo y destellos dorados (los demás tienen brillo azul). Si tu equipo está incompleto, se rellena con Dragonite, Charizard y Gengar.
- Se ven a color pero oscurecidos para encajar con la noche. Si prefieres siluetas negras como antes, pon `MENU_MONS_COLOR = false` en `js/background.js` (en ese modo el shiny solo se nota por el brillo dorado).
- Historia › "Tu equipo" también enseña la versión shiny de los que la usan.

## Recompensas, Logros y Ajustes (versión actual)
**Recompensas por victoria** (`REWARD` y `REWARD_REGION` en `js/teams.js`; las claves son chapas, `tickets` = tiradas de Gachapon y `bp` = Puntos de Batalla):
| Combate | Recompensa |
|---|---|
| Campo de Entrenamiento (cualquier entrenador) | **1 tirada de Gachapon** + BP y chapas según la dificultad: **Fácil 50 BP + 5 Plateadas + 5 Doradas · Media 100 BP + 10 + 10 · Difícil 150 BP + 15 + 15** |
| Líder de gimnasio (Kanto y Johto) | **10 tiradas de Gachapon** + 5 Chapas Doradas + 5 Plateadas (como antes) |
| Alto Mando y Campeón de Kanto | **10 tiradas de Gachapon** (sin chapas, como antes) |
| Alto Mando y Campeón de Johto | **10 tiradas de Gachapon** + 5 Doradas + 5 Plateadas (como antes) |
Los combates de la Historia **ya no dan BP** (se quitaron los BP por combate y el "+1 ticket de gimnasio"). Se dan en cada victoria, también al repetir.

**Logros** (`js/achievements.js`). Son 24 en 3 categorías (Historia, Campo, Colección) y dan BP y/o tickets **una sola vez**. Todo sale de una tabla JSON, `ACHIEVEMENT_DATA`:
```json
{"id":"campo_10", "cat":"campo", "name":"Aprendiz", "desc":"Vence a 10 entrenadores en el Campo de Entrenamiento.",
 "icon":"campo", "metric":"campo_wins", "goal":10, "reward":{"bp":200, "tickets":0}}
```
Campos: `metric` = qué se cuenta (`leaders`, `elite`, `champion`, `campo_wins`, `campo_tier`, `pokemon_owned`, `shiny_owned`, `dex_region`; con `region` o `tier` como parámetro) y `goal` = cuántos hacen falta. **Los logros se reclaman a mano.** `achSync()` recalcula todos y marca como **completados** los que se cumplan (se llama tras cada combate ganado, tras cada tirada del Gachapon, al abrir Logros y al arrancar; también cuenta lo que ya habías conseguido), pero **no da nada**: avisa con «Logro completado… ¡Reclama la recompensa en Logros!», la tarjeta se pone en verde con un botón **Reclamar** (y arriba **Reclamar todo**), y la miga «Logros» muestra un circulito rojo con cuántos tienes pendientes. `achClaim(id)` entrega la recompensa (`achGrant({bp, tickets})`) una sola vez. Se guarda en `save.ach[id] = {progress, done, date}`: `done` = fecha en que se completó y `date` = fecha en que se reclamó (las partidas antiguas, que solo tenían `date`, cuentan como ya reclamadas). Se cuentan las victorias totales del Campo en `save.stats.campo`.
**Pantalla de Logros** (`achRender` en `js/achievements.js`; estilos al final de `css/style.css`): lista compacta, una fila por logro (`achRow`): icono (medalla de pixel art, `achMedal`), nombre y descripción, barra de progreso, fichas de recompensa y botón «Reclamar». Arriba, el total reclamado con barra, «Reclamar todo» y «Ocultar reclamados»; pestañas Todos · Historia · Campo · Colección · Secretos (con globo rojo si hay algo listo); los logros listos se fijan en una sección «Listos para reclamar» y el resto se agrupa por región o tipo (`achGroups`). **Logros secretos**: entradas con `secret:true`, `hint` y categoría `secreto`; se muestran como «???» con la pista hasta reclamarlos. **Recompensas especiales**: una recompensa puede llevar `title` (texto) y/o `frame` (id de `ACH_FRAMES`); se desbloquean al reclamar el logro (no hay datos extra guardados) y se eligen en Perfil › «Título y marco» (`save.title` = id del logro, `save.frame` = id del marco). El título sale bajo el nombre (`.utitle`) y el marco es la clase CSS `afr-<id>` sobre el avatar. Para un marco nuevo: una línea en `ACH_FRAMES` y un logro con `frame`. **Marco «Mewtwo shiny»** (`mewtwo` en `ACH_FRAMES`, animación `afrmw` en el CSS): lo da el logro secreto `sec_mewtwo_sh` (`metric:'shiny_dex'`, `dex:[150]`). Los marcos animados usan la propiedad registrada `@property --fc` para cambiar de color suavemente.

| Logro | Qué hay que hacer | Recompensa |
|---|---|---|
| Primer gimnasio | Vencer a 1 líder | 100 BP + 1 ticket |
| Líderes de Kanto / Johto | Los 8 líderes de la región | 500 BP + 5 tickets (cada uno) |
| Alto Mando de Kanto / Johto | Los 4 del Alto Mando | 400 BP + 3 tickets (cada uno) |
| Campeón de Kanto / Johto | Vencer a Azul / Lance | 1000 BP + 10 tickets (cada uno) |
| Maestro de dos Ligas | Campeón de Kanto y Johto | 2000 BP + 15 tickets |
| Líderes / Alto Mando / Campeón de Hoenn | Los 8 líderes · los 4 del Alto Mando · vencer a Plubio | 500 BP + 5 · 400 BP + 3 · 1000 BP + 10 (tickets) |
| Líderes / Alto Mando / Campeona de Sinnoh | Los 8 líderes · los 4 del Alto Mando · vencer a Cintia | 500 BP + 5 · 400 BP + 3 · 1000 BP + 10 (tickets) |
| Maestro de tres Ligas | Campeón de Kanto, Johto y Hoenn | 3000 BP + 20 tickets |
| Líderes / Alto Mando / Campeón de Teselia | Los 10 gimnasios · los 4 del Alto Mando · vencer a Mirto | 500 BP + 5 · 400 BP + 3 · 1000 BP + 10 (tickets) |
| Maestro de cuatro Ligas | Campeón de Kanto, Johto, Hoenn y Sinnoh | 4000 BP + 25 tickets |
| Maestro de cinco Ligas | Campeón de Kanto, Johto, Hoenn, Sinnoh y Teselia | 5000 BP + 30 tickets |
| **Mega-Aro** | Ser Campeón de Teselia (entrega el Mega-Aro al completarlo) | 1000 BP + 10 tickets + Mega-Aro |
| Líderes / Alto Mando / Campeona de Kalos | Los 8 gimnasios · los 4 del Alto Mando · vencer a Dianta | 600 BP + 6 · 500 BP + 4 · 1200 BP + 12 (tickets) |
| Maestro de seis Ligas | Campeón de Kanto, Johto, Hoenn, Sinnoh, Teselia y Kalos | 6000 BP + 35 tickets |
| Campo: 1 / 10 / 25 / 50 / 100 victorias | Vencer entrenadores del Campo | 50 · 200 · 300 + 2 · 500 + 5 · 1000 + 10 (BP + tickets) |
| Campo: Fácil / Media / Difícil superada | Vencer a todos los de esa dificultad | 300 · 500 + 3 · 800 + 6 (BP + tickets) |
| Colección: 10 / 25 / 50 / 100 / 250 Pokémon | Pokémon diferentes | 100 · 200 + 1 · 300 + 3 · 600 + 5 · 1500 + 15 (BP + tickets) |
| Shiny: 1 / 5 / 10 | Shinys diferentes | 500 + 5 · 1000 + 10 · 2000 + 20 (BP + tickets) |
| Pokédex de cada región (9 logros) | Tener todos los Pokémon de esa región | 1500 BP + 10 tickets + **Amuleto Arcoíris** de esa región |
Para añadir un logro: una línea nueva en `ACHIEVEMENT_DATA`. Para una condición nueva: una línea en `ACH_METRICS`.

**Estadio del combate online** (`js/arenaspvp.js`, arena `coliseo`; `PVP_ARENAS` en `js/pvp.js`): estadio nocturno dibujado con código, como las demás arenas. Grada de 5 filas con público (azul izquierda / rojo derecha según el bando) que hace la ola, agita barras de luz y saca flashes; grada baja delante; focos con haces de luz que barren el campo; suelo de paneles teñido por bando; neón (borde, línea del medio, círculos) con una gran Poké Ball central cuyo botón late; círculos de salida y barreras azul/roja. Solo es visual (no cambia el cálculo del combate, así que no hace falta subir `PVP_VER`). Usa `arOval`, `arRing` y `arBall` de `js/arenascampo.js`, por eso se carga después.

**Ajustes** (`openSettings` en `js/menu.js`) ahora tiene tres bloques (Pantalla, Audio y Controles), y se han quitado el nombre, los botones de prueba, la lista de música y el texto de controles:
- **Pantalla**: interruptor de **Pantalla completa** (sigue al navegador si sales con Esc o F11).
- **Audio**: **Volumen general**, **Música del menú**, **Música de combate** (también la de victoria), **Efectos de sonido** (0-100 cada uno) y **Silenciar todo** (tecla M). Música del menú = general x menú; de combate = general x combate; efectos = general x efectos (`save.vol`, `save.volMenu`, `save.volBattle`, `save.volSfx`, `save.mute`). Cada pista de `js/music.js` lleva su propio volumen (la pista `menu` usa el del menú; las demás, el de combate). Las partidas antiguas (`volMusic`) pasan el mismo valor a las dos músicas.
- **Controles** (`js/controls.js`): cada acción del combate (mover, Carrera, Golpe, Disparo, Mejora, Ataque fuerte, Megaevolución y cambio 1·2·3) tiene dos huecos con una tecla (`e.code`) o un botón del ratón (`Mouse0`-`Mouse4`). Se guardan en `save.controls` (viajan con la partida en la nube); lo que no se cambia usa `CTL_ACTIONS[].def`. El juego pregunta `ctlHeld('shot')` (¿pulsado?) y `ctlIs('mega', e.code)` (¿es esa la tecla?). Conflictos = intercambio; Esc y M son fijas (`CTL_RESERVED`). El HUD enseña las teclas (`ctlKey`, `ctlShort`). En el combate online solo se manda el resultado (dx, dy, golpe...), así que cada jugador puede usar controles distintos sin tocar la sincronía. Para añadir una acción: una línea en `CTL_ACTIONS`.
- El juego no tenía efectos de sonido, así que se añadió `Sfx` en `js/music.js`: pitidos generados por código (`click` en los botones, `win`, `lose` y `logro`). `Sfx.play('click')`.
- El **nombre de entrenador** se cambia ahora en **Perfil**.

## Rivales misteriosos en la Historia (js/menu.js, buildStory)
En la pantalla de cada región solo ves a los rivales que ya has vencido y **al siguiente**. Los que aún no te tocan salen ocultos: retrato en silueta gris, nombre «???», sin tipo ni lugar y con el botón «Bloqueado» (`.lcard.mystery` en `css/style.css`). Se descubren de uno en uno al vencer al anterior, así no sabes qué tipos vienen y hay más misterio. Vale igual para líderes, Alto Mando y Campeón, y para todas las regiones (usa `progOf(región)`, lo que ya llevas vencido). Si quieres ver el tipo del siguiente rival para poder prepararte, o ver también un rival más, cambia `locked` en `buildStory()` (ahora `i > rec`).

## Pantalla de Historia rediseñada (index.html `#tower`, js/menu.js `buildStory`, final de css/style.css)
- **Banner de la región** con el mapa de fondo (`region/tarjetas/<Región>.webp`), el título y tres contadores: líderes, Alto Mando y Campeón (se dora al vencerlo).
- **Camino de progreso:** un punto por combate (8 líderes, Alto Mando y Campeón). ✓ = hecho, dorado y con número = el siguiente, candado = bloqueado. Debajo pone «Siguiente: …».
- **Tu equipo** en barra compacta (miniatura, nombre, tipos y objeto) con el botón **Editar equipo y objetos** al lado.
- **Tarjetas de líder** teñidas con el color de su tipo (`TYPE_OF_TAG` + `TC`): retrato grande, insignia de tipo, lugar, **los 6 Pokémon del rival en miniatura**, iconos de recompensa (`rewardOf` + `rwIcon`) y botón **Retar** (dorado si es el siguiente) / **Repetir** (verde) / **Bloqueado**. Los rivales que aún no te tocan siguen ocultos: candado, silueta y «???».
- Una columna en todas las pantallas. La lógica de combates y recompensas no se ha tocado: el botón sigue llamando a `floorFight`.
- **Volver al editar el equipo:** el botón «Editar equipo y objetos» abre el panel con `openTeam('story')`; al pulsar «✕ Cerrar» (o Esc) vuelves a la Historia, ya con el equipo y los objetos nuevos. Igual que desde la Tienda (`'shop'`). Si abres el equipo desde el menú, sigue volviendo al menú (`closeTeam` en js/team.js).
- Las recompensas de las tarjetas usan la clase `.rwm` (no `.rwc`, que es la de la pantalla de victoria).

## Imágenes de las regiones (carpeta region/)
Cada tarjeta de la pantalla **Historia** muestra el mapa de su región de fondo, con un degradado oscuro para que se lean los textos. Las imágenes originales están en `region/` (`Kanto.webp`, `Johto.webp`...) y las que usa el juego son versiones **recortadas en panorámico (16:9) y más ligeras** en `region/tarjetas/` (50-90 KB cada una). Para cambiar una, sustituye su archivo de `region/tarjetas/` (mismo nombre, mejor proporción 16:9). Se cargan con la variable `--map` que pone `buildRegions()` en `js/menu.js` (`REGION_IMG` solo hace falta si el archivo se llama distinto a la región, como `Unova` para «Unova / Teselia»). Los estilos están en `.rcard` de `css/style.css`: bloqueadas en gris, abiertas a todo color y con un pequeño zoom al pasar el ratón.

## Animación de cambio de Pokémon (js/swap.js)
Al cambiar de Pokémon con **1, 2 o 3** (antes también con R, que ahora es la Megaevolución) o haciendo **clic en sus cuadritos** se ve la animación del anime. Las teclas no han cambiado: `switchMon()` en `js/combat.js` sigue decidiendo qué Pokémon entra y ahora llama a `swapStart()`.

1. **Retirada:** sale un rayo rojo de una Poké Ball (esquina de abajo a la izquierda; la del rival, arriba a la derecha), alcanza al Pokémon, lo vuelve luz roja y lo absorbe hacia la bola.
2. **Lanzamiento:** la Poké Ball del nuevo Pokémon vuela en arco hasta el suelo. Su color depende de su rareza, igual que en el Gachapon (Común = Poké Ball, Poco común = Superball, Rara = Ultra Ball, Épica = Honor Ball, Legendaria = Master Ball, shiny = bola dorada).
3. **Apertura:** la bola se abre con un destello, una columna de luz, ondas y chispas, y el Pokémon sale como una silueta blanca que recupera su color.

Reglas: mientras dura (unos 2 segundos, `SWAP` al principio de `js/swap.js`) el Pokémon que entra está «fantasma» (`ghost`): no se ve como siempre, no recibe golpes, no se mueve ni ataca, y no se puede empezar otro cambio (después hay que esperar 5 s, ver «Cambiar de Pokémon en combate»). El rival se mueve pero no ataca a un Pokémon que está cambiando. Se conservan PS, mejoras, energía y objetos de cada Pokémon. La pausa (Esc) congela la animación. Si un Pokémon se debilita, el siguiente (tuyo o del rival) entra con el lanzamiento y la apertura (sin retirada, porque ya se había ido). Los dos sonidos nuevos (`recall` y `sendout`) están en `SFX` de `js/music.js`.

## IA del rival (js/ai.js)
**Solo la usan los jefes de la Historia: líderes, Alto Mando y Campeón** (`g.o.boss`, que viene de `kind` en `FLOORS`). Los demás rivales (Campo de Entrenamiento…) usan `enemyBasic`, la IA sencilla de siempre (se acerca o se aleja y ataca al azar). `update()` de `js/combat.js` decide con `aiSmart()` y llama a `enemyAI(E, P, dt)` en cada fotograma; cada jefe juega según su Pokémon:

- **Estilo:** `melee` (pegador), `range` (tirador) o `hybrid` (mixto). Se decide con las estadísticas base (Ataque contra Ataque Esp.) y el objeto que lleva (Cinta Elección empuja a melee; Gafas Elección/Especiales, a distancia). Un rival puede forzarlo con `E.style`.
- **Melee:** se acerca (con la carrera si está lejos) y encadena golpes **solo cuando estás a su alcance real** (el mismo `90 + radio` que usa `melee()`), así nunca golpea al aire.
- **A distancia:** mantiene la distancia, dispara hacia donde vas a estar (no hacia donde estás) y no gasta el golpe si estás fuera de su alcance.
- **Esquiva:** si un proyectil tuyo va a darle, hace una carrera lateral. No se queda atascado en las esquinas.
- **Energía y habilidades Q/E:** respeta la energía y los enfriamientos igual que el jugador; usa la mejora (**Q**) al entrar y guarda el ataque fuerte (**E**) para cuando va a dar.
- **Dificultad:** la habilidad del combate (`g.o.skill`, `DIFF` en data.js) controla cuánto tarda en reaccionar, cuánto esquiva y cuánto falla al apuntar. `AI_TUNE.agg` (js/ai.js; un número por tipo de jefe: líder .8 · Alto Mando 1.2 · Campeón 1.8) sube o baja la agresividad de todos.
- No hay trampas: el rival usa las mismas funciones `use()`, `melee()` y `shot()` que el jugador, con su propia energía y sus propios enfriamientos.
- **Interruptor:** `AI_TUNE.on = false` (js/ai.js) hace que TODOS los rivales vuelvan a la IA sencilla de siempre.
- **Cuando tú cambias de Pokémon:** el rival (todos, no solo los jefes) **se aleja** mientras dura la animación de cambio (`aiRetreat()` en js/ai.js; se aparta hasta `AI_SWAP.back` ≈ 430 px, o rodea hacia el centro si está en una esquina) y **no ataca**. Cuando tu nuevo Pokémon ya ha salido, espera `AI_SWAP.grace` ≈ 0,7 s antes de volver a atacar (`g.swGrace`, que descuenta `update()` en combat.js y pone `swapUpdate()` en swap.js). Para que ataque nada más salir: `AI_SWAP.grace = 0`. Vale también cuando tu Pokémon se debilita: el rival **se aleja en cuanto cae** (no espera a que salga el siguiente; `aiAway()` en js/ai.js cuenta como "te estás yendo" tanto `ghost` como `dead`), no ataca mientras tu Pokémon está caído y, al salir el siguiente, también espera `AI_SWAP.grace`.
- Nota de equilibrio: contra un jugador que se mueve, la IA lista hace aproximadamente el doble de daño por segundo que la sencilla; subir o bajar `agg` cambia poco, porque el límite lo ponen la energía y los enfriamientos.

## Cambiar de Pokémon en combate: clic y espera de 5 s (js/combat.js, js/render.js, js/ui.js)
- Además de las teclas **1, 2, 3**, ahora puedes **hacer clic en los cuadritos pequeños** de tu equipo (debajo de tu tarjeta, arriba a la izquierda). El clic en un cuadrito **no dispara**. Al pasar el ratón por encima el cuadrito se marca en verde, el cursor se convierte en una manita y debajo sale «CAMBIAR A …».
- **Espera de 5 segundos:** después de cada cambio tuyo hay que esperar `SWITCH_CD` (5 s, al principio de `switchMon()` en `js/combat.js`) para poder volver a cambiar. Cuenta desde que el Pokémon nuevo ya ha salido de la bola. Mientras esperas, los cuadritos se oscurecen y muestran los segundos que faltan, con una barrita que se vacía; si intentas cambiar antes (con clic o con teclas) aparece «ESPERA X s PARA CAMBIAR» y no pasa nada.
- **Sin espera** cuando tu Pokémon se debilita: el siguiente entra solo y se puede cambiar enseguida. La espera no avanza con el juego en pausa y empieza en 0 en cada combate (`g.swCd` en `js/state.js`).
- En los primeros 8 segundos del combate sale una pista pequeña: «CLIC EN UN CUADRO O TECLAS 1 · 2 · 3 PARA CAMBIAR».
- Código: `hudIconRect()` / `hudIconAt()` (js/render.js) dan la posición de cada cuadrito y los usan tanto el dibujo como el clic (`mousedown` en js/ui.js, que llama a `switchMon(i)`); `swapUpdate()` (js/swap.js) arranca la espera al terminar un cambio voluntario.

## Ordenar el equipo arrastrando (js/team.js, final de css/style.css)
En **Equipo Pokémon** puedes **agarrar una caja y arrastrarla** hacia otro hueco: las demás se apartan para hacerle sitio y, al soltar, el orden se guarda. El Pokémon del hueco **1** es el primero en salir al combate y el que se activa con la tecla 1 (2 y 3 igual). Los botones («Ver datos», «Cambiar», ✕, el desplegable de objetos) siguen funcionando como siempre: solo arrastra si empiezas a mover el ratón fuera de ellos. **Esc** durante el arrastre devuelve la caja a su sitio. Los objetos equipados van con cada Pokémon, no con el hueco. Funciona con ratón y con el dedo (si empiezas desde la cabecera de la caja). Código: `slotDrag()` y `slotDragEnd()` en js/team.js.

## Pokémon sin sprites (de momento ocultos) — `NO_SPRITE` en js/data.js

Hay **47 Pokémon** de Teselia, Kalos, Alola, Galar y Paldea que todavía no tienen sprites en `pokemon/`. Están en la lista `NO_SPRITE` (js/data.js) y **no salen** en el Gachapon (`pool()` en economy.js), la Pokédex, el equipo (js/team.js), el perfil ni los contadores (`7 / 978`, etc.). Los datos siguen en el juego y, si alguien ya los tenía, se quedan guardados en su partida (no se pierde nada; solo se ven cuando se quitan de la lista). Ayudas: `hidden(dex)`, `regionSize(a, b)`, `boxCount()` y `DEX_SHOWN` (data.js).

Los 12 que se van a añadir y **siguen dentro** (hay que poner sus carpetas `pokemon/<nº>/`): 618 Stunfisk, 683 Aromatisse, 733 Toucannon, 865 Sirfetch'd, 879 Copperajah, 929 Dolliv, 945 Grafaiai, 990 Iron Treads, 1003 Ting-Lu, 1020 Gouging Fire, 1021 Raging Bolt y 1025 Pecharunt. Los sprites que da SpriteCollab para ellos vienen **incompletos**: casi todos solo tienen `Idle` (y algunos `Walk`, `Charge`, `Hurt`); 1003 Ting-Lu usa la versión «Temp» de SpriteCollab (casi completa, sin Faint ni shiny). Cuando falta una animación, el juego usa `Idle` (`drawFrame` en js/sprites.js). **Ojo con los nombres:** SpriteCollab llama a los archivos `Idle-Anim.png` y guarda el shiny en `0000/0001/`; el juego necesita `Idle.png` y `s/Idle.png` (hay que renombrarlos y copiar solo las 7 animaciones).

**Para volver a poner un Pokémon:** copia su carpeta `pokemon/<nº>/` (con Idle, Walk, Attack, Shoot, Charge, Hurt, Faint y `s/`) y borra su número de `NO_SPRITE`.

Ocultos ahora mismo: 514, 516, 520, 522, 523, 538, 558, 564, 565, 591, 592, 593, 616, 626, 668, 732, 735, 756, 765, 837, 838, 839, 866, 870, 878, 893, 931, 942, 943, 944, 947, 948, 949, 950, 954, 956, 962, 973, 986, 993, 999, 1001, 1002, 1008, 1014, 1022 y 1023.

## Modo ver (temporal): abrir una región entera sin tocar tu progreso — `PREVIEW` en js/data.js

`const PREVIEW = {Sinnoh: false, 'Unova / Teselia': false};` (ahora está **apagado**; cambia `'Unova / Teselia': false` a `true` para ver los 15 combates de Teselia sin tocar tu partida) abre la región de Sinnoh en el menú de Historia y deja ver/combatir **los 13 combates** (8 líderes, 4 del Alto Mando y el Campeón) como si ya los hubieras superado. **No toca tu partida:** no cambia `save.prog`, `save.champ` ni nada guardado, y al ganar en una región en modo ver no se guardan progreso, EVs, trofeo ni recompensas (sale la etiqueta «MODO VER»). Para quitarlo: `Sinnoh: false` (y la región vuelve a abrirse solo cuando seas Campeón de Hoenn). Se puede poner otra región, p. ej. `{Sinnoh: true, Galar: true}`. Código: `buildRegions()`/`buildStory()` (js/menu.js) y `endBattle()` (js/modes.js). Ojo: al entrar en una región el juego guarda `save.region` (la región del Gachapon); si luego apagas el modo ver y la partida se queda en esa región, vuelve al menú y elige otra.

## Pantalla de victoria (js/victoria.js, final de css/style.css)
Al ganar un combate de la Historia o del Campo de Entrenamiento, la pantalla de resultado enseña: el **retrato del rival vencido**, el cartel «★ VICTORIA ★», el título y **una tarjeta por cada recompensa** (Tiradas de Gachapon, Puntos de Batalla, Chapas Doradas, Chapas Plateadas) con su icono pequeño, la cantidad que sube contando («+10») y lo que tienes ahora. Si es la primera victoria del día, la tarjeta de tiradas lleva la etiqueta «¡PRIMERA DEL DÍA! ×2». Debajo salen etiquetas con lo demás: EVs, trofeo de la Liga, siguiente rival, dificultad del Campo superada... Las recompensas son exactamente las de siempre (`REWARD` y `REWARD_REGION` en js/teams.js): `giveReward()` las concede y las deja en `lastReward`, y `victoryScreen()` las dibuja. En la derrota se ve la pantalla sencilla de antes. Para un tipo de recompensa nuevo: nómbralo en `REWARD_NAMES` (teams.js) y dale color e icono en `RW_LOOK` (victoria.js).

## Botones de Menú y Volver: siempre arriba
En todas las pantallas el botón para salir (**← Menú** o **← Regiones**) está **arriba del todo**, encima del título: Historia, lista de líderes, Tienda, Campo de Entrenamiento, Logros, Perfil, Mochila, Ajustes y Amigos. La Pokédex, el Gachapon y el Equipo Pokémon ya lo tenían en su cabecera. En los paneles lo pone `panel()` (js/menu.js, constante `BACK`); en Historia y en la lista de líderes están al principio de `#regions` y `#tower` en index.html. Los botones de después de un combate (Otra vez, Siguiente líder, Menú...) siguen abajo porque son las opciones de esa pantalla.

## Pokédex rediseñada (js/pokedex.js, final de css/style.css bajo `#dexv`)
- **Filtros en menos filas:** pestañas de región, una fila con el buscador + tres desplegables (**Tipo**, **Ver**: todos / los que tengo / los que me faltan / shiny / favoritos, y **Orden**: Nº, nombre, rareza, recientes, más usados) y una fila con las pastillas de rareza y el contador. Antes eran 6 filas y la lista empezaba a media pantalla. Los desplegables usan `dx.status` y `dx.sort`, igual que antes.
- **Ficha más compacta:** a la izquierda el sprite (más pequeño), a la derecha número, nombre, rareza, tipos y Normal/Shiny. Debajo: botones de acción, animaciones, debilidades, estadísticas y ataques. Las etiquetas de estadísticas son cortas (`STAT_SHORT`: PS, Ataque, Defensa, At.Esp., Def.Esp., Veloc.) para que no se corten; salen en el orden clásico (PS, Ataque, Defensa, At. Esp., Def. Esp., Velocidad).
- **Debilidades y resistencias** (`weakRows`): usa la tabla de tipos del combate (`CH` y `eff()` de data.js), así que coincide con lo que pasa de verdad. Si tiene dos tipos se multiplican: ×4 muy débil, ×2 débil, ×½ y ×¼ resiste, ×0 inmune. Solo se ve si ya tienes el Pokémon.
- **Animaciones:** botones Reposo / Ataque / Herido para ver cómo se mueve (`dx.anim`). La escala se calcula con la hoja de Reposo para que no se encoja con los fotogramas más grandes del ataque; si un Pokémon no tiene esa animación se ve el Reposo.
- **Acciones:** el botón de favorito (⭐) y, si aún no tienes el Pokémon, **Consíguelo en el Gachapon →**. El equipo se arma solo en Equipo Pokémon (no hay botón de añadir desde la Pokédex).

## Pokédex: datos y ataques de cada Pokémon, y el nivel del rival no se muestra
Al pulsar un Pokémon en la **Pokédex** (`js/pokedex.js`, función `renderDetail()`), el panel de la derecha enseña sus **estadísticas base** (con el **Total**), la naturaleza, la habilidad y sus **4 ataques** (Golpe, Disparo, Mejora y Fuerte) con el tipo de cada uno. Los ataques salen con `movesOf(dex)`, así que si has enseñado un MT a ese Pokémon, aparece el nuevo. Si todavía no lo tienes, los ataques salen como `???`, igual que el resto de sus datos. El estilo de la lista está al final de `css/style.css` (`.dxmv`).

En el combate, la caja de datos del rival **ya no muestra «NV 120»** (en `hud()` de `js/render.js`). Solo se ven su objeto y su habilidad. El nivel sigue existiendo por dentro (`FLOORS`, `DIFF`) para calcular la dificultad, pero el jugador no lo ve; si más adelante se añaden niveles, solo hay que volver a dibujarlo ahí.

## MTs y compatibilidad real de movimientos
**Idea:** no todos los Pokémon pueden aprender todos los MT. Cada Pokémon solo puede aprender los movimientos que de verdad aprende en los juegos oficiales. Por ejemplo, Venusaur **no** puede aprender Ventisca ni Llamarada aunque tengas esos MT, pero sí Rayo Solar o Terremoto.

**De dónde salen los datos:** de PokéAPI (https://github.com/PokeAPI/pokeapi, carpeta `data/v2/csv`), que recoge los datos de los juegos oficiales. Se usan los archivos `pokemon_moves.csv`, `moves.csv` y `version_groups.csv`. Además se comprobó contra otra fuente (pokemondb.net): para Ventisca, los 733 Pokémon de Escarlata/Púrpura coinciden con su lista.

**Reglas que sigue (juego de referencia):**
- Un Pokémon puede aprender un movimiento si en su juego de referencia lo aprende **por nivel (incluida la evolución), por MT/MO, por huevo o por tutor**. Como en este juego el MT sirve para «enseñar», todas esas formas legales cuentan.
- **Juego de referencia = Escarlata/Púrpura (Gen 9, con sus DLC)** para los 733 Pokémon que salen ahí. Los otros 292 no salen en ningún juego de la Gen 9, así que se miden con su juego más reciente: Espada/Escudo (244), Leyendas Arceus (17), Diamante/Perla Brillante (22) o Ultrasol/Ultraluna (9). Cada Pokémon se mide con **un solo juego**: no se mezclan generaciones dentro de un mismo Pokémon.
- Solo cuentan las formas normales. Que una forma regional (Alola, Galar, Hisui, Paldea) aprenda algo **no** se lo da a la forma normal.
- Si la fuente no confirma una compatibilidad, **no se da por buena**. Nada se supone por el tipo del Pokémon ni por su aspecto.
- **Afilar y Bomba Imán** no los aprende ningún Pokémon en los juegos de referencia, así que no se pueden enseñar y la Tienda nunca los ofrece. Siguen existiendo como ataque inicial de algunos Pokémon.
- Los ataques con los que **empieza** cada Pokémon (los de `moves.js` y `CUSTOM` de `data.js`) no se comprueban: son los del juego. La compatibilidad se aplica al enseñar MTs.

**Dónde está el código (una sola fuente para la pantalla y la lógica):**
- `js/learnsets.js`: los datos (**archivo generado, no se edita a mano**). `LEARN['Terremoto']` es una lista de números de Pokédex en rangos (`'4-6,37'`). `LEARN_REF` dice qué Pokémon se miden con qué juego.
- `tools/gen_learnsets.py`: el programa que genera `learnsets.js` a partir de los CSV. Para regenerarlo: `python3 tools/gen_learnsets.py RUTA_A_LOS_CSV`. Las reglas están explicadas en la cabecera del propio archivo. **Los CSV no hace falta subirlos a GitHub**, solo se necesitan para volver a generar el archivo.
- `js/training.js`: la lógica. `canLearn(dex, movimiento)` dice si su especie puede. `teachCheck(dex, movimiento)` es **la única comprobación** y devuelve el motivo si no se puede (no es compatible, ya lo conoce, no tienes ese Pokémon). `useMT()` y `recallMove()` la llaman **antes de cambiar nada**; si algo falla, no se toca el Pokémon ni se gasta el MT. Mensaje de incompatible: «Este Pokémon no puede aprender este movimiento.»

**Cómo se usa (Equipo Pokémon › Ver datos):**
- Cada ataque tiene un botón **Cambiar ataque**. Abre una pantalla con: los 4 ataques actuales (con tipo, energía y recarga; el que se va a cambiar sale marcado), los MT de ese hueco que tienes (**✓ Compatible**, **✕ No compatible** con el mensaje al pulsarlo, o «Ya lo conoce») y los **ataques anteriores** que puedes recuperar.
- Al elegir uno sale un **resumen**: «Aprende X · Olvida Y · Gasta 1 MT» y los botones **Confirmar el cambio** y **Cancelar**. No se cambia nada hasta confirmar. **Cancelar y volver**, Esc o cerrar la ventana tampoco tocan nada.
- **Los huecos son fijos** (Golpe, Disparo, Mejora y Fuerte, cada uno con su tecla), como siempre: un MT solo sustituye al ataque de su mismo hueco. Cada tecla hace una cosa distinta en combate, por eso un MT no puede ir a cualquier hueco.
- **Recuperar un ataque anterior:** el ataque que se olvida **no se pierde**: pasa a «Ataques anteriores» de ese hueco. Recuperarlo es **gratis** y no devuelve ni gasta ningún MT: simplemente se intercambia con el actual, así ningún ataque se duplica ni se crea de la nada. El ataque original del Pokémon siempre se puede recuperar. «Restaurar originales» también deja los ataques que tenía en «anteriores».
- **Desde la Mochila:** cada MT tiene el botón **Enseñar a un Pokémon**. Enseña tu equipo con ✓ o ✕ según compatibilidad y, al elegir uno compatible, abre la misma pantalla de resumen y confirmación (mismas reglas, mismo código).
- **Pulsar Confirmar dos veces:** solo cuenta una (hay un bloqueo de medio segundo y además `useMT` vuelve a comprobar que quede el MT y que no lo conozca ya).
- **Se guarda en la partida:** `save.mv` (ataques cambiados), `save.mvHist` (ataques anteriores de cada hueco) y `save.mtV`. Al reiniciar el juego siguen igual.
- **Partidas antiguas:** si un Pokémon ya había aprendido un MT que no podía (por ejemplo, Venusaur con Ventisca), al cargar se **quita ese ataque, vuelve el original y el MT se devuelve a la mochila** (sale un aviso). Solo ocurre una vez (`save.mtV`).
- **Tienda:** solo se venden MTs de movimientos que algún Pokémon pueda aprender.

## Los puños (golpe cuerpo a cuerpo)
Hay **5 golpes de puño** en el hueco 1 (clic izquierdo), cada uno con su propia animación: un puño de pixel art sale del atacante, golpea al rival y deja el efecto de su tipo. Están en `js/fxpunch.js` (dibujo del puño con `fist()`, recorrido con `punchPos()` y una receta por ataque en `MEL['...']`; la duración y cuánto se lanza el atacante están en `FXC['...']`, al final del archivo).

| Ataque | Tipo | Cómo se ve |
|---|---|---|
| Puño Fuego | Fuego | Puño naranja con cola de llamas; al golpear estalla una onda de fuego y salen brasas. |
| Puño Hielo | Hielo | Puño helado con escarcha y trocitos de hielo; al golpear salen cristales en estrella y una onda de frío. |
| Puño Trueno | Eléctrico | Puño amarillo con rayitos alrededor; al golpear salen rayos en todas direcciones. |
| Puño Bala | Acero | Dos puñetazos seguidos, muy rápidos, con líneas de velocidad y destellos de metal. |
| Puño Sombra | Fantasma | Dos puños fantasma salen de un remolino oscuro; al golpear queda una mancha de sombra con llamitas. |

- **Mecánica:** igual que el resto de golpes del hueco 1 (daño, energía y recarga salen de `MV[1]`). La diferencia es el **tipo** del ataque y la animación; los estados (quemar, paralizar...) no se añaden. Se pueden aprender con **MT** en la tienda (pueden aprenderlos 164 Pokémon el Puño Fuego, 179 el Puño Hielo y 199 el Puño Trueno; solo 13 el Puño Bala y 9 el Puño Sombra).
- **Quién los lleva de serie:** solo un Pokémon que de verdad pueda aprenderlo en los juegos (`PUNCHES` y `learnHas()` en `js/moves.js`, con los datos de `js/learnsets.js`). A los demás Pokémon de ese tipo no les cambia nada, siguen con su golpe de siempre. Por eso `learnsets.js` se carga **antes** que `moves.js` en `index.html`.
- **Para añadir otro puño:** ponlo en `MOVESET` (`js/moves.js`) y en `PUNCHES`, escribe su frase en `MOVE_DESC` (`js/moveinfo.js`), añade su nombre de PokéAPI a `MOVES_ES` (`tools/gen_learnsets.py`) y vuelve a generar `js/learnsets.js`, y crea su receta `MEL['Nombre']` y `FXC['Nombre']` en `js/fxpunch.js`.

## Shuriken de Agua (el ataque de Greninja)
Ataque de agua del hueco 2 (clic derecho), el que usa Greninja en los juegos (varios shuriken de agua seguidos) y en el anime (los forma con agua y los lanza girando). Animación en `js/fxshuriken.js`: salen 3 shuriken de agua en abanico, girando con una estela de gotas; al llegar dan tres cortes cruzados y salpican. Daño, energía y recarga salen de `MV[2]` como cualquier disparo pequeño.
- **Quién lo lleva de serie:** solo Greninja (`SIGNATURE` en `js/moves.js`; es de tipo agua/siniestro y su hueco 2 normalmente sería de siniestro). Pueden aprenderlo con MT solo los 2 Pokémon que lo aprenden en los juegos: Greninja y Accelgor (`js/learnsets.js`).
- **Más Excadrill:** Drilbur y Excadrill ahora tienen **Ímpetu Arena** (en `ABILITIES` de `js/data.js`), que dobla su velocidad con tormenta de arena. El Excadrill del Duque Wikstrom la lleva y usa Tormenta de Arena para activarla.

## Lista de ataques del juego (los que se pueden enseñar con MT)
Son **105 ataques**, repartidos en los 4 huecos. «Aprenden» = cuántos de los 1025 Pokémon pueden aprenderlo (datos de `js/learnsets.js`). Para añadir un ataque nuevo: ponlo en `MOVESET` (`js/moves.js`), añade su nombre a `MOVES_ES` en `tools/gen_learnsets.py` y vuelve a generar `js/learnsets.js`.

**Golpe (clic izquierdo): 28 ataques**

| Ataque | Tipo | Aprenden |
|---|---|---|
| Garra Metal | Acero | 95 |
| Puño Bala | Acero | 13 |
| Acua Cola | Agua | 58 |
| Tijera X | Bicho | 117 |
| Garra Dragón | Dragón | 81 |
| Colmillo Rayo | Eléctrico | 99 |
| Puño Trueno | Eléctrico | 199 |
| Garra Umbría | Fantasma | 192 |
| Lengüetazo | Fantasma | 43 |
| Puño Sombra | Fantasma | 9 |
| Colmillo Ígneo | Fuego | 109 |
| Puño Fuego | Fuego | 164 |
| Carantoña | Hada | 162 |
| Colmillo Hielo | Hielo | 96 |
| Puño Hielo | Hielo | 179 |
| Golpe Roca | Lucha | 44 |
| Arañazo | Normal | 93 |
| Ataque Rápido | Normal | 142 |
| Cabezazo | Normal | 111 |
| Golpe Cuerpo | Normal | 544 |
| Placaje | Normal | 335 |
| Látigo Cepa | Planta | 25 |
| Cabezazo Zen | Psíquico | 307 |
| Tumba Rocas | Roca | 374 |
| Mordisco | Siniestro | 210 |
| Excavar | Tierra | 363 |
| Puya Nociva | Veneno | 187 |
| Ataque Ala | Volador | 44 |

**Disparo (clic derecho): 29 ataques**

| Ataque | Tipo | Aprenden |
|---|---|---|
| Bomba Imán | Acero | nadie |
| Hidropulso | Agua | 198 |
| Pistola Agua | Agua | 137 |
| Shuriken de Agua | Agua | 2 |
| Pin Misil | Bicho | 36 |
| Zumbido | Bicho | 71 |
| Dragoaliento | Dragón | 60 |
| Pulso Dragón | Dragón | 120 |
| Impactrueno | Eléctrico | 54 |
| Rayo | Eléctrico | 250 |
| Tinieblas | Fantasma | 94 |
| Ascuas | Fuego | 73 |
| Lanzallamas | Fuego | 202 |
| Viento Feérico | Hada | 23 |
| Voz Cautivadora | Hada | 82 |
| Nieve Polvo | Hielo | 30 |
| Rayo Hielo | Hielo | 273 |
| Esfera Aural | Lucha | 43 |
| Doble Filo | Normal | 435 |
| Triataque | Normal | 25 |
| Hoja Afilada | Planta | 60 |
| Confusión | Psíquico | 91 |
| Psicorrayo | Psíquico | 116 |
| Lanzarrocas | Roca | 41 |
| Pulso Umbrío | Siniestro | 173 |
| Disparo Lodo | Tierra | 238 |
| Bomba Lodo | Veneno | 156 |
| Picotazo Veneno | Veneno | 43 |
| Tajo Aéreo | Volador | 139 |
| Tornado | Volador | 47 |

**Mejora (Q): 28 ataques**

| Ataque | Tipo | Aprenden |
|---|---|---|
| Defensa Férrea | Acero | 234 |
| Danza Lluvia | Agua | 682 |
| Refugio | Agua | 34 |
| Danza Aleteo | Bicho | 12 |
| Danza Dragón | Dragón | 68 |
| Carga | Eléctrico | 75 |
| Maldición | Fantasma | 275 |
| Día Soleado | Fuego | 664 |
| Campo Neblinoso | Hada | 58 |
| Neblina | Hielo | 63 |
| Corpulencia | Lucha | 126 |
| Afilar | Normal | nadie |
| Danza Espada | Normal | 270 |
| Desarrollo | Planta | 72 |
| Agilidad | Psíquico | 269 |
| Amnesia | Psíquico | 137 |
| Paz Mental | Psíquico | 221 |
| Pulimento | Roca | 30 |
| Maquinación | Siniestro | 164 |
| Tormenta de Arena | Tierra | 244 |
| Armadura Ácida | Veneno | 33 |
| Viento Afín | Volador | 110 |
| Onda Trueno | Eléctrico | 266 |
| Tóxico | Veneno | 115 |
| Fuego Fatuo | Fuego | 129 |
| Somnífero | Planta | 28 |
| Brecha Negra | Siniestro | 1 (solo Darkrai) |
| Rayo Confuso | Fantasma | 159 |
| Hipnosis | Psíquico | 65 |

**Ataque fuerte (E): 19 ataques**

| Ataque | Tipo | Aprenden |
|---|---|---|
| Foco Resplandor | Acero | 134 |
| Hidrobomba | Agua | 177 |
| Megacuerno | Bicho | 28 |
| Cometa Draco | Dragón | 72 |
| Trueno | Eléctrico | 218 |
| Bola Sombra | Fantasma | 301 |
| Envite Ígneo | Fuego | 82 |
| Llamarada | Fuego | 182 |
| Fuerza Lunar | Hada | 42 |
| Ventisca | Hielo | 252 |
| Onda Certera | Lucha | 222 |
| Hiperrayo | Normal | 555 |
| Rayo Solar | Planta | 305 |
| Psíquico | Psíquico | 235 |
| Roca Afilada | Roca | 226 |
| Pulso Noche | Siniestro | 3 |
| Terremoto | Tierra | 288 |
| Lanzamugre | Veneno | 118 |
| Pájaro Osado | Volador | 62 |

## Restos (rebalanceo)
Los **Restos** curaban un 1,5% de la vida máxima **cada segundo** (≈90% por minuto), demasiado para un juego en tiempo real: los tanques rivales casi no se podían matar. Ahora curan un **0,4% por segundo** (≈24% por minuto; en los juegos es 1/16 por turno). Vale igual para ti y para los rivales. El número es `IFX.restos` en `js/data.js` (`.004`); súbelo o bájalo si quieres otro equilibrio.

## Ataques de estado: Onda Trueno, Tóxico, Fuego Fatuo, Somnífero, Brecha Negra, Rayo Confuso e Hipnosis (js/status.js, js/fxstatus.js)
Son 7 ataques nuevos del **hueco 3 (tecla Q)**. Compiten con las mejoras (Afilar, Danza Espada...): en ese hueco solo cabe un movimiento. Se consiguen con **MT** (tienda, pestaña MTs) y se enseñan igual que los demás. Nadie los lleva de serie.

Cada uno lanza un **proyectil sin daño** (se puede esquivar). Si impacta, el rival recibe un **estado**. Cuestan lo mismo que cualquier Q (energía 20, recarga 10 s).

| Ataque | Tipo | Estado | Qué hace en este juego | Quién lo aprende |
|---|---|---|---|---|
| Onda Trueno | Eléctrico | Paralizado, 5 s | Se mueve a la mitad de velocidad y el 25 % de sus ataques fallan (gasta energía y recarga). | 266 |
| Tóxico | Veneno | Envenenado grave, 6 s | Pierde un 0,3 % de la vida máxima por segundo y **sube 0,3 % cada segundo** (≈6 % en total). | 115 |
| Fuego Fatuo | Fuego | Quemado, 8 s | Hace **el mismo daño total que Tóxico** (≈6 % de la vida máxima, a ritmo constante: ≈0,8 % por segundo) y su golpe cuerpo a cuerpo hace la mitad. | 129 |
| Somnífero | Planta | Dormido, 2 s | No se mueve ni ataca. Es un polvo: los tipo Planta no se ven afectados. | 28 |
| Brecha Negra | Siniestro | Dormido, 2,5 s | Igual que Somnífero, pero afecta a todos los tipos. **Solo la puede aprender Darkrai.** | 1 |
| Rayo Confuso | Fantasma | Confuso, 4 s | El 33 % de sus ataques se los hace a sí mismo (con la mitad de la fuerza de su golpe). | 159 |
| Hipnosis | Psíquico | Dormido, 2 s | Como Somnífero, pero **funciona con los tipo Planta** y **a veces falla** (acierta el 70 % de las veces que el proyectil toca; en los juegos tiene un 60 % de precisión). Al ser Psíquico, no afecta a los tipo Siniestro. Lo aprenden 65 especies según los juegos oficiales (Drowzee, Hypno, Gastly, Haunter, Gengar, Exeggcute, Exeggutor, Hoothoot, Noctowl, Darkrai, Munna, Musharna...). | 65 |

**Reglas:**
- Solo un estado entre paralizado, envenenado, quemado y dormido. Si ya tiene uno, el ataque no hace nada (sale «Ya tiene un estado»). La **confusión** se puede sumar a otro estado.
- **Inmunidades** (las de los juegos): los Eléctricos no se paralizan, los Veneno y Acero no se envenenan, los Fuego no se queman. Además, el tipo del ataque también cuenta: Onda Trueno no afecta a Tierra, Rayo Confuso no afecta a Normal, Tóxico no afecta a Acero y Somnífero no afecta a Planta e Hipnosis no afecta a Siniestro.
- Al despertar, un Pokémon no se puede volver a dormir durante 5 s.
- Los estados desaparecen al debilitarse el Pokémon o al salir del combate (cambio de Pokémon). Veneno y quemadura sí pueden debilitar.
- Se ve en la tarjeta (etiqueta PAR, TOX, QUE, DRM o CNF bajo el retrato), sobre la barra de vida del Pokémon, y con una aura en pixel art.

**Dónde cambiar los números:** `STX` al principio de `js/status.js` (duraciones, daño por segundo, velocidad del proyectil...). `STATUS_MOVES` dice qué estado pone cada ataque, a qué tipos no afecta y, con `acc`, qué probabilidad tiene de acertar cuando el proyectil toca (solo Hipnosis, `acc: .7`).

**Cómo está hecho:**
- `js/status.js`: los estados (`statusInflict`, `statusTick`, `statusBlock`...). `js/combat.js` solo llama a esas funciones: `use()` (dormido, paralizado, confuso, quemado y el proyectil de estado), `move()` (velocidad) y `update()` (el paso del tiempo y el impacto del proyectil).
- `js/moves.js`: los 7 ataques están en `EXTRA_MOVES` (hueco 3), así que no los lleva ningún Pokémon por defecto.
- `tools/gen_learnsets.py`: tienen su nombre de PokéAPI en `MOVES_ES` y Brecha Negra está forzada a Darkrai en `ONLY`.
- **Sprites:** los dibujos están hechos por código en `js/fxstatus.js` y copian el aspecto del anime: Onda Trueno = anillos eléctricos amarillos que se expanden y chispas que recorren el cuerpo; Tóxico = gota de veneno morado con burbujas que chorrea; Fuego Fatuo = llamitas azul-violeta que giran y luego se alzan alrededor del rival; Somnífero = polvo brillante verde-amarillo que cae sobre el rival; Brecha Negra = esfera de vacío con remolino que se abre bajo el rival; Rayo Confuso = orbe espectral con cinta ondulante y espirales de luz; Hipnosis = ondas hipnóticas rosas y violetas que se expanden con el péndulo dorado balanceándose en el centro, y al impactar anillos que se cierran sobre la cabeza del rival, ojos en espiral, el péndulo sobre él y las «z» del sueño. Proyectil `FLT`, estela `TRL`, impacto `IMP`, aura `fxStatusAura` y etiquetas `statusChips`. Si algún día tienes sprites propios, solo hay que sustituir esas funciones.
- Los rivales **todavía no usan** estos ataques (de momento solo el jugador).

## Mejoras de la tecla Q (js/qmoves.js)
Antes todos los ataques de la tecla Q daban lo mismo (+30 % de daño y +25 % de velocidad). Ahora **cada uno hace lo que dice**. Duran **5 s** (el clima, 20 s), cuestan 20 de energía y se recargan en 10 s. Todos los números están en la tabla `Q_FX` de `js/qmoves.js`: `atk` (daño que haces), `spd` (velocidad), `def` (el daño que recibes se multiplica por esto) y, a veces, `mist`, `noStatus` o `wx`. Lo que no esté en la tabla usa `Q_DEFAULT`. Los ataques de estado (Onda Trueno, Hipnosis...) no pasan por aquí: van por `js/status.js`.

| Tipo de mejora | Ataques y efecto |
|---|---|
| **Ataque** | Afilar +30 % · Danza Espada +40 % · Maquinación +40 % · Desarrollo +35 % · Corpulencia +20 % daño y −10 % daño recibido · Danza Dragón +25 % daño y +30 % velocidad |
| **Velocidad** | Agilidad +90 % · Pulimento +90 % · Viento Afín +60 % velocidad y +15 % daño |
| **Defensa** | Defensa Férrea y Armadura Ácida (recibes un 30 % menos) · Amnesia (28 % menos) · Refugio (20 % menos) · Neblina (20 % menos y **nadie te baja las estadísticas**: Intimidación no te afecta) · Campo Neblinoso (20 % menos y **nadie te puede poner un estado**) |
| **Mixtas** | Paz Mental +20 % daño y −10 % recibido · Carga +25 % y −10 % · Danza Aleteo +20 % daño, −12 % recibido y +20 % velocidad · Maldición +25 % daño, −15 % recibido y −15 % velocidad |
| **Clima** | Día Soleado (sol), Danza Lluvia (lluvia) y Tormenta de Arena (arena): cambian el tiempo 20 s, para los dos Pokémon, como las habilidades (Sequía, Llovizna, Chorro Arena); además dan un pequeño extra a quien los usa (+10 % de daño o −10 % de daño recibido). Ayudan sobre todo a los tipos que el clima favorece. |

**Equilibrio:** se simularon combates entre dos Pokémon iguales con cada mejora. Casi todas suben entre +5 y +19 puntos el porcentaje de victorias frente a no usar la Q. Las de **velocidad** y las de **clima** salen cerca de 0 o algo negativas en la prueba, porque el bot de prueba no esquiva y en los combates entre iguales el clima favorece a los dos; jugando se notan más (la velocidad sirve para esquivar y el clima para los tipos que beneficia). Si alguna te parece floja o rota, cambia su línea en `Q_FX`. Ignorante (habilidad) ahora ignora la mitad de la subida de ataque de la Q del rival (`ABX.ignorante`).

## Habilidades en combate (js/abilities.js)
Las habilidades **ya funcionan** en el combate, tanto las de tus Pokémon (la que elijas con la Cápsula de Habilidad) como las de los rivales (las de su plantilla). Se ven en el marcador de cada Pokémon y, al activarse, sale su nombre sobre él. **Todos los números están en `ABX`**, al principio de `js/abilities.js`; las descripciones que ves en el juego están al final del archivo (`ABIL_DESC`). Los juegos son por turnos y este es en tiempo real, así que varias están adaptadas.

**Cómo está enganchado:** `hit()` (combat.js) llama a `abHit` antes de calcular el daño (inmunidades, daño que haces y recibes, esquivar) y a `abAfter` después (contacto, venganzas); `swap.js` y `startBattle` llaman a `abEnter`/`abExit` al entrar o salir un Pokémon; `update()` llama a `abTick` cada fotograma; `statusInflict` (status.js) consulta las inmunidades a estados.

| Grupo | Habilidades y lo que hacen aquí |
|---|---|
| **Daño que haces** | Mar Llamas · Torrente · Espesura · Enjambre (×1,5 con ⅓ de vida o menos, en ataques de ese tipo) · Adaptable (+7 % en ataques de su tipo) · Técnico (+7 % golpe y disparo) · Puño Férreo (+15 % golpe) · Energía Pura (+10 %) · Potencia Bruta (+5 %, pero sus golpes no amedrentan ni envenenan) · Agallas (+50 % con estado) · Autoestima (+20 % por rival vencido, hasta 3) · Irascible (+25 % tras recibir un crítico) · Justiciero (+25 % por cada ataque Siniestro recibido, hasta 3) · Competitivo (+30 % si le bajan el daño) · Pararrayos (+20 % por ataque eléctrico absorbido, hasta 3) · Analítico (+7 % si el rival es más rápido) · Poder Solar (+30 % con sol, pierde vida) · Don Floral (+20 % con sol, ataque y defensa) · Normalidad (todo es Normal, +5 %) · Encadenado (Pin Misil +30 %) · Francotirador (críticos ×1,5 más) · Cromolente (los «poco eficaz» pegan ×1,5) · Intrépido (Normal y Lucha golpean a Fantasma) |
| **Daño que recibes** | Levitación (Tierra: nada) · Absorbe Agua / Fuego / Elec. y Piel Seca (ese tipo no daña: cura un 20 %) · Pararrayos y Electromotor (absorben Eléctrico; Electromotor sube la velocidad ×1,4) · Sebo (Fuego/Hielo ×0,5) · Multiescala (×0,5 con la vida llena) · Filtro y Roca Sólida (muy eficaz ×0,75) · Robustez (con la vida llena aguanta con 1 PS) · Superguardia (si no es muy eficaz, ×0,75) · Escama Especial (con estado ×0,67) · Insonorizar (sin daño de Voz Cautivadora y Zumbido) · Armadura Batalla (sin críticos) · Piel Seca (fuego ×1,25) · Ignorante (la mejora Q del rival le afecta ~13 % menos) · Manto Níveo / Velo Arena (esquivan el 25 % con granizo / arena) |
| **Al contacto** (golpes cuerpo a cuerpo que recibe) | Elec. Estática (20 % paraliza) · Cuerpo Llama (6 % quema) · Punto Tóxico (20 % envenena) · Efecto Espora (20 %: sueño, veneno o parálisis) · Gran Encanto (20 % enamora) · Piel Tosca (el que golpea pierde el 1,5 % de su vida) · Cuerpo Maldito (8 %: anula 3 s el último ataque del que le pega). **Al golpear:** Toque Tóxico (20 % envenena) · Hedor (10 % amedrenta) · Dicha (dobla la probabilidad de amedrentar de la Roca del Rey y de Hedor) |
| **Al entrar** | Intimidación (el rival hace un 7 % menos de daño; si entra varias veces, hasta −20 %) · Presión (el rival gasta un 7 % más de energía; el HUD ya lo enseña) · Sombra Trampa, Trampa Arena e Imán (no puedes cambiar de Pokémon a mano mientras estén delante; los Fantasma, los Voladores/Levitación y los Acero, respectivamente, se libran) · Sequía, Llovizna, Nevada y Chorro Arena (clima) |
| **Al salir** | Regeneración (recupera ⅓ de la vida). Al salir cualquier Pokémon pierde sus subidas y bajadas. |
| **Estados** | Insomnio (no se duerme) · Flexibilidad (no se paraliza) · Velo Agua (no se quema) · Ritmo Propio (no se confunde) · Despiste (no se enamora) · Sincronía (devuelve parálisis, veneno o quemadura) · Espejo Mágico (refleja los ataques de estado) · Madrugar (sueño a la mitad) · Cura Natural (estados un 40 % más cortos) · Mudar (12 % por segundo de curarse) · Muro Mágico (sin daño de veneno, quemadura, clima ni Vidasfera) · Cuerpo Puro, Humo Blanco y Corte Fuerte (inmunes a Intimidación) · Foco Interno (no se amedrenta) · Impasible (amedrentado = velocidad ×1,4) · Polvo Escudo (no le afectan amedrentar ni Toque Tóxico) · Rompemoldes (ignora las habilidades defensivas del rival) · Infiltrador (ignora Multiescala, Filtro, Sebo y el Chaleco Asalto) |
| **Velocidad** | Clorofila (sol) y Nado Rápido (lluvia): ×1,5 · Ímpetu Arena (tormenta de arena): ×2, y no sufre la arena (la tiene Excadrill) · Impulso (+3 % por segundo, hasta +60 %) · Liviano (×1,5 al gastar la Banda Aguante) |
| **Tiempo real (adaptadas)** | Indolente («un turno de cada dos» = espera ½ s tras cada ataque) · Bromista («los de estado van primero» = esos proyectiles vuelan ×1,5 y se recargan antes) · Sin Guarda y Ojo Compuesto (los proyectiles aciertan más fácil; Hipnosis no falla / falla menos) · Vista Lince (ignora la esquiva del rival) · Cabeza Roca (no se hace daño con la Vidasfera) |
| **Megas** (añadidas con la Megaevolución) | **Garra Dura** (golpe cuerpo a cuerpo ×1,15) · **Amor Filial** (todos los ataques ×1,1; en los juegos golpea dos veces) · **Poder Arena** (con tormenta de arena, Roca/Tierra/Acero ×1,15 y no sufre la arena) · **Potencia** (×1,1; en los juegos duplica el Ataque, aquí como Energía Pura) · **Piel Feérica** / **Piel Helada** (sus ataques Normales pasan a Hada / Hielo y pegan ×1,1; `SKIN` en abilities.js) · **Rastro** (al entrar copia la habilidad del rival; al irse recupera la suya). Las demás de las megas ya existían (Intimidación, Adaptable, Levitación, Intrépido, Insomnio, Foco Interno, Espejo Mágico, Sombra Trampa, Poder Solar, Chorro Arena, Potencia Bruta, Bromista). |

**Clima** (`abWeather`): lo ponen Sequía (sol), Llovizna (lluvia), Nevada (granizo) y Chorro Arena (arena) al entrar el Pokémon; dura **20 s** (`ABX.climaDur`) y el último que entra manda. Se ve un velo con partículas y un cartel «SOL 14» arriba. Efectos: **sol** Fuego ×1,5 y Agua ×0,5; **lluvia** al revés; **arena** y **granizo** quitan un 0,4 % de la vida por segundo a quien no es de Roca/Tierra/Acero (arena) o de Hielo (granizo). Cura Lluvia y Piel Seca se curan con lluvia; Cuerpo Gélido con granizo.

**Habilidades que todavía no hacen nada** (el juego no tiene lo que mencionan): **Humedad** (explosiones), **Viscosidad** (robo de objetos), **Metal Pesado** (peso), **Escudo Magma** (congelación). Su descripción en el juego lo dice.

**Equilibrio (probado con simulaciones):** se enfrentaron dos Pokémon iguales cientos de veces con y sin cada una de las 96 habilidades. El combate en tiempo real es muy sensible: un +10 % de daño ya cambia ~25 puntos el porcentaje de victorias, así que los efectos pequeños pesan mucho. Tras la primera pasada se bajaron a la mitad o menos las que ganaban casi solas (Energía Pura de +25 % a +10 %, Técnico y Adaptable a +7 %, Intimidación y Presión a 7 %, Piel Tosca, Cuerpo Maldito, Irascible, Analítico, Potencia Bruta, Ignorante, Cromolente, Superguardia). **Aún destacan** Superguardia, Normalidad y Cromolente, pero la prueba las exagera: dependen del tipo y entre dos Pokémon iguales casi todo es «poco eficaz». Indolente sale contradictoria en la prueba (depende de cómo ataca el bot). Si alguna te parece rota jugando, se ajusta en `ABX`.

**Tamaño del HUD:** en `js/render.js`, `HUD_SCALE = .74` reduce todo el HUD de combate (vida, reloj y barra de ataques) desde su esquina. Pon `1` para el tamaño de antes o un número menor (por ejemplo `.65`) para hacerlo aún más pequeño.

## Ayudas del principio: bienvenida, login diario y primera victoria (js/daily.js)
Para que el inicio sea menos lento hay tres ayudas con tickets (la tabla `DAILY` está al principio de `js/daily.js`):

- **Regalo de bienvenida:** una sola vez, **10 tickets** al empezar una partida nueva (`save.welcome`). Las partidas ya guardadas **no** lo reciben (se marcan como ya entregado al cargar, `js/state.js`). Para probarlo: `localStorage.clear()` en la consola y recargar.
- **Recompensa diaria (7 días):** en el menú principal aparece el botón amarillo **🎁 Recompensa diaria · Día N/7** si hoy no la has reclamado. Abre una ventana con los 7 días y el botón **Reclamar** (Esc o la X la cierran). Si entras al día siguiente, la racha continúa; si te saltas un día, vuelve al día 1. Después del día 7 se repite el ciclo. Se guarda en `save.login = {streak, last}`.

| Día | Tickets | BP |
|---|---|---|
| 1 y 2 | 2 | 50 |
| 3 y 4 | 3 | 50 |
| 5 y 6 | 4 | 50 |
| 7 | 10 + **1 ticket legendario** | 150 |

- **Primera victoria del día = tickets x2:** la primera vez que ganas un combate de Historia o del Campo cada día, los tickets de la recompensa se duplican (Historia 20 en vez de 10; Campo 2 en vez de 1) y el aviso lo dice. Solo se duplican los tickets, no los BP ni las chapas. Se guarda la fecha en `save.firstWin`.
- Aviso: usa la fecha del reloj del dispositivo, así que cambiando la hora del ordenador se podría hacer trampa. Cuando haya cuentas en servidor se comprobará allí.

## Créditos y avisos legales
**Champions Crown es un proyecto de fans, sin ánimo de lucro y hecho para aprender (DAM).** Pokémon, los nombres de los Pokémon, líderes y regiones son marcas y propiedad de Nintendo, Game Freak y Creatures Inc. Este proyecto no está afiliado ni respaldado por ellas.

**Música:** ⚠️ la de los combates de las 6 regiones es **música oficial de Pokémon** (© Nintendo / Game Freak / The Pokémon Company), aportada por el autor para uso personal y educativo; **no es CC0** y no se puede monetizar. Si el repositorio es público, retírala (el juego pasa a música generada).
| Uso | Pista | Origen |
|---|---|---|
| Kanto | Combate de líderes y Alto Mando, victoria y Campeón Azul | Pokémon (juegos de Kanto/Johto) |
| Johto | Combate de líderes y Alto Mando, victoria y Campeón | Pokémon HGSS y otros |
| Hoenn | Líderes, Alto Mando, Campeón y sus victorias | Pokémon Rubí/Zafiro/Esmeralda |
| Sinnoh y Teselia | Líderes, Alto Mando, Campeón/a y victorias | Pokémon Blanco/Negro y Diamante/Perla/Platino |
| Kalos | Líderes, Alto Mando, Campeona y victorias | Pokémon X/Y |
| Menú y Campo de Entrenamiento | Música original generada por el propio juego (`js/music.js`) | — |

Enlaces y detalle en `musica/LEEME.txt`. Los efectos de sonido (`Sfx`) también los genera el juego con código.

**Gráficos**
- Los fondos de las arenas y el estadio del Campo están dibujados por código (`js/arenas*.js`), sin imágenes externas.
- Los sprites de Pokémon (`pokemon/`), los de entrenadores (`entrenadores/`), los avatares y los objetos son arte de terceros. Antes de publicar, rellena aquí el autor y la licencia de los que falten (si vienen de una colección con licencia que pide crédito, hay que ponerlo y respetar sus condiciones, por ejemplo si prohíbe el uso comercial):
  - Sprites de Pokémon: estilo *Pokémon Mundo Misterioso* de **PMD SpriteCollab** (PMDCollab), https://github.com/PMDCollab/SpriteCollab, obtenidos a través del proyecto PokéSurvivor de JPTER78 (https://github.com/JPTER78/pokesurvivor). Son obra de la comunidad de artistas de SpriteCollab (más de 150 personas; la lista de autores con los números de Pokédex de cada uno está en el `CREDITS.md` de PokéSurvivor y en los archivos de créditos de SpriteCollab). Licencia **CC BY-NC 4.0**: hay que dar crédito a los artistas y **no se puede usar con fines comerciales**. Los diseños originales siguen siendo de Nintendo / Game Freak.
  - Sprites de entrenadores: _autor / fuente / licencia: …_
  - Personajes del panel VS (`avatares/red-gen3.png`, `avatares/red-masters.png`, `avatares/RED Y LEAF.png`): sprites de entrenadores de **Pokémon Showdown**, https://play.pokemonshowdown.com/sprites/trainers/ (Red de 3.ª generación y Red Masters). Los personajes de Pokémon son © Nintendo / Creatures / GAME FREAK / The Pokémon Company, y el dibujo de cada sprite es de sus autores originales; Pokémon Showdown no indica ahí una licencia de reutilización. El juego es un proyecto de fan sin ánimo de lucro y no está afiliado a Nintendo ni a Pokémon Showdown.
  - Avatares y objetos: _autor / fuente / licencia: …_

**Tipografía:** [Press Start 2P](https://fonts.google.com/specimen/Press+Start+2P), de CodeMan38, licencia SIL Open Font License, cargada desde Google Fonts.

**Licencia del código:** MIT (archivo `LICENSE`), © 2026 Diego Fernández Ortega. Cubre solo el código (`index.html`, `css/`, `js/`), no los sprites ni la música.

**Código:** original de Diego, escrito desde cero con ayuda de Claude (Anthropic) como proyecto de aprendizaje; no copia código de otros proyectos.



## Perfil de amigos (js/friendprofile.js, tabla `cards` de Supabase, final de css/style.css bajo «Perfil de amigos»)
- **Qué es:** cada jugador publica una **tarjeta** (un resumen pequeño de datos) y sus amigos aceptados pueden abrirla desde Amigos › botón «Perfil». La tarjeta NO lleva la partida: solo avatar, marco, título, nombre de entrenador, nº de Pokémon, shinies, logros reclamados, Ligas superadas, victorias del Campo, los 3 favoritos (con su versión shiny) y el personaje elegido.
- **Mi tarjeta:** `fpCard()` la construye a partir de `save`. `fpPublish()` la sube a `cards` (upsert) **solo si ha cambiado** desde la última vez (`cloud.cardKey`); la llaman `cloudPush` (después de cada subida de la partida) y `cloudAfterLogin` (al iniciar sesión). Con `save.pubProfile = false` (interruptor en Perfil › «Perfil para amigos») se borra la fila y nadie la ve. Si la tabla aún no existe, el fallo es silencioso (`cloud.cardErr`) y la partida se sigue guardando igual.
- **Ver la de un amigo:** `fpLoad(uid)` + `openFriendProfile(f)` (`fpView` dibuja, `fpPaint` pone sprites y medallas). Se ve como una **tarjeta de entrenador** (`.fp-card`): el borde y el brillo usan el color de su marco (`--ac`), lleva un número de entrenador sacado del id (`fpId`), 6 cifras, la **estantería de trofeos** de las 9 Ligas (los mismos trofeos de pixel art de la estantería del Equipo Pokémon: `rmTrophy` y `ROOM_LEAGUES` en js/room.js; apagados si no has superado esa Liga), favoritos y medallas; si algún favorito es shiny tiene un brillo animado (`.foil`, se apaga con «reducir movimiento»). En pantallas estrechas se apila en una columna. Tu propia tarjeta sale arriba de la pantalla Perfil (`renderMyCard` en profile.js, con `fpView(fpCard(), {self:true})`) y se repinta al cambiar nombre, avatar, título, marco, favoritos o el interruptor. Cada cifra lleva al lado la tuya («Tú: n»).
- **Seguridad:** la tarjeta de otro jugador es **dato no fiable**: se limita el largo de los textos, los números se fuerzan a enteros, y el avatar, el marco, el título, los logros, las regiones y los Pokémon solo se aceptan si existen en el juego; todo lo demás se escapa (`cloudEsc`). Probado con una tarjeta con etiquetas `<img onerror>`: sale como texto y no se ejecuta nada. El permiso real lo da la base de datos (RLS): solo lees la tarjeta de quien es tu amigo aceptado.
- **SQL (se ejecuta una vez en Supabase › SQL Editor):**
```sql
create table if not exists public.cards (
  user_id uuid primary key references auth.users(id) on delete cascade,
  card jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
alter table public.cards enable row level security;
drop policy if exists "mi tarjeta" on public.cards;
drop policy if exists "tarjeta de mis amigos" on public.cards;
create policy "mi tarjeta" on public.cards for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "tarjeta de mis amigos" on public.cards for select to authenticated
  using (exists (select 1 from public.friendships f where f.status = 'accepted'
    and ((f.requester = auth.uid() and f.addressee = cards.user_id) or (f.addressee = auth.uid() and f.requester = cards.user_id))));
```
- **Personaje en la tarjeta:** el bloque inferior derecho muestra el personaje elegido (`card.g`: `m` Red · `f` Leaf · `r` Red Masters), con el mismo dibujo del panel VS (`setPlayerSkin(el, g, true)` en vspanel.js), centrado en su hueco y sin nombre. Sustituyó a «Logros destacados» (el campo `top` ya no se envía). Al verla, `fpView` solo acepta `r` si la cuenta es `VS_MASTERS_USER`. Para añadir más personajes: nueva clave en `VS_SKINS` (vspanel.js) y dejar que `fpView`/`skinOf` la acepten (p. ej. según un logro).
- **Personajes desbloqueables (tabla `TRAINERS` en js/vspanel.js):** cada línea `{id, name, file, dex:[...], masters?}` añade un personaje: su imagen (80x80) va en `avatares/`, `dex` son los Pokémon que hay que tener EN SHINY (3 en los normales, 6 en los `masters:true`). `achievements.js` crea solo, por cada línea, un logro `tr_<id>` (categoría «Entrenadores», métrica `shiny_dex`, recompensa `{trainer:id}`); `trainerUnlocked(id)` = logro reclamado. `skinOf()` solo deja usar el personaje si está desbloqueado (si no, el chico); Perfil › Personaje (`genButtons` en profile.js) enseña los bloqueados como silueta con candado. `save.gender` guarda el id (state.js lo valida con una expresión regular y `vsKnown`/`skinOf` hacen el resto). Los de Red (chico `m`, chica `f`) son gratis y Red Masters (`r`) es solo de la cuenta `VS_MASTERS_USER`. Los equipos de cada personaje son una primera propuesta: se cambian editando `dex` (el texto y el objetivo del logro se recalculan solos).
- **Para añadir algo a la tarjeta:** un campo en `fpCard()` (js/friendprofile.js), su validación y dibujo en `fpView()`, y listo: no hay que tocar la base de datos (`card` es JSON libre). Si cambias el significado de un campo, sube `FP_VER`.

## Cuentas y guardado en la nube (js/cloud.js, js/cloudui.js, Supabase)
- **Qué es:** cuentas opcionales y copia de tu partida en internet. Sin cuenta el juego va igual que siempre (la partida vive en `localStorage`, clave `arena2d_v2`). Es el primer paso para amigos y combates online (ver «Plan online»).
- **Servicio:** Supabase (proyecto `champions-crown`, región Irlanda, plan gratis). El juego lo llama con `supabase-js` (se carga con una etiqueta `<script>` de jsDelivr en `index.html`; si no carga, `cloud.ok = false` y el juego sigue sin nube).
- **Claves:** `CLOUD_URL` y `CLOUD_KEY` (al principio de `cloud.js`) son la URL y la clave **publishable**, que son públicas a propósito. La seguridad la da **Row Level Security** (reglas de la base de datos: cada jugador solo lee y escribe su propia fila). **Nunca** subas la clave `secret` / `service_role` ni la contraseña de la base de datos.
- **Tablas** (se crearon una vez en Supabase › SQL Editor):
```sql
create table profiles (id uuid primary key references auth.users(id) on delete cascade, username text not null check (username ~ '^[A-Za-z0-9_]{3,16}$'), created_at timestamptz default now());
create unique index profiles_username_unico on profiles (lower(username));
create table saves (user_id uuid primary key references auth.users(id) on delete cascade, data jsonb not null, updated_at timestamptz default now());
alter table profiles enable row level security;  alter table saves enable row level security;
create policy "ver perfiles" on profiles for select to authenticated using (true);
create policy "crear mi perfil" on profiles for insert to authenticated with check (auth.uid() = id);
create policy "cambiar mi perfil" on profiles for update to authenticated using (auth.uid() = id);
create policy "ver mi partida" on saves for select to authenticated using (auth.uid() = user_id);
create policy "crear mi partida" on saves for insert to authenticated with check (auth.uid() = user_id);
create policy "cambiar mi partida" on saves for update to authenticated using (auth.uid() = user_id);
```
- **Subida:** `persist()` (state.js) llama a `cloudDirty()`, que sube la partida 4 s después del último cambio (`cloudPush`, upsert en `saves`). También sube al ocultar la pestaña y al cerrar sesión. El meta de sincronización (`arena2d_cloud`: usuario, fecha de la última versión de la nube y si hay cambios sin subir) decide qué hacer al entrar (`cloudSync`).
- **Al entrar:** si la cuenta no tiene partida, se sube la del navegador. Si la nube no ha cambiado, no pasa nada. Si se jugó en otro sitio y aquí no hay cambios sin subir, se descarga sola. Si este navegador está sin estrenar, se usa la de la nube. Si las dos tienen cambios, sale la pantalla «¿Qué partida quieres usar?» y **nunca se pisa nada sin que el jugador elija**. Al elegir la de la nube se guarda antes una copia en `localStorage` bajo `arena2d_backup` y se recarga la página.
- **Nombre de jugador:** único sin distinguir mayúsculas (3-16 letras sin tilde, números o `_`). Si está cogido al registrarse, la cuenta se crea igual y se pide otro nombre.
- **Pantalla:** Amigos (`openFriends` en cloudui.js) · `#cloudBox`: arriba la cuenta, debajo la lista de amigos (`#frList`, se actualiza sola cada 15 s mientras la pantalla está abierta).
- **Amigos (tabla `friendships`):** una fila por pareja: `requester` pide, `addressee` acepta (`status` = `pending` o `accepted`). Hay un índice único para que no se repita la pareja en ningún sentido. Reglas (RLS): solo ves las filas en las que participas, solo puedes pedir amistad en tu nombre (`requester = tú`, `status = pending`), solo el que recibe puede aceptar (update) y cualquiera de los dos puede borrar (rechazar, cancelar o quitar). Funciones en cloud.js: `cloudFriendsLoad`, `cloudFriendAdd(nombre)` (busca con `ilike`, escapando `_` porque es comodín), `cloudFriendAccept`, `cloudFriendRemove`. Si la otra persona ya te había pedido amistad y tú le pides a ella, se acepta directamente. «Quitar» pide una segunda pulsación para confirmar.
```sql
create table friendships (
  id uuid primary key default gen_random_uuid(),
  requester uuid not null references auth.users(id) on delete cascade,
  addressee uuid not null references auth.users(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending','accepted')),
  created_at timestamptz default now(),
  check (requester <> addressee)
);
create unique index friendships_par on friendships (least(requester::text, addressee::text), greatest(requester::text, addressee::text));
alter table friendships enable row level security;
create policy "ver mis amistades" on friendships for select to authenticated using (auth.uid() = requester or auth.uid() = addressee);
create policy "pedir amistad" on friendships for insert to authenticated with check (auth.uid() = requester and status = 'pending');
create policy "aceptar amistad" on friendships for update to authenticated using (auth.uid() = addressee) with check (auth.uid() = addressee and status = 'accepted');
create policy "borrar amistad" on friendships for delete to authenticated using (auth.uid() = requester or auth.uid() = addressee);
```
- **En línea y desafíos (Supabase Realtime, canal `lobby`, sin tablas):** al iniciar sesión el juego entra en el canal `lobby` (`cloudRtStart`). **Presence** dice quién está conectado (`cloud.online`, clave = id del usuario) y **Broadcast** manda los mensajes sueltos `challenge`, `reply` y `cancel`. Un desafío (`cloud.chal`) dura 30 s (`CLOUD_CHAL_MS`); solo se aceptan desafíos de amigos y, si ya estás en un combate o con otro desafío abierto, se responde «ocupado». La ventana de desafío (`cloudChalUi`, `#chalOv`) sale en cualquier pantalla. Al aceptarse se crea `cloud.match = {id, opp:{uid,name}, host}` (host = quien desafió) y se llama a `cloudOnMatch(match)`, que es donde irá el combate online. Limitación conocida: el canal `lobby` es público (cualquiera con la clave puede mandar mensajes); para endurecerlo, usar canales privados con Realtime Authorization. Si falla la conexión en tiempo real, mira en Supabase › Realtime › Settings que esté permitido el acceso público.
- **Combate online en tiempo real (js/pvp.js, canal `match:<id>`):** al aceptarse un desafío, `cloudMatchStart` (cloud.js) llama a `cloudOnMatch` → `pvpStart`. **Cómo funciona:** los DOS navegadores ejecutan el MISMO combate (el código normal de combat.js) y solo se mandan las pulsaciones de cada jugador (teclas, ratón, cambio de Pokémon, mega). Para que los dos cálculos sean idénticos: pasos fijos de 1/60 s (`PVP_DT`), azar con semilla común (`Math.random` se sustituye SOLO mientras se calcula un paso: `pvpSeeded`), y cada pulsación se aplica `D` pasos más tarde en los dos lados (empieza en `PVP_DELAY` = 5 ≈ 0,08 s: es lo que tardas en ver actuar a tu Pokémon). **El retraso se ajusta solo:** cada paso necesita la pulsación del rival, que sale de su paso anterior, así que el combate avanza (D tuyo + D del rival) pasos por cada ida y vuelta de red; si la conexión es lenta, el combate iría a cámara lenta. Por eso, si en 1 s se calculan menos de 54 de los 60 pasos, cada jugador sube su D un paso (máximo `PVP_DMAX` = 18) y lo baja tras 40 s yendo bien. En pantalla, abajo a la izquierda, se ve el retraso actual. Se mandan 30 mensajes por segundo por jugador (`PVP_BATCH` = 2; el plan gratis de Supabase admite ~100 por segundo en total, así que con 2 combates a la vez podría ir justo). Cada segundo los dos comparan una huella (posiciones, vida, energía; `pvpCheck`): si no coincide dos veces seguidas, el combate se cancela. Si el rival no da señales en 12 s (`PVP_TIMEOUT`) también se cancela.
  - **Conexión directa (WebRTC):** además del canal de Supabase, el anfitrión y el invitado intentan conectarse directamente (`pvpRtcInit`, `pvpOnRtc`: oferta/respuesta/candidatos por el canal con mensajes `rtc`, servidores STUN de Google `PVP_ICE`). Si se abre (`P.dcOk`), `inp`, `chk` y `bye` se mandan por las dos vías a la vez y gana la que llegue antes (lo repetido se ignora porque cada pulsación lleva su número de paso). Si no se puede abrir (router, red de empresa o móvil), se sigue por Supabase como antes. Abajo a la izquierda del combate se ve «CONEXIÓN DIRECTA» o «POR SERVIDOR». Si con router doméstico casi nunca conecta, habría que añadir un servidor TURN (de pago o propio).
  - **Quién es quién:** el que lanzó el desafío es el bando `p` (izquierda) y el invitado el `e` (derecha). Cada uno ve su propio HUD a la izquierda gracias a `myList / myIdx / myMon / meSide / myCd` (combat.js), que `render.js`, `mega.js` y `ui.js` usan en lugar de `g.p / g.pi`. Los cambios de Pokémon tienen espera separada por bando (`g.swCd` y `g.swCdE`).
  - **Los equipos:** cada jugador manda el suyo al empezar (`pvpTeamDesc`: Pokémon con sus ataques de MT, vida, daño, velocidad, defensa, objeto, habilidad y mega) y los dos construyen los DOS equipos con eso (`pvpFighter`). Nadie lee la partida guardada del otro. Se valida lo que llega (`pvpDescOk`: valores razonables, objetos que existen).
  - **Justicia:** en combate online (`g.pvp`) no se aplican las ventajas de «rival» (crítico extra y tope de velocidad en combat.js). Sin recompensas, EVs ni cambios en el guardado.
  - **Arena de ancho fijo (clave para no descuadrarse):** el ancho lógico `W` normalmente se adapta a la ventana (`resize()` en state.js), pero las posiciones de salida (`W*.25`/`W*.75`), los límites de movimiento (`W-50`) y el borde de los proyectiles dependen de él. En combate online `draw()` pone `LOCKW = PVP_W` (960, data.js) → `resize()` fija `W = 960` y la imagen se dibuja centrada y sin deformar con barras oscuras (`VIEW`/`viewCalc()` en render.js; `setMouse` en ui.js los tiene en cuenta). `pvpBuild` lo fija también antes de colocar a los Pokémon. La huella (`pvpState`) incluye `W`; al detectar una diferencia, `pvpCmp` escribe en la consola el estado de los dos lados (W|pi|ei|x,y,hp,en de cada Pokémon).
  - **Si cambias el cálculo del combate** (combat.js, abilities.js, status.js, qmoves.js, swap.js, mega.js, fx…) sube `PVP_VER` en pvp.js: dos jugadores con versiones distintas del juego no pueden jugar entre sí (el juego avisa y pide Ctrl+F5). Sin eso, los dos combates se descuadrarían.
  - **Esc** abre un menú (Seguir / Abandonar) pero NO pausa. Al terminar: pantalla de resultado con «Revancha» (vuelve a desafiar) y «Menú». Al cerrar la pestaña se avisa al rival (`bye`) y gana por abandono.
  - **Limitaciones conocidas:** el canal es público (un jugador con conocimientos podría falsear mensajes; vale para jugar entre amigos, se endurecerá con canales privados); no hay reconexión (si se corta, se cancela); con muy mala conexión el combate se queda esperando unos segundos. Probado solo con un Supabase simulado en el navegador (dos pestañas): falta probarlo con la conexión real.
- **Marcos de avatar (css/style.css, bloque «MARCOS DE AVATAR»):** todos los `afr-<id>` comparten una receta: borde transparente de .55rem + varias capas de fondo (`background-clip`): el hueco oscuro por dentro, un remache redondo en cada esquina (`radial-gradient`) y la banda (`--fg`, un degradado en diagonal con luz arriba-izquierda y sombra abajo-derecha), más una línea oscura por fuera (`outline`) y otra por dentro (`box-shadow inset`). Cada marco solo define `--fc` (su color) y, si quiere otro acabado, `--fg` (Bronce, Plata, Oro) o `--rv` (color de los remaches). Brillo mueve un destello (`afrsh`) y Arcoíris/Mewtwo giran un `conic-gradient` con la variable `--fa` (`afrsp`; `@property --fa` registrada para poder animarla). El selector `[class*="afr-"]` está repetido 3 veces a propósito: así gana siempre a `.profile .av`, `.ubar .av`, etc. sin usar `!important` (que impediría animar). Para añadir un marco: nombre en `ACH_FRAMES` (js/achievements.js) y una línea `.afr-<id>{--fc:#color}` aquí.
- **Contraseña olvidada / cambiarla / cerrar sesión (pantalla Amigos):** en «Entrar» hay un enlace **¿Has olvidado la contraseña?** (`cloudResetMail` en js/cloud.js): manda un correo con `auth.resetPasswordForEmail` y, al abrir su enlace, Supabase vuelve al juego con el aviso `PASSWORD_RECOVERY` (`onAuthStateChange`), que abre la pantalla Amigos con el formulario «Elige tu contraseña nueva» (`cloudRecoverPass`). Con la sesión iniciada, el desplegable **Cambiar contraseña** pide la actual (se comprueba volviendo a entrar), la nueva y repetirla (`cloudChangePass`). **Cerrar sesión** sale en todas las vistas de la cuenta (también al elegir nombre, en el conflicto de partidas y en la recuperación). El cliente ahora usa `detectSessionInUrl:true`, así que los enlaces de los correos (recuperar contraseña y, si algún día se activa, confirmar cuenta) funcionan solos.
  - **Hay que configurarlo en Supabase:** Authentication › URL Configuration: **Site URL** = la dirección del juego en GitHub Pages (p. ej. `https://diegofdzortega.github.io/champions-crown/`) y esa misma en **Redirect URLs**. Si no, el enlace del correo lleva a otra dirección y no funciona. Ojo: el correo que manda Supabase por defecto tiene un límite muy bajo de envíos por hora; si falla con «rate limit», espera un rato (para más, se configura un SMTP propio en Authentication › SMTP).
- **Ajuste en Supabase:** ahora «Confirm email» está **desactivado** (Authentication › Sign In / Providers › Email) para probar rápido. Antes de enseñarlo a más gente conviene volver a activarlo (el juego ya avisa de que hay que confirmar el correo).
- **Si algo falla:** abre la consola del navegador (F12). Un error de red significa que no hay conexión con Supabase; «new row violates row-level security» significa que falta una política del SQL de arriba.

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
- js/sprites.js: carga las hojas y detecta solo el tamaño de cada cuadro; retratos de líderes
- js/state.js: tamaño del lienzo, partida guardada (save) y creación de combates
- js/combat.js: movimiento, ataques, daño, efectos de los objetos, IA y cambio de Pokémon
- js/background.js: fondo pixel art del menú
- js/teams.js: equipos competitivos de los 8 líderes, el Alto Mando y el Campeón (naturaleza, habilidad, objeto, IVs, EVs y movimientos) + la recompensa por vencer
- js/johto.js: la **Historia de Johto** (8 líderes, Alto Mando de 4 y Campeón, con sus equipos y recompensas)
- js/arenasjohto.js: los 13 fondos de combate de Johto
- js/hoenn.js: la **Historia de Hoenn** (8 líderes, Alto Mando de 4 y Campeón Plubio, con sus equipos de Pokémon Esmeralda y recompensas)
- js/arenashoenn.js: los 13 fondos de combate de Hoenn
- js/campo.js: el **Campo de Entrenamiento** (23 entrenadores temáticos con equipos de 3-4 Pokémon; farmeo de chapas)
- js/bag.js: la pantalla **Mochila** (lo que tienes: tickets, mejoras, MTs y objetos de combate)
- js/room.js: la habitación del Equipo Pokémon (chimenea con fuego animado, vitrina, estanterías, ventana de noche y la estantería de trofeos de las Ligas)
- js/arenas.js: los 13 estadios de combate de Kanto (un fondo pixel art por líder / Alto Mando / Campeón)
- js/render.js: arena (llama a drawArena), sombras, Pokémon y HUD del combate
- js/modes.js: Historia (un combate por líder)
- js/moves.js: lista de movimientos REALES de Pokémon por tipo y hueco (MOVESET) y asignación automática de 4 movimientos a cada Pokémon (los de CUSTOM en data.js se respetan)
- js/fx.js: motor de efectos de ataque (lista de efectos, partículas, temblor, aura) y los "ganchos" que usa combat.js: fxMelee, fxShotStart, fxShot, fxHit, fxBuff, fxAura
- js/fxlib.js: herramientas de dibujo pixel art (polígonos, rayos, esferas, llamas, marcas de garra...)
- js/fxmelee.js: animaciones de los ataques cuerpo a cuerpo (Placaje, Arañazo, Mordisco, Excavar, Golpe Roca...)
- js/fxshots.js: chorros, rayos y proyectiles en vuelo (Lanzallamas, Rayo, Hoja Afilada...) y sus estelas
- js/fxextra.js: impactos de cada movimiento y animaciones de las mejoras (Danza Espada, Día Soleado...)
  Los efectos se dibujan por código sobre el lienzo (no usan imágenes). Para añadir un movimiento nuevo: ponlo en MOVESET (moves.js) y crea su receta en FXR.melee / FXR.flight (+ FXR.stream) / FXR.buff+FXR.aura; FXR.impact es opcional (si no, usa el impacto de su tipo).
- js/victoria.js: la **pantalla de victoria** con las recompensas en tarjetas con icono (ver la sección «Pantalla de victoria»)
- js/swap.js: la **animación de cambio de Pokémon** estilo anime (rayo rojo de retirada, Poké Ball que vuela y se abre, salida con destello); ver la sección «Animación de cambio de Pokémon»
- js/economy.js: comprar en la tienda y tirar del Gachapon (solo reglas)
- js/menu.js: menú principal, Historia, Tienda, Ajustes
- js/team.js: Equipo Pokémon (tu equipo de 3 con objetos + colección por regiones plegables, buscador y filtro de tipo)
- js/pokedex.js: Pokédex avanzada (pestañas por región, filtros, orden, rejilla y panel de detalle)
- js/avatars.js: avatares (carpeta avatares/, save.avatar) y la barra de usuario con las migas Perfil › Logros › Amigos. Un avatar con nombre de Pokémon se desbloquea al conseguir ese Pokémon. Para añadir uno: copia la imagen a avatares/ (si abres el juego con un servidor que muestre el listado de carpetas sale sola; si no, añade el nombre a AVATAR_FILES). El juego ya no tiene nivel de jugador
- js/gachapon.js: pantalla del Gachapon multi-región y la animación de la tirada. La máquina tiene Poké Balls por rareza dentro de la cúpula (BALLS: Común=Poké Ball, Poco común=Superball, Rara=Ultra Ball, Épica=Honor Ball, Legendaria=Master Ball, Shiny=bola dorada). En cada tirada una bola del tipo del premio real baja por el desagüe, sale por la ranura, cae con gravedad, rebota con sombra y se abre (startEngine). Los efectos por rareza están en impactFx(); los tiempos, en T_SHAKE/T_PICK/T_SINK/T_CHUTE/T_EXIT. Las probabilidades NO se tocan aquí (están en economy.js/data.js)
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
- **Chapa Dorada** (60 PB, `objetos/ivs/chapa-dorada.png`): +5 a un IV. **Chapa Plateada** (40 PB, `objetos/ivs/Chapa-plateada.png`): +10 EV a un stat. Los límites son los reales de los juegos: IV 0-31 por stat (186 en total) y EV 252 por stat útiles (el máximo teórico es 255) y 510 en total.
- **Restablecer** (en Ver datos): «↺ Restablecer IVs» vuelve los IV a 0 y devuelve las Chapas Doradas gastadas en ese Pokémon; «↺ Restablecer EVs» quita los EVs que dieron las Chapas Plateadas (los ganados en combate se quedan) y las devuelve. Pide confirmación. Datos: `save.ivBase`, `save.evCap`, `save.capUsed`.
- **Todos los Pokémon empiezan con IV 0 y EV 0 en todo** (da igual cuál sea o cómo lo consigas). La única forma de subirlos es gastar Chapas Doradas (IV) y Plateadas (EV) en la ficha. Las chapas se consiguen en la tienda y como recompensa al vencer a los líderes (5 + 5). Así cada chapa tiene sentido. **Menta** (120 PB): cambia la naturaleza a la que elijas. **Cápsula de Habilidad** (150 PB): cambia a la otra habilidad. **MT**: enseña un movimiento y sustituye al que haya en ese hueco (golpe, disparo, mejora o fuerte).
- **MTs del día** (Tienda > MTs del día): 8 MTs (2 por hueco), 3 unidades de cada uno, precio según el hueco (70-130 PB). Cambian solos a medianoche (hora del ordenador); salen del número de día, así que no hace falta guardar nada.
- Los IV y EV ya **no se sortean ni se ganan en combate** (`TRAIN.evPerFoe = 0`; si quieres que los rivales vuelvan a dar EVs, ponlo en 4). Para que el juego siga siendo justo, la referencia de las estadísticas es ahora «IV 0, EV 0, naturaleza neutra» (multiplicador ×1,00 en `refStat`), así que los rivales (que sí llevan IV 31 y EV) resultan relativamente más difíciles hasta que entrenes con chapas. Si te pasas de difícil, baja `ENEMY_POWER`.
- **Partidas antiguas:** al cargar un guardado anterior (`trainV` menor que 2) se ponen a 0 todos los IV y EV y se **devuelven las chapas** que habías gastado, para que las vuelvas a gastar como quieras.
- En combate (solo tus Pokémon) IV, EV y naturaleza cambian PS, daño, velocidad y resistencia. `TRAIN.power` (0.6) controla cuánto se nota (1 = igual que los juegos). Los ataques cambiados con MT también cambian el tipo del golpe.
- Habilidades: cada Pokémon tiene 2. Para poner las oficiales: `ABILITIES[25] = ['Elec. Estática', 'Pararrayos']` (data.js); si no, se reparten por tipo (`ABIL_POOL`). **Por ahora solo se muestran y se guardan: no cambian el combate.**
- En la partida (`save`): `iv`, `ev`, `abil`, `mv` (solo los huecos cambiados), `mtBought` y `nat` (ya existía). Los consumibles están en `save.items` como los demás objetos.

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
- La habilidad aparece en el marcador del rival (junto al objeto) pero **todavía no cambia el daño**, igual que las tuyas.
- Al cargar la página se comprueban las reglas (6 sin repetir, IV 31, EV ≤ 252 y ≤ 510, objeto y movimientos válidos en su hueco). Si algo falla, sale un aviso en la consola; también puedes escribir `validateTeams()` en ella.
- **Recompensa:** al vencer a cualquier líder de gimnasio recibes **5 Chapas Doradas + 5 Chapas Plateadas + 10 tiradas de Gachapon** (`REWARD` en teams.js; ya no dan BP, ver "Recompensas, Logros y Ajustes" más abajo). Se dan en cada victoria; si prefieres solo la primera, pon `once: true`. El Alto Mando y el Campeón no las dan (para añadirlas: `alto: {...}` o `campeon: {...}` en `REWARD`). Las tarjetas de la Historia muestran la recompensa.

## Equipo Pokémon: diseño y fondo (js/team.js, js/room.js, final de css/style.css)
- **Cabecera:** «Equipo Pokémon» a la izquierda y, a la derecha, «Equipo 3/3 • N Pokémon» y «✕ Cerrar». Ya no hay secciones de Mochila ni Mejoras: lo que tienes se ve en el propio desplegable de objetos (con la cantidad, ×n) y las mejoras se gastan en «Ver datos».
- **Tarjetas:** ocupan toda la altura de la pantalla. Arriba el sprite (los mismos sprites tuyos, solo más grandes), el nombre y los tipos; en medio naturaleza y habilidad; debajo el objeto equipado y los botones.
- **Desplegable de objetos:** botón con icono + lista con icono, nombre, efecto y cantidad. Debajo, el efecto en este juego y lo que hace en los juegos de Pokémon. Se maneja con el ratón o con el teclado (↑ ↓ y Intro), se cierra con Esc o con un clic fuera, y si abajo no cabe se abre hacia arriba. Un objeto ya equipado en otro Pokémon no sale (como antes).
- **Fondo (`room.js`):** una habitación de madera oscura pintada por código en un lienzo de 480×270 que se amplía sin suavizar y se ancla arriba a la izquierda. A la izquierda hay una **chimenea de piedra con el fuego siempre animado** (llamas, chispas y luz cálida); en el resto, una vitrina de cristal, estanterías con libros y Poké Balls y una ventana de noche con telescopio. El fondo fijo se vuelve a dibujar cada vez que abres el panel y solo se anima (unas 15 imágenes por segundo) mientras está abierto (`roomStart` / `roomStop`). Para cambiar colores toca `RM.pal`; para mover muebles, las coordenadas de `rmBuild`.
- **Estantería de trofeos:** arriba hay 9 peanas, una por Liga Pokémon (`ROOM_LEAGUES`, mismas regiones que `REGIONS` en menu.js). Al derrotar al Campeón de una Liga, `modes.js` guarda `save.champ[región] = 1` y ese trofeo aparece dorado, con una gema del color de la región y un brillo; los que aún no tienes se ven como una silueta apagada. Ahora mismo solo se puede conseguir el de Kanto (la Historia solo tiene esa región).
- **Encaje con el panel:** `--sc` (en el CSS) es el tamaño de cada píxel del dibujo en pantalla; con él el panel deja libre el hueco de la chimenea (izquierda) y de la estantería (arriba).

## Torre Batalla: cuándo se desbloquea
- Se desbloquea **al derrotar a los Campeones de todas las Ligas** (las 9 regiones de `REGIONS`). Antes de eso aparece bloqueada con el contador «Ligas superadas: n / 9» (`leaguesWon()` en menu.js, que lee `save.champ`). En la pantalla de regiones se marca «🏆 Campeón» en cada Liga superada.
- **Legibilidad:** el CSS (`#teamv::before`) oscurece el fondo con un degradado, y las tarjetas son de cristal oscuro con un ligero desenfoque, así que flotan sobre la habitación sin perder contraste.


## Tienda: comprar varias unidades escribiendo la cantidad
- Cada artículo tiene un cuadro **Cantidad**: escribe el número (solo cifras, hasta 9999) o usa **−**, **+** y **Máx** (todo lo que puedas pagar). El botón muestra el total («Comprar × 12 · 720 PB»); también vale pulsar **Enter** dentro del cuadro. Tras comprar la cantidad vuelve a 1.
- Si pides más de lo que puedes pagar, el botón se desactiva y dice cuántos PB te faltan; en los MTs el tope es el stock que queda hoy.
- Código: `buyMany(id, n)` y `maxBuy(id)` en economy.js (`buy(id)` sigue existiendo y compra 1); la cantidad escrita está en `shopSt.qty` (shop.js).

## Mochila (js/bag.js)
- Se abre desde la barra de arriba: **Perfil › Logros › Amigos › Mochila** (`CRUMBS` en avatars.js; también sale en la cabecera del menú). Solo se mira: muestra por secciones los tickets, las mejoras (chapas, mentas, cápsulas), los MTs y los objetos de combate que tienes, con su cantidad y, en los objetos, cuántos están equipados y cuántos libres. Tiene buscador por nombre y atajos a la Tienda y al Equipo.

## Menú principal
- Los botones van en **una columna** hacia abajo. Solo en pantallas muy bajas (menos de 680 px de alto) pasan a 2 columnas para que quepan (`@media (max-height:680px)` en style.css).


## Pausa y salir del combate (tecla Esc)
- En cualquier combate (Historia, Campo de Entrenamiento...) pulsa **Esc** para **pausar**. Sale una ventana con dos botones: **Continuar (Esc)** y **Salir del combate**.
- Mientras está en pausa el combate se para del todo: no corre el reloj, ni te mueves, ni cambias de Pokémon (también vale durante la cuenta atrás).
- **Salir del combate** pide confirmación ("Sí, salir" / "No, seguir"). Si sales **no ganas ninguna recompensa** ni avanzas de piso. Vuelves a la pantalla de la Historia o, si estabas en el Campo, a la lista del Campo.
- Con el combate ya terminado (pantalla de resultado) Esc no abre la pausa. Fuera de un combate, Esc sigue sirviendo para volver atrás.
- Código: `pauseBattle()` y `exitBattle()` en js/modes.js; `g.paused` en js/combat.js; tecla en js/ui.js; overlay `#pause` en index.html.

## Campo de Entrenamiento (js/campo.js, carpeta entrenadores/)
Zona para **farmear Chapas**. Se abre desde el menú principal (segundo botón). Cada entrenador se puede combatir **todas las veces que quieras** y cada victoria da siempre **1 tirada de Gachapon + 50 BP + 5 Chapas Plateadas + 5 Chapas Doradas** (`REWARD.campo` en teams.js). Perder no da nada. No cuenta para el progreso de la Historia y no toca `save.record`.

- **Entrenadores:** uno por cada imagen de `entrenadores/` (23). Cada uno tiene un equipo temático según su dibujo, por ejemplo: Montañero → Rhyperior, Steelix, Golem, Machamp · Marinero → Poliwrath, Tentacruel, Kingler, Sharpedo · Médium → Gardevoir, Reuniclus, Xatu, Meowstic · Entrenador Guay → Garchomp, Metagross, Salamence, Tyranitar · Pescador → Gyarados, Milotic, Seaking · Criador → Vaporeon, Umbreon, Leafeon, Sylveon. Están todos en el array `CAMPO` de campo.js, con el tema de cada uno.
- **Dificultad (`CAMPO_TIER`):** 1 = fácil (nivel 110, 3 Pokémon), 2 = media (nivel 118, 4 Pokémon), 3 = difícil (nivel 125, 4 Pokémon: Entrenador Guay, Maestro Li y Maestro Magnus). Usa la misma fórmula que la Historia (`DIFF.dificil`): tier 1 ≈ Brock-Misty, tier 2 ≈ Erika-Koga, tier 3 ≈ Sabrina-Blaine, pero con menos Pokémon para poder repetirlo muchas veces. Para cambiarla, toca `CAMPO_TIER` (nivel `lvl` y posición equivalente `n`).
- **Equipos competitivos:** todos con IV 31 (los pone `P()`), EVs coherentes con el papel (atacante físico = Ataque + Velocidad, especial = At. Esp. + Velocidad, tanque = PS + Defensa; máx 252 por stat y 510 en total), naturaleza que sube lo que usan y objeto que encaja (Restos, Vidasfera, Cinta/Gafas Elección, Banda Aguante, Cinturón de Experto...). Se comprueba al cargar (`validateTeams()` ahora revisa también el Campo; 6 Pokémon en los líderes y 3-4 en el Campo). El «Mineral Evolutivo» no existe en este juego, así que no se usa (el juego solo tiene los 16 objetos de ITEMS).
- **Fondo:** cada entrenador usa el estadio de su tema (`arena`: Montañero → Brock, Marinero/Surfista/Pescador → Misty, Médium/Jugador/Li → Sabrina...). Su retrato sale en el marcador del combate (`portrait`).
- **Añadir un entrenador:** copia una entrada de `CAMPO`, cambia sus datos y pon su imagen en `entrenadores/`. Ya hay una entrada para el **Cazabichos** (`bugcatcher.png`, marcada `opt:true`): solo aparece cuando existe esa imagen.

## Menú: Clasificatoria "Próximamente"
- El botón **CLASIFICATORIA** está ahora justo debajo de **AJUSTES** y aparece cerrado, con la etiqueta "PRÓXIMAMENTE". Al pulsarlo sale un aviso.
- Motivo: una clasificatoria de verdad (mejores puntuaciones de todos los jugadores) necesita cuentas de usuario y un servidor. Se hará cuando el juego esté publicado en internet.
- La pantalla antigua (`openRank()` en js/menu.js) sigue en el código, sin usarse, por si hace falta.

## Historia de Johto (js/johto.js, js/arenasjohto.js)
La Historia ahora tiene **varias regiones**. Cada combate (`FLOORS` en data.js) lleva `region`, `idx` (posición dentro de su región), `dn` (índice de dificultad) y `place` (ciudad).
Ayudantes en data.js: `floorsOf(region)`, `progOf(region)` y `setProg(region, n)`. El progreso de Kanto sigue en `save.record` (así no se pierde ninguna partida) y el de las demás regiones en `save.prog`.

**Cómo se desbloquea:** Johto se abre al ser **Campeón de Kanto** (vencer a Azul). Hoenn se abre al ser **Campeón de Johto** (ver más abajo) y el resto aparecen como "Próximamente". (Antes se podía saltar Kanto con un botón de prueba de Ajustes, ya eliminado: usa la consola con `setProg('Kanto', 13); save.champ.Kanto = 1; persist()`.) Texto antiguo: "Modo prueba: dar por terminado Kanto (abre Johto)" (quítalo al final).
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

## Música dinámica (js/music.js, carpeta musica/)
El juego cambia la música solo según el entrenador al que te enfrentas. La música oficial de Pokémon **no se incluye** (tiene derechos de autor): tú pones tus propios archivos en `musica/`. Si falta un archivo, suena una música **generada por el propio juego** (original), así que nunca hay silencio.

**Pistas (nombre de archivo = id)** — `musica/<id>.mp3`
| id | Cuándo suena |
|---|---|
| `menu` | Menús, equipo, tienda, ajustes (ambiente tranquilo) |
| `lider_kanto` | Brock, Misty, Teniente Surge, Erika, Koga, Sabrina, Blaine, Giovanni |
| `lider_johto` | Pegaso, Antón, Blanca, Moti, Aníbal, Yasmina, Fredo, Débora |
| `alto_kanto` | Lorelei, Bruno, Agatha, Lance (Alto Mando de Kanto) |
| `alto_johto` | Mento, Koga, Bruno, Karen (Alto Mando de Johto) |
| `lider_hoenn` | Petra, Marcial, Erico, Candela, Norman, Alana, Vito y Leti, Galano (música generada hasta que añadas `musica/lider_hoenn.ogg`) |
| `alto_hoenn` | Sixto, Fátima, Nívea, Dracón (usa `alto.ogg`) |
| `campeon_azul` | Campeón Azul (Kanto) |
| `campeon_lance` | Campeón Lance (Johto) |
| `campeon_plubio` | Campeón Plubio (Hoenn, usa `jefe.ogg`) |
| `campo` | Campo de Entrenamiento |

**Cómo funciona**
- `MUSIC_TRACKS`: lista de pistas (nombre, `loop:[inicio,fin]` opcional en segundos, receta de la música generada).
- `MUSIC_BY_TRAINER`: id de entrenador → pista. Para añadir un entrenador nuevo, añade una línea ahí.
- `MUSIC_EXT=['ogg','mp3']`: extensiones que se prueban en orden.
- `file:'jefe'` en una pista: usa el archivo `musica/jefe.ogg` en vez de uno con el nombre de la pista. Ahora los dos Alto Mando comparten `alto` y los dos campeones comparten `jefe`.
- Configuración actual: líderes de Kanto/Johto = pistas CC0 de Wolfgang_ (`lider_kanto`, `lider_johto`); Alto Mando = "Boss Battle #2 (8-bit)" de nene (CC0) como `alto`; campeones = "Boss Battle #1" de nene (CC0) como `jefe`; menú y Campo = música generada por el juego.
- `Music.play(id)`, `Music.stop()`, `Music.battle(o)`, `Music.scene(vista)`, `Music.setVolume(0-100)`, `Music.setMute(bool)`, `Music.duck(bool)`.
- Al empezar un combate (`startBattle`) se hace un fundido cruzado a la pista del entrenador; al salir al menú vuelve la música tranquila; en la pantalla de resultado se apaga suavemente.
- Bucle sin cortes con Web Audio (`AudioBuffer`). Si abres con doble clic (`file://`) usa `<audio>`, que puede dejar un pequeño hueco en el bucle.
- El navegador solo deja sonar tras el primer clic o tecla; es normal.

**Controles**: tecla **M** = silenciar/activar; Ajustes → Audio (volumen general, música, efectos y silenciar; ver la sección de Ajustes más abajo). Para ver qué pistas usan tu archivo: `await Music.probe()` en la consola (F12); en la pausa (Esc) la música baja y hay botón "Música: sí/no". Volumen y silencio se guardan.

**Aviso**: si publicas el juego en internet (GitHub Pages), no subas música de Nintendo: puede acarrear una reclamación. Usa música propia o con licencia libre. Mejor usar un servidor (o GitHub Pages) que doble clic.

**Créditos de la música** (todas CC0, de OpenGameArt.org): Wolfgang_ ("8-Bit Battle Loop" y "8-Bit RPG Battle/Encounter Theme") y nene ("Boss Battle #1" y "Boss Battle #2", 8-bit). Enlaces y detalle en `musica/LEEME.txt`. El menú y el Campo usan música generada por el propio juego.

## Campo de Entrenamiento: estadio y desbloqueo de dificultades
**Estadio (js/arenascampo.js, arena `campo`)**: todos los combates del Campo se juegan en el mismo estadio de entrenamiento, de día y dibujado con código: césped en franjas, líneas de tiza, círculo central con Poké Ball, dos zonas de tierra pisada para los Pokémon, grada con público (algunos animan), banderines que ondean, vallas con el emblema de Poké Ball, conos, vallas de salto, neumáticos, saco de golpeo y barreras acolchadas a los lados. El campo `arena` de cada entrenador en `campo.js` ya no se usa.

**Desbloqueo**:
- **Fácil**: siempre abierta.
- **Media**: se abre al vencer a los 9 entrenadores de Fácil.
- **Difícil**: se abre al vencer a los 11 entrenadores de Media.
- Las dificultades bloqueadas se ven en gris con 🔒, botón "Bloqueado" y un aviso de cuántos faltan; cada dificultad muestra "N de M entrenadores vencidos" y los vencidos llevan ✓. Al terminar una dificultad, la pantalla de victoria avisa de la que se desbloquea. No se puede entrar a una bloqueada ni desde la consola.
- Las victorias se guardan en `save.campoWins` (`{id:1}`). Las partidas antiguas empiezan con 0 victorias (la Fácil está abierta).
- Los entrenadores con `opt:true` (por ejemplo Cazabichos, que solo sale si existe su imagen) no cuentan.
- Si prefieres que baste con vencer a UNO de cada dificultad, pon `CAMPO_BASTA_UNO = true` al principio de la sección "COMBATE Y RECOMPENSA" de `js/campo.js`.

## Shinys en el perfil y Pokémon de tu equipo en el menú
- **Perfil › Pokémon favoritos**: al elegir un favorito que tengas en versión shiny (⭐ en su tarjeta) salen los botones **Normal / ⭐ Shiny**. Al elegir uno nuevo se marca la versión que usas en tu equipo (Equipo Pokémon). El favorito shiny se ve con su sprite shiny y el marco dorado. Solo se puede mostrar shiny si lo has conseguido. Se guarda en `save.profileSh` (`1` por cada favorito shiny; las partidas antiguas siguen valiendo).
- **Menú principal**: los 3 Pokémon que dan vueltas por la torre (`menuMon()` en `js/background.js`) son los 3 de tu equipo, en el mismo orden. Si usas la versión shiny de alguno, sale shiny con brillo y destellos dorados (los demás tienen brillo azul). Si tu equipo está incompleto, se rellena con Dragonite, Charizard y Gengar.
- Se ven a color pero oscurecidos para encajar con la noche. Si prefieres siluetas negras como antes, pon `MENU_MONS_COLOR = false` en `js/background.js` (en ese modo el shiny solo se nota por el brillo dorado).
- Historia › "Tu equipo" también enseña la versión shiny de los que la usan.

## Recompensas, Logros y Ajustes (versión actual)
**Recompensas por victoria** (`REWARD` y `REWARD_REGION` en `js/teams.js`; las claves son chapas, `tickets` = tiradas de Gachapon y `bp` = Puntos de Batalla):
| Combate | Recompensa |
|---|---|
| Campo de Entrenamiento (cualquier entrenador) | **1 tirada de Gachapon** + **50 BP** + 5 Chapas Plateadas + 5 Chapas Doradas |
| Líder de gimnasio (Kanto y Johto) | **10 tiradas de Gachapon** + 5 Chapas Doradas + 5 Plateadas (como antes) |
| Alto Mando y Campeón de Kanto | **10 tiradas de Gachapon** (sin chapas, como antes) |
| Alto Mando y Campeón de Johto | **10 tiradas de Gachapon** + 5 Doradas + 5 Plateadas (como antes) |
Los combates de la Historia **ya no dan BP** (se quitaron los BP por combate y el "+1 ticket de gimnasio"). Se dan en cada victoria, también al repetir.

**Logros** (`js/achievements.js`). Son 24 en 3 categorías (Historia, Campo, Colección) y dan BP y/o tickets **una sola vez**. Todo sale de una tabla JSON, `ACHIEVEMENT_DATA`:
```json
{"id":"campo_10", "cat":"campo", "name":"Aprendiz", "desc":"Vence a 10 entrenadores en el Campo de Entrenamiento.",
 "icon":"campo", "metric":"campo_wins", "goal":10, "reward":{"bp":200, "tickets":0}}
```
Campos: `metric` = qué se cuenta (`leaders`, `elite`, `champion`, `campo_wins`, `campo_tier`, `pokemon_owned`, `shiny_owned`; con `region` o `tier` como parámetro) y `goal` = cuántos hacen falta. **Los logros se reclaman a mano.** `achSync()` recalcula todos y marca como **completados** los que se cumplan (se llama tras cada combate ganado, tras cada tirada del Gachapon, al abrir Logros y al arrancar; también cuenta lo que ya habías conseguido), pero **no da nada**: avisa con «Logro completado… ¡Reclama la recompensa en Logros!», la tarjeta se pone en verde con un botón **Reclamar** (y arriba **Reclamar todo**), y la miga «Logros» muestra un circulito rojo con cuántos tienes pendientes. `achClaim(id)` entrega la recompensa (`achGrant({bp, tickets})`) una sola vez. Se guarda en `save.ach[id] = {progress, done, date}`: `done` = fecha en que se completó y `date` = fecha en que se reclamó (las partidas antiguas, que solo tenían `date`, cuentan como ya reclamadas). Se cuentan las victorias totales del Campo en `save.stats.campo`.
| Logro | Qué hay que hacer | Recompensa |
|---|---|---|
| Primer gimnasio | Vencer a 1 líder | 100 BP + 1 ticket |
| Líderes de Kanto / Johto | Los 8 líderes de la región | 500 BP + 5 tickets (cada uno) |
| Alto Mando de Kanto / Johto | Los 4 del Alto Mando | 400 BP + 3 tickets (cada uno) |
| Campeón de Kanto / Johto | Vencer a Azul / Lance | 1000 BP + 10 tickets (cada uno) |
| Maestro de dos Ligas | Campeón de Kanto y Johto | 2000 BP + 15 tickets |
| Líderes / Alto Mando / Campeón de Hoenn | Los 8 líderes · los 4 del Alto Mando · vencer a Plubio | 500 BP + 5 · 400 BP + 3 · 1000 BP + 10 (tickets) |
| Maestro de tres Ligas | Campeón de Kanto, Johto y Hoenn | 3000 BP + 20 tickets |
| Campo: 1 / 10 / 25 / 50 / 100 victorias | Vencer entrenadores del Campo | 50 · 200 · 300 + 2 · 500 + 5 · 1000 + 10 (BP + tickets) |
| Campo: Fácil / Media / Difícil superada | Vencer a todos los de esa dificultad | 300 · 500 + 3 · 800 + 6 (BP + tickets) |
| Colección: 10 / 25 / 50 / 100 / 250 Pokémon | Pokémon diferentes | 100 · 200 + 1 · 300 + 3 · 600 + 5 · 1500 + 15 (BP + tickets) |
| Shiny: 1 / 5 / 10 | Shinys diferentes | 500 + 5 · 1000 + 10 · 2000 + 20 (BP + tickets) |
Para añadir un logro: una línea nueva en `ACHIEVEMENT_DATA`. Para una condición nueva: una línea en `ACH_METRICS`.

**Ajustes** (`openSettings` en `js/menu.js`) ahora solo tiene dos bloques, y se han quitado el nombre, los botones de prueba, la lista de música y el texto de controles:
- **Pantalla**: interruptor de **Pantalla completa** (sigue al navegador si sales con Esc o F11).
- **Audio**: **Volumen general**, **Música**, **Efectos de sonido** (0-100 cada uno) y **Silenciar todo** (tecla M). Música = general x música; efectos = general x efectos (`save.vol`, `save.volMusic`, `save.volSfx`, `save.mute`). Las partidas antiguas conservan su volumen: el que tenían pasa a "Música" y el general queda al 100.
- El juego no tenía efectos de sonido, así que se añadió `Sfx` en `js/music.js`: pitidos generados por código (`click` en los botones, `win`, `lose` y `logro`). `Sfx.play('click')`.
- El **nombre de entrenador** se cambia ahora en **Perfil**.

## Rivales misteriosos en la Historia (js/menu.js, buildStory)
En la pantalla de cada región solo ves a los rivales que ya has vencido y **al siguiente**. Los que aún no te tocan salen ocultos: retrato en silueta gris, nombre «???», sin tipo ni lugar y con el botón «Bloqueado» (`.lcard.mystery` en `css/style.css`). Se descubren de uno en uno al vencer al anterior, así no sabes qué tipos vienen y hay más misterio. Vale igual para líderes, Alto Mando y Campeón, y para todas las regiones (usa `progOf(región)`, lo que ya llevas vencido). Si quieres ver el tipo del siguiente rival para poder prepararte, o ver también un rival más, cambia `locked` en `buildStory()` (ahora `i > rec`).

## Imágenes de las regiones (carpeta region/)
Cada tarjeta de la pantalla **Historia** muestra el mapa de su región de fondo, con un degradado oscuro para que se lean los textos. Las imágenes originales están en `region/` (`Kanto.webp`, `Johto.webp`...) y las que usa el juego son versiones **recortadas en panorámico (16:9) y más ligeras** en `region/tarjetas/` (50-90 KB cada una). Para cambiar una, sustituye su archivo de `region/tarjetas/` (mismo nombre, mejor proporción 16:9). Se cargan con la variable `--map` que pone `buildRegions()` en `js/menu.js` (`REGION_IMG` solo hace falta si el archivo se llama distinto a la región, como `Unova` para «Unova / Teselia»). Los estilos están en `.rcard` de `css/style.css`: bloqueadas en gris, abiertas a todo color y con un pequeño zoom al pasar el ratón.

## Animación de cambio de Pokémon (js/swap.js)
Al cambiar de Pokémon con **1, 2 o 3** (o **R**, que pasa al siguiente) o haciendo **clic en sus cuadritos** se ve la animación del anime. Las teclas no han cambiado: `switchMon()` en `js/combat.js` sigue decidiendo qué Pokémon entra y ahora llama a `swapStart()`.

1. **Retirada:** sale un rayo rojo de una Poké Ball (esquina de abajo a la izquierda; la del rival, arriba a la derecha), alcanza al Pokémon, lo vuelve luz roja y lo absorbe hacia la bola.
2. **Lanzamiento:** la Poké Ball del nuevo Pokémon vuela en arco hasta el suelo. Su color depende de su rareza, igual que en el Gachapon (Común = Poké Ball, Poco común = Superball, Rara = Ultra Ball, Épica = Honor Ball, Legendaria = Master Ball, shiny = bola dorada).
3. **Apertura:** la bola se abre con un destello, una columna de luz, ondas y chispas, y el Pokémon sale como una silueta blanca que recupera su color.

Reglas: mientras dura (unos 2 segundos, `SWAP` al principio de `js/swap.js`) el Pokémon que entra está «fantasma» (`ghost`): no se ve como siempre, no recibe golpes, no se mueve ni ataca, y no se puede empezar otro cambio (después hay que esperar 5 s, ver «Cambiar de Pokémon en combate»). El rival se mueve pero no ataca a un Pokémon que está cambiando. Se conservan PS, mejoras, energía y objetos de cada Pokémon. La pausa (Esc) congela la animación. Si un Pokémon se debilita, el siguiente (tuyo o del rival) entra con el lanzamiento y la apertura (sin retirada, porque ya se había ido). Los dos sonidos nuevos (`recall` y `sendout`) están en `SFX` de `js/music.js`.

## Cambiar de Pokémon en combate: clic y espera de 5 s (js/combat.js, js/render.js, js/ui.js)
- Además de las teclas **1, 2, 3** y **R**, ahora puedes **hacer clic en los cuadritos pequeños** de tu equipo (debajo de tu tarjeta, arriba a la izquierda). El clic en un cuadrito **no dispara**. Al pasar el ratón por encima el cuadrito se marca en verde, el cursor se convierte en una manita y debajo sale «CAMBIAR A …».
- **Espera de 5 segundos:** después de cada cambio tuyo hay que esperar `SWITCH_CD` (5 s, al principio de `switchMon()` en `js/combat.js`) para poder volver a cambiar. Cuenta desde que el Pokémon nuevo ya ha salido de la bola. Mientras esperas, los cuadritos se oscurecen y muestran los segundos que faltan, con una barrita que se vacía; si intentas cambiar antes (con clic o con teclas) aparece «ESPERA X s PARA CAMBIAR» y no pasa nada.
- **Sin espera** cuando tu Pokémon se debilita: el siguiente entra solo y se puede cambiar enseguida. La espera no avanza con el juego en pausa y empieza en 0 en cada combate (`g.swCd` en `js/state.js`).
- En los primeros 8 segundos del combate sale una pista pequeña: «CLIC EN UN CUADRO O TECLAS 1 · 2 · 3 PARA CAMBIAR».
- Código: `hudIconRect()` / `hudIconAt()` (js/render.js) dan la posición de cada cuadrito y los usan tanto el dibujo como el clic (`mousedown` en js/ui.js, que llama a `switchMon(i)`); `swapUpdate()` (js/swap.js) arranca la espera al terminar un cambio voluntario.

## Ordenar el equipo arrastrando (js/team.js, final de css/style.css)
En **Equipo Pokémon** puedes **agarrar una caja y arrastrarla** hacia otro hueco: las demás se apartan para hacerle sitio y, al soltar, el orden se guarda. El Pokémon del hueco **1** es el primero en salir al combate y el que se activa con la tecla 1 (2 y 3 igual). Los botones («Ver datos», «Cambiar», ✕, el desplegable de objetos) siguen funcionando como siempre: solo arrastra si empiezas a mover el ratón fuera de ellos. **Esc** durante el arrastre devuelve la caja a su sitio. Los objetos equipados van con cada Pokémon, no con el hueco. Funciona con ratón y con el dedo (si empiezas desde la cabecera de la caja). Código: `slotDrag()` y `slotDragEnd()` en js/team.js.

## Pantalla de victoria (js/victoria.js, final de css/style.css)
Al ganar un combate de la Historia o del Campo de Entrenamiento, la pantalla de resultado enseña: el **retrato del rival vencido**, el cartel «★ VICTORIA ★», el título y **una tarjeta por cada recompensa** (Tiradas de Gachapon, Puntos de Batalla, Chapas Doradas, Chapas Plateadas) con su icono pequeño, la cantidad que sube contando («+10») y lo que tienes ahora. Si es la primera victoria del día, la tarjeta de tiradas lleva la etiqueta «¡PRIMERA DEL DÍA! ×2». Debajo salen etiquetas con lo demás: EVs, trofeo de la Liga, siguiente rival, dificultad del Campo superada... Las recompensas son exactamente las de siempre (`REWARD` y `REWARD_REGION` en js/teams.js): `giveReward()` las concede y las deja en `lastReward`, y `victoryScreen()` las dibuja. En la derrota se ve la pantalla sencilla de antes. Para un tipo de recompensa nuevo: nómbralo en `REWARD_NAMES` (teams.js) y dale color e icono en `RW_LOOK` (victoria.js).

## Botones de Menú y Volver: siempre arriba
En todas las pantallas el botón para salir (**← Menú** o **← Regiones**) está **arriba del todo**, encima del título: Historia, lista de líderes, Tienda, Campo de Entrenamiento, Logros, Perfil, Mochila, Ajustes y Amigos. La Pokédex, el Gachapon y el Equipo Pokémon ya lo tenían en su cabecera. En los paneles lo pone `panel()` (js/menu.js, constante `BACK`); en Historia y en la lista de líderes están al principio de `#regions` y `#tower` en index.html. Los botones de después de un combate (Otra vez, Siguiente líder, Menú...) siguen abajo porque son las opciones de esa pantalla.

## Barra de energía y tiempos de los ataques (js/render.js)
Encima de la barra de ataques hay una **barra de ENERGÍA** siempre visible, con una marca morada en **20** (ataque **Q**) y una amarilla en **40** (ataque **E**, el fuerte). Sobre cada marca pone cuántos segundos faltan para poder usarlo (o ✔ si ya puedes). La energía sube **12 por segundo** (`EN_REGEN` en `js/data.js`). Cada tarjeta de ataque muestra además el tiempo que falta hasta poder usarlo, que es el mayor de dos: el **enfriamiento** (número blanco) o la **energía que falta** (número azul), y una mini barra azul de energía que se pone verde cuando ya llega.

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

**Música** (todas CC0 1.0 = dominio público, de [OpenGameArt.org](https://opengameart.org); no obliga a dar crédito, pero se agradece):
| Uso | Pista | Autor |
|---|---|---|
| Líderes de Kanto | "8-Bit Battle Loop" | Wolfgang_ |
| Líderes de Johto | "8-Bit RPG Battle/Encounter Theme" | Wolfgang_ |
| Alto Mando | "Boss Battle #2 [8-bit Re-upload]" | nene |
| Campeones | "Boss Battle #1 [8-bit re-upload]" | nene |
| Menú y Campo de Entrenamiento | Música original generada por el propio juego (`js/music.js`) | — |

Enlaces y detalle en `musica/LEEME.txt`. Los efectos de sonido (`Sfx`) también los genera el juego con código.

**Gráficos**
- Los fondos de las arenas y el estadio del Campo están dibujados por código (`js/arenas*.js`), sin imágenes externas.
- Los sprites de Pokémon (`pokemon/`), los de entrenadores (`entrenadores/`), los avatares y los objetos son arte de terceros. Antes de publicar, rellena aquí el autor y la licencia de los que falten (si vienen de una colección con licencia que pide crédito, hay que ponerlo y respetar sus condiciones, por ejemplo si prohíbe el uso comercial):
  - Sprites de Pokémon: estilo *Pokémon Mundo Misterioso* de **PMD SpriteCollab** (PMDCollab), https://github.com/PMDCollab/SpriteCollab, obtenidos a través del proyecto PokéSurvivor de JPTER78 (https://github.com/JPTER78/pokesurvivor). Son obra de la comunidad de artistas de SpriteCollab (más de 150 personas; la lista de autores con los números de Pokédex de cada uno está en el `CREDITS.md` de PokéSurvivor y en los archivos de créditos de SpriteCollab). Licencia **CC BY-NC 4.0**: hay que dar crédito a los artistas y **no se puede usar con fines comerciales**. Los diseños originales siguen siendo de Nintendo / Game Freak.
  - Sprites de entrenadores: _autor / fuente / licencia: …_
  - Avatares y objetos: _autor / fuente / licencia: …_

**Tipografía:** [Press Start 2P](https://fonts.google.com/specimen/Press+Start+2P), de CodeMan38, licencia SIL Open Font License, cargada desde Google Fonts.

**Licencia del código:** MIT (archivo `LICENSE`), © 2026 Diego Fernández Ortega. Cubre solo el código (`index.html`, `css/`, `js/`), no los sprites ni la música.

**Código:** original de Diego, escrito desde cero con ayuda de Claude (Anthropic) como proyecto de aprendizaje; no copia código de otros proyectos.

# Champions Crown — documento de trabajo del proyecto

> Este archivo es para **quien trabaje en el proyecto (Diego o Claude)**. Resume lo necesario para trabajar sin tener que preguntar lo básico.
> El `README.md` es el registro largo de todas las funciones (más de 1200 líneas); este documento es el **mapa corto**.
> **Mantenlo al día:** cuando se cierre una tarea o cambie una regla, se actualiza aquí, en la sección que toque.

---

## 1. Qué es

- **Champions Crown**: juego de combates Pokémon **2D en tiempo real**, en el navegador. Autor: **Diego Fernández Ortega** (GitHub `DiegoFdzOrtega`). Código MIT; sprites y música con sus propias licencias (README › «Créditos y avisos legales»).
- Modos: Historia por regiones (Kanto, Johto, Hoenn, Sinnoh, Teselia, Kalos, Alola, Galar…), Liga, **Torre Batalla** (subida infinita), Campo de Entrenamiento, Clasificatoria, **online 1 contra 1** (PvP), Gachapon, Tienda, Pokédex, Mega-Aro, logros, cuentas en la nube.
- Referencia visual que quiere Diego: **Pokémon Battlegrounds** (canal de YouTube *PB Ranked*, p. ej. «ASH vs GARY — Congreso Plata»). Es también 2D pixel art, de navegador: estadio visto desde arriba con gradas, entrenadores en el campo, marcas que se quedan en el suelo, escombros que saltan, cartel con el nombre del ataque, números de daño grandes y «SUPER EFFECTIVE!».

## 2. Dónde está y cómo se publica

- Carpeta en el PC: `C:\Users\Diego\Desktop\DAM PRIMER CURSO\Proyectos Segundo trimestre\Github\Torre Batalla`
- Se publica con **GitHub Pages** (rama principal). Para probar en local: VS Code + Live Server sobre `index.html`.
- **Caché:** cada `<script>`/`<link>` de `index.html` lleva `?v=N`. **Al cambiar un archivo, sube su `?v=`** o los jugadores verán la versión vieja.
- Comandos que se le dan a Diego (**siempre en bloques separados**, y el mensaje del commit **sin** líneas `Co-Authored-By` ni `Claude-Session`):
  ```
  cd "C:\Users\Diego\Desktop\DAM PRIMER CURSO\Proyectos Segundo trimestre\Github\Torre Batalla"
  ```
  ```
  git add -A
  ```
  ```
  git commit -m "Mensaje en español que diga qué cambia"
  ```
  ```
  git push
  ```
- `.gitignore` deja fuera: `_backups/`, `material/trailer/`, `material/pokemon_masters/`, `assets/musica/Musica2/`, los `.png` grandes de `assets/fondos/torre/`…

## 3. Cómo trabajar con Diego (importante)

- Habla en **español sencillo**, paso a paso, **definiendo cada término técnico** la primera vez.
- **No cambies cosas que no ha pedido.** Si ves algo mejorable, propónlo en una línea.
- Cuando dice **«espérate»** o «hay que confirmarlo»: no se toca hasta que confirme.
- Arte: prefiere imágenes de **Gemini** (luego las pasa por **Upscayl**, que las amplía ×4). Tú le das el **prompt**, él te pasa la imagen, tú la recortas y la integras.
  - Mejor **una hoja con varias filas** (p. ej. 5 filas por ataque: carga, cuerpo, impacto, marca…) que muchas imágenes sueltas: gasta menos.
  - Ha rechazado diseños «que no parecen de Pokémon». Los ataques deben parecerse a **los vídeos y al anime**.
- Él prueba el juego y manda capturas. Si algo no se puede ver/probar desde aquí, pídele capturas concretas.

## 4. Estructura

```
index.html            todas las pantallas + el orden de carga de los scripts (¡el orden importa!)
css/style.css         aspecto general (muchas secciones añadidas al final)
css/pausakit.css      menú de pausa con el kit de Gemini (border-image 9-slice)
js/*.js               ~150 archivos; se cargan en el orden de index.html y COMPARTEN variables globales
assets/pokemon/<nº>/  hojas PMD: Idle.png, Walk.png, Attack.png, Charge.png, Hurt.png… + s/ (shiny)
assets/pokemon/anims.json   qué animaciones extra tiene cada Pokémon (lo escribe tools/bajar_anims.ps1; leer con utf-8-sig, lleva BOM)
assets/objetos/…      imágenes de efectos (cargas, rayos, marcas…) recortadas de Gemini
assets/menu/pausa/    kit de la pausa (marcos, botones, iconos)
assets/fondos/        fondos (torre_atardecer.webp, torre_luces0-2, cascada…)
assets/musica/<Región>/   música ya comprimida
tools/                scripts de ayuda (bajar_anims.ps1, gen_learnsets.py…)
```

### Archivos clave
| Archivo | Qué hace |
|---|---|
| `pokedata.js`, `data.js` | los 1025 Pokémon, tipos, objetos, tienda, reglas |
| `moves.js`, `learnsets.js`, `moveinfo.js` | movimientos y quién los aprende |
| `state.js` | lienzo, partida guardada (`save`, localStorage `arena2d_v2`), crear combates (`floorFight`…) |
| `combat.js` | **el combate**: movimiento, ataques, daño, carga de la E (`f.wind`), Terremoto (`QUAKE`), embestidas (`RIDE`), ajustes de sensación (`FEEL`) |
| `render.js` | dibuja arena, sombras, Pokémon (`drawF`), HUD; `fxLunge(f)` = desplazamiento visual del sprite |
| `sprites.js` | carga hojas (`sheet(dex, anim, shiny)`), detecta el tamaño de cuadro (`analyze`), `drawFrame` |
| `anims.js`, `anims2.js` | elige la animación de cada momento (`anPick(f)` → `[anim, t]`; `anHas(f, anim)`) |
| `ai.js` | IA del rival |
| `pvp.js` | online determinista (ver §6) |
| `cloud.js`, `cloudui.js`, `login.js` | cuentas y guardado en **Supabase** |
| `fx*.js` | efectos de ataques (muchas capas de versiones: fx, fxhd1-5, fxvideo1-7, fxgemini1-5…) |
| `ataquesgemini.js` | rayos con imágenes de Gemini (`RAYOS_G`, `rgNuevo`, `rgCarga`), Brecha Negra, Pantalla de Luz, Psicorrayo |
| `ataquese.js` | ataques E con imágenes: Bola Sombra, Llamarada, Onda Certera, Fuerza Lunar, Lanzamugre, Trueno, Roca Afilada, Ventisca; recarga de Vuelo/Excavar |
| `cargas.js` | carga de la E: `carga2_<tipo>` (18 tipos × 3 cuadros), 62 px en la boca, 96 px alrededor del cuerpo |
| `terremoto.js` | Terremoto con salto (`TJ`); el golpe sale al aterrizar |
| `especiales.js` | animaciones Special de PMD por Pokémon (`ESP_POKE`) |
| `torre.js`, `torreestadio.js` | Torre Batalla (pantalla, luces, cascada, nubes; estadio grande) |
| `music.js`, `sonido2.js` | música y sonidos (compresor, reverb, estéreo con `Music.sfxAt`) |
| `pausa2.js` | menú de pausa |
| `carga.js` | **se carga el primero**: pide la copia `.webp` de las imágenes grandes en vez del `.png` (lista `CARGA_WEBP`, la escribe `tools/png_a_webp.py`) y **retrasa** las imágenes de ataques (`assets/fx`, `objetos/ataques`, `objetos/cargas`) hasta el primer combate (en PC, a los 5 s); si un código las mira antes, se piden al momento |

### Cómo está hecho el código (el patrón «envolver»)
Casi todo lo nuevo se añade **en un archivo aparte que envuelve una función existente**:
```js
if(typeof quakeStart === 'function'){ const o = quakeStart; quakeStart = function(f, w, wp){
  /* lo nuevo */ return o.apply(this, arguments); }; }
```
- El **último archivo cargado** es la capa de fuera (se ejecuta primero).
- Antes de crear una variable global, **comprueba que el nombre no existe** en otro archivo (ya pasó con `PR`).
- Cada archivo empieza con un comentario que explica qué hace, en español, y los números ajustables llevan `// [AJUSTE]`.

## 5. Controles del combate
WASD mover · **Espacio** carrera (esquiva) · **clic izquierdo** golpe (mantener = golpe cargado) · **clic derecho** disparo/rayo · **Q** mejora · **E** ataque fuerte (se carga) · **R** megaevolución · **1-6** cambiar de Pokémon · **Esc** pausa · **M** silencio. Se pueden cambiar en Ajustes › Controles (`controls.js`, `CTL_ACTIONS`).

## 6. Reglas del online (no romperlas)
- Los dos navegadores ejecutan **el mismo combate**; solo viajan las pulsaciones (canal Supabase Realtime `match:<id>`).
- Pasos fijos de 1/60 s, azar con semilla común. Cada segundo comparan una «huella»; si no coincide, se cancela.
- **Si cambias cualquier cálculo del combate** (daño, tiempos, recargas, posiciones…): **sube `PVP_VER`** en `pvp.js` (ahora **34**).
- Lo **visual** (dibujos, partículas) y el **sonido** no deben tocar `Math.random` dentro de un paso ni cambiar el estado del combate. Cuenta el tiempo con el `dt` del combate, no con el reloj.
- El combate no puede depender del tamaño de la ventana.

## 7. Cómo se prueba (desde la sesión de Claude)
- Copia del juego en una carpeta de trabajo servida con `python3 -m http.server 8784`.
- Scripts de Playwright que abren el juego, «Jugar sin cuenta», montan un combate (`team=[…]; floorFight(0)`), fuerzan un ataque (`P.m.mv[3]='Terremoto'`, mantener `KeyE`) y hacen capturas. A veces se ralentiza el juego (`update` con `dt*.3`) para ver los cuadros.
- Prueba de determinismo del online: simular dos partidas y comparar huellas.
- La carpeta local puede no tener todos los sprites del PC: si algo sale como «no tiene la animación», traer el PNG del PC antes de concluir nada.

## 8. Arte con Gemini: cómo se recorta
- **Al añadir o cambiar imágenes** en `assets/fx`, `assets/objetos` (y `ataques/`, `ataques/e/`, `ataques/brecha/`, `cargas/`), `assets/iconos/hud`: ejecutar `python tools/png_a_webp.py`, que crea las `.webp` y actualiza la lista de `js/carga.js`. El código sigue escribiendo `.png`.
- Ataques a melé con imágenes: `js/melee2.js` (lista `M2_ATAQUES`, imágenes en `assets/objetos/ataques/m/<pre>_<fila>.png`).
- Espada Santa (E, lucha): `js/espadasanta.js` (mecánica propia como Cometa Draco: intercepta `windFire`, avanza en `feelTick`). Blastoise dispara Hidrobomba por los dos cañones: `js/blastoise.js` (envuelve `puDraw`).
- Relieve de los sprites: `js/relieve.js` (envuelve `sheet()`: cambia la imagen por un lienzo con contorno). Rayas de velocidad: `js/movimiento.js`.
- Precarga de imágenes de ataques: `js/precarga.js` (lista `PRECARGA` ataque → imágenes; usa el registro `CARGA_REG` de `js/carga.js`).
- Proyectiles con imágenes: `js/proy2.js` (`p2Alta(...)` al final, imágenes en `assets/objetos/ataques/p/<pre>_{salida,bala,estela,golpe,marca}.png`).
- Los estadios (`EST` en `render.js`) ya no se cargan todos al abrir: cada uno se pide al empezar su combate.
- Fondo verde o magenta → se quita por color. Si viene de Upscayl (×4), se reduce ÷4.
- Las **filas** se separan por transparencia; los **cuadros**, en 6 columnas iguales.
- Quitar textos/etiquetas y barras de luz que Gemini añade.
- Para cuerpos de rayo que se repiten: buscar un trozo que se pueda repetir y fundir los bordes.
- Tamaño de referencia de la carga en la boca: la **Hidrobomba de Lapras** (62 px).

## 9. Estado actual (21-11-2026)
**Hecho y subido recientemente:** Brecha Negra nueva · Pulso Umbrío · Psicorrayo · Pantalla de Luz (hexágonos) · rayos de clic (Rayo Hielo, Pulso Dragón, Tinieblas, Dragoaliento, Rayo; recarga 3,2 s) · cargas de la E de los 18 tipos (y sin la bola vieja en los ataques de cuerpo) · rayos grandes de la E (Hiperrayo, Hidrobomba, Rayo Solar, Foco Resplandor) · ataques E con imágenes (ver `ataquese.js`) · Torre al atardecer con luces, cascada, farolas, luciérnagas y nubes · menú de pausa nuevo con el combate difuminado detrás · sonido mejorado · Terremoto con salto · animaciones Special (Graveler, Golem, Donphan, Dragonite, Gurdurr, Ferrothorn, Kyurem, Terrakion, Morpeko) · Vuelo/Excavar 5,5 s de recarga.

**Optimización (21-11-2026):** imágenes de efectos en WebP (48 MB → 13 MB), estadios cargados solo cuando hacen falta (~7 MB menos al abrir). El código del combate ya era ligero (dibujar ~1,4 ms por fotograma en el PC de Diego, RTX 4060 Ti).

**Pendiente:**
- Puños a melé (Puño Fuego/Trueno/Hielo/Bala): dos diseños de prompt rechazados; Diego tiene que describir lo que quiere o mandar captura.
- Hidrobomba de Blastoise saliendo de sus **dos cañones** (no hay animación Special; hay que hacerlo a mano).
- Conectar animaciones nuevas que ya están bajadas: Sink (Excavar), TumbleBack (golpes fuertes), Dance (danzas), Appeal (mega/victoria), Shock (parálisis), Laying/EventSleep (dormido), Eat, Pull, Shake.
- Imágenes sin usar: `oc2_aro`, `ra2_polvo`, `da_*`. Se pueden borrar los viejos: `carga_*`, `vt2_*`, `brecha_*` antiguos, `bn_brazos`, `pantalla_luz.png`.
- Indicador de lag en el online.

## 10. Plan: pasar a Godot 4
Diego ha decidido **dar el salto a un motor**. Plan acordado:
- **Godot 4** (versión normal, no .NET), lenguaje **GDScript**. Exporta a web (se puede seguir en GitHub Pages / itch.io) y a PC.
- Proyecto nuevo en la carpeta **`Tower battle`** (al lado de «Torre Batalla»), con su propio `CLAUDE.md`. El juego JS sigue funcionando mientras tanto.
- **Fase 1 — prototipo:** combate 1 contra 1 en un estadio (estilo Pokémon Battlegrounds): moverse, carrera, golpe, disparo, E con carga, Terremoto con salto, HUD (vida, energía, nombre del ataque, números de daño). Reutilizar sprites PMD, imágenes de Gemini y sonidos.
- **Fase 2:** 6 Pokémon y cambios, IA, mega, estados, habilidades, menús, Torre.
- **Fase 3:** online determinista (mismas reglas que §6) y cuentas con Supabase.
- Claude **no puede ejecutar Godot** en su sesión: escribe el proyecto y Diego lo abre, le da a ejecutar y manda capturas o el error.
- Al portar, **copiar los números** de `FEEL`, `QUAKE`, `RIDE`, `CARGA`, recargas y daños de los `.js` para que el juego se sienta igual.

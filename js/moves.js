"use strict";
/* =====================================================================
   14) MOVIMIENTOS REALES DE POKÉMON
   Cada Pokémon tiene 4 ataques (las 4 teclas de ataque). Antes todos se llamaban Garra / Pulso / Danza / Meteoro.
   Ahora cada hueco usa un movimiento oficial, según el tipo del Pokémon:
     hueco 1 (clic)        = ataque físico cuerpo a cuerpo   (tipo 1 del Pokémon)
     hueco 2 (clic dcho.)  = ataque a distancia pequeño      (tipo 2 si lo tiene, si no el tipo 1)
     hueco 3 (Q)           = movimiento de mejora            (tipo 1)
     hueco 4 (E)           = ataque fuerte a distancia       (tipo 1)
   Los 6 Pokémon con movimientos propios (CUSTOM en data.js) los conservan.
   La mecánica (daño, energía, enfriamiento) NO cambia: solo el nombre y el efecto visual.
   ===================================================================== */
// Movimientos de cada tipo y hueco (si hay varios, se reparten según el nº de Pokédex para que no todos sean iguales)
const MOVESET = {
  normal:   {1:['Placaje','Arañazo','Ataque Rápido'],      2:['Triataque'],                      3:['Afilar'],             4:['Hiperrayo']},
  fuego:    {1:['Colmillo Ígneo'],                          2:['Ascuas','Lanzallamas'],            3:['Día Soleado'],        4:['Llamarada','Envite Ígneo']},
  agua:     {1:['Acua Cola'],                               2:['Pistola Agua','Hidropulso'],       3:['Danza Lluvia'],       4:['Hidrobomba']},
  planta:   {1:['Látigo Cepa'],                             2:['Hoja Afilada'],                    3:['Desarrollo'],         4:['Rayo Solar']},
  electrico:{1:['Colmillo Rayo'],                           2:['Impactrueno','Rayo'],              3:['Carga'],              4:['Trueno']},
  hielo:    {1:['Colmillo Hielo'],                          2:['Rayo Hielo','Nieve Polvo'],        3:['Neblina'],            4:['Ventisca']},
  lucha:    {1:['Golpe Roca'],                              2:['Esfera Aural'],                    3:['Corpulencia'],        4:['Onda Certera']},
  veneno:   {1:['Puya Nociva'],                             2:['Picotazo Veneno','Bomba Lodo'],    3:['Armadura Ácida'],     4:['Lanzamugre']},
  tierra:   {1:['Excavar'],                                 2:['Disparo Lodo'],                    3:['Tormenta de Arena'],  4:['Terremoto']},
  volador:  {1:['Ataque Ala'],                              2:['Tajo Aéreo','Tornado'],            3:['Viento Afín'],        4:['Pájaro Osado']},
  psiquico: {1:['Cabezazo Zen'],                            2:['Psicorrayo','Confusión'],          3:['Paz Mental'],         4:['Psíquico']},
  bicho:    {1:['Tijera X'],                                2:['Zumbido','Pin Misil'],             3:['Danza Aleteo'],       4:['Megacuerno']},
  roca:     {1:['Tumba Rocas'],                             2:['Lanzarrocas'],                     3:['Pulimento'],          4:['Roca Afilada']},
  fantasma: {1:['Lengüetazo','Garra Umbría'],               2:['Tinieblas'],                       3:['Maldición'],          4:['Bola Sombra']},
  dragon:   {1:['Garra Dragón'],                            2:['Pulso Dragón','Dragoaliento'],     3:['Danza Dragón'],       4:['Cometa Draco']},
  siniestro:{1:['Mordisco'],                                2:['Pulso Umbrío'],                    3:['Maquinación'],        4:['Pulso Noche']},
  acero:    {1:['Garra Metal'],                             2:['Bomba Imán'],                      3:['Defensa Férrea'],     4:['Foco Resplandor']},
  hada:     {1:['Carantoña'],                               2:['Viento Feérico','Voz Cautivadora'],3:['Campo Neblinoso'],    4:['Fuerza Lunar']}
};
// Movimientos de los Pokémon con ataques propios (CUSTOM) que no están arriba. Tipo y hueco de cada uno.
const EXTRA_MOVES = {
  'Cabezazo':['normal',1], 'Golpe Cuerpo':['normal',1], 'Doble Filo':['normal',2], 'Amnesia':['psiquico',3], 'Danza Espada':['normal',3],
  'Agilidad':['psiquico',3], 'Refugio':['agua',3],
  // Ataques de estado (hueco 3): no los tiene nadie de serie, solo se aprenden con MT (ver js/status.js)
  'Onda Trueno':['electrico',3], 'Tóxico':['veneno',3], 'Fuego Fatuo':['fuego',3], 'Somnífero':['planta',3], 'Brecha Negra':['siniestro',3], 'Rayo Confuso':['fantasma',3], 'Hipnosis':['psiquico',3]
};
// Nombre -> {t: tipo, s: hueco}
const MOVES = {};
Object.entries(MOVESET).forEach(([t, o]) => Object.entries(o).forEach(([s, l]) => l.forEach(n => MOVES[n] = {t, s:+s})));
Object.entries(EXTRA_MOVES).forEach(([n, [t, s]]) => MOVES[n] = MOVES[n] || {t, s});
// Movimientos con nombre propio que los CUSTOM usan en otro hueco que el de la tabla
['Colmillo Ígneo','Garra Dragón','Lanzallamas','Hidropulso','Bomba Lodo','Pulso Dragón','Lengüetazo','Maldición','Danza Dragón','Bola Sombra','Cometa Draco','Envite Ígneo','Llamarada','Hidrobomba','Hiperrayo']
  .forEach(n => { if(!MOVES[n]) console.warn('Falta el movimiento', n); });

// Asigna los 4 movimientos a todos los Pokémon que no tienen los suyos
DEX.forEach(m => {
  if(m.mv) return;
  const t1 = m.types[0], t2 = m.types[1] || t1, pick = (t, s, k) => { const l = MOVESET[t][s]; return l[(m.dex + k) % l.length]; };
  m.mv = [pick(t1, 1, 0), pick(t2, 2, 1), pick(t1, 3, 0), pick(t1, 4, 2)];
});

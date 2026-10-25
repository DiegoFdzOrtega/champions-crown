"use strict";
/* =====================================================================
   DESCRIPCIÓN DE LOS ATAQUES (se ve en la Tienda, al elegir un MT).
   MOVE_DESC = qué es el ataque en los juegos (una frase corta). Para añadir uno nuevo, escribe aquí su nombre y su frase.
   moveInfo(nombre) = esa frase + lo que hace AQUÍ (daño, energía y recarga salen solos de MV, en state.js / combat.js,
   y los estados de STATUS_MOVES en status.js), así nunca se queda desactualizado si cambias los números.
   ===================================================================== */
const MOVE_DESC = {
  // ---- Golpes cuerpo a cuerpo (clic izquierdo) ----
  'Garra Metal':'Araña con unas garras duras como el acero.', 'Acua Cola':'Golpea con una cola envuelta en agua, como una ola.',
  'Tijera X':'Cruza las guadañas o las garras como unas tijeras y corta.', 'Garra Dragón':'Desgarra con unas garras afiladas de dragón.',
  'Colmillo Rayo':'Muerde con unos colmillos cargados de electricidad.', 'Garra Umbría':'Araña con unas garras hechas de sombra.',
  'Lengüetazo':'Lame al rival con una lengua larga y viscosa.', 'Colmillo Ígneo':'Muerde con unos colmillos envueltos en llamas.',
  'Carantoña':'Un abrazo muy cariñoso... pero con más fuerza de la que parece.', 'Colmillo Hielo':'Muerde con unos colmillos helados.',
  'Golpe Roca':'Un puñetazo tan duro que parte las rocas.', 'Arañazo':'Rasga al rival con unas garras afiladas.',
  'Ataque Rápido':'Se lanza tan deprisa que casi no se ve.', 'Cabezazo':'Embiste con la cabeza con todas sus fuerzas.',
  'Golpe Cuerpo':'Se lanza con todo el cuerpo y aplasta al rival.', 'Placaje':'Se lanza contra el rival con todo su cuerpo.',
  'Látigo Cepa':'Azota con unas lianas largas y finas.', 'Cabezazo Zen':'Embiste con la cabeza envuelta en energía psíquica.',
  'Tumba Rocas':'Entierra al rival bajo rocas que lo frenan.', 'Mordisco':'Muerde con unos colmillos afilados y malvados.',
  'Excavar':'Se esconde bajo tierra y ataca desde abajo.', 'Puya Nociva':'Pincha con un apéndice cargado de veneno.',
  'Ataque Ala':'Golpea al rival con las dos alas abiertas.',
  // ---- Disparos a distancia (clic derecho) ----
  'Hidropulso':'Lanza una onda de agua que puede confundir.', 'Pistola Agua':'Dispara un chorro de agua a presión.',
  'Pin Misil':'Lanza agujas afiladas que dan varios golpes seguidos.', 'Zumbido':'Un zumbido que hace daño con ondas de sonido.',
  'Dragoaliento':'Echa un aliento de dragón que puede paralizar.', 'Pulso Dragón':'Lanza una onda de energía de dragón.',
  'Impactrueno':'Una descarga eléctrica pequeña que puede paralizar.', 'Rayo':'Un potente rayo eléctrico.',
  'Tinieblas':'Ataca con una visión de sombras que asusta.', 'Ascuas':'Pequeñas llamas lanzadas al rival.',
  'Lanzallamas':'Una llamarada intensa que puede quemar.', 'Viento Feérico':'Un viento mágico de hada que sopla al rival.',
  'Voz Cautivadora':'Habla con una voz encantadora que, aun así, hace daño.', 'Nieve Polvo':'Un soplo de nieve helada.',
  'Rayo Hielo':'Un rayo de hielo que puede congelar.', 'Esfera Aural':'Una esfera de energía que casi nunca falla.',
  'Doble Filo':'Una embestida tremenda; en los juegos también hiere a quien la usa.', 'Triataque':'Tres bolas de energía de fuego, hielo y electricidad a la vez.',
  'Hoja Afilada':'Lanza hojas afiladas que cortan.', 'Confusión':'Una ola de energía psíquica que puede confundir.',
  'Psicorrayo':'Un rayo extraño que puede confundir.', 'Lanzarrocas':'Lanza rocas pequeñas contra el rival.',
  'Pulso Umbrío':'Una onda de energía oscura que puede asustar.', 'Disparo Lodo':'Dispara barro que frena al rival.',
  'Bomba Lodo':'Lanza bolas de lodo que pueden envenenar.', 'Picotazo Veneno':'Pincha con un pico envenenado.',
  'Tajo Aéreo':'Corta con una ráfaga de aire afilada.', 'Tornado':'Crea un remolino batiendo las alas.',
  // ---- Mejoras y estados (tecla Q) ----
  'Defensa Férrea':'Endurece el cuerpo como el acero: sube mucho la Defensa.', 'Danza Lluvia':'Un baile que hace llover.',
  'Refugio':'Se esconde en su caparazón: sube la Defensa.', 'Danza Aleteo':'Un baile de mariposa: sube Ataque Esp., Defensa Esp. y Velocidad.',
  'Danza Dragón':'Un baile místico: sube el Ataque y la Velocidad.', 'Carga':'Se carga de electricidad y sube su Defensa Especial.',
  'Onda Trueno':'Lanza una onda eléctrica que paraliza al rival.', 'Maldición':'Se maldice a sí mismo: sube Ataque y Defensa pero baja la Velocidad.',
  'Rayo Confuso':'Lanza una luz extraña que confunde al rival.', 'Día Soleado':'Hace brillar el sol y potencia el fuego.',
  'Fuego Fatuo':'Lanza llamas fantasmales que queman al rival.', 'Campo Neblinoso':'Una niebla mágica de hadas cubre el campo.',
  'Neblina':'Una niebla blanca que protege de las bajadas de estadísticas.', 'Corpulencia':'Se endurece: sube el Ataque y la Defensa.',
  'Danza Espada':'Un baile de guerra: sube mucho el Ataque.', 'Desarrollo':'Crece de golpe: sube el Ataque y el Ataque Especial.',
  'Somnífero':'Lanza un polvo que duerme al rival.', 'Agilidad':'Relaja el cuerpo: sube mucho la Velocidad.',
  'Amnesia':'Olvida todo lo que le preocupa: sube mucho la Defensa Especial.', 'Hipnosis':'Hipnotiza al rival con ondas y lo deja dormido.',
  'Paz Mental':'Calma la mente: sube el Ataque Especial y la Defensa Especial.', 'Pulimento':'Se pule para ser más ligero: sube mucho la Velocidad.',
  'Brecha Negra':'Abre una brecha oscura que duerme al rival.', 'Maquinación':'Piensa un plan malvado: sube mucho el Ataque Especial.',
  'Tormenta de Arena':'Levanta una tormenta de arena.', 'Armadura Ácida':'Se vuelve casi líquido: sube mucho la Defensa.',
  'Tóxico':'Lanza veneno que intoxica al rival.', 'Viento Afín':'Un viento a favor que da más velocidad.',
  'Afilar':'Se afila el cuerpo: sube el Ataque.',
  // ---- Ataques fuertes (tecla E) ----
  'Foco Resplandor':'Concentra una luz brillante de acero y la lanza.', 'Hidrobomba':'Un chorro de agua enorme y muy potente.',
  'Megacuerno':'Embiste con unos cuernos enormes.', 'Cometa Draco':'Hace caer meteoros del cielo con el poder de un dragón.',
  'Trueno':'Cae un rayo gigante sobre el rival.', 'Bola Sombra':'Lanza una bola de sombras que puede bajar la Defensa Especial.',
  'Envite Ígneo':'Una embestida envuelta en fuego; también hiere a quien la usa en los juegos.', 'Llamarada':'Una enorme explosión de fuego en forma de estrella.',
  'Fuerza Lunar':'Toma el poder de la luna y lo lanza contra el rival.', 'Ventisca':'Una tormenta de nieve que lo congela todo.',
  'Onda Certera':'Una onda de energía de lucha lanzada con mucha puntería.', 'Hiperrayo':'Un rayo devastador que deja agotado a quien lo lanza.',
  'Rayo Solar':'Absorbe luz del sol y la dispara en un rayo.', 'Psíquico':'Una fuerte ola de energía mental que aplasta al rival.',
  'Roca Afilada':'Lanza rocas puntiagudas muy afiladas.', 'Pulso Noche':'Una onda de energía oscura que sale de su cuerpo.',
  'Terremoto':'Hace temblar la tierra bajo los pies del rival.', 'Lanzamugre':'Escupe una bola de lodo con veneno.',
  'Pájaro Osado':'Se lanza como un pájaro envuelto en llamas; en los juegos se hace daño.', 'Bomba Imán':'Lanza bombas de acero que se pegan al rival.'
};
// Lo que hace el ataque AQUÍ (sale de los números reales del juego)
function moveInfo(n){
  const mv = MOVES[n]; if(!mv) return {real:'', game:[]};
  const M = MV[mv.s === 1 ? 1 : mv.s === 2 ? 2 : mv.s === 3 ? 3 : 4], sm = mv.s === 3 && STATUS_MOVES[n];
  const per = x => `${x.dmg} de daño base`, g = [];
  if(mv.s === 1) g.push(`Golpe cuerpo a cuerpo: ${per(M)}.`);
  else if(mv.s === 2) g.push(`Disparo a distancia: ${per(M)}.`);
  else if(mv.s === 4) g.push(`Ataque fuerte a distancia: ${per(M)}, el que más daño hace.`);
  else if(sm){
    const k = sm.k, X = STX[k] || {};
    g.push('Proyectil sin daño que le pone un estado al rival.');
    g.push(k === 'par' ? `Paralizado ${X.dur} s: va a la mitad de velocidad y a veces no puede atacar.` : k === 'psn' ? `Envenenado ${X.dur} s: cada segundo pierde un poco más de vida.` :
           k === 'brn' ? `Quemado ${X.dur} s: pierde vida y sus golpes cuerpo a cuerpo hacen la mitad.` : k === 'slp' ? `Dormido ${sm.dur || X.dur} s: no puede hacer nada` + (sm.acc ? `. Acierta el ${Math.round(sm.acc * 100)} % de las veces.` : '.') :
           k === 'cnf' ? `Confuso ${X.dur} s: se pega a sí mismo y falla muchos ataques.` : '');
    if(sm.immune) g.push('No afecta a los de tipo ' + sm.immune.join(', ') + '.');
  } else g.push(`Mejora: +30 % de daño y +25 % de velocidad durante 5 s.`);
  g.push(`Gasta ${M.en} de energía y se recarga en ${M.cd} s.`);
  return {real: MOVE_DESC[n] || 'Sin descripción todavía.', game: g.filter(Boolean)};
}

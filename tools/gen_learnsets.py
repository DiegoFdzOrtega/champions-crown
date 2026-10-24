#!/usr/bin/env python3
"""
Genera js/learnsets.js: qué Pokémon pueden aprender cada uno de los movimientos del juego.

DE DÓNDE SALEN LOS DATOS
  Los CSV de PokéAPI (https://github.com/PokeAPI/pokeapi, carpeta data/v2/csv), que a su vez vienen de los juegos oficiales:
    pokemon_moves.csv   (qué Pokémon aprende qué movimiento, en qué juego y cómo)
    moves.csv           (nombre interno de cada movimiento)
    version_groups.csv  (para saber qué número es cada juego)

CÓMO SE USA
  python3 tools/gen_learnsets.py RUTA_A_LOS_CSV            (por ejemplo:  python3 tools/gen_learnsets.py ../csv)
  Escribe js/learnsets.js. Los CSV NO hace falta subirlos a GitHub: solo se necesitan para volver a generar el archivo.

REGLAS (juego de referencia)
  - Un Pokémon puede aprender un movimiento si en el juego de referencia lo aprende por NIVEL (incluye evolución), MT/MO, HUEVO o TUTOR.
  - Juego de referencia de cada Pokémon: Escarlata/Púrpura (Gen 9, con sus DLC) si el Pokémon sale ahí.
    Si no sale en ningún juego de la Gen 9, se usa el juego más reciente donde sí aparece (en este orden):
    Espada/Escudo (+DLC) > Leyendas Arceus > Diamante/Perla Brillante > Ultrasol/Ultraluna > Sol/Luna.
    Así cada Pokémon se mide con UN solo juego (no se mezclan generaciones dentro de un mismo Pokémon).
  - Solo cuentan las formas normales (número de Pokédex 1-1025). Las formas regionales (Alola, Galar, Hisui, Paldea) NO dan permiso a la forma normal.
  - Si la fuente no confirma que un Pokémon aprende un movimiento, NO puede aprenderlo (nunca se da por válido).
"""
import csv, sys, collections, os

# Movimiento del juego (español)  ->  nombre interno de PokéAPI
MOVES_ES = {
 'Placaje':'tackle','Arañazo':'scratch','Ataque Rápido':'quick-attack','Triataque':'tri-attack','Afilar':'sharpen','Hiperrayo':'hyper-beam',
 'Colmillo Ígneo':'fire-fang','Ascuas':'ember','Lanzallamas':'flamethrower','Día Soleado':'sunny-day','Llamarada':'fire-blast','Envite Ígneo':'flare-blitz',
 'Acua Cola':'aqua-tail','Pistola Agua':'water-gun','Hidropulso':'water-pulse','Danza Lluvia':'rain-dance','Hidrobomba':'hydro-pump',
 'Látigo Cepa':'vine-whip','Hoja Afilada':'razor-leaf','Desarrollo':'growth','Rayo Solar':'solar-beam',
 'Colmillo Rayo':'thunder-fang','Impactrueno':'thunder-shock','Rayo':'thunderbolt','Carga':'charge','Trueno':'thunder',
 'Colmillo Hielo':'ice-fang','Rayo Hielo':'ice-beam','Nieve Polvo':'powder-snow','Neblina':'mist','Ventisca':'blizzard',
 'Golpe Roca':'rock-smash','Esfera Aural':'aura-sphere','Corpulencia':'bulk-up','Onda Certera':'focus-blast',
 'Puya Nociva':'poison-jab','Picotazo Veneno':'poison-sting','Bomba Lodo':'sludge-bomb','Armadura Ácida':'acid-armor','Lanzamugre':'gunk-shot',
 'Excavar':'dig','Disparo Lodo':'mud-shot','Tormenta de Arena':'sandstorm','Terremoto':'earthquake',
 'Ataque Ala':'wing-attack','Tajo Aéreo':'air-slash','Tornado':'gust','Viento Afín':'tailwind','Pájaro Osado':'brave-bird',
 'Cabezazo Zen':'zen-headbutt','Psicorrayo':'psybeam','Confusión':'confusion','Paz Mental':'calm-mind','Psíquico':'psychic',
 'Tijera X':'x-scissor','Zumbido':'bug-buzz','Pin Misil':'pin-missile','Danza Aleteo':'quiver-dance','Megacuerno':'megahorn',
 'Tumba Rocas':'rock-tomb','Lanzarrocas':'rock-throw','Pulimento':'rock-polish','Roca Afilada':'stone-edge',
 'Lengüetazo':'lick','Garra Umbría':'shadow-claw','Tinieblas':'night-shade','Maldición':'curse','Bola Sombra':'shadow-ball',
 'Garra Dragón':'dragon-claw','Pulso Dragón':'dragon-pulse','Dragoaliento':'dragon-breath','Danza Dragón':'dragon-dance','Cometa Draco':'draco-meteor',
 'Mordisco':'bite','Pulso Umbrío':'dark-pulse','Maquinación':'nasty-plot','Pulso Noche':'night-daze',
 'Garra Metal':'metal-claw','Bomba Imán':'magnet-bomb','Defensa Férrea':'iron-defense','Foco Resplandor':'flash-cannon',
 'Carantoña':'play-rough','Viento Feérico':'fairy-wind','Voz Cautivadora':'disarming-voice','Campo Neblinoso':'misty-terrain','Fuerza Lunar':'moonblast',
 'Cabezazo':'headbutt','Golpe Cuerpo':'body-slam','Doble Filo':'double-edge','Amnesia':'amnesia','Danza Espada':'swords-dance','Agilidad':'agility','Refugio':'withdraw',
 'Onda Trueno':'thunder-wave','Tóxico':'toxic','Fuego Fatuo':'will-o-wisp','Somnífero':'sleep-powder','Brecha Negra':'dark-void','Rayo Confuso':'confuse-ray',
}
# Movimientos exclusivos de un solo Pokémon (se fuerzan, da igual lo que digan los datos): Brecha Negra solo la usa Darkrai (nº 491)
ONLY = {'Brecha Negra': [491]}
METHODS = {'1','2','3','4'}      # 1 nivel (y evolución), 2 huevo, 3 tutor, 4 MT/MO
# Juegos de referencia por orden de preferencia: (nombre corto, números de version_group)
TIERS = [('SV', (25, 26, 27)), ('SwSh', (20, 21, 22)), ('LA', (24,)), ('BDSP', (23,)), ('USUM', (18,)), ('SM', (17,))]
DEX_TOTAL = 1025

def ranges(nums):
    nums = sorted(set(nums)); out = []; i = 0
    while i < len(nums):
        j = i
        while j + 1 < len(nums) and nums[j + 1] == nums[j] + 1: j += 1
        out.append(str(nums[i]) if i == j else f'{nums[i]}-{nums[j]}'); i = j + 1
    return ','.join(out)

def main(folder):
    mv_id = {r['identifier']: int(r['id']) for r in csv.DictReader(open(os.path.join(folder, 'moves.csv'), encoding='utf8'))}
    want = {mv_id[v]: es for es, v in MOVES_ES.items()}                 # id interno -> nombre en español
    assert len(want) == len(MOVES_ES), 'hay nombres internos repetidos o que no existen'
    vgs = collections.defaultdict(set)                                   # pokémon -> juegos donde aparece
    got = collections.defaultdict(set)                                   # (pokémon, juego) -> ids de movimientos de la lista que aprende
    with open(os.path.join(folder, 'pokemon_moves.csv'), encoding='utf8') as f:
        rd = csv.reader(f); next(rd)
        for p, vg, m, me, *_ in rd:
            p = int(p)
            if p > DEX_TOTAL: continue                                   # formas alternativas (ids > 10000): no cuentan
            vgs[p].add(int(vg))
            if me in METHODS and int(m) in want: got[(p, int(vg))].add(int(m))
    ref = {}                                                             # pokémon -> (nombre del juego, juegos usados)
    for p in range(1, DEX_TOTAL + 1):
        for name, groups in TIERS:
            if any(v in vgs[p] for v in groups): ref[p] = (name, groups); break
        else: raise SystemExit(f'Pokémon {p} sin datos en ningún juego de referencia')
    learn = {es: [] for es in MOVES_ES}
    for p, (name, groups) in ref.items():
        ids = set().union(*[got.get((p, v), set()) for v in groups])
        for i in ids: learn[want[i]].append(p)
    for es, only in ONLY.items(): learn[es] = list(only)                 # exclusivos
    by_game = collections.defaultdict(list)
    for p, (name, _) in ref.items(): by_game[name].append(p)
    out = ['"use strict";',
           '/* ARCHIVO GENERADO por tools/gen_learnsets.py (no se edita a mano). Fuente: PokéAPI (datos de los juegos oficiales).',
           '   LEARN[movimiento] = lista de números de Pokédex que pueden aprenderlo (rangos "4-6" = 4,5,6).',
           '   LEARN_REF[juego] = qué Pokémon se miden con cada juego de referencia (SV = Escarlata/Púrpura, el resto solo si no salen en la Gen 9).',
           '   Reglas completas en el encabezado de tools/gen_learnsets.py y en el README. */',
           'const LEARN_REF = {']
    out += [f"  {g}: '{ranges(by_game[g])}'," for g, _ in TIERS if by_game[g]]
    out += ['};', 'const LEARN = {']
    out += [f"  {es!r}: '{ranges(learn[es])}'," for es in MOVES_ES]
    out += ['};', '']
    path = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'js', 'learnsets.js')
    open(path, 'w', encoding='utf8').write('\n'.join(out))
    print('Escrito', os.path.normpath(path))
    for g, _ in TIERS: print(f'  referencia {g}: {len(by_game[g])} Pokémon')
    empty = [es for es in MOVES_ES if not learn[es]]
    print('  movimientos que ningún Pokémon aprende:', empty or 'ninguno')

if __name__ == '__main__': main(sys.argv[1] if len(sys.argv) > 1 else '.')

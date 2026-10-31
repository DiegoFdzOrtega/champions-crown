"use strict";
/* =====================================================================
   FONDOS DE LA TARJETA DE ENTRENADOR (Perfil › «Fondo de la tarjeta»)
   Son ilustraciones de lugares (carpeta fondos/tarjeta/, WebP de ~35 KB; las miniaturas están en fondos/tarjeta/mini/). Solo se descarga la que llevas puesta.
   - Cada fondo se desbloquea al DERROTAR a ese líder / miembro del Alto Mando / Campeón (en Fácil o en Difícil), o al hacer lo que diga su condición.
   - Tu elección se guarda en save.cardBg (id del fondo, '' = sin fondo). La tarjeta publica solo ese id: quien la ve lo busca en esta tabla (nunca se carga una ruta de fuera).
   - PARA AÑADIR UNO: copia el PNG a fondos/tarjeta/ (como WebP) y su miniatura a fondos/tarjeta/mini/, y añade una línea abajo:
        B('id', 'archivo-sin-extension', ['id_del_lider', ...], 'posición')      → se desbloquea al derrotar a cualquiera de esos líderes (ids de FLOORS)
        {id, f, pos, champ:'Kanto'}                                                → al ser Campeón de esa región
        {id, f, pos, lg:3}                                                         → al superar 3 Ligas
        {id, f, pos, free:1}                                                       → desde el principio
   - 'pos' es el punto que se ve al recortar la ilustración al tamaño de la tarjeta (CSS background-position): '50% 0%' = se ve la parte de arriba, '50% 100%' = la de abajo.
   ===================================================================== */
const CARD_BG_DIR = 'fondos/tarjeta/';
const B = (id, f, fl, pos, n) => ({id, f, fl, pos: pos || '50% 50%', n});
const CARD_BGS = [
  // --- desde el principio y por Ligas ---
  {id:'plateado',  n:'Monte Plateado',  f:'0000_00_red', pos:'50% 0%', free:1},
  {id:'ligacima',  n:'Cima de la Liga', f:'0000_01_red', pos:'50% 50%', lg:1, hint:'Supera una Liga Pokémon'},
  {id:'mapakanto', n:'Mapa de Kanto',   f:'0017_00_leaf',   pos:'50% 50%', champ:'Kanto'},
  {id:'mapajohto', n:'Mapa de Johto',   f:'0112_00_hibiki', pos:'50% 50%', champ:'Johto'},
  {id:'mapateselia', n:'Mapa de Teselia', f:'0020_00_toya', pos:'50% 50%', champ:'Unova / Teselia'},
  // --- Kanto ---
  B('brock',    '0015_00_takeshi', ['brock']),
  B('brock2',   '0015_01_takeshi', ['brock'], '50% 50%', 'Gimnasio de Brock (cuevas rojas)'),
  B('misty',    '0110_00_kasumi',  ['misty']),
  B('surge',    '0035_00_matthies',['lt_surge']),
  B('erika',    '0008_00_erika',   ['erika']),
  B('koga',     '0060_00_anzu',    ['koga', 'j_koga']),
  B('blaine',   '0059_00_katsura', ['blaine']),
  B('giovanni', '0140_00_sakaki',  ['giovanni'], '50% 50%', 'Guarida del Team Rocket'),
  B('lorelei',  '0005_00_kanna',   ['lorelei']),
  B('bruno',    '0057_00_shiba',   ['bruno', 'j_bruno']),
  B('agatha',   '0061_00_kikuko',  ['agatha']),
  B('lance',    '0111_00_wataru',  ['lance', 'j_lance']),
  B('azul',     '0021_00_green',   ['azul'], '50% 50%', 'Gimnasio de Ciudad Verde'),
  // --- Johto ---
  B('anton',    '0045_00_tsukushi',['anton']),
  B('blanca',   '0026_00_akane',   ['blanca']),
  B('fredo',    '0032_00_yanagi',  ['fredo']),
  B('yasmina',  '0113_00_mikan',   ['yasmina']),
  B('debora',   '0028_00_ibuki',   ['debora']),
  B('mento',    '0047_00_itsuki',  ['mento']),
  B('karen',    '0062_00_karin',   ['karen']),
  // --- Hoenn ---
  B('petra',    '0044_00_tsutsuji',['petra']),
  B('norman',   '0009_00_senri',   ['norman']),
  B('alana',    '0042_00_nagi',    ['alana']),
  B('candela',  '0029_00_asuna',   ['candela']),
  B('vitoleti', '0030_00_ran',     ['vitoleti']),
  B('vitoleti2','0031_00_fuu',     ['vitoleti'], '50% 50%', 'Gimnasio de Vito y Leti (arena rosa)'),
  B('fatima',   '0049_00_fuyo',    ['fatima']),
  B('dracon',   '0094_00_genji',   ['dracon'], '50% 15%'),
  B('plubio',   '0090_00_daigo',   ['plubio']),
  // --- Sinnoh ---
  B('roco',     '0038_00_hyouta',  ['roco']),
  B('gardenia', '0027_00_natane',  ['gardenia']),
  B('brega',    '0050_00_sumomo',  ['brega']),
  B('inverna',  '0025_00_suzuna',  ['inverna']),
  B('fausto',   '0006_00_oba',     ['fausto']),
  B('cynthia',  '0091_00_shirona', ['cintia']),
  // --- Teselia ---
  B('camila',   '0106_00_kamitsure',['camila'], '50% 0%'),
  B('yakon',    '0033_00_yakon',   ['yakon']),
  B('gerania',  '0016_00_huuro',   ['gerania']),
  B('junco',    '0040_00_hachiku', ['junco']),
  B('iris',     '0092_00_iris',    ['iris']),
  B('anis',     '0024_00_shikimi', ['anis']),
  B('aza',      '0063_00_renbu',   ['aza']),
  B('lotto',    '0048_00_gima',    ['lotto']),
  B('catleya',  '0095_00_cattleya',['catleya'], '50% 25%'),
  // --- Kalos ---
  B('violeta',  '0039_00_viola',   ['violeta']),
  B('corelia',  '0012_00_corni',   ['corelia']),
  B('amaro',    '0023_00_momi',    ['amaro']),
  B('edel',     '0022_00_urup',    ['edel']),
  B('narciso',  '0096_00_zumi',    ['narciso'])
];
const CARD_BG = {};
CARD_BGS.forEach(b => { CARD_BG[b.id] = b; });
const cbFloor = id => FLOORS.find(F => F.id === id);
const cbDone = id => { const F = cbFloor(id); return !!F && F.idx < progAny(F.region); };                 // ¿ya has derrotado a ese combate (en Fácil o en Difícil)?
function cardBgName(b){
  if(b.n) return b.n;
  const F = b.fl && cbFloor(b.fl[0]); if(!F) return b.id;
  return (F.kind === 'lider' ? 'Gimnasio de ' : F.kind === 'alto' ? 'Alto Mando: ' : 'Campeón ') + F.leader;
}
function cardBgHint(b){
  if(b.hint) return b.hint;
  if(b.champ) return 'Sé Campeón de ' + b.champ;
  if(b.lg) return `Supera ${b.lg} Liga${b.lg > 1 ? 's' : ''} Pokémon`;
  const Fs = (b.fl || []).map(cbFloor).filter(Boolean), names = [...new Set(Fs.map(F => F.leader))], regs = [...new Set(Fs.map(F => F.region))];
  return 'Derrota a ' + names.join(' / ') + (regs.length > 1 ? ' (' + regs.join(' o ') + ')' : ' (' + regs[0] + ')');
}
const cardBgUnlocked = b => !!b && (!!b.free || (b.fl || []).some(cbDone) || (b.champ && champAny(b.champ)) || (b.lg && leaguesWon() >= b.lg));
const cardBgActive = () => { const b = CARD_BG[save.cardBg]; return b && cardBgUnlocked(b) ? b.id : ''; };      // el que llevas puesto (si ya no lo tienes desbloqueado, ninguno)
const cardBgUrl = b => CARD_BG_DIR + b.f + '.webp';
const cardBgMini = b => CARD_BG_DIR + 'mini/' + b.f + '.webp';

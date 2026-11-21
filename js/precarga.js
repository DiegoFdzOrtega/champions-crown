"use strict";
/* =====================================================================
   SIN TIRONES LA PRIMERA VEZ QUE SALE UN ATAQUE
   Antes, la primera vez que se veía un ataque, el navegador tenía que «abrir» (descodificar) sus imágenes justo en ese
   momento y el juego daba un pequeño tirón. Ahora, al empezar el combate y cada vez que sale otro Pokémon, se descodifican
   antes (con img.decode(), sin parar el juego) las imágenes de los ataques de los Pokémon que están luchando.
   En PC se preparan también las de todo el equipo; en el móvil solo las de los dos que están en el campo (menos memoria).
   La lista de qué imágenes usa cada ataque (PRECARGA) la saca tools/mapa_ataques.js probando todos los ataques; si añades
   un ataque nuevo con imágenes, vuelve a sacarla (o añádelo a mano).
   PRE.on = false lo apaga.
   ===================================================================== */
const PRE = {on: true, cada: .5};
const PRECARGA = {/*MAPA*/
  "Acua Cola": ["assets/fx/lg_estela.png", "assets/objetos/ataques/m/ac_carga.png", "assets/objetos/ataques/m/ac_estela.png", "assets/objetos/ataques/m/ac_golpe.png", "assets/objetos/ataques/m/ac_chispas.png", "assets/objetos/ataques/m/ac_marca.png"],
  "Aerochorro": ["assets/objetos/ataques/aerochorro_cuerpo.png", "assets/objetos/ataques/aerochorro.png"],
  "Arañazo": ["assets/fx/lg_estela.png", "assets/fx/ar_garra.png"],
  "Ascuas": ["assets/objetos/ataques/p/as_estela.png", "assets/objetos/ataques/p/as_bala.png", "assets/objetos/ataques/p/as_salida.png", "assets/objetos/ataques/p/as_golpe.png", "assets/objetos/ataques/p/as_marca.png"],
  "Ataque Ala": ["assets/fx/lg_estela.png", "assets/fx/aa_ala.png", "assets/fx/aa_golpe.png"],
  "Bola Sombra": ["assets/objetos/ataques/e/bs2_estela.png", "assets/objetos/ataques/e/bs2_bola.png", "assets/fx/te_agua.png", "assets/fx/te_onda.png", "assets/objetos/ataques/e/bs2_golpe.png", "assets/objetos/ataques/e/bs2_marca.png"],
  "Bomba Lodo": ["assets/fx/bl_orb.png", "assets/fx/bl_golpe.png"],
  "Brecha Negra": ["assets/objetos/ataques/brecha/bn_mancha.png", "assets/objetos/ataques/brecha/bn_mano.png"],
  "Cabezazo": ["assets/fx/lg_estela.png", "assets/objetos/ataques/m/cb_carga.png", "assets/objetos/ataques/m/cb_estela.png", "assets/objetos/ataques/m/cb_golpe.png", "assets/objetos/ataques/m/cb_chispas.png", "assets/objetos/ataques/m/cb_marca.png"],
  "Cabezazo Zen": ["assets/fx/lg_estela.png", "assets/fx/cz_aura.png", "assets/fx/cz_golpe.png"],
  "Canto": ["assets/fx/ca_nota.png", "assets/fx/zz_dormir.png"],
  "Carantoña": ["assets/objetos/ataques/m/ca_carga.png", "assets/objetos/ataques/m/ca_estela.png", "assets/objetos/ataques/m/ca_golpe.png", "assets/objetos/ataques/m/ca_chispas.png", "assets/objetos/ataques/m/ca_marca.png"],
  "Colmillo Hielo": ["assets/fx/lg_estela.png", "assets/fx/mo_hie.png"],
  "Colmillo Rayo": ["assets/fx/lg_estela.png", "assets/fx/mo_ray.png"],
  "Colmillo Ígneo": ["assets/fx/hu_humo.png", "assets/objetos/choice_specs.png"],
  "Cometa Draco": ["assets/fx/dc_sube.png", "assets/fx/dc_estalla.png", "assets/fx/dc_met2.png", "assets/fx/dc_impacto.png"],
  "Confusión": ["assets/objetos/ataques/p/cf_estela.png", "assets/objetos/ataques/p/cf_bala.png", "assets/objetos/ataques/p/cf_salida.png", "assets/objetos/ataques/p/cf_golpe.png", "assets/objetos/ataques/p/cf_marca.png"],
  "Cuerpo Pesado": ["assets/objetos/ataques/m/pl_carga.png", "assets/objetos/ataques/m/pl_estela.png", "assets/objetos/ataques/m/pl_golpe.png", "assets/objetos/ataques/m/pl_chispas.png"],
  "Disparo Lodo": ["assets/objetos/ataques/p/dl_estela.png", "assets/objetos/ataques/p/dl_bala.png", "assets/objetos/ataques/p/dl_salida.png", "assets/objetos/ataques/p/dl_golpe.png", "assets/objetos/ataques/p/dl_marca.png"],
  "Dragoaliento": ["assets/objetos/ataques/pdr_cuerpo.png", "assets/objetos/ataques/pdr_orbe.png", "assets/objetos/ataques/pdr_collar.png"],
  "Envite Ígneo": ["assets/objetos/envite_carga.png", "assets/objetos/envite_igneo.png"],
  "Esfera Aural": ["assets/fx/ea_orb.png", "assets/fx/ea_carga.png", "assets/fx/ea_golpe.png"],
  "Espada Santa": ["assets/objetos/ataques/e/es_carga.png", "assets/objetos/ataques/e/es_espada.png", "assets/objetos/ataques/e/es_golpe.png", "assets/objetos/ataques/e/es_chispas.png", "assets/objetos/ataques/e/es_marca.png"],
  "Foco Resplandor": ["assets/objetos/ataques/fr_cuerpo.png", "assets/objetos/ataques/fr_collar.png", "assets/objetos/ataques/fr_marca.png"],
  "Fuerza Lunar": ["assets/objetos/ataques/e/fl2_estela.png", "assets/objetos/ataques/e/fl2_bola.png", "assets/fx/fl_carga.png", "assets/fx/te_agua.png", "assets/fx/te_onda.png"],
  "Garra Dragón": ["assets/fx/lg_estela.png", "assets/fx/gd_garra.png", "assets/fx/gd_golpe.png"],
  "Garra Metal": ["assets/fx/lg_estela.png", "assets/fx/gm_garra.png"],
  "Garra Umbría": ["assets/fx/lg_estela.png", "assets/fx/gu_garra.png", "assets/fx/gu_golpe.png"],
  "Golpe Aéreo": ["assets/fx/lg_estela.png", "assets/objetos/ataques/m/pl_carga.png", "assets/objetos/ataques/golpe_aereo.png", "assets/objetos/ataques/m/pl_estela.png", "assets/objetos/ataques/m/pl_golpe.png", "assets/objetos/ataques/m/pl_chispas.png", "assets/objetos/ataques/m/pl_marca.png"],
  "Golpe Calor": ["assets/objetos/ataques/m/pl_carga.png", "assets/objetos/ataques/m/pl_estela.png", "assets/objetos/ataques/m/pl_golpe.png", "assets/objetos/ataques/m/pl_chispas.png", "assets/objetos/ataques/m/pl_marca.png"],
  "Golpe Roca": ["assets/objetos/ataques/m/gr_carga.png", "assets/objetos/ataques/m/gr_estela.png", "assets/objetos/ataques/m/gr_golpe.png", "assets/objetos/ataques/m/gr_chispas.png", "assets/objetos/ataques/m/gr_marca.png"],
  "Hidrobomba": ["assets/objetos/ataques/hb_cuerpo.png", "assets/objetos/ataques/hb_collar.png", "assets/objetos/ataques/hb_impacto.png", "assets/fx/hb_golpe.png", "assets/objetos/ataques/hb_marca.png"],
  "Hidropulso": ["assets/fx/hp_ola.png", "assets/fx/hp_orb.png", "assets/fx/hp_golpe.png"],
  "Hiperrayo": ["assets/objetos/ataques/hr_cuerpo.png", "assets/objetos/ataques/hr_impacto.png", "assets/objetos/ataques/hr_collar.png"],
  "Hoja Afilada": ["assets/fx/ho_cono.png", "assets/fx/ho_var.png", "assets/fx/ho_hoja.png", "assets/fx/ho_golpe.png"],
  "Impactrueno": ["assets/fx/it_rayo.png", "assets/fx/it_bola.png", "assets/fx/it_golpe.png"],
  "Lanzamugre": ["assets/objetos/ataques/e/lm2_estela.png", "assets/objetos/ataques/e/lm2_bola.png", "assets/fx/te_agua.png", "assets/fx/te_onda.png", "assets/objetos/ataques/e/lm2_golpe.png", "assets/objetos/ataques/e/lm2_marca.png"],
  "Lanzarrocas": ["assets/fx/lr_roca.png", "assets/fx/lr_golpe.png"],
  "Lengüetazo": ["assets/fx/lg_estela.png", "assets/fx/le_lengua.png", "assets/fx/le_golpe.png"],
  "Llamarada": ["assets/objetos/ataques/e/ll2_estela.png", "assets/objetos/ataques/e/ll2_bola.png", "assets/fx/te_agua.png", "assets/fx/te_onda.png", "assets/fx/hu_humo.png"],
  "Látigo Cepa": ["assets/objetos/ataques/m/lc_carga.png", "assets/objetos/ataques/m/lc_estela.png", "assets/objetos/ataques/m/lc_golpe.png", "assets/objetos/ataques/m/lc_chispas.png", "assets/objetos/ataques/m/lc_marca.png"],
  "Megacuerno": ["assets/fx/mc_polvo.png", "assets/fx/mc_aura.png", "assets/fx/mc_cuerno2.png", "assets/fx/mc_brillo.png", "assets/fx/mc_golpe.png"],
  "Onda Certera": ["assets/objetos/ataques/e/oc2_bola.png", "assets/fx/te_agua.png", "assets/fx/te_onda.png", "assets/objetos/ataques/e/oc2_golpe.png", "assets/objetos/ataques/e/oc2_marca.png"],
  "Pantalla de Luz": ["assets/objetos/ataques/pl_hex.png"],
  "Patada Baja": ["assets/fx/lg_estela.png", "assets/objetos/ataques/m/pl_carga.png", "assets/objetos/ataques/m/pl_estela.png", "assets/objetos/ataques/m/pl_golpe.png", "assets/objetos/ataques/m/pl_chispas.png"],
  "Picotazo Veneno": ["assets/fx/pv_dardo.png", "assets/fx/pv_golpe.png"],
  "Pin Misil": ["assets/objetos/ataques/p/pm_estela.png", "assets/objetos/ataques/p/pm_bala.png", "assets/objetos/ataques/p/pm_salida.png", "assets/objetos/ataques/p/pm_golpe.png", "assets/objetos/ataques/p/pm_marca.png"],
  "Pistola Agua": ["assets/objetos/ataques/p/pa_estela.png", "assets/objetos/ataques/p/pa_salida.png", "assets/objetos/ataques/p/pa_golpe.png", "assets/objetos/ataques/p/pa_marca.png"],
  "Placaje": ["assets/fx/lg_estela.png", "assets/objetos/ataques/m/pl_carga.png", "assets/objetos/ataques/m/pl_estela.png", "assets/objetos/ataques/m/pl_golpe.png", "assets/objetos/ataques/m/pl_chispas.png", "assets/objetos/ataques/m/pl_marca.png"],
  "Poder Pasado": ["assets/fx/pp_rocas.png"],
  "Psicocorte": ["assets/fx/pc_estela.png", "assets/fx/pc_hoja.png", "assets/fx/pc_golpe.png"],
  "Psicorrayo": ["assets/objetos/ataques/pr_cuerpo.png", "assets/objetos/ataques/pr_orbe.png", "assets/objetos/ataques/pr_collar.png", "assets/objetos/ataques/pr_marca.png"],
  "Psíquico": ["assets/fx/te_agua.png", "assets/fx/te_onda.png"],
  "Pulso Dragón": ["assets/objetos/ataques/pdr_cuerpo.png", "assets/objetos/ataques/pdr_orbe.png", "assets/objetos/ataques/pdr_collar.png", "assets/objetos/ataques/pdr_marca.png"],
  "Pulso Noche": ["assets/fx/te_agua.png", "assets/fx/te_onda.png"],
  "Pulso Umbrío": ["assets/fx/pu_suelo.png", "assets/fx/pu_humo.png", "assets/fx/pu_golpe.png", "assets/objetos/ataques/pu_cuerpo.png", "assets/objetos/ataques/pu_orbe.png", "assets/objetos/ataques/pu_collar.png", "assets/objetos/ataques/pu_impacto.png", "assets/objetos/ataques/pu_marca.png"],
  "Puya Nociva": ["assets/fx/lg_estela.png", "assets/fx/pn_puya.png", "assets/fx/pn_golpe.png"],
  "Puño Bala": ["assets/fx/lg_estela.png", "assets/objetos/ataques/m/pb_carga.png", "assets/objetos/ataques/m/pb_estela.png", "assets/objetos/ataques/m/pb_golpe.png", "assets/objetos/ataques/m/pb_chispas.png", "assets/objetos/ataques/m/pb_marca.png"],
  "Puño Fuego": ["assets/objetos/ataques/m/pf_carga.png", "assets/objetos/ataques/m/pf_estela.png", "assets/objetos/ataques/m/pf_golpe.png", "assets/objetos/ataques/m/pf_chispas.png", "assets/objetos/ataques/m/pf_marca.png"],
  "Puño Hielo": ["assets/fx/lg_estela.png", "assets/objetos/ataques/m/ph_carga.png", "assets/objetos/ataques/m/ph_estela.png", "assets/objetos/ataques/m/ph_golpe.png", "assets/objetos/ataques/m/ph_chispas.png", "assets/objetos/ataques/m/ph_marca.png"],
  "Puño Sombra": ["assets/fx/lg_estela.png", "assets/fx/ps_puno.png", "assets/fx/ps_golpe.png"],
  "Puño Trueno": ["assets/fx/lg_estela.png", "assets/objetos/ataques/m/pt_carga.png", "assets/objetos/ataques/m/pt_estela.png", "assets/objetos/ataques/m/pt_golpe.png", "assets/objetos/ataques/m/pt_chispas.png", "assets/objetos/ataques/m/pt_marca.png"],
  "Pájaro Osado": ["assets/objetos/pajaro_osado.png", "assets/fx/te_agua.png", "assets/fx/te_onda.png"],
  "Rayo": ["assets/fx/ry_golpe.png", "assets/objetos/ataques/ry_cuerpo.png", "assets/objetos/ataques/ry_orbe.png", "assets/objetos/ataques/ry_collar.png", "assets/objetos/ataques/ry_marca.png"],
  "Rayo Hielo": ["assets/objetos/ataques/rh_cuerpo.png", "assets/objetos/ataques/rh_orbe.png", "assets/objetos/ataques/rh_collar.png", "assets/objetos/ataques/rh_marca.png"],
  "Rayo Solar": ["assets/objetos/ataques/rs_cuerpo.png", "assets/objetos/ataques/rs_collar.png", "assets/objetos/ataques/rs_impacto.png", "assets/objetos/ataques/rs_marca.png"],
  "Roca Afilada": ["assets/fx/ra_tierra.png", "assets/objetos/ataques/e/ra2_aviso.png", "assets/objetos/ataques/e/ra2_pinchos.png", "assets/objetos/ataques/e/ra2_marca.png"],
  "Shuriken de Agua": ["assets/objetos/ataques/p/sa_estela.png", "assets/objetos/ataques/p/sa_bala.png", "assets/objetos/ataques/p/sa_salida.png", "assets/objetos/ataques/p/sa_golpe.png", "assets/objetos/ataques/p/sa_marca.png"],
  "Somnífero": ["assets/fx/zz_dormir.png"],
  "Surf": ["assets/objetos/surf.png", "assets/fx/te_agua.png", "assets/fx/te_onda.png"],
  "Tajo Aéreo": ["assets/objetos/ataques/p/ta_estela.png", "assets/objetos/ataques/p/ta_bala.png", "assets/objetos/ataques/p/ta_salida.png", "assets/objetos/ataques/p/ta_golpe.png", "assets/objetos/ataques/p/ta_marca.png"],
  "Terremoto": ["assets/fx/tq_grieta.png", "assets/fx/tq_losa.png", "assets/fx/tq_polvo.png"],
  "Tijera X": ["assets/fx/lg_estela.png", "assets/objetos/ataques/m/tx_carga.png", "assets/objetos/ataques/m/tx_estela.png", "assets/objetos/ataques/m/tx_golpe.png", "assets/objetos/ataques/m/tx_chispas.png", "assets/objetos/ataques/m/tx_marca.png"],
  "Tinieblas": ["assets/fx/ti_golpe.png", "assets/objetos/ataques/ti_cuerpo.png", "assets/objetos/ataques/ti_orbe.png", "assets/objetos/ataques/ti_collar.png", "assets/objetos/ataques/ti_marca.png"],
  "Tornado": ["assets/fx/to_embudo.png", "assets/fx/to_polvo.png", "assets/fx/to_nube.png"],
  "Triturar": ["assets/objetos/ataques/m/pl_carga.png", "assets/objetos/ataques/m/pl_estela.png", "assets/objetos/ataques/m/pl_golpe.png", "assets/objetos/ataques/m/pl_chispas.png", "assets/objetos/ataques/m/pl_marca.png"],
  "Trueno": ["assets/fx/te_agua.png", "assets/fx/te_onda.png"],
  "Tumba Rocas": ["assets/fx/lr_roca.png", "assets/fx/lr_golpe.png"],
  "Velocidad Extrema": ["assets/fx/ve_salida.png", "assets/fx/ve_polvo.png", "assets/fx/ve_golpe.png"],
  "Ventisca": ["assets/objetos/ataques/e/vt3_cono.png", "assets/objetos/ataques/e/vt3_golpe.png", "assets/objetos/ataques/e/vt3_marca.png"],
  "Viento Feérico": ["assets/objetos/ataques/p/vf_estela.png", "assets/objetos/ataques/p/vf_bala.png", "assets/objetos/ataques/p/vf_salida.png", "assets/objetos/ataques/p/vf_golpe.png", "assets/objetos/ataques/p/vf_marca.png"],
  "Voz Cautivadora": ["assets/objetos/ataques/p/vc_estela.png", "assets/objetos/ataques/p/vc_bala.png", "assets/objetos/ataques/p/vc_salida.png", "assets/objetos/ataques/p/vc_golpe.png", "assets/objetos/ataques/p/vc_marca.png"],
  "Zumbido": ["assets/objetos/ataques/p/zb_estela.png", "assets/objetos/ataques/p/zb_bala.png", "assets/objetos/ataques/p/zb_salida.png", "assets/objetos/ataques/p/zb_golpe.png", "assets/objetos/ataques/p/zb_marca.png"]
};
const preMovil = typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches;
function preAtaques(f){
  if(!f || !f.m || !f.m.mv || typeof CARGA_REG === 'undefined') return;
  for(const mv of f.m.mv) for(const ruta of PRECARGA[mv] || []){
    const L = CARGA_REG.get(ruta); if(!L) continue;
    for(const im of L){ if(im.__dec || typeof im.decode !== 'function') continue; im.__dec = 1; im.decode().catch(() => { im.__dec = 0; }); }
  }
}
let preVisto = '';
setInterval(() => {
  try{
    if(!PRE.on || typeof g === 'undefined' || !g || !g.p || !g.e) return;
    const A = g.p[g.pi], B = g.e[g.ei], clave = (A && A.m ? A.m.dex : 0) + ':' + (B && B.m ? B.m.dex : 0);
    if(clave === preVisto) return; preVisto = clave;
    preAtaques(A); preAtaques(B);
    if(!preMovil) [...g.p, ...g.e].forEach(preAtaques);
  }catch(e){}
}, PRE.cada * 1000);

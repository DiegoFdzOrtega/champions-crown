"use strict";
/* =====================================================================
   9) ECONOMÍA: tienda, mochila y reglas del Gachapon (sin pantallas)
   ===================================================================== */
const held = id => save.items[id] || 0;                                        // objetos que tienes
const used = id => Object.values(save.equip).filter(x => x === id).length;    // objetos ya equipados
const free = id => held(id) - used(id);                                        // objetos libres

// Comprar en la tienda con Puntos de Batalla. Devuelve false si no llega el dinero.
function buyMany(id, n){                                           // compra n unidades de golpe (tope: lo que puedes pagar). Devuelve cuántas compró
  const it = SHOP.find(s => s.id === id); n = Math.floor(+n);
  if(!it || !(n >= 1)) return 0;
  let k = Math.min(n, Math.floor(save.bp / it.p));
  if(k < 1) return 0;
  save.bp -= it.p * k;
  if(id === 'ticket_n') save.tickets += k;
  else if(id === 'ticket_l') save.ticketsL += k;
  else save.items[id] = held(id) + k;
  persist(); return k;
}
function maxBuy(id){                                               // cuántas unidades puedes comprar ahora mismo (por dinero)
  const it = SHOP.find(s => s.id === id); if(!it) return 0;
  return Math.floor(save.bp / it.p);
}
function buy(id){ return buyMany(id, 1) === 1; }

// ---------------------------------------------------------------------
// GACHAPON
// ---------------------------------------------------------------------
const pityOf = reg => save.pity[reg] || 0;
const ownedIn = reg => { const [a,b] = REGION_DEX[reg]; return save.box.filter(d => d >= a && d <= b && !hidden(d)).length; };
const shinyIn = reg => { const [a,b] = REGION_DEX[reg]; return save.shiny.filter(d => d >= a && d <= b && !hidden(d)).length; };
// Pokémon de una región con una rareza concreta (los usa el banner y las tiradas)
const pool = (reg, rar) => { const [a,b] = REGION_DEX[reg], out = []; for(let d=a; d<=b; d++) if(DEX[d-1].rar === rar && !hidden(d)) out.push(d); return out; };

// Elige una rareza al azar según GACHA_RATES
function rollRarity(){
  let r = Math.random();
  for(const id of ['legendary','epic','rare','uncommon']){ if((r -= GACHA_RATES[id]) < 0) return id; }
  return 'common';
}
const shinyRate = reg => (save.charms && save.charms[reg]) ? CHARM_RATE : SHINY_RATE;      // probabilidad de shiny en las tiradas de esa región (sube con su Amuleto Arcoíris)
// Una tirada: rareza -> Pokémon de la región -> ¿shiny?
function rollOne(reg, rar){
  const list = pool(reg, rar || rollRarity());
  const dex = rnd(list.length ? list : pool(reg, 'common'));
  return {dex, rarity: DEX[dex-1].rar, shiny: Math.random() < shinyRate(reg)};
}
// Cuántos tickets cuesta cada modo: x1 = 1 normal, x10 = 10 normales, special = 1 legendario (x10 con legendaria)
const GACHA_COST = {one:{n:1, l:0, pulls:1}, ten:{n:10, l:0, pulls:10}, special:{n:0, l:1, pulls:10}};
const canPull = mode => { const c = GACHA_COST[mode]; return save.tickets >= c.n && save.ticketsL >= c.l; };

/* Hace la tirada. Devuelve la lista de resultados (o null si no hay tickets):
   cada uno es {dex, rarity, shiny, isNew, newShiny, bp}. Reglas:
   - El x10 normal NO garantiza nada (solo las probabilidades de siempre); el x10 especial garantiza una Legendaria.
   - Pity: a la tirada 70 sin legendaria, sale una legendaria. Se cuenta por región.
   - Repetido = monedas (PB) según la rareza. Un shiny nuevo de uno que ya tenías se guarda como shiny. */
function pullGacha(mode, reg){
  const c = GACHA_COST[mode];
  if(!REGION_DEX[reg] || !canPull(mode)) return null;
  save.tickets -= c.n; save.ticketsL -= c.l;
  const res = [];
  for(let i = 0; i < c.pulls; i++){
    let forced = null;
    if(pityOf(reg) >= PITY_MAX - 1) forced = 'legendary';                       // pity
    const r = rollOne(reg, forced);
    save.pity[reg] = r.rarity === 'legendary' ? 0 : pityOf(reg) + 1;
    res.push(r);
  }
  const best = r => RAR[r.rarity].rank;                                         // 0 = legendaria
  const need = mode === 'special' ? 'legendary' : null;
  if(need && !res.some(r => best(r) <= RAR[need].rank)){                        // garantía: sube la última tirada
    const last = rollOne(reg, need); res[res.length-1] = last;
    if(need === 'legendary') save.pity[reg] = 0;
  }
  res.forEach(r => {
    r.isNew = !save.box.includes(r.dex);
    if(r.isNew){ save.box.push(r.dex); save.nat[r.dex] = Math.floor(Math.random()*NATURES.length); }
    r.newShiny = r.shiny && !save.shiny.includes(r.dex);
    if(r.newShiny) save.shiny.push(r.dex);
    r.bp = (!r.isNew && !r.newShiny) ? DUP_BP[r.rarity] : 0;                    // repetido (y no shiny nuevo) = monedas
    save.bp += r.bp;
  });
  persist(); if(typeof achSync === 'function') achSync();                       // logros de colección / shiny (achievements.js)
  return res;
}

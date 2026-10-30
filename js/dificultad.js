"use strict";
/* =====================================================================
   DIFICULTAD DE LA HISTORIA: Fácil / Difícil, cada una con su PROPIO avance
   - Arriba de la pantalla Historia hay un botón doble (Fácil | Difícil). La dificultad activa es save.storyMode.
   - Cada dificultad guarda su progreso y sus Ligas superadas por separado (ver trk() en data.js):
       Difícil = save.record / save.prog / save.champ (los de siempre: las partidas antiguas siguen intactas)
       Fácil   = save.easy = {record, prog, champ}
     Puedes cambiar de una a otra cuando quieras y sigues donde lo dejaste en esa.
     Lo que superas en Difícil cuenta también en Fácil (progOf / champOf en data.js: Fácil = el mejor de los dos), pero lo de Fácil NO adelanta Difícil.
   - FÁCIL multiplica la vida, el daño, la reacción y la velocidad de los rivales por los números de EASY (data.js, función floorStats). DIFÍCIL es como siempre.
   - Trofeos, Torre Batalla, logros y perfil cuentan una Liga superada en CUALQUIERA de las dos. Las recompensas de un combate solo se dan la primera vez que lo superas en total.
   - Partidas antiguas: empiezan en Difícil (como estaban). Partidas nuevas: empiezan en Fácil (state.js).
   - storyToggle(caja, redibujar): pinta el botón doble dentro de «caja» y, al pulsar, cambia save.storyMode y llama a «redibujar».
   ===================================================================== */
const STORY_MODES = {
  facil:   {n:'Fácil',   ic:'🌱', d:'Rivales con menos vida, menos daño y más lentos.'},
  dificil: {n:'Difícil', ic:'🔥', d:'La Historia tal y como fue pensada.'}
};
function storyDone(m){ return REGIONS_PLAYED().reduce((a, r) => a + progOf(r, m), 0); }       // combates superados en esa dificultad
function storyToggle(box, redraw){
  if(!box) return;
  const total = FLOORS.length;
  box.className = 'sm-wrap';
  box.innerHTML = `<div class="sm-seg" role="group" aria-label="Dificultad de la Historia">${Object.entries(STORY_MODES).map(([k, m]) =>
    `<button class="sm-b${save.storyMode === k ? ' on' : ''}" data-k="${k}" aria-pressed="${save.storyMode === k}"><i>${m.ic}</i><b>${m.n}</b><small>${storyDone(k)}/${total} combates</small></button>`).join('')}</div>` +
    `<p class="sm-note">${STORY_MODES[save.storyMode].d} Cada dificultad tiene su propio avance: puedes cambiar cuando quieras y sigues donde lo dejaste.</p>`;
  box.querySelectorAll('.sm-b').forEach(b => b.onclick = () => {
    if(b.dataset.k === save.storyMode) return;
    save.storyMode = b.dataset.k; persist(); toast('Historia en ' + STORY_MODES[save.storyMode].n + '.'); if(redraw) redraw();
  });
}

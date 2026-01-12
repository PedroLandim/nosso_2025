import { getPoints } from "../shared/state.js";

const pointsEl = document.getElementById("points");

function syncPoints() {
  if (!pointsEl) return;
  pointsEl.textContent = String(getPoints());
}

// atualiza ao abrir
syncPoints();

// atualiza quando volta de um jogo (bfcache / focus)
window.addEventListener("pageshow", syncPoints);
window.addEventListener("focus", syncPoints);
document.addEventListener("visibilitychange", () => {
  if (!document.hidden) syncPoints();
});

// se abrir em outra aba e mudar pontos lá, aqui também reflete
window.addEventListener("storage", syncPoints);

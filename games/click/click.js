import { getPoints, addPoints } from "../shared/state.js";

const pointsEl = document.getElementById("points");
const heartBtn = document.getElementById("heartBtn");
const toast = document.getElementById("toast");
const cooldownText = document.getElementById("cooldownText");
const FLOAT_VARIANTS = ["+1 💗", "+1 💞", "+1 ✨"];

function pickFloat() {
  return FLOAT_VARIANTS[(Math.random() * FLOAT_VARIANTS.length) | 0];
}

function syncPoints() {
  if (!pointsEl) return;
  pointsEl.textContent = String(getPoints());
}

function show(msg) {
  toast.textContent = msg;
  clearTimeout(show._t);
  show._t = setTimeout(() => (toast.textContent = ""), 700);
}

function pulseHeart() {
  heartBtn.classList.remove("pulse");
  void heartBtn.offsetWidth; // reinicia animação
  heartBtn.classList.add("pulse");
}

function spawnFloat(text) {
  const card = heartBtn.closest(".card");
  if (!card) return;

  const el = document.createElement("div");
  el.className = "float";
  el.textContent = text;

  const dx = (Math.random() * 24 - 12) | 0;
  el.style.setProperty("--dx", `${dx}px`);

  card.appendChild(el);
  el.addEventListener("animationend", () => el.remove());
}

heartBtn.addEventListener("click", () => {
  addPoints(1);
  syncPoints();

  pulseHeart();

  const msg = pickFloat();
  spawnFloat(msg);
});

// status fixo (já que não existe mais cooldown)
if (cooldownText) {
  cooldownText.textContent = "Te amo";
  cooldownText.dataset.state = "ok";
}

syncPoints();

// mantém sync quando volta pro jogo / muda em outra aba
window.addEventListener("pageshow", syncPoints);
window.addEventListener("focus", syncPoints);
document.addEventListener("visibilitychange", () => {
  if (!document.hidden) syncPoints();
});
window.addEventListener("storage", syncPoints);

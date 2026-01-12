import { getPoints, addPoints } from "../shared/state.js";

const pointsEl = document.getElementById("points");
const input = document.getElementById("guessInput");
const btn = document.getElementById("guessBtn");
const resetBtn = document.getElementById("resetBtn");
const msg = document.getElementById("msg");
const triesEl = document.getElementById("tries");

let secret = 1 + Math.floor(Math.random() * 20);
let tries = 5;

function syncPoints() {
  if (!pointsEl) return;
  pointsEl.textContent = String(getPoints());
}

function setMsg(text, type = "info") {
  msg.textContent = text;
  msg.dataset.type = type;

  // ajuda no celular: garante que a dica fique visível
  msg.scrollIntoView({ block: "nearest", behavior: "smooth" });
}

function resetGame() {
  secret = 1 + Math.floor(Math.random() * 20);
  tries = 5;
  triesEl.textContent = String(tries);
  setMsg("Boa sorte 😼", "info");
  input.value = "";
  input.focus();
  btn.disabled = false;
}

function rewardFor(triesLeft) {
  // 5 tentativas -> 30; 4 -> 25; 3 -> 20; 2 -> 15; 1 -> 10; 0 -> 10
  return Math.max(10, 5 + triesLeft * 5);
}

function shakeInput() {
  input.classList.remove("shake");
  void input.offsetWidth;
  input.classList.add("shake");
}

function handleGuess() {
  const val = Number(input.value);

  if (!Number.isFinite(val) || val < 1 || val > 20) {
    setMsg("Escolhe um número de 1 a 20 🙂", "warn");
    shakeInput();
    input.focus();
    return;
  }

  input.value = "";

  tries -= 1;
  triesEl.textContent = String(tries);

  if (val === secret) {
    const reward = rewardFor(tries);
    addPoints(reward);
    syncPoints();

    setMsg(`ACERTOU! 🎉 +${reward} pontos`, "success");
    btn.disabled = true;
    input.blur();
    return;
  }

  if (tries <= 0) {
    setMsg(`Acabou 😭 O número era ${secret}. Clica em "Novo número".`, "danger");
    btn.disabled = true;
    input.blur();
    return;
  }

  setMsg(val < secret ? "Mais alto ⬆️" : "Mais baixo ⬇️", "info");
  input.select();
  input.focus();
  
}

btn.addEventListener("click", handleGuess);
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") handleGuess();
});
resetBtn.addEventListener("click", resetGame);

// Sync inicial + quando volta de outras páginas/jogos
syncPoints();
resetGame();

window.addEventListener("pageshow", syncPoints);
window.addEventListener("focus", syncPoints);
document.addEventListener("visibilitychange", () => {
  if (!document.hidden) syncPoints();
});
window.addEventListener("storage", syncPoints);

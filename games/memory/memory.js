import { photosData } from "../shared/photosData.js";
import { thumbFromSrc } from "../shared/thumbs.js";
import { getPoints, addPoints } from "../shared/state.js";

const pointsEl = document.getElementById("points");
const movesEl = document.getElementById("moves");
const pairsEl = document.getElementById("pairs");
const grid = document.getElementById("grid");
const restartBtn = document.getElementById("restart");
const toast = document.getElementById("toast");

const PAIRS = 8;           // 8 pares = 16 cartas
const POINTS_PER_PAIR = 10;
const BONUS_FINISH = 30;

let moves = 0;
let lock = false;
let first = null;
let second = null;
let matchedCount = 0;

function updatePointsUI() {
  pointsEl.textContent = String(getPoints());
}

function updateHUD() {
  movesEl.textContent = `Jogadas: ${moves}`;
  pairsEl.textContent = `Pares: ${matchedCount}/${PAIRS}`;
}

function setToast(msg) {
  toast.textContent = msg;
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function pickPhotosForGame() {
  const pool = [...photosData];
  shuffle(pool);

  const chosen = pool.slice(0, PAIRS).map((p) => ({
    id: p.src,
    src: p.src,
    thumb: thumbFromSrc(p.src),
    alt: p.alt || "foto",
  }));

  const deck = [];
  for (const p of chosen) {
    deck.push({ ...p, key: `${p.id}__a` });
    deck.push({ ...p, key: `${p.id}__b` });
  }
  return shuffle(deck);
}

function render(deck) {
  grid.innerHTML = "";
  const frag = document.createDocumentFragment();

  for (const cardData of deck) {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "card-m";
    card.dataset.id = cardData.id;
    card.dataset.key = cardData.key;
    card.setAttribute("aria-label", "Carta de memória");
    card.style.padding = "0";
    card.style.border = "none";

    const front = document.createElement("div");
    front.className = "face front";
    front.textContent = "💗";

    const back = document.createElement("div");
    back.className = "face back";

    const img = document.createElement("img");
    img.loading = "lazy";
    img.decoding = "async";
    img.src = cardData.thumb;
    img.alt = cardData.alt;

    back.appendChild(img);

    card.appendChild(front);
    card.appendChild(back);

    frag.appendChild(card);
  }

  grid.appendChild(frag);
}

function resetState() {
  moves = 0;
  matchedCount = 0;
  first = null;
  second = null;
  lock = false;
  updateHUD();
  setToast("");
}

let deck = [];

function startGame() {
  resetState();
  deck = pickPhotosForGame();
  render(deck);
}

function flip(card) {
  card.classList.add("flipped");
}
function unflip(card) {
  card.classList.remove("flipped");
}

function markMatched(a, b) {
  a.classList.add("matched");
  b.classList.add("matched");
}

grid.addEventListener("click", (e) => {
  const card = e.target.closest(".card-m");
  if (!card) return;
  if (lock) return;
  if (card.classList.contains("matched")) return;
  if (card === first) return;

  flip(card);

  if (!first) {
    first = card;
    return;
  }

  second = card;
  moves++;
  updateHUD();

  const isMatch = first.dataset.id === second.dataset.id;

  if (isMatch) {
    markMatched(first, second);
    matchedCount++;
    addPoints(POINTS_PER_PAIR);
    updatePointsUI();
    updateHUD();
    setToast(`Par! +${POINTS_PER_PAIR} pontos ✨`);

    first = null;
    second = null;

    if (matchedCount === PAIRS) {
      addPoints(BONUS_FINISH);
      updatePointsUI();
      setToast(`Você zerou! +${BONUS_FINISH} bônus 💖`);
    }
    return;
  }

  lock = true;

  setTimeout(() => {
    unflip(first);
    unflip(second);
    first = null;
    second = null;
    lock = false;
  }, 650);
});

restartBtn.addEventListener("click", startGame);

/* sync pontos quando voltar do hub */
updatePointsUI();
window.addEventListener("pageshow", updatePointsUI);
window.addEventListener("focus", updatePointsUI);
document.addEventListener("visibilitychange", () => {
  if (!document.hidden) updatePointsUI();
});
window.addEventListener("storage", updatePointsUI);

startGame();

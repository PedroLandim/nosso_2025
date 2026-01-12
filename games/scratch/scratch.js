import { getPoints, addPoints, addItem } from "../shared/state.js";

const pointsEl = document.getElementById("points");
const canvas = document.getElementById("scratch");
const ctx = canvas.getContext("2d", { willReadFrequently: true });

const prizeTitle = document.getElementById("prizeTitle");
const prizeText = document.getElementById("prizeText");

const newBtn = document.getElementById("newBtn");
const resetBtn = document.getElementById("resetBtn");
const statusEl = document.getElementById("status");

// prêmios possíveis (edita quando quiser)
const PRIZES = [
  { type: "points", value: 20, title: "✨ +20 pontos", text: "Você é uma lenda.", weight: 0.48975 },
  { type: "points", value: 35, title: "💖 +35 pontos", text: "Boaaa amorzinho", weight: 0.48975 },
  { type: "item", value: { id: "beijo", name: "Cupom de Beijo" }, title: "Cupom de Beijo", text: "Me dê um beijo agora.", weight: 0.01 },
  { type: "item", value: { id: "filme", name: "Sessão de Filme 🎬" }, title: "🎬 Sessão de Filme", text: " WOW! Você escolhe o filme.", weight: 1 / 5000 },
  { type: "item", value: { id: "cafe", name: "Jantar fora 🦐" }, title: "Jantar fora", text: "MEU DEEEUS Q SORTE! Um jantar por minha conta.", weight: 1 / 20000 },
];

const totalWeight = PRIZES.reduce((a, p) => a + p.weight, 0);

function pickPrize() {
  let r = Math.random() * totalWeight;
  for (const p of PRIZES) {
    r -= p.weight;
    if (r <= 0) return p;
  }
  return PRIZES[PRIZES.length - 1];
}

let currentPrize = null;
let revealed = false;

// canvas auxiliar pequeno pra checar “% raspado” sem pesar
const checkCanvas = document.createElement("canvas");
const checkCtx = checkCanvas.getContext("2d", { willReadFrequently: true });
checkCanvas.width = 140;
checkCanvas.height = 80;

function syncPoints() {
  pointsEl.textContent = String(getPoints());
}

function resizeCanvasToCss() {
  const dpr = Math.max(1, window.devicePixelRatio || 1);
  const rect = canvas.getBoundingClientRect();

  // ajusta resolução interna
  canvas.width = Math.floor(rect.width * dpr);
  canvas.height = Math.floor(rect.height * dpr);

  // desenhar em “pixels CSS”
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function paintCover() {
  const rect = canvas.getBoundingClientRect();

  ctx.globalCompositeOperation = "source-over";
  ctx.clearRect(0, 0, rect.width, rect.height);

  // ✅ base OPACA (antes era 0.22 e vazava o conteúdo)
  ctx.fillStyle = "rgba(255, 105, 150, 1.5)";
  ctx.fillRect(0, 0, rect.width, rect.height);

  // textura leve (listrinhas) por cima
  ctx.save();
  ctx.globalAlpha = 0.16;
  ctx.translate(-rect.width, 0);
  ctx.rotate(-Math.PI / 8);
  ctx.fillStyle = "rgba(255,255,255,0.9)";
  for (let x = 0; x < rect.width * 3; x += 18) ctx.fillRect(x, 0, 8, rect.height * 2);
  ctx.restore();

  // texto
  ctx.fillStyle = "rgba(90, 30, 50, 0.90)";
  ctx.font = "900 16px system-ui";
  ctx.textAlign = "center";
  ctx.fillText("Raspa aqui 💗", rect.width / 2, rect.height / 2);

  ctx.font = "700 12px system-ui";
  ctx.globalAlpha = 0.95;
  ctx.fillText("dica: raspa bastante pra revelar", rect.width / 2, rect.height / 2 + 24);
  ctx.globalAlpha = 1;
}

function startNew() {
  revealed = false;
  currentPrize = pickPrize();

  prizeTitle.textContent = currentPrize.title;
  prizeText.textContent = currentPrize.text;
  statusEl.textContent = "Raspa para revelar…";

  resizeCanvasToCss();
  paintCover();
}

function resetCover() {
  if (!currentPrize) return startNew();
  revealed = false;
  statusEl.textContent = "Raspa novamente 💗";

  resizeCanvasToCss();
  paintCover();
}

function scratchAt(x, y) {
  const rect = canvas.getBoundingClientRect();

  ctx.globalCompositeOperation = "destination-out";
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  // pincel “gordinho”
  const r = 22;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();

  // opcional: arrasto mais suave (um mini traço)
  ctx.beginPath();
  ctx.arc(x, y, r * 0.65, 0, Math.PI * 2);
  ctx.fill();

  if (!revealed) checkRevealThrottled();
}

let lastCheck = 0;
function checkRevealThrottled() {
  const now = performance.now();
  if (now - lastCheck < 90) return;
  lastCheck = now;
  checkReveal();
}

function checkReveal() {
  const w = checkCanvas.width;
  const h = checkCanvas.height;

  checkCtx.clearRect(0, 0, w, h);
  checkCtx.drawImage(canvas, 0, 0, w, h);

  const data = checkCtx.getImageData(0, 0, w, h).data;

  let transparent = 0;
  const step = 6; // quanto maior, mais leve e menos preciso
  let total = 0;

  for (let y = 0; y < h; y += step) {
    for (let x = 0; x < w; x += step) {
      const i = (y * w + x) * 4 + 3; // alpha
      const a = data[i];
      if (a < 40) transparent++;
      total++;
    }
  }

  const ratio = transparent / total;

  // ~40% raspado revela
  if (ratio > 0.42) {
    revealed = true;

    // limpa o cover (em CSS px)
    const rect = canvas.getBoundingClientRect();
    ctx.globalCompositeOperation = "source-over";
    ctx.clearRect(0, 0, rect.width, rect.height);

    giveReward();
  }
}

function giveReward() {
  if (!currentPrize) return;

  if (currentPrize.type === "points") {
    addPoints(currentPrize.value);
    syncPoints();
    statusEl.textContent = `Você ganhou ${currentPrize.value} pontos! 🎉`;
  } else {
    addItem(currentPrize.value);
    statusEl.textContent = `Você ganhou: ${currentPrize.value.name} 🎁 (vai pro inventário)`;
  }
}

function getPos(e) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top,
  };
}

// ✅ Pointer events (funciona liso em mobile e desktop)
let drawing = false;

canvas.addEventListener("pointerdown", (e) => {
  drawing = true;
  canvas.setPointerCapture(e.pointerId);
  const { x, y } = getPos(e);
  scratchAt(x, y);
});

canvas.addEventListener("pointermove", (e) => {
  if (!drawing) return;
  const { x, y } = getPos(e);
  scratchAt(x, y);
});

canvas.addEventListener("pointerup", () => (drawing = false));
canvas.addEventListener("pointercancel", () => (drawing = false));

newBtn.addEventListener("click", startNew);
resetBtn.addEventListener("click", resetCover);

window.addEventListener("resize", () => {
  if (!revealed) resetCover();
});

window.addEventListener("pageshow", syncPoints);
window.addEventListener("focus", syncPoints);
window.addEventListener("storage", syncPoints);
document.addEventListener("visibilitychange", () => {
  if (!document.hidden) syncPoints();
});

syncPoints();
startNew();

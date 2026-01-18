import { getPoints, addPoints, spendPoints, addItem } from "../shared/state.js";

const pointsEl = document.getElementById("points");
const canvas = document.getElementById("wheel");
const ctx = canvas.getContext("2d");
const btn = document.getElementById("spin");
const resultEl = document.getElementById("result");

function updatePointsUI(){
  pointsEl.textContent = String(getPoints());
}
updatePointsUI();

/**
 * ✅ PRÊMIOS
 * (ajustei value para bater com o label)
 * ✅ raro: "Beijo na nuca 😳" com peso 0.8 (~0.84%)
 */
const slices = [
  // ganhos
  { label: "+100 pts",  type: "points", value: 100,  weight: 16 },
  { label: "+100 pts",  type: "points", value: 100,  weight: 10 },
  { label: "+200 pts",  type: "points", value: 200,  weight: 9 },
  { label: "+500 pts",  type: "points", value: 500,  weight: 5 },
  { label: "+1000 pts", type: "points", value: 1000, weight: 4 },

  // itens
  { label: "Beijo",   type: "item", value: { id: "beijo", name: "Cupom de Beijo" }, weight: 14 },
  { label: "Cupom favor", type: "item", value: { id: "abraco", name: "Cupom favor" }, weight: 1 },

  // raros (ambos < 1% aprox; massagem mais rara que nuca)
  { label: "Vale Massagem 💆", type: "item", value: { id: "massagem", name: "Vale Massagem 💆" }, weight: 0.5 },
  { label: "Beijo na nuca", type: "item", value: { id: "beijo_nuca", name: "Beijo na nuca" }, weight: 1 },

  // perdas (reduzidas)
  { label: "Perde 100 pts 😈", type: "points", value: -100, weight: 4 },
  { label: "Perde 150 pts 😈", type: "points", value: -150, weight: 2 },
  { label: "Perde 200 pts 😈", type: "points", value: -200, weight: 1 },
];

const totalWeight = slices.reduce((a, s) => a + s.weight, 0);

function pickByWeight() {
  let r = Math.random() * totalWeight;
  for (const s of slices) {
    r -= s.weight;
    if (r <= 0) return s;
  }
  return slices[slices.length - 1];
}

/** ✅ evita pontos negativos ao aplicar delta */
function safeAddPoints(delta) {
  const cur = getPoints();
  const next = Math.max(0, cur + delta);
  addPoints(next - cur);
  return { before: cur, after: next };
}

const TAU = Math.PI * 2;
const POINTER_ANGLE = -Math.PI / 2; // ✅ seta no topo (12h)

function normalizeAngle(a) {
  a = a % TAU;
  return a < 0 ? a + TAU : a;
}

function getIndexAtPointer(rot) {
  const arc = TAU / slices.length;
  const a = normalizeAngle(POINTER_ANGLE - rot);
  return Math.floor(a / arc) % slices.length;
}

function drawWheel(rotation = 0) {
  const { width: w, height: h } = canvas;
  const cx = w / 2, cy = h / 2;
  const radius = Math.min(w, h) / 2 - 10;

  ctx.clearRect(0, 0, w, h);

  const arc = TAU / slices.length;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(rotation);

  for (let i = 0; i < slices.length; i++) {
    const start = i * arc;
    const end = start + arc;

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, radius, start, end);
    ctx.closePath();
    ctx.fillStyle = i % 2 === 0 ? "#ffe3ee" : "#fff";
    ctx.fill();

    ctx.strokeStyle = "rgba(255,122,162,.35)";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.save();
    ctx.rotate(start + arc / 2);
    ctx.textAlign = "right";
    ctx.fillStyle = "#5a1f33";
    ctx.font = "600 16px system-ui";
    ctx.fillText(slices[i].label, radius - 16, 6);
    ctx.restore();
  }

  // centro
  ctx.beginPath();
  ctx.arc(0, 0, 46, 0, TAU);
  ctx.fillStyle = "#ff7aa2";
  ctx.fill();

  ctx.fillStyle = "white";
  ctx.font = "800 16px system-ui";
  ctx.textAlign = "center";
  ctx.fillText("GIRAR", 0, 6);

  ctx.restore();
}

let rotation = 0;
drawWheel(rotation);

let spinning = false;
function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

btn.addEventListener("click", () => {
  if (spinning) return;

  // custo do giro
  const ok = spendPoints(100);
  if (!ok) {
    resultEl.textContent = "Você precisa de 100 pontos pra girar 😭";
    return;
  }
  updatePointsUI();

  spinning = true;
  btn.disabled = true;
  resultEl.textContent = "Girando... 🎡";

  // escolhe por peso
  const chosen = pickByWeight();

  const arc = TAU / slices.length;
  const chosenIndex = slices.indexOf(chosen);

  // mira no meio da fatia + jitter pra não cair na divisória
  const jitter = (Math.random() - 0.5) * arc * 0.6;
  const target = (chosenIndex + 0.5) * arc + jitter;

  const spins = 6 + Math.floor(Math.random() * 4);
  const startRot = rotation;

  // ✅ alinha target com a seta do topo
  const correction = normalizeAngle(POINTER_ANGLE - (target + startRot));
  const endRot = startRot + TAU * spins + correction;

  const duration = 2200 + Math.random() * 700;
  const start = performance.now();

  function tick(now) {
    const t = Math.min(1, (now - start) / duration);
    const k = easeOutCubic(t);

    rotation = startRot + (endRot - startRot) * k;
    drawWheel(rotation);

    if (t < 1) {
      requestAnimationFrame(tick);
      return;
    }

    spinning = false;
    btn.disabled = false;

    // ✅ premia o que a seta aponta (não desencontra nunca)
    const landedIndex = getIndexAtPointer(rotation);
    const landed = slices[landedIndex];

    if (landed.type === "points") {
      const { before, after } = safeAddPoints(landed.value);
      updatePointsUI();

      if (landed.value >= 0) {
        resultEl.textContent = `Você ganhou ${landed.value} pontos! ✨`;
      } else {
        const lost = before - after; // quanto realmente perdeu (clamp)
        resultEl.textContent = lost > 0
          ? `Eita 😈 Você perdeu ${lost} pontos...`
          : `Você já estava no 0 😅 (não dá pra ficar negativo)`;
      }
    } else {
      addItem(landed.value);
      resultEl.textContent = `Você ganhou: ${landed.value.name} 🎁 (já foi pro inventário)`;
    }
  }

  requestAnimationFrame(tick);
});

// sync pontos ao voltar/trocar aba
window.addEventListener("pageshow", updatePointsUI);
window.addEventListener("focus", updatePointsUI);
window.addEventListener("storage", updatePointsUI);
document.addEventListener("visibilitychange", () => {
  if (!document.hidden) updatePointsUI();
});

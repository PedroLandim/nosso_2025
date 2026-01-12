import { getPoints, spendPoints, addItem } from "../shared/state.js";

// Itens da lojinha (edite nomes/descrições à vontade)
const ITEMS = [
  { id: "abraco", icon: "🤗", name: "Abraço", desc: "Abraço bem apertado.", price: 20 },
  { id: "beijo", icon: "😗", name: "Cupom de Beijo", desc: "Resgatável quando quiser.", price: 50 },
  { id: "cafune", icon: "👩🏻", name: "Cafuné", desc: "Cafuné garantido.", price: 100 },
  { id: "cangote", icon: "👑", name: "Vale Cangote", desc: "Cupom de Cheiro no Cangote 😳", price: 100 },

  { id: "massagem", icon: "💆", name: "Vale Massagem", desc: "Massagem relaxante pra resgatar.", price: 10000 },
  { id: "misterio", icon: "🎁", name: "Surpresa Misteriosa", desc: "O presente supremo 😮", price: 100000 },
];

// guarda as compras (com quantidade)
const BOUGHT_KEY = "duda_shop_bought_v2";

const pointsEl = document.getElementById("points");
const shopGrid = document.getElementById("shopGrid");
const msgEl = document.getElementById("msg");
const boughtRow = document.getElementById("boughtRow");
const boughtEmpty = document.getElementById("boughtEmpty");

function setMsg(text) {
  msgEl.textContent = text;
  clearTimeout(setMsg._t);
  setMsg._t = setTimeout(() => (msgEl.textContent = ""), 1600);
}

function syncPoints() {
  pointsEl.textContent = String(getPoints());
}

/**
 * boughtCounts = { [itemId]: count }
 * (faz migração automática do formato antigo (array) se existir)
 */
function loadBoughtCounts() {
  try {
    const raw = localStorage.getItem(BOUGHT_KEY);

    // migração do formato antigo (v1) se existir
    const oldRaw = localStorage.getItem("duda_shop_bought_v1");

    if (!raw && oldRaw) {
      const old = JSON.parse(oldRaw || "[]");
      if (Array.isArray(old)) {
        const counts = {};
        for (const id of old) counts[id] = (counts[id] || 0) + 1;
        saveBoughtCounts(counts);
        return counts;
      }
    }

    const parsed = JSON.parse(raw || "{}");
    if (!parsed || typeof parsed !== "object") return {};
    if (Array.isArray(parsed)) {
      // caso alguém tenha salvo errado: converte também
      const counts = {};
      for (const id of parsed) counts[id] = (counts[id] || 0) + 1;
      saveBoughtCounts(counts);
      return counts;
    }
    return parsed;
  } catch {
    return {};
  }
}

function saveBoughtCounts(counts) {
  localStorage.setItem(BOUGHT_KEY, JSON.stringify(counts));
}

function addBought(itemId) {
  const counts = loadBoughtCounts();
  counts[itemId] = (counts[itemId] || 0) + 1;
  saveBoughtCounts(counts);
}

function renderBought() {
  const counts = loadBoughtCounts();
  const entries = Object.entries(counts).filter(([, c]) => Number(c) > 0);

  boughtRow.innerHTML = "";

  if (!entries.length) {
    boughtEmpty.style.display = "block";
    return;
  }

  boughtEmpty.style.display = "none";

  for (const [itemId, count] of entries) {
    const item = ITEMS.find((x) => x.id === itemId);
    if (!item) continue;

    const icon = document.createElement("div");
    icon.className = "bought-icon";
    icon.title = `${item.name} (x${count})`;
    icon.textContent = item.icon;

    const badge = document.createElement("span");
    badge.className = "bought-count";
    badge.textContent = `x${count}`;

    icon.appendChild(badge);
    boughtRow.appendChild(icon);
  }
}

function renderShop() {
  const points = getPoints();
  const counts = loadBoughtCounts();

  shopGrid.innerHTML = "";

  ITEMS.forEach((item) => {
    const owned = counts[item.id] || 0;

    const card = document.createElement("div");
    card.className = "item";

    card.innerHTML = `
      <div class="item-top">
        <div>
          <div class="item-name">${item.icon} ${item.name}</div>
          <p class="item-desc">${item.desc}</p>
          ${owned ? `<p class="item-desc" style="margin-top:6px; font-weight:900; opacity:.9;">Você tem: x${owned}</p>` : ``}
        </div>
        <div class="price">${item.price} pts</div>
      </div>
    `;

    const btn = document.createElement("button");
    btn.className = "buy";
    btn.textContent = "Comprar";
    btn.disabled = points < item.price;

    btn.addEventListener("click", () => {
      const ok = spendPoints(item.price);
      if (!ok) {
        syncPoints();
        renderShop();
        setMsg("Pontos insuficientes 😭");
        return;
      }

      // salva compra (com quantidade)
      addBought(item.id);

      // opcional: também manda pro inventário global (se você estiver usando)
      addItem({ id: item.id, name: item.name });

      syncPoints();
      renderShop();
      renderBought();
      setMsg(`Comprou: ${item.name} ${item.icon}`);
    });

    card.appendChild(btn);
    shopGrid.appendChild(card);
  });
}

// init
syncPoints();
renderShop();
renderBought();

window.addEventListener("pageshow", () => {
  syncPoints();
  renderShop();
  renderBought();
});
window.addEventListener("focus", () => {
  syncPoints();
  renderShop();
  renderBought();
});
window.addEventListener("storage", () => {
  syncPoints();
  renderShop();
  renderBought();
});

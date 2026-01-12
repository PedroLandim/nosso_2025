// script.js (type="module" no index.html)

// Importa os meses que você tiver
import { janeiroPhotos } from "./data/1-janeiro.js";
import { fevereiroPhotos } from "./data/2-fevereiro.js";
import { marçoPhotos } from "./data/3-março.js";
import { abrilPhotos } from "./data/4-abril.js";
import { maioPhotos } from "./data/5-maio.js";
import { junhoPhotos } from "./data/6-junho.js";
import { julhoPhotos } from "./data/7-julho.js";
import { agostoPhotos } from "./data/8-agosto.js";
import { setembroPhotos } from "./data/9-setembro.js";
import { outubroPhotos } from "./data/10-outubro.js";
import { novembroPhotos } from "./data/11-novembro.js";
import { dezembroPhotos } from "./data/12-dezembro.js";

// Junta tudo num único array
const photosData = [
  ...janeiroPhotos,
  ...fevereiroPhotos,
  ...marçoPhotos,
  ...abrilPhotos,
  ...maioPhotos,
  ...junhoPhotos,
  ...julhoPhotos,
  ...agostoPhotos,
  ...setembroPhotos,
  ...outubroPhotos,
  ...novembroPhotos,
  ...dezembroPhotos,
];

// ====================== THUMBS (PRÉ-GERADAS) ==========================
const THUMB_DIR_MAP = {
  "1-janeiro": "1-Janeiro",
  "2-fevereiro": "2-Fevereiro",
  "3-março": "3-Março",
  "4-abril": "4-Abril",
  "5-maio": "5-Maio",
  "6-junho": "6-Junho",
  "7-julho": "7-Julho",
  "8-agosto": "8-Agosto",
  "9-setembro": "9-Setembro",
  "10-outubro": "10-Outubro",
  "11-novembro": "11-Novembro",
  "12-dezembro": "12-Dezembro",
};

function thumbFromSrc(src) {
  // src: fotos/1-janeiro/5jan.jpeg
  // ->   fotos/thumbs/1-Janeiro/5jan.webp
  const clean = src.replaceAll("\\", "/");
  const parts = clean.split("/");
  const folder = parts[1];
  const file = parts.slice(2).join("/");
  const mappedFolder = THUMB_DIR_MAP[folder] || folder;

  return `fotos/thumbs/${mappedFolder}/${file}`.replace(/\.(jpe?g|png)$/i, ".webp");
}

// ====================== CONTADOR TEMPO JUNTOS ==========================
// 16 de julho de 2024 às 01:30
const startDate = new Date("2024-07-16T01:30:00");

function updateCounter() {
  const now = new Date();
  let diffMs = now - startDate;
  if (diffMs < 0) diffMs = 0;

  const totalSeconds = Math.floor(diffMs / 1000);
  const seconds = totalSeconds % 60;
  const totalMinutes = Math.floor(totalSeconds / 60);
  const minutes = totalMinutes % 60;
  const totalHours = Math.floor(totalMinutes / 60);
  const hours = totalHours % 24;

  const totalDays = Math.floor(totalHours / 24);
  const years = Math.floor(totalDays / 365);
  const remainingDaysAfterYears = totalDays - years * 365;
  const months = Math.floor(remainingDaysAfterYears / 30);
  const days = remainingDaysAfterYears - months * 30;

  document.getElementById("years").textContent = String(years).padStart(2, "0");
  document.getElementById("months").textContent = String(months).padStart(2, "0");
  document.getElementById("days").textContent = String(days).padStart(2, "0");
  document.getElementById("hours").textContent = String(hours).padStart(2, "0");
  document.getElementById("minutes").textContent = String(minutes).padStart(2, "0");
  document.getElementById("seconds").textContent = String(seconds).padStart(2, "0");
}

document.addEventListener("DOMContentLoaded", () => {
  // contador
  updateCounter();
  setInterval(updateCounter, 1000);

  const gallery = document.getElementById("gallery");
  const filterButtons = document.querySelectorAll(".filter-btn");

  // Modal
  const modalBackdrop = document.getElementById("modal-backdrop");
  const modalImage = document.getElementById("modal-image");
  const modalInfo = document.getElementById("modal-info");
  const modalClose = document.getElementById("modal-close");

  // Setas
  const prevBtn = document.getElementById("prev-photo");
  const nextBtn = document.getElementById("next-photo");

  // Estado do modal
  let currentFiltered = [];
  let currentIndex = 0;
  let currentFilter = "all";

  function updateArrowsVisibility() {
    if (!prevBtn || !nextBtn) return;
    if (currentFiltered.length <= 1) {
      prevBtn.style.display = "none";
      nextBtn.style.display = "none";
    } else {
      prevBtn.style.display = "block";
      nextBtn.style.display = "block";
    }
  }

  // ✅ preload para modal ficar suave
  function preload(src) {
    const img = new Image();
    img.decoding = "async";
    img.src = src;
  }

  function openModalAt(index) {
    if (!currentFiltered.length) return;

    currentIndex = (index + currentFiltered.length) % currentFiltered.length;
    const photo = currentFiltered[currentIndex];

    modalImage.src = photo.src;
    modalImage.alt = photo.alt;
    modalInfo.textContent = `${photo.label} — ${photo.caption}`;

    modalBackdrop.classList.add("open");
    updateArrowsVisibility();

    // pré-carrega vizinhas (deixa "next/prev" instantâneo)
    if (currentFiltered.length > 1) {
      const next = currentFiltered[(currentIndex + 1) % currentFiltered.length];
      const prev = currentFiltered[(currentIndex - 1 + currentFiltered.length) % currentFiltered.length];
      preload(next.src);
      preload(prev.src);
    }
  }

  function nextPhoto() {
    openModalAt(currentIndex + 1);
  }
  function prevPhoto() {
    openModalAt(currentIndex - 1);
  }

  // ---------- MONTA A GALERIA (COM BATCH) ----------
  function renderGallery(filter = "all") {
    currentFilter = filter;

    gallery.innerHTML = "";
    gallery.classList.remove("random-mode");

    // 1) filtra dados
    let filteredPhotos = photosData.filter((photo) => {
      const tagsList = [photo.month];
      if (photo.isRandom) tagsList.push("random");

      if (filter === "all") return true;
      return tagsList.includes(filter);
    });

    // 2) random: mostra 1 card, mas modal navega por TODOS random
    if (filter === "random") {
      const onlyRandom = filteredPhotos.filter((p) => p.isRandom);

      if (!onlyRandom.length) {
        gallery.innerHTML = "<p>Sem momentos aleatórios ainda 🥺</p>";
        currentFiltered = [];
        updateArrowsVisibility();
        return;
      }

      const randomPicked = onlyRandom[Math.floor(Math.random() * onlyRandom.length)];
      filteredPhotos = [randomPicked];
      gallery.classList.add("random-mode");

      currentFiltered = photosData.filter((p) => p.isRandom);
    } else {
      currentFiltered = [...filteredPhotos];
    }

    updateArrowsVisibility();

    // 3) render em lotes (evita travar)
    const BATCH = 24;
    let i = 0;

    function makeCard(photo) {
      const card = document.createElement("div");
      card.className = "photo-card";
      card.dataset.src = photo.src;

      const thumb = thumbFromSrc(photo.src);

      // ✅ usa thumb pronta (rápido)
      // ✅ fallback: se não existir, troca pra original
      card.innerHTML = `
        <img
          loading="lazy"
          decoding="async"
          fetchpriority="low"
          src="${thumb}"
          alt="${photo.alt}"
        >
        <div class="photo-overlay">
          <div class="photo-tag">${photo.label}</div>
          <div class="photo-caption">${photo.caption}</div>
        </div>
      `;

      const imgEl = card.querySelector("img");
      imgEl.addEventListener(
        "error",
        () => {
          imgEl.src = photo.src;
        },
        { once: true }
      );

      return card;
    }

    function renderChunk() {
      const frag = document.createDocumentFragment();
      const end = Math.min(i + BATCH, filteredPhotos.length);

      for (; i < end; i++) {
        frag.appendChild(makeCard(filteredPhotos[i]));
      }

      gallery.appendChild(frag);

      if (i < filteredPhotos.length) {
        if ("requestIdleCallback" in window) {
          requestIdleCallback(renderChunk, { timeout: 200 });
        } else {
          requestAnimationFrame(renderChunk);
        }
      } else {
        // terminou: botão trocar no random
        if (filter === "random") {
          const swapBtn = document.createElement("button");
          swapBtn.textContent = "Trocar momento 🎲";
          swapBtn.className = "filter-btn";
          swapBtn.style.marginTop = "12px";
          swapBtn.addEventListener("click", () => renderGallery("random"));
          gallery.appendChild(swapBtn);
        }
      }
    }

    renderChunk();
  }

  // ✅ clique na galeria com delegation (sem listener em cada card)
  gallery.addEventListener("click", (e) => {
    const card = e.target.closest(".photo-card");
    if (!card) return;

    const src = card.dataset.src;
    const idx = currentFiltered.findIndex((p) => p.src === src);
    if (idx >= 0) openModalAt(idx);
  });

  // render inicial
  renderGallery("all");

  // ---------- FILTROS ----------
  filterButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const filter = btn.dataset.filter;

      filterButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      renderGallery(filter);
    });
  });

  // ---------- SETAS ----------
  if (prevBtn && nextBtn) {
    prevBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      prevPhoto();
    });

    nextBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      nextPhoto();
    });
  }

  // Teclado
  document.addEventListener("keydown", (e) => {
    if (!modalBackdrop.classList.contains("open")) return;

    if (e.key === "ArrowRight") nextPhoto();
    if (e.key === "ArrowLeft") prevPhoto();
    if (e.key === "Escape") modalBackdrop.classList.remove("open");
  });

  // ---------- FECHAR MODAL ----------
  modalClose.addEventListener("click", () => {
    modalBackdrop.classList.remove("open");
  });

  modalBackdrop.addEventListener("click", (e) => {
    if (e.target === modalBackdrop) {
      modalBackdrop.classList.remove("open");
    }
  });

  // ====================== CORAÇÕES INTERATIVOS ==========================
  document.addEventListener("click", (event) => {
    if (event.target.closest(".modal")) return;

    const heart = document.createElement("div");
    heart.classList.add("love-spark");
    heart.style.left = `${event.clientX}px`;
    heart.style.top = `${event.clientY}px`;

    const size = 14 + Math.random() * 10;
    heart.style.width = `${size}px`;
    heart.style.height = `${size}px`;

    document.body.appendChild(heart);

    heart.addEventListener("animationend", () => {
      heart.remove();
    });
  });

  // swipe
  let touchStartX = 0;
  let touchEndX = 0;

  modalBackdrop.addEventListener("touchstart", (e) => {
    touchStartX = e.changedTouches[0].screenX;
  });

  modalBackdrop.addEventListener("touchend", (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  });

  function handleSwipe() {
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) < 50) return;

    if (diff > 0) nextPhoto();
    else prevPhoto();
  }
});

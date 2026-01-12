import { janeiroPhotos } from "../../data/1-janeiro.js";
import { fevereiroPhotos } from "../../data/2-fevereiro.js";
import { marçoPhotos } from "../../data/3-março.js";
import { abrilPhotos } from "../../data/4-abril.js";
import { maioPhotos } from "../../data/5-maio.js";
import { junhoPhotos } from "../../data/6-junho.js";
import { julhoPhotos } from "../../data/7-julho.js";
import { agostoPhotos } from "../../data/8-agosto.js";
import { setembroPhotos } from "../../data/9-setembro.js";
import { outubroPhotos } from "../../data/10-outubro.js";
import { novembroPhotos } from "../../data/11-novembro.js";
import { dezembroPhotos } from "../../data/12-dezembro.js";
import { thumbFromSrc } from "./thumbs.js";

// junta tudo
const rawPhotos = [
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

// transforma os paths em absolutos e cria thumb automática
export const photosData = rawPhotos.map((photo) => {
  const cleanSrc = photo.src.startsWith("/") ? photo.src : "/" + photo.src;

  return {
    ...photo,
    src: cleanSrc,                 // foto grande (modal)
    thumb: thumbFromSrc(cleanSrc), // thumb leve (galeria, memória, etc.)
  };
});

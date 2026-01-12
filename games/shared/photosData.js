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

const ROOT = new URL("../../", import.meta.url); // volta da pasta games/shared -> raiz do repo

function resolveFromRoot(path) {
  if (!path) return "";
  const s = String(path);

  // já é URL absoluta
  if (/^(https?:)?\/\//i.test(s)) return s;

  // se vier "/fotos/..." remove a barra inicial
  const clean = s.replace(/^\/+/, "").replace(/^\.\/+/, "");
  return new URL(clean, ROOT).href;
}

export const photosData = [
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
].map((p) => ({
  ...p,
  src: resolveFromRoot(p.src),
}));

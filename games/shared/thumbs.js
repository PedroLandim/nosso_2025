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

export function thumbFromSrc(photoSrc) {
  const href = new URL(photoSrc, import.meta.url).href; // se já for absoluta, mantém
  return href
    .replace("/fotos/", "/fotos/thumbs/")
    .replace(/\.(jpe?g|png)(\?.*)?$/i, ".webp$2");
}
// quiz.js
import { getPoints, addPoints } from "../shared/state.js";

const pointsEl = document.getElementById("points");
const qTitle = document.getElementById("qTitle");
const qDesc = document.getElementById("qDesc");
const optionsEl = document.getElementById("options");
const resultEl = document.getElementById("result");
const nextBtn = document.getElementById("nextQ");
const qCount = document.getElementById("qCount");

// 15 perguntas (edita depois como quiser)
const questions = [
  {
    id: "q1",
    title: "Qual seria um date perfeito pra gente?",
    desc: "Escolhe a opção mais fofinha 😼",
    reward: 15,
    options: [
      { text: "Filme + comidinha + ...😏", correct: true },
      { text: "Trabalho e boletos", correct: false },
      { text: "Cada um no seu canto", correct: false },
    ],
  },
  {
    id: "q2",
    title: "Qual é a nossa vibe?",
    desc: "Só uma combina 100%.",
    reward: 15,
    options: [
      { text: "Risada fácil + abraço apertado", correct: true },
      { text: "Competição de silêncio", correct: false },
      { text: "Só conversa séria", correct: false },
    ],
  },
  {
    id: "q3",
    title: "O que eu faria se tivesse te vendo agora?",
    desc: "Sem vergonha 😳",
    reward: 15,
    options: [
      { text: "Te dar um beijo e dizer ‘oi’", correct: true },
      { text: "Fingir que não te vi", correct: false },
      { text: "Sumir na fumaça", correct: false },
    ],
  },
  {
    id: "q4",
    title: "Escolhe um ‘momento nosso’",
    desc: "Desses, qual é mais a nossa cara?",
    reward: 15,
    options: [
      { text: "Comer em reestaurantes diferenciados e aproveitar a companhia do outro", correct: true },
      { text: "Discussão de trânsito", correct: false },
      { text: "Reunião de condomínio", correct: false },
    ],
  },
  {
    id: "q5",
    title: "Qual presente combina mais comigo te dando?",
    desc: "Só uma é muito real.",
    reward: 15,
    options: [
      { text: "um mimo pensado (comida)", correct: true },
      { text: "O cool", correct: false },
      { text: "Um ‘parabéns’ genérico", correct: false },
    ],
  },
  {
    id: "q6",
    title: "Qual é o melhor ‘plano b’ pra um date?",
    desc: "Se chover, o que salva?",
    reward: 15,
    options: [
      { text: "Ficar juntinhos", correct: true },
      { text: "Cancelar pra sempre", correct: false },
      { text: "Sumir por 3 dias", correct: false },
    ],
  },
  {
    id: "q7",
    title: "O que mais vale pontos comigo?",
    desc: "A resposta certa é fofura.",
    reward: 15,
    options: [
      { text: "Ser a maior e melhor companheira como vc sempre foi/é", correct: true },
      { text: "Esquecer tudo", correct: false },
      { text: "Responder ‘ok’ pra tudo", correct: false },
    ],
  },
  {
    id: "q8",
    title: "Se a gente tivesse um superpoder juntos, qual seria?",
    desc: "Escolhe o mais romântico 😌",
    reward: 15,
    options: [
      { text: "Teletransporte pra se ver rápido", correct: true },
      { text: "Invisibilidade pra fugir", correct: false },
      { text: "Ler mente pra brigar", correct: false },
    ],
  },
  {
    id: "q9",
    title: "O que é ‘carinho’ na nossa língua?",
    desc: "Tradução oficial do amor.",
    reward: 15,
    options: [
      { text: "Abraço + beijo + atenção + massagem", correct: true },
      { text: "Mensagem automática", correct: false },
      { text: "Só quando dá", correct: false },
    ],
  },
  {
    id: "q10",
    title: "Escolhe uma comida que tem cara de ‘a gente’",
    desc: "A resposta certa dá fome 😭",
    reward: 15,
    options: [
      { text: "Qualquer coisa compartilhada", correct: true },
      { text: "Comer correndo sozinho", correct: false },
      { text: "Dieta de ar", correct: false },
    ],
  },
  {
    id: "q11",
    title: "Qual é a melhor mensagem pra receber?",
    desc: "Quando a saudade bate.",
    reward: 15,
    options: [
      { text: "‘Tô com saudade de você, te amo infinito e te quero pra sempre’", correct: true },
      { text: "‘blz’", correct: false },
      { text: "‘Ok.’", correct: false },
    ],
  },
  {
    id: "q12",
    title: "O que mais combina com a gente num sábado?",
    desc: "Escolhe a paz 😌",
    reward: 15,
    options: [
      { text: "Sair pra comer, ou pra rolezar sempre juntos!", correct: true },
      { text: "Stress e pressa", correct: false },
      { text: "Trabalhar sem parar", correct: false },
    ],
  },
  {
    id: "q13",
    title: "O que a gente faz que o pessoal não sabe e ficariam impressionados se soubessem?",
    desc: "O mais fofo vence.",
    reward: 15,
    options: [
      { text: "Beijo com barulho de bolha estourando", correct: true },
      { text: "Ignorar um ao outro", correct: false },
      { text: "Sumir sem dar tchau pro outro", correct: false },
    ],
  },
  {
    id: "q14",
    title: "Se eu pudesse te fazer rir agora, eu…",
    desc: "Completa a frase.",
    reward: 15,
    options: [
      { text: "Faria uma graça só pra te ver sorrindo já que vc é linda pra krl", correct: true },
      { text: "Mandaria um ‘kk’", correct: false },
      { text: "Não tentaria", correct: false },
    ],
  },
  {
    id: "q15",
    title: "Qual frase é mais ‘a gente’?",
    desc: "A mais verdadeira 😼",
    reward: 15,
    options: [
      { text: "“Te amo, Mozi 😉”", correct: true },
      { text: "“Depois a gente vê 😡.”", correct: false },
      { text: "“Tanto faz 🙄.”", correct: false },
    ],
  },
];

// embaralha (Fisher-Yates)
function shuffle(arr){
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--){
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

let order = [];
let idx = 0;
let current = null;

function syncPoints(){
  pointsEl.textContent = String(getPoints());
}

function setResult(text, type){
  resultEl.textContent = text || "";
  if (type) resultEl.dataset.type = type;
  else delete resultEl.dataset.type;
}

function renderQuestion(){
  current = order[idx];

  qCount.textContent = `Pergunta ${idx + 1}/${order.length}`;
  qTitle.textContent = current.title;
  qDesc.textContent = current.desc;

  setResult("", null);

  optionsEl.innerHTML = "";
  current.options.forEach((opt) => {
    const btn = document.createElement("button");
    btn.className = "opt";
    btn.type = "button";

    // seta à direita pra ficar “clean”
    const left = document.createElement("span");
    left.textContent = opt.text;

    const right = document.createElement("span");
    right.textContent = "›";
    right.style.opacity = ".6";
    right.style.fontWeight = "900";

    btn.appendChild(left);
    btn.appendChild(right);

    btn.addEventListener("click", () => answer(opt.correct, btn));
    optionsEl.appendChild(btn);
  });
}

function answer(correct){
  // desabilita tudo
  [...optionsEl.querySelectorAll("button")].forEach((b) => (b.disabled = true));

  if (!correct){
    setResult("Errr… tenta a próxima 😼", "warn");
    return;
  }

  addPoints(current.reward);
  syncPoints();
  setResult(`ACERTOU! +${current.reward} pontos 💘`, "success");
}

function next(){
  if (idx < order.length - 1){
    idx++;
    renderQuestion();
    return;
  }

  // acabou
  setResult("Fim do quiz! Recarrega a página pra um novo embaralhamento 💗", "success");
  nextBtn.disabled = true;
}

function start(){
  order = shuffle(questions).slice(0, 15);
  idx = 0;
  nextBtn.disabled = false;
  syncPoints();
  renderQuestion();
}

nextBtn.addEventListener("click", next);

// mantém pontos atualizados quando voltar pra aba
window.addEventListener("pageshow", syncPoints);
window.addEventListener("focus", syncPoints);
window.addEventListener("storage", syncPoints);
document.addEventListener("visibilitychange", () => {
  if (!document.hidden) syncPoints();
});

start();

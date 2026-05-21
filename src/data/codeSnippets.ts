export type CodeSnippetId = "move" | "jump" | "collect" | "collision" | "win" | "difficulty" | "score" | "hazards";

export type CodeSnippet = {
  id: CodeSnippetId;
  title: string;
  code: string;
  description: string;
};

export const codeSnippets: CodeSnippet[] = [
  {
    id: "move",
    title: "Movimento do personagem",
    code: `function moverPersonagem(direcao) {
  personagem.x += direcao * velocidade;
}`,
    description: "Quando o jogador aperta uma tecla, o personagem muda de posicao na tela.",
  },
  {
    id: "jump",
    title: "Pulo",
    code: `function pular() {
  if (personagem.noChao) {
    personagem.velocidadeY = -forcaDoPulo;
  }
}`,
    description: "O personagem so pode pular quando esta encostado no chao.",
  },
  {
    id: "collect",
    title: "Coleta de bits",
    code: `function coletarBit(bit) {
  pontuacao += 10;
  bit.coletado = true;
}`,
    description: "Quando o personagem encosta em um bit, a pontuacao aumenta.",
  },
  {
    id: "collision",
    title: "Colisao com obstaculo",
    code: `function verificarColisao() {
  if (personagem.encostouNo(obstaculo)) {
    vidas -= 1;
  }
}`,
    description: "Quando o personagem bate em um obstaculo, ele perde uma vida.",
  },
  {
    id: "win",
    title: "Condicao de vitoria",
    code: `function verificarVitoria() {
  if (personagem.x >= linhaDeChegada) {
    jogoFinalizado = true;
  }
}`,
    description: "Quando o personagem chega ao final da fase, o jogo termina com vitoria.",
  },
  {
    id: "difficulty",
    title: "Dificuldade dinamica",
    code: `function podeAbrirPortal(modo, bitsColetados) {
  const meta = Math.ceil(totalDeBits * modo.exigencia);
  return bitsColetados >= meta;
}`,
    description: "Nos modos adultos, o portal pode exigir uma quantidade minima de bits antes de abrir.",
  },
  {
    id: "score",
    title: "Pontuacao avancada",
    code: `function pontuarColeta(combo, modo) {
  const bonusCombo = Math.min(combo, 8) * 2;
  return Math.round((10 + bonusCombo) * modo.multiplicador);
}`,
    description: "Combos, tempo restante, fases perfeitas e multiplicadores tornam o ranking mais competitivo.",
  },
  {
    id: "hazards",
    title: "Obstaculos temporizados",
    code: `function laserAtivo(tempo, ciclo) {
  const etapa = (tempo + ciclo.offset) % ciclo.total;
  return etapa < ciclo.ativo;
}`,
    description: "Firewalls, zonas de lag, bits falsos e plataformas temporarias criam padroes para observar.",
  },
];

export type CodeSnippetId = "move" | "jump" | "collect" | "collision" | "win";

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
    description: "Quando o jogador aperta uma tecla, o personagem muda de posição na tela.",
  },
  {
    id: "jump",
    title: "Pulo",
    code: `function pular() {
  if (personagem.noChao) {
    personagem.velocidadeY = -forcaDoPulo;
  }
}`,
    description: "O personagem só pode pular quando está encostado no chão.",
  },
  {
    id: "collect",
    title: "Coleta de bits",
    code: `function coletarBit(bit) {
  pontuacao += 10;
  bit.coletado = true;
}`,
    description: "Quando o personagem encosta em um bit, a pontuação aumenta.",
  },
  {
    id: "collision",
    title: "Colisão com obstáculo",
    code: `function verificarColisao() {
  if (personagem.encostouNo(obstaculo)) {
    vidas -= 1;
  }
}`,
    description: "Quando o personagem bate em um obstáculo, ele perde uma vida.",
  },
  {
    id: "win",
    title: "Condição de vitória",
    code: `function verificarVitoria() {
  if (personagem.x >= linhaDeChegada) {
    jogoFinalizado = true;
  }
}`,
    description: "Quando o personagem chega ao final da fase, o jogo termina com vitória.",
  },
];

# Corrida dos Bits

Jogo web educativo criado em React para o evento **Unifamília Software Experience**.

## Descrição

Em **Corrida dos Bits**, o jogador controla um pequeno robô em fases curtas de plataforma. O objetivo é coletar bits, evitar bugs de diferentes níveis e chegar ao portal final antes que o tempo acabe.

## Objetivo educacional

O jogo apresenta conceitos iniciais de tecnologia, lógica de programação e desenvolvimento de software de forma visual e interativa. Enquanto a pessoa joga, um painel lateral mostra trechos de código didáticos conectados às ações da partida.

## Tecnologias utilizadas

- React
- Vite
- TypeScript
- CSS puro
- HTML5 no navegador, sem backend e sem banco de dados
- Web Audio API para sons simples gerados no navegador
- localStorage para salvar recordes locais

## Como instalar

```bash
npm install
```

## Como executar

```bash
npm run dev
```

Depois, abra o endereço mostrado pelo Vite no navegador.

## Controles do jogo

- Setas direcionais ou A/D: mover o personagem
- Espaço, seta para cima ou W: pular
- Botão Som ligado/desligado: ativa ou silencia os efeitos
- Iniciar jogo: começa a fase
- Jogar novamente ou Tentar novamente: reinicia a partida

## Fases e desafios

O jogo tem 3 fases em sequência. Ao chegar em um portal intermediário, a próxima fase começa automaticamente, sem tela de pausa.

- Fase 1: introduz movimento, pulo, coleta e bugs estáticos.
- Fase 2: adiciona bugs em movimento.
- Fase 3: adiciona bugs maiores, rotas mais estreitas e maior pressão de tempo.

Os dados das fases ficam em `src/data/levels.ts`, o que facilita mudar plataformas, bits, obstáculos, tamanho dos bugs e velocidade dos bugs móveis.

## Sons

Os efeitos sonoros são criados com Web Audio API, sem arquivos externos. Existem sons para início, movimento, pulo, coleta, colisão, avanço de fase, vitória e derrota.

## Recordes

Ao terminar uma partida, o jogador pode informar um nome e salvar o resultado. Os recordes ficam guardados no `localStorage` do navegador usado no evento.

## Como funciona o painel de código

O painel **"Como o jogo funciona por dentro?"** exibe blocos curtos de código com explicações simples. Ele muda automaticamente quando o jogador executa ações importantes:

- Movimento do personagem
- Pulo
- Coleta de bits
- Colisão com obstáculo
- Condição de vitória

O apresentador também pode clicar manualmente nos botões do painel para escolher qual conceito explicar.

## Sugestões de personalização

- Edite `src/data/codeSnippets.ts` para alterar os exemplos de código e as explicações.
- Edite `src/data/levels.ts` para alterar fases, bits, plataformas, bugs e portais.
- Edite as constantes em `src/components/GameCanvas.tsx` para mudar velocidade, gravidade, tempo e quantidade de vidas.
- Edite `src/utils/sound.ts` para trocar os efeitos sonoros.
- Edite `src/styles/global.css` para trocar cores, tamanhos e efeitos visuais.
- Altere os textos em `StartScreen.tsx` e `EndScreen.tsx` para adaptar a apresentação ao público do evento.

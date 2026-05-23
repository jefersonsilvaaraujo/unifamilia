# Corrida dos Bits

Jogo web educativo criado em React para o evento **Unifamília Software Experience**.

## Descrição

Em **Corrida dos Bits**, o jogador controla um pequeno robô em fases curtas de plataforma. O objetivo é coletar bits, evitar bugs, observar obstáculos temporizados e chegar ao portal final antes que o tempo acabe.

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
- J ou F: atirar para destruir bugs próximos de bits
- Controle Xbox: analógico esquerdo ou D-pad para mover, A para pular, X ou RT para atirar
- Menu com controle: D-pad/LB/RB para trocar dificuldade, A para iniciar/reiniciar e B para voltar ao menu na derrota
- Botão Som ligado/desligado: ativa ou silencia os efeitos
- Iniciar jogo: começa a fase
- Jogar novamente ou Tentar novamente: reinicia a partida

## Modos de dificuldade

- Infantil: mantém o jogo original com 3 fases, 3 vidas, 70s, portal livre e pontuação simples.
- Normal: adiciona 4 fases, obstáculos avançados, variação diária e portal exigindo 65% dos bits.
- Desafio: adiciona 5 fases, 2 vidas, bugs mais rápidos, todos os bits obrigatórios e bônus competitivos.
- 1 Vida: modo extremo para adultos, com uma vida, 5 fases, todos os bits obrigatórios e maior multiplicador de pontos.

Nos modos adultos, o ranking é separado por dificuldade. A pontuação considera combo de bits, bônus de tempo, fases sem dano e coleta completa.

O jogador também tem 10 tiros por partida. Cada tiro viaja na direção do robô e pode destruir um bug, então a munição deve ser usada para abrir caminho quando um bit estiver muito protegido.

## Fases e desafios

No modo Infantil, o jogo mantém as 3 fases originais em sequência. Nos modos Normal, Desafio e 1 Vida, fases extras e obstáculos avançados entram na partida. Ao chegar em um portal intermediário, a próxima fase começa automaticamente, sem tela de pausa.

- Fase 1: introduz movimento, pulo, coleta e bugs estáticos.
- Fase 2: adiciona bugs em movimento.
- Fase 3: adiciona bugs maiores, rotas mais estreitas e maior pressão de tempo.
- Fase 4: adiciona rota expert, firewalls, bits falsos e plataformas temporárias.
- Fase 5: adiciona o deploy final com mais ciclos de risco, lag e coleta obrigatória.

Os dados das fases ficam em `src/data/levels.ts`, o que facilita mudar plataformas, bits, obstáculos, tamanho dos bugs, velocidade dos bugs móveis e hazards avançados.

## Sons

Os efeitos sonoros são criados com Web Audio API, sem arquivos externos. Existem sons para início, movimento, pulo, coleta, colisão, avanço de fase, vitória e derrota.

## Recordes

Ao terminar uma partida, o jogador pode informar um nome e salvar o resultado. Os recordes ficam guardados no `localStorage` do navegador usado no evento e são separados por modo de dificuldade.

## Como funciona o painel de código

O painel **"Como o jogo funciona por dentro?"** exibe blocos curtos de código com explicações simples. Ele muda automaticamente quando o jogador executa ações importantes:

- Movimento do personagem
- Pulo
- Tiro estratégico
- Coleta de bits
- Colisão com obstáculo
- Condição de vitória
- Dificuldade dinâmica
- Pontuação avançada
- Obstáculos temporizados

O apresentador também pode clicar manualmente nos botões do painel para escolher qual conceito explicar.

## Sugestões de personalização

- Edite `src/data/codeSnippets.ts` para alterar os exemplos de código e as explicações.
- Edite `src/data/gameModes.ts` para alterar vidas, tempo, multiplicadores, quantidade de fases e regras do portal.
- Edite `src/data/levels.ts` para alterar fases, bits, plataformas, bugs, hazards e portais.
- Edite as constantes em `src/components/GameCanvas.tsx` para mudar velocidade, gravidade e comportamento físico.
- Edite `src/utils/sound.ts` para trocar os efeitos sonoros.
- Edite `src/styles/global.css` para trocar cores, tamanhos e efeitos visuais.
- Altere os textos em `StartScreen.tsx` e `EndScreen.tsx` para adaptar a apresentação ao público do evento.

# Corrida dos Bits

Jogo web educativo criado em React para o evento **Unifamilia Software Experience**.

## Descricao

Em **Corrida dos Bits**, o jogador controla um pequeno robo em fases curtas de plataforma. O objetivo e coletar bits, evitar bugs, observar obstaculos temporizados e chegar ao portal final antes que o tempo acabe.

## Objetivo educacional

O jogo apresenta conceitos iniciais de tecnologia, logica de programacao e desenvolvimento de software de forma visual e interativa. Enquanto a pessoa joga, um painel lateral mostra trechos de codigo didaticos conectados as acoes da partida.

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

Depois, abra o endereco mostrado pelo Vite no navegador.

## Controles do jogo

- Setas direcionais ou A/D: mover o personagem
- Espaco, seta para cima ou W: pular
- J ou F: atirar para destruir bugs proximos de bits
- Botao Som ligado/desligado: ativa ou silencia os efeitos
- Iniciar jogo: comeca a fase
- Jogar novamente ou Tentar novamente: reinicia a partida

## Modos de dificuldade

- Infantil: mantem o jogo original com 3 fases, 3 vidas, 70s, portal livre e pontuacao simples.
- Normal: adiciona 4 fases, obstaculos avancados, variacao diaria e portal exigindo 65% dos bits.
- Desafio: adiciona 5 fases, 2 vidas, bugs mais rapidos, todos os bits obrigatorios e bonus competitivos.
- 1 Vida: modo extremo para adultos, com uma vida, 5 fases, todos os bits obrigatorios e maior multiplicador de pontos.

Nos modos adultos, o ranking e separado por dificuldade. A pontuacao considera combo de bits, bonus de tempo, fases sem dano e coleta completa.

O jogador tambem tem 10 tiros por partida. Cada tiro viaja na direcao do robo e pode destruir um bug, entao a municao deve ser usada para abrir caminho quando um bit estiver muito protegido.

## Fases e desafios

No modo Infantil, o jogo mantem as 3 fases originais em sequencia. Nos modos Normal, Desafio e 1 Vida, fases extras e obstaculos avancados entram na partida. Ao chegar em um portal intermediario, a proxima fase comeca automaticamente, sem tela de pausa.

- Fase 1: introduz movimento, pulo, coleta e bugs estaticos.
- Fase 2: adiciona bugs em movimento.
- Fase 3: adiciona bugs maiores, rotas mais estreitas e maior pressao de tempo.
- Fase 4: adiciona rota expert, firewalls, bits falsos e plataformas temporarias.
- Fase 5: adiciona o deploy final com mais ciclos de risco, lag e coleta obrigatoria.

Os dados das fases ficam em `src/data/levels.ts`, o que facilita mudar plataformas, bits, obstaculos, tamanho dos bugs, velocidade dos bugs moveis e hazards avancados.

## Sons

Os efeitos sonoros sao criados com Web Audio API, sem arquivos externos. Existem sons para inicio, movimento, pulo, coleta, colisao, avanco de fase, vitoria e derrota.

## Recordes

Ao terminar uma partida, o jogador pode informar um nome e salvar o resultado. Os recordes ficam guardados no `localStorage` do navegador usado no evento e sao separados por modo de dificuldade.

## Como funciona o painel de codigo

O painel **"Como o jogo funciona por dentro?"** exibe blocos curtos de codigo com explicacoes simples. Ele muda automaticamente quando o jogador executa acoes importantes:

- Movimento do personagem
- Pulo
- Tiro estrategico
- Coleta de bits
- Colisao com obstaculo
- Condicao de vitoria
- Dificuldade dinamica
- Pontuacao avancada
- Obstaculos temporizados

O apresentador tambem pode clicar manualmente nos botoes do painel para escolher qual conceito explicar.

## Sugestoes de personalizacao

- Edite `src/data/codeSnippets.ts` para alterar os exemplos de codigo e as explicacoes.
- Edite `src/data/gameModes.ts` para alterar vidas, tempo, multiplicadores, quantidade de fases e regras do portal.
- Edite `src/data/levels.ts` para alterar fases, bits, plataformas, bugs, hazards e portais.
- Edite as constantes em `src/components/GameCanvas.tsx` para mudar velocidade, gravidade e comportamento fisico.
- Edite `src/utils/sound.ts` para trocar os efeitos sonoros.
- Edite `src/styles/global.css` para trocar cores, tamanhos e efeitos visuais.
- Altere os textos em `StartScreen.tsx` e `EndScreen.tsx` para adaptar a apresentacao ao publico do evento.

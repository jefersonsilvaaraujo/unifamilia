type ScoreBoardProps = {
  score: number;
  lives: number;
  timeLeft: number;
  phase: number;
  totalPhases: number;
  modeName: string;
  collectedBits: number;
  requiredBits: number;
  totalBits: number;
  combo: number;
  ammo: number;
};

export function ScoreBoard({
  score,
  lives,
  timeLeft,
  phase,
  totalPhases,
  modeName,
  collectedBits,
  requiredBits,
  totalBits,
  combo,
  ammo,
}: ScoreBoardProps) {
  const bitGoal = requiredBits > 0 ? `${collectedBits}/${requiredBits}` : `${collectedBits}/${totalBits}`;

  return (
    <div className="score-board" aria-label="Informacoes da partida">
      <div className="score-item">
        <span>Modo</span>
        <strong>{modeName}</strong>
      </div>
      <div className="score-item">
        <span>Fase</span>
        <strong>
          {phase}/{totalPhases}
        </strong>
      </div>
      <div className="score-item">
        <span>Pontos</span>
        <strong>{score}</strong>
      </div>
      <div className="score-item">
        <span>Vidas</span>
        <strong aria-label={`${lives} vidas restantes`}>{"♥".repeat(Math.max(lives, 0))}</strong>
      </div>
      <div className="score-item">
        <span>Bits</span>
        <strong>{bitGoal}</strong>
      </div>
      <div className="score-item">
        <span>Combo</span>
        <strong>{combo}x</strong>
      </div>
      <div className="score-item">
        <span>Tiros</span>
        <strong>{ammo}/10</strong>
      </div>
      <div className="score-item">
        <span>Tempo</span>
        <strong>{Math.max(0, Math.ceil(timeLeft))}s</strong>
      </div>
    </div>
  );
}

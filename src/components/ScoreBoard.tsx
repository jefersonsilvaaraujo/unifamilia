type ScoreBoardProps = {
  score: number;
  lives: number;
  timeLeft: number;
  phase: number;
  totalPhases: number;
};

export function ScoreBoard({ score, lives, timeLeft, phase, totalPhases }: ScoreBoardProps) {
  return (
    <div className="score-board" aria-label="Informações da partida">
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
        <span>Tempo</span>
        <strong>{Math.max(0, Math.ceil(timeLeft))}s</strong>
      </div>
    </div>
  );
}

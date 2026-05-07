import { FormEvent, useState } from "react";
import type { GameOutcome } from "../App";
import { getRecords, saveRecord, type PlayerRecord } from "../utils/records";

type EndScreenProps = {
  outcome: GameOutcome;
  onRestart: () => void;
};

export function EndScreen({ outcome, onRestart }: EndScreenProps) {
  const isVictory = outcome.status === "victory";
  const [playerName, setPlayerName] = useState("");
  const [records, setRecords] = useState<PlayerRecord[]>(() => getRecords());
  const [recordSaved, setRecordSaved] = useState(false);

  const handleSaveRecord = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setRecords(saveRecord(playerName, outcome));
    setRecordSaved(true);
  };

  return (
    <section className={`screen-panel end-screen ${isVictory ? "is-victory" : "is-defeat"}`}>
      <div className="screen-copy">
        <p className="eyebrow">{isVictory ? "Missão concluída" : "Nova tentativa"}</p>
        <h1>{isVictory ? "Parabéns, você completou a Corrida dos Bits!" : "Fim de jogo!"}</h1>
        <p className="subtitle">
          {isVictory
            ? "Você coletou bits, desviou dos bugs e chegou ao final da fase. Cada ação do jogo foi controlada por linhas de código."
            : "Os bugs venceram desta vez, mas todo programador aprende testando, errando e tentando novamente."}
        </p>
      </div>

      <div className="final-stats" aria-label="Resultado final">
        <div>
          <span>Pontuação final</span>
          <strong>{outcome.score}</strong>
        </div>
        <div>
          <span>Tempo restante</span>
          <strong>{Math.max(0, Math.ceil(outcome.timeLeft))}s</strong>
        </div>
        <div>
          <span>Fases concluídas</span>
          <strong>
            {outcome.phasesCompleted}/{outcome.totalPhases}
          </strong>
        </div>
      </div>

      <form className="record-form" onSubmit={handleSaveRecord}>
        <label htmlFor="player-name">Nome para o ranking</label>
        <div className="record-form-row">
          <input
            id="player-name"
            maxLength={18}
            onChange={(event) => setPlayerName(event.target.value)}
            placeholder="Ex.: Ana"
            type="text"
            value={playerName}
          />
          <button className="secondary-button" disabled={recordSaved} type="submit">
            {recordSaved ? "Recorde salvo" : "Salvar recorde"}
          </button>
        </div>
      </form>

      <section className="records-board" aria-label="Recordes salvos">
        <h2>Recordes locais</h2>
        {records.length === 0 ? (
          <p>Nenhum recorde salvo ainda.</p>
        ) : (
          <ol>
            {records.map((record) => (
              <li key={record.id}>
                <span>{record.name}</span>
                <strong>{record.score} pts</strong>
                <small>
                  {record.status === "victory" ? "Vitória" : "Tentativa"} · {record.phasesCompleted}/
                  {record.totalPhases} fases · {record.timeLeft}s
                </small>
              </li>
            ))}
          </ol>
        )}
      </section>

      <button className="primary-button" type="button" onClick={onRestart}>
        {isVictory ? "Jogar novamente" : "Tentar novamente"}
      </button>
    </section>
  );
}

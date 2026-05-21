import { FormEvent, useState } from "react";
import type { GameOutcome } from "../App";
import { getRecords, saveRecord, type PlayerRecord } from "../utils/records";

type EndScreenProps = {
  outcome: GameOutcome;
  onMainMenu: () => void;
  onRestart: () => void;
};

export function EndScreen({ outcome, onMainMenu, onRestart }: EndScreenProps) {
  const isVictory = outcome.status === "victory";
  const [playerName, setPlayerName] = useState("");
  const [records, setRecords] = useState<PlayerRecord[]>(() => getRecords(outcome.modeId));
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
        <h1>{isVictory ? "Você completou a Corrida dos Bits!" : "Fim de jogo!"}</h1>
        <p className="subtitle">
          {isVictory
            ? "Você coletou bits, desviou dos bugs e chegou ao final. Nos modos adultos, os bônus fazem cada segundo e cada vida importarem."
            : "Os bugs venceram desta vez. Ajuste a rota, observe os ciclos dos obstáculos e tente novamente."}
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
        <div>
          <span>Modo</span>
          <strong>{outcome.modeName}</strong>
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
        <h2>Recordes locais: {outcome.modeName}</h2>
        {records.length === 0 ? (
          <p>Nenhum recorde salvo neste modo ainda.</p>
        ) : (
          <ol>
            {records.map((record) => (
              <li key={record.id}>
                <span>{record.name}</span>
                <strong>{record.score} pts</strong>
                <small>
                  {record.status === "victory" ? "Vitória" : "Tentativa"} - {record.phasesCompleted}/
                  {record.totalPhases} fases - {record.timeLeft}s{record.dailySeed ? ` - ${record.dailySeed}` : ""}
                </small>
              </li>
            ))}
          </ol>
        )}
      </section>

      <div className="end-actions">
        <button className="primary-button" type="button" onClick={onRestart}>
          {isVictory ? "Jogar novamente" : "Tentar novamente"}
        </button>
        {!isVictory && (
          <button className="secondary-button" type="button" onClick={onMainMenu}>
            Voltar ao menu principal
          </button>
        )}
      </div>
    </section>
  );
}

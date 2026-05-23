import { gameModes, type GameMode } from "../data/gameModes";

type StartScreenProps = {
  controllerName: string;
  selectedMode: GameMode;
  onModeChange: (mode: GameMode) => void;
  onStart: () => void;
};

export function StartScreen({ controllerName, selectedMode, onModeChange, onStart }: StartScreenProps) {
  return (
    <section className="screen-panel start-screen">
      <div className="screen-copy">
        <p className="eyebrow">Jogo educativo em React</p>
        <h1>Corrida dos Bits</h1>
        <p className="subtitle">Colete bits, desvie dos bugs e descubra como um jogo é criado com código!</p>
      </div>

      <ul className="instructions" aria-label="Controles e regras">
        <li>Use as setas ou A/D para mover.</li>
        <li>Use espaço ou seta para cima para pular.</li>
        <li>Use J ou F para atirar. Você tem 10 tiros por partida.</li>
        <li>Controle Xbox: analógico/D-pad para mover, A para pular e X/RT para atirar.</li>
        <li>Colete os bits para ganhar pontos.</li>
        <li>Evite os bugs.</li>
        <li>Avance por 3 fases sem parar a partida.</li>
        <li>Chegue ao portal final antes que o tempo acabe.</li>
      </ul>

      <section className="mode-picker" aria-label="Modos de dificuldade">
        <div>
          <p className="mode-picker-title">Dificuldade</p>
          <p className="mode-picker-copy">{selectedMode.description}</p>
          {controllerName && <p className="controller-status">Controle conectado: {controllerName}</p>}
        </div>
        <div className="mode-options" role="radiogroup" aria-label="Escolha a dificuldade">
          {gameModes.map((mode) => (
            <button
              key={mode.id}
              className={mode.id === selectedMode.id ? "mode-option is-active" : "mode-option"}
              type="button"
              role="radio"
              aria-checked={mode.id === selectedMode.id}
              onClick={() => onModeChange(mode)}
            >
              <strong>{mode.name}</strong>
              <span>{mode.portalRequirement.label}</span>
            </button>
          ))}
        </div>
      </section>

      <button className="primary-button" type="button" onClick={onStart}>
        Iniciar jogo
      </button>
    </section>
  );
}

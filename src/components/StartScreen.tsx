type StartScreenProps = {
  onStart: () => void;
};

export function StartScreen({ onStart }: StartScreenProps) {
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
        <li>Colete os bits para ganhar pontos.</li>
        <li>Evite os bugs.</li>
        <li>Avance por 3 fases sem parar a partida.</li>
        <li>Chegue ao portal final antes que o tempo acabe.</li>
      </ul>

      <button className="primary-button" type="button" onClick={onStart}>
        Iniciar jogo
      </button>
    </section>
  );
}

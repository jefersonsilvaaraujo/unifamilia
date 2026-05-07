import { codeSnippets, type CodeSnippetId } from "../data/codeSnippets";

type CodePanelProps = {
  activeSnippet: CodeSnippetId;
  onSelectSnippet: (snippet: CodeSnippetId) => void;
};

export function CodePanel({ activeSnippet, onSelectSnippet }: CodePanelProps) {
  const selectedSnippet = codeSnippets.find((snippet) => snippet.id === activeSnippet) ?? codeSnippets[0];

  return (
    <aside className="code-panel" aria-label="Painel didático de código">
      <div className="code-panel-header">
        <p className="eyebrow">Unifamília Software Experience</p>
        <h2>Como o jogo funciona por dentro?</h2>
      </div>

      <div className="snippet-tabs" role="tablist" aria-label="Conceitos do jogo">
        {codeSnippets.map((snippet) => (
          <button
            key={snippet.id}
            className={snippet.id === activeSnippet ? "snippet-tab is-active" : "snippet-tab"}
            type="button"
            onClick={() => onSelectSnippet(snippet.id)}
            role="tab"
            aria-selected={snippet.id === activeSnippet}
          >
            {snippet.title}
          </button>
        ))}
      </div>

      <section className="snippet-view" aria-live="polite">
        <h3>{selectedSnippet.title}</h3>
        <pre>
          <code>{selectedSnippet.code}</code>
        </pre>
        <p>{selectedSnippet.description}</p>
      </section>
    </aside>
  );
}

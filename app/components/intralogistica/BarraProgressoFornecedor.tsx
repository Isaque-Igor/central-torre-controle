"use client";

interface Item {
  nome: string;
  total: number;
  concluidas: number;
  percentual: number;
}

interface Props {
  titulo: string;
  dados: Item[];
  loading?: boolean;
  badge?: string;
}

function corPorPercentual(pct: number): string {
  if (pct < 33)  return "#f85149"; // vermelho
  if (pct < 66)  return "#d29922"; // amarelo
  if (pct < 100) return "#7ee787"; // verde claro
  return "#3fb950";                 // verde
}

export default function BarraProgressoFornecedor({ titulo, dados, loading, badge }: Props) {
  return (
    <div className="panel">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <div className="panel-title" style={{ margin: 0 }}>{titulo}</div>
        {badge && <span className="panel-badge">{badge}</span>}
      </div>

      {loading ? (
        <div style={{ height: 200, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", fontSize: 12 }}>
          Carregando...
        </div>
      ) : dados.length === 0 ? (
        <div style={{ height: 200, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", fontSize: 12, fontFamily: "var(--font-mono)" }}>
          Sem dados
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {dados.map(d => {
            const cor = corPorPercentual(d.percentual);
            return (
              <div key={d.nome}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                  <span style={{
                    fontSize: 11, fontFamily: "var(--font-mono)",
                    color: "var(--text-secondary)", fontWeight: 600,
                  }}>
                    {d.nome}
                  </span>
                  <span style={{
                    fontSize: 10, fontFamily: "var(--font-mono)",
                    color: "var(--text-muted)",
                  }}>
                    {d.concluidas}/{d.total} · <span style={{ color: cor, fontWeight: 700 }}>{d.percentual.toFixed(0)}%</span>
                  </span>
                </div>
                <div style={{
                  background: "var(--bg-base)",
                  height: 8,
                  borderRadius: 4,
                  overflow: "hidden",
                  border: "1px solid var(--border)",
                }}>
                  <div style={{
                    width: `${d.percentual}%`,
                    height: "100%",
                    background: cor,
                    transition: "width 0.4s ease, background 0.4s ease",
                  }} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

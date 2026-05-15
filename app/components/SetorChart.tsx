// app/components/SetorChart.tsx
"use client";

interface SetorItem {
  SETOR: string;
  planilhados: string;
  concluidos: string;
  insucesso: string;
  pendentes: string;
  eficiencia_pct: string;
}

interface SetorChartProps {
  data: SetorItem[];
  setorAtivo: string;
}

export default function SetorChart({ data, setorAtivo }: SetorChartProps) {
  if (!data.length) return (
    <div style={{ color: 'var(--text-muted)', fontSize: 11, textAlign: 'center', padding: '20px 0' }}>
      Carregando...
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {/* Legenda */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 4 }}>
        {[
          { label: 'Concluído', color: 'var(--green)' },
          { label: 'Insucesso', color: 'var(--red)' },
          { label: 'Pendente',  color: 'var(--accent)' },
        ].map(({ label, color }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 9, color: 'var(--text-secondary)' }}>
            <span style={{ width: 8, height: 8, borderRadius: 1, background: color, display: 'inline-block' }} />
            {label}
          </div>
        ))}
      </div>

      {/* Barras por setor */}
      {data.map(s => {
        const conc = Number(s.concluidos);
        const fail = Number(s.insucesso);
        const pend = Number(s.pendentes);
        const efic = Number(s.eficiencia_pct);
        const total = conc + fail + pend;
        const pC = Math.round((conc / total) * 100);
        const pF = Math.round((fail / total) * 100);
        const pP = 100 - pC - pF;
        const isAtivo = s.SETOR === setorAtivo;

        const nomeAbrev = s.SETOR
          .replace("Expedição ", "")
          .replace("Interior ", "Int. ")
          .toUpperCase();

        return (
          <div key={s.SETOR}>
            {/* Nome do setor + eficiência */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 3,
            }}>
              <span style={{
                fontSize: 9,
                fontWeight: 600,
                color: isAtivo ? 'var(--accent)' : 'var(--text-secondary)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}>
                {isAtivo ? '▶ ' : ''}{nomeAbrev}
              </span>
              <span style={{
                fontSize: 9,
                fontFamily: 'var(--font-mono)',
                color: efic >= 95 ? 'var(--green)' : efic >= 85 ? 'var(--accent)' : 'var(--red)',
              }}>
                {efic.toFixed(1)}%
              </span>
            </div>

            {/* Barra empilhada */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 40px',
              alignItems: 'center',
              gap: 8,
            }}>
              <div className="bar-track">
                <div className="bar-seg bs-done" style={{ width: `${pC}%` }}>
                  {pC > 12 ? `${pC}%` : ''}
                </div>
                <div className="bar-seg bs-fail" style={{ width: `${pF}%` }}>
                  {pF > 8 ? `${pF}%` : ''}
                </div>
                <div className="bar-seg bs-pend" style={{ width: `${pP}%` }}>
                  {pP > 8 ? `${pP}%` : ''}
                </div>
              </div>
              <div style={{
                fontSize: 9,
                fontFamily: 'var(--font-mono)',
                color: 'var(--text-muted)',
                textAlign: 'right',
              }}>
                {Number(s.planilhados).toLocaleString('pt-BR')}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
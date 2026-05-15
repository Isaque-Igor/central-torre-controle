//TrpList.tsx
"use client";

interface TrpItem {
  id: string;
  conc: number;
  fail: number;
  pend: number;
}

export default function TrpList({ list }: { list: TrpItem[] }) {
  return (
    <div>
      {/* LEGENDA */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 8 }}>
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

      {/* BARRAS */}
      <div className="trp-list">
        {list.map((t) => {
          const total = t.conc + t.fail + t.pend;
          const pC = Math.round((t.conc / total) * 100);
          const pF = Math.round((t.fail / total) * 100);
          const pP = 100 - pC - pF;
          return (
            <div key={t.id} className="trp-row">
              <div className="trp-id">{t.id}</div>
              <div className="bar-track">
                <div className="bar-seg bs-done" style={{ width: `${pC}%` }}>
                  {pC > 12 ? `${pC}%` : ''}
                </div>
                <div className="bar-seg bs-fail" style={{ width: `${pF}%` }}>
                  {pF > 10 ? `${pF}%` : ''}
                </div>
                <div className="bar-seg bs-pend" style={{ width: `${pP}%` }}>
                  {pP > 10 ? `${pP}%` : ''}
                </div>
              </div>
              <div className="trp-tot">{total}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
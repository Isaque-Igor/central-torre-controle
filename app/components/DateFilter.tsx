// app/components/DateFilter.tsx
"use client";

interface DateFilterProps {
  inicio: string;   // YYYY-MM-DD
  fim: string;      // YYYY-MM-DD
  onChange: (inicio: string, fim: string) => void;
}

export default function DateFilter({ inicio, fim, onChange }: DateFilterProps) {
  const fmtBR = (iso: string) =>
    iso ? new Date(iso + "T12:00:00").toLocaleDateString("pt-BR") : "";

  const isPeriodo = inicio !== fim;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      {/* Label modo */}
      <span style={{
        fontSize: 9, fontFamily: "var(--font-mono)", color: "var(--text-muted)",
        textTransform: "uppercase", letterSpacing: "0.5px",
      }}>
        {isPeriodo ? "PERÍODO" : "DATA"}
      </span>

      {/* Input início */}
      <div style={{
        display: "flex", alignItems: "center", gap: 6,
        padding: "4px 10px",
        border: "1px solid var(--border)",
        background: "var(--bg-card)",
        borderRadius: 4,
      }}>
        <span style={{ fontSize: 10, color: "var(--text-muted)" }}>📅</span>
        <input
          type="date"
          value={inicio}
          max={new Date().toISOString().split("T")[0]}
          onChange={e => onChange(e.target.value, fim < e.target.value ? e.target.value : fim)}
          style={{
            background: "transparent",
            border: "none",
            outline: "none",
            fontSize: 11,
            fontFamily: "var(--font-mono)",
            color: "var(--text-secondary)",
            cursor: "pointer",
          }}
        />
      </div>

      {/* Separador */}
      <span style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>→</span>

      {/* Input fim */}
      <div style={{
        display: "flex", alignItems: "center", gap: 6,
        padding: "4px 10px",
        border: `1px solid ${isPeriodo ? "var(--accent)" : "var(--border)"}`,
        background: "var(--bg-card)",
        borderRadius: 4,
      }}>
        <input
          type="date"
          value={fim}
          min={inicio}
          max={new Date().toISOString().split("T")[0]}
          onChange={e => onChange(inicio, e.target.value)}
          style={{
            background: "transparent",
            border: "none",
            outline: "none",
            fontSize: 11,
            fontFamily: "var(--font-mono)",
            color: isPeriodo ? "var(--accent)" : "var(--text-secondary)",
            cursor: "pointer",
          }}
        />
      </div>

      {/* Atalhos rápidos */}
      {[
        { label: "ONTEM",    dias: 1 },
        { label: "7D",       dias: 7 },
        { label: "30D",      dias: 30 },
      ].map(({ label, dias }) => {
        const fimD  = new Date(); fimD.setDate(fimD.getDate() - 1);
        const iniD  = new Date(); iniD.setDate(iniD.getDate() - dias);
        const iniISO = iniD.toISOString().split("T")[0];
        const fimISO = fimD.toISOString().split("T")[0];
        const ativo  = inicio === iniISO && fim === fimISO;
        return (
          <button
            key={label}
            onClick={() => onChange(iniISO, fimISO)}
            style={{
              fontSize: 9, fontFamily: "var(--font-mono)",
              padding: "3px 7px", borderRadius: 3,
              border: `1px solid ${ativo ? "var(--accent)" : "var(--border)"}`,
              background: ativo ? "rgba(240,165,0,0.12)" : "var(--bg-card)",
              color: ativo ? "var(--accent)" : "var(--text-muted)",
              cursor: "pointer",
            }}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
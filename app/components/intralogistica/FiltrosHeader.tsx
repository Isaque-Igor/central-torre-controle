// app/components/intralogistica/FiltrosHeader.tsx
"use client";

interface FiltrosHeaderProps {
  dataSel: string;
  onChangeData: (v: string) => void;
  onAtualizar: () => void;
  onExportar: () => void;
  exportDisabled?: boolean;
}

export default function FiltrosHeader({
  dataSel, onChangeData, onAtualizar, onExportar, exportDisabled,
}: FiltrosHeaderProps) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <input
        type="date"
        value={dataSel}
        onChange={e => onChangeData(e.target.value)}
        style={{
          background: "var(--bg-card)", border: "1px solid var(--border)",
          borderRadius: 6, padding: "6px 10px", cursor: "pointer",
          fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-secondary)",
          outline: "none",
        }}
      />
      <button onClick={onAtualizar} style={{
        background: "var(--bg-card)", border: "1px solid var(--border)",
        borderRadius: 6, padding: "6px 14px", cursor: "pointer",
        fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-secondary)",
      }}>
        ↻ Atualizar
      </button>
      <button
        onClick={onExportar}
        disabled={exportDisabled}
        style={{
          background: "var(--bg-card)", border: "1px solid var(--border)",
          borderRadius: 6, padding: "6px 14px",
          cursor: exportDisabled ? "not-allowed" : "pointer",
          fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--green)",
          opacity: exportDisabled ? 0.4 : 1,
        }}
      >
        ↓ Exportar Excel
      </button>
    </div>
  );
}
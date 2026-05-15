// app/components/TransporteChart.tsx
"use client";
import { useState } from "react";

interface TrpItem {
  NUMERO_DO_TRANSPORTE: string;
  planilhados: string;
  concluidos: string;
  insucesso: string;
  pendentes: string;
  eficiencia_pct: string;
}

interface TooltipState {
  visible: boolean;
  x: number;
  y: number;
  label: string;
  value: number;
  color: string;
}

export default function TransporteChart({ data }: { data: TrpItem[] }) {
  const [tooltip, setTooltip] = useState<TooltipState>({
    visible: false, x: 0, y: 0, label: "", value: 0, color: "",
  });

  const showTip = (e: React.MouseEvent, label: string, value: number, color: string) => {
    setTooltip({ visible: true, x: e.clientX, y: e.clientY, label, value, color });
  };
  const moveTip  = (e: React.MouseEvent) => setTooltip(t => ({ ...t, x: e.clientX, y: e.clientY }));
  const hideTip  = () => setTooltip(t => ({ ...t, visible: false }));

  if (!data.length) return (
    <div style={{ color: "var(--text-muted)", fontSize: 11, textAlign: "center", padding: "20px 0" }}>
      Carregando...
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      <style>{`
        .trp-scroll::-webkit-scrollbar { width: 3px; }
        .trp-scroll::-webkit-scrollbar-track { background: transparent; }
        .trp-scroll::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }
        .trp-scroll::-webkit-scrollbar-thumb:hover { background: var(--accent); }
        .bar-seg-tip { cursor: default; transition: filter 0.15s; }
        .bar-seg-tip:hover { filter: brightness(1.4); }
      `}</style>

      {/* Tooltip */}
      {tooltip.visible && (
        <div style={{
          position: "fixed",
          left: tooltip.x + 14,
          top: tooltip.y - 32,
          background: "var(--bg-surface)",
          border: "1px solid var(--border)",
          borderRadius: 4,
          padding: "4px 8px",
          fontSize: 10,
          fontFamily: "var(--font-mono)",
          color: "var(--text-primary)",
          pointerEvents: "none",
          zIndex: 9999,
          whiteSpace: "nowrap",
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}>
          <span style={{ width: 7, height: 7, borderRadius: 1, background: tooltip.color, display: "inline-block" }} />
          <span style={{ color: "var(--text-muted)" }}>{tooltip.label}</span>
          <span style={{ color: tooltip.color, fontWeight: 600 }}>
            {tooltip.value.toLocaleString("pt-BR")}
          </span>
        </div>
      )}

      {/* Legenda */}
      <div style={{ display: "flex", gap: 12, marginBottom: 8 }}>
        {[
          { label: "Concluído", color: "var(--green)"  },
          { label: "Insucesso", color: "var(--red)"    },
          { label: "Pendente",  color: "var(--accent)" },
        ].map(({ label, color }) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 9, color: "var(--text-secondary)" }}>
            <span style={{ width: 8, height: 8, borderRadius: 1, background: color, display: "inline-block" }} />
            {label}
          </div>
        ))}
      </div>

      {/* Lista com scroll */}
      <div className="trp-scroll" style={{
        overflowY: "auto",
        maxHeight: "260px",
        display: "flex",
        flexDirection: "column",
        gap: 6,
        paddingRight: 6,
      }}>
        {data.map(item => {
          const conc  = Number(item.concluidos);
          const fail  = Number(item.insucesso);
          const pend  = Number(item.pendentes);
          const efic  = Number(item.eficiencia_pct);
          const total = conc + fail + pend;
          const pC    = Math.round((conc / total) * 100);
          const pF    = Math.round((fail / total) * 100);
          const pP    = 100 - pC - pF;

          return (
            <div key={item.NUMERO_DO_TRANSPORTE}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
                <span style={{
                  fontSize: 9, fontFamily: "var(--font-mono)", fontWeight: 600,
                  color: "var(--text-secondary)", letterSpacing: "0.5px",
                }}>
                  {item.NUMERO_DO_TRANSPORTE}
                </span>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{
                    fontSize: 9, fontFamily: "var(--font-mono)",
                    color: efic >= 95 ? "var(--green)" : efic >= 85 ? "var(--accent)" : "var(--red)",
                  }}>
                    {efic.toFixed(1)}%
                  </span>
                  <span style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>
                    {total.toLocaleString("pt-BR")}
                  </span>
                </div>
              </div>

              <div className="bar-track">
                <div
                  className="bar-seg bs-done bar-seg-tip"
                  style={{ width: `${pC}%` }}
                  onMouseEnter={e => showTip(e, "Concluído", conc, "var(--green)")}
                  onMouseMove={moveTip}
                  onMouseLeave={hideTip}
                >
                  {pC > 12 ? `${pC}%` : ""}
                </div>
                <div
                  className="bar-seg bs-fail bar-seg-tip"
                  style={{ width: `${pF}%` }}
                  onMouseEnter={e => showTip(e, "Insucesso", fail, "var(--red)")}
                  onMouseMove={moveTip}
                  onMouseLeave={hideTip}
                >
                  {pF > 8 ? `${pF}%` : ""}
                </div>
                <div
                  className="bar-seg bs-pend bar-seg-tip"
                  style={{ width: `${pP}%` }}
                  onMouseEnter={e => showTip(e, "Pendente", pend, "var(--accent)")}
                  onMouseMove={moveTip}
                  onMouseLeave={hideTip}
                >
                  {pP > 8 ? `${pP}%` : ""}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
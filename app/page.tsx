"use client";
import { useState, useEffect } from "react";
import KpiCard from "./components/KpiCard";
import PizzaChart from "./components/PizzaChart";
import TrpList from "./components/TrpList";

const DATA = {
  plan: 248, conc: 189, insc: 21, pend: 38, media: "12,4",
  trp: [
    { id: "TRP-001", conc: 42, fail: 5, pend: 8 },
    { id: "TRP-002", conc: 35, fail: 3, pend: 12 },
    { id: "TRP-003", conc: 28, fail: 6, pend: 4 },
    { id: "TRP-004", conc: 51, fail: 4, pend: 6 },
    { id: "TRP-005", conc: 18, fail: 2, pend: 5 },
    { id: "TRP-006", conc: 15, fail: 1, pend: 3 },
  ],
  itn: [
    { id: "ITN-SUL",    conc: 58, fail: 8, pend: 14 },
    { id: "ITN-NORTE",  conc: 47, fail: 5, pend: 9  },
    { id: "ITN-LESTE",  conc: 35, fail: 4, pend: 8  },
    { id: "ITN-OESTE",  conc: 30, fail: 3, pend: 5  },
    { id: "ITN-CENTRO", conc: 19, fail: 1, pend: 2  },
  ],
};

export default function LogTower() {
  const [isDark, setIsDark] = useState(true);
  const efic = Math.round((DATA.conc / DATA.plan) * 100);

  useEffect(() => {
    const saved = localStorage.getItem("theme") || "dark";
    setIsDark(saved === "dark");
    document.documentElement.setAttribute("data-theme", saved);
  }, []);

  const toggleTheme = () => {
    const next = isDark ? "light" : "dark";
    setIsDark(!isDark);
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
  };

  return (
    <div className="relative z-10">

      {/* NAV */}
      <nav className="lt-nav">
        <div className="flex items-center gap-3">
          <div className="lt-logo-box">
            <svg className="w-4 h-4 fill-black" viewBox="0 0 16 16">
              <path d="M2 4h9l3 3v5H2V4zm0-1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V6.5L11.5 3H2zm4.5 9a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm5 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z"/>
            </svg>
          </div>
          <span className="lt-brand">
            Log<span className="lt-brand-accent">Tower</span>
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="lt-live-badge">
            <span className="lt-pulse-dot" />
            LIVE
          </div>
          <button onClick={toggleTheme} className="lt-theme-btn">
            {isDark ? "🌙" : "☀️"}
          </button>
        </div>
      </nav>

      {/* HERO */}
      <div className="p-8 border-b border-[var(--border)] flex justify-between items-end">
        <div>
          <div className="font-mono text-[10px] text-[var(--accent)] tracking-[2px] uppercase mb-1">
            // central logística · torre de controle
          </div>
          <h1 className="font-condensed text-4xl font-bold uppercase text-[var(--text-primary)]">
            Eficiência de <span className="text-[var(--accent)]">Expedição</span>
          </h1>
          <p className="text-[var(--text-secondary)] text-xs mt-2 max-w-lg">
            Monitoramento da performance de entregas, transportadores e itinerários.
          </p>
        </div>
        <div className="flex gap-3">
          <div className="px-3 py-1.5 border border-[#3fb95059] bg-[#3fb9501a] text-[var(--green)] font-mono text-[11px] rounded">
            ▶ SETOR: EXPEDIÇÃO A
          </div>
          <div className="px-3 py-1.5 border border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-secondary)] font-mono text-[11px] rounded">
            📅 29/04/2026
          </div>
        </div>
      </div>

      {/* MAIN */}
      <main className="main">

        {/* KPI CARDS */}
        <div className="kpi-row">
          <KpiCard title="Planilhados"     value={DATA.plan}   unit="entregas no dia"       type="blue"   />
          <KpiCard title="Concluídos"      value={DATA.conc}   unit="entregues com sucesso" type="green"  />
          <KpiCard title="Insucesso"       value={DATA.insc}   unit="tentativas falhas"     type="red"    />
          <KpiCard title="Pendentes"       value={DATA.pend}   unit="em rota / aguardando"  type="amber"  />
          <KpiCard title="Média NF/Viagem" value={DATA.media}  unit="notas por viagem"      type="purple" />
          <KpiCard
            title="Eficiência"
            value={`${efic}%`}
            unit="concluído / planilhado"
            type="teal"
            efficiency={{
              label:  efic >= 95 ? "EXCELENTE" : efic >= 85 ? "ATENÇÃO" : "CRÍTICO",
              status: efic >= 95 ? "excelente" : efic >= 85 ? "atencao" : "critico",
            }}
          />
        </div>

        {/* MID ROW — pizza + transportadores + itinerários */}
        <div className="mid-row">
          {/* PIZZA */}
          <div className="panel">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <div className="panel-title" style={{ margin: 0 }}>Resultado</div>
              <span className="panel-badge">HOJE</span>
            </div>
            <PizzaChart data={DATA} />
          </div>

          {/* TRANSPORTADORES */}
          <div className="panel">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <div className="panel-title" style={{ margin: 0 }}>Por Veículo / Transportador</div>
              <span className="panel-badge">100% EMPILHADO</span>
            </div>
            <TrpList list={DATA.trp} />
          </div>

          {/* ITINERÁRIOS */}
          <div className="panel">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <div className="panel-title" style={{ margin: 0 }}>Por Itinerário</div>
              <span className="panel-badge">100% EMPILHADO</span>
            </div>
            <TrpList list={DATA.itn} />
          </div>
        </div>

      </main>
    </div>
  );
}
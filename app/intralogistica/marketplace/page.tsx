// app/intralogistica/marketplace/page.tsx
"use client";
import { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import * as XLSX from "xlsx";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

interface ApiData {
  totalRecebido: number;
  porArea: { Manaus: number; Interior: number; Interestadual: number };
  fornecedores: { nome: string; total: number }[];
  exportacao: {
    criado_em: string;
    numero_nota: string;
    chave: string;
    area: string;
    fornecedor: string;
  }[];
}

export default function Marketplace() {
  const [isDark, setIsDark]       = useState(true);
  const [data, setData]           = useState<ApiData | null>(null);
  const [loading, setLoading]     = useState(true);
  const [erro, setErro]           = useState<string | null>(null);
  const [ultimaAtt, setUltimaAtt] = useState("");
  const [dataSel, setDataSel]     = useState(new Date().toISOString().split("T")[0]);

  useEffect(() => {
    const saved = localStorage.getItem("theme") || "dark";
    setIsDark(saved === "dark");
    document.documentElement.setAttribute("data-theme", saved);
  }, []);

  const carregar = () => {
    setLoading(true);
    fetch(`/api/intralogistica/marketplace?data=${dataSel}`)
      .then(r => r.json())
      .then(json => { if (json.ok) setData(json); else setErro(json.error); })
      .catch(e => setErro(e.message))
      .finally(() => {
        setLoading(false);
        setUltimaAtt(new Date().toLocaleTimeString("pt-BR"));
      });
  };

  useEffect(() => {
    carregar();
    const intervalo = setInterval(carregar, 5 * 60 * 1000);
    return () => clearInterval(intervalo);
  }, [dataSel]);

  const toggleTheme = () => {
    const next = isDark ? "light" : "dark";
    setIsDark(!isDark);
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
  };

  const exportarExcel = () => {
    if (!(data?.exportacao?.length ?? 0)) return;
    const linhas = [
      ["Data/Hora", "Nota Fiscal", "Chave", "Área", "Fornecedor"],
      ...data!.exportacao.map(n => [
        n.criado_em,
        n.numero_nota,
        n.chave,
        n.area,
        n.fornecedor,
      ]),
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(linhas), "Notas");
    XLSX.writeFile(wb, `marketplace-${dataSel}.xlsx`);
  };

  const fornecedorChart = {
    labels: data?.fornecedores.map(f => f.nome) ?? [],
    datasets: [{
      label: "Notas",
      data: data?.fornecedores.map(f => f.total) ?? [],
      backgroundColor: "rgba(56,139,253,0.5)",
      borderColor: "#388bfd",
      borderWidth: 1,
      borderRadius: 4,
    }],
  };

  const chartOptions = {
    indexAxis: "y" as const,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: { label: (ctx: any) => ` ${ctx.raw} notas` },
      },
    },
    scales: {
      x: {
        ticks: { color: isDark ? "#8b949e" : "#57606a", font: { size: 10 } },
        grid: { color: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)" },
      },
      y: {
        ticks: { color: isDark ? "#8b949e" : "#57606a", font: { size: 10 } },
        grid: { display: false },
      },
    },
  };

  return (
    <div className="relative z-10">
      <Navbar isDark={isDark} onToggle={toggleTheme} ultimaAtualizacao={ultimaAtt} />

      <div className="p-8 border-b border-[var(--border)] flex justify-between items-end">
        <div>
          <div className="font-mono text-[10px] text-[var(--accent)] tracking-[2px] uppercase mb-1">
            // intralogística · marketplace
          </div>
          <h1 className="font-condensed text-4xl font-bold uppercase text-[var(--text-primary)]">
            Coleta <span className="text-[var(--accent)]">Marketplace</span>
          </h1>
          <p className="text-[var(--text-secondary)] text-xs mt-2">
            Recebimento do dia
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <input
            type="date"
            value={dataSel}
            onChange={e => setDataSel(e.target.value)}
            style={{
              background: "var(--bg-card)", border: "1px solid var(--border)",
              borderRadius: 6, padding: "6px 10px", cursor: "pointer",
              fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-secondary)",
              outline: "none",
            }}
          />
          <button onClick={carregar} style={{
            background: "var(--bg-card)", border: "1px solid var(--border)",
            borderRadius: 6, padding: "6px 14px", cursor: "pointer",
            fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-secondary)",
          }}>
            ↻ Atualizar
          </button>
          <button
            onClick={exportarExcel}
            disabled={!(data?.exportacao?.length ?? 0)}
            style={{
              background: "var(--bg-card)", border: "1px solid var(--border)",
              borderRadius: 6, padding: "6px 14px",
              cursor: (data?.exportacao?.length ?? 0) > 0 ? "pointer" : "not-allowed",
              fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--green)",
              opacity: (data?.exportacao?.length ?? 0) > 0 ? 1 : 0.4,
            }}
          >
            ↓ Exportar Excel
          </button>
        </div>
      </div>

      {erro && (
        <div className="mx-8 mt-4 px-4 py-3 rounded border border-[var(--red)] bg-[rgba(248,81,73,0.08)] text-[var(--red)] font-mono text-xs">
          ⚠ Erro: {erro}
        </div>
      )}

      <main className="main">

        {/* KPI CARDS */}
        <div className="kpi-row" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
          <div className="kpi-card k-blue">
            <div className="kpi-label">Total Recebido</div>
            <div className="kpi-val">{loading ? "—" : data?.totalRecebido.toLocaleString("pt-BR")}</div>
            <div className="kpi-unit">notas fiscais hoje</div>
          </div>
          <div className="kpi-card k-green">
            <div className="kpi-label">Manaus</div>
            <div className="kpi-val">{loading ? "—" : data?.porArea.Manaus.toLocaleString("pt-BR")}</div>
            <div className="kpi-unit">notas para Manaus</div>
          </div>
          <div className="kpi-card k-amber">
            <div className="kpi-label">Interior</div>
            <div className="kpi-val">{loading ? "—" : data?.porArea.Interior.toLocaleString("pt-BR")}</div>
            <div className="kpi-unit">notas para Interior</div>
          </div>
          <div className="kpi-card k-purple">
            <div className="kpi-label">Interestadual</div>
            <div className="kpi-val">{loading ? "—" : data?.porArea.Interestadual.toLocaleString("pt-BR")}</div>
            <div className="kpi-unit">notas interestaduais</div>
          </div>
        </div>

        {/* GRÁFICO FORNECEDORES */}
        <div className="panel">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <div className="panel-title" style={{ margin: 0 }}>Notas por Fornecedor</div>
            <span className="panel-badge">TOP 15 · {dataSel}</span>
          </div>
          {loading ? (
            <div style={{ height: 400, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", fontSize: 12 }}>
              Carregando...
            </div>
          ) : (
            <div style={{ height: Math.max(300, (data?.fornecedores.length ?? 0) * 28) }}>
              <Bar data={fornecedorChart} options={chartOptions as any} />
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
// app/components/intralogistica/GraficoFornecedores.tsx
"use client";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

interface GraficoFornecedoresProps {
  fornecedores: { nome: string; total: number }[];
  isDark: boolean;
  loading?: boolean;
  badge?: string;
  titulo?: string;
}

export default function GraficoFornecedores({
  fornecedores, isDark, loading, badge, titulo = "Notas por Fornecedor",
}: GraficoFornecedoresProps) {
  const chart = {
    labels: fornecedores.map(f => f.nome),
    datasets: [{
      label: "Notas",
      data: fornecedores.map(f => f.total),
      backgroundColor: "rgba(56,139,253,0.5)",
      borderColor: "#388bfd",
      borderWidth: 1,
      borderRadius: 4,
    }],
  };

  const options = {
    indexAxis: "y" as const,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.raw} notas` } },
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
    <div className="panel">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <div className="panel-title" style={{ margin: 0 }}>{titulo}</div>
        {badge && <span className="panel-badge">{badge}</span>}
      </div>
      {loading ? (
        <div style={{ height: 400, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", fontSize: 12 }}>
          Carregando...
        </div>
      ) : (
        <div style={{ height: Math.max(300, fornecedores.length * 28) }}>
          <Bar data={chart} options={options as any} />
        </div>
      )}
    </div>
  );
}
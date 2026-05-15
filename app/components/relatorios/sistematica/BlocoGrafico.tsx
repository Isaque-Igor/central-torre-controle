// app/components/BlocoGrafico.tsx
"use client";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const MESES = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];

interface MesData {
  ano: string;
  mes: string;
  [key: string]: string;
}

interface BlocoGraficoProps {
  titulo: string;           // ex: "Varejo"
  campoCapital: string | string[];     // ex: "varejo_capital"
  campoInterior: string | string[];    // ex: "varejo_interior"
  data: MesData[];
  mesSel: number;
  anoSel: number;
  isDark: boolean;
  loading: boolean;
}

function pct(atual: number, ant: number | null) {
  if (!ant) return null;
  return Math.round(((atual - ant) / ant) * 100);
}

function pctLabel(v: number | null) {
  if (v === null) return "—";
  return `${v >= 0 ? "▲" : "▼"} ${Math.abs(v)}%`;
}

function pctColor(v: number | null) {
  if (v === null) return "var(--text-muted)";
  return v >= 0 ? "var(--green)" : "var(--red)";
}

function getCssVar(name: string) {
  if (typeof window === "undefined") return "#fff";
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

export default function BlocoGrafico({
  titulo, campoCapital, campoInterior,
  data, mesSel, anoSel, isDark, loading,
}: BlocoGraficoProps) {

  const get = (ano: number, mes: number, campo: string | string[]) => {
    const row = data.find(d => d.ano === String(ano) && d.mes === String(mes));
    if (!row) return null;
    if (Array.isArray(campo)) {
      return campo.reduce((acc, c) => acc + Number(row[c] ?? 0), 0);
    }
    return Number(row[campo]);
  };

  const dadosAno = (ano: number, campo: string | string[]) =>
    Array.from({ length: 12 }, (_, i) => get(ano, i + 1, campo));

  const mesAnteriorLabel = mesSel - 1 === 0
    ? `Dez/${anoSel - 1}`
    : `${MESES[mesSel - 2]}/${anoSel}`;

  const labelPlugin = {
    id: `barLabels_${campoCapital}`,
    afterDatasetsDraw(chart: any) {
      const { ctx, data: cd } = chart;
      const color = getCssVar("--chart-label-color");
      cd.datasets.forEach((ds: any, di: number) => {
        chart.getDatasetMeta(di).data.forEach((bar: any, i: number) => {
          const val = ds.data[i];
          if (!val) return;
          const h = bar.base - bar.y;
          if (h < 25) return;
          ctx.save();
          ctx.translate(bar.x, bar.y + h / 2);
          ctx.rotate(-Math.PI / 2);
          ctx.font = "bold 16px monospace"; // AUMENTAR FONTE DO DADO DENTRO DO BARRA
          ctx.fillStyle = color;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(Number(val).toLocaleString("pt-BR"), 0, 0);
          ctx.restore();
        });
      });
    },
  };

  function buildChart(campo: string | string[]) {
    const yoyLabels = Array.from({ length: 12 }, (_, i) =>
      pct(get(anoSel, i + 1, campo) ?? 0, get(anoSel - 1, i + 1, campo))
    );

    const yoyPlugin = {
      id: `yoyLabels_${campo}`,
      afterDatasetsDraw(chart: any) {
        const { ctx } = chart;
        const pos = getCssVar("--chart-yoy-pos");
        const neg = getCssVar("--chart-yoy-neg");
        chart.getDatasetMeta(1).data.forEach((bar: any, i: number) => {
          const v = yoyLabels[i];
          if (v === null || !get(anoSel, i + 1, campo)) return;
          ctx.save();
          ctx.font = "bold 15px monospace"; // AUMENTAR FONTE DO YOY
          ctx.fillStyle = v >= 0 ? pos : neg;
          ctx.textAlign = "center";
          ctx.fillText(`${v >= 0 ? "▲" : "▼"}${Math.abs(v)}%`, bar.x, bar.y - 22); // bar.y para mudar o espaço entre yoy e barra
          ctx.restore();
        });
      },
    };

    return {
      chartData: {
        labels: MESES,
        datasets: [
          {
            label: String(anoSel - 1),
            data: dadosAno(anoSel - 1, campo),
            backgroundColor: "rgba(56,139,253,0.45)",
            borderColor: "#388bfd",
            borderWidth: 1, borderRadius: 3,
          },
          {
            label: String(anoSel),
            data: dadosAno(anoSel, campo),
            backgroundColor: "rgba(63,185,80,0.45)",
            borderColor: "#3fb950",
            borderWidth: 1, borderRadius: 3,
          },
        ],
      },
      plugins: [yoyPlugin, labelPlugin],
    };
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    layout: { padding: { top: 40 } }, // padding top  para yoy
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: { color: isDark ? "#8b949e" : "#57606a", font: { size: 11 }, boxWidth: 12, padding: 16 },
      },
      tooltip: {
        callbacks: { label: (ctx: any) => ` ${ctx.dataset.label}: ${Number(ctx.raw).toLocaleString("pt-BR")}` },
      },
    },
    scales: {
      x: { ticks: { color: isDark ? "#8b949e" : "#57606a", font: { size: 10 } }, grid: { color: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)" } },
      y: { ticks: { color: isDark ? "#8b949e" : "#57606a", font: { size: 10 }, callback: (v: any) => Number(v).toLocaleString("pt-BR") }, grid: { color: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)" } },
    },
  };

  const capAtual  = get(anoSel, mesSel, campoCapital);
  const capAntYoy = get(anoSel - 1, mesSel, campoCapital);
  const capAntMxM = get(anoSel, mesSel - 1 === 0 ? 12 : mesSel - 1, campoCapital);
  const intAtual  = get(anoSel, mesSel, campoInterior);
  const intAntYoy = get(anoSel - 1, mesSel, campoInterior);
  const intAntMxM = get(anoSel, mesSel - 1 === 0 ? 12 : mesSel - 1, campoInterior);

  const capYoy = pct(capAtual ?? 0, capAntYoy);
  const capMxM = pct(capAtual ?? 0, capAntMxM);
  const intYoy = pct(intAtual ?? 0, intAntYoy);
  const intMxM = pct(intAtual ?? 0, intAntMxM);

  const cap = buildChart(campoCapital);
  const int = buildChart(campoInterior);

  return (
    <div>
      {/* Título do bloco */}
      <h3 style={{
        fontFamily: "var(--font-condensed)", fontSize: 18, fontWeight: 700,
        textTransform: "uppercase", color: "var(--text-secondary)",
        letterSpacing: 2, marginBottom: 12, marginTop: 0,
        borderLeft: "3px solid var(--accent)", paddingLeft: 10,
      }}>
        {titulo}
      </h3>

      <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 16 }}>

        {/* CARDS */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

          {/* CAPITAL */}
          <div className="panel" style={{ padding: "12px 14px" }}>
            <div className="card-metric-label" style={{ color: "var(--blue)" }}>Capital</div>
            <div style={{ fontSize: 26, fontWeight: 700, fontFamily: "var(--font-condensed)", color: "var(--blue)", marginBottom: 8 }}>
              {loading ? "—" : (capAtual ?? 0).toLocaleString("pt-BR")}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <div className="card-metric-row">
                <span style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>YoY vs {MESES[mesSel-1]}/{anoSel-1}</span>
                <span style={{ color: pctColor(capYoy), fontFamily: "var(--font-mono)", fontWeight: 600 }}>{pctLabel(capYoy)}</span>
              </div>
              <div className="card-metric-row">
                <span style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>MxM vs {mesAnteriorLabel}</span>
                <span style={{ color: pctColor(capMxM), fontFamily: "var(--font-mono)", fontWeight: 600 }}>{pctLabel(capMxM)}</span>
              </div>
            </div>
          </div>

          {/* INTERIOR */}
          <div className="panel" style={{ padding: "12px 14px" }}>
            <div className="card-metric-label" style={{ color: "var(--green)" }}>Interior</div>
            <div style={{ fontSize: 26, fontWeight: 700, fontFamily: "var(--font-condensed)", color: "var(--green)", marginBottom: 8 }}>
              {loading ? "—" : (intAtual ?? 0).toLocaleString("pt-BR")}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <div className="card-metric-row">
                <span style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>YoY vs {MESES[mesSel-1]}/{anoSel-1}</span>
                <span style={{ color: pctColor(intYoy), fontFamily: "var(--font-mono)", fontWeight: 600 }}>{pctLabel(intYoy)}</span>
              </div>
              <div className="card-metric-row">
                <span style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>MxM vs {mesAnteriorLabel}</span>
                <span style={{ color: pctColor(intMxM), fontFamily: "var(--font-mono)", fontWeight: 600 }}>{pctLabel(intMxM)}</span>
              </div>
            </div>
          </div>

        </div>

        {/* GRÁFICOS */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="panel">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <div className="panel-title" style={{ margin: 0 }}>{titulo} · Capital</div>
              <span className="panel-badge">{anoSel - 1} vs {anoSel}</span>
            </div>
            {loading ? (
              <div style={{ height: 200, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)" }}>Carregando...</div>
            ) : (
              <div style={{ height: 200 }}>
                <Bar data={cap.chartData} options={chartOptions as any} plugins={cap.plugins as any} />
              </div>
            )}
          </div>

          <div className="panel">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <div className="panel-title" style={{ margin: 0 }}>{titulo} · Interior</div>
              <span className="panel-badge">{anoSel - 1} vs {anoSel}</span>
            </div>
            {loading ? (
              <div style={{ height: 200, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)" }}>Carregando...</div>
            ) : (
              <div style={{ height: 200 }}>
                <Bar data={int.chartData} options={chartOptions as any} plugins={int.plugins as any} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
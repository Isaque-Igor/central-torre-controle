// app/relatorios/reuniao-sistematica/page.tsx
"use client";
import { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import BlocoGrafico from "../../components/relatorios/sistematica/BlocoGrafico";
import NavInterna from "../../components/relatorios/sistematica/NavInterna";
import Carrossel from "../../components/relatorios/sistematica/Carrossel";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);


const MESES = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];

interface MesData {
  ano: string; mes: string; [key: string]: string;
}

function ontemISO() {
  const d = new Date();
  return d.toISOString().split("T")[0];
}

export default function ReuniaoSistematica() {
  const [isDark, setIsDark]   = useState(true);
  const [data, setData]       = useState<MesData[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro]       = useState<string | null>(null);

  const anoAtual    = new Date().getFullYear();
  const anoAnterior = anoAtual - 1;
  const mesAtual    = new Date().getMonth() + 1;

  const [mesSel, setMesSel] = useState(mesAtual);
  const [anoSel, setAnoSel] = useState(anoAtual);

  const [abaAtiva, setAbaAtiva] = useState("entrega-cliente");

  const ABAS = [
    { label: "Entrega Cliente", id: "entrega-cliente" },
    { label: "On Time Delivery", id: "otd" },
    { label: "On Time Accuracy", id: "ota" },
  ];

  useEffect(() => {
    const saved = localStorage.getItem("theme") || "dark";
    setIsDark(saved === "dark");
    document.documentElement.setAttribute("data-theme", saved);
  }, []);

  useEffect(() => {
    setLoading(true);
    setErro(null);
    fetch(`/api/reuniao-sistematica?ano=${anoSel}`)
      .then(r => r.json())
      .then(json => { if (json.ok) setData(json.data); else setErro(json.error); })
      .catch(e => setErro(e.message))
      .finally(() => setLoading(false));
  }, [anoSel]);

  const toggleTheme = () => {
    const next = isDark ? "light" : "dark";
    setIsDark(!isDark);
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
  };

  const blocoProps = { data, mesSel, anoSel, isDark, loading };

  const abas = [
    {
      id: "entrega-cliente",
      titulo: "Entrega Cliente",
      subtitulo: "Performance de Pedidos",
      conteudo: (
        <>
          <BlocoGrafico {...blocoProps} titulo="Consolidado Varejo + Marketplace"
            campoCapital={["varejo_capital", "mktp_capital"]}
            campoInterior={["varejo_interior", "mktp_interior"]}
          />
          <BlocoGrafico {...blocoProps} titulo="Varejo"      campoCapital="varejo_capital"   campoInterior="varejo_interior"   />
          <BlocoGrafico {...blocoProps} titulo="Marketplace" campoCapital="mktp_capital"     campoInterior="mktp_interior"     />
          <BlocoGrafico {...blocoProps} titulo="Mercado"     campoCapital="mercado_capital"  campoInterior="mercado_interior"  />
          <BlocoGrafico {...blocoProps} titulo="Roraima"     campoCapital="roraima_capital"  campoInterior="roraima_interior"  />
          <BlocoGrafico {...blocoProps} titulo="Rondônia"    campoCapital="rondonia_capital" campoInterior="rondonia_interior" />
          <BlocoGrafico {...blocoProps} titulo="Acre"        campoCapital="acre_capital"     campoInterior="interior_acre"     />
        </>
      ),
    },
    {
      id: "otd",
      titulo: "On Time Delivery",
      subtitulo: "Entregas no Prazo",
      conteudo: <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 300, color: "var(--text-muted)", fontFamily: "var(--font-mono)", fontSize: 13 }}>Em construção</div>,
    },
    {
      id: "ota",
      titulo: "On Time Assembly",
      subtitulo: "Montagens no Prazo",
      conteudo: <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 300, color: "var(--text-muted)", fontFamily: "var(--font-mono)", fontSize: 13 }}>Em construção</div>,
    },
  ];

  return (
    <div className="relative z-10">
      <Navbar isDark={isDark} onToggle={toggleTheme} />

      {/* HERO */}
      <div className="p-8 border-b border-[var(--border)] flex justify-between items-end">
        <div>
          <div className="font-mono text-[10px] text-[var(--accent)] tracking-[2px] uppercase mb-1">
            // relatórios · geral
          </div>
          <h1 className="font-condensed text-4xl font-bold uppercase text-[var(--text-primary)]">
            Reunião <span className="text-[var(--accent)]">Sistemática</span>
          </h1>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <select value={mesSel} onChange={e => setMesSel(Number(e.target.value))}
            style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 4, padding: "6px 10px", fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-secondary)", cursor: "pointer", outline: "none" }}>
            {MESES.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
          </select>
          <input
              type="number"
              value={anoSel}
              onChange={e => setAnoSel(Number(e.target.value))}
              style={{
                background: "var(--bg-card)", border: "1px solid var(--border)",
                borderRadius: 4, padding: "6px 10px", fontSize: 11,
                fontFamily: "var(--font-mono)", color: "var(--text-secondary)",
                cursor: "text", outline: "none", width: 70,
              }}
            />
        </div>
      </div>

      {erro && (
        <div className="mx-8 mt-4 px-4 py-3 rounded border border-[var(--red)] bg-[rgba(248,81,73,0.08)] text-[var(--red)] font-mono text-xs">
          ⚠ Erro: {erro}
        </div>
      )}

      
      <NavInterna abas={ABAS} abaAtiva={abaAtiva} onChange={setAbaAtiva} />

      <Carrossel abas={abas} abaAtiva={abaAtiva} />

    </div>
  );
}
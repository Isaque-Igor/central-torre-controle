// app/intralogistica/page.tsx
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../components/Navbar";

const AREAS = [
  {
    id: "marketplace",
    titulo: "Marketplace",
    descricao: "Monitoramento das operações intralogísticas do canal Marketplace.",
    tags: ["Recebimento", "Separação", "Expedição"],
    ativo: true,
  },
  {
    id: "expedicao-manaus",
    titulo: "Expedição Manaus",
    descricao: "Controle das operações de expedição para a capital Manaus.",
    tags: ["Expedição", "Capital", "Manaus"],
    ativo: false,
  },
  {
    id: "expedicao-interior",
    titulo: "Expedição Interior",
    descricao: "Acompanhamento das expedições para o interior do Amazonas e demais estados.",
    tags: ["Expedição", "Interior", "Fluvial"],
    ativo: false,
  },
  {
    id: "expedicao-interestadual",
    titulo: "Expedição Interestadual",
    descricao: "Gestão das operações de expedição interestaduais.",
    tags: ["Expedição", "Interestadual", "Logística"],
    ativo: false,
  },
];

export default function Intralogistica() {
  const [isDark, setIsDark] = useState(true);
  const [busca, setBusca] = useState("");
  const router = useRouter();

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

  const filtradas = AREAS.filter(a =>
    a.titulo.toLowerCase().includes(busca.toLowerCase()) ||
    a.descricao.toLowerCase().includes(busca.toLowerCase()) ||
    a.tags.some(t => t.toLowerCase().includes(busca.toLowerCase()))
  );

  return (
    <div className="relative z-10">
      <Navbar isDark={isDark} onToggle={toggleTheme} />

      {/* HERO */}
      <div className="p-8 border-b border-[var(--border)] flex justify-between items-end">
        <div>
          <div className="font-mono text-[10px] text-[var(--accent)] tracking-[2px] uppercase mb-1">
            // central logística · intralogística
          </div>
          <h1 className="font-condensed text-4xl font-bold uppercase text-[var(--text-primary)]">
            Intra<span className="text-[var(--accent)]">logística</span>
          </h1>
          <p className="text-[var(--text-secondary)] text-xs mt-2 max-w-lg">
            Selecione uma área para visualizar os indicadores operacionais.
          </p>
        </div>

        {/* BUSCA */}
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          background: "var(--bg-card)", border: "1px solid var(--border)",
          borderRadius: 6, padding: "6px 12px", minWidth: 260,
        }}>
          <span style={{ color: "var(--text-muted)", fontSize: 12 }}>🔍</span>
          <input
            type="text"
            placeholder="Buscar área..."
            value={busca}
            onChange={e => setBusca(e.target.value)}
            style={{
              background: "transparent", border: "none", outline: "none",
              fontSize: 12, fontFamily: "var(--font-mono)",
              color: "var(--text-secondary)", width: "100%",
            }}
          />
        </div>
      </div>

      <main className="main">
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: 16,
        }}>
          {filtradas.map(area => (
            <div
              key={area.id}
              onClick={() => area.ativo && router.push(`/intralogistica/${area.id}`)}
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
                borderRadius: 8, padding: "20px",
                cursor: area.ativo ? "pointer" : "not-allowed",
                opacity: area.ativo ? 1 : 0.5,
                transition: "border-color 0.15s, transform 0.15s",
                position: "relative", overflow: "hidden",
              }}
              onMouseEnter={e => {
                if (area.ativo) {
                  (e.currentTarget as HTMLElement).style.borderColor = "var(--accent)";
                  (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
                }
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
                (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
              }}
            >
              {/* Barra no topo */}
              <div style={{
                position: "absolute", top: 0, left: 0, right: 0, height: 2,
                background: area.ativo ? "var(--accent)" : "var(--border)",
              }} />

              {/* Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                <span style={{ fontSize: 9, fontFamily: "var(--font-mono)", fontWeight: 600, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Intralogística
                </span>
                {area.ativo ? (
                  <span style={{ fontSize: 9, fontFamily: "var(--font-mono)", padding: "2px 6px", borderRadius: 3, background: "rgba(63,185,80,0.12)", color: "var(--green)", border: "1px solid rgba(63,185,80,0.3)" }}>
                    DISPONÍVEL
                  </span>
                ) : (
                  <span style={{ fontSize: 9, fontFamily: "var(--font-mono)", padding: "2px 6px", borderRadius: 3, background: "rgba(74,85,104,0.2)", color: "var(--text-muted)", border: "1px solid var(--border)" }}>
                    EM BREVE
                  </span>
                )}
              </div>

              {/* Título */}
              <div className="font-condensed" style={{ fontSize: 20, fontWeight: 700, textTransform: "uppercase", color: "var(--text-primary)", letterSpacing: 1, marginBottom: 8 }}>
                {area.titulo}
              </div>

              {/* Descrição */}
              <p style={{ fontSize: 11, color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: 14 }}>
                {area.descricao}
              </p>

              {/* Tags */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                {area.tags.map(tag => (
                  <span key={tag} style={{ fontSize: 9, fontFamily: "var(--font-mono)", padding: "2px 6px", borderRadius: 3, background: "rgba(240,165,0,0.08)", color: "var(--text-muted)", border: "1px solid rgba(240,165,0,0.15)" }}>
                    {tag}
                  </span>
                ))}
              </div>

              {area.ativo && (
                <div style={{ position: "absolute", bottom: 16, right: 16, color: "var(--accent)", fontSize: 16, opacity: 0.5 }}>
                  →
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
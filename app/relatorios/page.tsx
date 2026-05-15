// app/relatorios/page.tsx
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../components/Navbar";

const RELATORIOS = [
  {
    id: "reuniao-sistematica",
    titulo: "Reunião Sistemática",
    descricao: "Análise de OTD, OTA e performance operacional para reuniões de gestão.",
    categoria: "Geral",
    tags: ["OTD", "OTA", "Performance", "Gestão"],
    ativo: true,
  },
  {
    id: "ocorrencias",
    titulo: "Ocorrências",
    descricao: "Análise de insucessos, motivos e tendências de não entrega.",
    categoria: "Expedição",
    tags: ["Insucesso", "Motivos", "Tendência"],
    ativo: false,
  },
  {
    id: "produtividade",
    titulo: "Produtividade",
    descricao: "Performance por motorista, itinerário e transportadora.",
    categoria: "Expedição",
    tags: ["Motorista", "Itinerário", "Transportadora"],
    ativo: false,
  },
  {
    id: "sla",
    titulo: "SLA de Entrega",
    descricao: "Cumprimento de prazo por região, produto e canal de venda.",
    categoria: "Expedição",
    tags: ["SLA", "Prazo", "Região"],
    ativo: false,
  },
];

const COR_CATEGORIA: Record<string, string> = {
  "Expedição": "var(--accent)",
  "Armazenagem": "var(--blue)",
  "Recebimento": "var(--purple)",
};

export default function Relatorios() {
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

  const filtrados = RELATORIOS.filter(r =>
    r.titulo.toLowerCase().includes(busca.toLowerCase()) ||
    r.descricao.toLowerCase().includes(busca.toLowerCase()) ||
    r.tags.some(t => t.toLowerCase().includes(busca.toLowerCase()))
  );

  return (
    <div className="relative z-10">
      <Navbar isDark={isDark} onToggle={toggleTheme} />

      {/* HERO */}
      <div className="p-8 border-b border-[var(--border)] flex justify-between items-end">
        <div>
          <div className="font-mono text-[10px] text-[var(--accent)] tracking-[2px] uppercase mb-1">
            // central logística · relatórios
          </div>
          <h1 className="font-condensed text-4xl font-bold uppercase text-[var(--text-primary)]">
            Catálogo de <span className="text-[var(--accent)]">Relatórios</span>
          </h1>
          <p className="text-[var(--text-secondary)] text-xs mt-2 max-w-lg">
            Selecione um relatório para visualizar análises detalhadas da operação.
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
            placeholder="Buscar relatório..."
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
        {/* GRID DE CARDS */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: 16,
        }}>
          {filtrados.map(rel => (
            <div
              key={rel.id}
              onClick={() => rel.ativo && router.push(`/relatorios/${rel.id}`)}
              style={{
                background: "var(--bg-card)",
                border: `1px solid ${rel.ativo ? "var(--border)" : "var(--border)"}`,
                borderRadius: 8,
                padding: "20px",
                cursor: rel.ativo ? "pointer" : "not-allowed",
                opacity: rel.ativo ? 1 : 0.5,
                transition: "border-color 0.15s, transform 0.15s",
                position: "relative",
                overflow: "hidden",
              }}
              onMouseEnter={e => {
                if (rel.ativo) {
                  (e.currentTarget as HTMLElement).style.borderColor = "var(--accent)";
                  (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
                }
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
                (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
              }}
            >
              {/* Barra colorida no topo */}
              <div style={{
                position: "absolute", top: 0, left: 0, right: 0, height: 2,
                background: rel.ativo ? COR_CATEGORIA[rel.categoria] ?? "var(--accent)" : "var(--border)",
              }} />

              {/* Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                <span className="rel-categoria" style={{ color: COR_CATEGORIA[rel.categoria] ?? "var(--accent)" }}>
                  {rel.categoria}
                </span>
                {rel.ativo ? (
                  <span style={{
                    fontSize: 9, fontFamily: "var(--font-mono)",
                    padding: "2px 6px", borderRadius: 3,
                    background: "rgba(63,185,80,0.12)",
                    color: "var(--green)",
                    border: "1px solid rgba(63,185,80,0.3)",
                  }}>
                    DISPONÍVEL
                  </span>
                ) : (
                  <span style={{
                    fontSize: 9, fontFamily: "var(--font-mono)",
                    padding: "2px 6px", borderRadius: 3,
                    background: "rgba(74,85,104,0.2)",
                    color: "var(--text-muted)",
                    border: "1px solid var(--border)",
                  }}>
                    EM BREVE
                  </span>
                )}
              </div>

              {/* Título */}
              <div className="font-condensed" style={{
                fontSize: 20, fontWeight: 700, textTransform: "uppercase",
                color: "var(--text-primary)", letterSpacing: 1, marginBottom: 8,
              }}>
                {rel.titulo}
              </div>

              {/* Descrição */}
              <p style={{
                fontSize: 11, color: "var(--text-secondary)",
                lineHeight: 1.5, marginBottom: 14,
              }}>
                {rel.descricao}
              </p>

              {/* Tags */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                {rel.tags.map(tag => (
                  <span key={tag} style={{
                    fontSize: 9, fontFamily: "var(--font-mono)",
                    padding: "2px 6px", borderRadius: 3,
                    background: "rgba(240,165,0,0.08)",
                    color: "var(--text-muted)",
                    border: "1px solid rgba(240,165,0,0.15)",
                  }}>
                    {tag}
                  </span>
                ))}
              </div>

              {/* Seta */}
              {rel.ativo && (
                <div style={{
                  position: "absolute", bottom: 16, right: 16,
                  color: "var(--accent)", fontSize: 16, opacity: 0.5,
                }}>
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
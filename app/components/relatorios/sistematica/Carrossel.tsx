// app/components/relatorios/sistematica/Carrossel.tsx
"use client";
import { ReactNode } from "react";

interface AbaConteudo {
  id: string;
  titulo: string;
  subtitulo: string;
  conteudo: ReactNode;
}

interface CarrosselProps {
  abas: AbaConteudo[];
  abaAtiva: string;
}

export default function Carrossel({ abas, abaAtiva }: CarrosselProps) {
  const idx = abas.findIndex(a => a.id === abaAtiva);

  return (
    <div style={{ overflow: "hidden" }}>
      <div style={{
        display: "flex",
        transform: `translateX(-${idx * 100}%)`,
        transition: "transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
      }}>
        {abas.map(aba => (
          <div key={aba.id} style={{ minWidth: "100%", padding: "18px 32px" }}>
            <h1 className="rel-secao-titulo">{aba.titulo}</h1>
            <h2 className="rel-secao-subtitulo">{aba.subtitulo}</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
              {aba.conteudo}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
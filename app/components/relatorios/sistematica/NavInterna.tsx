// app/components/relatorios/sistematica/NavInterna.tsx
"use client";

interface Aba {
  label: string;
  id: string;
}

interface NavInternaProps {
  abas: Aba[];
  abaAtiva: string;
  onChange: (id: string) => void;
}

export default function NavInterna({ abas, abaAtiva, onChange }: NavInternaProps) {
  return (
    <div className="rel-nav">
      {abas.map(aba => (
        <button
          key={aba.id}
          className={`rel-nav-btn${abaAtiva === aba.id ? " ativa" : ""}`}
          onClick={() => onChange(aba.id)}
        >
          {aba.label}
        </button>
      ))}
    </div>
  );
}
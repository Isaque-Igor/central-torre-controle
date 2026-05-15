// app/components/Navbar.tsx
"use client";
import { color } from "chart.js/helpers";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavbarProps {
  isDark: boolean;
  onToggle: () => void;
  ultimaAtualizacao?: string;
}

const LINKS = [
  { label: "Expedição",     href: "/",           ativo: true  },
  { label: "Intralogística", href: "/intralogistica", ativo: false },
  { label: "Armazenagem",   href: "/armazenagem", ativo: false },
  { label: "Recebimento",   href: "/recebimento", ativo: false },
  { label: "Relatórios",    href: "/relatorios",  ativo: true  },
];

export default function Navbar({ isDark, onToggle, ultimaAtualizacao }: NavbarProps) {
  const pathname = usePathname();

  return (
    <nav className="lt-nav">
      <div className="flex items-center gap-3">
        <img
          src={isDark ? "/logo-light.png" : "/logo-dark.png"}
          alt="Logo"
          style={{ height: 55, width: "auto" }}
        />
        <span className="lt-brand">
          <span style={{ color:'#C32319' }}>Torre</span>de<span className="lt-brand-accent">Controle</span>
        </span>
      </div>

      {/* LINKS CENTRAIS */}
      <div className="flex items-center gap-1">
        {LINKS.map(link => {
          const isActive = pathname === link.href;
          return link.ativo ? (
            <Link
              key={link.href}
              href={link.href}
              className="font-mono text-[11px] px-4 py-1.5 rounded uppercase tracking-wider transition-all"
              style={{
                background:  isActive ? "rgba(240,165,0,0.15)" : "transparent",
                borderBottom: isActive ? "2px solid var(--accent)" : "2px solid transparent",
                color:       isActive ? "var(--accent)" : "var(--text-secondary)",
                borderRadius: 0,
              }}
            >
              {link.label}
            </Link>
          ) : (
            <span
              key={link.href}
              className="font-mono text-[11px] px-4 py-1.5 uppercase tracking-wider"
              style={{
                color:  "var(--text-muted)",
                cursor: "not-allowed",
                borderBottom: "2px solid transparent",
              }}
              title="Em breve"
            >
              {link.label}
            </span>
          );
        })}
      </div>

      <div className="flex items-center gap-4">
        <div className="lt-live-badge">
          <span className="lt-pulse-dot" />
          LIVE
          {ultimaAtualizacao && (
            <span style={{ color: "var(--text-muted)", marginLeft: 4 }}>
              {ultimaAtualizacao}
            </span>
          )}
        </div>
        <button onClick={onToggle} className="lt-theme-btn">
          {isDark ? "🌙" : "☀️"}
        </button>
      </div>
    </nav>
  );
}
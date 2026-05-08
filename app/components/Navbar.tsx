//Navbar.tsx
"use client";

interface NavbarProps {
  theme: string;
  onToggle: () => void;
}

export default function Navbar({ theme, onToggle }: NavbarProps) {
  return (
    <nav className="lt-nav">
      <div className="flex items-center gap-2">
        <div className="lt-logo-box">
          <span className="font-bold text-black text-xs">LT</span>
        </div>
        <div className="lt-brand">
          Control<span className="lt-brand-accent">Tower</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="lt-live-badge">
          <span className="lt-pulse-dot" />
          LIVE
        </div>
        <button onClick={onToggle} className="lt-theme-btn">
          {theme === "dark" ? "🌙" : "☀️"}
        </button>
      </div>
    </nav>
  );
}
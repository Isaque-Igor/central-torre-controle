// app/components/intralogistica/KpiHero.tsx
"use client";

interface KpiHeroProps {
  label: string;
  value: string | number;
  unit?: string;
  cor?: "blue" | "green" | "amber" | "purple" | "red" | "teal";
  loading?: boolean;
}

export default function KpiHero({ label, value, unit, cor = "blue", loading }: KpiHeroProps) {
  return (
    <div style={{ maxWidth: 280, marginBottom: 16 }}>
      <div className={`kpi-card k-${cor}`}>
        <div className="kpi-label">{label}</div>
        <div className="kpi-val">{loading ? "—" : value}</div>
        {unit && <div className="kpi-unit">{unit}</div>}
      </div>
    </div>
  );
}
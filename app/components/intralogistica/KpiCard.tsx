// app/components/intralogistica/KpiCard.tsx
"use client";

interface KpiCardProps {
  label: string;
  value: string | number;
  unit?: string;
  cor?: "blue" | "green" | "amber" | "purple" | "red" | "teal";
  largura?: number | string;
  loading?: boolean;
}

export default function KpiCard({ label, value, unit, cor = "blue", largura, loading }: KpiCardProps) {
  return (
    <div className={`kpi-card k-${cor}`} style={largura ? { maxWidth: largura, width: "100%" } : undefined}>
      <div className="kpi-label">{label}</div>
      <div className="kpi-val">{loading ? "—" : value}</div>
      {unit && <div className="kpi-unit">{unit}</div>}
    </div>
  );
}
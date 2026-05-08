//KpiCard.tsx
"use client";

interface KpiCardProps {
  title: string;
  value: string | number;
  unit: string;
  type: 'blue' | 'green' | 'red' | 'amber' | 'purple' | 'teal';
  efficiency?: {
    label: string;
    status: 'excelente' | 'atencao' | 'critico';
  };
}

export default function KpiCard({ title, value, unit, type, efficiency }: KpiCardProps) {
  return (
    <div className={`kpi-card k-${type}`}>
      {/* O ícone agora é controlado puramente pelo CSS do seu globals.css */}
      <div className="kpi-label">{title}</div>
      <div className="kpi-val">{value}</div>
      <div className="kpi-unit">{unit}</div>
      {efficiency && (
        <div className={`eff-badge ${efficiency.status}`}>
          {efficiency.label}
        </div>
      )}
    </div>
  );
}
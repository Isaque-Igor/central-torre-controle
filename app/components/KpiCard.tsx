// app/components/KpiCard.tsx
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
  loading?: boolean;
}

export default function KpiCard({ title, value, unit, type, efficiency, loading }: KpiCardProps) {
  return (
    <div className={`kpi-card k-${type}`}>
      <div className="kpi-label">{title}</div>
      {loading ? (
        <div className="kpi-val" style={{ opacity: 0.3, fontSize: 20 }}>—</div>
      ) : (
        <div className="kpi-val">{value}</div>
      )}
      <div className="kpi-unit">{unit}</div>
      {efficiency && !loading && (
        <div className={`eff-badge ${efficiency.status}`}>
          {efficiency.label}
        </div>
      )}
    </div>
  );
}
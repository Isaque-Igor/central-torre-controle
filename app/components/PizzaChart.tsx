//PizzaChart.tsx
"use client";
import { Chart as ChartJS, ArcElement, Tooltip } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip);

export default function PizzaChart({ data }: { data: any }) {
  const pC = Math.round((data.conc / data.plan) * 100);
  const pI = Math.round((data.insc / data.plan) * 100);
  const pP = 100 - pC - pI;

  return (
    <div>
      <div style={{ position: 'relative', width: '100%', height: '130px' }}>
        <Doughnut
          data={{
            labels: ['Sucesso', 'Insucesso', 'Pendente'],
            datasets: [{
              data: [pC, pI, pP],
              backgroundColor: ['rgba(63,185,80,0.15)', 'rgba(248,81,73,0.15)', 'rgba(240,165,0,0.15)'],
              borderColor: ['#3fb950', '#f85149', '#f0a500'],
              borderWidth: 1.5,
            }]
          }}
          options={{
            responsive: true, maintainAspectRatio: false, cutout: '62%',
            plugins: { legend: { display: false } }
          }}
        />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginTop: 10 }}>
        {[
          { label: 'Sucesso',  pct: pC, color: 'var(--green)' },
          { label: 'Insucesso', pct: pI, color: 'var(--red)'   },
          { label: 'Pendente', pct: pP, color: 'var(--accent)' },
        ].map(({ label, pct, color }) => (
          <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-secondary)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: color, display: 'inline-block' }} />
              {label}
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', color }}>{pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
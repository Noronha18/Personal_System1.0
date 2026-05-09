import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { AlertTriangle } from 'lucide-react';

// Cores extraídas dos tokens do design system (light-only por design)
const CHART = {
  emDia:         'oklch(62% 0.14 48)',    // --color-accent
  pendente:      'oklch(52% 0.18 22)',    // --color-danger
  tooltipBg:     'oklch(98.5% 0.004 82)', // --color-canvas
  tooltipBorder: 'oklch(84% 0.008 82)',  // --color-border
  tooltipText:   'oklch(17% 0.012 82)',  // --color-text-ink
  labelFill:     'oklch(98.5% 0.004 82)', // texto sobre slice
};

export default function GraficoInadimplencia({ dados }) {
  const chartData = [
    { name: 'Em Dia',   value: dados.alunos_em_dia,          color: CHART.emDia },
    { name: 'Pendente', value: dados.alunos_inadimplentes,   color: CHART.pendente }
  ];

  const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    if (percent < 0.05) return null;

    return (
      <text
        x={x}
        y={y}
        fill={CHART.labelFill}
        textAnchor="middle"
        dominantBaseline="central"
        className="font-black text-xs"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  const CustomLegend = ({ payload }) => {
    return (
      <div className="flex justify-center gap-8 mt-10">
        {payload.map((entry, index) => (
          <div key={`legend-${index}`} className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-xs font-bold text-text-secondary uppercase tracking-wide">
                {entry.value}
              </span>
            </div>
            <span className="text-lg font-black text-text-primary">
              {chartData[index].value}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-surface border border-border rounded-xl p-6 sm:p-8 shadow-sm h-full flex flex-col animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-10">
        <h3 className="text-xl font-black text-text-primary flex items-center gap-3 tracking-tight">
          <AlertTriangle size={24} className="text-danger" /> Saúde da Base
        </h3>
        <div className="px-4 py-1.5 bg-overlay border border-border rounded-full">
          <span className="text-xs font-bold text-text-secondary uppercase tracking-wide">Total: {dados.total_alunos}</span>
        </div>
      </div>

      <div className="flex-1 min-h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={CustomLabel}
              outerRadius={100}
              innerRadius={60}
              paddingAngle={4}
              dataKey="value"
              animationBegin={0}
              animationDuration={800}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                  stroke="none"
                />
              ))}
            </Pie>

            <Tooltip
              contentStyle={{
                backgroundColor: CHART.tooltipBg,
                border: `1px solid ${CHART.tooltipBorder}`,
                borderRadius: '12px',
                boxShadow: '0 8px 24px oklch(17% 0.012 82 / 14%)',
                padding: '12px 16px'
              }}
              itemStyle={{
                color: CHART.tooltipText,
                fontSize: '12px',
                fontWeight: '800'
              }}
              formatter={(value) => [`${value} Alunos`]}
            />

            <Legend content={<CustomLegend />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

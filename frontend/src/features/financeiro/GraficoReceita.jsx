import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';

// Cores extraídas dos tokens do design system (light-only por design)
const CHART = {
  bar:           'oklch(62% 0.14 48)',    // --color-accent
  grid:          'oklch(92% 0.006 82)',   // ~--color-border-faint
  axis:          'oklch(60% 0.012 82)',   // --color-text-muted
  tooltipBg:     'oklch(98.5% 0.004 82)', // --color-canvas
  tooltipBorder: 'oklch(84% 0.008 82)',  // --color-border
  tooltipLabel:  'oklch(17% 0.012 82)',  // --color-text-ink
  cursor:        'oklch(96.5% 0.006 82)', // --color-surface-raised
};

export default function GraficoReceita({ dados }) {
  const formatarMoeda = (valor) => new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0
  }).format(valor);

  return (
    <div className="bg-surface border border-border rounded-xl p-6 sm:p-8 shadow-sm h-full flex flex-col animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-black text-text-primary flex items-center gap-3 tracking-tight">
          <TrendingUp size={20} className="text-brand" aria-hidden="true" /> Fluxo de Receita
        </h3>
        <div className="px-3 py-1 bg-overlay border border-border rounded-full">
          <span className="text-xs font-bold text-text-secondary uppercase tracking-wide">12 Meses</span>
        </div>
      </div>

      <div className="flex-1 min-h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={dados} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={CHART.grid} vertical={false} />
            <XAxis
              dataKey="referencia_mes"
              axisLine={false}
              tickLine={false}
              tick={{ fill: CHART.axis, fontSize: 10, fontWeight: 'bold' }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: CHART.axis, fontSize: 10, fontWeight: 'bold' }}
              tickFormatter={formatarMoeda}
            />
            <Tooltip
              cursor={{ fill: CHART.cursor }}
              contentStyle={{
                backgroundColor: CHART.tooltipBg,
                border: `1px solid ${CHART.tooltipBorder}`,
                borderRadius: '12px',
                boxShadow: '0 8px 24px oklch(17% 0.012 82 / 14%)',
                padding: '12px 16px'
              }}
              labelStyle={{ color: CHART.tooltipLabel, fontWeight: '900', marginBottom: '4px', fontSize: '12px' }}
              itemStyle={{ color: CHART.bar, fontSize: '12px', fontWeight: 'bold' }}
              formatter={(value) => [formatarMoeda(value), 'Receita']}
            />
            <Bar dataKey="receita" fill={CHART.bar} radius={[6, 6, 6, 6]} barSize={32} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

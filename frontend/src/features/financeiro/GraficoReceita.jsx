import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';

export default function GraficoReceita({ dados }) {
  const formatarMoeda = (valor) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0
    }).format(valor);
  };

  return (
    <div className="bg-surface border border-border rounded-3xl p-6 sm:p-8 shadow-sm h-full flex flex-col animate-in fade-in duration-700">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-black text-text-primary flex items-center gap-3 tracking-tight">
          <TrendingUp size={20} className="text-brand" /> Fluxo de Receita
        </h3>
        <div className="px-3 py-1 bg-overlay border border-border rounded-full">
          <span className="text-xs font-bold text-text-secondary uppercase tracking-wide">12 Meses</span>
        </div>
      </div>

      <div className="flex-1 min-h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={dados} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="oklch(62% 0.14 48)" stopOpacity={1} />
                <stop offset="100%" stopColor="oklch(62% 0.14 48)" stopOpacity={0.6} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="oklch(92% 0.006 82)" vertical={false} />
            <XAxis
              dataKey="referencia_mes"
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'oklch(62% 0.009 82)', fontSize: 10, fontWeight: 'bold' }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'oklch(62% 0.009 82)', fontSize: 10, fontWeight: 'bold' }}
              tickFormatter={formatarMoeda}
            />
            <Tooltip
              cursor={{ fill: 'oklch(96% 0.006 82)' }}
              contentStyle={{
                backgroundColor: 'oklch(99% 0.004 82)',
                border: '1px solid oklch(90% 0.008 82)',
                borderRadius: '20px',
                boxShadow: '0 20px 40px oklch(0% 0 0 / 0.08)',
                padding: '12px 16px'
              }}
              labelStyle={{ color: 'oklch(17% 0.012 82)', fontWeight: '900', marginBottom: '4px', fontSize: '12px' }}
              itemStyle={{ color: 'oklch(62% 0.14 48)', fontSize: '12px', fontWeight: 'bold' }}
              formatter={(value) => [formatarMoeda(value), 'Receita']}
            />
            <Bar dataKey="receita" fill="url(#barGradient)" radius={[10, 10, 10, 10]} barSize={32} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

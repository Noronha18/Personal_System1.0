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
    <div className="bg-white border border-black/5 rounded-[2.5rem] p-10 shadow-xl shadow-black/5 h-full flex flex-col animate-in fade-in duration-700">
      <div className="flex items-center justify-between mb-10">
        <h3 className="text-xl font-black text-slate-900 flex items-center gap-3 tracking-tight">
          <TrendingUp size={24} className="text-emerald-500" /> Fluxo de Receita
        </h3>
        <div className="px-4 py-1.5 bg-slate-50 border border-black/5 rounded-full shadow-inner">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">12 Meses</span>
        </div>
      </div>
      
      <div className="flex-1 min-h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={dados} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity={1} />
                <stop offset="100%" stopColor="#10b981" stopOpacity={0.6} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis 
              dataKey="referencia_mes" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'bold' }}
              dy={10}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'bold' }}
              tickFormatter={formatarMoeda}
            />
            <Tooltip
              cursor={{ fill: '#f8fafc' }}
              contentStyle={{
                backgroundColor: '#ffffff',
                border: '1px solid rgba(0,0,0,0.05)',
                borderRadius: '20px',
                boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                padding: '12px 16px'
              }}
              labelStyle={{ color: '#0f172a', fontWeight: '900', marginBottom: '4px', fontSize: '12px' }}
              itemStyle={{ color: '#10b981', fontSize: '12px', fontWeight: 'bold' }}
              formatter={(value) => [formatarMoeda(value), 'Receita']}
            />
            <Bar dataKey="receita" fill="url(#barGradient)" radius={[10, 10, 10, 10]} barSize={32} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

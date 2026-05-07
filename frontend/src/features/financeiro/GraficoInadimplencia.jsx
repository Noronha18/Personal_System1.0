import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { AlertTriangle } from 'lucide-react';

export default function GraficoInadimplencia({ dados }) {
  const chartData = [
    { 
      name: 'Em Dia', 
      value: dados.alunos_em_dia, 
      color: '#10b981',
      gradientId: 'emDiaGradient'
    },
    { 
      name: 'Pendente', 
      value: dados.alunos_inadimplentes, 
      color: '#ef4444',
      gradientId: 'inadimplenteGradient'
    }
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
        fill="white" 
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
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                    {entry.value}
                </span>
            </div>
            <span className="text-lg font-black text-slate-900">
              {chartData[index].value}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white border border-slate-200/70 rounded-3xl p-6 sm:p-8 shadow-md h-full flex flex-col animate-in fade-in duration-700">
      <div className="flex items-center justify-between mb-10">
        <h3 className="text-xl font-black text-slate-900 flex items-center gap-3 tracking-tight">
          <AlertTriangle size={24} className="text-red-500" /> Saúde da Base
        </h3>
        <div className="px-4 py-1.5 bg-slate-50 border border-black/5 rounded-full shadow-inner">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Total: {dados.total_alunos}</span>
        </div>
      </div>
      
      <div className="flex-1 min-h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <defs>
              <linearGradient id="emDiaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity={1} />
                <stop offset="100%" stopColor="#10b981" stopOpacity={0.8} />
              </linearGradient>
              <linearGradient id="inadimplenteGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ef4444" stopOpacity={1} />
                <stop offset="100%" stopColor="#ef4444" stopOpacity={0.8} />
              </linearGradient>
            </defs>

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
                  fill={`url(#${entry.gradientId})`}
                  stroke="none"
                />
              ))}
            </Pie>
            
            <Tooltip
              contentStyle={{
                backgroundColor: '#ffffff',
                border: '1px solid rgba(0,0,0,0.05)',
                borderRadius: '20px',
                boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                padding: '12px 16px'
              }}
              itemStyle={{ 
                color: '#0f172a',
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

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

export default function GraficoInadimplencia({ dados }) {
  const chartData = [
    { 
      name: 'Em Dia', 
      value: dados.alunos_em_dia, 
      color: '#10b981',
      gradientId: 'emDiaGradient'
    },
    { 
      name: 'Inadimplentes', 
      value: dados.alunos_inadimplentes, 
      color: '#f87171',
      gradientId: 'inadimplenteGradient'
    }
  ];

  // Label customizado com melhor visibilidade
  const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor="middle" 
        dominantBaseline="central"
        className="font-extrabold text-lg drop-shadow-2xl"
        style={{
          filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.8))',
          paintOrder: 'stroke fill'
        }}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  // Legend customizada com ícones e cores vibrantes
  const CustomLegend = ({ payload }) => {
    return (
      <div className="flex justify-center gap-6 mt-6">
        {payload.map((entry, index) => (
          <div 
            key={`legend-${index}`} 
            className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 rounded-lg border border-slate-700 backdrop-blur-sm"
          >
            <div 
              className="w-3 h-3 rounded-full shadow-lg"
              style={{ 
                backgroundColor: entry.color,
                boxShadow: `0 0 12px ${entry.color}80`
              }}
            />
            <span className="text-slate-200 font-semibold text-sm">
              {entry.value}
            </span>
            <span className="text-slate-400 text-xs font-mono">
              ({chartData[index].value} {chartData[index].value === 1 ? 'aluno' : 'alunos'})
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl backdrop-blur-sm relative overflow-hidden">
      {/* Efeito de brilho de fundo */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-red-500/5 pointer-events-none" />
      
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            💳 Status de Pagamento
          </h3>
          <div className="px-3 py-1 bg-violet-500/10 border border-violet-500/20 rounded-full">
            <span className="text-xs font-medium text-violet-400">
              {dados.total_alunos} {dados.total_alunos === 1 ? 'aluno' : 'alunos'}
            </span>
          </div>
        </div>
        
        {/* Gráfico */}
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <defs>
              {/* Gradiente Emerald (Em Dia) */}
              <radialGradient id="emDiaGradient" cx="50%" cy="50%">
                <stop offset="0%" stopColor="#10b981" stopOpacity={1} />
                <stop offset="100%" stopColor="#059669" stopOpacity={0.8} />
              </radialGradient>
              
              {/* Gradiente Red (Inadimplentes) */}
              <radialGradient id="inadimplenteGradient" cx="50%" cy="50%">
                <stop offset="0%" stopColor="#f87171" stopOpacity={1} />
                <stop offset="100%" stopColor="#dc2626" stopOpacity={0.8} />
              </radialGradient>

              {/* Sombra para profundidade */}
              <filter id="donutShadow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur in="SourceAlpha" stdDeviation="4"/>
                <feOffset dx="0" dy="4" result="offsetblur"/>
                <feComponentTransfer>
                  <feFuncA type="linear" slope="0.3"/>
                </feComponentTransfer>
                <feMerge>
                  <feMergeNode/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>

            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={CustomLabel}
              outerRadius={95}
              innerRadius={60}
              fill="#8884d8"
              dataKey="value"
              filter="url(#donutShadow)"
              animationBegin={0}
              animationDuration={800}
              animationEasing="ease-out"
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={`url(#${entry.gradientId})`}
                  stroke="#0f172a"
                  strokeWidth={3}
                />
              ))}
            </Pie>
            
            <Tooltip
              contentStyle={{
                backgroundColor: '#0f172a',
                border: '1px solid #334155',
                borderRadius: '12px',
                boxShadow: '0 10px 40px rgba(0,0,0,0.6)',
                padding: '12px 16px'
              }}
              itemStyle={{ 
                color: '#e2e8f0',
                fontSize: '14px',
                fontWeight: '600'
              }}
              formatter={(value, name) => [
                `${value} ${value === 1 ? 'aluno' : 'alunos'}`, 
                name
              ]}
            />
            
            <Legend 
              content={<CustomLegend />}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

import { use, Suspense } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const fetchDetalhes = async (id) => {
    const res = await fetch(`http://localhost:8000/alunos/${id}`);
    if (!res.ok) throw new Error('Erro ao buscar detalhes');
    return res.json();
};

const GraficoEvolucao = ({ planos }) => {

  const data = planos?.flatMap(plano =>
    plano.prescricoes.map(p => ({
      data: new Date(p.data_craicao).toLocaleDateString('pt-BR'),
      carga: p.carga_kg,
      exercicio: plano.nome_exercicio
    }))
  ).sort((a, b) => new Date(a.data) - new Date(b.data));

  return (
    <div className="h-64 w-full bg-slate-900/50 p-4 rounded-xl border border-slate-800">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="data" stroke="#94a3b8" fontSize={12} />
          <YAxis stroke="#94a3b8" fontSize={12} />
          <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none' }} />
          <Line type="monotone" dataKey="carga" stroke="#10b981" strokeWidth={3} dot={{ r: 6 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

const cache = new Map();

const getAlunoDetalhes = (id) => {
  if (!cache.has(id)) {
    cache.set(id, fetch(`http://localhost:8000/alunos/${id}`)
      .then(res => {
        if (!res.ok) throw new Error('Erro ao buscar');
        return res.json();
      })
    );
  }
  return cache.get(id);
};

export const DetalheAluno = ({ alunoId, onBack }) => {
  const aluno = use(getAlunoDetalhes(alunoId));

  return (
  <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <button onClick={onBack} className="text-emerald-400 hover:text-emerald-300 flex items-center gap-2">
        ← Voltar para Lista
      </button>

      <section className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-2xl">
        <h2 className="text-2xl font-bold text-white mb-2">{aluno.nome}</h2>
        <div className="flex gap-4 items-center">
          <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-xs font-bold uppercase">
            {aluno.status_financeiro}
          </span>
          <p className="text-slate-400 text-sm">Frequência: {aluno.frequencia_semanal_plano}x/semana</p>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-xl font-semibold text-slate-200">Evolução de Carga (kg)</h3>
          <GraficoEvolucao planos={aluno.planos_treino} />
        </div>
        
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-slate-200">Plano Atual</h3>
          {aluno.planos_treino?.map(plano => (
            <div key={plano.id} className="p-4 bg-slate-800/40 rounded-xl border border-slate-700">
              <p className="font-medium text-emerald-400">{plano.titulo}</p>
              <p className="text-xs text-slate-500">{plano.objetivo_estrategico}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
import { useState, useEffect, useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { Dumbbell, Loader2 } from 'lucide-react';
import { FormPlanoTreino } from './FormPlanoTreino';
import FormPagamento from '../pagamentos/FormPagamento';
import TabelaPagamentos from '../pagamentos/TabelaPagamentos';
import { CheckInCard } from '../sessoes/CheckInCard';
import { IndicadorFrequencia } from '../sessoes/IndicadorFrequencia';
import { ModalPlanoTreino } from './ModalPlanoTreino';

const fetchAluno = async (id) => {
  const res = await fetch(`http://localhost:8000/alunos/${id}`);
  if (!res.ok) throw new Error('Erro ao buscar aluno');
  return res.json();
};

const toISODateOnly = (d) => d.toISOString().slice(0, 10);

const fetchSessoes = async ({
  alunoId,
  de, // YYYY-MM-DD
  ate, // YYYY-MM-DD (opcional)
  realizada = true,
  limit = 100,
  offset = 0,
}) => {
  const params = new URLSearchParams();
  params.set('aluno_id', String(alunoId));
  if (realizada !== null && realizada !== undefined) params.set('realizada', String(realizada));
  if (de) params.set('de', de);
  if (ate) params.set('ate', ate);
  params.set('limit', String(limit));
  params.set('offset', String(offset));

  // Ajuste para "/sessoes/" se sua rota estiver com barra final
  const res = await fetch(`http://localhost:8000/sessoes?${params.toString()}`);
  if (!res.ok) throw new Error('Erro ao buscar sessões');
  return res.json();
};

const GraficoEvolucao = ({ alunoId, planos, refreshKey }) => {
  const [pontos, setPontos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);

  // Mapa: plano_id -> volume_total_do_plano (Σ carga * séries * reps)
  const volumePorPlanoId = useMemo(() => {
    const map = new Map();

    for (const plano of planos || []) {
      const prescs = plano.prescricoes || [];
      const volume = prescs.reduce((acc, p) => {
        const carga = Number(p.carga_kg || 0);
        const series = Number(p.series || 0);
        const reps = Number(p.repeticoes || 0);
        const v = carga * series * reps;
        return acc + (Number.isFinite(v) ? v : 0);
      }, 0);

      map.set(plano.id, Math.max(0, volume));
    }

    return map;
  }, [planos]);

  useEffect(() => {
    let cancelado = false;
    const controller = new AbortController();

    async function carregar() {
      try {
        setLoading(true);
        setErro(null);

        const hoje = new Date();
        const inicio = new Date();
        inicio.setDate(hoje.getDate() - 90);

        const sessoes = await fetchSessoes({
          alunoId,
          de: toISODateOnly(inicio),
          realizada: true,
          limit: 200,
          offset: 0,
        });

        // Agrega por dia (YYYY-MM-DD) para evitar vários pontos no mesmo dia
        const porDia = new Map(); // dateISO -> volumeSomado
        let ignoradasSemPlano = 0;

        for (const s of sessoes || []) {
          const planoId = s.plano_treino_id;
          if (!planoId || !volumePorPlanoId.has(planoId)) {
            ignoradasSemPlano += 1;
            continue; // evita "quedas para 0" artificiais
          }

          const dataISO = String(s.data_hora || '').slice(0, 10);
          if (!dataISO) continue;

          const volumeSessao = volumePorPlanoId.get(planoId) || 0;
          porDia.set(dataISO, (porDia.get(dataISO) || 0) + volumeSessao);
        }

        const arr = Array.from(porDia.entries())
          .map(([dataISO, volume]) => ({ dataISO, volume }))
          .sort((a, b) => a.dataISO.localeCompare(b.dataISO));

        if (!cancelado) {
          setPontos(arr);
          // Se quiser depurar:
          // console.log({ ignoradasSemPlano, sessoes: sessoes?.length, pontos: arr.length });
        }
      } catch (e) {
        if (!cancelado) setErro(e?.message || 'Erro ao carregar evolução');
      } finally {
        if (!cancelado) setLoading(false);
      }
    }

    carregar();

    return () => {
      cancelado = true;
      controller.abort();
    };
  }, [alunoId, refreshKey, volumePorPlanoId]);

  if (loading) {
    return (
      <div className="h-64 w-full flex items-center justify-center text-slate-500 text-sm border border-slate-800 rounded-xl bg-slate-900/50">
        <Loader2 className="w-5 h-5 animate-spin text-emerald-500" />
        <span className="ml-2">Carregando evolução...</span>
      </div>
    );
  }

  if (erro) {
    return (
      <div className="h-64 w-full flex items-center justify-center text-red-400 text-sm border border-slate-800 rounded-xl bg-slate-900/50">
        {erro}
      </div>
    );
  }

  if (!pontos || pontos.length === 0) {
    return (
      <div className="h-64 w-full flex flex-col items-center justify-center text-slate-500 text-sm border border-slate-800 rounded-xl bg-slate-900/50">
        <p className="font-medium">Sem dados de evolução ainda</p>
        <p className="text-xs mt-1">Registre sessões para gerar a série (volume por sessão/dia)</p>
      </div>
    );
  }

  const formatarVolume = (v) =>
    new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 }).format(v);

  const formatarTickData = (iso) => {
    const d = new Date(`${iso}T00:00:00`);
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  };

  const formatarLabelTooltip = (iso) => {
    const d = new Date(`${iso}T00:00:00`);
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  return (
    <div className="h-64 w-full bg-slate-900/50 p-4 rounded-xl border border-slate-800">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={pontos} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="linhaEvolucao" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity={0.9} />
              <stop offset="100%" stopColor="#10b981" stopOpacity={0.15} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.35} />

          <XAxis
            dataKey="dataISO"
            stroke="#94a3b8"
            fontSize={12}
            tick={{ fill: '#94a3b8' }}
            tickFormatter={formatarTickData}
          />

          <YAxis
            stroke="#94a3b8"
            fontSize={12}
            tick={{ fill: '#94a3b8' }}
            tickFormatter={formatarVolume}
          />

          <Tooltip
            contentStyle={{
              backgroundColor: '#0f172a',
              border: '1px solid #334155',
              borderRadius: '10px',
              color: '#f1f5f9',
              boxShadow: '0 12px 40px rgba(0,0,0,0.45)',
            }}
            labelStyle={{ color: '#e2e8f0', fontWeight: 700 }}
            itemStyle={{ color: '#10b981', fontWeight: 600 }}
            labelFormatter={formatarLabelTooltip}
            formatter={(value) => [`${formatarVolume(value)} kg`, 'Volume do dia']}
          />

          <Line
            type="monotone"
            dataKey="volume"
            stroke="#10b981"
            strokeWidth={3}
            dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#0f172a' }}
            activeDot={{ r: 6, fill: '#10b981', strokeWidth: 3, stroke: '#0f172a' }}
            fill="url(#linhaEvolucao)"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export const DetalheAluno = ({ alunoId, onBack }) => {
  const [aluno, setAluno] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estado para forçar refresh do gráfico após ações (check-in, pagamento, etc.)
  const [refreshKey, setRefreshKey] = useState(0);

  // Estados de UI
  const [mostrarFormPagamento, setMostrarFormPagamento] = useState(false);
  const [planoSelecionado, setPlanoSelecionado] = useState(null);

  const carregarDados = async () => {
    try {
      setLoading(true);
      const dados = await fetchAluno(alunoId);
      setAluno(dados);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [alunoId]);

  const handleRecarregarDados = async () => {
    await carregarDados();
    setPlanoSelecionado(null);
    setMostrarFormPagamento(false);
    setRefreshKey((k) => k + 1);
  };

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
      </div>
    );

  if (error)
    return (
      <div className="text-red-500 text-center p-10">
        Erro: {error}
        <button onClick={onBack} className="block mt-4 mx-auto text-white underline">
          Voltar
        </button>
      </div>
    );

  if (!aluno) return null;

  const statusAtrasado =
    String(aluno.status_financeiro || '').toLowerCase() === 'atrasado' ||
    String(aluno.status_financeiro || '').toLowerCase() === 'inadimplente';

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500 pb-20">
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="text-slate-400 hover:text-emerald-400 flex items-center gap-2 transition-colors text-sm font-medium"
        >
          ← Voltar para Lista
        </button>
      </div>

      {/* Info do Aluno */}
      <section className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
        <div className="relative z-10">
          <h2 className="text-3xl font-bold text-white mb-2">{aluno.nome}</h2>
          <div className="flex flex-wrap gap-4 items-center mt-4">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${
                statusAtrasado
                  ? 'bg-red-500/10 text-red-400 border-red-500/20'
                  : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
              }`}
            >
              {statusAtrasado ? 'Atrasado' : 'Em dia'}
            </span>

            <span className="text-slate-400 text-sm flex items-center gap-1">
              Vencimento dia {aluno.dia_vencimento}
            </span>

            <span className="text-slate-400 text-sm flex items-center gap-1">CPF: {aluno.cpf}</span>
          </div>
        </div>
      </section>

      {/* Dashboard Rápido */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
          <IndicadorFrequencia alunoId={aluno.id} />
        </div>

        <div className="lg:col-span-2">
          <CheckInCard alunoId={aluno.id} planos={aluno.planos_treino} onSucesso={handleRecarregarDados} />
        </div>
      </div>

      {/* Evolução e Planos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-slate-200 flex items-center gap-2">
              Evolução de Carga
            </h3>
            <span className="text-xs text-slate-500">
              (volume por sessão/dia, baseado nas prescrições do plano)
            </span>
          </div>

          <GraficoEvolucao
            alunoId={aluno.id}
            planos={aluno.planos_treino}
            refreshKey={refreshKey}
          />
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-slate-200 flex items-center gap-2">💪 Planos Ativos</h3>

          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
            {aluno.planos_treino && aluno.planos_treino.length > 0 ? (
              aluno.planos_treino.map((plano) => (
                <button
                  key={plano.id}
                  onClick={() => setPlanoSelecionado(plano)}
                  className={`w-full text-left p-4 rounded-xl border transition-all duration-200 group relative overflow-hidden ${
                    plano.esta_ativo
                      ? 'bg-slate-800/60 border-emerald-500/30 hover:border-emerald-500/60 hover:bg-slate-800'
                      : 'bg-slate-800/20 border-slate-700 opacity-60 hover:opacity-100'
                  }`}
                >
                  <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-slate-200 group-hover:text-emerald-400 transition-colors">
                        {plano.titulo}
                      </h4>
                      {plano.esta_ativo && (
                        <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                      )}
                    </div>

                    <p className="text-xs text-slate-400 line-clamp-2 mb-2">
                      {plano.objetivo_estrategico || 'Sem objetivo estratégico definido'}
                    </p>

                    <div className="flex items-center gap-2 text-xs text-slate-500 border-t border-slate-700/50 pt-2 mt-2">
                      <span className="flex items-center gap-1">
                        <Dumbbell className="w-3 h-3" />
                        {plano.prescricoes?.length || 0} exercícios
                      </span>
                      <span>•</span>
                      <span>{new Date(plano.data_criacao).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <div className="p-6 bg-slate-800/20 rounded-xl border border-slate-700 border-dashed text-center">
                <p className="text-slate-500 text-sm">Nenhum plano cadastrado</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Novo Plano */}
      <section className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl">
        <h3 className="text-xl font-semibold text-slate-200 mb-6 flex items-center gap-2">
          Prescrever Novo Treino
        </h3>
        <FormPlanoTreino alunoId={alunoId} onSuccess={handleRecarregarDados} />
      </section>

      {/* Histórico Financeiro */}
      <section className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-xl font-semibold text-slate-200 flex items-center gap-2">
              Histórico Financeiro
            </h3>
            <p className="text-sm text-slate-400 mt-1">Gerencie mensalidades e recebimentos</p>
          </div>

          <button
            onClick={() => setMostrarFormPagamento(!mostrarFormPagamento)}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 flex items-center gap-2 shadow-lg ${
              mostrarFormPagamento
                ? 'bg-slate-700 text-slate-200 hover:bg-slate-600'
                : 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-emerald-900/20'
            }`}
          >
            {mostrarFormPagamento ? 'Cancelar Registro' : 'Novo Pagamento'}
          </button>
        </div>

        {mostrarFormPagamento && (
          <div className="mb-8 animate-in slide-in-from-top-4 duration-300">
            <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
              <FormPagamento alunoId={aluno.id} onSuccess={handleRecarregarDados} />
            </div>
          </div>
        )}

        <div className="bg-slate-800/30 rounded-xl border border-slate-700 overflow-hidden">
          <TabelaPagamentos pagamentos={aluno.pagamentos || []} onDelete={handleRecarregarDados} />
        </div>
      </section>

      {/* Modal */}
      <ModalPlanoTreino
        plano={planoSelecionado}
        onClose={() => setPlanoSelecionado(null)}
        onUpdate={handleRecarregarDados}
      />
    </div>
  );
};

// frontend/src/features/alunos/DetalheAluno.jsx

import { use, useState, Suspense } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { FormPlanoTreino } from "./FormPlanoTreino";
import FormPagamento from '../pagamentos/FormPagamento';
import TabelaPagamentos from '../pagamentos/TabelaPagamentos';
import { CheckInCard } from '../sessoes/CheckInCard';
import { IndicadorFrequencia } from '../sessoes/IndicadorFrequencia';

// ============================================
// CACHE E FETCH
// ============================================

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

// ============================================
// COMPONENTE: GRÁFICO DE EVOLUÇÃO
// ============================================

const GraficoEvolucao = ({ planos }) => {
  // Tratamento defensivo para evitar erro se planos for undefined
  if (!planos || planos.length === 0) {
      return (
          <div className="h-64 w-full flex items-center justify-center text-slate-500 text-sm border border-slate-800 rounded-xl bg-slate-900/50">
              Sem dados de evolução ainda
          </div>
      );
  }

  const data = planos.flatMap(plano =>
    plano.prescricoes?.map(p => ({
      data: new Date(plano.data_criacao).toLocaleDateString('pt-BR'), // Usa data do plano, pois prescricao nao tem data
      carga: p.carga_kg || 0,
      exercicio: p.nome_exercicio
    })) || []
  ).sort((a, b) => new Date(a.data) - new Date(b.data));

  return (
    <div className="h-64 w-full bg-slate-900/50 p-4 rounded-xl border border-slate-800">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="data" stroke="#94a3b8" fontSize={12} />
          <YAxis stroke="#94a3b8" fontSize={12} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#f1f5f9' }}
            itemStyle={{ color: '#10b981' }}
          />
          <Line type="monotone" dataKey="carga" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981' }} activeDot={{ r: 6 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

// ============================================
// COMPONENTE PRINCIPAL: DETALHE DO ALUNO
// ============================================

export const DetalheAluno = ({ alunoId, onBack }) => {
  // Data fetching com use()
  const aluno = use(getAlunoDetalhes(alunoId));
  
  // Estados locais
  const [mostrarFormPagamento, setMostrarFormPagamento] = useState(false);
  const [pagamentos, setPagamentos] = useState(aluno.pagamentos || []);

  // ============================================
  // HANDLERS
  // ============================================

  const handlePagamentoAdicionado = (novoPagamento) => {
    setPagamentos([novoPagamento, ...pagamentos]);
    setMostrarFormPagamento(false);
  };

  const handlePagamentoDeletado = (pagamentoId) => {
    setPagamentos(pagamentos.filter(p => p.id !== pagamentoId));
  };

  const handleCheckInSucesso = () => {
    // Hack simples: limpa cache e recarrega para atualizar frequência
    // Em produção usariamos router.refresh() ou mutate do SWR/React Query
    cache.delete(alunoId);
    window.location.reload(); 
  };

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500 pb-20">
      {/* Cabeçalho e Voltar */}
      <div className="flex items-center justify-between">
        <button 
            onClick={onBack} 
            className="text-slate-400 hover:text-emerald-400 flex items-center gap-2 transition-colors text-sm font-medium"
        >
            ← Voltar para Lista
        </button>
      </div>

      {/* Seção Principal: Info do Aluno */}
      <section className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
        
        <div className="relative z-10">
            <h2 className="text-3xl font-bold text-white mb-2">{aluno.nome}</h2>
            <div className="flex flex-wrap gap-4 items-center mt-4">
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${
                aluno.status_financeiro === 'Inadimplente' 
                ? 'bg-red-500/10 text-red-400 border-red-500/20' 
                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
            }`}>
                {aluno.status_financeiro || 'Em dia'}
            </span>
            <span className="text-slate-400 text-sm flex items-center gap-1">
                📅 Vencimento dia {aluno.dia_vencimento}
            </span>
            <span className="text-slate-400 text-sm flex items-center gap-1">
                🆔 CPF: {aluno.cpf}
            </span>
            </div>
        </div>
      </section>

      {/* ============================================
          NOVA SEÇÃO: DASHBOARD RÁPIDO (Frequência + Check-in)
      ============================================ */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Card 1: Indicador de Frequência (com Suspense) */}
        <Suspense fallback={
            <div className="h-32 bg-slate-900/50 animate-pulse rounded-xl border border-slate-800 flex items-center justify-center">
                <span className="text-slate-500 text-xs">Carregando frequência...</span>
            </div>
        }>
            <IndicadorFrequencia alunoId={aluno.id} />
        </Suspense>

        {/* Card 2: Check-in Rápido */}
        <div className="lg:col-span-2">
            <CheckInCard alunoId={aluno.id} onSucesso={handleCheckInSucesso} />
        </div>
      </div>

      {/* ============================================
          SEÇÃO: EVOLUÇÃO E PLANOS
      ============================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Gráfico de Carga */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-slate-200 flex items-center gap-2">
                📈 Evolução de Carga
            </h3>
          </div>
          <GraficoEvolucao planos={aluno.planos_treino} />
        </div>

        {/* Lista de Planos */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-slate-200 flex items-center gap-2">
            💪 Planos Ativos
          </h3>
          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
            {aluno.planos_treino && aluno.planos_treino.length > 0 ? (
                aluno.planos_treino.map(plano => (
                <div 
                    key={plano.id} 
                    className={`p-4 rounded-xl border transition-all duration-200 ${
                        plano.esta_ativo 
                        ? 'bg-slate-800/60 border-emerald-500/30 hover:border-emerald-500/60' 
                        : 'bg-slate-800/20 border-slate-700 opacity-60'
                    }`}
                >
                    <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-slate-200">{plano.titulo}</h4>
                    {plano.esta_ativo && (
                        <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                    )}
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-2 mb-2">
                    {plano.objetivo_estrategico || "Sem objetivo estratégico definido"}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-slate-500 border-t border-slate-700/50 pt-2 mt-2">
                        <span>{plano.prescricoes?.length || 0} exercícios</span>
                        <span>•</span>
                        <span>{new Date(plano.data_criacao).toLocaleDateString('pt-BR')}</span>
                    </div>
                </div>
                ))
            ) : (
                <div className="p-6 bg-slate-800/20 rounded-xl border border-slate-700 border-dashed text-center">
                <p className="text-slate-500 text-sm">Nenhum plano cadastrado</p>
                </div>
            )}
          </div>
        </div>
      </div>

      {/* ============================================
          SEÇÃO: NOVO PLANO (FORMULÁRIO)
      ============================================ */}
      <section className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl">
        <h3 className="text-xl font-semibold text-slate-200 mb-6 flex items-center gap-2">
          📝 Prescrever Novo Treino
        </h3>
        <FormPlanoTreino 
          alunoId={alunoId} 
          onSuccess={(novoPlano) => {
            console.log("Plano criado:", novoPlano);
            cache.delete(alunoId);
            window.location.reload();
          }} 
        />
      </section>

      {/* ============================================
          SEÇÃO: HISTÓRICO DE PAGAMENTOS
      ============================================ */}
      <section className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-xl font-semibold text-slate-200 flex items-center gap-2">
              💰 Histórico Financeiro
            </h3>
            <p className="text-sm text-slate-400 mt-1">
              Gerencie mensalidades e recebimentos
            </p>
          </div>
          
          <button
            onClick={() => setMostrarFormPagamento(!mostrarFormPagamento)}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 flex items-center gap-2 shadow-lg ${
              mostrarFormPagamento 
                ? 'bg-slate-700 text-slate-200 hover:bg-slate-600' 
                : 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-emerald-900/20'
            }`}
          >
            {mostrarFormPagamento ? 'Cancelar Registro' : '➕ Novo Pagamento'}
          </button>
        </div>

        {/* Formulário de Pagamento (Toggle) */}
        {mostrarFormPagamento && (
          <div className="mb-8 animate-in slide-in-from-top-4 duration-300">
            <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
                <FormPagamento 
                alunoId={aluno.id} 
                onSuccess={handlePagamentoAdicionado}
                />
            </div>
          </div>
        )}

        {/* Tabela de Pagamentos */}
        <div className="bg-slate-800/30 rounded-xl border border-slate-700 overflow-hidden">
          <TabelaPagamentos 
            pagamentos={pagamentos}
            onDelete={handlePagamentoDeletado}
          />
        </div>
      </section>
    </div>
  );
};

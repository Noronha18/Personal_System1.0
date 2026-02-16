// frontend/src/features/alunos/DetalheAluno.jsx

import { use, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { FormPlanoTreino } from "./FormPlanoTreino";
import FormPagamento from '../pagamentos/FormPagamento';
import TabelaPagamentos from '../pagamentos/TabelaPagamentos';

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
  const data = planos?.flatMap(plano =>
    plano.prescricoes.map(p => ({
      data: new Date(p.data_criacao).toLocaleDateString('pt-BR'),
      carga: p.carga_kg,
      exercicio: p.nome_exercicio
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

// ============================================
// COMPONENTE PRINCIPAL: DETALHE DO ALUNO
// ============================================

export const DetalheAluno = ({ alunoId, onBack }) => {
  const aluno = use(getAlunoDetalhes(alunoId));
  
  // Estados para gerenciar formulários e dados
  const [mostrarFormPagamento, setMostrarFormPagamento] = useState(false);
  const [pagamentos, setPagamentos] = useState(aluno.pagamentos || []);

  // ============================================
  // HANDLERS DE PAGAMENTOS
  // ============================================

  const handlePagamentoAdicionado = (novoPagamento) => {
    setPagamentos([novoPagamento, ...pagamentos]);
    setMostrarFormPagamento(false);
  };

  const handlePagamentoDeletado = (pagamentoId) => {
    setPagamentos(pagamentos.filter(p => p.id !== pagamentoId));
  };

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      {/* Botão Voltar */}
      <button 
        onClick={onBack} 
        className="text-emerald-400 hover:text-emerald-300 flex items-center gap-2 transition-colors"
      >
        ← Voltar para Lista
      </button>

      {/* ============================================
          SEÇÃO: INFORMAÇÕES DO ALUNO
      ============================================ */}
      <section className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-2xl">
        <h2 className="text-2xl font-bold text-white mb-2">{aluno.nome}</h2>
        <div className="flex gap-4 items-center">
          <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-xs font-bold uppercase">
            {aluno.status_financeiro || 'Em dia'}
          </span>
          <p className="text-slate-400 text-sm">
            Frequência: {aluno.frequencia_semanal_plano}x/semana
          </p>
          <p className="text-slate-400 text-sm">
            CPF: {aluno.cpf}
          </p>
        </div>
      </section>

      {/* ============================================
          SEÇÃO: GRÁFICO DE EVOLUÇÃO
      ============================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-xl font-semibold text-slate-200">📈 Evolução de Carga (kg)</h3>
          <GraficoEvolucao planos={aluno.planos_treino} />
        </div>

        {/* ============================================
            SEÇÃO: PLANOS DE TREINO
        ============================================ */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-slate-200">💪 Planos de Treino</h3>
          {aluno.planos_treino && aluno.planos_treino.length > 0 ? (
            aluno.planos_treino.map(plano => (
              <div 
                key={plano.id} 
                className="p-4 bg-slate-800/40 rounded-xl border border-slate-700 
                         hover:border-emerald-500/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-emerald-400">{plano.titulo}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {plano.objetivo_estrategico}
                    </p>
                  </div>
                  {plano.esta_ativo && (
                    <span className="px-2 py-1 bg-emerald-500/20 text-emerald-300 
                                   text-xs rounded-full">
                      Ativo
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  {plano.prescricoes?.length || 0} exercícios
                </p>
              </div>
            ))
          ) : (
            <div className="p-4 bg-slate-800/20 rounded-xl border border-slate-700 text-center">
              <p className="text-slate-400 text-sm">Nenhum plano cadastrado</p>
            </div>
          )}
        </div>
      </div>

      {/* ============================================
          SEÇÃO: FORMULÁRIO DE PLANO DE TREINO
      ============================================ */}
      <section className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl">
        <h3 className="text-xl font-semibold text-slate-200 mb-4">
          🏋️ Criar Novo Plano de Treino
        </h3>
        <FormPlanoTreino 
          alunoId={alunoId} 
          onSuccess={(novoPlano) => {
            console.log("Plano criado:", novoPlano);
            // Limpar cache para forçar reload dos dados
            cache.delete(alunoId);
            window.location.reload();
          }} 
        />
      </section>

      {/* ============================================
          SEÇÃO: HISTÓRICO DE PAGAMENTOS (NOVA!)
      ============================================ */}
      <section className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold text-slate-200">
              💰 Histórico de Pagamentos
            </h3>
            <p className="text-sm text-slate-400 mt-1">
              {pagamentos.length} pagamento(s) registrado(s)
            </p>
          </div>
          
          <button
            onClick={() => setMostrarFormPagamento(!mostrarFormPagamento)}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              mostrarFormPagamento 
                ? 'bg-red-600 hover:bg-red-700 text-white' 
                : 'bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-500/30'
            }`}
          >
            {mostrarFormPagamento ? '✕ Cancelar' : '+ Registrar Pagamento'}
          </button>
        </div>

        {/* Formulário de Pagamento (Condicional) */}
        {mostrarFormPagamento && (
          <div className="mb-6 p-4 bg-slate-800/50 rounded-xl border border-slate-700 
                       animate-in slide-in-from-top-2 duration-300">
            <FormPagamento 
              alunoId={aluno.id} 
              onSuccess={handlePagamentoAdicionado}
            />
          </div>
        )}

        {/* Tabela de Pagamentos */}
        <div className="bg-slate-800/20 rounded-xl border border-slate-700 overflow-hidden">
          <TabelaPagamentos 
            pagamentos={pagamentos}
            onDelete={handlePagamentoDeletado}
          />
        </div>
      </section>
    </div>
  );
};

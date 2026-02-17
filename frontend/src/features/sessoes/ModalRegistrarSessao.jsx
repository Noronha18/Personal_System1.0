import { useState, useEffect } from 'react';
import { X, Calendar, Dumbbell, CheckCircle2, AlertCircle, Clock, AlertTriangle } from 'lucide-react';

export default function ModalRegistrarSessao({ alunoId, planos, onClose, onSucesso }) {
  // Estados do Formulário
  const [data, setData] = useState(new Date().toISOString().split('T')[0]);
  const [planoId, setPlanoId] = useState('');
  const [status, setStatus] = useState('realizada'); // 'realizada' | 'falta_com_reposicao' | 'falta_sem_reposicao'
  const [observacao, setObservacao] = useState('');
  
  // Estados de UI
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState(null);

  // Seleciona o primeiro plano ativo automaticamente ao abrir
  useEffect(() => {
    const planoAtivo = planos?.find(p => p.esta_ativo);
    if (planoAtivo) {
      setPlanoId(planoAtivo.id);
    }
  }, [planos]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErro(null);

    try {
      // Validação básica
      if (status === 'realizada' && !planoId) {
        throw new Error("Selecione qual treino foi realizado.");
      }
      
      if (status !== 'realizada' && !observacao) {
          throw new Error("Informe o motivo da ausência/falta.");
      }

      // Mapeia o status do frontend para o payload do backend
      const isRealizada = status === 'realizada';
      const precisaReposicao = status === 'falta_com_reposicao';

      const payload = {
        aluno_id: alunoId,
        plano_treino_id: isRealizada ? parseInt(planoId) : null,
        data_hora: new Date(data).toISOString(), // Backend espera ISO
        realizada: isRealizada,
        precisa_reposicao: precisaReposicao, // Campo novo para controle de crédito
        observacoes_performance: isRealizada ? observacao : null,
        motivo_ausencia: !isRealizada ? observacao : null
      };

      const response = await fetch('http://localhost:8000/sessoes/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || 'Erro ao registrar sessão');
      }

      onSucesso(); // Atualiza a tela pai (DetalheAluno)
      onClose();   // Fecha o modal

    } catch (err) {
      setErro(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-lg shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900">
          <h3 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <CheckCircle2 className="w-6 h-6 text-emerald-500" />
            Registrar Sessão
          </h3>
          <button 
            onClick={onClose} 
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {erro && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p>{erro}</p>
            </div>
          )}

          {/* Seleção de Data */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-500" />
              Data da Sessão
            </label>
            <input
              type="date"
              value={data}
              max={new Date().toISOString().split('T')[0]} // Bloqueia datas futuras
              onChange={(e) => setData(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
              required
            />
          </div>

          {/* Seleção de Status (Tabs Visuais) */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">O que aconteceu?</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setStatus('realizada')}
                className={`p-3 rounded-lg border text-sm font-medium transition-all flex flex-col items-center gap-1 ${
                  status === 'realizada'
                    ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
                }`}
              >
                <CheckCircle2 className="w-5 h-5" />
                Realizada
              </button>

              <button
                type="button"
                onClick={() => setStatus('falta_com_reposicao')}
                className={`p-3 rounded-lg border text-sm font-medium transition-all flex flex-col items-center gap-1 ${
                  status === 'falta_com_reposicao'
                    ? 'bg-amber-500/10 border-amber-500 text-amber-400'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
                }`}
              >
                <Clock className="w-5 h-5" />
                Reposição
              </button>

              <button
                type="button"
                onClick={() => setStatus('falta_sem_reposicao')}
                className={`p-3 rounded-lg border text-sm font-medium transition-all flex flex-col items-center gap-1 ${
                  status === 'falta_sem_reposicao'
                    ? 'bg-red-500/10 border-red-500 text-red-400'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
                }`}
              >
                <AlertTriangle className="w-5 h-5" />
                Falta (Perdida)
              </button>
            </div>
            
            {/* Explicação do Status Selecionado */}
            <div className="text-xs text-slate-500 px-1">
              {status === 'realizada' && "O aluno compareceu e treinou. Conta como aula dada."}
              {status === 'falta_com_reposicao' && "O aluno faltou mas tem direito a repor. NÃO desconta do pacote."}
              {status === 'falta_sem_reposicao' && "O aluno faltou sem justificativa. Desconta do pacote (aula dada)."}
            </div>
          </div>

          {/* Seleção de Plano (Apenas se realizada) */}
          {status === 'realizada' && (
  <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
    <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
      <Dumbbell className="w-4 h-4 text-emerald-500" />
      Qual treino foi executado?
    </label>
    <select
      value={planoId}
      onChange={(e) => setPlanoId(e.target.value)}
      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
    >
      <option value="">Selecione um plano...</option>
      
      {/* ✅ FILTRO ADICIONADO AQUI: */}
      {planos
        ?.filter(plano => plano.esta_ativo) // Só mostra se esta_ativo === true
        .map(plano => (
          <option key={plano.id} value={plano.id}>
            {plano.titulo}
          </option>
      ))}

    </select>
    
    {/* Feedback visual caso não tenha planos ativos */}
    {planos?.filter(p => p.esta_ativo).length === 0 && (
      <p className="text-xs text-amber-500 mt-1">
        ⚠️ Nenhum plano ativo encontrado. Ative um plano no perfil do aluno.
      </p>
    )}
  </div>
)}

          {/* Observações */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">
              {status === 'realizada' ? 'Observações de Performance (Opcional)' : 'Motivo da Falta (Obrigatório)'}
            </label>
            <textarea
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              placeholder={
                status === 'realizada' 
                ? "Ex: Aumentou carga no supino, sentiu desconforto no joelho..." 
                : "Ex: Viagem a trabalho, gripe, carro quebrou..."
              }
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none min-h-[100px] resize-none"
            />
          </div>

          {/* Footer / Ações */}
          <div className="flex gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`flex-1 px-4 py-3 text-white rounded-lg font-bold shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                status === 'realizada' 
                  ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/20' 
                  : status === 'falta_com_reposicao'
                    ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-900/20'
                    : 'bg-red-600 hover:bg-red-500 shadow-red-900/20'
              }`}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Salvando...
                </>
              ) : (
                'Confirmar Registro'
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

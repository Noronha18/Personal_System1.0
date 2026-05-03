import { useState, useEffect } from 'react';
import { X, Calendar, Dumbbell, CheckCircle2, AlertCircle, Clock, AlertTriangle, MessageSquare } from 'lucide-react';
import { sessaoService } from '../../services/api';

export default function ModalRegistrarSessao({ alunoId, planos, onClose, onSucesso }) {
  const [data, setData] = useState(new Date().toISOString().split('T')[0]);
  const [planoId, setPlanoId] = useState('');
  const [status, setStatus] = useState('realizada'); 
  const [observacao, setObservacao] = useState('');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState(null);

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
      if (status === 'realizada' && !planoId) {
        throw new Error("Selecione qual treino foi realizado.");
      }
      
      if (status !== 'realizada' && !observacao) {
          throw new Error("Informe o motivo da ausência.");
      }

      const isRealizada = status === 'realizada';
      const precisaReposicao = status === 'falta_com_reposicao';

      const payload = {
        aluno_id: alunoId,
        plano_treino_id: isRealizada ? parseInt(planoId) : null,
        data_hora: new Date(data).toISOString(),
        realizada: isRealizada,
        precisa_reposicao: precisaReposicao,
        observacoes_performance: isRealizada ? observacao : null,
        motivo_ausencia: !isRealizada ? observacao : null
      };

      await sessaoService.registrar(payload);
      onSucesso();
      onClose();

    } catch (err) {
      setErro(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white border border-black/5 rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500">
        
        {/* Header */}
        <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-white">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <CheckCircle2 size={24} />
            </div>
            <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Check-in</h2>
                <p className="text-slate-500 text-sm font-medium">Registre a atividade do aluno.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 bg-slate-50 text-slate-400 hover:text-slate-600 rounded-full transition-all active:scale-90">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-10 space-y-8">
          {erro && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-600 text-xs font-bold text-center">
              {erro}
            </div>
          )}

          <div className="grid grid-cols-1 gap-8">
            {/* Data */}
            <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                    <Calendar size={14} className="text-emerald-500" /> Data da Sessão
                </label>
                <input
                    type="date"
                    value={data}
                    max={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setData(e.target.value)}
                    className="w-full bg-slate-50 border border-black/5 rounded-2xl px-5 py-4 text-slate-900 font-bold outline-none focus:ring-2 focus:ring-emerald-500/10 transition-all"
                    required
                />
            </div>

            {/* Status Selector */}
            <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Status da Aula</label>
                <div className="grid grid-cols-3 gap-3">
                    {[
                        { id: 'realizada', label: 'Presente', icon: CheckCircle2, color: 'emerald' },
                        { id: 'falta_com_reposicao', label: 'Reposição', icon: Clock, color: 'amber' },
                        { id: 'falta_sem_reposicao', label: 'Falta', icon: AlertTriangle, color: 'red' }
                    ].map(s => (
                        <button
                            key={s.id}
                            type="button"
                            onClick={() => setStatus(s.id)}
                            className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all
                                ${status === s.id 
                                    ? `bg-${s.color}-500 text-white border-${s.color}-400 shadow-lg` 
                                    : 'bg-slate-50 text-slate-400 border-black/5 hover:bg-slate-100'}`}
                        >
                            <s.icon size={20} />
                            <span className="text-[10px] font-black uppercase tracking-tight">{s.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Plano Selector */}
            {status === 'realizada' && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                        <Dumbbell size={14} className="text-emerald-500" /> Treino Aplicado
                    </label>
                    <select
                        value={planoId}
                        onChange={(e) => setPlanoId(e.target.value)}
                        className="w-full bg-slate-50 border border-black/5 rounded-2xl px-5 py-4 text-slate-900 font-bold outline-none appearance-none cursor-pointer"
                    >
                        <option value="">Selecione o plano...</option>
                        {planos?.filter(p => p.esta_ativo).map(p => (
                            <option key={p.id} value={p.id}>{p.titulo}</option>
                        ))}
                    </select>
                </div>
            )}

            {/* Observação */}
            <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                    <MessageSquare size={14} className="text-emerald-500" /> 
                    {status === 'realizada' ? 'Notas de Performance' : 'Motivo da Ausência'}
                </label>
                <textarea
                    value={observacao}
                    onChange={(e) => setObservacao(e.target.value)}
                    placeholder={status === 'realizada' ? "Ex: Evoluiu carga..." : "Ex: Problema de saúde..."}
                    className="w-full bg-slate-50 border border-black/5 rounded-2xl px-5 py-4 text-slate-900 font-medium outline-none min-h-[100px] resize-none focus:ring-2 focus:ring-emerald-500/10 transition-all placeholder:text-slate-300"
                />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3
                ${loading ? 'bg-slate-100 text-slate-300' : 'bg-emerald-500 hover:bg-emerald-400 text-white shadow-emerald-500/20'}`}
          >
            {loading ? <div className="w-4 h-4 border-2 border-slate-300 border-t-transparent rounded-full animate-spin" /> : <CheckCircle2 size={18} />}
            {loading ? 'Sincronizando...' : 'Confirmar Check-in'}
          </button>
        </form>
      </div>
    </div>
  );
}

import { useActionState, useEffect } from 'react'; // <--- Adicione useEffect
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

// Action (Mantém igual)
async function registrarSessaoAction(prevState, formData) {
  const aluno_id = formData.get('aluno_id');
  const tipo = formData.get('tipo'); 
  
  const payload = {
    aluno_id: parseInt(aluno_id),
    realizada: tipo === 'presente',
    motivo_ausencia: tipo === 'falta' ? 'Ausência não justificada (Check-in Rápido)' : null,
    observacoes_performance: tipo === 'presente' ? 'Presença registrada via App' : null
  };

  try {
    const response = await fetch('http://localhost:8000/sessoes/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const errorData = await response.json();
        return { success: false, error: errorData.detail || 'Erro ao registrar' };
    }
    
    // Retorna o tipo para personalizarmos a mensagem
    return { success: true, tipo: tipo, timestamp: Date.now() };
  } catch (err) {
    return { success: false, error: 'Erro de conexão' };
  }
}

export function CheckInCard({ alunoId, onSucesso }) {
  const [state, formAction, isPending] = useActionState(registrarSessaoAction, null);

  // ✅ NOVO: Delay antes do reload para o usuário ler a mensagem
  useEffect(() => {
    if (state?.success && onSucesso) {
      const timer = setTimeout(() => {
        onSucesso();
      }, 1500); // Espera 1.5 segundos antes de recarregar
      return () => clearTimeout(timer);
    }
  }, [state, onSucesso]);

  return (
    <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow border border-slate-200 dark:border-slate-700">
      <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-3 uppercase tracking-wider">
        Check-in Rápido (Hoje)
      </h3>
      
      {/* Mensagens de Feedback */}
      {state?.error && (
          <div className="mb-3 p-2 text-xs text-red-600 bg-red-50 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-800 animate-in slide-in-from-top-1">
            {state.error}
          </div>
      )}

      {state?.success && (
          <div className={`mb-3 p-2 text-xs rounded border animate-in slide-in-from-top-1 flex items-center gap-2 ${
            state.tipo === 'presente' 
              ? 'text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800'
              : 'text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800'
          }`}>
            {state.tipo === 'presente' 
              ? <CheckCircle className="w-4 h-4"/> 
              : <XCircle className="w-4 h-4"/>}
            <span className="font-medium">
              {state.tipo === 'presente' ? 'Presença confirmada!' : 'Falta registrada.'}
            </span>
          </div>
      )}

      <form action={formAction} className="grid grid-cols-2 gap-3">
        <input type="hidden" name="aluno_id" value={alunoId} />
        
        <button
          type="submit"
          name="tipo"
          value="presente"
          disabled={isPending || state?.success}
          className="flex items-center justify-center gap-2 p-3 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800 dark:hover:bg-emerald-900/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
          <span className="font-medium">Presente</span>
        </button>

        <button
          type="submit"
          name="tipo"
          value="falta"
          disabled={isPending || state?.success}
          className="flex items-center justify-center gap-2 p-3 rounded-md bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <XCircle className="w-5 h-5" />}
          <span className="font-medium">Falta</span>
        </button>
      </form>
    </div>
  );
}


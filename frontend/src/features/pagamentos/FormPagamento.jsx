import { useActionState } from 'react';

async function salvarPagamentoAction(prevState, formData) {
    try {
        const alunoId = parseInt(formData.get('aluno_id'));
        const valor = parseFloat(formData.get('valor'));
        const formaPagamento = formData.get('forma_pagamento');
        const observacao = formData.get('observacao') || '';

        const payload = {
            aluno_id: alunoId,
            valor: valor,
            forma_pagamento: formaPagamento,
            observacao: observacao
        };

        const response = await fetch('http://localhost:8000/pagamentos/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const error = await response.json();
            return { 
                success: false, 
                message: error.detail || 'Erro ao registrar pagamento' 
            };
        }

        const pagamento = await response.json();
        return { 
            success: true, 
            message: 'Pagamento registrado com sucesso!',
            data: pagamento
        };

    } catch (error) {
        return { 
            success: false, 
            message: 'Erro de conexão com o servidor' 
        };
    }
}

export default function FormPagamento({ alunoId, onSuccess }) {
    const [state, formAction, isPending] = useActionState(
        salvarPagamentoAction,
        { success: null, message: '', data: null }
    );

    // Se salvou com sucesso, chamar callback
    if (state.success && onSuccess) {
        setTimeout(() => {
            onSuccess(state.data);
        }, 100);
    }

    return (
        <form action={formAction} className="space-y-4">
            <input type="hidden" name="aluno_id" value={alunoId} />

            <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                    Valor (R$) *
                </label>
                <input
                    type="number"
                    name="valor"
                    step="0.01"
                    min="50"
                    max="5000"
                    required
                    placeholder="150.00"
                    className="w-full px-3 py-2 border border-slate-600 
                             rounded-lg bg-slate-800 
                             text-slate-100 placeholder-slate-500
                             focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                    Forma de Pagamento *
                </label>
                <select
                    name="forma_pagamento"
                    required
                    defaultValue="PIX"
                    className="w-full px-3 py-2 border border-slate-600 
                             rounded-lg bg-slate-800 
                             text-slate-100
                             focus:ring-2 focus:ring-emerald-500"
                >
                    <option value="PIX">PIX</option>
                    <option value="Dinheiro">Dinheiro</option>
                    <option value="Cartão de Crédito">Cartão de Crédito</option>
                    <option value="Cartão de Débito">Cartão de Débito</option>
                    <option value="Transferência Bancária">Transferência Bancária</option>
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                    Observação (opcional)
                </label>
                <textarea
                    name="observacao"
                    rows={3}
                    maxLength={500}
                    placeholder="Ex: Pagamento referente ao mês de fevereiro"
                    className="w-full px-3 py-2 border border-slate-600 
                             rounded-lg bg-slate-800 
                             text-slate-100 placeholder-slate-500
                             focus:ring-2 focus:ring-emerald-500 resize-none"
                />
            </div>

            {state.message && (
                <div className={`p-3 rounded-lg text-sm ${
                    state.success 
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                        : 'bg-red-500/20 text-red-300 border border-red-500/30'
                }`}>
                    {state.message}
                </div>
            )}

            <button
                type="submit"
                disabled={isPending}
                className="w-full bg-emerald-600 hover:bg-emerald-700 
                         text-white font-medium py-2.5 px-4 rounded-lg
                         disabled:opacity-50 disabled:cursor-not-allowed
                         transition-colors duration-200
                         flex items-center justify-center gap-2
                         shadow-lg shadow-emerald-500/30"
            >
                {isPending ? (
                    <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Processando...
                    </>
                ) : (
                    <>
                        💰 Registrar Pagamento
                    </>
                )}
            </button>
        </form>
    );
}
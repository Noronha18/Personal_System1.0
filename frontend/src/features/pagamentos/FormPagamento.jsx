import { useState } from 'react';
import { DollarSign, CreditCard, Calendar, CheckCircle2, Loader2, BookOpen } from 'lucide-react';

export default function FormPagamento({ alunoId, onSuccess }) {
  const [valor, setValor] = useState(0);
  const [formaPagamento, setFormaPagamento] = useState('PIX');
  const [referenciaMes, setReferenciaMes] = useState(
    `${String(new Date().getMonth() + 1).padStart(2, '0')}/${new Date().getFullYear()}`
  );
  
  // ✅ NOVO STATE
  const [qtdAulas, setQtdAulas] = useState(''); // Começa vazio ou 0
  
  const [observacao, setObservacao] = useState('');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErro(null);

    try {
      const payload = {
        aluno_id: parseInt(alunoId),
        valor: valor,
        forma_pagamento: formaPagamento,
        referencia_mes: referenciaMes,
        observacao: observacao || null,
        
        // ✅ ENVIO DO CAMPO NOVO
        quantidade_aulas: qtdAulas ? parseInt(qtdAulas) : 0 
      };

      const res = await fetch('http://localhost:8000/pagamentos/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Erro ao registrar pagamento');

      setValor(0);
      setQtdAulas('');
      setObservacao('');
      onSuccess(); // Atualiza a lista pai
      
    } catch (err) {
      setErro(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center gap-2 mb-4">
        <DollarSign className="w-6 h-6 text-brand" />
        <h3 className="text-lg font-bold text-text-primary">Registrar Pagamento</h3>
      </div>

      {erro && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
          {erro}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Valor */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-text-secondary">Valor (R$)</label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-3.5 w-4 h-4 text-text-muted" />
            <input
              type="text"
              value={new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(valor)}
              onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "");
                  const floatValue = parseFloat(val) / 100;
                  setValor(floatValue || 0);
              }}
              className="w-full bg-canvas border border-border rounded-lg pl-10 p-3 text-text-primary focus:ring-2 focus:ring-brand/20 outline-none"
              placeholder="0,00"
              required
            />
          </div>
        </div>

        {/* Quantidade de Aulas (Novo) */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-text-secondary flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-brand" />
            Aulas no Pacote
          </label>
          <input
            type="number"
            min="0"
            value={qtdAulas}
            onChange={(e) => setQtdAulas(e.target.value)}
            className="w-full bg-canvas border border-border rounded-lg p-3 text-text-primary focus:ring-2 focus:ring-brand/20 outline-none"
            placeholder="Ex: 8, 12 (Soma na meta mensal)"
          />
        </div>

        {/* Mês Referência */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-text-secondary">Referência (MM/AAAA)</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-3.5 w-4 h-4 text-text-muted" />
            <input
              type="text"
              value={referenciaMes}
              onChange={(e) => setReferenciaMes(e.target.value)}
              className="w-full bg-canvas border border-border rounded-lg pl-10 p-3 text-text-primary focus:ring-2 focus:ring-brand/20 outline-none"
              placeholder="MM/AAAA"
              required
            />
          </div>
        </div>

        {/* Forma de Pagamento */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-text-secondary">Forma de Pagamento</label>
          <div className="relative">
            <CreditCard className="absolute left-3 top-3.5 w-4 h-4 text-text-muted" />
            <select
              value={formaPagamento}
              onChange={(e) => setFormaPagamento(e.target.value)}
              className="w-full bg-canvas border border-border rounded-lg pl-10 p-3 text-text-primary focus:ring-2 focus:ring-brand/20 outline-none appearance-none"
            >
              <option value="PIX">PIX</option>
              <option value="Dinheiro">Dinheiro</option>
              <option value="Cartão Crédito">Cartão de Crédito</option>
              <option value="Cartão Débito">Cartão de Débito</option>
            </select>
          </div>
        </div>
      </div>

      {/* Observação */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-text-secondary">Observação (Opcional)</label>
        <textarea
          value={observacao}
          onChange={(e) => setObservacao(e.target.value)}
          className="w-full bg-canvas border border-border rounded-lg p-3 text-text-primary focus:ring-2 focus:ring-brand/20 outline-none min-h-[80px]"
          placeholder="Detalhes adicionais..."
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-brand hover:bg-brand-hover text-brand-fg rounded-lg font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Processando...
          </>
        ) : (
          <>
            <CheckCircle2 className="w-5 h-5" />
            Confirmar Pagamento
          </>
        )}
      </button>
    </form>
  );
}

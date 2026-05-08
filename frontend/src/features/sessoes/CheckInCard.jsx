import { useState } from 'react';
import { ClipboardCheck, Plus } from 'lucide-react';
import ModalRegistrarSessao from './ModalRegistrarSessao'; // ✅ Importação correta

export const CheckInCard = ({ alunoId, planos, onSucesso }) => {
  const [modalAberto, setModalAberto] = useState(false);

  return (
    <>
      <div className="bg-text-primary border border-border-strong rounded-xl p-6 shadow-lg flex flex-col items-center justify-center text-center h-full hover:border-brand/50 transition-colors group">

        <div className="p-4 bg-text-secondary/20 rounded-full mb-4 group-hover:scale-110 transition-transform duration-300 border border-border-strong group-hover:border-brand/30">
          <ClipboardCheck className="w-8 h-8 text-brand" />
        </div>

        <h3 className="text-lg font-bold text-brand-fg mb-2">
          Registrar Treino
        </h3>

        <p className="text-sm text-text-muted mb-6 max-w-[200px]">
          Registre presença, selecione o treino realizado ou justifique faltas.
        </p>

        <button
          onClick={() => setModalAberto(true)}
          className="w-full py-3 bg-brand hover:bg-brand-hover text-brand-fg rounded-lg font-bold transition-all active:scale-95 flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Novo Registro
        </button>
      </div>

      {modalAberto && (
        <ModalRegistrarSessao
          alunoId={alunoId}
          planos={planos}
          onClose={() => setModalAberto(false)}
          onSucesso={onSucesso}
        />
      )}
    </>
  );
};

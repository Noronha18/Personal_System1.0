import { useState } from 'react';
import { ClipboardCheck, Plus } from 'lucide-react';
import ModalRegistrarSessao from './ModalRegistrarSessao'; // ✅ Importação correta

export const CheckInCard = ({ alunoId, planos, onSucesso }) => {
  const [modalAberto, setModalAberto] = useState(false);

  return (
    <>
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg flex flex-col items-center justify-center text-center h-full hover:border-emerald-500/50 transition-colors group">
        
        <div className="p-4 bg-slate-800 rounded-full mb-4 group-hover:scale-110 transition-transform duration-300 border border-slate-700 group-hover:border-emerald-500/30">
          <ClipboardCheck className="w-8 h-8 text-emerald-500" />
        </div>

        <h3 className="text-lg font-bold text-slate-200 mb-2">
          Registrar Treino
        </h3>
        
        <p className="text-sm text-slate-400 mb-6 max-w-[200px]">
          Registre presença, selecione o treino realizado ou justifique faltas.
        </p>

        <button
          onClick={() => setModalAberto(true)} // ✅ Agora SÓ abre o modal
          className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold shadow-lg shadow-emerald-900/20 transition-all active:scale-95 flex items-center justify-center gap-2"
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

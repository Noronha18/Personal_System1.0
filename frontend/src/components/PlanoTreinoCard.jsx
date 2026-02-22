import { FileText } from 'lucide-react';
import { TreinoCard } from './TreinoCard';

export function PlanoTreinoCard({ plano }) {
  return (
    <div className="mb-8 last:mb-0">
      <div className="flex items-center gap-3 px-2 mb-4">
        <FileText size={18} className="text-blue-500" />
        <h3 className="font-bold text-slate-700">{plano.titulo}</h3>
        <div className="h-[2px] bg-slate-200 flex-grow rounded-full" />
      </div>

      <div className="space-y-2">
        {plano.treinos?.map(t => <TreinoCard key={t.id} treino={t} />)}
        {(!plano.treinos || plano.treinos.length === 0) && (
          <p className="text-xs text-slate-400 italic pl-4">Nenhum treino vinculado a este plano.</p>
        )}
      </div>
    </div>
  );
}

import { FileText } from 'lucide-react';
import { TreinoCard } from './TreinoCard';

export function PlanoTreinoCard({ plano }) {
  return (
    <div className="mb-10 last:mb-0">
      <div className="flex items-center gap-3 px-1 mb-5">
        <FileText size={16} className="text-brand" />
        <h3 className="font-bold text-text-primary text-sm uppercase tracking-widest">{plano.titulo}</h3>
        <div className="h-px bg-border flex-grow ml-2" />
      </div>

      <div className="space-y-3">
        {plano.treinos?.map(t => <TreinoCard key={t.id} treino={t} />)}
        {(!plano.treinos || plano.treinos.length === 0) && (
          <p className="text-xs text-text-muted italic pl-2">Nenhum treino vinculado a este plano operacional.</p>
        )}
      </div>
    </div>
  );
}

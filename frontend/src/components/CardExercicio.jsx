export function CardExercicio({ nome, carga, repeticoes }) {
  return (
    <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl hover:border-emerald-500/50 transition-colors group">
      <div className="flex justify-between items-start">
        <h4 className="font-medium text-slate-200 group-hover:text-emerald-400 transition-colors">
          {nome}
        </h4>
        <span className="text-xs font-mono text-slate-500 bg-slate-800 px-2 py-1 rounded">
          {carga} KG
        </span>
      </div>
      <div className="mt-2 text-sm text-slate-400">
        <span className="flex items-center gap-1">
          ⚙️ {repeticoes}
        </span>
      </div>
    </div>
  )
}

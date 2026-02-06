import { ListaAlunosFeature } from './features/alunos/ListaAlunos'

function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Mantivemos seu Header Elegante */}
        <header className="flex justify-between items-center mb-12 border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              Personal_System 1.0
            </h1>
            <p className="text-slate-500 text-sm mt-1">Gestão de Performance & Prescrição</p>
          </div>
          {/* Atualizado para a data de hoje: 05 de Fevereiro */}
          <div className="text-sm text-slate-400 font-medium px-4 py-2 bg-slate-900 rounded-full border border-slate-800">
            05 de Fevereiro, 2026
          </div>
        </header>
        
        {/* Chamada para a nova Listagem que criamos */}
        <main className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <ListaAlunosFeature />
        </main>
      </div>
    </div>
  )
}

export default App;
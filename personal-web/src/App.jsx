import { useState, useEffect } from 'react'
import axios from 'axios'
import { CardExercicio } from './components/CardExercicio'

function App() {
  const [aluno, setAluno] = useState(null)

  useEffect(() => {
    
    axios.get('http://localhost:8000/alunos/1')
      .then(response => {
        setAluno(response.data)
      })
      .catch(error => console.error("Erro ao buscar aluno:", error))
  }, [])

// Substitua o return do seu App.jsx
return (
  <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
    <div className="max-w-4xl mx-auto">
      <header className="flex justify-between items-center mb-12">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
          Personal_System 1.0
        </h1>
        <div className="text-sm text-slate-400">30 de Janeiro, 2026</div>
      </header>
      
      {aluno ? (
        <div className="space-y-8 animate-in fade-in duration-700">
          <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <h2 className="text-xl font-semibold mb-1">Atleta: {aluno.nome}</h2>
            <p className="text-slate-400 text-sm">Status: 
              <span className="ml-2 px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-xs">
                {aluno.status_financeiro.toUpperCase()}
              </span>
            </p>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {aluno.planos_treino?.map(plano => (
              <div key={plano.id} className="space-y-4">
                <h3 className="text-lg font-medium text-slate-300 border-l-4 border-emerald-500 pl-4">
                  {plano.titulo}
                </h3>
                
                {plano.prescricoes?.map(prescricao => (
                  <CardExercicio 
                    key={prescricao.id}
                    nome={prescricao.nome_exercicio}
                    carga={prescricao.carga_kg}
                    repeticoes={prescricao.repeticoes}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-emerald-500"></div>
        </div>
      )}
    </div>
  </div>
)

}

export default App

import { useActionState, useState } from 'react';
import { Loader2, PlusCircle, Trash2, Dumbbell } from 'lucide-react';

// ========== SERVER ACTION ==========
async function submitPlanoAction(prevState, formData) {
  const alunoId = parseInt(formData.get('aluno_id'));

  // Coletar todos os exercícios do form
  const exercicios = [];
  const nomes = formData.getAll("nome_exercicio");
  const series = formData.getAll("series");
  const repeticoes = formData.getAll("repeticoes");
  const cargas = formData.getAll("carga_kg");
  const descansos = formData.getAll("tempo_descanso_segundos");

  // Montar array de exercícios
  for (let i = 0; i < nomes.length; i++) {
    exercicios.push({
      nome_exercicio: nomes[i],
      series: parseInt(series[i]),
      repeticoes: repeticoes[i],
      carga_kg: parseFloat(cargas[i]) || 0,
      tempo_descanso_segundos: parseInt(descansos[i]) || 60,
      notas_tecnicas: null
    });
  }

  const payload = {
    aluno_id: alunoId,
    titulo: formData.get('titulo'),
    objetivo_estrategico: formData.get('objetivo_estrategico'),
    esta_ativo: true,
    prescricoes: exercicios
  };

  try {
    const res = await fetch('http://localhost:8000/planos/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const error = await res.json();
      return { success: false, error: error.detail || "Erro ao salvar plano." };
    }

    const data = await res.json(); // ✅ CORRIGIDO: era "awit"
    return { success: true, timestamp: Date.now(), data };
  } catch (e) {
    return { success: false, error: "Erro de conexão com o servidor." };
  }
}

// ========== COMPONENTE ==========
export function FormPlanoTreino({ alunoId, onSuccess }) { // ✅ CORRIGIDO: PascalCase
  const [state, formAction, isPending] = useActionState(submitPlanoAction, null);

  // Estado local para UI (adicionar/remover linhas)
  const [exercicios, setExercicios] = useState([{ id: Date.now() }]); // ✅ CORRIGIDO: nome correto

  const adicionarExercicio = () => {
    setExercicios([...exercicios, { id: Date.now() }]);
  };

  const removerExercicio = (id) => {
    if (exercicios.length > 1) {
      setExercicios(exercicios.filter(e => e.id !== id)); // ✅ CORRIGIDO: e.id
    }
  };

  // Callback de sucesso
  if (state?.success && state.timestamp) {
    setTimeout(() => {
      onSuccess(state.data);
      setExercicios([{ id: Date.now() }]); // Reset form
    }, 1500);
  }

  return (
    <div className="mt-8 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-zinc-900 dark:to-zinc-800 rounded-xl border border-blue-200 dark:border-zinc-700 shadow-lg">
      <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-6 flex items-center gap-2">
        <Dumbbell className="w-6 h-6 text-blue-600" />
        Criar Nova Ficha de Treino
      </h3>

      <form action={formAction} className="space-y-6">
        <input type="hidden" name="aluno_id" value={alunoId} />

        {/* Cabeçalho do Plano */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
              Título do Plano *
            </label>
            <input
              name="titulo"
              required
              placeholder="Ex: Treino A - Superior"
              className="w-full p-3 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-600 focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-zinc-900"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
              Objetivo Estratégico
            </label>
            <input
              name="objetivo_estrategico"
              placeholder="Ex: Hipertrofia de peitoral"
              className="w-full p-3 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-600 focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-zinc-900"
            />
          </div>
        </div>

        {/* Lista Dinâmica de Exercícios */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="text-md font-bold text-zinc-800 dark:text-zinc-200">
              Exercícios ({exercicios.length})
            </h4>
            <button
              type="button"
              onClick={adicionarExercicio}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
            >
              <PlusCircle className="w-4 h-4" /> Adicionar Exercício
            </button>
          </div>

          {exercicios.map((ex, index) => (
            <div key={ex.id} className="p-4 bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 shadow-sm">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-bold text-zinc-500">Exercício #{index + 1}</span>
                {exercicios.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removerExercicio(ex.id)}
                    className="text-red-500 hover:text-red-700 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                <div className="md:col-span-2">
                  <input
                    name="nome_exercicio"
                    required
                    placeholder="Nome do exercício"
                    className="w-full p-2 rounded bg-zinc-50 dark:bg-zinc-700 border border-zinc-300 dark:border-zinc-600 dark:text-zinc-900 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <input
                    name="series"
                    type="number"
                    required
                    defaultValue={3}
                    placeholder="Séries"
                    className="w-full p-2 rounded bg-zinc-50 dark:bg-zinc-700 border border-zinc-300 dark:border-zinc-600 dark:text-zinc-900 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <input
                    name="repeticoes"
                    required
                    defaultValue="10-12"
                    placeholder="Reps"
                    className="w-full p-2 rounded bg-zinc-50 dark:bg-zinc-700 border border-zinc-300 dark:border-zinc-600 dark:text-zinc-900 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <input
                    name="carga_kg"
                    type="number"
                    step="0.5"
                    defaultValue={0}
                    placeholder="Carga (kg)"
                    className="w-full p-2 rounded bg-zinc-50 dark:bg-zinc-700 border border-zinc-300 dark:border-zinc-600 dark:text-zinc-900 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
              <input type="hidden" name="tempo_descanso_segundos" value="60" />
            </div>
          ))}
        </div>

        {/* Feedback */}
        {state?.error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-600 dark:text-red-400 font-medium">{state.error}</p>
          </div>
        )}
        {state?.success && (
          <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <p className="text-green-600 dark:text-green-400 font-medium">
              ✅ Plano "{state.data.titulo}" criado com {state.data.prescricoes.length} exercícios!
            </p>
          </div>
        )}

        {/* Botão Submit */}
        <button
          type="submit"
          disabled={isPending}
          className="w-full flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? (
            <>
              <Loader2 className="animate-spin w-5 h-5" /> Salvando Plano...
            </>
          ) : (
            <>
              <Dumbbell className="w-5 h-5" /> Prescrever Plano Completo
            </>
          )}
        </button>
      </form>
    </div>
  );
}

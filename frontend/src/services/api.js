const BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

/**
 * Utilitário base para chamadas API
 */
async function apiFetch(endpoint, options = {}) {
    const token = localStorage.getItem('token');
    
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (response.status === 401) {
        // Apenas limpamos o token, o App.jsx vai reagir ao estado ou erro
        localStorage.removeItem('token');
        throw new Error('Sessão expirada. Por favor, faça login novamente.');
    }

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Erro na comunicação com o servidor');
    }

    if (response.status === 204) return null;
    
    return response.json();
}

export const alunoService = {
    listar: () => apiFetch('/alunos/'),
    obterPorId: (id) => apiFetch(`/alunos/${id}`),
    criar: (dados) => apiFetch('/alunos/', {
        method: 'POST',
        body: JSON.stringify(dados),
    }),
    atualizarStatus: (id, status) => apiFetch(`/alunos/${id}/status?status=${status}`, {
        method: 'PATCH',
    }),
    registrarPresenca: (alunoId) => apiFetch('/sessoes/', {
        method: 'POST',
        body: JSON.stringify({
            aluno_id: alunoId,
            realizada: true
        }),
    }),
    deletar: (id) => apiFetch(`/alunos/${id}`, {
        method: 'DELETE',
    }),
};

export const treinoService = {
    listarExercicios: () => apiFetch('/exercicios/'),
    criarExercicio: (dados) => apiFetch('/exercicios/', {
        method: 'POST',
        body: JSON.stringify(dados),
    }),
    
    // Gestão de Planos
    criarPlano: (alunoId, dados) => apiFetch(`/alunos/${alunoId}/planos`, {
        method: 'POST',
        body: JSON.stringify(dados),
    }),
    atualizarPlano: (planoId, dados) => apiFetch(`/planos/${planoId}`, {
        method: 'PATCH',
        body: JSON.stringify(dados),
    }),
    deletarPlano: (id) => apiFetch(`/planos/${id}`, {
        method: 'DELETE',
    }),
    clonarPlano: (planoId, alunoId = null) => {
        const url = alunoId ? `/planos/${planoId}/clonar?aluno_id=${alunoId}` : `/planos/${planoId}/clonar`;
        return apiFetch(url, { method: 'POST' });
    },

    // Templates Globais
    listarTemplates: () => apiFetch('/planos/templates'),
    criarTemplate: (dados) => apiFetch('/planos/templates', {
        method: 'POST',
        body: JSON.stringify(dados),
    }),
};

export const financeiroService = {
    obterEstatisticas: () => apiFetch('/pagamentos/estatisticas'),
};

export const pagamentoService = {
    listar: () => apiFetch('/pagamentos/'),
    registrar: (dados) => apiFetch('/pagamentos/', {
        method: 'POST',
        body: JSON.stringify(dados),
    }),
    deletar: (id) => apiFetch(`/pagamentos/${id}`, {
        method: 'DELETE',
    }),
};

export const sessaoService = {
    listar: (params) => {
        const query = new URLSearchParams(params).toString();
        return apiFetch(`/sessoes/?${query}`);
    },
    registrar: (dados) => apiFetch('/sessoes/', {
        method: 'POST',
        body: JSON.stringify(dados),
    }),
    deletar: (id) => apiFetch(`/sessoes/${id}`, {
        method: 'DELETE',
    }),
};

export const authService = {
    login: async (username, password) => {
        const formData = new FormData();
        formData.append('username', username);
        formData.append('password', password);

        const response = await fetch(`${BASE_URL}/auth/token`, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) throw new Error('Usuário ou senha inválidos');
        
        const data = await response.json();
        localStorage.setItem('token', data.access_token);
        return data;
    },
    logout: () => {
        localStorage.removeItem('token');
    }
};

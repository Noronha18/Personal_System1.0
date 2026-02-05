# Personal_System 1.0 🚀
> Sistema inteligente de gestão de treinos e performance para Personal Trainers.

O **Personal_System 1.0** é uma plataforma full-stack desenvolvida para modernizar a prescrição de treinos. Utilizando uma arquitetura orientada ao domínio, o sistema separa a prescrição técnica da execução real, permitindo uma análise precisa da evolução de carga e performance do atleta.

## 🛠️ Stack Tecnológica (Edição 2026)
- **Backend**: FastAPI (Python 3.12+) + SQLAlchemy 2.1 + Pydantic V2 [web:115][web:127].
- **Frontend**: React 19 + Vite + Tailwind CSS 4.0 [web:44][web:45].
- **Banco de Dados**: PostgreSQL 15 (Dockerizado) [web:16].
- **Ambiente**: Gerenciado via `uv` (Python) e `fnm` (Node) para máxima reprodutibilidade [web:1][web:82].

## ✨ Funcionalidades Atuais (Barra Verde)
- ✅ **Gestão de Alunos**: Cadastro completo com validação de CPF e dados financeiros.
- ✅ **Prescrição Inteligente**: Criação de Planos de Treino com exercícios detalhados.
- ✅ **Dashboard de Performance**: Visualização dinâmica dos treinos consumindo API em tempo real.
- ✅ **Integração Robusta**: Fluxo de dados aninhado (Eager Loading) do banco ao frontend [web:119].

## 🚀 Próximos Marcos (Janeiro 2026)
- [ ] **Evolução de Performance**: Gráficos analíticos de carga (kg) vs tempo.
- [ ] **Gestão Financeira Automática**: Status de inadimplência baseado em data de vencimento.

## ⚙️ Como Executar
1. Clone o repositório.
2. No Backend: `uv run uvicorn main:app --reload`.
3. No Frontend: `cd personal-web && npm install && npm run dev`.

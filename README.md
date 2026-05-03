# Personal_System 1.0 🚀
> Sistema inteligente de gestão de treinos e performance financeira para Personal Trainers.

O **Personal_System 1.0** é uma plataforma full-stack desenvolvida para modernizar a prescrição de treinos e a gestão de alunos. Utilizando uma arquitetura orientada ao domínio, o sistema separa a prescrição técnica da execução real, permitindo uma análise precisa da evolução de carga e do controle financeiro do atleta.

## 🛠️ Stack Tecnológica
- **Backend**: FastAPI (Python 3.12+) + SQLAlchemy 2.x (Async) + Pydantic v2.
- **Frontend**: React 19 + Vite + Tailwind CSS (Tema Claro estilo iOS).
- **Banco de Dados**: PostgreSQL 15 (Dockerizado) com migrações via Alembic.
- **Ambiente**: Gerenciado via `uv` (Python) e `fnm` (Node) para máxima reprodutibilidade.

## ✨ Funcionalidades Principais
- ✅ **Gestão de Alunos Avançada**: Cadastro com validação de CPF, controle de modalidades de pagamento (Mensalidade e Pacote de Aulas) e controle de status (Ativo, Suspenso, Cancelado).
- ✅ **Frequência e Check-in**: Controle de sessões realizadas (Check-in Rápido) com abatimento automático de saldo para alunos de pacote.
- ✅ **Prescrição Inteligente**: Criação de Planos de Treino organizados por blocos (Treino A, B, C) e exercícios detalhados com carga e descanso.
- ✅ **Dashboard Financeiro Automático**: Gráficos e KPIs de receita mensal, ticket médio, taxa de inadimplência e controle de alunos em dia vs. atrasados.
- ✅ **Integração Robusta**: Fluxo de dados aninhado (Eager Loading assíncrono via `selectinload`) do banco ao frontend, garantindo alta performance e tipagem rigorosa.

## 🚀 Próximos Marcos
- [ ] **Evolução de Performance**: Gráficos analíticos de evolução de carga (kg) vs tempo por exercício.
- [ ] **App Mobile (PWA/React Native)**: Adaptação da interface para uso nativo no celular durante os treinos.
- [ ] **Notificações**: Alertas de vencimento de plano e renovação de pacote via WhatsApp/Email.

## ⚙️ Como Executar

### 1. Requisitos
- Docker e Docker Compose
- `uv` instalado (gerenciador de pacotes Python)
- Node.js (preferencialmente via `fnm` ou `nvm`)

### 2. Iniciando o Banco de Dados
```bash
docker-compose up -d
```

### 3. Backend (FastAPI)
```bash
cd backend
uv sync # Instala as dependências
alembic upgrade head # Aplica as migrações no banco
uv run uvicorn src.api:app --reload --port 8000
```

### 4. Frontend (React/Vite)
```bash
cd frontend
npm install
npm run dev
```

A API estará disponível em `http://localhost:8000` e o Frontend em `http://localhost:5173`.

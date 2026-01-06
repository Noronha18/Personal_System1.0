🏋️ Personal System 1.0
Sistema de Gestão Profissional para Personal Trainers
Desenvolvido com Python, Flet e PostgreSQL.

O Personal System é uma solução Desktop multiplataforma (focada em Linux/Windows) criada para substituir planilhas e anotações manuais na gestão de alunos de consultoria esportiva e personal training.

O sistema oferece um CRM completo que gerencia desde o cadastro do aluno até o controle financeiro de mensalidades, com feedback visual de status (Adimplente/Inadimplente) e histórico detalhado de treinos.

🚀 Funcionalidades Principais
👥 Gestão de Alunos: Cadastro completo com anamnese (objetivos, restrições médicas) e dados contratuais.

📅 Diário de Classe Digital:

Registro de Aulas e Faltas via Modal.

Controle de Reposições.

Barra de progresso mensal automática (Aulas Feitas vs. Contratadas).

💰 Controle Financeiro Integrado:

Monitoramento de mensalidades com status visual (🟢 Em dia / 🔴 Atrasado).

Registro de pagamentos com data, valor e forma (Pix, Dinheiro, etc.).

Histórico financeiro por aluno.

📊 Interface Reativa: UI construída com Flet (Flutter para Python), oferecendo responsividade e design moderno.

💾 Persistência Robusta: Banco de dados PostgreSQL rodando localmente, garantindo integridade e segurança dos dados.

🛠️ Tecnologias Utilizadas
Linguagem: Python 3.12+

Interface (Frontend): Flet (Framework baseada em Flutter)

Banco de Dados: PostgreSQL

ORM: SQLAlchemy (Gerenciamento de modelos e sessões)

Driver: Psycopg2-binary

OS: Desenvolvido e testado em ambiente Linux (Zorin OS / Pop!_OS)

📸 Screenshots
(Aqui você pode colocar aquele print da tela inicial com os cards verdes/vermelhos)

🔧 Como Rodar Localmente
Clone o repositório:

bash
git clone https://github.com/Noronha18/Personal_System1.0.git
cd Personal_System1.0
Configure o Ambiente Virtual:

bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
Configure o Banco de Dados:

Certifique-se de ter o PostgreSQL rodando.

Crie um banco de dados e usuário (ajuste as credenciais em src/database.py).

Rode o script de inicialização:

bash
python -m src.init_db
Execute a Aplicação:

bash
python -m src.main
📝 Status do Projeto
✅ Versão 1.0 (MVP) - Concluída:

 CRUD de Alunos

 Registro de Aulas/Faltas

 Módulo Financeiro com Status Dinâmico

 Persistência em PostgreSQL

🔜 Próximos Passos (Roadmap):

 Dashboard com Gráficos de Faturamento.

 Migrations com Alembic.

 Geração de PDF de Treinos.

Desenvolvido por Emmanuel Noronha 🥋💻
Software Engineer & Personal Trainer

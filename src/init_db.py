import psycopg2
from src.database import DB_CONFIG


def init_db():
    conn = psycopg2.connect(**DB_CONFIG)
    cursor = conn.cursor()

    # Limpeza
    cursor.execute("DROP TABLE IF EXISTS aulas CASCADE;")
    cursor.execute("DROP TABLE IF EXISTS pagamentos CASCADE;")
    cursor.execute("DROP TABLE IF EXISTS alunos CASCADE;")

    # Tabela Alunos (COMPLETA AGORA)
    cursor.execute("""
                   CREATE TABLE alunos
                   (
                       id                 SERIAL PRIMARY KEY,
                       nome               VARCHAR(100) NOT NULL,
                       email              VARCHAR(100),
                       faixa              VARCHAR(50), -- Pode ser usado como 'Objetivo'
                       data_inicio        DATE    DEFAULT CURRENT_DATE,

                       -- Novos Campos Obrigatórios para a View
                       frequencia_semanal INTEGER DEFAULT 3,
                       valor_mensalidade  REAL    DEFAULT 0.0,
                       idade              INTEGER DEFAULT 0,
                       objetivo           TEXT,
                       restricoes         TEXT,
                       dia_vencimento     INTEGER DEFAULT 5
                   );
                   """)

    # Tabela Aulas
    cursor.execute("""
                   CREATE TABLE aulas
                   (
                       id                 SERIAL PRIMARY KEY,
                       aluno_id           INTEGER REFERENCES alunos (id) ON DELETE CASCADE,
                       data_aula          DATE    DEFAULT CURRENT_DATE,
                       conteudo_treino    TEXT,
                       realizada          BOOLEAN DEFAULT TRUE,
                       motivo_falta       TEXT,
                       reposicao_prevista BOOLEAN DEFAULT FALSE
                   );
                   """)
    cursor.execute("""
                   CREATE TABLE pagamentos
                   (
                       id              SERIAL PRIMARY KEY,
                       aluno_id        INTEGER REFERENCES alunos (id),
                       data_pagamento  DATE DEFAULT CURRENT_DATE,
                       valor           REAL,
                       referencia_mes  VARCHAR(7),
                       forma_pagamento VARCHAR(50),
                       observacao      TEXT
                   );
                   """)

    # Seed (Aluno Teste)
    cursor.execute("""
                   INSERT INTO alunos (nome, email, faixa, frequencia_semanal, valor_mensalidade)
                   VALUES ('Noronha Teste', 'teste@email.com', 'Hipertrofia', 3, 250.00)
                   """)

    print("✅ Banco recriado com colunas financeiras!")
    conn.commit()
    conn.close()


if __name__ == "__main__":
    init_db()

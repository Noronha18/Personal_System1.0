# src/database.py
# -*- coding: utf-8 -*-
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# CONFIGURAÇÃO DIRETA (HARDCODED PARA TESTE INICIAL)
# Motivo: Garantir que a conexão funciona antes de complicar com variáveis de ambiente.
DB_USER = "postgres"
DB_PASS = "181164"  # Sua senha confirmada
DB_HOST = "127.0.0.1" # IP Local
DB_PORT = "5432"    # Porta padrão (confirme se é essa mesmo no PgAdmin)
DB_NAME = "postgres" # Conectamos no 'postgres' primeiro para testar

# Montagem da URL com o parâmetro de encoding para o Windows não reclamar
DATABASE_URL = f"postgresql+psycopg2://{DB_USER}:{DB_PASS}@{DB_HOST}:{DB_PORT}/{DB_NAME}?client_encoding=utf8"

# Criação do Engine
engine = create_engine(DATABASE_URL, echo=True) # echo=True mostra o SQL no terminal

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Função simples para testar agora
if __name__ == "__main__":
    try:
        with engine.connect() as connection:
            print("\n" + "="*40)
            print("SUCESSO: Conexão com o PostgreSQL estabelecida!")
            print("="*40 + "\n")
    except Exception as e:
        print("\n" + "="*40)
        print(f"ERRO FATAL: {e}")
        print("="*40 + "\n")

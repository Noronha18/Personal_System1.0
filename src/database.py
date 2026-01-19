# src/database.py
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# --- CREDENCIAIS ---
DB_USER = "noronha_dev"
DB_PASS = "123456"
DB_HOST = "localhost"
DB_NAME = "personal_db_v2"
# Alterado para 5434 para evitar conflito com o outro projeto na 5433
DB_PORT = "5434"

DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASS}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

DB_CONFIG = {
    "dbname": DB_NAME,
    "user": DB_USER,
    "password": DB_PASS,
    "host": DB_HOST,
    "port": DB_PORT
}

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

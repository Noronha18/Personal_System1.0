# src/init_db.py
# Este arquivo foi depreciado em favor do Alembic.
# Não use este script para criar tabelas, pois ele ignora os Models do SQLAlchemy.

def init_db():
    print("⚠️ O banco de dados agora é gerenciado pelo Alembic.")
    print("Use 'uv run alembic upgrade head' para aplicar mudanças no esquema.")

if __name__ == "__main__":
    init_db()

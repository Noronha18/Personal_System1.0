# reset_db.py
from src.database import engine, Base
# Importe os models para que o SQLAlchemy saiba o que criar
from src.models import Aluno, Aula


def resetar_banco():
    print("🗑️  Apagando tabelas antigas...")
    # O comando drop_all apaga TODAS as tabelas ligadas a essa Base
    Base.metadata.drop_all(bind=engine)

    print("✨ Criando tabelas novas com as colunas atualizadas...")
    # O comando create_all recria tudo do zero
    Base.metadata.create_all(bind=engine)

    print("✅ Banco de dados resetado com sucesso!")


if __name__ == "__main__":
    resetar_banco()

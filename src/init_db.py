# init_db.py
# -*- coding: utf-8 -*-
from src.database import engine, SessionLocal, Base
from src.models import Usuario


def criar_banco():
    print("Criando tabelas no banco de dados...")
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()

    # Verifica se o Admin já existe
    admin = db.query(Usuario).filter(Usuario.username == "admin").first()

    if not admin:
        print("Criando usuário admin...")
        # Crie com uma senha simples para testar o login visual
        novo_usuario = Usuario(username="admin", senha="123")
        db.add(novo_usuario)
        db.commit()
        print("✅ Usuário 'admin' (senha: 123) criado com sucesso!")
    else:
        print("ℹ️ Usuário admin já existe.")

    db.close()

def init_db():
    print("Criando tabelas no banco de dados...")
    Base.metadata.create_all(bind=engine)
    print("Tabelas verificadas/criadas com sucesso!")

if __name__ == "__main__":
    criar_banco()

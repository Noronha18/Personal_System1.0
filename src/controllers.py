# src/controllers.py
from src.database import get_db
from src.models import Aluno
from sqlalchemy.exc import SQLAlchemyError

def criar_aluno(nome: str, freq: int, valor: float, dia_pag: int):
    """
    Tenta salvar um novo aluno no banco.
    Retorna (True, "Mensagem Sucesso") ou (False, "Erro")
    """
    db = next(get_db())
    try:
        novo = Aluno(
            nome=nome,
            frequencia_semanal_plano=freq,
            valor_mensalidade=valor,
            dia_pagamento=dia_pag
        )
        db.add(novo)
        db.commit()
        return True, f"Aluno {nome} cadastrado com sucesso!"
    except SQLAlchemyError as e:
        db.rollback()
        return False, f"Erro ao salvar no banco: {str(e)}"
    finally:
        db.close()

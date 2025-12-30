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
        return False, str(e)
    finally:
        db.close()


def editar_aluno(aluno_id: int, nome: str, frequencia: int, valor: float, idade: int, objetivo: str, restricoes: str):
    db = next(get_db())
    try:
        aluno = db.query(Aluno).filter(Aluno.id == aluno_id).first()
        if aluno:
            aluno.nome = nome
            aluno.frequencia_semanal_plano = frequencia
            aluno.valor_mensalidade = valor
            # NOVOS CAMPOS
            aluno.idade = idade
            aluno.objetivo = objetivo
            aluno.restricoes = restricoes

            db.commit()
            return True, "Dados atualizados com sucesso!"
        return False, "Aluno não encontrado."
    except Exception as e:
        db.rollback()
        return False, str(e)
    finally:
        db.close()


def contar_aulas_mes(aluno_id: int) -> int:
    """Conta quantas aulas REALIZADAS o aluno teve no mês atual"""
    db = next(get_db())
    try:
        agora = datetime.now()
        # 1. Cria a data do dia 1º
        inicio_mes = agora.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

        # 2. A CORREÇÃO MÁGICA ✨
        # .astimezone() adiciona o fuso horário do seu computador na data.
        # Agora ela fica compatível com o banco de dados.
        inicio_mes = inicio_mes.astimezone()

        qtd = db.query(Aula).filter(
            Aula.aluno_id == aluno_id,
            Aula.realizada == True,
            Aula.data_hora >= inicio_mes
        ).count()

        return qtd
    except Exception as e:
        print(f"Erro ao contar aulas: {e}")
        return 0
    finally:
        db.close()


def registrar_detalhado(aluno_id: int, obs: str, realizada: bool, reposicao: bool):
    db = next(get_db())
    try:
        nova_aula = Aula(
            aluno_id=aluno_id,
            observacao=obs,
            realizada=realizada,
            tem_reposicao=reposicao
        )
        db.add(nova_aula)
        db.commit()

        status = "Treino registrado" if realizada else "Falta registrada"
        return True, f"{status} com sucesso!"
    except Exception as e:
        db.rollback()
        return False, str(e)
    finally:
        db.close()


# --- Adicione isto no src/controllers.py ---

def verificar_status_financeiro(aluno) -> str:
    """
    Retorna 'atrasado', 'em_dia' ou 'pendente'.
    """
    # Se nunca pagou, está atrasado
    if not aluno.data_ultimo_pagamento:
        return "atrasado"

    ultimo = aluno.data_ultimo_pagamento
    hoje = datetime.now()

    # Se o último pagamento foi neste mês e neste ano, está PAGO.
    if ultimo.month == hoje.month and ultimo.year == hoje.year:
        return "em_dia"

    # Se não pagou este mês, verificamos o dia de vencimento
    if hoje.day > aluno.dia_pagamento:
        return "atrasado"
    else:
        # Fallback se a propriedade não tiver sido injetada ainda
        aulas_feitas = contar_aulas_mes(aluno.id)

    frequencia = aluno.frequencia_semanal_plano or 0
    meta_ciclo = frequencia * 4


    return "em_dia"


def registrar_pagamento(aluno_id: int):
    db = next(get_db())
    alunos = []  # <--- AQUI ESTÁ A CORREÇÃO (Inicia vazia)
    try:
        # Busca no banco
        alunos = db.query(Aluno).filter(Aluno.ativo == True).order_by(Aluno.nome).all()

        # Enriquece os objetos com dados calculados
        for aluno in alunos:
            aluno.aulas_feitas_mes = contar_aulas_mes(aluno.id)
            aluno.status_financeiro = verificar_status_financeiro(aluno)

        return alunos
    except Exception as e:
        print(f"Erro ao listar alunos: {e}")
        return []  # Se der erro, retorna lista vazia
    finally:
        db.close()

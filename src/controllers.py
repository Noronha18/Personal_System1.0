from datetime import datetime
from sqlalchemy import desc
from src.database import get_db
from src.models import Aluno, Aula, Pagamento  # Certifique-se de ter Pagamento importado


# --- FUNÇÕES DE ALUNO ---

def criar_aluno(nome: str, frequencia: int, valor: float, dia_pag: int, idade: int, objetivo: str, restricoes: str):
    db = next(get_db())
    try:
        novo_aluno = Aluno(
            nome=nome,
            frequencia_semanal_plano=frequencia,
            valor_mensalidade=valor,
            dia_pagamento=dia_pag,
            idade=idade,
            objetivo=objetivo,
            restricoes=restricoes
        )
        db.add(novo_aluno)
        db.commit()
        return True, "Aluno cadastrado com sucesso!"
    except Exception as e:
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


def excluir_aluno(aluno_id: int):
    db = next(get_db())
    try:
        aluno = db.query(Aluno).filter(Aluno.id == aluno_id).first()
        if aluno:
            db.delete(aluno)
            db.commit()
            return True, "Aluno excluído com sucesso!"
        return False, "Aluno não encontrado."
    except Exception as e:
        db.rollback()
        return False, f"Erro ao excluir: {e}"
    finally:
        db.close()


def listar_alunos_ativos():
    db = next(get_db())
    alunos = []
    try:
        alunos = db.query(Aluno).filter(Aluno.ativo == True).order_by(Aluno.nome).all()
        # Enriquece os objetos com dados calculados
        for aluno in alunos:
            aluno.aulas_feitas_mes = contar_aulas_mes(aluno.id)
            aluno.status_financeiro = verificar_status_financeiro(aluno)
        return alunos
    except Exception as e:
        print(f"Erro ao listar alunos: {e}")
        return []
    finally:
        db.close()


# --- FUNÇÕES DE AULA E FREQUÊNCIA ---

def contar_aulas_mes(aluno_id: int) -> int:
    """
    Conta aulas REALIZADAS desde o último pagamento.
    Se nunca pagou, conta do início do mês atual.
    """
    db = next(get_db())
    try:
        # 1. Busca o aluno
        aluno = db.query(Aluno).filter(Aluno.id == aluno_id).first()

        if not aluno:
            return 0

        # Define a data de corte (Data Zero)
        if aluno.data_ultimo_pagamento:
            data_inicio = aluno.data_ultimo_pagamento

            # --- CORREÇÃO DE TIPO (Date vs Datetime) ---
            # Se for apenas 'date' (sem hora), transformamos em datetime no começo do dia
            if isinstance(data_inicio, datetime):
                pass  # Já é datetime, ok
            else:
                # É apenas date, converte para datetime à meia-noite
                data_inicio = datetime.combine(data_inicio, datetime.min.time())
        else:
            # Se nunca pagou, usa dia 1º do mês atual
            agora = datetime.now()
            data_inicio = agora.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

        # --- CORREÇÃO DE FUSO (Naive vs Aware) ---
        # Adiciona fuso local se a data não tiver
        if data_inicio.tzinfo is None:
            data_inicio = data_inicio.astimezone()

        # 2. Conta tudo que foi feito DEPOIS do último pagamento
        qtd = db.query(Aula).filter(
            Aula.aluno_id == aluno_id,
            Aula.realizada == True,
            Aula.data_hora > data_inicio
        ).count()

        return qtd
    except Exception as e:
        print(f"Erro ao contar aulas do aluno {aluno_id}: {e}")
        return 0
    finally:
        db.close()


def listar_historico_aluno(aluno_id: int):
    db = next(get_db())
    try:
        historico = db.query(Aula).filter(
            Aula.aluno_id == aluno_id).order_by(desc(Aula.data_hora)).all()
        return historico
    except Exception as e:
        print(e)
        return []
    finally:
        db.close()


def registrar_aula_v2(aluno_id: int, observacao: str = ""):
    """Função legada para registro simples (Mantida apenas por compatibilidade se necessário)"""
    return registrar_detalhado(aluno_id, observacao, True, False)[1]


def registrar_detalhado(aluno_id: int, obs: str, realizada: bool, reposicao: bool):
    db = next(get_db())
    try:
        # 1. Buscar Aluno
        aluno = db.query(Aluno).filter(Aluno.id == aluno_id).first()
        if not aluno:
            return False, "Aluno não encontrado!"

        # 2. A TRAVA
        if realizada:
            aulas_feitas = contar_aulas_mes(aluno.id)
            frequencia = aluno.frequencia_semanal_plano or 0
            meta_mensal = frequencia * 4

            # Debug no terminal
            print(f"DEBUG MODAL: {aluno.nome} | Feitas={aulas_feitas} | Meta={meta_mensal}")

            if meta_mensal > 0 and aulas_feitas >= meta_mensal:
                return False, f"⚠️ LIMITE ATINGIDO! ({aulas_feitas}/{meta_mensal}). Renove o plano!"

        # 3. Registrar
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
        return False, f"Erro no banco: {str(e)}"
    finally:
        db.close()


# --- FUNÇÕES FINANCEIRAS ---

def verificar_status_financeiro(aluno) -> str:
    """
    Retorna 'atrasado', 'em_dia' ou 'pendente'.
    Critério: Data vencida OU Limite de aulas atingido.
    """
    # 1. Se nunca pagou
    if not aluno.data_ultimo_pagamento:
        return "atrasado"

    hoje = datetime.now()
    ultimo_pag = aluno.data_ultimo_pagamento

    # --- CORREÇÃO DE TIPO ---
    if not isinstance(ultimo_pag, datetime):
        ultimo_pag = datetime.combine(ultimo_pag, datetime.min.time())

    # 2. Verificação de Data (30 dias)
    # Removemos o timezone para comparar datas puras e evitar confusão
    dias_passados = (hoje.replace(tzinfo=None) - ultimo_pag.replace(tzinfo=None)).days

    if dias_passados > 30:
        return "atrasado"

    # 3. Verificação de Cota de Aulas
    # Nota: contar_aulas_mes já cuida de fechar e abrir conexão,
    # mas chamar ela de dentro do loop pode ser pesado.
    # Como já chamamos ela antes no 'listar_alunos_ativos',
    # podemos usar o valor que JÁ ESTÁ no objeto se ele existir.

    if hasattr(aluno, 'aulas_feitas_mes'):
        aulas_feitas = aluno.aulas_feitas_mes
    else:
        # Fallback se a propriedade não tiver sido injetada ainda
        aulas_feitas = contar_aulas_mes(aluno.id)

    frequencia = aluno.frequencia_semanal_plano or 0
    meta_ciclo = frequencia * 4

    if meta_ciclo > 0 and aulas_feitas >= meta_ciclo:
        return "esgotado"

    return "em_dia"


def registrar_pagamento(aluno_id: int):
    db = next(get_db())
    try:
        aluno = db.query(Aluno).filter(Aluno.id == aluno_id).first()
        if not aluno:
            return False, "Aluno não encontrado!"

        # 1. Registrar na tabela de histórico de pagamentos
        novo_pagamento = Pagamento(
            aluno_id=aluno_id,
            valor=aluno.valor_mensalidade,
            data_pagamento=datetime.now(),
            referencia_mes=datetime.now().month
        )
        db.add(novo_pagamento)

        # 2. Atualizar a data no cadastro do aluno
        aluno.data_ultimo_pagamento = datetime.now()

        db.commit()
        return True, "Pagamento registrado e plano renovado!"
    except Exception as e:
        db.rollback()
        return False, f"Erro ao registrar: {e}"
    finally:
        db.close()

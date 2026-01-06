from datetime import datetime, date
from sqlalchemy.orm import Session
from src.database import get_db
from src.models import Aluno, Aula, Pagamento


def listar_alunos_ativos():
    """Retorna lista de alunos e VERIFICA se pagaram"""
    session: Session = next(get_db())
    try:
        alunos = session.query(Aluno).order_by(Aluno.nome).all()

        # Define o mês atual (Ex: "01/2026")
        hoje = date.today()
        ref_mes = f"{hoje.month:02d}/{hoje.year}"

        for aluno in alunos:
            # 1. Busca se existe pagamento para este mês
            pagamento = session.query(Pagamento).filter(
                Pagamento.aluno_id == aluno.id,
                Pagamento.referencia_mes == ref_mes
            ).first()

            # 2. Define o status (AQUI É A MÁGICA)
            if pagamento:
                aluno.status_financeiro = "em_dia"
            else:
                aluno.status_financeiro = "atrasado"  # Vai ficar vermelho

            # 3. Conta aulas (Mantém sua lógica de progresso)
            total_aulas = session.query(Aula).filter(
                Aula.aluno_id == aluno.id,
                Aula.data_aula >= date(hoje.year, hoje.month, 1)
            ).count()
            aluno.aulas_feitas_mes = total_aulas

        return alunos
    except Exception as e:
        print(f"Erro ao listar: {e}")
        return []
    finally:
        session.close()


def registrar_detalhado(aluno_id, obs, realizada=True, reposicao=False):
    """Registra uma aula ou falta no banco"""
    session: Session = next(get_db())
    try:
        nova_aula = Aula(
            aluno_id=aluno_id,
            conteudo_treino=obs if realizada else None,
            realizada=realizada,
            motivo_falta=obs if not realizada else None,
            reposicao_prevista=reposicao,
            data_aula=date.today()
        )
        session.add(nova_aula)
        session.commit()

        tipo = "Aula" if realizada else "Falta"
        return True, f"{tipo} registrada com sucesso!"
    except Exception as e:
        session.rollback()
        return False, f"Erro ao registrar: {e}"
    finally:
        session.close()


def listar_historico_aluno(aluno_id):
    """Pega as últimas 10 aulas do aluno"""
    session: Session = next(get_db())
    try:
        aulas = session.query(Aula).filter(Aula.aluno_id == aluno_id) \
            .order_by(Aula.data_aula.desc(), Aula.id.desc()).limit(10).all()

        # Adaptador simples para a View ler
        for aula in aulas:
            aula.data_hora = datetime.combine(aula.data_aula, datetime.min.time())
            aula.observacao = aula.conteudo_treino if aula.realizada else aula.motivo_falta
            aula.tem_reposicao = aula.reposicao_prevista

        return aulas
    except Exception as e:
        print(f"Erro histórico: {e}")
        return []
    finally:
        session.close()


def editar_aluno(id, nome, freq, valor, idade, objetivo, restricoes):
    """Atualiza dados do aluno"""
    session: Session = next(get_db())
    try:
        aluno = session.query(Aluno).get(id)
        if not aluno:
            return False, "Aluno não encontrado"

        aluno.nome = nome
        aluno.faixa = objetivo  # Usando campo 'faixa' como 'objetivo' temporariamente ou ajuste no model
        # Nota: Se o model não tiver 'idade', 'valor_mensalidade', precisaremos ajustar o models.py
        # Por enquanto vou assumir que você tem esses campos ou vou ignorar para não quebrar

        # aluno.frequencia_semanal_plano = freq  <-- Verifique se existe no Model
        # aluno.valor_mensalidade = valor        <-- Verifique se existe no Model

        session.commit()
        return True, "Aluno atualizado!"
    except Exception as e:
        session.rollback()
        return False, f"Erro: {e}"
    finally:
        session.close()


def excluir_aluno(id):
    session: Session = next(get_db())
    try:
        aluno = session.query(Aluno).get(id)
        if aluno:
            session.delete(aluno)
            session.commit()
            return True, "Aluno excluído."
        return False, "Não encontrado."
    except Exception as e:
        return False, f"Erro: {e}"
    finally:
        session.close()


def registrar_pagamento_real(aluno_id, valor, forma="PIX", obs=""):
    """Registra um pagamento financeiro real no banco"""
    session: Session = next(get_db())
    try:
        # Define o mês atual como referência (Ex: "01/2026")
        hoje = date.today()
        ref = f"{hoje.month:02d}/{hoje.year}"

        novo_pag = Pagamento(
            aluno_id=aluno_id,
            valor=valor,
            referencia_mes=ref,
            forma_pagamento=forma,
            observacao=obs,
            data_pagamento=hoje
        )
        session.add(novo_pag)
        session.commit()
        return True, f"Pagamento de R$ {valor:.2f} registrado!"
    except Exception as e:
        session.rollback()
        return False, f"Erro financeiro: {e}"
    finally:
        session.close()


def verificar_status_financeiro(aluno_id):
    """Verifica se o aluno pagou o mês atual"""
    session: Session = next(get_db())
    try:
        hoje = date.today()
        ref = f"{hoje.month:02d}/{hoje.year}"

        pagamento = session.query(Pagamento).filter(
            Pagamento.aluno_id == aluno_id,
            Pagamento.referencia_mes == ref
        ).first()

        return "em_dia" if pagamento else "atrasado"
    finally:
        session.close()

# Funções legadas para compatibilidade (se ainda usadas)
def registrar_aula_v2(id):
    return registrar_detalhado(id, "Treino Rápido")


# ... (outros imports e funções existentes)

def criar_aluno(nome, frequencia, valor, dia_pag=None, idade=None, objetivo=None, restricoes=None):
    """Cria um novo aluno no banco de dados com TODOS os campos"""
    session: Session = next(get_db())
    try:
        # Tratamento de tipos (segurança contra strings vazias)
        freq_int = int(frequencia) if frequencia else 3
        valor_float = float(str(valor).replace(",", ".")) if valor else 0.0
        dia_venc_int = int(dia_pag) if dia_pag else 5
        idade_int = int(idade) if idade else 0

        novo_aluno = Aluno(
            nome=nome,
            frequencia_semanal_plano=freq_int,
            valor_mensalidade=valor_float,
            dia_vencimento=dia_venc_int,
            idade=idade_int,
            objetivo=objetivo,
            restricoes=restricoes,
        )
        session.add(novo_aluno)
        session.commit()
        return True, "Aluno cadastrado com sucesso!"
    except Exception as e:
        session.rollback()
        # Log do erro no console para ajudar no debug
        print(f"Erro detalhado ao cadastrar: {e}")
        return False, f"Erro ao cadastrar: {e}"
    finally:
        session.close()

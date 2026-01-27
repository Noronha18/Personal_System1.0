from datetime import datetime, date
from sqlalchemy.orm import Session
from src.database import get_db
from src import schemas
from src.models import Aluno, Aula, Pagamento, Treino, Exercicio
import logging
from src.exceptions import AlunoNotFoundError, BusinessRuleError


logger = logging.getLogger(__name__)

def _preencher_status_aluno(aluno: Aluno, db: Session):
    """Função interna para calcular e adicionar status financeiro e de aulas."""
    hoje = date.today()
    ref_mes = f"{hoje.month:02d}/{hoje.year}"
    inicio_mes = datetime(hoje.year, hoje.month, 1)

    # 1. Status Financeiro
    pagamento = db.query(Pagamento).filter(
        Pagamento.aluno_id == aluno.id,
        Pagamento.referencia_mes == ref_mes
    ).first()
    aluno.status_financeiro = "em_dia" if pagamento else "atrasado"

    # 2. Aulas no Mês
    total_aulas = db.query(Aula).filter(
        Aula.aluno_id == aluno.id,
        Aula.data_aula >= inicio_mes,
        Aula.realizada == True
    ).count()
    aluno.aulas_feitas_mes = total_aulas
    
    return aluno


def listar_alunos_ativos(db: Session):
    """Retorna lista de alunos com status financeiro e de aulas."""
    print("--- CONTROLLER: Listando Alunos ---")
    
    alunos = db.query(Aluno).order_by(Aluno.nome).all()
    print(f"Alunos encontrados no banco: {len(alunos)}")

    for aluno in alunos:
        _preencher_status_aluno(aluno, db)
        print(f"Aluno {aluno.nome}: {aluno.aulas_feitas_mes} aulas este mês")

    return alunos


def get_aluno(db: Session, aluno_id: int):
    """Retorna um único aluno pelo seu ID, com status financeiro e de aulas."""
    aluno = db.query(Aluno).filter(Aluno.id == aluno_id).first()
    if not aluno:
        raise AlunoNotFoundError(aluno_id)
    
        _preencher_status_aluno(aluno, db)
    return aluno


def registrar_detalhado(aluno_id, obs, realizada=True, reposicao=False, data_hora=None):
    """Registra uma aula ou falta no banco"""
    print(f"--- CONTROLLER: Registrando Aula para ID {aluno_id} ---")
    session: Session = next(get_db())
    try:
        # Se não passar data, usa agora
        data_final = data_hora if data_hora else datetime.now()

        nova_aula = Aula(
            aluno_id=aluno_id,
            observacoes_do_dia=obs if realizada else None, 
            realizada=realizada,
            motivo_falta=obs if not realizada else None,
            reposicao_prevista=reposicao,
            data_aula=data_final
        )
        session.add(nova_aula)
        session.commit()
        print(f"Aula salva com ID: {nova_aula.id} | Data: {nova_aula.data_aula}")

        tipo = "Aula" if realizada else "Falta"
        return True, f"{tipo} registrada com sucesso!"
    except Exception as e:
        session.rollback()
        print(f"ERRO AO SALVAR AULA: {e}")
        return False, f"Erro ao registrar: {e}"
    finally:
        session.close()


def listar_historico_aluno(aluno_id):
    """Pega as últimas 10 aulas do aluno"""
    print(f"--- CONTROLLER: Buscando Histórico ID {aluno_id} ---")
    session: Session = next(get_db())
    try:
        aulas = session.query(Aula).filter(Aula.aluno_id == aluno_id) \
            .order_by(Aula.data_aula.desc(), Aula.id.desc()).limit(10).all()
        
        print(f"Aulas encontradas: {len(aulas)}")

        # Adaptador simples para a View ler
        for aula in aulas:
            # Se data_aula já for datetime, usa direto. Se for date, converte.
            if isinstance(aula.data_aula, datetime):
                aula.data_hora = aula.data_aula
            else:
                aula.data_hora = datetime.combine(aula.data_aula, datetime.min.time())

            aula.observacao = aula.observacoes_do_dia if aula.realizada else aula.motivo_falta
            aula.tem_reposicao = aula.reposicao_prevista

        return aulas
    except Exception as e:
        print(f"Erro histórico: {e}")
        return []
    finally:
        session.close()



def editar_aluno(db: Session, aluno_id: int, dados_atualizados: dict):
    """
    Atualiza os dados de um aluno existente no banco de dados.
    """
    aluno = db.query(Aluno).filter(Aluno.id == aluno_id).first()
    if not aluno:
        return None

    # Atualização dinâmica dos campos
    for chave, valor in dados_atualizados.items():
        if hasattr(aluno, chave):
            setattr(aluno, chave, valor)

    try:
        db.commit()
        db.refresh(aluno)
        return aluno
    except Exception as e:
        db.rollback()
        raise e

def excluir_aluno(db: Session, aluno_id: int):
    """Exclui um aluno do banco de dados."""
    aluno = get_aluno
    
    try:
        db.delete(aluno)
        db.commit()
        logger.info(f"Aluno '{aluno_id}' excluído com sucesso.")
        return aluno
    except Exception as e:
        db.rollback()
        logger.error(f"Erro ao excluir aluno '{aluno_id}': {e}")
        raise e


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



# ... (outros imports e funções existentes)

def criar_aluno(db: Session, aluno: schemas.AlunoCreate):
    """Cria um novo aluno no banco de dados a partir de um schema Pydantic."""
    
    aluno_existente = db.query(Aluno).filter(Aluno.cpf == aluno.cpf).first()
    if aluno_existente:
        raise BusinessRuleError(f"O CPF {aluno.cpf} já está cadastrado para o aluno {aluno_existente.nome}.")
    
    try:
        # Usando **aluno.model_dump() para desempacotar o schema nos campos do modelo
        novo_aluno = Aluno(**aluno.model_dump())
        
        db.add(novo_aluno)
        db.commit()
        db.refresh(novo_aluno)
        return novo_aluno
    except Exception as e:
        db.rollback()
        print(f"Erro detalhado ao cadastrar: {e}")
        raise e


def cadastrar_treino_completo(db: Session, aluno_id: int, treino_data):
    """
    Cria um novo treino completo (com exercícios) para um aluno.
    A função espera que 'treino_data' seja um schema Pydantic com 'nome' e uma lista de 'exercicios'.
    """
    try:
        # 1. Cria o Treino (Cabeçalho)
        novo_treino = Treino(
            aluno_id=aluno_id, 
            nome=treino_data.nome,
            descricao=treino_data.descricao
        )
        db.add(novo_treino)
        
        # Flush envia para o banco e gera o ID do treino, mas ainda não commita
        db.flush() 

        # 2. Cria os Exercícios vinculados a esse treino
        for ex_data in treino_data.exercicios:
            novo_exercicio = Exercicio(
                treino_id=novo_treino.id, # Agora temos o ID graças ao flush()
                nome=ex_data.nome,
                series=ex_data.series,
                repeticoes=ex_data.repeticoes,
                carga=ex_data.carga,
                descanso=ex_data.descanso
            )
            db.add(novo_exercicio)
        
        # 3. Commit ÚNICO no final (Atomicidade)
        db.commit()
        db.refresh(novo_treino) # Para carregar os exercícios recém-criados na relação
        return novo_treino
        
    except Exception as e:
        db.rollback()
        raise e


def listar_treinos_aluno(db: Session, aluno_id: int):
    """Retorna todos os treinos de um aluno específico."""
    return db.query(Treino).filter(Treino.aluno_id == aluno_id).order_by(Treino.id).all()


def get_treino_by_id(db: Session, treino_id: int):
    """Retorna um treino específico pelo seu ID."""
    return db.query(Treino).filter(Treino.id == treino_id).first()


def excluir_treino(db: Session, treino_id: int):
    """Exclui um treino do banco de dados (e seus exercícios em cascata)."""
    treino = db.query(Treino).filter(Treino.id == treino_id).first()
    if not treino:
        return None
    
    try:
        db.delete(treino)
        db.commit()
        return treino
    except Exception as e:
        db.rollback()
        raise e
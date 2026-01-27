from datetime import datetime, date
from sqlalchemy.orm import Session
from src import models, schemas, exceptions
import logging

logger = logging.getLogger(__name__)

# --- AUXILIARES ---

def _preencher_status_aluno(db: Session, aluno: models.Aluno):
    """Calcula status financeiro e volumetria de sessões no mês atual."""
    hoje = date.today()
    ref_mes = f"{hoje.month:02d}/{hoje.year}"
    inicio_mes = datetime(hoje.year, hoje.month, 1)

    # 1. Status Financeiro
    pagamento = db.query(models.Pagamento).filter(
        models.Pagamento.aluno_id == aluno.id,
        models.Pagamento.referencia_mes == ref_mes
    ).first()
    aluno.status_financeiro = "em_dia" if pagamento else "atrasado"

    # 2. Contagem de Sessões Realizadas
    total_sessoes = db.query(models.SessaoTreino).filter(
        models.SessaoTreino.aluno_id == aluno.id,
        models.SessaoTreino.data_hora >= inicio_mes,
        models.SessaoTreino.realizada
    ).count()
    aluno.aulas_feitas_mes = total_sessoes
    
    return aluno

# --- CONTROLLERS DE ALUNO ---

def listar_alunos_ativos(db: Session):
    alunos = db.query(models.Aluno).order_by(models.Aluno.nome).all()
    for aluno in alunos:
        _preencher_status_aluno(db, aluno)
    return alunos

def get_aluno(db: Session, aluno_id: int):
    aluno = db.query(models.Aluno).filter(models.Aluno.id == aluno_id).first()
    if not aluno:
        raise exceptions.AlunoNaoEncontradoError(aluno_id)
    _preencher_status_aluno(db, aluno)
    return aluno

def criar_aluno(db: Session, aluno_in: schemas.AlunoCreate):
    if db.query(models.Aluno).filter(models.Aluno.cpf == aluno_in.cpf).first():
        raise exceptions.BusinessRuleError(f"CPF {aluno_in.cpf} já cadastrado.")
    
    novo_aluno = models.Aluno(**aluno_in.model_dump())
    db.add(novo_aluno)
    try:
        db.commit()
        db.refresh(novo_aluno)
        return novo_aluno
    except Exception as e:
        db.rollback()
        raise e

def excluir_aluno(db: Session, aluno_id: int):
    aluno = get_aluno(db, aluno_id) # Reutiliza a lógica de busca/erro
    db.delete(aluno)
    db.commit()
    return True

# --- CONTROLLERS DE PLANO DE TREINO ---

def cadastrar_plano_treino(db: Session, aluno_id: int, plano_in: schemas.PlanoTreinoCreate):
    get_aluno(db, aluno_id) # Valida existência

    novo_plano = models.PlanoTreino(
        aluno_id=aluno_id,
        titulo=plano_in.titulo,
        objetivo_estrategico=plano_in.objetivo_estrategico,
        esta_ativo=plano_in.esta_ativo
    )
    db.add(novo_plano)
    
    try:
        db.flush() 
        for presc_in in plano_in.prescricoes:
            nova_presc = models.PrescricaoExercicio(
                plano_treino_id=novo_plano.id,
                **presc_in.model_dump()
            )
            db.add(nova_presc)
        
        db.commit()
        db.refresh(novo_plano)
        return novo_plano
    except Exception as e:
        db.rollback()
        raise e

def listar_planos_aluno(db: Session, aluno_id: int):
    return db.query(models.PlanoTreino).filter(models.PlanoTreino.aluno_id == aluno_id).all()


def registrar_sessao(db: Session, aluno_id: int, plano_id: int | None, obs: str, realizada: bool = True):
    """
    Registra a execução de um treino.
    """
    # Valida o aluno
    get_aluno(db, aluno_id)

    nova_sessao = models.SessaoTreino(
        aluno_id=aluno_id,
        plano_treino_id=plano_id,
        observacoes_performance=obs if realizada else None,
        motivo_ausencia=obs if not realizada else None,
        realizada=realizada,
        data_hora=datetime.now()
    )
    
    db.add(nova_sessao)
    try:
        db.commit()
        db.refresh(nova_sessao)
        return nova_sessao
    except Exception as e:
        db.rollback()
        raise e

def registrar_pagamento(db: Session, aluno_id: int, valor: float, forma: str = "PIX", obs: str = ""):
    """
    Registra a entrada financeira de um aluno.
    """
    get_aluno(db, aluno_id)
    
    hoje = date.today()
    ref = f"{hoje.month:02d}/{hoje.year}"

    novo_pagamento = models.Pagamento(
        aluno_id=aluno_id,
        valor=valor,
        referencia_mes=ref,
        forma_pagamento=forma,
        observacao=obs,
        data_pagamento=hoje
    )
    
    db.add(novo_pagamento)
    try:
        db.commit()
        db.refresh(novo_pagamento)
        return novo_pagamento
    except Exception as e:
        db.rollback()
        raise e

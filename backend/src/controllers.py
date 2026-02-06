from datetime import datetime, date
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from src import models, schemas, exceptions
import logging

logger = logging.getLogger(__name__)

# --- AUXILIARES ---

async def _preencher_status_aluno(db: AsyncSession, aluno: models.Aluno):
    """Calcula status financeiro e volumetria de sessões no mês atual."""
    hoje = date.today()
    ref_mes = f"{hoje.month:02d}/{hoje.year}"
    inicio_mes = datetime(hoje.year, hoje.month, 1)

    # 1. Status Financeiro
    stmt_pag = select(models.Pagamento).where(
        models.Pagamento.aluno_id == aluno.id,
        models.Pagamento.referencia_mes == ref_mes
    )
    result_pag = await db.execute(stmt_pag)
    pagamento = result_pag.scalar_one_or_none()
    aluno.status_financeiro = "em_dia" if pagamento else "atrasado"

    # 2. Contagem de Sessões Realizadas
    stmt_sessao = select(func.count(models.SessaoTreino.id)).where(
        models.SessaoTreino.aluno_id == aluno.id,
        models.SessaoTreino.data_hora >= inicio_mes,
        models.SessaoTreino.realizada == True
    )
    result_sessao = await db.execute(stmt_sessao)
    aluno.aulas_feitas_mes = result_sessao.scalar() or 0
    
    return aluno

# --- CONTROLLERS DE ALUNO ---

async def listar_alunos_ativos(db: AsyncSession):
    stmt = (
        select(models.Aluno)
        .options(
            # Carrega planos E, dentro de cada plano, as prescrições
            selectinload(models.Aluno.planos_treino)
            .selectinload(models.PlanoTreino.prescricoes),
            # Carrega também os pagamentos
            selectinload(models.Aluno.pagamentos)
        )
        .order_by(models.Aluno.nome)
    )
    
    result = await db.execute(stmt)
    alunos = result.scalars().all()
    
    for aluno in alunos:
        await _preencher_status_aluno(db, aluno)
        
    return alunos

async def get_aluno(db: AsyncSession, aluno_id: int):
    stmt = select(models.Aluno).where(models.Aluno.id == aluno_id)
    result = await db.execute(stmt)
    aluno = result.scalar_one_or_none()
    if not aluno:
        raise exceptions.AlunoNaoEncontradoError(F"Aluno {aluno_id} não encontrado.")
    await _preencher_status_aluno(db, aluno)
    return aluno

async def criar_aluno(db: AsyncSession, aluno_in: schemas.AlunoCreate):
    stmt = select(models.Aluno).where(models.Aluno.cpf == aluno_in.cpf)
    result = await db.execute(stmt)
    if result.scalar_one_or_none():
        raise exceptions.BusinessRuleError(f"CPF {aluno_in.cpf} já está cadastrado.")
    
    novo_aluno = models.Aluno(**aluno_in.model_dump())
    db.add(novo_aluno)
    try:
        await db.commit()
        await db.refresh(novo_aluno)
        return novo_aluno
    except Exception as e:
        await db.rollback()
        raise e

async def excluir_aluno(db: AsyncSession, aluno_id: int):
    aluno = await get_aluno(db, aluno_id) # Reutiliza a lógica de busca/erro
    await db.delete(aluno)
    await db.commit()
    return True

# --- CONTROLLERS DE PLANO DE TREINO ---

async def cadastrar_plano_treino(db: AsyncSession, aluno_id: int, plano_in: schemas.PlanoTreinoCreate):
    await get_aluno(db, aluno_id) # Valida existência

    novo_plano = models.PlanoTreino(
        aluno_id=aluno_id,
        titulo=plano_in.titulo,
        objetivo_estrategico=plano_in.objetivo_estrategico,
        esta_ativo=plano_in.esta_ativo
    )
    db.add(novo_plano)
    
    try:
        await db.flush() 
        for presc_in in plano_in.prescricoes:
            nova_presc = models.PrescricaoExercicio(
                plano_treino_id=novo_plano.id,
                **presc_in.model_dump()
            )
            db.add(nova_presc)
        
        await db.commit()
        await db.refresh(novo_plano)
        return novo_plano
    except Exception as e:
        await db.rollback()
        raise e

async def listar_planos_aluno(db: AsyncSession, aluno_id: int):
    return select(models.PlanoTreino).order_by(models.PlanoTreino.aluno_id == aluno_id).all()


async def registrar_sessao(db: AsyncSession, aluno_id: int, plano_id: int | None, obs: str, realizada: bool = True):
    """
    Registra a execução de um treino.
    """
    # Valida o aluno
    await get_aluno(db, aluno_id)

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
        await db.commit()
        await db.refresh(nova_sessao)
        return nova_sessao
    except Exception as e:
        await db.rollback()
        raise e

async def registrar_pagamento(db: AsyncSession, aluno_id: int, valor: float, forma: str = "PIX", obs: str = ""):
    """
    Registra a entrada financeira de um aluno.
    """
    await get_aluno(db, aluno_id)
    
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
        await db.commit()
        await db.refresh(novo_pagamento)
        return novo_pagamento
    except Exception as e:
        await db.rollback()
        raise e

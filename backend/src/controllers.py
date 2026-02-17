from __future__ import annotations
import calendar
from datetime import datetime, date
from sqlalchemy import select, func, or_, and_
from sqlalchemy.orm import selectinload
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Any
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
    
    pagamento = result_pag.scalars().first() 
    
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
    stmt = (
        select(models.Aluno)
        .where(models.Aluno.id == aluno_id)
        # O segredo está aqui: carregar TUDO que o Frontend precisa
        .options(
            selectinload(models.Aluno.planos_treino)
            .selectinload(models.PlanoTreino.prescricoes), # Aninhado!
            selectinload(models.Aluno.pagamentos)
        )
    )
    
    result = await db.execute(stmt)
    aluno = result.scalar_one_or_none()
    
    if not aluno:
        raise exceptions.ResourceNotFoundError(f"Aluno {aluno_id} não encontrado")
    
    # Preenche status financeiro/aulas (que não vem do banco direto)
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

async def registrar_pagamento(db: AsyncSession, dados: schemas.PagamentoCreate) -> models.Pagamento:
    """
    Registra a entrada financeira de um aluno.
    """
    await get_aluno(db, dados.aluno_id)
    
    hoje = date.today()
    ref = f"{hoje.month:02d}/{hoje.year}"

    novo_pagamento = models.Pagamento(
        aluno_id=dados.aluno_id,
        valor=dados.valor,
        referencia_mes=ref,
        forma_pagamento=dados.forma_pagamento,
        observacao=dados.observacao,
        data_pagamento=hoje,
        quantidade_aulas=dados.quantidade_aulas
    )
    
    db.add(novo_pagamento)
    try:
        await db.commit()
        await db.refresh(novo_pagamento)
        return novo_pagamento
    except Exception as e:
        await db.rollback()
        raise e

async def  get_pagamento(db: AsyncSession, pagamento_id: int) -> models.Pagamento:
    stmt = select(models.Pagamento).where(models.Pagamento.id == pagamento_id)
    result = await db.execute(stmt)
    pagamento = result.scalar_one_or_none()
    
    if not pagamento:
        raise exceptions.ResourceNotFoundError(f"Pagamento {pagamento_id} não encontrado")

    return pagamento

async def atualizar_pagamento(db: AsyncSession, pagamento_id: int, dados: schemas.PagamentoCreate) -> models.Pagamento:

    pagamento = await get_pagamento(db, pagamento_id)

    pagamento.valor = dados.valor
    pagamento.forma_pagamento = dados.forma_pagamento
    pagamento.observacao = dados.observacao

    try:
        await db.commit()
        await db.refresh(pagamento)
        return pagamento
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, 
                            detail=f"Erro ao atualizar pagamento: {str(e)}")

async def deletar_pagamento(db: AsyncSession, pagamento_id: int) -> dict:
    pagamento = await get_pagamento(db, pagamento_id)

    try:
        await db.delete(pagamento)
        await db.commit()
        return {"message": f"Pagamento {pagamento_id} deletado com sucesso"}
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, 
                            detail=f"Erro ao deletar pagamento: {str(e)}")
    
    

async def create_plano_completo(db: AsyncSession, plano_in: schemas.PlanoTreinoCreate):

    aluno =  await db.get(models.Aluno, plano_in.aluno_id)
    if not aluno:
        raise exceptions.ResourceNotFoundError("Aluno não encontrado")
    
    novo_plano = models.PlanoTreino(
        aluno_id=plano_in.aluno_id,
        titulo=plano_in.titulo,
        objetivo_estrategico=plano_in.objetivo_estrategico,
        esta_ativo=plano_in.esta_ativo
    )
    db.add(novo_plano)
    
    await db.flush()

    lista_prescricoes = []
    for item in plano_in.prescricoes:
        nova_prescricao = models.PrescricaoExercicio(
            plano_treino_id=novo_plano.id,
            nome_exercicio=item.nome_exercicio,
            series=item.series,
            repeticoes=item.repeticoes,
            carga_kg=item.carga_kg,
            tempo_descanso_segundos=item.tempo_descanso_segundos,
            notas_tecnicas=item.notas_tecnicas
        )
        lista_prescricoes.append(nova_prescricao)

        if lista_prescricoes:
            db.add_all(lista_prescricoes)

        try:
            await db.commit()
        except Exception as e:
            await db.rollback()
            raise HTTPException(status_code=500, detail=f"Erro ao salvar plano:{str(e)}")

    await db.refresh(novo_plano, attribute_names=["prescricoes"])
    
    return novo_plano

async def desativar_plano(db: AsyncSession, plano_id: int) -> models.PlanoTreino:
    plano = await db.scalar(
        select(models.PlanoTreino)
        .options(selectinload(models.PlanoTreino.prescricoes)) 
        .where(models.PlanoTreino.id == plano_id)
    )
    
    if not plano:
        raise HTTPException(status_code=404, detail="Plano não encontrado")
    
    plano.esta_ativo = False
    await db.commit()
    await db.refresh(plano)
    return plano

async def deletar_prescricao(db: AsyncSession, prescricao_id: int) -> None:
    prescricao = await db.scalar(
        select(models.PrescricaoExercicio).where(models.PrescricaoExercicio.id == prescricao_id)
    )
    if not prescricao:
        raise HTTPException(status_code=404, detail="Exercício não encontrado")

    await db.delete(prescricao)
    await db.commit()


async def atualizar_prescricao(db: AsyncSession, prescricao_id: int, payload: schemas.PrescricaoExercicioCreate) -> models.PrescricaoExercicio:
    prescricao = await db.scalar(select(models.PrescricaoExercicio).where(models.PrescricaoExercicio.id == prescricao_id))
    if not prescricao:
        raise HTTPException(status_code=404, detail="Exercício não encontrado")
    
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(prescricao, key, value)
    
    await db.commit()
    await db.refresh(prescricao)
    return prescricao

# --- CONTROLLERS DE SESSAO DE TREINO ---

def _parse_referencia_mes(referencia_mes: str) -> tuple[int, int]:
    try:
        mm, yyyy = referencia_mes.split("/")
        mes = int(mm)
        ano = int(yyyy)
        if mes < 1 or mes > 12:
            raise ValueError
        return mes, ano
    except ValueError:
        raise HTTPException(status_code=422, detail="referencia_mes inválida (use MM/YYYY)")


def _inicio_fim_mes(ano: int, mes: int) -> tuple[datetime, datetime]:
    ultimo_dia = calendar.monthrange(ano, mes)[1]
    inicio = datetime(ano, mes, 1, 0, 0, 0)
    fim = datetime(ano, mes, ultimo_dia, 23, 59, 59)
    return inicio, fim


async def registrar_sessao(db: AsyncSession, payload: schemas.SessaoTreinoCreate) -> models.SessaoTreino:
    aluno = await db.scalar(select(models.Aluno).where(models.Aluno.id == payload.aluno_id))
    if not aluno:
        raise HTTPException(status_code=404, detail="Aluno não encontrado")

    if payload.plano_treino_id is not None:
        plano = await db.scalar(
            select(models.PlanoTreino).where(
                models.PlanoTreino.id == payload.plano_treino_id,
                models.PlanoTreino.aluno_id == payload.aluno_id,
            )
        )
        if not plano:
            raise HTTPException(status_code=422, detail="Plano de treino inválido para este aluno")
        

    if payload.data_hora:
        # Se vier com timezone, converte para naive (remove info de fuso)
        # É seguro assumir que o front mandou UTC ou Local correto
        data_final = payload.data_hora.replace(tzinfo=None)
    else:
        data_final = datetime.now() # datetime.now() já é naive por padrão

    dados_sessao = payload.model_dump(exclude={"data_hora"}, exclude_unset=True)

    sessao = models.SessaoTreino(
        **dados_sessao,
        data_hora=data_final # ✅ Agora é naive (compatível com timestamp sem timezone)
    )
    
    db.add(sessao)
    await db.commit()
    await db.refresh(sessao)
    return sessao

async def listar_sessoes(
    db: AsyncSession,
    aluno_id: int | None = None,
    de: date | None = None,
    ate: date | None = None,
    realizada: bool | None = None,
    limit: int = 100,
    offset: int = 0,
) -> list[models.SessaoTreino]:
    stmt = select(models.SessaoTreino)

    if aluno_id is not None:
        stmt = stmt.where(models.SessaoTreino.aluno_id == aluno_id)
    if realizada is not None:
        stmt = stmt.where(models.SessaoTreino.realizada == realizada)
    if de is not None:
        stmt = stmt.where(models.SessaoTreino.data_hora >= datetime.combine(de, datetime.min.time()))
    if ate is not None:
        stmt = stmt.where(models.SessaoTreino.data_hora <= datetime.combine(ate, datetime.max.time()))

    stmt = stmt.order_by(models.SessaoTreino.data_hora.desc()).limit(limit).offset(offset)

    result = await db.execute(stmt)
    return list(result.scalars().all())


async def calcular_frequencia_mensal(
    db: AsyncSession,
    aluno_id: int,
    referencia_mes: str,
) -> schemas.FrequenciaMensalPublic:
    mes, ano = _parse_referencia_mes(referencia_mes)
    inicio, fim = _inicio_fim_mes(ano, mes)

    aluno = await db.scalar(select(models.Aluno).where(models.Aluno.id == aluno_id))
    if not aluno:
        raise HTTPException(status_code=404, detail="Aluno não encontrado")

    # Protótipo local: semanas ≈ ceil(dias/7)
    dias_no_mes = calendar.monthrange(ano, mes)[1]
    semanas_no_mes = (dias_no_mes + 6) // 7
    meta_base = int(aluno.frequencia_semanal_plano) * semanas_no_mes

    aulas_extras = await db.scalar(
        select(func.sum(models.Pagamento.quantidade_aulas))
        .where(
            models.Pagamento.aluno_id == aluno_id,
            models.Pagamento.referencia_mes == referencia_mes
        )
    )
    aulas_extras = int(aulas_extras or 0)

    sessoes_previstas = meta_base + aulas_extras

    sessoes_realizadas = await db.scalar(
        select(func.count(models.SessaoTreino.id)).where(
            models.SessaoTreino.aluno_id == aluno_id,
            models.SessaoTreino.data_hora >= inicio,
            models.SessaoTreino.data_hora <= fim,
            or_(
                models.SessaoTreino.realizada.is_(True),
                and_(
                    models.SessaoTreino.realizada.is_(False),
                    models.SessaoTreino.precisa_reposicao.is_(False)
                )
            )
        )
    )

    sessoes_realizadas = int(sessoes_realizadas or 0)
    taxa_adesao = (sessoes_realizadas / sessoes_previstas) if sessoes_previstas > 0 else 0.0

    return schemas.FrequenciaMensalPublic(
        aluno_id=aluno_id,
        referencia_mes=referencia_mes,
        sessoes_previstas=sessoes_previstas,
        sessoes_realizadas=sessoes_realizadas,
        taxa_adesao=round(taxa_adesao, 4),
    )

async def get_sessao(db: AsyncSession, sessao_id: int) -> models.SessaoTreino:
    sessao = await db.scalar(
        select(models.SessaoTreino).where(models.SessaoTreino.id == sessao_id)
    )
    if not sessao:
        raise HTTPException(status_code=404, detail="Sessão não encontrada")
    return sessao

async def deletar_sessao(db: AsyncSession, sessao_id: int) -> None:
    sessao = await get_sessao(db, sessao_id)
    await db.delete(sessao)
    await db.commit()

def _month_starts(ate_mes_atual: date, n: int = 12) -> list[date]:
    """Retorna lista (ordem crescente) com o 1º dia de cada mês, dos últimos n meses."""
    y, m = ate_mes_atual.year, ate_mes_atual.month
    out: list[date] = []
    for i in range(n - 1, -1, -1):
        mm = m - i
        yy = y
        while mm <= 0:
            mm += 12
            yy -= 1
        out.append(date(yy, mm, 1))
    return out


async def calcular_estatisticas_financeiras(db: AsyncSession) -> dict[str, Any]:
    hoje = date.today()
    ref_mes = f"{hoje.month:02d}/{hoje.year}"
    mes_atual_inicio = date(hoje.year, hoje.month, 1)

    # === QUERY 1: KPIs do mês atual ===
    receita_mes_sq = (
        select(func.coalesce(func.sum(models.Pagamento.valor), 0))
        .where(models.Pagamento.referencia_mes == ref_mes)
        .scalar_subquery()
    )

    alunos_pagaram_sq = (
        select(func.count(func.distinct(models.Pagamento.aluno_id)))
        .where(models.Pagamento.referencia_mes == ref_mes)
        .scalar_subquery()
    )

    total_alunos_sq = select(func.count(models.Aluno.id)).scalar_subquery()

    kpi_stmt = select(
        receita_mes_sq.label("receita_total_mes"),
        alunos_pagaram_sq.label("alunos_em_dia"),
        total_alunos_sq.label("total_alunos"),
    )

    kpi_row = (await db.execute(kpi_stmt)).one()
    receita_total_mes = float(kpi_row.receita_total_mes or 0)
    alunos_em_dia = int(kpi_row.alunos_em_dia or 0)
    total_alunos = int(kpi_row.total_alunos or 0)

    alunos_inadimplentes = max(total_alunos - alunos_em_dia, 0)
    inadimplencia = (alunos_inadimplentes / total_alunos) if total_alunos > 0 else 0.0
    ticket_medio = (receita_total_mes / alunos_em_dia) if alunos_em_dia > 0 else 0.0

    # === QUERY 2: Série histórica 12 meses ===
    meses = _month_starts(mes_atual_inicio, n=12)
    inicio_janela = meses[0]

    bucket_mes = func.date_trunc("month", models.Pagamento.data_pagamento).label("mes")
    serie_stmt = (
        select(
            bucket_mes,
            func.coalesce(func.sum(models.Pagamento.valor), 0).label("receita"),
        )
        .where(models.Pagamento.data_pagamento >= inicio_janela)
        .group_by(bucket_mes)
        .order_by(bucket_mes)
    )

    serie_rows = (await db.execute(serie_stmt)).all()

    # Preenche meses sem receita com 0
    receita_por_mes: dict[date, float] = {}
    for mes_dt, receita in serie_rows:
        mes_date = mes_dt.date() if hasattr(mes_dt, "date") else mes_dt
        receita_por_mes[mes_date] = float(receita or 0)

    receita_mensal_12m = [
        {"referencia_mes": f"{m.month:02d}/{m.year}", "receita": receita_por_mes.get(m, 0.0)}
        for m in meses
    ]

    resultado = {
        "referencia_mes": ref_mes,
        "receita_total": receita_total_mes,
        "ticket_medio": round(ticket_medio, 2),
        "inadimplencia": round(inadimplencia, 4),
        "receita_mensal_12m": receita_mensal_12m,
        "total_alunos": total_alunos,
        "alunos_em_dia": alunos_em_dia,
        "alunos_inadimplentes": alunos_inadimplentes,
    }
    
    # 🐛 LOG TEMPORÁRIO - REMOVER DEPOIS
    logger.info(f"📊 Resultado gerado: {resultado}")
    logger.info(f"📏 Tamanho de receita_mensal_12m: {len(receita_mensal_12m)}")
    
    return resultado

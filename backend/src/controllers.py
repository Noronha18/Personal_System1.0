from __future__ import annotations
import calendar
from datetime import datetime, date
from sqlalchemy import select, func, or_, and_, update
from sqlalchemy.orm import selectinload
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
    if aluno.tipo_pagamento == "pacote":
        # Se for pacote, está em dia se tiver saldo de aulas
        aluno.status_financeiro = "em_dia" if aluno.saldo_aulas > 0 else "atrasado"
    else:
        # Se for mensal, verifica pagamento no mês de referência
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
    query = (
        select(models.Aluno)
        .options(
            selectinload(models.Aluno.planos_treino)
            .selectinload(models.PlanoTreino.treinos)
            .selectinload(models.Treino.prescricoes)
            .selectinload(models.Prescricao.exercicio),
            selectinload(models.Aluno.pagamentos),
            selectinload(models.Aluno.sessoes_treino)
        )
        .order_by(models.Aluno.nome)
    )
    result = await db.execute(query)
    alunos = result.scalars().all()
    
    for aluno in alunos:
        await _preencher_status_aluno(db, aluno)
        
    return alunos

async def get_aluno(db: AsyncSession, aluno_id: int):
    query = (
        select(models.Aluno)
        .where(models.Aluno.id == aluno_id)
        .options(
            selectinload(models.Aluno.planos_treino)
                .selectinload(models.PlanoTreino.treinos)
                .selectinload(models.Treino.prescricoes)
                .selectinload(models.Prescricao.exercicio),
            selectinload(models.Aluno.sessoes_treino),
            selectinload(models.Aluno.pagamentos)
        )
    )
    
    result = await db.execute(query)
    aluno = result.scalars().first()
    
    if not aluno:
        raise exceptions.ResourceNotFoundError(f"Aluno {aluno_id} não encontrado")
    
    await _preencher_status_aluno(db, aluno)
        
    return aluno



async def criar_aluno(db: AsyncSession, aluno_in: schemas.AlunoCreate):
    if aluno_in.cpf:
        stmt = select(models.Aluno).where(models.Aluno.cpf == aluno_in.cpf)
        result = await db.execute(stmt)
        if result.scalar_one_or_none():
            raise exceptions.BusinessRuleError(f"CPF {aluno_in.cpf} já está cadastrado.")
    
    novo_aluno = models.Aluno(**aluno_in.model_dump())
    db.add(novo_aluno)
    try:
        await db.commit()
        
        # Re-buscamos o aluno com selectinload para garantir que o schema Pydantic
        # possa acessar as propriedades (como planos_treino) sem disparar lazy loading async.
        stmt = (
            select(models.Aluno)
            .options(
                selectinload(models.Aluno.planos_treino),
                selectinload(models.Aluno.pagamentos),
                selectinload(models.Aluno.sessoes_treino)
            )
            .where(models.Aluno.id == novo_aluno.id)
        )
        result = await db.execute(stmt)
        aluno_final = result.scalar()
        
        # Atributos auxiliares para o schema
        aluno_final.status_financeiro = "em_dia"
        aluno_final.aulas_feitas_mes = 0
        
        # Garante que data_inicio exista
        if not aluno_final.data_inicio:
            aluno_final.data_inicio = date.today()
        
        return aluno_final
    except Exception as e:
        await db.rollback()
        raise e

async def atualizar_status_aluno(db: AsyncSession, aluno_id: int, novo_status: str):
    aluno = await get_aluno(db, aluno_id)
    aluno.status = novo_status
    await db.commit()
    await db.refresh(aluno)
    return aluno

async def excluir_aluno(db: AsyncSession, aluno_id: int):
    aluno = await get_aluno(db, aluno_id) # Reutiliza a lógica de busca/erro
    await db.delete(aluno)
    await db.commit()
    return True

# --- CONTROLLERS DE PLANO DE TREINO ---

async def listar_planos_detalhados_aluno(db: AsyncSession, aluno_id: int):

    query = (
        select(models.PlanoTreino)
        .where(models.PlanoTreino.aluno_id == aluno_id)
        .options(
            selectinload(models.PlanoTreino.treinos)      # Carrega Treinos A, B...
            .selectinload(models.Treino.prescricoes)     # Carrega Exercícios de cada Treino
            .selectinload(models.Prescricao.exercicio)
        )
        .order_by(models.PlanoTreino.data_inicio.desc())
    )
    
    result = await db.execute(query)
    return result.scalars().all()

async def listar_templates_globais(db: AsyncSession):
    """
    Retorna todos os planos que não possuem aluno_id vinculado (templates).
    """
    query = (
        select(models.PlanoTreino)
        .where(models.PlanoTreino.aluno_id == None)
        .options(
            selectinload(models.PlanoTreino.treinos)
            .selectinload(models.Treino.prescricoes)
            .selectinload(models.Prescricao.exercicio)
        )
        .order_by(models.PlanoTreino.titulo)
    )
    result = await db.execute(query)
    return result.scalars().all()



async def registrar_pagamento(db: AsyncSession, dados: schemas.PagamentoCreate) -> models.Pagamento:
    """
    Registra a entrada financeira de um aluno.
    """
    aluno = await get_aluno(db, dados.aluno_id)
    
    hoje = date.today()
    ref = dados.referencia_mes or f"{hoje.month:02d}/{hoje.year}"

    novo_pagamento = models.Pagamento(
        aluno_id=dados.aluno_id,
        valor=dados.valor,
        referencia_mes=ref,
        forma_pagamento=dados.forma_pagamento,
        observacao=dados.observacao,
        data_pagamento=hoje,
        quantidade_aulas=dados.quantidade_aulas
    )
    
    # Se informou quantidade de aulas, soma ao saldo do aluno (recarga)
    if dados.quantidade_aulas > 0:
        aluno.saldo_aulas += dados.quantidade_aulas

    db.add(novo_pagamento)
    try:
        await db.commit()
        await db.refresh(novo_pagamento)
        return novo_pagamento
    except Exception as e:
        await db.rollback()
        raise e

async def listar_pagamentos(db: AsyncSession) -> list[dict[str, Any]]:
    stmt = (
        select(
            models.Pagamento,
            models.Aluno.nome.label("aluno_nome")
        )
        .join(models.Aluno, models.Pagamento.aluno_id == models.Aluno.id)
        .order_by(models.Pagamento.data_pagamento.desc())
    )
    result = await db.execute(stmt)
    
    pagamentos = []
    for row in result.all():
        pagamento = row.Pagamento
        # Converte o objeto do banco em um dicionário compatível com o schema
        pag_dict = {
            "id": pagamento.id,
            "aluno_id": pagamento.aluno_id,
            "aluno_nome": row.aluno_nome,
            "valor": pagamento.valor,
            "referencia_mes": pagamento.referencia_mes,
            "forma_pagamento": pagamento.forma_pagamento,
            "data_pagamento": pagamento.data_pagamento,
            "observacao": pagamento.observacao,
            "quantidade_aulas": pagamento.quantidade_aulas
        }
        pagamentos.append(pag_dict)
    
    return pagamentos

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
        raise e

async def deletar_pagamento(db: AsyncSession, pagamento_id: int) -> dict:
    pagamento = await get_pagamento(db, pagamento_id)
    await db.delete(pagamento)
    await db.commit()
    return {"message": f"Pagamento {pagamento_id} deletado com sucesso"}

async def desativar_plano(db: AsyncSession, plano_id: int) -> models.PlanoTreino:
    plano = await db.scalar(
        select(models.PlanoTreino)
        .options(selectinload(models.PlanoTreino.prescricoes)) 
        .where(models.PlanoTreino.id == plano_id)
    )
    
    if not plano:
        raise exceptions.ResourceNotFoundError(f"Plano {plano_id} não encontrado")
    
    plano.esta_ativo = False
    await db.commit()
    await db.refresh(plano)
    return plano

async def deletar_prescricao(db: AsyncSession, prescricao_id: int) -> None:
    prescricao = await db.scalar(
        select(models.PrescricaoExercicio).where(models.PrescricaoExercicio.id == prescricao_id)
    )
    if not prescricao:
        raise exceptions.ResourceNotFoundError(f"Prescrição {prescricao_id} não encontrada")

    await db.delete(prescricao)
    await db.commit()


async def atualizar_prescricao(db: AsyncSession, prescricao_id: int, payload: schemas.PrescricaoExercicioCreate) -> models.PrescricaoExercicio:
    prescricao = await db.scalar(select(models.PrescricaoExercicio).where(models.PrescricaoExercicio.id == prescricao_id))
    if not prescricao:
        raise exceptions.ResourceNotFoundError(f"Prescrição {prescricao_id} não encontrada")
    
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
        raise exceptions.BusinessRuleError("referencia_mes inválida (use MM/YYYY)")


def _inicio_fim_mes(ano: int, mes: int) -> tuple[datetime, datetime]:
    ultimo_dia = calendar.monthrange(ano, mes)[1]
    inicio = datetime(ano, mes, 1, 0, 0, 0)
    fim = datetime(ano, mes, ultimo_dia, 23, 59, 59)
    return inicio, fim


async def registrar_sessao(db: AsyncSession, payload: schemas.SessaoTreinoCreate) -> models.SessaoTreino:
    aluno = await get_aluno(db, payload.aluno_id)
    
    if payload.plano_treino_id is not None:
        plano = await db.scalar(
            select(models.PlanoTreino).where(
                models.PlanoTreino.id == payload.plano_treino_id,
                models.PlanoTreino.aluno_id == payload.aluno_id,
            )
        )
        if not plano:
            raise exceptions.BusinessRuleError("Plano de treino inválido para este aluno")
        

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
    
    # Se a sessão conta como aula dada (realizada ou falta sem reposição) e o aluno é de pacote, debita 1 aula
    aula_contabilizada = payload.realizada or (not payload.realizada and not payload.precisa_reposicao)
    
    if aula_contabilizada and aluno.tipo_pagamento == "pacote":
        if aluno.saldo_aulas > 0:
            aluno.saldo_aulas -= 1

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
        raise exceptions.ResourceNotFoundError(f"Aluno {aluno_id} não encontrado")

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
        raise exceptions.ResourceNotFoundError(f"Sessão {sessao_id} não encontrada")
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

    # Alunos em dia são aqueles que pagaram no mês atual (mensal) 
    # OU alunos de pacote que possuem saldo positivo
    alunos_em_dia_sq = (
        select(func.count(models.Aluno.id))
        .where(
            or_(
                # Caso Mensal: tem pagamento na referência
                and_(
                    models.Aluno.tipo_pagamento == "mensal",
                    models.Aluno.id.in_(
                        select(models.Pagamento.aluno_id).where(models.Pagamento.referencia_mes == ref_mes)
                    )
                ),
                # Caso Pacote: tem saldo de aulas
                and_(
                    models.Aluno.tipo_pagamento == "pacote",
                    models.Aluno.saldo_aulas > 0
                )
            )
        )
        .scalar_subquery()
    )

    total_alunos_sq = select(func.count(models.Aluno.id)).scalar_subquery()

    kpi_stmt = select(
        receita_mes_sq.label("receita_total_mes"),
        alunos_em_dia_sq.label("alunos_em_dia"),
        total_alunos_sq.label("total_alunos"),
    )

    kpi_row = (await db.execute(kpi_stmt)).one()
    receita_total_mes = float(kpi_row.receita_total_mes or 0)
    alunos_em_dia = int(kpi_row.alunos_em_dia or 0)
    total_alunos = int(kpi_row.total_alunos or 0)

    alunos_inadimplentes = max(total_alunos - alunos_em_dia, 0)
    inadimplencia = (alunos_inadimplentes / total_alunos) if total_alunos > 0 else 0.0
    
    # Ticket médio baseado em quem pagou no mês (para evitar distorção com alunos de pacote que não pagaram ESTE mês)
    alunos_que_pagaram_este_mes = await db.scalar(
        select(func.count(func.distinct(models.Pagamento.aluno_id)))
        .where(models.Pagamento.referencia_mes == ref_mes)
    )
    ticket_medio = (receita_total_mes / alunos_que_pagaram_este_mes) if alunos_que_pagaram_este_mes and alunos_que_pagaram_este_mes > 0 else 0.0

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

async def criar_plano_treino(db: AsyncSession, aluno_id: int | None, plano_in: schemas.PlanoTreinoCreate):
    # 1. Se for para um aluno específico, desativa os planos anteriores
    if aluno_id:
        stmt_desativa = (
            update(models.PlanoTreino)
            .where(models.PlanoTreino.aluno_id == aluno_id, models.PlanoTreino.esta_ativo == True)
            .values(esta_ativo=False)
        )
        await db.execute(stmt_desativa)

    # 2. Cria o Plano
    novo_plano = models.PlanoTreino(
        aluno_id=aluno_id,
        titulo=plano_in.titulo,
        objetivo_estrategico=plano_in.objetivo_estrategico,
        duracao_semanas=plano_in.duracao_semanas
    )
    db.add(novo_plano)
    await db.flush() # Garante que temos o ID do plano

    # 2. Cria os Treinos (A, B, C...)
    for treino_data in plano_in.treinos:
        novo_treino = models.Treino(
            plano_id=novo_plano.id,
            nome=treino_data.nome
        )
        db.add(novo_treino)
        await db.flush()

        # 3. Cria as Prescrições para cada treino
        for pres_data in treino_data.prescricoes:
            nova_pres = models.Prescricao(
                treino_id=novo_treino.id,
                **pres_data.model_dump()
            )
            db.add(nova_pres)

    try:
        await db.commit()
        
        # Re-busca com selectinload para evitar erro de lazy loading no schema
        stmt = (
            select(models.PlanoTreino)
            .options(
                selectinload(models.PlanoTreino.treinos)
                .selectinload(models.Treino.prescricoes)
                .selectinload(models.Prescricao.exercicio)
            )
            .where(models.PlanoTreino.id == novo_plano.id)
        )
        result = await db.execute(stmt)
        return result.scalar()
    except Exception as e:
        await db.rollback()
        raise e

async def deletar_plano_treino(db: AsyncSession, plano_id: int) -> None:
    """
    Deleta um plano de treino permanentemente.
    """
    stmt = select(models.PlanoTreino).where(models.PlanoTreino.id == plano_id)
    result = await db.execute(stmt)
    plano = result.scalar_one_or_none()
    
    if not plano:
        raise exceptions.ResourceNotFoundError(f"Plano de treino {plano_id} não encontrado")
    
    await db.delete(plano)
    await db.commit()

async def clonar_plano_treino(db: AsyncSession, plano_origem_id: int, novo_aluno_id: int | None) -> models.PlanoTreino:
    """
    Clona um plano existente para um novo aluno (ou como template se novo_aluno_id for None).
    """
    # 1. Carrega o plano original com toda a hierarquia
    stmt = (
        select(models.PlanoTreino)
        .options(
            selectinload(models.PlanoTreino.treinos)
            .selectinload(models.Treino.prescricoes)
        )
        .where(models.PlanoTreino.id == plano_origem_id)
    )
    result = await db.execute(stmt)
    plano_origem = result.scalar_one_or_none()

    if not plano_origem:
        raise exceptions.ResourceNotFoundError(f"Plano de origem {plano_origem_id} não encontrado")

    # 2. Se for para um aluno, desativa os planos atuais dele
    if novo_aluno_id:
        await db.execute(
            update(models.PlanoTreino)
            .where(models.PlanoTreino.aluno_id == novo_aluno_id, models.PlanoTreino.esta_ativo == True)
            .values(esta_ativo=False)
        )

    # 3. Cria o novo plano (Cópia profunda)
    novo_plano = models.PlanoTreino(
        aluno_id=novo_aluno_id,
        titulo=f"{plano_origem.titulo} (Cópia)",
        objetivo_estrategico=plano_origem.objetivo_estrategico,
        detalhes=plano_origem.detalhes,
        duracao_semanas=plano_origem.duracao_semanas,
        esta_ativo=True if novo_aluno_id else False # Templates começam inativos ou neutros
    )
    db.add(novo_plano)
    await db.flush()

    for treino_origem in plano_origem.treinos:
        novo_treino = models.Treino(
            plano_id=novo_plano.id,
            nome=treino_origem.nome,
            ordem=treino_origem.ordem
        )
        db.add(novo_treino)
        await db.flush()

        for pres_origem in treino_origem.prescricoes:
            nova_pres = models.Prescricao(
                treino_id=novo_treino.id,
                exercicio_id=pres_origem.exercicio_id,
                series=pres_origem.series,
                repeticoes=pres_origem.repeticoes,
                descanso=pres_origem.descanso,
                carga=pres_origem.carga,
                observacoes=pres_origem.observacoes
            )
            db.add(nova_pres)

    await db.commit()
    
    # Retorna o plano clonado com os dados carregados
    stmt_final = (
        select(models.PlanoTreino)
        .options(
            selectinload(models.PlanoTreino.treinos)
            .selectinload(models.Treino.prescricoes)
            .selectinload(models.Prescricao.exercicio)
        )
        .where(models.PlanoTreino.id == novo_plano.id)
    )
    res_final = await db.execute(stmt_final)
    return res_final.scalar()

async def atualizar_plano_treino(db: AsyncSession, plano_id: int, payload: schemas.PlanoTreinoUpdate) -> models.PlanoTreino:
    """
    Atualiza um plano de treino e toda sua hierarquia (treinos e prescrições).
    Implementa lógica de sincronização: o que não vier no payload é removido.
    """
    # 1. Busca o plano existente com toda a hierarquia carregada
    stmt = (
        select(models.PlanoTreino)
        .options(
            selectinload(models.PlanoTreino.treinos)
            .selectinload(models.Treino.prescricoes)
        )
        .where(models.PlanoTreino.id == plano_id)
    )
    result = await db.execute(stmt)
    plano = result.scalar_one_or_none()

    if not plano:
        raise exceptions.ResourceNotFoundError(f"Plano {plano_id} não encontrado")

    # 2. Atualiza campos básicos do plano
    dados_plano = payload.model_dump(exclude={"treinos"}, exclude_unset=True)
    for key, value in dados_plano.items():
        setattr(plano, key, value)

    # 3. Sincroniza Treinos se fornecido
    if payload.treinos is not None:
        # Forçamos o carregamento/acesso para garantir que o SQLAlchemy não se perca
        treinos_atuais_map = {t.id: t for t in plano.treinos}
        ids_no_payload = {t.id for t in payload.treinos if t.id is not None}

        # 3a. Remover treinos que não estão no payload
        # Usamos uma lista auxiliar para iterar e deletar com segurança
        for t_id, t_obj in list(treinos_atuais_map.items()):
            if t_id not in ids_no_payload:
                # Remove da coleção da relação também
                plano.treinos.remove(t_obj)
                await db.delete(t_obj)

        # 3b. Atualizar ou Criar
        for i, t_data in enumerate(payload.treinos):
            if t_data.id and t_data.id in treinos_atuais_map:
                # Atualizar existente
                treino = treinos_atuais_map[t_data.id]
                treino.nome = t_data.nome
                treino.ordem = i

                # Sincronizar Prescrições
                pres_atuais_map = {p.id: p for p in treino.prescricoes}
                p_ids_no_payload = {p.id for p in t_data.prescricoes if p.id is not None}

                for p_id, p_obj in list(pres_atuais_map.items()):
                    if p_id not in p_ids_no_payload:
                        treino.prescricoes.remove(p_obj)
                        await db.delete(p_obj)

                for p_data in t_data.prescricoes:
                    if p_data.id and p_data.id in pres_atuais_map:
                        pres = pres_atuais_map[p_data.id]
                        for k, v in p_data.model_dump(exclude={"id"}).items():
                            setattr(pres, k, v)
                    else:
                        nova_p = models.Prescricao(treino_id=treino.id, **p_data.model_dump(exclude={"id"}))
                        db.add(nova_p)
            else:
                # Criar novo treino
                novo_treino = models.Treino(plano_id=plano.id, nome=t_data.nome, ordem=i)
                plano.treinos.append(novo_treino)
                db.add(novo_treino)
                await db.flush() # Para ganhar o ID do novo treino
                for p_data in t_data.prescricoes:
                    nova_p = models.Prescricao(treino_id=novo_treino.id, **p_data.model_dump(exclude={"id"}))
                    db.add(nova_p)

    await db.commit()

    # Retorna o plano atualizado com relações novas
    stmt_final = (
        select(models.PlanoTreino)
        .options(
            selectinload(models.PlanoTreino.treinos)
            .selectinload(models.Treino.prescricoes)
            .selectinload(models.Prescricao.exercicio)
        )
        .where(models.PlanoTreino.id == plano.id)
    )
    res_final = await db.execute(stmt_final)
    return res_final.scalar()

async def listar_exercicios(db: AsyncSession):
    result = await db.execute(select(models.Exercicio).order_by(models.Exercicio.grupo_muscular))
    return result.scalars().all()

async def criar_exercicio(db: AsyncSession, exercicio_in: schemas.ExercicioCreate):
    stmt = select(models.Exercicio).where(models.Exercicio.nome == exercicio_in.nome)
    result = await db.execute(stmt)
    if result.scalar_one_or_none():
        raise exceptions.BusinessRuleError(f"Exercício '{exercicio_in.nome}' já cadastrado.")
    
    novo_exercicio = models.Exercicio(**exercicio_in.model_dump())
    db.add(novo_exercicio)
    try:
        await db.commit()
        await db.refresh(novo_exercicio)
        return novo_exercicio
    except Exception as e:
        await db.rollback()
        raise e

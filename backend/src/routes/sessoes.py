from __future__ import annotations

from datetime import date, datetime

from fastapi import APIRouter, Depends, Query, Response
from sqlalchemy.ext.asyncio import AsyncSession

from src import controllers, schemas
from src.database import get_db

router = APIRouter(prefix="/sessoes", tags=["Sessoes"])


@router.post("/", response_model=schemas.SessaoTreinoPublic, status_code=201)
async def criar_sessao(payload: schemas.SessaoTreinoCreate, db: AsyncSession = Depends(get_db)):
    return await controllers.registrar_sessao(db, payload)


@router.get("/", response_model=list[schemas.SessaoTreinoPublic])
async def listar_sessoes(
    db: AsyncSession = Depends(get_db),
    aluno_id: int | None = None,
    de: date | None = None,
    ate: date | None = None,
    realizada: bool | None = None,
    limit: int = Query(default=100, ge=1, le=500),
    offset: int = Query(default=0, ge=0),
):
    return await controllers.listar_sessoes(
        db=db,
        aluno_id=aluno_id,
        de=de,
        ate=ate,
        realizada=realizada,
        limit=limit,
        offset=offset,
    )


@router.get("/frequencia/{aluno_id}", response_model=schemas.FrequenciaMensalPublic)
async def frequencia_mensal(
    aluno_id: int,
    referencia_mes: str | None = None,
    db: AsyncSession = Depends(get_db),
):
    if referencia_mes is None:
        agora = datetime.now()
        referencia_mes = f"{agora.month:02d}/{agora.year}"
    return await controllers.calcular_frequencia_mensal(db, aluno_id=aluno_id, referencia_mes=referencia_mes)

@router.get("/{sessao_id}", response_model=schemas.SessaoTreinoPublic)
async def buscar_sessao(sessao_id: int, db: AsyncSession = Depends(get_db)):
    return await controllers.get_sessao(db, sessao_id)


@router.delete("/{sessao_id}", status_code=204)
async def deletar_sessao(sessao_id: int, db: AsyncSession = Depends(get_db)):
    await controllers.deletar_sessao(db, sessao_id)
    return Response(status_code=204)
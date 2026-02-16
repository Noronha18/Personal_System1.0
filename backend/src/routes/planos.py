from fastapi import APIRouter, Depends, status, Response
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from src import controllers, schemas, database

router = APIRouter(
    prefix="/planos",
    tags=["Planos de Treino"]
)


@router.post("/", response_model=schemas.PlanoTreinoPublic, status_code=status.HTTP_201_CREATED)
async def criar_plano(
        plano: schemas.PlanoTreinoCreate,
    db: AsyncSession = Depends(database.get_db)
    ):
    return await controllers.create_plano_completo(db=db, plano_in=plano)

@router.patch("/{plano_id}/desativar", response_model=schemas.PlanoTreinoPublic)
async def desativar_plano_endpoint(plano_id: int, db: AsyncSession = Depends(database.get_db)):
    return await controllers.desativar_plano(db, plano_id)

@router.delete("/exercicios/{prescricao_id}", status_code=204)
async def deletar_exercicio_endpoint(prescricao_id: int, db: AsyncSession = Depends(database.get_db)):
    await controllers.deletar_prescricao(db, prescricao_id)
    return Response(status_code=204)
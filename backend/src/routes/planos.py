from fastapi import APIRouter, Depends, status
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
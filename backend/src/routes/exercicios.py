from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from src import controllers, schemas, database

router = APIRouter(
    prefix="/exercicios",
    tags=["Biblioteca de Exercícios"]
)

@router.get("/", response_model=list[schemas.ExercicioPublic])
async def listar_exercicios(db: AsyncSession = Depends(database.get_db)):
    return await controllers.listar_exercicios(db=db)

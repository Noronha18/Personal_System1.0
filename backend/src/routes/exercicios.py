from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from src import controllers, schemas, database

router = APIRouter(
    prefix="/exercicios",
    tags=["Biblioteca de Exercícios"]
)

@router.get("/", response_model=list[schemas.ExercicioPublic])
async def listar_exercicios(db: AsyncSession = Depends(database.get_db)):
    return await controllers.listar_exercicios(db=db)

@router.post("/", response_model=schemas.ExercicioPublic, status_code=status.HTTP_201_CREATED)
async def criar_exercicio(
    exercicio: schemas.ExercicioCreate,
    db: AsyncSession = Depends(database.get_db)
):
    return await controllers.criar_exercicio(db=db, exercicio_in=exercicio)

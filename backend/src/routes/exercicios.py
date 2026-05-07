from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from src import controllers, schemas, database
from src.seed_exercicios import seed
from src.security import get_current_trainer

router = APIRouter(
    prefix="/exercicios",
    tags=["Biblioteca de Exercícios"],
    dependencies=[Depends(get_current_trainer)]
)

@router.post("/seed", status_code=status.HTTP_201_CREATED)
async def seed_exercicios(db: AsyncSession = Depends(database.get_db)):
    """
    Popula a biblioteca de exercícios com a lista base.
    Utilize este endpoint se não tiver acesso ao terminal do servidor.
    """
    count = await seed(db)
    return {"message": f"Biblioteca populada com sucesso! {count} novos exercícios adicionados."}

@router.get("/", response_model=list[schemas.ExercicioPublic])
async def listar_exercicios(db: AsyncSession = Depends(database.get_db)):
    return await controllers.listar_exercicios(db=db)

@router.post("/", response_model=schemas.ExercicioPublic, status_code=status.HTTP_201_CREATED)
async def criar_exercicio(
    exercicio: schemas.ExercicioCreate,
    db: AsyncSession = Depends(database.get_db)
):
    return await controllers.criar_exercicio(db=db, exercicio_in=exercicio)

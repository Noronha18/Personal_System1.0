from fastapi import APIRouter, Depends
from sqlalchemy.orm import selectinload
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from src import controllers, schemas, database

router = APIRouter(
    prefix="/alunos",
    tags=["Alunos"]
)

@router.post("/", response_model=schemas.AlunoPublic, status_code=201)
async def criar_aluno(aluno: schemas.AlunoCreate, db: AsyncSession = Depends(database.get_db)):
    return await controllers.criar_aluno(db=db, aluno_in=aluno)

@router.get("/", response_model=list[schemas.AlunoPublic])
async def listar_alunos(db: AsyncSession = Depends(database.get_db)):
    return await controllers.listar_alunos_ativos(db=db)

@router.get("/{aluno_id}", response_model=schemas.AlunoPublic)
async def obter_aluno(aluno_id: int, db: AsyncSession = Depends(database.get_db)):
    return await controllers.get_aluno(db=db, aluno_id=aluno_id)

@router.delete("/{aluno_id}", status_code=204)
async def deletar_aluno(aluno_id: int, db: AsyncSession = Depends(database.get_db)):
    await controllers.excluir_aluno(db=db, aluno_id=aluno_id)
    return None # 204 No Content não retorna corpo

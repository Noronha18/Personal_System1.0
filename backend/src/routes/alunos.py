from fastapi import APIRouter, Depends
from sqlalchemy.orm import selectinload
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from src import controllers, schemas, database, models
from src.security import get_current_user

router = APIRouter(
    prefix="/alunos",
    tags=["Alunos"]
)

@router.post("/", 
             response_model=schemas.AlunoPublic, 
             status_code=201,
             dependencies=[Depends(get_current_user)])
async def criar_aluno(
    aluno: schemas.AlunoCreate, 
    db: AsyncSession = Depends(database.get_db)
):
    return await controllers.criar_aluno(db=db, aluno_in=aluno)

@router.get("/", 
            response_model=list[schemas.AlunoPublic], 
            dependencies=[Depends(get_current_user)])
async def listar_alunos(db: AsyncSession = Depends(database.get_db)):
    return await controllers.listar_alunos_ativos(db=db)

@router.get("/{aluno_id}", response_model=schemas.AlunoPublic)
async def obter_aluno(aluno_id: int, db: AsyncSession = Depends(database.get_db)):
    # Nota: Aqui não protegemos individualmente para mostrar que podemos 
    # escolher quais rotas são públicas ou privadas. 
    # Mas em um sistema real, esta também seria protegida.
    return await controllers.get_aluno(db=db, aluno_id=aluno_id)

@router.patch("/{aluno_id}/status", response_model=schemas.AlunoPublic, dependencies=[Depends(get_current_user)])
async def atualizar_status_aluno(
    aluno_id: int, 
    status: str, 
    db: AsyncSession = Depends(database.get_db)
):
    return await controllers.atualizar_status_aluno(db=db, aluno_id=aluno_id, novo_status=status)

@router.delete("/{aluno_id}", status_code=204, dependencies=[Depends(get_current_user)])
async def deletar_aluno(aluno_id: int, db: AsyncSession = Depends(database.get_db)):
    await controllers.excluir_aluno(db=db, aluno_id=aluno_id)
    return None # 204 No Content não retorna corpo

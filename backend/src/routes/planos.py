from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

# Ajuste os imports dependendo de onde fica sua pasta 'src'
from src import schemas, controllers
from src.database import get_db

# Cria o roteador para Planos
router = APIRouter(
    tags=["Planos de Treino"]
)

@router.post("/alunos/{aluno_id}/planos", response_model=schemas.PlanoTreinoPublic, status_code=status.HTTP_201_CREATED)
async def criar_plano_para_aluno(
    aluno_id: int,
    plano_in: schemas.PlanoTreinoCreate,
    db: AsyncSession = Depends(get_db)
):
    """
    Cria um novo plano de treino para um aluno, incluindo a 
    hierarquia completa de Treinos (A, B, C) e Prescrições.
    """
    return await controllers.criar_plano_treino(
        db=db, 
        aluno_id=aluno_id, 
        plano_in=plano_in
    )

@router.delete("/planos/{plano_id}", status_code=status.HTTP_204_NO_CONTENT)
async def deletar_plano(
    plano_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    Deleta um plano de treino permanentemente.
    """
    await controllers.deletar_plano_treino(db=db, plano_id=plano_id)
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

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
    try:
        # Aqui chamamos o nome correto da função do controller!
        novo_plano = await controllers.criar_plano_treino(
            db=db, 
            aluno_id=aluno_id, 
            plano_in=plano_in
        )
        return novo_plano
    except Exception as e:
        # Captura erros do banco de dados e devolve de forma limpa para o Frontend
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao salvar o plano no banco de dados: {str(e)}"
        )
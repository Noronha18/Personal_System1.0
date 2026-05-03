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

@router.get("/planos/templates", response_model=list[schemas.PlanoTreinoPublic])
async def listar_templates(
    db: AsyncSession = Depends(get_db)
):
    """
    Lista todos os modelos (templates) globais de treino.
    """
    return await controllers.listar_templates_globais(db=db)

@router.post("/planos/templates", response_model=schemas.PlanoTreinoPublic, status_code=status.HTTP_201_CREATED)
async def criar_template_global(
    plano_in: schemas.PlanoTreinoCreate,
    db: AsyncSession = Depends(get_db)
):
    """
    Cria um novo modelo (template) global de treino.
    """
    return await controllers.criar_plano_treino(
        db=db, 
        aluno_id=None, 
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

@router.post("/planos/{plano_id}/clonar", response_model=schemas.PlanoTreinoPublic)
async def clonar_plano(
    plano_id: int,
    aluno_id: int | None = None,
    db: AsyncSession = Depends(get_db)
):
    """
    Clona um plano existente (pode ser um template ou plano de outro aluno) 
    para um novo aluno ou como um novo template.
    """
    return await controllers.clonar_plano_treino(
        db=db, 
        plano_origem_id=plano_id, 
        novo_aluno_id=aluno_id
    )

@router.patch("/planos/{plano_id}", response_model=schemas.PlanoTreinoPublic)
async def atualizar_plano(
    plano_id: int,
    plano_up: schemas.PlanoTreinoUpdate,
    db: AsyncSession = Depends(get_db)
):
    """
    Edição avançada de um plano de treino, permitindo atualizar campos básicos,
    adicionar, editar ou remover treinos e prescrições em uma única chamada.
    """
    return await controllers.atualizar_plano_treino(
        db=db,
        plano_id=plano_id,
        payload=plano_up
    )
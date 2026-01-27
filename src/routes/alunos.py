from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session
from typing import List

from src.database import get_db
from src import controllers
from src import schemas

# Criação do roteador específico para alunos
router = APIRouter(
    prefix="/alunos",
    tags=["Alunos"],
)

# --- Rotas de Alunos ---

@router.get("/", response_model=List[schemas.AlunoPublic])
def get_alunos(db: Session = Depends(get_db)):
    """
    Retorna uma lista de todos os alunos ativos.
    """
    return controllers.listar_alunos_ativos(db)

@router.post("/", response_model=schemas.AlunoPublic, status_code=201)
def create_aluno(aluno: schemas.AlunoCreate, db: Session = Depends(get_db)):
    """
    Cria um novo aluno no sistema.

    O tratamento de erros genérico foi removido. Se o controller levantar
    uma exceção de negócio (ex: 'email já existe'), ele deve ser tratado
    aqui ou em um 'exception_handler' global. Erros inesperados agora
    retornarão um '500 Internal Server Error', que é mais apropriado.
    """
    # Lógica de negócio (ex: verificar se aluno já existe) deve ficar no controller.
    # O `try/except Exception` genérico foi removido.
    novo_aluno = controllers.criar_aluno(db=db, aluno=aluno)
    return novo_aluno

@router.get("/{aluno_id}", response_model=schemas.AlunoPublic)
def get_aluno(aluno_id: int, db: Session = Depends(get_db)):
    """
    Retorna os dados de um aluno específico.
    """
    db_aluno = controllers.get_aluno(db, aluno_id=aluno_id)
    if db_aluno is None:
        raise HTTPException(status_code=404, detail="Aluno não encontrado")
    
    return db_aluno

@router.put("/{aluno_id}", response_model=schemas.AlunoPublic)
def update_aluno(aluno_id: int, aluno_update: schemas.AlunoUpdate, db: Session = Depends(get_db)):
    """
    Atualiza os dados de um aluno existente.
    """
    # .model_dump() com exclude_unset=True é perfeito para PATCH,
    # pois envia para a camada de serviço apenas os dados que o cliente enviou.
    dados_para_atualizar = aluno_update.model_dump(exclude_unset=True)
    
    if not dados_para_atualizar:
        raise HTTPException(status_code=400, detail="Nenhum dado fornecido para atualização")

    aluno_atualizado = controllers.editar_aluno(
        db=db, 
        aluno_id=aluno_id, 
        dados_atualizados=dados_para_atualizar
    )

    if aluno_atualizado is None:
        raise HTTPException(status_code=404, detail="Aluno não encontrado")

    return aluno_atualizado

@router.delete("/{aluno_id}", status_code=204)
def delete_aluno(aluno_id: int, db: Session = Depends(get_db)):
    """
    Desativa um aluno no sistema.

    Retorna 204 No Content, um padrão REST para DELETE bem-sucedido,
    indicando que a operação foi feita e não há conteúdo a retornar.
    """
    aluno_excluido = controllers.excluir_aluno(db=db, aluno_id=aluno_id)

    if aluno_excluido is None:
        raise HTTPException(status_code=404, detail="Aluno não encontrado")

    return Response(status_code=204)
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from src import controllers, schemas, database

router = APIRouter(
    prefix="/alunos",
    tags=["Alunos"]
)

@router.post("/", response_model=schemas.AlunoPublic, status_code=201)
def criar_aluno(aluno: schemas.AlunoCreate, db: Session = Depends(database.get_db)):
    return controllers.criar_aluno(db=db, aluno_in=aluno)

@router.get("/", response_model=List[schemas.AlunoPublic])
def listar_alunos(db: Session = Depends(database.get_db)):
    return controllers.listar_alunos_ativos(db=db)

@router.get("/{aluno_id}", response_model=schemas.AlunoPublic)
def obter_aluno(aluno_id: int, db: Session = Depends(database.get_db)):
    return controllers.get_aluno(db=db, aluno_id=aluno_id)

@router.delete("/{aluno_id}", status_code=204)
def deletar_aluno(aluno_id: int, db: Session = Depends(database.get_db)):
    controllers.excluir_aluno(db=db, aluno_id=aluno_id)
    return None # 204 No Content não retorna corpo

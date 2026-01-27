from fastapi import FastAPI, Depends, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette import status
from starlette.requests import Request
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel, Field
from datetime import date, datetime
from src.database import get_db, engine, Base
from src.models import Aluno, Treino, Exercicio, Pagamento, Aula
from src import controllers
from src.routes import alunos # Importando o novo roteador de alunos
from src.exceptions import ResourceNotFoundError, BusinessRuleError

Base.metadata.create_all(bind=engine)


app = FastAPI(
    title="Personal System API",
    description="API para gestão de alunos e treinos",
    version="1.0.0"
)

# --- Configuração de CORS ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Em produção, restrinja para o seu domínio de frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Inclusão de Roteadores ---
app.include_router(alunos.router)



# --- Schemas para Exercício ---
class ExercicioBase(BaseModel):
    nome: str
    series: int
    repeticoes: str
    carga: Optional[float] = None
    descanso: int = Field(60, description="Descanso em segundos")

class ExercicioCreate(ExercicioBase):
    pass

class ExercicioPublic(ExercicioBase):
    id: int
    treino_id: int

    class Config:
        from_attributes = True

# --- Schemas para Treino ---
class TreinoBase(BaseModel):
    nome: str
    descricao: Optional[str] = None

class TreinoCreate(TreinoBase):
    exercicios: List[ExercicioCreate]

class TreinoPublic(TreinoBase):
    id: int
    aluno_id: int
    ativo: bool
    exercicios: List[ExercicioPublic] = []

    class Config:
        from_attributes = True


# --- Rotas (Endpoints) ---

@app.get("/")
def read_root():
    return {"message": "API do Personal System está Online! 🚀"}

# As rotas de /alunos agora estão em src/routes/alunos.py

# --- Rotas para Treinos ---

@app.post("/alunos/{aluno_id}/treinos", response_model=TreinoPublic, status_code=201)
def create_treino_for_aluno(aluno_id: int, treino: TreinoCreate, db: Session = Depends(get_db)):
    """
    Cria um novo treino com exercícios para um aluno específico.
    """
    controllers.get_aluno(db, aluno_id=aluno_id)
    return controllers.cadastrar_treino_completo(db=db, aluno_id=aluno_id, treino_data=treino)




@app.get("/alunos/{aluno_id}/treinos", response_model=List[TreinoPublic])
def get_treinos_for_aluno(aluno_id: int, db: Session = Depends(get_db)):
    """
    Lista todos os treinos de um aluno específico.
    """
    # Verifica se o aluno existe
    db_aluno = controllers.get_aluno(db, aluno_id=aluno_id)
    if db_aluno is None:
        raise HTTPException(status_code=404, detail="Aluno não encontrado")
    
    treinos = controllers.listar_treinos_aluno(db, aluno_id=aluno_id)
    return treinos


@app.get("/treinos/{treino_id}", response_model=TreinoPublic)
def get_treino(treino_id: int, db: Session = Depends(get_db)):
    """
    Retorna um treino específico pelo seu ID.
    """
    db_treino = controllers.get_treino_by_id(db, treino_id=treino_id)
    if db_treino is None:
        raise ResourceNotFoundError(f"Treino {treino_id} não encontrado")
    return db_treino


@app.delete("/treinos/{treino_id}")
def delete_treino(treino_id: int, db: Session = Depends(get_db)):
    """
    Exclui um treino do sistema (e seus exercícios em cascata).
    """
    treino_excluido = controllers.excluir_treino(db=db, treino_id=treino_id)

    if treino_excluido is None:
        raise HTTPException(status_code=404, detail="Treino não encontrado")

    return {"message": f"Treino '{treino_excluido.nome}' e seus exercícios foram excluídos com sucesso"}

@app.exception_handler(ResourceNotFoundError)
async def resource_not_found_exception_handler(request, exc: ResourceNotFoundError):
    return JSONResponse(
        status_code=status.HTTP_404_NOT_FOUND,
        content={"message": str(exc), "type": "ResourceNotFound"},
    )

@app.exception_handler(BusinessRuleError)
async def business_rule_handler(request: Request, exc: BusinessRuleError):
    return JSONResponse(
        status_code=status.HTTP_409_CONFLICT,
        content={"message": str(exc), "type": "BusinessRuleViolation"}
    )
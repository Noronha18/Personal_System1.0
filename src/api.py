from fastapi import FastAPI, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from typing import List


from src.database import get_db, engine, Base
from src import controllers, schemas, exceptions, models
from src.routes import alunos


Base.metadata.create_all(bind=engine)


app = FastAPI(
    title="Personal System API",
    description="API profissional para Personal Trainers",
    version="1.1.0"
)

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]
# --- MIDDLEWARES ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Em produção, restrinja para o seu domínio de frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- EXCEPTION HANDLERS ---
@app.exception_handler(exceptions.ResourceNotFoundError)
async def resource_not_found_handler(request: Request, exc: exceptions.ResourceNotFoundError):
    return JSONResponse(
        status_code=404,
        content={"message": str(exc), "type": "ResourceNotFound"}
    )

@app.exception_handler(exceptions.BusinessRuleError)
async def business_rule_handler(request: Request, exc: exceptions.BusinessRuleError):
    return JSONResponse(
        status_code=409,
        content={"message": str(exc), "type": "BusinessRuleViolation"}
    )

# --- ROTAS DE SAÚDE ---

@app.get("/")
def read_root():
    return{"status": "online", "version": "1.1.0"}

# --- ROTAS DE ALUNOS ---

app.include_router(alunos.router) 

# --- ROTAS DE PLANOS DE TREINO ---

@app.post("/alunos/{aluno_id}/planos", response_model=schemas.PlanoTreinoPublic, status_code=201)
def create_plano_treino(aluno_id: int, plano: schemas.PlanoTreinoCreate, db: Session = Depends(get_db)):
    """
    Cria um novo plano de treino para um aluno específico.
    """
    return controllers.cadastrar_plano_treino(db=db, aluno_id=aluno_id, plano_in=plano)

@app.get("/alunos/{aluno_id}/planos", response_model=List[schemas.PlanoTreinoPublic])
def listar_planos_aluno(aluno_id: int, db: Session = Depends(get_db)):
    """
    Lista todos os planos de treino ativos e inativos de um aluno específico.
    """
    return controllers.listar_planos_aluno(db=db, aluno_id=aluno_id)

@app.post("/alunos/{aluno_id}/pagamentos", response_model=schemas.PagamentoPublic)
def registrar_pagamento(aluno_id: int, valor: float, pagamento: schemas.PagamentoBase, db: Session = Depends(get_db)):
    """
    Registra um novo pagamento para um aluno.
    """
    return controllers.registrar_pagamento(db=db, aluno_id=aluno_id, valor=valor)

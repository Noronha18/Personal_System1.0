from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel

# Importando seus modelos e banco de dados existentes
from src.database import get_db
from src.models import Aluno
# Importando a lógica que você já criou (Reutilização de código!)
from src import controllers

app = FastAPI(
    title="Personal System API",
    description="API para gestão de alunos e treinos",
    version="1.0.0"
)

# --- Configuração de CORS (Permite que o React acesse a API) ---
origins = [
    "http://localhost:3000",  # React padrão
    "http://localhost:5173",  # Vite (React Moderno)
    "*"                       # (Perigoso em produção, mas ótimo para dev)
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Schemas (Pydantic) ---
# O FastAPI usa isso para validar os dados que entram e saem (Type Safety)
class AlunoSchema(BaseModel):
    id: int
    nome: str
    frequencia_semanal_plano: int
    status_financeiro: str
    
    class Config:
        from_attributes = True # Permite ler direto do objeto SQLAlchemy

# --- Rotas (Endpoints) ---

@app.get("/")
def read_root():
    return {"message": "API do Personal System está Online! 🚀"}

@app.get("/alunos", response_model=List[AlunoSchema])
def get_alunos():
    """
    Retorna a lista de alunos ativos.
    Usa a lógica que já criamos no controller.
    """
    # Aqui reutilizamos sua função existente!
    # Nota: Precisaremos adaptar levemente o controller no futuro para não depender de 'next(get_db())'
    # mas por enquanto, vamos chamar direto para testar.
    alunos = controllers.listar_alunos_ativos()
    return alunos

@app.post("/alunos")
def create_aluno(nome: str, frequencia: int, valor: float):
    """
    Cria um novo aluno via API
    """
    sucesso, msg = controllers.criar_aluno(nome, frequencia, valor)
    if not sucesso:
        raise HTTPException(status_code=400, detail=msg)
    return {"message": msg}

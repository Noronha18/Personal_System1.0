from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel, Field
from datetime import date, datetime

# Importando seus modelos e o novo padrão de controller
from src.database import get_db
from src.models import Aluno, Pagamento, Aula, Treino, Exercicio
from src import controllers

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

# --- Schemas (Pydantic) ---

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

# --- Schemas para Pagamento ---
class PagamentoBase(BaseModel):
    valor: float
    forma_pagamento: str = "PIX"
    observacao: Optional[str] = None

class PagamentoCreate(PagamentoBase):
    pass

class PagamentoPublic(PagamentoBase):
    id: int
    aluno_id: int
    data_pagamento: date
    referencia_mes: str # Ex: "01/2026"

    class Config:
        from_attributes = True

# --- Schemas para Aluno ---
class AlunoBase(BaseModel):
    nome: str
    idade: Optional[int] = None
    objetivo: Optional[str] = None
    restricoes: Optional[str] = None
    valor_mensalidade: float
    frequencia_semanal_plano: int
    dia_vencimento: int

# Schema para criação (herda do base, todos os campos são obrigatórios)
class AlunoCreate(AlunoBase):
    valor_mensalidade: float = Field(..., gt=0)
    frequencia_semanal_plano: int = Field(..., gt=0)
    dia_vencimento: int = Field(..., gt=0, le=31)

# Schema para atualização (herda do base, todos os campos são opcionais)
class AlunoUpdate(AlunoBase):
    nome: Optional[str] = None
    valor_mensalidade: Optional[float] = Field(None, gt=0)
    frequencia_semanal_plano: Optional[int] = Field(None, gt=0)
    dia_vencimento: Optional[int] = Field(None, gt=0, le=31)


# Schema para exibição (dados que a API retorna)
class AlunoPublic(AlunoBase):
    id: int
    data_inicio: date
    # Adicionando a lista de treinos e pagamentos do aluno na resposta
    treinos: List[TreinoPublic] = []
    pagamentos: List[PagamentoPublic] = []
    # Campos calculados pelo controller
    status_financeiro: str
    aulas_feitas_mes: int

    class Config:
        from_attributes = True # Mapeia automaticamente do modelo SQLAlchemy

# --- Rotas (Endpoints) ---

@app.get("/")
def read_root():
    return {"message": "API do Personal System está Online! 🚀"}

@app.get("/alunos", response_model=List[AlunoPublic])
def get_alunos(db: Session = Depends(get_db)):
    """
    Retorna uma lista de todos os alunos com seu status financeiro e aulas no mês.
    """
    alunos = controllers.listar_alunos_ativos(db)
    return alunos

@app.post("/alunos", response_model=AlunoPublic, status_code=201)
def create_aluno(aluno: AlunoCreate, db: Session = Depends(get_db)):
    """
    Cria um novo aluno no sistema.
    """
    try:
        novo_aluno = controllers.criar_aluno(
            db=db,
            nome=aluno.nome,
            frequencia=aluno.frequencia_semanal_plano,
            valor=aluno.valor_mensalidade,
            dia_pag=aluno.dia_vencimento,
            idade=aluno.idade,
            objetivo=aluno.objetivo,
            restricoes=aluno.restricoes
        )
        return novo_aluno
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/alunos/{aluno_id}", response_model=AlunoPublic)
def get_aluno(aluno_id: int, db: Session = Depends(get_db)):
    """
    Retorna os dados de um aluno específico.
    """
    db_aluno = controllers.get_aluno(db, aluno_id=aluno_id)
    if db_aluno is None:
        raise HTTPException(status_code=404, detail="Aluno não encontrado")
    
    return db_aluno

@app.put("/alunos/{aluno_id}", response_model=AlunoPublic)
def update_aluno(aluno_id: int, aluno_update: AlunoUpdate, db: Session = Depends(get_db)):
    """
    Atualiza os dados de um aluno existente.
    """
    # .model_dump(exclude_unset=True) é crucial para atualizações parciais
    # Ele cria um dict apenas com os dados que foram enviados no request
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

@app.delete("/alunos/{aluno_id}", response_model={"message": str})
def delete_aluno(aluno_id: int, db: Session = Depends(get_db)):
    """
    Exclui um aluno do sistema.
    """
    aluno_excluido = controllers.excluir_aluno(db=db, aluno_id=aluno_id)

    if aluno_excluido is None:
        raise HTTPException(status_code=404, detail="Aluno não encontrado")

    return {"message": f"Aluno '{aluno_excluido.nome}' excluído com sucesso"}


# --- Rotas para Treinos ---

@app.post("/alunos/{aluno_id}/treinos", response_model=TreinoPublic, status_code=201)
def create_treino_for_aluno(aluno_id: int, treino: TreinoCreate, db: Session = Depends(get_db)):
    """
    Cria um novo treino com exercícios para um aluno específico.
    """
    # Primeiro, verifica se o aluno existe
    db_aluno = controllers.get_aluno(db, aluno_id=aluno_id)
    if db_aluno is None:
        raise HTTPException(status_code=404, detail="Aluno não encontrado")

    try:
        novo_treino = controllers.cadastrar_treino_completo(db=db, aluno_id=aluno_id, treino_data=treino)
        return novo_treino
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Erro ao cadastrar treino: {e}")


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
        raise HTTPException(status_code=404, detail="Treino não encontrado")
    return db_treino


@app.delete("/treinos/{treino_id}", response_model={"message": str})
def delete_treino(treino_id: int, db: Session = Depends(get_db)):
    """
    Exclui um treino do sistema (e seus exercícios em cascata).
    """
    treino_excluido = controllers.excluir_treino(db=db, treino_id=treino_id)

    if treino_excluido is None:
        raise HTTPException(status_code=404, detail="Treino não encontrado")

    return {"message": f"Treino '{treino_excluido.nome}' e seus exercícios foram excluídos com sucesso"}


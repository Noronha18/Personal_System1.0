from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import date

# ===================================================================
# Schemas de Exercício
# ===================================================================

class ExercicioBase(BaseModel):
    nome: str
    series: int
    repeticoes: str
    carga: Optional[float] = None
    descanso: int = Field(60, description="Descanso em segundos")

class ExercicioPublic(ExercicioBase):
    id: int
    treino_id: int

    class Config:
        from_attributes = True

# ===================================================================
# Schemas de Treino
# ===================================================================

class TreinoBase(BaseModel):
    nome: str
    descricao: Optional[str] = None

class TreinoPublic(TreinoBase):
    id: int
    aluno_id: int
    ativo: bool
    exercicios: List[ExercicioPublic] = []

    class Config:
        from_attributes = True

# ===================================================================
# Schemas de Pagamento
# ===================================================================

class PagamentoBase(BaseModel):
    valor: float
    forma_pagamento: str = "PIX"
    observacao: Optional[str] = None

class PagamentoPublic(PagamentoBase):
    id: int
    aluno_id: int
    data_pagamento: date
    referencia_mes: str 

    class Config:
        from_attributes = True

# ===================================================================
# Schemas de Aluno
# ===================================================================

class AlunoBase(BaseModel):
    nome: str
    idade: Optional[int] = None
    objetivo: Optional[str] = None
    restricoes: Optional[str] = None
    valor_mensalidade: float
    frequencia_semanal_plano: int
    dia_vencimento: int

class AlunoCreate(AlunoBase):
    valor_mensalidade: float = Field(..., gt=0)
    frequencia_semanal_plano: int = Field(..., gt=0)
    dia_vencimento: int = Field(..., gt=0, le=31)

class AlunoUpdate(BaseModel):
    # Note que não herda de AlunoBase. Para updates (PATCH), queremos que todos os campos
    # sejam opcionais, sem valores padrão obrigatórios.
    nome: Optional[str] = None
    idade: Optional[int] = None
    objetivo: Optional[str] = None
    restricoes: Optional[str] = None
    valor_mensalidade: Optional[float] = Field(None, gt=0)
    frequencia_semanal_plano: Optional[int] = Field(None, gt=0)
    dia_vencimento: Optional[int] = Field(None, gt=0, le=31)

class AlunoPublic(AlunoBase):
    id: int
    data_inicio: date
    treinos: List[TreinoPublic] = []
    pagamentos: List[PagamentoPublic] = []
    status_financeiro: str
    aulas_feitas_mes: int

    class Config:
        from_attributes = True

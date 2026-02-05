from pydantic import BaseModel, Field, field_validator
from typing import List, Optional
from datetime import date, datetime
from validate_docbr import CPF


# ===================================================================
# Schemas de Precricao
# ===================================================================

class PrescricaoExercicioBase(BaseModel):
    nome_exercicio: str
    series: int
    repeticoes: str
    carga_kg: Optional[float] = None
    tempo_descanso_segundos: int = Field(60, description="Descanso em segundos")
    notas_tecnicas: Optional[str] = None

class PrescricaoExercicioCreate(PrescricaoExercicioBase):
    pass


class PrescricaoExercicioPublic(PrescricaoExercicioBase):
    id: int
    plano_treino_id: int

    class Config:
        from_attributes = True

# ===================================================================
# Schemas de Plano de Treino
# ===================================================================

class PlanoTreinoBase(BaseModel):
    titulo: str
    objetivo_estrategico: Optional[str] = None
    esta_ativo: bool = True

class PlanoTreinoCreate(PlanoTreinoBase):
    prescricoes: List[PrescricaoExercicioCreate]


class PlanoTreinoPublic(PlanoTreinoBase):
    id: int
    aluno_id: int
    data_criacao: datetime
    prescricoes: List[PrescricaoExercicioPublic] = []

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
    cpf: str
    idade: Optional[int] = None
    objetivo: Optional[str] = None
    restricoes: Optional[str] = None
    valor_mensalidade: float
    frequencia_semanal_plano: int
    dia_vencimento: int

    @field_validator('cpf')
    @classmethod
    def validar_cpf(cls, v:str) -> str:
        cpf_limpo = "".join([d for d in v if d.isdigit()])

        cpf_validador = CPF()
        if not CPF().validate(cpf_limpo):
            raise ValueError("CPF inválido! Verifique os digitos.")
        
        return cpf_limpo


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
    cpf: str
    data_inicio: date
    planos_treino: List[PlanoTreinoPublic] = []
    pagamentos: List[PagamentoPublic] = []
    status_financeiro: str
    aulas_feitas_mes: int

    class Config:
        from_attributes = True

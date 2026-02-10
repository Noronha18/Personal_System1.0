from pydantic import BaseModel, Field, field_validator
from typing import List, Optional
from datetime import date, datetime
from validate_docbr import CPF

# ===================================================================
# Schemas de Precricao (Refinado)
# ===================================================================

class PrescricaoExercicioBase(BaseModel):
    # Adicionei descrições para documentação automática do Swagger/OpenAPI
    nome_exercicio: str = Field(..., min_length=2, description="Nome do movimento (ex: Supino)")
    series: int = Field(..., gt=0)
    repeticoes: str = Field(..., description="Ex: '10-12', 'Falha'")
    carga_kg: Optional[float] = Field(None, ge=0)
    tempo_descanso_segundos: int = Field(60, ge=0, description="Descanso em segundos")
    notas_tecnicas: Optional[str] = None

class PrescricaoExercicioCreate(PrescricaoExercicioBase):
    pass

class PrescricaoExercicioPublic(PrescricaoExercicioBase):
    id: int
    plano_treino_id: int

    class Config:
        from_attributes = True

# ===================================================================
# Schemas de Plano de Treino (Corrigido para Nested Write)
# ===================================================================

class PlanoTreinoBase(BaseModel):
    titulo: str = Field(..., min_length=3, description="Título da ficha")
    objetivo_estrategico: Optional[str] = None
    esta_ativo: bool = True

class PlanoTreinoCreate(PlanoTreinoBase):
    # ADIÇÃO CRÍTICA: Precisamos saber de quem é o plano ao criar!
    aluno_id: int 
    # Lista aninhada para salvar tudo de uma vez
    prescricoes: List[PrescricaoExercicioCreate] = [] 

class PlanoTreinoPublic(PlanoTreinoBase):
    id: int
    aluno_id: int
    data_criacao: datetime
    # Retorna a árvore completa (Plano -> Exercícios)
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

    @field_validator('valor')
    @classmethod
    def validar_valor_positivo(cls, v: float) -> float:
        if v <= 0:
            raise ValueError("O valor do pagamento deve ser maior que zero.")
        return round(v, 2)

class PagamentoCreate(PagamentoBase):
    aluno_id: int



class PagamentoPublic(PagamentoBase):
    id: int
    aluno_id: int
    data_pagamento: date
    referencia_mes: str

    model_config = {"from_attributes": True}


class PagamentoUpdate(PagamentoBase):
    valor: Optional[float] = None
    forma_pagamento: Optional[str] = None
    observacao: Optional[str] = None


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

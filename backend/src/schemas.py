from __future__ import annotations
from pydantic import BaseModel, Field, field_validator, model_validator, ConfigDict
from typing import List, Optional
from datetime import date, datetime
from validate_docbr import CPF

# ===================================================================
# Schemas de Precricao
# ===================================================================

class PrescricaoExercicioBase(BaseModel):
    nome_exercicio: str
    series: str
    repeticoes: str
    carga_kg: Optional[float] = 0.0
    tempo_descanso_segundos: Optional[int] = 60
    notas_tecnicas: Optional[str] = None

class PrescricaoExercicioCreate(PrescricaoExercicioBase):
    pass

class PrescricaoExercicioPublic(PrescricaoExercicioBase):
    id: int
    treino_id: int
    model_config = ConfigDict(from_attributes=True)

# ===================================================================
# Schemas de Treino 
# ===================================================================

class TreinoBase(BaseModel):
    nome: str
    descricao: Optional[str] = None

class TreinoCreate(TreinoBase):
    # Um treino, ao ser criado, TEM que receber uma lista de exercícios
    prescricoes: List[PrescricaoExercicioCreate]

class TreinoPublic(TreinoBase):
    id: int
    plano_treino_id: int
    prescricoes: List[PrescricaoExercicioPublic] = []
    model_config = ConfigDict(from_attributes=True)

    # ==========================================
# 3. PLANO DE TREINO
# ==========================================
class PlanoTreinoBase(BaseModel):
    titulo: str
    objetivo_estrategico: Optional[str] = None
    detalhes: Optional[str] = None
    esta_ativo: Optional[bool] = True

class PlanoTreinoCreate(PlanoTreinoBase):
    # Um plano, ao ser criado, TEM que receber uma lista de Treinos (A, B, C)
    treinos: List[TreinoCreate]

class PlanoTreinoPublic(PlanoTreinoBase):
    id: int
    aluno_id: int
    data_criacao: datetime
    data_inicio: Optional[date] = None
    data_fim: Optional[date] = None
    treinos: List[TreinoPublic] = []
    model_config = ConfigDict(from_attributes=True)
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
    valor: float
    referencia_mes: str
    forma_pagamento: str
    observacao: Optional[str] = None
    quantidade_aulas: Optional[int] = 0
    
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



# ===================================================================
# Schemas de Sessao de treino
# ===================================================================

class SessaoTreinoBase(BaseModel):
    aluno_id: int
    plano_treino_id: int | None = None
    data_hora: datetime | None = None
    realizada: bool = True
    observacoes_performance: str | None = None
    motivo_ausencia: str | None = None
    reposicao_agendada: bool = False

    @model_validator(mode="after")
    def validar_coerencia_presenca(self) -> "SessaoTreinoBase":
        # Se não foi realizada, motivo é obrigatório
        if self.realizada is False and not (self.motivo_ausencia and self.motivo_ausencia.strip()):
            raise ValueError("motivo_ausencia é obrigatório quando realizada=false")
        return self


class SessaoTreinoCreate(SessaoTreinoBase):
    aluno_id: int
    plano_treino_id: Optional[int] = None
    data_hora: Optional[datetime] = None
    realizada: bool = True
    precisa_reposicao: bool = False
    observacoes_performance: Optional[str] = None
    motivo_ausencia: Optional[str] = None
    
    pass


class SessaoTreinoPublic(SessaoTreinoBase):
    id: int

    model_config = {"from_attributes": True}


class FrequenciaMensalPublic(BaseModel):
    aluno_id: int
    referencia_mes: str = Field(pattern=r"^\d{2}/\d{4}$")  # "MM/YYYY"
    sessoes_previstas: int
    sessoes_realizadas: int
    taxa_adesao: float


# === SCHEMAS DE DASHBOARD FINANCEIRO ===

class ReceitaMensalItem(BaseModel):
    """Receita de um único mês para série histórica."""
    referencia_mes: str = Field(
        ...,
        description="Mês no formato MM/YYYY",
        pattern=r"^\d{2}/\d{4}$",
        examples=["02/2026"]
    )
    receita: float = Field(
        ge=0,
        description="Receita total do mês em R$",
        examples=[4500.00]
    )

    model_config = ConfigDict(from_attributes=True)


class EstatisticasFinanceirasPublic(BaseModel):
    """
    KPIs financeiros do negócio + série histórica de 12 meses.
    
    📚 Conceito: Este schema agrega dados de múltiplas queries
    para fornecer um "snapshot" completo da saúde financeira.
    """
    
    # Contexto temporal
    referencia_mes: str = Field(
        ...,
        description="Mês atual de referência (MM/YYYY)",
        examples=["02/2026"]
    )
    
    # KPIs do mês atual
    receita_total: float = Field(
        ge=0,
        description="Receita total do mês atual em R$",
        examples=[4500.00]
    )
    
    ticket_medio: float = Field(
        ge=0,
        description="Valor médio por aluno que pagou no mês",
        examples=[225.00]
    )
    
    inadimplencia: float = Field(
        ge=0,
        le=1,
        description="Taxa de inadimplência (0.0 a 1.0)",
        examples=[0.15]
    )
    
    # Volumetria
    total_alunos: int = Field(
        ge=0,
        description="Total de alunos cadastrados",
        examples=[25]
    )
    
    alunos_em_dia: int = Field(
        ge=0,
        description="Alunos que pagaram no mês atual",
        examples=[20]
    )
    
    alunos_inadimplentes: int = Field(
        ge=0,
        description="Alunos que NÃO pagaram no mês atual",
        examples=[5]
    )
    
    # Série histórica
    receita_mensal_12m: list[ReceitaMensalItem] = Field(
        ...,
        description="Receita dos últimos 12 meses (ordem cronológica)",
        min_length=12,
        max_length=12
    )

    model_config = ConfigDict(
        from_attributes=True,
        json_schema_extra={
            "example": {
                "referencia_mes": "02/2026",
                "receita_total": 4500.00,
                "ticket_medio": 225.00,
                "inadimplencia": 0.2,
                "total_alunos": 25,
                "alunos_em_dia": 20,
                "alunos_inadimplentes": 5,
                "receita_mensal_12m": [
                    {"referencia_mes": "03/2025", "receita": 3200.00},
                    {"referencia_mes": "04/2025", "receita": 3500.00},
                    {"referencia_mes": "05/2025", "receita": 3800.00},
                    {"referencia_mes": "06/2025", "receita": 4000.00},
                    {"referencia_mes": "07/2025", "receita": 3900.00},
                    {"referencia_mes": "08/2025", "receita": 4200.00},
                    {"referencia_mes": "09/2025", "receita": 4100.00},
                    {"referencia_mes": "10/2025", "receita": 4300.00},
                    {"referencia_mes": "11/2025", "receita": 4400.00},
                    {"referencia_mes": "12/2025", "receita": 4600.00},
                    {"referencia_mes": "01/2026", "receita": 4350.00},
                    {"referencia_mes": "02/2026", "receita": 4500.00}
                ]
            }
        }
    )
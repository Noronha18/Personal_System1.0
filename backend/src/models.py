from sqlalchemy import Column, Integer, String, Date, DateTime, Boolean, Text, Float, ForeignKey
from sqlalchemy.orm import relationship
from src.database import Base
from datetime import date, datetime


class Aluno(Base):
    __tablename__ = 'alunos'

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String)
    cpf = Column(String, unique=True, index=True)
    data_inicio = Column(Date, default=date.today)
    dia_vencimento = Column(Integer, default=5)
    # Campos Novos
    frequencia_semanal_plano = Column("frequencia_semanal", Integer, default=3)  # Mapeando nome do banco
    valor_mensalidade = Column(Float, default=0.0)
    idade = Column(Integer, default=0)
    objetivo = Column(Text, nullable=True)
    restricoes = Column(Text, nullable=True)

    # Relacionamento
    sessoes = relationship("SessaoTreino", back_populates="aluno", cascade="all, delete-orphan")
    planos_treino = relationship("PlanoTreino", back_populates="aluno", cascade="all, delete-orphan")
    pagamentos = relationship("Pagamento", back_populates="aluno", cascade="all, delete-orphan")

    # Propriedades auxiliares para a View (não salvas no banco, calculadas na hora)
    aulas_feitas_mes = 0
    status_financeiro = "em_dia"


class Pagamento(Base):
    __tablename__ = 'pagamentos'

    id = Column(Integer, primary_key=True)
    aluno_id = Column(Integer, ForeignKey('alunos.id'))

    data_pagamento = Column(Date, default=date.today)
    valor = Column(Float)
    referencia_mes = Column(String(7))  # Ex: "01/2026"
    forma_pagamento = Column(String(50))  # PIX, Dinheiro, Cartão
    observacao = Column(Text, nullable=True)

    aluno = relationship("Aluno", back_populates="pagamentos")


class SessaoTreino(Base):
    """
    Representa a execução real do treino (o evento).
    Antigamente chamada de 'Aula'.
    """
    __tablename__ = 'sessoes_treino'

    id = Column(Integer, primary_key=True)
    aluno_id = Column(Integer, ForeignKey('alunos.id', ondelete='CASCADE'))
    # Vincula a sessão a um plano específico (ex: Hoje o aluno veio fazer o 'Plano A')
    plano_treino_id = Column(Integer, ForeignKey('planos_treino.id', ondelete='SET NULL'), nullable=True)

    data_hora = Column(DateTime, default=datetime.now)
    realizada = Column(Boolean, default=True)
    observacoes_performance = Column(Text, nullable=True) # Ex: 'Aluno sentiu dor no ombro'
    motivo_ausencia = Column(Text, nullable=True)
    reposicao_agendada = Column(Boolean, default=False)

    # Relacionamentos
    aluno = relationship("Aluno", back_populates="sessoes")
    plano_treino = relationship("PlanoTreino", back_populates="sessoes_executadas")


class PlanoTreino(Base):
    """
    Representa o agrupador de prescrições (A ficha de treino).
    Antigamente chamada de 'Treino'.
    """
    __tablename__ = 'planos_treino'

    id = Column(Integer, primary_key=True, index=True)
    aluno_id = Column(Integer, ForeignKey('alunos.id', ondelete='CASCADE'))
    
    titulo = Column(String, index=True) # Ex: 'Treino A - Superior'
    objetivo_estrategico = Column(Text, nullable=True) # Ex: 'Foco em força máxima'
    esta_ativo = Column(Boolean, default=True)
    data_criacao = Column(DateTime, default=datetime.now)

    # Relacionamentos
    aluno = relationship("Aluno", back_populates="planos_treino")
    prescricoes = relationship("PrescricaoExercicio", back_populates="plano_treino", cascade="all, delete-orphan")
    sessoes_executadas = relationship("SessaoTreino", back_populates="plano_treino")


class PrescricaoExercicio(Base):
    """
    Representa o detalhamento técnico de cada movimento dentro de um plano.
    Antigamente chamada de 'Exercicio'.
    """
    __tablename__ = 'prescricoes_exercicio'

    id = Column(Integer, primary_key=True)
    plano_treino_id = Column(Integer, ForeignKey('planos_treino.id', ondelete='CASCADE'))
    
    # Aqui, para manter a Opção B, o ideal seria uma FK para ExercicioCatalogo, 
    # mas manteremos o nome do exercício como String por enquanto para não complicar seu banco hoje.
    nome_exercicio = Column(String, index=True) 
    
    series = Column(Integer)
    repeticoes = Column(String) # Permite '10-12' ou 'Até a falha'
    carga_kg = Column(Float, nullable=True)
    tempo_descanso_segundos = Column(Integer, default=60)
    notas_tecnicas = Column(Text, nullable=True) # Ex: 'Manter escápulas retraídas'

    # Relacionamentos
    plano_treino = relationship("PlanoTreino", back_populates="prescricoes")

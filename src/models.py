from sqlalchemy import Column, Integer, String, Date, Boolean, Text, Float, ForeignKey
from sqlalchemy.orm import relationship
from src.database import Base
from datetime import date


class Aluno(Base):
    __tablename__ = 'alunos'

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String)
    email = Column(String)
    faixa = Column(String)  # Usado como Categoria/Objetivo
    data_inicio = Column(Date, default=date.today)

    # Campos Novos
    frequencia_semanal_plano = Column("frequencia_semanal", Integer, default=3)  # Mapeando nome do banco
    valor_mensalidade = Column(Float, default=0.0)
    idade = Column(Integer, default=0)
    objetivo = Column(Text, nullable=True)
    restricoes = Column(Text, nullable=True)

    # Relacionamento
    aulas = relationship("Aula", back_populates="aluno")

    # Propriedades auxiliares para a View (não salvas no banco, calculadas na hora)
    aulas_feitas_mes = 0
    status_financeiro = "em_dia"


class Aula(Base):
    __tablename__ = 'aulas'

    id = Column(Integer, primary_key=True)
    aluno_id = Column(Integer, ForeignKey('alunos.id'))
    data_aula = Column(Date, default=date.today)

    conteudo_treino = Column(Text)
    realizada = Column(Boolean, default=True)
    motivo_falta = Column(Text)
    reposicao_prevista = Column(Boolean, default=False)

    aluno = relationship("Aluno", back_populates="aulas")

from operator import index

from sqlalchemy import Column, Integer, String, Date, DateTime, Boolean, Text, Float, ForeignKey, column
from sqlalchemy.orm import relationship
from src.database import Base
from datetime import date, datetime


class Aluno(Base):
    __tablename__ = 'alunos'

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String)
    data_inicio = Column(Date, default=date.today)
    dia_vencimento = Column(Integer, default=5)
    # Campos Novos
    frequencia_semanal_plano = Column("frequencia_semanal", Integer, default=3)  # Mapeando nome do banco
    valor_mensalidade = Column(Float, default=0.0)
    idade = Column(Integer, default=0)
    objetivo = Column(Text, nullable=True)
    restricoes = Column(Text, nullable=True)

    # Relacionamento
    aulas = relationship("Aula", back_populates="aluno")
    pagamentos = relationship("Pagamento", back_populates="aluno")
    
    # CORREÇÃO: O back_populates aponta para o atributo 'aluno' na classe Treino
    treinos = relationship("Treino", back_populates="aluno")

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


class Aula(Base):
    __tablename__ = 'aulas'

    id = Column(Integer, primary_key=True)
    aluno_id = Column(Integer, ForeignKey('alunos.id', ondelete='CASCADE'))

    # Nova FK: liga a aula a um treino específico
    treino_id = Column(Integer, ForeignKey('treinos.id', ondelete='SET NULL'), nullable=True)

    # MUDANÇA: Date -> DateTime para guardar hora
    data_aula = Column(DateTime, default=datetime.now)

    # Mudamos o nome para ficar claro: aqui vão as anotações do dia
    observacoes_do_dia = Column(Text, nullable=True)

    realizada = Column(Boolean, default=True)
    motivo_falta = Column(Text, nullable=True)
    reposicao_prevista = Column(Boolean, default=False)

    # Relacionamentos (Para você acessar aula.aluno.nome ou aula.treino.nome)
    aluno = relationship("Aluno", back_populates="aulas")
    treino = relationship("Treino", back_populates="aulas")  # Adicionando essa ponte

class Treino(Base):

    __tablename__ = 'treinos'

    id = Column(Integer, primary_key=True, index=True)
    aluno_id = Column(Integer, ForeignKey('alunos.id'))
    nome = Column(String) #EX:"Treino A", Treino Funcional, Hipertrofia, etc...
    descricao = Column(Text, nullable=True) #Objetivo do treino
    ativo = Column(Boolean, default=True) #Para desativar fichas antigas

    aluno = relationship("Aluno", back_populates="treinos")
    exercicios = relationship("Exercicio", back_populates="treino", cascade="all, delete-orphan")
    aulas = relationship("Aula", back_populates="treino")

class Exercicio(Base):

    __tablename__ = 'exercicios'

    id = Column(Integer, primary_key=True)
    treino_id = Column(Integer, ForeignKey('treinos.id'))
    nome = Column(String)
    series = Column(Integer)
    repeticoes = Column(String)
    carga = Column(Float, nullable=True)
    descanso = Column(Integer, default=60)

    treino = relationship("Treino", back_populates="exercicios")

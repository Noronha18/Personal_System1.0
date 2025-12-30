# src/models.py
# -*- coding: utf-8 -*-
from sqlalchemy import String, Integer, Float, ForeignKey, DateTime, Boolean, Text, Date
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func
from src.database import Base
from datetime import datetime, date


class Usuario(Base):
    __tablename__ = "usuarios"
    # Correção: Usando Integer do SQLAlchemy, não int do Python
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    username: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    senha: Mapped[str] = mapped_column(String(255), nullable=False)


class Aluno(Base):
    __tablename__ = "alunos"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    nome: Mapped[str] = mapped_column(String(100), nullable=False)

    idade: Mapped[int] = mapped_column(Integer, nullable=True)
    objetivo: Mapped[str] = mapped_column(String, nullable=True)
    restricoes: Mapped[str] = mapped_column(Text, nullable=True)
    # Plano Semanal (quantas vezes por semana)
    frequencia_semanal_plano: Mapped[int] = mapped_column(Integer, default=3)

    # Valor Mensal (Dinheiro)
    valor_mensalidade: Mapped[float] = mapped_column(Float, default=0.0)

    # Dia do Pagamento
    dia_pagamento: Mapped[int] = mapped_column(Integer, default=5)

    data_ultimo_pagamento: Mapped[date] = mapped_column(Date, nullable=True)
    ativo: Mapped[bool] = mapped_column(Boolean, default=True)

    # Relacionamentos
    avaliacoes = relationship("AvaliacaoFisica", back_populates="aluno", cascade="all, delete-orphan")
    aulas = relationship("Aula", back_populates="aluno", cascade="all, delete-orphan")
    pagamentos = relationship("Pagamento", back_populates="aluno", cascade="all, delete-orphan")


class Aula(Base):
    __tablename__ = "aulas"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    aluno_id: Mapped[int] = mapped_column(ForeignKey("alunos.id"), nullable=False)
    data_hora: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    observacao: Mapped[str] = mapped_column(Text, nullable=True)
    realizada: Mapped[bool] = mapped_column(Boolean, default=False)
    tem_reposicao: Mapped[bool] = mapped_column(Boolean, default=False)
    aluno = relationship("Aluno", back_populates="aulas")


class Pagamento(Base):
    __tablename__ = "pagamentos"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    aluno_id: Mapped[int] = mapped_column(ForeignKey("alunos.id"), nullable=False)

    valor: Mapped[float] = mapped_column(Float, nullable=False)
    data_pagamento: Mapped[date] = mapped_column(Date, server_default=func.current_date())
    referencia_mes: Mapped[str] = mapped_column(String(20))

    aluno = relationship("Aluno", back_populates="pagamentos")


class AvaliacaoFisica(Base):
    __tablename__ = "avaliacoes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    aluno_id: Mapped[int] = mapped_column(ForeignKey("alunos.id"), nullable=False)
    data_avaliacao: Mapped[date] = mapped_column(nullable=False, default=date.today)

    peso: Mapped[float] = mapped_column(Float, nullable=True)
    gordura: Mapped[float] = mapped_column(Float, nullable=True)  # Percentual
    musculo: Mapped[float] = mapped_column(Float, nullable=True)  # Percentual ou KG
    obs: Mapped[str] = mapped_column(String(200), nullable=True)

    aluno = relationship("Aluno", back_populates="avaliacoes")
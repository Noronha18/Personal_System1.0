"""initial_full_schema

Revision ID: d72ea2a83e57
Revises: 
Create Date: 2026-05-03 22:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = 'd72ea2a83e57'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Alunos
    op.create_table('alunos',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('nome', sa.String(), nullable=True),
        sa.Column('cpf', sa.String(), nullable=True),
        sa.Column('data_inicio', sa.Date(), nullable=True),
        sa.Column('dia_vencimento', sa.Integer(), nullable=True),
        sa.Column('tipo_pagamento', sa.String(), nullable=True),
        sa.Column('saldo_aulas', sa.Integer(), nullable=True),
        sa.Column('frequencia_semanal', sa.Integer(), nullable=True),
        sa.Column('valor_mensalidade', sa.Float(), nullable=True),
        sa.Column('idade', sa.Integer(), nullable=True),
        sa.Column('objetivo', sa.Text(), nullable=True),
        sa.Column('restricoes', sa.Text(), nullable=True),
        sa.Column('status', sa.String(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_alunos_id'), 'alunos', ['id'], unique=False)
    op.create_index(op.f('ix_alunos_cpf'), 'alunos', ['cpf'], unique=True)

    # 2. Usuarios
    op.create_table('usuarios',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('username', sa.String(), nullable=False),
        sa.Column('email', sa.String(), nullable=False),
        sa.Column('hashed_password', sa.String(), nullable=False),
        sa.Column('role', sa.String(), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=True),
        sa.Column('data_criacao', sa.DateTime(), nullable=True),
        sa.Column('aluno_id', sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(['aluno_id'], ['alunos.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_usuarios_id'), 'usuarios', ['id'], unique=False)
    op.create_index(op.f('ix_usuarios_username'), 'usuarios', ['username'], unique=True)
    op.create_index(op.f('ix_usuarios_email'), 'usuarios', ['email'], unique=True)

    # 3. Planos Treino
    op.create_table('planos_treino',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('aluno_id', sa.Integer(), nullable=True),
        sa.Column('titulo', sa.String(), nullable=True),
        sa.Column('objetivo_estrategico', sa.Text(), nullable=True),
        sa.Column('detalhes', sa.Text(), nullable=True),
        sa.Column('duracao_semanas', sa.Integer(), nullable=True),
        sa.Column('data_inicio', sa.Date(), nullable=True),
        sa.Column('esta_ativo', sa.Boolean(), nullable=True),
        sa.ForeignKeyConstraint(['aluno_id'], ['alunos.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_planos_treino_id'), 'planos_treino', ['id'], unique=False)
    op.create_index(op.f('ix_planos_treino_titulo'), 'planos_treino', ['titulo'], unique=False)

    # 4. Treinos
    op.create_table('treinos',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('plano_id', sa.Integer(), nullable=True),
        sa.Column('nome', sa.String(), nullable=True),
        sa.Column('ordem', sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(['plano_id'], ['planos_treino.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )

    # 5. Exercicios (Biblioteca Global)
    op.create_table('exercicios',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('nome', sa.String(), nullable=True),
        sa.Column('grupo_muscular', sa.String(), nullable=True),
        sa.Column('video_url', sa.String(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_exercicios_nome'), 'exercicios', ['nome'], unique=True)
    op.create_index(op.f('ix_exercicios_grupo_muscular'), 'exercicios', ['grupo_muscular'], unique=False)

    # 6. Prescricoes (Linhagem Treino <-> Exercicio)
    op.create_table('prescricoes',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('treino_id', sa.Integer(), nullable=True),
        sa.Column('exercicio_id', sa.Integer(), nullable=True),
        sa.Column('series', sa.Integer(), nullable=True),
        sa.Column('repeticoes', sa.String(), nullable=True),
        sa.Column('descanso', sa.Integer(), nullable=True),
        sa.Column('carga', sa.String(), nullable=True),
        sa.Column('observacoes', sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(['exercicio_id'], ['exercicios.id']),
        sa.ForeignKeyConstraint(['treino_id'], ['treinos.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )

    # 7. Pagamentos
    op.create_table('pagamentos',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('aluno_id', sa.Integer(), nullable=True),
        sa.Column('data_pagamento', sa.Date(), nullable=True),
        sa.Column('valor', sa.Float(), nullable=True),
        sa.Column('quantidade_aulas', sa.Integer(), nullable=True),
        sa.Column('referencia_mes', sa.String(length=7), nullable=True),
        sa.Column('forma_pagamento', sa.String(length=50), nullable=True),
        sa.Column('observacao', sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(['aluno_id'], ['alunos.id']),
        sa.PrimaryKeyConstraint('id')
    )

    # 8. Sessoes de Treino (Histórico)
    op.create_table('sessoes_treino',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('aluno_id', sa.Integer(), nullable=True),
        sa.Column('plano_treino_id', sa.Integer(), nullable=True),
        sa.Column('data_hora', sa.DateTime(), nullable=True),
        sa.Column('realizada', sa.Boolean(), nullable=True),
        sa.Column('precisa_reposicao', sa.Boolean(), nullable=True),
        sa.Column('observacoes_performance', sa.Text(), nullable=True),
        sa.Column('motivo_ausencia', sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(['aluno_id'], ['alunos.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['plano_treino_id'], ['planos_treino.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id')
    )


def downgrade() -> None:
    op.drop_table('sessoes_treino')
    op.drop_table('pagamentos')
    op.drop_table('prescricoes')
    op.drop_table('exercicios')
    op.drop_table('treinos')
    op.drop_table('planos_treino')
    op.drop_table('usuarios')
    op.drop_table('alunos')

"""add email to aluno

Revision ID: a5e3f4b2c1d0
Revises: d72ea2a83e57
Create Date: 2026-05-04 10:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = 'a5e3f4b2c1d0'
down_revision: Union[str, Sequence[str], None] = 'd72ea2a83e57'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Adiciona a coluna email na tabela alunos
    op.add_column('alunos', sa.Column('email', sa.String(), nullable=True))
    op.create_index(op.f('ix_alunos_email'), 'alunos', ['email'], unique=True)


def downgrade() -> None:
    op.drop_index(op.f('ix_alunos_email'), table_name='alunos')
    op.drop_column('alunos', 'email')

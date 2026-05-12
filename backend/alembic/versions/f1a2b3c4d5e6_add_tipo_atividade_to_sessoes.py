"""add tipo_atividade to sessoes_treino

Revision ID: f1a2b3c4d5e6
Revises: c3f8b2a1d5e6
Create Date: 2026-05-12 00:00:00.000000
"""
from typing import Sequence, Union
import sqlalchemy as sa
from alembic import op

revision: str = 'f1a2b3c4d5e6'
down_revision: Union[str, None] = 'c3f8b2a1d5e6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        'sessoes_treino',
        sa.Column('tipo_atividade', sa.String(), nullable=True)
    )


def downgrade() -> None:
    op.drop_column('sessoes_treino', 'tipo_atividade')

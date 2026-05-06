"""add metodo to prescricao

Revision ID: e8c2d9b5a1f1
Revises: a5e3f4b2c1d0
Create Date: 2026-05-06 12:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = 'e8c2d9b5a1f1'
down_revision: Union[str, Sequence[str], None] = 'a5e3f4b2c1d0'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('prescricoes', sa.Column('metodo', sa.String(), nullable=True, server_default='Convencional'))


def downgrade() -> None:
    op.drop_column('prescricoes', 'metodo')

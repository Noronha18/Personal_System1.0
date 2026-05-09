"""add trainer_id to alunos

Revision ID: c3f8b2a1d5e6
Revises: e8c2d9b5a1f1
Create Date: 2026-05-09 00:00:00.000000

Backfill: todos os alunos sem trainer_id são atribuídos ao primeiro
usuário ativo com role 'admin' ou 'trainer' encontrado (ORDER BY id ASC).
Em instalações com apenas um personal trainer, isso é correto.
Em instalações multi-trainer pré-existentes, execute um SQL ad-hoc de
atribuição manual ANTES de rodar esta migration em produção.

Após rodar, promova o admin antigo (role='trainer') para role='admin':
    UPDATE usuarios SET role='admin' WHERE username='admin';
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = 'c3f8b2a1d5e6'
down_revision: Union[str, Sequence[str], None] = 'e8c2d9b5a1f1'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    conn = op.get_bind()

    result = conn.execute(
        sa.text("SELECT id FROM usuarios WHERE role IN ('admin', 'trainer') AND is_active = true ORDER BY id ASC LIMIT 1")
    )
    default_trainer_id = result.scalar()

    if default_trainer_id is None:
        raise Exception(
            "Migration abortada: nenhum usuário trainer/admin ativo encontrado. "
            "Execute 'python -m src.create_admin' antes desta migration."
        )

    op.add_column('alunos', sa.Column('trainer_id', sa.Integer(), nullable=True))

    conn.execute(
        sa.text(f"UPDATE alunos SET trainer_id = {default_trainer_id} WHERE trainer_id IS NULL")
    )

    op.create_foreign_key(
        'fk_alunos_trainer_id_usuarios',
        'alunos', 'usuarios',
        ['trainer_id'], ['id'],
        ondelete='RESTRICT'
    )
    op.create_index('ix_alunos_trainer_id', 'alunos', ['trainer_id'])


def downgrade() -> None:
    op.drop_index('ix_alunos_trainer_id', table_name='alunos')
    op.drop_constraint('fk_alunos_trainer_id_usuarios', 'alunos', type_='foreignkey')
    op.drop_column('alunos', 'trainer_id')

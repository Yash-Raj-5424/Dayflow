"""create employee_profiles table

Revision ID: 486191ab23ba
Revises: 7e88e8fe13de
Create Date: 2026-08-22 09:30:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = '486191ab23ba'
down_revision: Union[str, None] = '7e88e8fe13de'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table('employee_profiles',
    sa.Column('id', sa.UUID(), nullable=False),
    sa.Column('user_id', sa.UUID(), nullable=False),
    sa.Column('first_name', sa.String(length=100), nullable=False),
    sa.Column('last_name', sa.String(length=100), nullable=False),
    sa.Column('phone', sa.String(length=20), nullable=True),
    sa.Column('address', sa.String(length=255), nullable=True),
    sa.Column('profile_picture', sa.String(length=500), nullable=True),
    sa.Column('job_title', sa.String(length=100), nullable=True),
    sa.Column('department', sa.String(length=100), nullable=True),
    sa.Column('joining_date', sa.Date(), nullable=True),
    sa.Column('documents', sa.JSON(), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
    sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_employee_profiles_user_id'), 'employee_profiles', ['user_id'], unique=True)


def downgrade() -> None:
    op.drop_index(op.f('ix_employee_profiles_user_id'), table_name='employee_profiles')
    op.drop_table('employee_profiles')
"""merge employee and attendance/leave heads

Revision ID: e29c129ef587
Revises: 486191ab23ba, c4d5e6f7a8b9
Create Date: 2026-08-22 15:41:56.787638

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'e29c129ef587'
down_revision: Union[str, None] = ('486191ab23ba', 'c4d5e6f7a8b9')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass

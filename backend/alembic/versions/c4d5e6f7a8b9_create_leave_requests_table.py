"""create leave requests table

Revision ID: c4d5e6f7a8b9
Revises: b3c4d5e6f7a8
Create Date: 2026-08-22

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = "c4d5e6f7a8b9"
down_revision: Union[str, None] = "b3c4d5e6f7a8"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    leave_type = postgresql.ENUM(
        "PAID", "SICK", "UNPAID", name="leave_type", create_type=False
    )
    leave_status = postgresql.ENUM(
        "PENDING", "APPROVED", "REJECTED", name="leave_status", create_type=False
    )
    leave_type.create(op.get_bind(), checkfirst=True)
    leave_status.create(op.get_bind(), checkfirst=True)

    op.create_table(
        "leave_requests",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("employee_id", sa.UUID(), nullable=False),
        sa.Column("leave_type", leave_type, nullable=False),
        sa.Column("start_date", sa.Date(), nullable=False),
        sa.Column("end_date", sa.Date(), nullable=False),
        sa.Column("remarks", sa.String(length=1000), nullable=True),
        sa.Column("status", leave_status, nullable=False),
        sa.Column("admin_comment", sa.String(length=1000), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["employee_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        op.f("ix_leave_requests_employee_id"),
        "leave_requests",
        ["employee_id"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index(op.f("ix_leave_requests_employee_id"), table_name="leave_requests")
    op.drop_table("leave_requests")
    sa.Enum(name="leave_status").drop(op.get_bind(), checkfirst=True)
    sa.Enum(name="leave_type").drop(op.get_bind(), checkfirst=True)
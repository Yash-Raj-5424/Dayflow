"""create attendance table

Revision ID: b3c4d5e6f7a8
Revises: 7e88e8fe13de
Create Date: 2026-08-22

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = "b3c4d5e6f7a8"
down_revision: Union[str, None] = "7e88e8fe13de"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    attendance_status = postgresql.ENUM(
        "PRESENT",
        "ABSENT",
        "HALF_DAY",
        "LEAVE",
        name="attendance_status",
        create_type=False,
    )
    attendance_status.create(op.get_bind(), checkfirst=True)

    op.create_table(
        "attendance",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("employee_id", sa.UUID(), nullable=False),
        sa.Column("date", sa.Date(), nullable=False),
        sa.Column("check_in", sa.DateTime(timezone=True), nullable=True),
        sa.Column("check_out", sa.DateTime(timezone=True), nullable=True),
        sa.Column("status", attendance_status, nullable=False),
        sa.ForeignKeyConstraint(["employee_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint(
            "employee_id", "date", name="uq_attendance_employee_date"
        ),
    )
    op.create_index(
        op.f("ix_attendance_employee_id"), "attendance", ["employee_id"], unique=False
    )
    op.create_index(op.f("ix_attendance_date"), "attendance", ["date"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_attendance_date"), table_name="attendance")
    op.drop_index(op.f("ix_attendance_employee_id"), table_name="attendance")
    op.drop_table("attendance")
    sa.Enum(name="attendance_status").drop(op.get_bind(), checkfirst=True)
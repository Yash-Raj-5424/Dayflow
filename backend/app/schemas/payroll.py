import uuid
from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field, model_validator


class PayrollUpdate(BaseModel):
    basic_salary: Decimal = Field(ge=0, max_digits=12, decimal_places=2)
    allowances: Decimal = Field(default=Decimal("0"), ge=0, max_digits=12, decimal_places=2)
    deductions: Decimal = Field(default=Decimal("0"), ge=0, max_digits=12, decimal_places=2)
    effective_date: date

    @model_validator(mode="after")
    def validate_deductions(self):
        if self.deductions > self.basic_salary + self.allowances:
            raise ValueError("deductions cannot exceed basic_salary + allowances")
        return self


class PayrollOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    employee_id: uuid.UUID
    basic_salary: Decimal
    allowances: Decimal
    deductions: Decimal
    net_salary: Decimal
    effective_date: date
    updated_at: datetime

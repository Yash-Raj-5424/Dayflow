import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Modal } from "../../../components/ui/Modal";
import { Button } from "../../../components/ui/Button";
import type { Employee } from "../types";

interface DeleteEmployeeModalProps {
  employee: Employee | null;
  onClose: () => void;
  onConfirm: (employee: Employee) => Promise<void>;
}

export function DeleteEmployeeModal({ employee, onClose, onConfirm }: DeleteEmployeeModalProps) {
  const [deleting, setDeleting] = useState(false);

  async function handleConfirm() {
    if (!employee) return;
    setDeleting(true);
    try {
      await onConfirm(employee);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <Modal open={!!employee} onClose={deleting ? () => {} : onClose} title="Delete employee?">
      <div className="flex gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-danger-subtle text-danger">
          <AlertTriangle className="h-4.5 w-4.5" />
        </div>
        <p className="text-sm text-muted">
          You're about to permanently remove{" "}
          <span className="font-medium text-ink">
            {employee?.firstName} {employee?.lastName}
          </span>{" "}
          from the employee directory. This cannot be undone.
        </p>
      </div>
      <div className="mt-6 flex justify-end gap-3">
        <Button type="button" variant="secondary" onClick={onClose} disabled={deleting}>
          Cancel
        </Button>
        <Button type="button" variant="danger" isLoading={deleting} onClick={handleConfirm}>
          Delete Employee
        </Button>
      </div>
    </Modal>
  );
}

import { MOCK_EMPLOYEES } from "./mockData";
import type { Employee, EmployeeFormValues, EmployeeListParams, EmployeeListResult } from "./types";

// In-memory store standing in for a real backend. Structured so every
// function here can be swapped for an axios call against a real API
// without changing any call site.
const store: Employee[] = [...MOCK_EMPLOYEES];
let nextSequence = store.length + 1;

const LATENCY = 380;

function delay<T>(value: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), LATENCY));
}

export class NotFoundError extends Error {}
export class DuplicateEmployeeCodeError extends Error {}

export async function listEmployees(params: EmployeeListParams = {}): Promise<EmployeeListResult> {
  const { search = "", department = "all", status = "all", sort = "name_asc", page = 1, pageSize = 10 } = params;

  let items = [...store];

  if (search.trim()) {
    const q = search.trim().toLowerCase();
    items = items.filter(
      (e) =>
        `${e.firstName} ${e.lastName}`.toLowerCase().includes(q) ||
        e.email.toLowerCase().includes(q) ||
        e.employeeCode.toLowerCase().includes(q) ||
        e.designation.toLowerCase().includes(q),
    );
  }
  if (department !== "all") {
    items = items.filter((e) => e.department === department);
  }
  if (status !== "all") {
    items = items.filter((e) => e.status === status);
  }

  items.sort((a, b) => {
    switch (sort) {
      case "name_desc":
        return `${b.firstName} ${b.lastName}`.localeCompare(`${a.firstName} ${a.lastName}`);
      case "joining_desc":
        return b.joiningDate.localeCompare(a.joiningDate);
      case "joining_asc":
        return a.joiningDate.localeCompare(b.joiningDate);
      default:
        return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
    }
  });

  const total = items.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const clampedPage = Math.min(Math.max(1, page), pageCount);
  const start = (clampedPage - 1) * pageSize;
  const pageItems = items.slice(start, start + pageSize);

  return delay({ items: pageItems, total, page: clampedPage, pageSize, pageCount });
}

export async function getEmployee(id: string): Promise<Employee> {
  const employee = store.find((e) => e.id === id);
  if (!employee) throw new NotFoundError(`Employee ${id} not found`);
  return delay(employee);
}

export async function createEmployee(values: EmployeeFormValues): Promise<Employee> {
  if (store.some((e) => e.employeeCode.toLowerCase() === values.employeeCode.toLowerCase())) {
    throw new DuplicateEmployeeCodeError(`Employee ID "${values.employeeCode}" is already in use.`);
  }
  const now = new Date().toISOString();
  const employee: Employee = {
    id: `emp-new-${nextSequence++}`,
    employeeCode: values.employeeCode,
    firstName: values.firstName,
    lastName: values.lastName,
    email: values.email,
    phone: values.phone,
    dateOfBirth: values.dateOfBirth,
    gender: values.gender,
    department: values.department || "Engineering",
    designation: values.designation,
    joiningDate: values.joiningDate,
    employmentType: values.employmentType,
    managerId: values.managerId,
    status: values.status,
    address: values.address,
    city: values.city,
    state: values.state,
    postalCode: values.postalCode,
    emergencyContact: values.emergencyContact,
    createdAt: now,
    updatedAt: now,
    activity: [{ id: `${values.employeeCode}-a1`, text: "Employee profile created", timestamp: now }],
  };
  store.unshift(employee);
  return delay(employee);
}

export async function updateEmployee(id: string, values: EmployeeFormValues): Promise<Employee> {
  const index = store.findIndex((e) => e.id === id);
  if (index === -1) throw new NotFoundError(`Employee ${id} not found`);

  const duplicate = store.some((e) => e.id !== id && e.employeeCode.toLowerCase() === values.employeeCode.toLowerCase());
  if (duplicate) {
    throw new DuplicateEmployeeCodeError(`Employee ID "${values.employeeCode}" is already in use.`);
  }

  const existing = store[index];
  const now = new Date().toISOString();
  const changes: string[] = [];
  if (existing.department !== values.department) changes.push(`Department updated to ${values.department}`);
  if (existing.designation !== values.designation) changes.push(`Designation changed to ${values.designation}`);
  if (existing.status !== values.status) changes.push(`Status changed to ${values.status.replace("_", " ")}`);

  const updated: Employee = {
    ...existing,
    ...values,
    department: values.department || existing.department,
    updatedAt: now,
    activity: [
      ...changes.map((text, i) => ({ id: `${id}-u${Date.now()}-${i}`, text, timestamp: now })),
      ...existing.activity,
    ],
  };
  store[index] = updated;
  return delay(updated);
}

export async function deleteEmployee(id: string): Promise<void> {
  const index = store.findIndex((e) => e.id === id);
  if (index === -1) throw new NotFoundError(`Employee ${id} not found`);
  store.splice(index, 1);
  return delay(undefined);
}

export interface EmployeeStats {
  total: number;
  active: number;
  onLeave: number;
  newThisMonth: number;
}

export async function getEmployeeStats(): Promise<EmployeeStats> {
  const now = new Date();
  const active = store.filter((e) => e.status === "active").length;
  const onLeave = store.filter((e) => e.status === "on_leave").length;
  const newThisMonth = store.filter((e) => {
    const d = new Date(e.joiningDate);
    return d.getUTCFullYear() === now.getFullYear() && d.getUTCMonth() === now.getMonth();
  }).length;
  return delay({ total: store.length, active, onLeave, newThisMonth });
}

export interface DepartmentCount {
  department: string;
  count: number;
}

export async function getDepartmentDistribution(): Promise<DepartmentCount[]> {
  const counts = new Map<string, number>();
  for (const e of store) counts.set(e.department, (counts.get(e.department) ?? 0) + 1);
  const result = Array.from(counts.entries())
    .map(([department, count]) => ({ department, count }))
    .sort((a, b) => b.count - a.count);
  return delay(result);
}

export async function getRecentlyAdded(limit = 5): Promise<Employee[]> {
  const sorted = [...store].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return delay(sorted.slice(0, limit));
}

export async function getRecentActivity(limit = 6): Promise<{ employee: Employee; text: string; timestamp: string }[]> {
  const entries = store.flatMap((employee) => employee.activity.map((a) => ({ employee, text: a.text, timestamp: a.timestamp })));
  entries.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  return delay(entries.slice(0, limit));
}

export async function listManagers(): Promise<Employee[]> {
  return delay(store.filter((e) => e.status !== "inactive"));
}

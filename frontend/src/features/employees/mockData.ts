import type { Department, Employee, EmploymentType, Gender } from "./types";

// Deterministic PRNG so the demo dataset is stable across reloads.
function mulberry32(seed: number) {
  return function random() {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(2026);
const pick = <T>(arr: readonly T[]) => arr[Math.floor(rand() * arr.length)];

const DEPARTMENT_DESIGNATIONS: Record<Department, string[]> = {
  Engineering: ["Software Engineer", "Backend Developer", "Frontend Developer", "DevOps Engineer", "QA Engineer", "Engineering Manager"],
  Product: ["Product Manager", "Associate Product Manager", "Product Designer", "Product Analyst"],
  Design: ["UI/UX Designer", "Visual Designer", "Design Lead"],
  "Human Resources": ["HR Executive", "HR Manager", "Talent Acquisition Specialist", "People Operations Lead"],
  Finance: ["Financial Analyst", "Accounts Executive", "Finance Manager"],
  Sales: ["Sales Executive", "Account Manager", "Sales Manager", "Business Development Executive"],
};

// Weighted so Engineering is the largest department, matching a typical product org.
const DEPARTMENTS_WEIGHTED: Department[] = [
  "Engineering", "Engineering", "Engineering", "Engineering",
  "Product", "Product",
  "Design", "Design",
  "Human Resources", "Human Resources",
  "Finance",
  "Sales", "Sales", "Sales",
];

const FIRST_NAMES = [
  "Rahul", "Priya", "Arjun", "Sneha", "Aditya", "Kavya", "Vikram", "Ananya", "Rohan", "Ishita",
  "Karan", "Meera", "Siddharth", "Divya", "Nikhil", "Pooja", "Varun", "Neha", "Manish", "Ritika",
  "Amit", "Sanya", "Gaurav", "Tanvi", "Rajesh", "Shreya", "Abhishek", "Kritika", "Sameer", "Anjali",
  "Yash", "Nisha", "Deepak", "Simran",
];
const LAST_NAMES = [
  "Kumar", "Sharma", "Mehta", "Rao", "Singh", "Reddy", "Iyer", "Nair", "Gupta", "Verma",
  "Kapoor", "Malhotra", "Joshi", "Chatterjee", "Bose", "Desai", "Pillai", "Agarwal", "Menon", "Bhatt",
];
const CITIES: { city: string; state: string }[] = [
  { city: "Bengaluru", state: "Karnataka" },
  { city: "Pune", state: "Maharashtra" },
  { city: "Hyderabad", state: "Telangana" },
  { city: "Gurugram", state: "Haryana" },
  { city: "Chennai", state: "Tamil Nadu" },
  { city: "Mumbai", state: "Maharashtra" },
];
const EMPLOYMENT_TYPE_WEIGHTS: EmploymentType[] = [
  "full_time", "full_time", "full_time", "full_time", "full_time", "full_time", "full_time",
  "part_time", "contract", "intern",
];
const GENDERS: Gender[] = ["male", "female", "other"];

function isoDate(year: number, month: number, day: number): string {
  return new Date(Date.UTC(year, month - 1, day)).toISOString().slice(0, 10);
}

function pad(n: number, width = 3): string {
  return String(n).padStart(width, "0");
}

interface Seed {
  firstName: string;
  lastName: string;
  department: Department;
  designation: string;
  joiningDate: string;
  status: Employee["status"];
  isManager?: boolean;
}

// The five people named explicitly in the product brief, plus a few pinned
// "recently added" employees so that section reads naturally.
const PINNED: Seed[] = [
  { firstName: "Rahul", lastName: "Kumar", department: "Engineering", designation: "Backend Developer", joiningDate: isoDate(2023, 6, 12), status: "active" },
  { firstName: "Priya", lastName: "Sharma", department: "Human Resources", designation: "HR Executive", joiningDate: isoDate(2022, 3, 4), status: "active" },
  { firstName: "Arjun", lastName: "Mehta", department: "Product", designation: "Product Designer", joiningDate: isoDate(2024, 1, 15), status: "active" },
  { firstName: "Sneha", lastName: "Rao", department: "Engineering", designation: "Software Engineer", joiningDate: isoDate(2023, 11, 2), status: "on_leave" },
  { firstName: "Aditya", lastName: "Singh", department: "Sales", designation: "Sales Executive", joiningDate: isoDate(2024, 5, 20), status: "active" },
  { firstName: "Kavya", lastName: "Reddy", department: "Engineering", designation: "Engineering Manager", joiningDate: isoDate(2021, 2, 8), status: "active", isManager: true },
  { firstName: "Vikram", lastName: "Iyer", department: "Product", designation: "Product Manager", joiningDate: isoDate(2021, 9, 14), status: "active", isManager: true },
  { firstName: "Meera", lastName: "Nair", department: "Design", designation: "Design Lead", joiningDate: isoDate(2022, 7, 1), status: "active", isManager: true },
  { firstName: "Rajesh", lastName: "Gupta", department: "Finance", designation: "Finance Manager", joiningDate: isoDate(2021, 4, 19), status: "active", isManager: true },
  { firstName: "Anjali", lastName: "Verma", department: "Sales", designation: "Sales Manager", joiningDate: isoDate(2022, 1, 10), status: "active", isManager: true },
  // Recently added — joined within the current month for a live "New This Month" metric.
  { firstName: "Yash", lastName: "Malhotra", department: "Engineering", designation: "Frontend Developer", joiningDate: isoDate(2026, 8, 18), status: "active" },
  { firstName: "Nisha", lastName: "Joshi", department: "Design", designation: "UI/UX Designer", joiningDate: isoDate(2026, 8, 12), status: "active" },
  { firstName: "Deepak", lastName: "Chatterjee", department: "Finance", designation: "Accounts Executive", joiningDate: isoDate(2026, 8, 6), status: "active" },
  { firstName: "Simran", lastName: "Bose", department: "Sales", designation: "Account Manager", joiningDate: isoDate(2026, 8, 3), status: "active" },
  { firstName: "Karan", lastName: "Desai", department: "Human Resources", designation: "Talent Acquisition Specialist", joiningDate: isoDate(2026, 8, 1), status: "inactive" },
];

const usedNames = new Set(PINNED.map((p) => `${p.firstName} ${p.lastName}`));

function generateFillerSeed(): Seed {
  let firstName: string;
  let lastName: string;
  do {
    firstName = pick(FIRST_NAMES);
    lastName = pick(LAST_NAMES);
  } while (usedNames.has(`${firstName} ${lastName}`));
  usedNames.add(`${firstName} ${lastName}`);

  const department = pick(DEPARTMENTS_WEIGHTED);
  const designation = pick(DEPARTMENT_DESIGNATIONS[department]);
  const year = 2021 + Math.floor(rand() * 5);
  const month = 1 + Math.floor(rand() * 12);
  const day = 1 + Math.floor(rand() * 27);
  const statusRoll = rand();
  const status: Employee["status"] = statusRoll > 0.93 ? "inactive" : statusRoll > 0.85 ? "on_leave" : "active";

  return {
    firstName,
    lastName,
    department,
    designation,
    joiningDate: isoDate(Math.min(year, 2026), month, day),
    status,
  };
}

function buildEmployee(seed: Seed, index: number, managerIds: string[]): Employee {
  const id = `emp-${pad(index + 1)}`;
  const email = `${seed.firstName.toLowerCase()}.${seed.lastName.toLowerCase()}@dayflow.dev`;
  const { city, state } = pick(CITIES);
  const employmentType = seed.isManager ? "full_time" : pick(EMPLOYMENT_TYPE_WEIGHTS);
  const gender = pick(GENDERS);
  const dobYear = 1985 + Math.floor(rand() * 15);
  const manager = seed.isManager || managerIds.length === 0 ? null : pick(managerIds);

  return {
    id,
    employeeCode: `EMP${pad(index + 1)}`,
    firstName: seed.firstName,
    lastName: seed.lastName,
    email,
    phone: `+91 9${Math.floor(100000000 + rand() * 899999999)}`,
    dateOfBirth: isoDate(dobYear, 1 + Math.floor(rand() * 12), 1 + Math.floor(rand() * 27)),
    gender,
    department: seed.department,
    designation: seed.designation,
    joiningDate: seed.joiningDate,
    employmentType,
    managerId: manager,
    status: seed.status,
    address: `${10 + Math.floor(rand() * 900)} ${pick(["MG Road", "Park Street", "Lake View Layout", "Whitefield Main Road", "Sector 21"])}`,
    city,
    state,
    postalCode: String(100000 + Math.floor(rand() * 899999)),
    emergencyContact: `+91 9${Math.floor(100000000 + rand() * 899999999)}`,
    createdAt: `${seed.joiningDate}T09:00:00.000Z`,
    updatedAt: `${seed.joiningDate}T09:00:00.000Z`,
    activity: [{ id: `${id}-a1`, text: "Employee profile created", timestamp: `${seed.joiningDate}T09:00:00.000Z` }],
  };
}

const FILLER_COUNT = 22;
const allSeeds: Seed[] = [...PINNED, ...Array.from({ length: FILLER_COUNT }, generateFillerSeed)];

const managerSeedIds = allSeeds
  .map((seed, i) => (seed.isManager ? `emp-${pad(i + 1)}` : null))
  .filter((v): v is string => v !== null);

export const MOCK_EMPLOYEES: Employee[] = allSeeds.map((seed, i) => buildEmployee(seed, i, managerSeedIds));

// A couple of extra activity entries for the pinned "showcase" employees so
// the Profile → Activity tab has more than one entry to demonstrate.
const extraActivity: Record<string, { text: string; timestamp: string }[]> = {
  "emp-1": [
    { text: "Designation changed to Backend Developer", timestamp: "2024-02-10T11:20:00.000Z" },
    { text: "Department updated to Engineering", timestamp: "2023-06-12T09:15:00.000Z" },
  ],
  "emp-2": [{ text: "Completed HR onboarding certification", timestamp: "2022-05-01T10:00:00.000Z" }],
  "emp-4": [{ text: "Marked as On Leave", timestamp: "2026-08-15T08:30:00.000Z" }],
};

for (const employee of MOCK_EMPLOYEES) {
  const extra = extraActivity[employee.id];
  if (extra) {
    employee.activity.push(...extra.map((e, i) => ({ id: `${employee.id}-x${i}`, ...e })));
    employee.activity.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  }
}

import "server-only";

import { Role } from "@prisma/client";
import { promises as fs } from "fs";
import path from "path";
import { IS_DEV } from "@/lib/env/isDev";
import {
  DataAdmin,
  DataCandidate,
  DataClient,
  DataResult,
  DevAccessProfile,
  PortalAssessmentCard
} from "@/lib/data/types";

const DEV_DATA_DIR = path.join(process.cwd(), "dev-data");

type CsvRow = Record<string, string>;

const DEFAULT_ADMINS = [
  {
    id: "adm01",
    name: "CTRL Admin",
    email: "admin@ctrl.dev",
    password: "DevSuite!123"
  }
];

const DEFAULT_CLIENTS = [
  {
    id: "met",
    name: "Metropolitan Police",
    email: "client.met@ctrl.dev",
    password: "DevSuite!123"
  },
  {
    id: "nhs",
    name: "NHS Trust",
    email: "client.nhs@ctrl.dev",
    password: "DevSuite!123"
  }
];

const DEFAULT_CANDIDATES = [
  {
    id: "cand01",
    name: "John Smith",
    email: "candidate.met@ctrl.dev",
    password: "DevSuite!123",
    clientId: "met",
    status: "PENDING"
  },
  {
    id: "cand02",
    name: "Amira Patel",
    email: "candidate.nhs@ctrl.dev",
    password: "DevSuite!123",
    clientId: "nhs",
    status: "COMPLETED"
  }
];

const DEFAULT_ASSESSMENTS: PortalAssessmentCard[] = [
  {
    id: "typing-speed",
    name: "Typing Speed Assessment (WPM Test)",
    category: "Communication",
    status: "Pending",
    assignedDate: "08 May 2026",
    deadline: "12 May 2026",
    deadlineCountdown: "Expires in 2 days",
    duration: "10 minutes",
    integrityRequirements: ["Single active browser session", "Clipboard paste blocked"],
    deviceEligibility: ["Desktop or laptop", "Minimum viewport width 1024px"],
    actionLabel: "Start Assessment",
    actionHref: "/portal/candidate/assessments/typing-speed",
    clientId: "met",
    candidateId: "cand01"
  },
  {
    id: "situational-judgement",
    name: "Situational Judgement Test",
    category: "Decision Making",
    status: "In Progress",
    assignedDate: "09 May 2026",
    deadline: "15 May 2026",
    deadlineCountdown: "Expires in 5 days",
    duration: "25 minutes",
    integrityRequirements: ["Focus monitoring enabled", "Session bound to verified device"],
    deviceEligibility: ["Desktop required", "Stable broadband connection"],
    actionLabel: "Resume",
    actionHref: "/portal/candidate/assessments/situational-judgement",
    clientId: "met",
    candidateId: "cand01"
  },
  {
    id: "incident-report",
    name: "Incident Report Writing",
    category: "Written Communication",
    status: "Completed",
    assignedDate: "27 Apr 2026",
    deadline: "03 May 2026",
    deadlineCountdown: "Completed",
    duration: "30 minutes",
    integrityRequirements: ["Server-side scoring only"],
    deviceEligibility: ["Desktop or laptop"],
    actionLabel: "View Result",
    clientId: "nhs",
    candidateId: "cand02"
  }
];

const DEFAULT_RESULTS: DataResult[] = [
  {
    id: "res01",
    assessmentId: "incident-report",
    candidateId: "cand02",
    score: 82,
    accuracy: 91,
    integrityScore: 94,
    status: "Reviewed"
  }
];

const FILES = {
  admins: "admins.csv",
  clients: "clients.csv",
  candidates: "candidates.csv",
  assessments: "assessments.csv",
  results: "results.csv"
} as const;

function parseCsv(content: string): CsvRow[] {
  const lines = content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  if (lines.length === 0) {
    return [];
  }
  const headers = lines[0]!.split(",").map((header) => header.trim());
  return lines.slice(1).map((line) => {
    const values = line.split(",").map((value) => value.trim());
    const row: CsvRow = {};
    headers.forEach((header, index) => {
      row[header] = values[index] ?? "";
    });
    return row;
  });
}

function stringifyCsv(headers: string[], rows: CsvRow[]): string {
  const lines = [headers.join(",")];
  for (const row of rows) {
    lines.push(headers.map((header) => row[header] ?? "").join(","));
  }
  return `${lines.join("\n")}\n`;
}

async function writeCsv(fileName: string, headers: string[], rows: CsvRow[]) {
  await fs.mkdir(DEV_DATA_DIR, { recursive: true });
  const filePath = path.join(DEV_DATA_DIR, fileName);
  await fs.writeFile(filePath, stringifyCsv(headers, rows), "utf8");
}

async function readCsv(fileName: string): Promise<CsvRow[]> {
  const filePath = path.join(DEV_DATA_DIR, fileName);
  const content = await fs.readFile(filePath, "utf8");
  return parseCsv(content);
}

async function fileExists(filePath: string) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

function assertDevMode() {
  if (!IS_DEV) {
    throw new Error("Development CSV store is unavailable outside development mode.");
  }
}

function assessmentToCsvRow(assessment: PortalAssessmentCard): CsvRow {
  return {
    id: assessment.id,
    name: assessment.name,
    category: assessment.category,
    status: assessment.status,
    assignedDate: assessment.assignedDate,
    deadline: assessment.deadline,
    deadlineCountdown: assessment.deadlineCountdown,
    duration: assessment.duration,
    integrityRequirements: assessment.integrityRequirements.join("|"),
    deviceEligibility: assessment.deviceEligibility.join("|"),
    actionLabel: assessment.actionLabel,
    actionHref: assessment.actionHref ?? "",
    clientId: assessment.clientId ?? "",
    candidateId: assessment.candidateId ?? ""
  };
}

function assessmentFromCsvRow(row: CsvRow): PortalAssessmentCard {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    status: (row.status || "Pending") as PortalAssessmentCard["status"],
    assignedDate: row.assignedDate || "",
    deadline: row.deadline || "",
    deadlineCountdown: row.deadlineCountdown || "",
    duration: row.duration || "",
    integrityRequirements: (row.integrityRequirements || "").split("|").filter(Boolean),
    deviceEligibility: (row.deviceEligibility || "").split("|").filter(Boolean),
    actionLabel: (row.actionLabel || "Unavailable") as PortalAssessmentCard["actionLabel"],
    actionHref: row.actionHref || undefined,
    clientId: row.clientId || undefined,
    candidateId: row.candidateId || undefined
  };
}

export async function resetDevData() {
  assertDevMode();
  await fs.mkdir(DEV_DATA_DIR, { recursive: true });

  await writeCsv(
    FILES.admins,
    ["id", "name", "email", "password"],
    DEFAULT_ADMINS.map((item) => ({ ...item }))
  );
  await writeCsv(
    FILES.clients,
    ["id", "name", "email", "password"],
    DEFAULT_CLIENTS.map((item) => ({ ...item }))
  );
  await writeCsv(
    FILES.candidates,
    ["id", "name", "email", "password", "clientId", "status"],
    DEFAULT_CANDIDATES.map((item) => ({ ...item }))
  );
  await writeCsv(
    FILES.assessments,
    [
      "id",
      "name",
      "category",
      "status",
      "assignedDate",
      "deadline",
      "deadlineCountdown",
      "duration",
      "integrityRequirements",
      "deviceEligibility",
      "actionLabel",
      "actionHref",
      "clientId",
      "candidateId"
    ],
    DEFAULT_ASSESSMENTS.map(assessmentToCsvRow)
  );
  await writeCsv(
    FILES.results,
    ["id", "assessmentId", "candidateId", "score", "accuracy", "integrityScore", "status"],
    DEFAULT_RESULTS.map((item) => ({
      ...item,
      score: String(item.score),
      accuracy: String(item.accuracy),
      integrityScore: String(item.integrityScore)
    }))
  );
}

async function ensureDevData() {
  assertDevMode();
  const checks = await Promise.all(
    Object.values(FILES).map(async (fileName) => {
      const filePath = path.join(DEV_DATA_DIR, fileName);
      return fileExists(filePath);
    })
  );
  if (checks.every(Boolean)) {
    return;
  }
  await resetDevData();
}

export async function getAdmins(): Promise<DataAdmin[]> {
  await ensureDevData();
  const rows = await readCsv(FILES.admins);
  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    email: row.email
  }));
}

export async function getClients(): Promise<DataClient[]> {
  await ensureDevData();
  const rows = await readCsv(FILES.clients);
  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    email: row.email
  }));
}

export async function getCandidates(): Promise<DataCandidate[]> {
  await ensureDevData();
  const rows = await readCsv(FILES.candidates);
  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    clientId: row.clientId,
    status: (row.status || "PENDING") as DataCandidate["status"]
  }));
}

export async function getAssessments(): Promise<PortalAssessmentCard[]> {
  await ensureDevData();
  const rows = await readCsv(FILES.assessments);
  return rows.map(assessmentFromCsvRow);
}

export async function getResults(): Promise<DataResult[]> {
  await ensureDevData();
  const rows = await readCsv(FILES.results);
  return rows.map((row) => ({
    id: row.id,
    assessmentId: row.assessmentId,
    candidateId: row.candidateId,
    score: Number(row.score || 0),
    accuracy: Number(row.accuracy || 0),
    integrityScore: Number(row.integrityScore || 0),
    status: (row.status || "Submitted") as DataResult["status"]
  }));
}

export async function getAssessmentById(assessmentId: string): Promise<PortalAssessmentCard | null> {
  const all = await getAssessments();
  return all.find((assessment) => assessment.id === assessmentId) ?? null;
}

export async function getAssessmentsForCandidateEmail(email: string): Promise<PortalAssessmentCard[]> {
  const [candidates, assessments] = await Promise.all([getCandidates(), getAssessments()]);
  const candidate = candidates.find((item) => item.email.toLowerCase() === email.toLowerCase());
  if (!candidate) {
    return [];
  }
  return assessments.filter((assessment) => assessment.candidateId === candidate.id);
}

export async function updateCandidate(candidateId: string, update: Partial<DataCandidate>): Promise<DataCandidate | null> {
  await ensureDevData();
  const rows = await readCsv(FILES.candidates);
  const index = rows.findIndex((row) => row.id === candidateId);
  if (index < 0) return null;

  const current = rows[index]!;
  rows[index] = {
    ...current,
    name: update.name ?? current.name,
    email: update.email ?? current.email,
    clientId: update.clientId ?? current.clientId,
    status: update.status ?? current.status
  };

  await writeCsv(FILES.candidates, ["id", "name", "email", "password", "clientId", "status"], rows);
  const updated = rows[index]!;
  return {
    id: updated.id,
    name: updated.name,
    email: updated.email,
    clientId: updated.clientId,
    status: (updated.status || "PENDING") as DataCandidate["status"]
  };
}

export async function updateAssessment(
  assessmentId: string,
  update: Partial<PortalAssessmentCard>
): Promise<PortalAssessmentCard | null> {
  await ensureDevData();
  const rows = await readCsv(FILES.assessments);
  const index = rows.findIndex((row) => row.id === assessmentId);
  if (index < 0) return null;

  const current = assessmentFromCsvRow(rows[index]!);
  const next: PortalAssessmentCard = {
    ...current,
    ...update
  };

  rows[index] = assessmentToCsvRow(next);
  await writeCsv(
    FILES.assessments,
    [
      "id",
      "name",
      "category",
      "status",
      "assignedDate",
      "deadline",
      "deadlineCountdown",
      "duration",
      "integrityRequirements",
      "deviceEligibility",
      "actionLabel",
      "actionHref",
      "clientId",
      "candidateId"
    ],
    rows
  );

  return next;
}

export async function getDevAccessProfiles(): Promise<DevAccessProfile[]> {
  await ensureDevData();
  const [admins, clients, candidates] = await Promise.all([
    readCsv(FILES.admins),
    readCsv(FILES.clients),
    readCsv(FILES.candidates)
  ]);

  const admin = admins[0];
  const client = clients[0];
  const candidate = candidates[0];

  const profiles: DevAccessProfile[] = [];
  if (admin) {
    profiles.push({
      id: admin.id,
      label: "admin",
      role: Role.SUPER_ADMIN,
      email: admin.email,
      password: admin.password,
      name: admin.name
    });
  }
  if (client) {
    profiles.push({
      id: client.id,
      label: "client",
      role: Role.CLIENT,
      email: client.email,
      password: client.password,
      name: client.name
    });
  }
  if (candidate) {
    profiles.push({
      id: candidate.id,
      label: "candidate",
      role: Role.CANDIDATE,
      email: candidate.email,
      password: candidate.password,
      name: candidate.name
    });
  }
  return profiles;
}

export async function authenticateDevCredentials(input: {
  email: string;
  password: string;
  role?: Role;
}): Promise<{ id: string; email: string; role: Role; name: string } | null> {
  assertDevMode();
  const profiles = await getDevAccessProfiles();
  const match = profiles.find(
    (profile) =>
      (!input.role || profile.role === input.role) &&
      profile.email.toLowerCase() === input.email.toLowerCase() &&
      profile.password === input.password
  );
  if (!match) {
    return null;
  }
  return {
    id: `dev-${match.label}-${match.id}`,
    email: match.email,
    role: match.role,
    name: match.name
  };
}

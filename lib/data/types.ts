import { Role } from "@prisma/client";

export type AssessmentStatus = "Completed" | "Pending" | "In Progress" | "Expired";

export type AssessmentActionLabel = "Start Assessment" | "Resume" | "View Result" | "Unavailable";

export type PortalAssessmentCard = {
  id: string;
  name: string;
  category: string;
  status: AssessmentStatus;
  assignedDate: string;
  deadline: string;
  deadlineCountdown: string;
  duration: string;
  integrityRequirements: string[];
  deviceEligibility: string[];
  actionLabel: AssessmentActionLabel;
  actionHref?: string;
  clientId?: string;
  candidateId?: string;
};

export type DataAdmin = {
  id: string;
  name: string;
  email: string;
};

export type DataClient = {
  id: string;
  name: string;
  email: string;
};

export type DataCandidate = {
  id: string;
  name: string;
  email: string;
  clientId: string;
  status: "PENDING" | "COMPLETED" | "REVIEWED" | "SHARED";
};

export type DataResult = {
  id: string;
  assessmentId: string;
  candidateId: string;
  score: number;
  accuracy: number;
  integrityScore: number;
  status: "Submitted" | "Reviewed" | "Flagged";
};

export type DevAccessProfile = {
  id: string;
  label: "admin" | "client" | "candidate";
  role: Role;
  email: string;
  password: string;
  name: string;
};


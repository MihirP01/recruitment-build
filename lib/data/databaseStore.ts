import "server-only";

import { CandidateStatus, Role } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { DataAdmin, DataCandidate, DataClient, DataResult, DevAccessProfile, PortalAssessmentCard } from "@/lib/data/types";

function toPortalStatus(status: CandidateStatus | null | undefined): PortalAssessmentCard["status"] {
  if (status === CandidateStatus.COMPLETED || status === CandidateStatus.REVIEWED || status === CandidateStatus.SHARED) {
    return "Completed";
  }
  return "Pending";
}

export async function getAdmins(): Promise<DataAdmin[]> {
  const users = await prisma.user.findMany({
    where: {
      role: Role.SUPER_ADMIN,
      deletedAt: null
    },
    select: {
      id: true,
      email: true
    },
    orderBy: {
      createdAt: "asc"
    }
  });

  return users.map((user) => ({
    id: user.id,
    name: user.email.split("@")[0] || "Admin",
    email: user.email
  }));
}

export async function getClients(): Promise<DataClient[]> {
  const users = await prisma.user.findMany({
    where: {
      role: Role.CLIENT,
      deletedAt: null
    },
    select: {
      id: true,
      email: true
    },
    orderBy: {
      createdAt: "asc"
    }
  });

  return users.map((user) => ({
    id: user.id,
    name: user.email.split("@")[0] || "Client",
    email: user.email
  }));
}

export async function getCandidates(): Promise<DataCandidate[]> {
  const candidates = await prisma.candidateProfile.findMany({
    where: {
      deletedAt: null
    },
    include: {
      user: {
        select: {
          email: true
        }
      }
    },
    orderBy: {
      createdAt: "asc"
    }
  });

  return candidates.map((candidate) => ({
    id: candidate.id,
    name: candidate.fullName,
    email: candidate.user.email,
    clientId: "default",
    status: candidate.status
  }));
}

export async function getAssessments(): Promise<PortalAssessmentCard[]> {
  const assessments = await prisma.candidateAssessment.findMany({
    include: {
      assessment: true,
      candidate: {
        include: {
          user: true
        }
      }
    },
    orderBy: {
      createdAt: "desc"
    }
  });

  return assessments.map((candidateAssessment) => ({
    id: candidateAssessment.assessment.id,
    name: candidateAssessment.assessment.title,
    category: "Assessment",
    status: candidateAssessment.completedAt ? "Completed" : toPortalStatus(candidateAssessment.candidate.status),
    assignedDate: candidateAssessment.createdAt.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    }),
    deadline: "Policy controlled",
    deadlineCountdown: candidateAssessment.completedAt ? "Completed" : "Pending completion",
    duration: "Policy controlled",
    integrityRequirements: ["Server-side secure assessment policy"],
    deviceEligibility: ["Desktop or laptop"],
    actionLabel: candidateAssessment.completedAt ? "View Result" : "Start Assessment",
    actionHref: candidateAssessment.completedAt
      ? undefined
      : `/portal/candidate/assessments/${candidateAssessment.assessment.id}`,
    candidateId: candidateAssessment.candidate.id
  }));
}

export async function getResults(): Promise<DataResult[]> {
  const assessments = await prisma.candidateAssessment.findMany({
    where: {
      completedAt: {
        not: null
      }
    },
    select: {
      id: true,
      candidateId: true,
      assessmentId: true,
      score: true
    },
    orderBy: {
      updatedAt: "desc"
    }
  });

  return assessments.map((entry) => ({
    id: entry.id,
    assessmentId: entry.assessmentId,
    candidateId: entry.candidateId,
    score: entry.score,
    accuracy: 0,
    integrityScore: 0,
    status: "Submitted"
  }));
}

export async function getAssessmentById(assessmentId: string): Promise<PortalAssessmentCard | null> {
  const all = await getAssessments();
  return all.find((assessment) => assessment.id === assessmentId) ?? null;
}

export async function getAssessmentsForCandidateEmail(email: string): Promise<PortalAssessmentCard[]> {
  const assessments = await prisma.candidateAssessment.findMany({
    where: {
      candidate: {
        user: {
          email
        }
      }
    },
    include: {
      assessment: true,
      candidate: true
    },
    orderBy: {
      createdAt: "desc"
    }
  });

  return assessments.map((candidateAssessment) => ({
    id: candidateAssessment.assessment.id,
    name: candidateAssessment.assessment.title,
    category: "Assessment",
    status: candidateAssessment.completedAt ? "Completed" : toPortalStatus(candidateAssessment.candidate.status),
    assignedDate: candidateAssessment.createdAt.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    }),
    deadline: "Policy controlled",
    deadlineCountdown: candidateAssessment.completedAt ? "Completed" : "Pending completion",
    duration: "Policy controlled",
    integrityRequirements: ["Server-side secure assessment policy"],
    deviceEligibility: ["Desktop or laptop"],
    actionLabel: candidateAssessment.completedAt ? "View Result" : "Start Assessment",
    actionHref: candidateAssessment.completedAt
      ? undefined
      : `/portal/candidate/assessments/${candidateAssessment.assessment.id}`,
    candidateId: candidateAssessment.candidateId
  }));
}

export async function updateCandidate(candidateId: string, update: Partial<DataCandidate>): Promise<DataCandidate | null> {
  const existing = await prisma.candidateProfile.findUnique({
    where: { id: candidateId },
    include: { user: true }
  });
  if (!existing) {
    return null;
  }

  await prisma.$transaction(async (tx) => {
    await tx.candidateProfile.update({
      where: { id: candidateId },
      data: {
        fullName: update.name ?? existing.fullName,
        status: update.status ?? existing.status
      }
    });

    if (update.email && update.email !== existing.user.email) {
      await tx.user.update({
        where: { id: existing.userId },
        data: {
          email: update.email
        }
      });
    }
  });

  return {
    id: existing.id,
    name: update.name ?? existing.fullName,
    email: update.email ?? existing.user.email,
    clientId: update.clientId ?? "default",
    status: (update.status ?? existing.status) as DataCandidate["status"]
  };
}

export async function updateAssessment(
  assessmentId: string,
  update: Partial<PortalAssessmentCard>
): Promise<PortalAssessmentCard | null> {
  const existing = await prisma.assessment.findUnique({
    where: { id: assessmentId }
  });

  if (!existing) {
    return null;
  }

  const nextTitle = update.name ?? existing.title;
  await prisma.assessment.update({
    where: { id: assessmentId },
    data: {
      title: nextTitle
    }
  });

  return {
    id: existing.id,
    name: nextTitle,
    category: update.category ?? "Assessment",
    status: update.status ?? "Pending",
    assignedDate: update.assignedDate ?? "",
    deadline: update.deadline ?? "",
    deadlineCountdown: update.deadlineCountdown ?? "",
    duration: update.duration ?? "",
    integrityRequirements: update.integrityRequirements ?? [],
    deviceEligibility: update.deviceEligibility ?? [],
    actionLabel: update.actionLabel ?? "Unavailable",
    actionHref: update.actionHref,
    candidateId: update.candidateId,
    clientId: update.clientId
  };
}

export async function resetDevData(): Promise<void> {
  throw new Error("Reset dev data is unavailable in database mode.");
}

export async function getDevAccessProfiles(): Promise<DevAccessProfile[]> {
  return [];
}

export async function authenticateDevCredentials(input: {
  email: string;
  password: string;
  role?: Role;
}): Promise<null> {
  void input;
  return null;
}

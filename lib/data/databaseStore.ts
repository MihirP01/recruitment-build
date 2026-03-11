import "server-only";

import { CandidateAssessment, CandidateStatus, Role } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { DataAdmin, DataCandidate, DataClient, DataResult, PortalAssessmentCard } from "@/lib/data/types";

type TenantCode = "met" | "nhs";

type AssessmentBlueprint = {
  category: string;
  duration: string;
  assignedOffsetDays: number;
  deadlineOffsetDays: number;
  pendingStatus?: Extract<PortalAssessmentCard["status"], "Pending" | "In Progress" | "Expired">;
  integrityRequirements: string[];
  deviceEligibility: string[];
};

const DEFAULT_BLUEPRINT: AssessmentBlueprint = {
  category: "Assessment",
  duration: "20 minutes",
  assignedOffsetDays: -2,
  deadlineOffsetDays: 7,
  pendingStatus: "Pending",
  integrityRequirements: ["Server-side secure assessment policy"],
  deviceEligibility: ["Desktop or laptop"]
};

const ASSESSMENT_BLUEPRINTS: Record<string, AssessmentBlueprint> = {
  "Typing Speed Assessment (WPM Test)": {
    category: "Communication",
    duration: "10 minutes",
    assignedOffsetDays: -2,
    deadlineOffsetDays: 2,
    pendingStatus: "Pending",
    integrityRequirements: ["Single active browser session", "Clipboard paste blocked"],
    deviceEligibility: ["Desktop or laptop", "Minimum viewport width 1024px"]
  },
  "Situational Judgement Test": {
    category: "Decision Making",
    duration: "25 minutes",
    assignedOffsetDays: -1,
    deadlineOffsetDays: 5,
    pendingStatus: "In Progress",
    integrityRequirements: ["Focus monitoring enabled", "Session bound to verified device"],
    deviceEligibility: ["Desktop required", "Stable broadband connection"]
  },
  "Incident Report Writing": {
    category: "Written Communication",
    duration: "30 minutes",
    assignedOffsetDays: -12,
    deadlineOffsetDays: -6,
    pendingStatus: "Pending",
    integrityRequirements: ["Server-side scoring only"],
    deviceEligibility: ["Desktop or laptop"]
  },
  "Public Order Briefing Response": {
    category: "Operational Communication",
    duration: "18 minutes",
    assignedOffsetDays: -1,
    deadlineOffsetDays: 10,
    pendingStatus: "Pending",
    integrityRequirements: ["Continuous secure session validation"],
    deviceEligibility: ["Desktop required", "No touch-only devices"]
  },
  "Legacy Ethics Scenario": {
    category: "Professional Standards",
    duration: "20 minutes",
    assignedOffsetDays: -28,
    deadlineOffsetDays: -23,
    pendingStatus: "Expired",
    integrityRequirements: ["Attempt window closed"],
    deviceEligibility: ["N/A"]
  }
};

type CandidateAssessmentWithRelations = CandidateAssessment & {
  assessment: {
    id: string;
    title: string;
  };
  candidate: {
    id: string;
    fullName: string;
    status: CandidateStatus;
    user: {
      email: string;
    };
  };
};

function tenantCodeFromEmail(email: string): TenantCode {
  return email.toLowerCase().includes("nhs") ? "nhs" : "met";
}

function tenantNameFromCode(code: TenantCode) {
  return code === "nhs" ? "NHS Trust" : "Metropolitan Police";
}

function blueprintForTitle(title: string): AssessmentBlueprint {
  return ASSESSMENT_BLUEPRINTS[title] ?? DEFAULT_BLUEPRINT;
}

function formatDateWithOffset(offsetDays: number): string {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}

function formatCountdown(offsetDays: number, completed: boolean): string {
  if (completed) {
    return "Completed";
  }

  if (offsetDays < 0) {
    const value = Math.abs(offsetDays);
    return `Expired ${value} day${value === 1 ? "" : "s"} ago`;
  }

  if (offsetDays === 0) {
    return "Expires today";
  }

  return `Expires in ${offsetDays} day${offsetDays === 1 ? "" : "s"}`;
}

function resolveStatus(
  candidateAssessment: Pick<CandidateAssessmentWithRelations, "completedAt">,
  blueprint: AssessmentBlueprint
): PortalAssessmentCard["status"] {
  if (candidateAssessment.completedAt) {
    return "Completed";
  }

  if (blueprint.pendingStatus === "Expired" || blueprint.deadlineOffsetDays < 0) {
    return "Expired";
  }

  return blueprint.pendingStatus ?? "Pending";
}

function actionLabelForStatus(status: PortalAssessmentCard["status"]): PortalAssessmentCard["actionLabel"] {
  if (status === "Completed") {
    return "View Result";
  }
  if (status === "In Progress") {
    return "Resume";
  }
  if (status === "Pending") {
    return "Start Assessment";
  }
  return "Unavailable";
}

function toPortalAssessmentCard(candidateAssessment: CandidateAssessmentWithRelations): PortalAssessmentCard {
  const blueprint = blueprintForTitle(candidateAssessment.assessment.title);
  const status = resolveStatus(candidateAssessment, blueprint);
  const actionLabel = actionLabelForStatus(status);
  const clientId = tenantCodeFromEmail(candidateAssessment.candidate.user.email);

  return {
    id: candidateAssessment.assessment.id,
    name: candidateAssessment.assessment.title,
    category: blueprint.category,
    status,
    assignedDate: formatDateWithOffset(blueprint.assignedOffsetDays),
    deadline: formatDateWithOffset(blueprint.deadlineOffsetDays),
    deadlineCountdown: formatCountdown(blueprint.deadlineOffsetDays, status === "Completed"),
    duration: blueprint.duration,
    integrityRequirements: blueprint.integrityRequirements,
    deviceEligibility: blueprint.deviceEligibility,
    actionLabel,
    actionHref:
      actionLabel === "Start Assessment" || actionLabel === "Resume"
        ? `/portal/candidate/assessments/${candidateAssessment.assessment.id}`
        : undefined,
    candidateId: candidateAssessment.candidate.id,
    clientId
  };
}

async function getCandidateAssessments(): Promise<CandidateAssessmentWithRelations[]> {
  return prisma.candidateAssessment.findMany({
    include: {
      assessment: {
        select: {
          id: true,
          title: true
        }
      },
      candidate: {
        select: {
          id: true,
          fullName: true,
          status: true,
          user: {
            select: {
              email: true
            }
          }
        }
      }
    },
    orderBy: {
      createdAt: "asc"
    }
  });
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
      email: true
    },
    orderBy: {
      createdAt: "asc"
    }
  });

  const uniqueClients = new Map<TenantCode, DataClient>();
  for (const user of users) {
    const tenantCode = tenantCodeFromEmail(user.email);
    if (!uniqueClients.has(tenantCode)) {
      uniqueClients.set(tenantCode, {
        id: tenantCode,
        name: tenantNameFromCode(tenantCode),
        email: user.email
      });
    }
  }

  return Array.from(uniqueClients.values());
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
    clientId: tenantCodeFromEmail(candidate.user.email),
    status: candidate.status
  }));
}

export async function getAssessments(): Promise<PortalAssessmentCard[]> {
  const assessments = await getCandidateAssessments();
  return assessments.map(toPortalAssessmentCard);
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
    accuracy: Math.min(100, Math.max(70, entry.score * 20)),
    integrityScore: 94,
    status: "Reviewed"
  }));
}

export async function getAssessmentById(assessmentId: string): Promise<PortalAssessmentCard | null> {
  const candidateAssessment = await prisma.candidateAssessment.findFirst({
    where: {
      assessmentId
    },
    include: {
      assessment: {
        select: {
          id: true,
          title: true
        }
      },
      candidate: {
        select: {
          id: true,
          fullName: true,
          status: true,
          user: {
            select: {
              email: true
            }
          }
        }
      }
    },
    orderBy: {
      createdAt: "asc"
    }
  });

  if (!candidateAssessment) {
    const assessment = await prisma.assessment.findUnique({
      where: { id: assessmentId },
      select: {
        id: true,
        title: true
      }
    });

    if (!assessment) {
      return null;
    }

    const blueprint = blueprintForTitle(assessment.title);
    const status = blueprint.pendingStatus === "Expired" ? "Expired" : blueprint.pendingStatus ?? "Pending";
    const actionLabel = actionLabelForStatus(status);

    return {
      id: assessment.id,
      name: assessment.title,
      category: blueprint.category,
      status,
      assignedDate: formatDateWithOffset(blueprint.assignedOffsetDays),
      deadline: formatDateWithOffset(blueprint.deadlineOffsetDays),
      deadlineCountdown: formatCountdown(blueprint.deadlineOffsetDays, false),
      duration: blueprint.duration,
      integrityRequirements: blueprint.integrityRequirements,
      deviceEligibility: blueprint.deviceEligibility,
      actionLabel,
      actionHref:
        actionLabel === "Start Assessment" || actionLabel === "Resume"
          ? `/portal/candidate/assessments/${assessment.id}`
          : undefined
    };
  }

  return toPortalAssessmentCard(candidateAssessment);
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
      assessment: {
        select: {
          id: true,
          title: true
        }
      },
      candidate: {
        select: {
          id: true,
          fullName: true,
          status: true,
          user: {
            select: {
              email: true
            }
          }
        }
      }
    },
    orderBy: {
      createdAt: "asc"
    }
  });

  return assessments.map(toPortalAssessmentCard);
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

  const nextEmail = update.email ?? existing.user.email;

  return {
    id: existing.id,
    name: update.name ?? existing.fullName,
    email: nextEmail,
    clientId: update.clientId ?? tenantCodeFromEmail(nextEmail),
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

  const blueprint = blueprintForTitle(nextTitle);
  const status = update.status ?? (blueprint.pendingStatus === "Expired" ? "Expired" : blueprint.pendingStatus ?? "Pending");
  const actionLabel = update.actionLabel ?? actionLabelForStatus(status);

  return {
    id: existing.id,
    name: nextTitle,
    category: update.category ?? blueprint.category,
    status,
    assignedDate: update.assignedDate ?? formatDateWithOffset(blueprint.assignedOffsetDays),
    deadline: update.deadline ?? formatDateWithOffset(blueprint.deadlineOffsetDays),
    deadlineCountdown: update.deadlineCountdown ?? formatCountdown(blueprint.deadlineOffsetDays, status === "Completed"),
    duration: update.duration ?? blueprint.duration,
    integrityRequirements: update.integrityRequirements ?? blueprint.integrityRequirements,
    deviceEligibility: update.deviceEligibility ?? blueprint.deviceEligibility,
    actionLabel,
    actionHref:
      update.actionHref ??
      (actionLabel === "Start Assessment" || actionLabel === "Resume"
        ? `/portal/candidate/assessments/${existing.id}`
        : undefined),
    candidateId: update.candidateId,
    clientId: update.clientId
  };
}

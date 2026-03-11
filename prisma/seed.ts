import { CandidateStatus, PrismaClient, Role } from "@prisma/client";
import { hashPassword } from "../lib/security/password";

const prisma = new PrismaClient();

const PASSWORDS = {
  admin: "SuperAdmin!234",
  recruiter: "Recruiter!234",
  client: "ClientUser!234",
  dev: "DevSuite!123"
} as const;

const ASSESSMENT_IDS = {
  baseline: "00000000-0000-0000-0000-000000000005",
  typing: "10000000-0000-0000-0000-000000000011",
  situational: "10000000-0000-0000-0000-000000000012",
  incident: "10000000-0000-0000-0000-000000000013",
  publicOrder: "10000000-0000-0000-0000-000000000014",
  ethics: "10000000-0000-0000-0000-000000000015"
} as const;

async function upsertUser(email: string, passwordHash: string, role: Role) {
  return prisma.user.upsert({
    where: { email },
    update: {
      passwordHash,
      role,
      deletedAt: null
    },
    create: {
      email,
      passwordHash,
      role
    }
  });
}

async function main() {
  const [superAdminPassword, recruiterPassword, clientPassword, devPassword] = await Promise.all([
    hashPassword(PASSWORDS.admin),
    hashPassword(PASSWORDS.recruiter),
    hashPassword(PASSWORDS.client),
    hashPassword(PASSWORDS.dev)
  ]);

  const [
    superAdmin,
    recruiterUser,
    clientUser,
    clientMetUser,
    clientNhsUser,
    candidateMetUser,
    candidateNhsUser
  ] = await Promise.all([
    upsertUser("admin@met.local", superAdminPassword, Role.SUPER_ADMIN),
    upsertUser("recruiter@met.local", recruiterPassword, Role.RECRUITER),
    upsertUser("client@met.local", clientPassword, Role.CLIENT),
    upsertUser("client.met@ctrl.dev", devPassword, Role.CLIENT),
    upsertUser("client.nhs@ctrl.dev", devPassword, Role.CLIENT),
    upsertUser("candidate.met@ctrl.dev", devPassword, Role.CANDIDATE),
    upsertUser("candidate.nhs@ctrl.dev", devPassword, Role.CANDIDATE)
  ]);

  const recruiterProfile = await prisma.recruiterProfile.upsert({
    where: { userId: recruiterUser.id },
    update: {
      deletedAt: null
    },
    create: { userId: recruiterUser.id }
  });

  await Promise.all([
    prisma.clientProfile.upsert({
      where: { userId: clientUser.id },
      update: {
        deletedAt: null
      },
      create: { userId: clientUser.id }
    }),
    prisma.clientProfile.upsert({
      where: { userId: clientMetUser.id },
      update: {
        deletedAt: null
      },
      create: { userId: clientMetUser.id }
    }),
    prisma.clientProfile.upsert({
      where: { userId: clientNhsUser.id },
      update: {
        deletedAt: null
      },
      create: { userId: clientNhsUser.id }
    })
  ]);

  const [candidateMetProfile, candidateNhsProfile] = await Promise.all([
    prisma.candidateProfile.upsert({
      where: { userId: candidateMetUser.id },
      update: {
        fullName: "John Smith",
        recruiterId: recruiterProfile.id,
        status: CandidateStatus.PENDING,
        deletedAt: null
      },
      create: {
        userId: candidateMetUser.id,
        recruiterId: recruiterProfile.id,
        fullName: "John Smith",
        status: CandidateStatus.PENDING
      }
    }),
    prisma.candidateProfile.upsert({
      where: { userId: candidateNhsUser.id },
      update: {
        fullName: "Amira Patel",
        recruiterId: recruiterProfile.id,
        status: CandidateStatus.COMPLETED,
        deletedAt: null
      },
      create: {
        userId: candidateNhsUser.id,
        recruiterId: recruiterProfile.id,
        fullName: "Amira Patel",
        status: CandidateStatus.COMPLETED
      }
    })
  ]);

  const assessments = await Promise.all([
    prisma.assessment.upsert({
      where: { id: ASSESSMENT_IDS.baseline },
      update: { title: "Baseline Aptitude Assessment", deletedAt: null },
      create: {
        id: ASSESSMENT_IDS.baseline,
        title: "Baseline Aptitude Assessment"
      }
    }),
    prisma.assessment.upsert({
      where: { id: ASSESSMENT_IDS.typing },
      update: { title: "Typing Speed Assessment (WPM Test)", deletedAt: null },
      create: {
        id: ASSESSMENT_IDS.typing,
        title: "Typing Speed Assessment (WPM Test)"
      }
    }),
    prisma.assessment.upsert({
      where: { id: ASSESSMENT_IDS.situational },
      update: { title: "Situational Judgement Test", deletedAt: null },
      create: {
        id: ASSESSMENT_IDS.situational,
        title: "Situational Judgement Test"
      }
    }),
    prisma.assessment.upsert({
      where: { id: ASSESSMENT_IDS.incident },
      update: { title: "Incident Report Writing", deletedAt: null },
      create: {
        id: ASSESSMENT_IDS.incident,
        title: "Incident Report Writing"
      }
    }),
    prisma.assessment.upsert({
      where: { id: ASSESSMENT_IDS.publicOrder },
      update: { title: "Public Order Briefing Response", deletedAt: null },
      create: {
        id: ASSESSMENT_IDS.publicOrder,
        title: "Public Order Briefing Response"
      }
    }),
    prisma.assessment.upsert({
      where: { id: ASSESSMENT_IDS.ethics },
      update: { title: "Legacy Ethics Scenario", deletedAt: null },
      create: {
        id: ASSESSMENT_IDS.ethics,
        title: "Legacy Ethics Scenario"
      }
    })
  ]);

  const baselineAssessment = assessments[0];

  const existingQuestions = await prisma.question.count({ where: { assessmentId: baselineAssessment.id } });
  if (existingQuestions === 0) {
    await prisma.question.createMany({
      data: [
        {
          assessmentId: baselineAssessment.id,
          orderIndex: 1,
          questionText: "Which practice best protects sensitive systems?",
          options: ["Shared passwords", "Least privilege", "Disabled logging", "Open firewall"],
          correctAnswer: "Least privilege"
        },
        {
          assessmentId: baselineAssessment.id,
          orderIndex: 2,
          questionText: "What does GDPR primarily protect?",
          options: ["Source code", "Personal data", "Hardware assets", "Network latency"],
          correctAnswer: "Personal data"
        },
        {
          assessmentId: baselineAssessment.id,
          orderIndex: 3,
          questionText: "What is the strongest response to repeated failed logins?",
          options: ["Ignore", "Lockout policy", "Display passwords", "Disable TLS"],
          correctAnswer: "Lockout policy"
        },
        {
          assessmentId: baselineAssessment.id,
          orderIndex: 4,
          questionText: "Where should business authorization checks live?",
          options: ["Client browser only", "Server-side", "In CSS", "In local storage"],
          correctAnswer: "Server-side"
        },
        {
          assessmentId: baselineAssessment.id,
          orderIndex: 5,
          questionText: "What is the purpose of an audit log?",
          options: ["Decorative UI", "Tamper evidence", "Faster page loads", "Email marketing"],
          correctAnswer: "Tamper evidence"
        }
      ]
    });
  }

  await Promise.all([
    prisma.candidateAssessment.upsert({
      where: {
        candidateId_assessmentId: {
          candidateId: candidateMetProfile.id,
          assessmentId: ASSESSMENT_IDS.typing
        }
      },
      update: {
        completedAt: null,
        score: 0
      },
      create: {
        candidateId: candidateMetProfile.id,
        assessmentId: ASSESSMENT_IDS.typing
      }
    }),
    prisma.candidateAssessment.upsert({
      where: {
        candidateId_assessmentId: {
          candidateId: candidateMetProfile.id,
          assessmentId: ASSESSMENT_IDS.situational
        }
      },
      update: {
        completedAt: null,
        score: 0
      },
      create: {
        candidateId: candidateMetProfile.id,
        assessmentId: ASSESSMENT_IDS.situational
      }
    }),
    prisma.candidateAssessment.upsert({
      where: {
        candidateId_assessmentId: {
          candidateId: candidateMetProfile.id,
          assessmentId: ASSESSMENT_IDS.incident
        }
      },
      update: {
        completedAt: new Date(),
        score: 84,
        submissionIp: "127.0.0.1"
      },
      create: {
        candidateId: candidateMetProfile.id,
        assessmentId: ASSESSMENT_IDS.incident,
        completedAt: new Date(),
        score: 84,
        submissionIp: "127.0.0.1"
      }
    }),
    prisma.candidateAssessment.upsert({
      where: {
        candidateId_assessmentId: {
          candidateId: candidateMetProfile.id,
          assessmentId: ASSESSMENT_IDS.publicOrder
        }
      },
      update: {
        completedAt: null,
        score: 0
      },
      create: {
        candidateId: candidateMetProfile.id,
        assessmentId: ASSESSMENT_IDS.publicOrder
      }
    }),
    prisma.candidateAssessment.upsert({
      where: {
        candidateId_assessmentId: {
          candidateId: candidateMetProfile.id,
          assessmentId: ASSESSMENT_IDS.ethics
        }
      },
      update: {
        completedAt: null,
        score: 0
      },
      create: {
        candidateId: candidateMetProfile.id,
        assessmentId: ASSESSMENT_IDS.ethics
      }
    }),
    prisma.candidateAssessment.upsert({
      where: {
        candidateId_assessmentId: {
          candidateId: candidateNhsProfile.id,
          assessmentId: ASSESSMENT_IDS.incident
        }
      },
      update: {
        completedAt: new Date(),
        score: 82,
        submissionIp: "127.0.0.1"
      },
      create: {
        candidateId: candidateNhsProfile.id,
        assessmentId: ASSESSMENT_IDS.incident,
        completedAt: new Date(),
        score: 82,
        submissionIp: "127.0.0.1"
      }
    })
  ]);

  console.log("Seed complete", {
    superAdminEmail: superAdmin.email,
    recruiterEmail: recruiterUser.email,
    clientEmails: [clientUser.email, clientMetUser.email, clientNhsUser.email],
    candidateEmails: [candidateMetUser.email, candidateNhsUser.email],
    assessmentIds: Object.values(ASSESSMENT_IDS)
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

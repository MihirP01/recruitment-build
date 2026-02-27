import { PrismaClient, Role } from "@prisma/client";
import { hashPassword } from "../lib/security/password";

const prisma = new PrismaClient();

async function main() {
  const superAdminPassword = await hashPassword("SuperAdmin!234");
  const recruiterPassword = await hashPassword("Recruiter!234");
  const clientPassword = await hashPassword("ClientUser!234");

  const [superAdmin, recruiterUser, clientUser] = await Promise.all([
    prisma.user.upsert({
      where: { email: "admin@met.local" },
      update: {},
      create: {
        email: "admin@met.local",
        passwordHash: superAdminPassword,
        role: Role.SUPER_ADMIN
      }
    }),
    prisma.user.upsert({
      where: { email: "recruiter@met.local" },
      update: {},
      create: {
        email: "recruiter@met.local",
        passwordHash: recruiterPassword,
        role: Role.RECRUITER
      }
    }),
    prisma.user.upsert({
      where: { email: "client@met.local" },
      update: {},
      create: {
        email: "client@met.local",
        passwordHash: clientPassword,
        role: Role.CLIENT
      }
    })
  ]);

  await prisma.recruiterProfile.upsert({
    where: { userId: recruiterUser.id },
    update: {},
    create: { userId: recruiterUser.id }
  });

  await prisma.clientProfile.upsert({
    where: { userId: clientUser.id },
    update: {},
    create: { userId: clientUser.id }
  });

  const assessment = await prisma.assessment.upsert({
    where: { id: "00000000-0000-0000-0000-000000000005" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000005",
      title: "Baseline Aptitude Assessment"
    }
  });

  const existingQuestions = await prisma.question.count({ where: { assessmentId: assessment.id } });
  if (existingQuestions === 0) {
    await prisma.question.createMany({
      data: [
        {
          assessmentId: assessment.id,
          orderIndex: 1,
          questionText: "Which practice best protects sensitive systems?",
          options: ["Shared passwords", "Least privilege", "Disabled logging", "Open firewall"],
          correctAnswer: "Least privilege"
        },
        {
          assessmentId: assessment.id,
          orderIndex: 2,
          questionText: "What does GDPR primarily protect?",
          options: ["Source code", "Personal data", "Hardware assets", "Network latency"],
          correctAnswer: "Personal data"
        },
        {
          assessmentId: assessment.id,
          orderIndex: 3,
          questionText: "What is the strongest response to repeated failed logins?",
          options: ["Ignore", "Lockout policy", "Display passwords", "Disable TLS"],
          correctAnswer: "Lockout policy"
        },
        {
          assessmentId: assessment.id,
          orderIndex: 4,
          questionText: "Where should business authorization checks live?",
          options: ["Client browser only", "Server-side", "In CSS", "In local storage"],
          correctAnswer: "Server-side"
        },
        {
          assessmentId: assessment.id,
          orderIndex: 5,
          questionText: "What is the purpose of an audit log?",
          options: ["Decorative UI", "Tamper evidence", "Faster page loads", "Email marketing"],
          correctAnswer: "Tamper evidence"
        }
      ]
    });
  }

  console.log("Seed complete", {
    superAdminEmail: superAdmin.email,
    recruiterEmail: recruiterUser.email,
    clientEmail: clientUser.email,
    assessmentId: assessment.id
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

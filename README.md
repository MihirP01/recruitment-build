# CTRL Platform (Next.js + Prisma)

Production-ready baseline recruitment and assessment shell with role-based access control for `CANDIDATE`, `RECRUITER`, `CLIENT`, and `SUPER_ADMIN`.

## Stack

- Next.js 14 App Router + TypeScript (strict)
- Tailwind CSS
- PostgreSQL + Prisma
- NextAuth (JWT session strategy)
- Argon2id password hashing
- Zod validation

## Features Implemented

- Role-locked login pages:
  - `/login/candidate`
  - `/login/recruiter`
  - `/login/client`
- Candidate registration with recruiter-issued access code (`/register`)
- Secure candidate CV upload to private S3:
  - Registration form uses file upload (`PDF`, `DOC`, `DOCX`, max `5MB`)
  - `/api/upload/cv` stores UUID-keyed files in private S3 bucket
  - `/api/cv/view` returns a 60-second signed URL after role + ownership checks
- Recruiter flow:
  - Generate cryptographically random access codes
  - Code hashes stored in DB (raw code shown once)
  - Candidate listing with score and submitted answers
  - Push candidate to selected client with notes
- Candidate flow:
  - Start single-attempt assessment
  - Submit answers
  - Score computed server-side only
- Client flow:
  - Read-only view of shared candidates and scores
- Admin flow:
  - Audit log table browsing
- Security baseline:
  - CSRF token checks for sensitive POST routes
  - Same-origin checks
  - Rate limiting middleware + route-level limiters
  - Strict security headers in middleware
  - HTTP-only strict cookies for auth session
  - Account lockout tracking after failed logins
  - Audit log capture for critical actions

## Required Routes

- `/`
- `/login/candidate`
- `/login/recruiter`
- `/login/client`
- `/register`
- `/dashboard/candidate`
- `/dashboard/recruiter`
- `/dashboard/client`
- `/dashboard/admin`
- `/dashboard/recruiter/codes`
- `/dashboard/recruiter/candidates`
- `/dashboard/recruiter/clients`

## API Routes

- `/api/auth/*`
- `/api/csrf`
- `/api/register`
- `/api/codes/generate`
- `/api/codes/validate`
- `/api/recruiter/share`
- `/api/upload/cv`
- `/api/cv/view`
- `/api/assessments/start`
- `/api/assessments/submit`
- `/api/audit`

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create env file:

```bash
cp .env.example .env
```

Configure required S3 values in `.env`:

- `AWS_REGION`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `S3_CV_BUCKET`
- Optional: `S3_CV_PREFIX`, `S3_ENDPOINT`, `S3_FORCE_PATH_STYLE`

3. Run migrations:

```bash
npx prisma migrate dev
```

4. Seed baseline data:

```bash
npx prisma db seed
```

5. Start app:

```bash
npm run dev
```

## Seeded Users

- Super Admin: `admin@met.local` / `SuperAdmin!234`
- Recruiter: `recruiter@met.local` / `Recruiter!234`
- Client: `client@met.local` / `ClientUser!234`

## Compliance Scaffold Notes

- PII encryption helper included (`lib/security/encryption.ts`) with key-backed encryption scaffold.
- GDPR operational endpoints (data export/erasure workflows) should be implemented as controlled admin services.
- Secure object storage + malware scanning for CV files should be implemented in upload pipeline before production go-live.
- Data retention, backup, and incident response hooks should be configured in deployment platform runbooks.

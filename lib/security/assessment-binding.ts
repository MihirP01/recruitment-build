import { createHash, createHmac, timingSafeEqual } from "crypto";

export const ASSESSMENT_BINDING_COOKIE = "ctrl_assessment_binding";

type AssessmentBindingPayload = {
  candidateAssessmentId: string;
  userId: string;
  fingerprintHash: string;
  issuedAt: number;
};

function getBindingSecret() {
  return process.env.NEXTAUTH_SECRET ?? "ctrl-dev-assessment-binding-secret";
}

function encodeBase64Url(value: string) {
  return Buffer.from(value, "utf8").toString("base64url");
}

function decodeBase64Url(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

export function hashAssessmentFingerprint(fingerprint: string): string {
  return createHash("sha256").update(fingerprint).digest("hex");
}

export function createAssessmentBindingToken(payload: AssessmentBindingPayload): string {
  const encodedPayload = encodeBase64Url(JSON.stringify(payload));
  const signature = createHmac("sha256", getBindingSecret()).update(encodedPayload).digest("base64url");
  return `${encodedPayload}.${signature}`;
}

export function verifyAssessmentBindingToken(token: string): AssessmentBindingPayload | null {
  const [encodedPayload, signature] = token.split(".");
  if (!encodedPayload || !signature) {
    return null;
  }

  const expectedSignature = createHmac("sha256", getBindingSecret()).update(encodedPayload).digest("base64url");
  const expectedBuffer = Buffer.from(expectedSignature);
  const signatureBuffer = Buffer.from(signature);

  if (expectedBuffer.length !== signatureBuffer.length || !timingSafeEqual(expectedBuffer, signatureBuffer)) {
    return null;
  }

  try {
    const payload = JSON.parse(decodeBase64Url(encodedPayload)) as AssessmentBindingPayload;
    if (
      typeof payload.candidateAssessmentId !== "string" ||
      typeof payload.userId !== "string" ||
      typeof payload.fingerprintHash !== "string" ||
      typeof payload.issuedAt !== "number"
    ) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}


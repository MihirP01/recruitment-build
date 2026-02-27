import { randomUUID } from "crypto";
import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
]);

const EXTENSION_BY_MIME: Record<string, string> = {
  "application/pdf": "pdf",
  "application/msword": "doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx"
};

const ALLOWED_EXTENSIONS = new Set(["pdf", "doc", "docx"]);

function getS3Client(): S3Client {
  const region = process.env.AWS_REGION;
  if (!region) {
    throw new Error("AWS_REGION is required");
  }

  return new S3Client({
    region,
    endpoint: process.env.S3_ENDPOINT,
    forcePathStyle: process.env.S3_FORCE_PATH_STYLE === "true"
  });
}

function getS3Bucket(): string {
  const bucket = process.env.S3_CV_BUCKET;
  if (!bucket) {
    throw new Error("S3_CV_BUCKET is required");
  }
  return bucket;
}

function extensionFromName(fileName: string): string {
  const parts = fileName.toLowerCase().split(".");
  return parts.length > 1 ? parts[parts.length - 1] : "";
}

export function validateCvFileType(fileName: string, mimeType: string): { valid: boolean; extension?: string } {
  const ext = extensionFromName(fileName);

  if (!ALLOWED_EXTENSIONS.has(ext)) {
    return { valid: false };
  }

  if (!ALLOWED_MIME_TYPES.has(mimeType)) {
    return { valid: false };
  }

  return { valid: true, extension: EXTENSION_BY_MIME[mimeType] ?? ext };
}

export async function uploadCandidateCv(params: {
  candidateId: string;
  fileName: string;
  mimeType: string;
  body: Buffer;
}): Promise<string> {
  const { candidateId, fileName, mimeType, body } = params;
  const validation = validateCvFileType(fileName, mimeType);

  if (!validation.valid || !validation.extension) {
    throw new Error("Unsupported file type");
  }

  const prefix = (process.env.S3_CV_PREFIX ?? "candidate-cv").replace(/\/$/, "");
  const key = `${prefix}/${candidateId}/${randomUUID()}.${validation.extension}`;
  const s3Client = getS3Client();
  const bucket = getS3Bucket();

  await s3Client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: mimeType,
      ServerSideEncryption: "AES256"
    })
  );

  return key;
}

export async function getCvSignedUrl(storageKey: string, expiresInSeconds = 60): Promise<string> {
  const s3Client = getS3Client();
  const bucket = getS3Bucket();
  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: storageKey
  });

  return getSignedUrl(s3Client, command, {
    expiresIn: expiresInSeconds
  });
}

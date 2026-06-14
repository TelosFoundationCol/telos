/**
 * Cloudflare R2 storage (S3-compatible). Used for donation proofs and
 * agency deliverables. We use signed PUT URLs for client uploads (no need
 * to stream large files through our serverless functions) and signed GET
 * URLs for reading them back when needed.
 */
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getEnv } from "@/lib/env";

let _client: S3Client | null = null;

function client() {
  if (_client) return _client;
  const env = getEnv();
  _client = new S3Client({
    region: "auto",
    endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: env.R2_ACCESS_KEY_ID,
      secretAccessKey: env.R2_SECRET_ACCESS_KEY,
    },
  });
  return _client;
}

const ALLOWED_MIME = new Set([
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/webp",
]);

export async function presignUpload(opts: {
  key: string;
  contentType: string;
  expiresInSeconds?: number;
}) {
  if (!ALLOWED_MIME.has(opts.contentType)) {
    throw new Error(`Unsupported content type: ${opts.contentType}`);
  }
  const env = getEnv();
  const cmd = new PutObjectCommand({
    Bucket: env.R2_BUCKET,
    Key: opts.key,
    ContentType: opts.contentType,
  });
  const url = await getSignedUrl(client(), cmd, {
    expiresIn: opts.expiresInSeconds ?? 60 * 5, // 5 min
  });
  return { url, key: opts.key };
}

export async function presignRead(key: string, expiresInSeconds = 60 * 10) {
  const env = getEnv();
  const cmd = new GetObjectCommand({ Bucket: env.R2_BUCKET, Key: key });
  return getSignedUrl(client(), cmd, { expiresIn: expiresInSeconds });
}

/** Build an object key for a donation proof. */
export function donationProofKey(donationId: string, filename: string) {
  const ext = filename.split(".").pop()?.toLowerCase() ?? "bin";
  const safe = ext.replace(/[^a-z0-9]/g, "").slice(0, 8) || "bin";
  return `donations/${donationId}/proof.${safe}`;
}

/** Build an object key for an agency deliverable. */
export function deliverableKey(disbursementId: string, filename: string) {
  const ext = filename.split(".").pop()?.toLowerCase() ?? "bin";
  const safe = ext.replace(/[^a-z0-9]/g, "").slice(0, 8) || "bin";
  return `deliverables/${disbursementId}/${Date.now()}.${safe}`;
}

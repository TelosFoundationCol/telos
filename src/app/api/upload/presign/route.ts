import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { presignUpload } from "@/lib/storage/r2";

const schema = z.object({
  reference: z.string().regex(/^TX-\d{4}-\d{6}$/),
  filename: z.string().min(1).max(200),
  contentType: z.enum(["application/pdf", "image/png", "image/jpeg", "image/webp"]),
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "invalid" }, { status: 400 });

  const ext = parsed.data.filename.split(".").pop()?.toLowerCase() ?? "bin";
  const safeExt = ext.replace(/[^a-z0-9]/g, "").slice(0, 8) || "bin";
  const key = `donations/${parsed.data.reference}/proof.${safeExt}`;

  try {
    const { url } = await presignUpload({
      key,
      contentType: parsed.data.contentType,
    });
    return NextResponse.json({ url, key });
  } catch (err) {
    console.error("[presign]", err);
    return NextResponse.json({ error: "presign-failed" }, { status: 500 });
  }
}

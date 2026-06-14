import { desc } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { ledger } from "@/lib/db/schema";

function csvEscape(v: unknown): string {
  if (v == null) return "";
  const s = String(v);
  // Quote and escape if contains comma, quote, or newline.
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export async function GET() {
  try {
    const db = getDb();
    const rows = await db.select().from(ledger).orderBy(desc(ledger.occurredAt));

    const header = [
      "date",
      "kind",
      "from",
      "to",
      "purpose_es",
      "purpose_en",
      "amount_cents",
      "currency",
      "reference",
      "source_table",
      "source_id",
    ];

    const lines = [header.join(",")];
    for (const r of rows) {
      lines.push(
        [
          r.occurredAt.toISOString(),
          r.kind,
          csvEscape(r.fromName),
          csvEscape(r.toName),
          csvEscape(r.purposeEs),
          csvEscape(r.purposeEn ?? ""),
          r.amountCents ?? "",
          r.currency ?? "",
          r.referenceHash,
          r.sourceTable ?? "",
          r.sourceId ?? "",
        ].join(","),
      );
    }

    const csv = lines.join("\n") + "\n";
    return new Response(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="telos-libro-mayor-${new Date().toISOString().slice(0, 10)}.csv"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("[ledger export]", err);
    return new Response("error", { status: 500 });
  }
}

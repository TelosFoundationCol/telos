import { ExternalLink } from "lucide-react";
import type { LedgerEntry } from "@/lib/db/schema";
import { dictionaries, type Lang } from "@/lib/i18n/dictionaries";
import { fmtMoney, pickLocalized } from "@/lib/utils";

export function LedgerTable({ rows, lang }: { rows: LedgerEntry[]; lang: Lang }) {
  const t = (k: string) => dictionaries[lang][k] ?? k;
  return (
    <div className="overflow-x-auto scrollbar-thin">
      <table className="w-full text-sm">
        <thead className="bg-paper-subtle text-ink-subtle text-xs uppercase tracking-wider">
          <tr>
            <th className="text-left font-medium px-5 py-2.5">{t("trans.col.date")}</th>
            <th className="text-left font-medium px-5 py-2.5">{t("trans.col.type")}</th>
            <th className="text-left font-medium px-5 py-2.5">{t("trans.col.from")}</th>
            <th className="text-left font-medium px-5 py-2.5">{t("trans.col.to")}</th>
            <th className="text-left font-medium px-5 py-2.5">{t("trans.col.purpose")}</th>
            <th className="text-right font-medium px-5 py-2.5">{t("trans.col.amount")}</th>
            <th className="text-right font-medium px-5 py-2.5">{t("trans.col.proof")}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {rows.map((r) => (
            <tr key={r.id} className="hover:bg-paper-subtle">
              <td className="px-5 py-3 text-ink-muted tabular text-xs">
                {r.occurredAt.toISOString().slice(0, 10)}
              </td>
              <td className="px-5 py-3">
                <TypePill kind={r.kind} t={t} />
              </td>
              <td className="px-5 py-3">{r.fromName}</td>
              <td className="px-5 py-3 font-medium">{r.toName}</td>
              <td className="px-5 py-3 text-ink-muted">{pickLocalized(r, "purpose", lang)}</td>
              <td
                className={`px-5 py-3 text-right tabular ${
                  r.kind === "donation"
                    ? "text-brand"
                    : r.kind === "disbursement"
                      ? "text-ink"
                      : "text-ink-subtle"
                }`}
              >
                {r.amountCents == null ? "—" : fmtMoney(r.amountCents, r.currency)}
              </td>
              <td className="px-5 py-3 text-right">
                <span className="inline-flex items-center gap-1 text-xs text-ink-muted hover:text-ink cursor-pointer tabular">
                  <span className="font-mono">{r.referenceHash}</span>
                  <ExternalLink className="w-3 h-3" />
                </span>
              </td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={7} className="px-5 py-8 text-center text-ink-subtle">
                —
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function TypePill({ kind, t }: { kind: "donation" | "disbursement" | "deliverable"; t: (k: string) => string }) {
  const map = {
    donation: ["bg-emerald-50 text-emerald-700 border-emerald-200", t("trans.filter.donation").replace(/s$/, "")],
    disbursement: ["bg-blue-50 text-blue-700 border-blue-200", t("trans.filter.disbursement").replace(/s$/, "")],
    deliverable: ["bg-stone-100 text-stone-700 border-stone-200", t("trans.filter.deliverable").replace(/s$/, "")],
  } as const;
  const [cls, label] = map[kind];
  return (
    <span className={`inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded-full border ${cls}`}>
      {label}
    </span>
  );
}

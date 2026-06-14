import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Briefcase, CheckCircle2, ShieldCheck } from "lucide-react";
import { getT } from "@/lib/i18n/server";
import { fetchBusiness } from "@/lib/data/queries";
import { fmtCop, pickLocalized } from "@/lib/utils";

export default async function BusinessDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { t, lang } = await getT();
  const data = await fetchBusiness(id);
  if (!data) notFound();
  const { business: b, agency } = data;

  const pct = b.goalCents > 0 ? Math.min(100, Math.round((b.raisedCents / b.goalCents) * 100)) : 0;
  const remaining = Math.max(0, b.goalCents - b.raisedCents);
  const story = pickLocalized(b, "story", lang);
  const need = pickLocalized(b, "need", lang);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      <Link
        href="/negocios"
        className="inline-flex items-center gap-1 text-sm text-ink-muted hover:text-ink mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        {t("biz.back")}
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 lg:gap-10">
        <div>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-paper-sunken flex items-center justify-center text-4xl">
              {b.emoji ?? "🌱"}
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider text-ink-subtle">
                {t(`cat.${b.category}`)} · {b.city}
              </div>
              <h1 className="serif text-4xl tracking-tight mt-1">{b.name}</h1>
              <div className="text-sm text-ink-muted">
                {b.ownerName} · {b.yearsOperating} {t("biz.years")}
              </div>
            </div>
          </div>

          {story && (
            <div className="bg-paper-subtle border border-line rounded-2xl p-5">
              <div className="text-xs uppercase tracking-wider text-ink-subtle mb-2">
                {t("biz.story")}
              </div>
              <p className="text-ink leading-relaxed">{story}</p>
            </div>
          )}

          <div className="mt-8">
            <div className="text-sm font-medium mb-3">{t("biz.service")}</div>
            <div className="bg-paper border border-line rounded-2xl p-5 flex items-center justify-between">
              <div>
                <div className="font-semibold">{need}</div>
                {agency && (
                  <div className="text-xs text-ink-muted mt-1">
                    {t("biz.deliveredby")}{" "}
                    <span className="text-ink font-medium">{agency.name}</span>
                  </div>
                )}
              </div>
              <Briefcase className="w-5 h-5 text-ink-faint" />
            </div>
          </div>

          {b.milestones && b.milestones.length > 0 && (
            <div className="mt-8">
              <div className="text-sm font-medium mb-3">{t("biz.projecttimeline")}</div>
              <ol className="relative border-l border-line ml-3 space-y-5 py-2">
                {b.milestones.map((m, i) => (
                  <li key={i} className="ml-6">
                    <span
                      className={`absolute -left-2.5 w-5 h-5 rounded-full flex items-center justify-center ${
                        m.done
                          ? "bg-brand text-paper"
                          : "bg-paper-sunken border border-line text-ink-faint"
                      }`}
                    >
                      {m.done ? <CheckCircle2 className="w-3 h-3" /> : i + 1}
                    </span>
                    <div className="font-medium text-sm">
                      {lang === "en" && m.titleEn ? m.titleEn : m.titleEs}
                    </div>
                    <div className="text-xs text-ink-subtle mt-0.5">
                      {m.done ? t("biz.completed") : t("biz.pending")}
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>

        <aside className="lg:sticky lg:top-24 h-fit">
          <div className="bg-paper border border-line rounded-2xl p-6">
            <div className="text-xs uppercase tracking-wider text-ink-subtle">
              {t("biz.raised")}
            </div>
            <div className="serif text-3xl tabular mt-1">{fmtCop(b.raisedCents)}</div>
            <div className="text-xs text-ink-muted tabular mt-0.5">
              {t("biz.of")} {fmtCop(b.goalCents)} ({pct}%)
            </div>
            <div className="h-2 progress-track rounded-full overflow-hidden mt-3">
              <div className={`h-full ${pct === 100 ? "bg-brand" : "bg-ink"}`} style={{ width: `${pct}%` }} />
            </div>
            {pct < 100 ? (
              <>
                <div className="mt-5 text-xs text-ink-muted">
                  {t("biz.remaining")}: <span className="tabular text-ink font-medium">{fmtCop(remaining)}</span>
                </div>
                <Link
                  href={`/donar?business=${b.id}`}
                  className="mt-3 block text-center w-full bg-ink text-paper rounded-full py-3 font-medium hover:bg-stone-800"
                >
                  {t("biz.cta")}
                </Link>
              </>
            ) : (
              <div className="mt-5 inline-flex items-center gap-1.5 bg-brand-soft text-brand-ink rounded-full px-3 py-1 text-xs">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {t("biz.goalmet")}
              </div>
            )}
          </div>

          <div className="mt-4 bg-paper-subtle border border-line rounded-2xl p-5 text-xs text-ink-muted">
            <ShieldCheck className="w-4 h-4 text-brand inline -mt-0.5 mr-1" />
            {t("biz.vetted")}
          </div>
        </aside>
      </div>
    </div>
  );
}

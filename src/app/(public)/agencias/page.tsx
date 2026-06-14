import Link from "next/link";
import { ArrowRight, Award, ShieldCheck, UserRound } from "lucide-react";
import { getT } from "@/lib/i18n/server";
import { fetchAgencies } from "@/lib/data/queries";
import { Pill } from "@/components/ui/card";
import { pickLocalized } from "@/lib/utils";

export default async function AgenciesPage() {
  const { t, lang } = await getT();
  const agencies = await fetchAgencies();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
      <div className="text-xs uppercase tracking-wider text-ink-subtle mb-2">{t("ag.kicker")}</div>
      <h1 className="serif text-5xl tracking-tight">{t("ag.title")}</h1>
      <p className="text-ink-muted mt-3 max-w-2xl">{t("ag.sub")}</p>

      <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-4">
        {agencies.map((a) => {
          const blurb = pickLocalized(a, "blurb", lang);
          const cert = pickLocalized(a, "certifications", lang);
          return (
            <div key={a.id} className="bg-paper border border-line rounded-2xl p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="font-semibold text-lg tracking-tight">{a.name}</div>
                  <div className="text-xs text-ink-muted mt-0.5">
                    {t(`cat.${a.category}`)} · {a.city}
                  </div>
                </div>
                <Pill tone="brand">
                  <ShieldCheck className="w-3 h-3" />
                  {t("ag.verified")}
                </Pill>
              </div>
              <p className="text-sm text-ink-muted leading-relaxed">{blurb}</p>
              <div className="mt-5 grid grid-cols-3 gap-3 text-center text-xs">
                <Stat label={t("ag.projects")} value={a.projectsCompleted} />
                <Stat label={t("ag.csat")} value={a.csat ? (a.csat / 10).toFixed(1) : "—"} />
                <Stat label={t("ag.team")} value={a.teamSize ?? 0} />
              </div>
              <div className="mt-5 pt-4 border-t border-line text-xs text-ink-muted">
                {cert && (
                  <div className="flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5" />
                    <span>{cert}</span>
                  </div>
                )}
                {a.leadName && (
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <UserRound className="w-3.5 h-3.5" />
                    <span>
                      {t("ag.lead")}: {a.leadName}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-12 bg-paper-subtle border border-line rounded-2xl p-6 flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="font-semibold">{t("ag.apply.t")}</div>
          <p className="text-sm text-ink-muted mt-1">{t("ag.apply.p")}</p>
        </div>
        <Link
          href="/portal/agencia"
          className="inline-flex items-center gap-2 bg-ink text-paper px-4 py-2.5 rounded-full text-sm font-medium hover:bg-stone-800"
        >
          <span>{t("ag.apply.cta")}</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <div className="serif text-2xl tabular">{value}</div>
      <div className="text-ink-subtle uppercase tracking-wider">{label}</div>
    </div>
  );
}

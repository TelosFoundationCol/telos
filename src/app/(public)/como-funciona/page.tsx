import { ChevronDown } from "lucide-react";
import { getT } from "@/lib/i18n/server";

export default async function HowItWorksPage() {
  const { t } = await getT();
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-20">
      <div className="text-xs uppercase tracking-wider text-ink-subtle mb-3">{t("how.kicker")}</div>
      <h1 className="serif text-5xl tracking-tight leading-[1.05]">{t("how.title")}</h1>
      <p className="text-ink-muted mt-5 max-w-2xl leading-relaxed">{t("how.sub")}</p>

      <div className="mt-14 space-y-12">
        <Step
          n="01"
          kicker={t("flow.s1.t")}
          title={t("how.q1")}
          body={t("how.a1")}
        />
        <Step n="02" kicker={t("flow.s2.t")} title={t("how.q2")} body={t("how.a2")} />
        <Step n="03" kicker={t("flow.s3.t")} title={t("flow.s3.t")} body={t("flow.s3.d")} />
        <Step n="04" kicker={t("flow.s4.t")} title={t("how.q3")} body={t("how.a3")} />
      </div>

      <div className="mt-20 border-t border-line pt-12">
        <h2 className="serif text-3xl tracking-tight mb-6">{t("how.faq")}</h2>
        <div className="space-y-2">
          <Faq q={t("how.q1")} a={t("how.a1")} />
          <Faq q={t("how.q2")} a={t("how.a2")} />
          <Faq q={t("how.q3")} a={t("how.a3")} />
          <Faq q={t("how.q4")} a={t("how.a4")} />
        </div>
      </div>
    </div>
  );
}

function Step({ n, kicker, title, body }: { n: string; kicker: string; title: string; body: string }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-[120px_1fr] gap-6 border-t border-line pt-12 first:border-0 first:pt-0">
      <div>
        <div className="text-5xl serif text-brand tabular">{n}</div>
        <div className="text-xs uppercase tracking-wider text-ink-subtle mt-2">{kicker}</div>
      </div>
      <div>
        <h3 className="text-2xl font-semibold tracking-tight">{title}</h3>
        <p className="text-ink-muted mt-2">{body}</p>
      </div>
    </div>
  );
}

function Faq({ q, a }: { q: string; a: string }) {
  return (
    <details className="border border-line rounded-xl p-4 group">
      <summary className="flex justify-between items-center font-medium gap-3">
        <span>{q}</span>
        <ChevronDown className="w-4 h-4 chev shrink-0" />
      </summary>
      <p className="text-ink-muted text-sm mt-3 leading-relaxed">{a}</p>
    </details>
  );
}

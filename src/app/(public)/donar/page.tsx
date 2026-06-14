import { getT } from "@/lib/i18n/server";
import { DonateFlow } from "@/components/donate-flow";

export default async function DonarPage({
  searchParams,
}: {
  searchParams: Promise<{ business?: string }>;
}) {
  const { t } = await getT();
  const sp = await searchParams;
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 lg:gap-10">
        <div>
          <div className="text-xs uppercase tracking-wider text-ink-subtle mb-2">{t("don.kicker")}</div>
          <h1 className="serif text-4xl sm:text-5xl tracking-tight leading-[1.05]">{t("don.title")}</h1>
          <p className="text-ink-muted mt-3">{t("don.sub")}</p>
          <DonateFlow earmarkBusinessId={sp.business ?? null} />
        </div>
        <aside className="lg:sticky lg:top-24 h-fit">
          <DonateSummaryStatic />
        </aside>
      </div>
    </div>
  );
}

async function DonateSummaryStatic() {
  const { t } = await getT();
  return (
    <div className="bg-paper-subtle border border-line rounded-2xl p-6">
      <div className="text-xs uppercase tracking-wider text-ink-subtle mb-3">{t("don.sum.t")}</div>
      <div id="don-summary-host">
        {/* Filled dynamically by DonateFlow via DOM */}
        <div className="flex justify-between text-sm py-2 border-b border-line">
          <span>{t("don.sum.donation")}</span>
          <span className="tabular font-medium" id="sum-amount">USD $100.00</span>
        </div>
        <div className="flex justify-between items-center text-sm py-2.5">
          <span className="inline-flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-brand" />
            <span>{t("don.sum.toservices")}</span>
          </span>
          <span className="tabular font-semibold text-brand" id="sum-services">USD $100.00</span>
        </div>
      </div>
      <div className="mt-4 bg-paper border border-line rounded-xl p-3 text-xs text-ink-muted">
        {t("don.sum.note")}
      </div>
    </div>
  );
}

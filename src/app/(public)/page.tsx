import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  GitMerge,
  HandCoins,
  LineChart,
  ReceiptText,
  SearchCheck,
} from "lucide-react";
import { getT } from "@/lib/i18n/server";
import { fetchFeaturedBusinesses, fetchKpis } from "@/lib/data/queries";
import { StatStrip, StatCell } from "@/components/ui/card";
import { BusinessCard } from "@/components/business-card";
import { fmtCop } from "@/lib/utils";

export default async function HomePage() {
  const { t, lang } = await getT();
  const [kpis, featured] = await Promise.all([fetchKpis(), fetchFeaturedBusinesses(3)]);

  const usdEquivalent = Math.round((kpis.raisedCents / 100) / 4000); // approx USD

  return (
    <>
      {/* Hero */}
      <section className="relative">
        <div className="absolute inset-0 grid-bg pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-20 pb-16">
          <div className="inline-flex items-center gap-2 text-xs text-ink-muted border border-line bg-paper/70 rounded-full px-3 py-1 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-brand" />
            <span>{t("hero.pill")}</span>
          </div>
          <h1 className="serif text-[44px] sm:text-6xl lg:text-7xl leading-[1.02] max-w-4xl tracking-tight">
            {t("hero.h1a")}
            <br />
            <span className="text-ink-muted">{t("hero.h1b")}</span>
          </h1>
          <p className="mt-8 text-lg text-ink-muted max-w-2xl leading-relaxed">{t("hero.sub")}</p>
          <div className="mt-10 flex flex-wrap items-center gap-3">
            <Link
              href="/donar"
              className="inline-flex items-center gap-2 bg-ink text-paper px-5 py-3 rounded-full font-medium hover:bg-stone-800 transition"
            >
              <span>{t("hero.cta.donate")}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/transparencia"
              className="inline-flex items-center gap-2 border border-line px-5 py-3 rounded-full font-medium hover:bg-paper-sunken transition"
            >
              <LineChart className="w-4 h-4" />
              <span>{t("hero.cta.transparency")}</span>
            </Link>
          </div>

          <div className="mt-16">
            <StatStrip>
              <StatCell
                label={t("stat.raised")}
                value={fmtCop(kpis.raisedCents)}
                sub={<span className="tabular">≈ USD ${usdEquivalent.toLocaleString()}</span>}
              />
              <StatCell label={t("stat.businesses")} value={kpis.businesses} sub={`${kpis.cities} ${t("stat.cities")}`} />
              <StatCell label={t("stat.agencies")} value={kpis.activeAgencies} sub={t("stat.verified")} />
              <StatCell label={t("stat.donors")} value={kpis.donors} sub={null} />
            </StatStrip>
          </div>
        </div>
      </section>

      {/* Flow */}
      <section className="border-t border-line bg-paper-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
          <div className="flex items-end justify-between mb-10">
            <div>
              <div className="text-xs uppercase tracking-wider text-ink-subtle mb-2">{t("flow.kicker")}</div>
              <h2 className="serif text-4xl tracking-tight">{t("flow.title")}</h2>
              <p className="text-ink-muted mt-2 max-w-xl">{t("flow.sub")}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <FlowStep n="01" title={t("flow.s1.t")} desc={t("flow.s1.d")} Icon={HandCoins} />
            <FlowStep n="02" title={t("flow.s2.t")} desc={t("flow.s2.d")} Icon={SearchCheck} />
            <FlowStep n="03" title={t("flow.s3.t")} desc={t("flow.s3.d")} Icon={GitMerge} />
            <FlowStep n="04" title={t("flow.s4.t")} desc={t("flow.s4.d")} Icon={ReceiptText} />
          </div>
        </div>
      </section>

      {/* Featured businesses */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="text-xs uppercase tracking-wider text-ink-subtle mb-2">{t("featured.kicker")}</div>
            <h2 className="serif text-4xl tracking-tight">{t("featured.title")}</h2>
          </div>
          <Link href="/negocios" className="hidden sm:inline-flex items-center gap-1 text-sm text-ink-muted hover:text-ink">
            <span>{t("featured.viewall")}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        {featured.length === 0 ? (
          <div className="text-sm text-ink-subtle">—</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {featured.map((b) => (
              <BusinessCard key={b.id} business={b} lang={lang} />
            ))}
          </div>
        )}
      </section>

      {/* Donor countries marquee */}
      <section className="border-t border-line bg-paper-subtle py-10 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-6 flex items-center justify-between">
          <div className="text-xs uppercase tracking-wider text-ink-subtle">{t("trust.label")}</div>
          <div className="text-xs text-ink-subtle">7 {t("stat.countries")}</div>
        </div>
        <div className="relative overflow-hidden">
          <div className="marquee flex gap-12 whitespace-nowrap text-ink-faint text-sm font-medium">
            {Array(2)
              .fill(["🇺🇸 Estados Unidos", "🇨🇴 Colombia", "🇪🇸 España", "🇲🇽 México", "🇨🇦 Canadá", "🇨🇱 Chile", "🇩🇪 Alemania"])
              .flat()
              .map((c, i) => (
                <span key={i}>{c}</span>
              ))}
          </div>
        </div>
      </section>

      {/* Why transparency */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="text-xs uppercase tracking-wider text-ink-subtle mb-3">{t("why.kicker")}</div>
            <h2 className="serif text-4xl tracking-tight leading-[1.1]">{t("why.title")}</h2>
            <p className="text-ink-muted mt-5 leading-relaxed">{t("why.p1")}</p>
            <ul className="mt-6 space-y-3 text-sm">
              {[t("why.b1"), t("why.b2"), t("why.b3"), t("why.b4")].map((b) => (
                <li key={b} className="flex gap-3">
                  <CheckCircle2 className="w-5 h-5 text-brand shrink-0" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-paper-subtle border border-line rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <div className="text-xs uppercase tracking-wider text-ink-subtle">{t("why.card.kicker")}</div>
              <div className="inline-flex items-center gap-1 text-xs bg-brand text-paper rounded-full px-2.5 py-0.5">
                <span className="tabular font-semibold">100%</span>
                <span>{t("why.card.note")}</span>
              </div>
            </div>
            <div className="flex items-center gap-6 flex-wrap sm:flex-nowrap">
              <svg viewBox="0 0 120 120" className="w-32 h-32 sm:w-40 sm:h-40 -rotate-90 shrink-0">
                <circle cx="60" cy="60" r="48" fill="none" className="donut-track" strokeWidth="14" />
                <circle cx="60" cy="60" r="48" fill="none" stroke="#047857" strokeWidth="14" strokeDasharray="114.60 301.59" strokeDashoffset="0" />
                <circle cx="60" cy="60" r="48" fill="none" stroke="#059669" strokeWidth="14" strokeDasharray="72.38 301.59" strokeDashoffset="-114.60" />
                <circle cx="60" cy="60" r="48" fill="none" stroke="#10B981" strokeWidth="14" strokeDasharray="54.29 301.59" strokeDashoffset="-186.98" />
                <circle cx="60" cy="60" r="48" fill="none" stroke="#34D399" strokeWidth="14" strokeDasharray="36.19 301.59" strokeDashoffset="-241.27" />
                <circle cx="60" cy="60" r="48" fill="none" stroke="#A7F3D0" strokeWidth="14" strokeDasharray="24.13 301.59" strokeDashoffset="-277.46" />
              </svg>
              <div className="flex-1 min-w-0 space-y-3 text-sm w-full">
                <LegendRow color="bg-brand" label={t("cat.marketing")} pct="38%" />
                <LegendRow color="bg-emerald-600" label={t("cat.tech")} pct="24%" />
                <LegendRow color="bg-emerald-500" label={t("cat.accounting")} pct="18%" />
                <LegendRow color="bg-emerald-400" label={t("cat.legal")} pct="12%" />
                <LegendRow color="bg-emerald-200" label={t("cat.export")} pct="8%" />
              </div>
            </div>
            <div className="mt-5 pt-4 border-t border-line text-xs text-ink-muted">{t("why.card.foot")}</div>
          </div>
        </div>
      </section>

      {/* Big CTA */}
      <section className="border-t border-line">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-24 text-center">
          <h2 className="serif text-5xl tracking-tight max-w-3xl mx-auto leading-[1.05]">{t("cta.h")}</h2>
          <p className="text-ink-muted mt-5 max-w-xl mx-auto">{t("cta.p")}</p>
          <div className="mt-8 flex justify-center gap-3 flex-wrap">
            <Link href="/donar" className="inline-flex items-center gap-2 bg-ink text-paper px-5 py-3 rounded-full font-medium hover:bg-stone-800 transition">
              <span>{t("cta.b1")}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/como-funciona" className="inline-flex items-center gap-2 border border-line px-5 py-3 rounded-full font-medium hover:bg-paper-sunken transition">
              <span>{t("cta.b2")}</span>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

function FlowStep({
  n,
  title,
  desc,
  Icon,
}: {
  n: string;
  title: string;
  desc: string;
  Icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="bg-paper border border-line rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="w-9 h-9 rounded-full bg-brand-soft text-brand-ink flex items-center justify-center font-semibold tabular">{n}</div>
        <Icon className="w-5 h-5 text-ink-faint" />
      </div>
      <div className="font-semibold">{title}</div>
      <p className="text-sm text-ink-muted mt-1">{desc}</p>
    </div>
  );
}

function LegendRow({ color, label, pct }: { color: string; label: string; pct: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-2">
        <span className={`w-2.5 h-2.5 rounded-sm ${color} shrink-0`} />
        <span>{label}</span>
      </span>
      <span className="tabular font-medium">{pct}</span>
    </div>
  );
}

import { getT } from "@/lib/i18n/server";
import { fetchAllBusinesses } from "@/lib/data/queries";
import { BusinessCard } from "@/components/business-card";

export default async function BusinessesPage() {
  const { t, lang } = await getT();
  const businesses = await fetchAllBusinesses();
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
      <div className="text-xs uppercase tracking-wider text-ink-subtle mb-2">{t("biz.kicker")}</div>
      <h1 className="serif text-5xl tracking-tight">{t("biz.title")}</h1>
      <p className="text-ink-muted mt-3 max-w-2xl">{t("biz.sub")}</p>

      <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {businesses.map((b) => (
          <BusinessCard key={b.id} business={b} lang={lang} />
        ))}
      </div>

      {businesses.length === 0 && (
        <div className="mt-10 text-sm text-ink-subtle">
          {lang === "es" ? "Aún no hay negocios financiados." : "No funded businesses yet."}
        </div>
      )}
    </div>
  );
}

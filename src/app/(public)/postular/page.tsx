import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { getT } from "@/lib/i18n/server";
import { PostulateForm } from "@/components/postulate-form";

export default async function PostularPage() {
  const { t } = await getT();
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 lg:gap-10">
        <div>
          <Link
            href="/postulados"
            className="inline-flex items-center gap-1 text-sm text-ink-muted hover:text-ink mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t("postular.back")}</span>
          </Link>
          <div className="text-xs uppercase tracking-wider text-ink-subtle mb-2">
            {t("postular.kicker")}
          </div>
          <h1 className="serif text-4xl sm:text-5xl tracking-tight leading-[1.05]">
            {t("postular.title")}
          </h1>
          <p className="text-ink-muted mt-3">{t("postular.sub")}</p>

          <PostulateForm />
        </div>

        <aside className="lg:sticky lg:top-24 h-fit">
          <div className="bg-paper-subtle border border-line rounded-2xl p-5">
            <div className="text-xs uppercase tracking-wider text-ink-subtle mb-3">
              {t("postular.sr.t")}
            </div>
            <ol className="space-y-3 text-sm">
              <SrItem n="1" text={t("postular.sr.s1")} />
              <SrItem n="2" text={t("postular.sr.s2")} />
              <SrItem n="3" text={t("postular.sr.s3")} />
              <SrItem n="4" text={t("postular.sr.s4")} />
            </ol>
          </div>
          <div className="mt-4 bg-paper border border-line rounded-2xl p-4 text-xs text-ink-muted">
            <ShieldCheck className="w-4 h-4 text-brand inline -mt-0.5 mr-1" />
            {t("postular.sr.priv")}
          </div>
        </aside>
      </div>
    </div>
  );
}

function SrItem({ n, text }: { n: string; text: string }) {
  return (
    <li className="flex gap-3">
      <span className="serif text-brand tabular shrink-0 w-5">{n}</span>
      <span>{text}</span>
    </li>
  );
}

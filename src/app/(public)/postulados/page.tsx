import Link from "next/link";
import { Plus, ShieldCheck } from "lucide-react";
import { getT } from "@/lib/i18n/server";
import { fetchPostulados } from "@/lib/data/queries";
import { PostuladoCard } from "@/components/postulado-card";

export default async function PostuladosPage() {
  const { t, lang } = await getT();
  const postulados = await fetchPostulados({ sort: "votes" });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <div className="text-xs uppercase tracking-wider text-ink-subtle mb-2">
            {t("post.kicker")}
          </div>
          <h1 className="serif text-4xl sm:text-5xl tracking-tight leading-[1.05]">
            {t("post.title")}
          </h1>
          <p className="text-ink-muted mt-3 max-w-2xl">{t("post.sub")}</p>
        </div>
        <Link
          href="/postular"
          className="inline-flex items-center gap-2 bg-ink text-paper px-4 py-2.5 rounded-full text-sm font-medium hover:bg-stone-800"
        >
          <Plus className="w-4 h-4" />
          <span>{t("post.cta")}</span>
        </Link>
      </div>

      <div className="mt-8 bg-paper-subtle border border-line rounded-2xl p-5 flex items-start gap-4">
        <div className="w-9 h-9 rounded-lg bg-paper border border-line flex items-center justify-center shrink-0">
          <ShieldCheck className="w-4 h-4 text-brand" />
        </div>
        <div className="text-sm">
          <div className="font-medium">{t("post.howvote.t")}</div>
          <p className="text-ink-muted mt-1">{t("post.howvote.p")}</p>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {postulados.map((p) => (
          <PostuladoCard key={p.id} postulado={p} lang={lang} initialVotes={p.votesCount} />
        ))}
      </div>

      {postulados.length === 0 && (
        <div className="mt-10 text-sm text-ink-subtle">{t("post.empty")}</div>
      )}
    </div>
  );
}

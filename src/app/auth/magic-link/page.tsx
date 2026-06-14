import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getT } from "@/lib/i18n/server";
import { MagicLinkForm } from "@/components/magic-link-form";

export default async function MagicLinkPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const sp = await searchParams;
  const { t } = await getT();
  const next = sp.next ?? "/portal/donante";
  return (
    <div className="max-w-md mx-auto px-4 sm:px-6 py-16 sm:py-20">
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-ink-muted hover:text-ink mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>{t("login.back")}</span>
      </Link>
      <MagicLinkForm next={next} />
    </div>
  );
}

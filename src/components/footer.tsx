"use client";

import Link from "next/link";
import { useT } from "@/lib/i18n/context";

export function Footer() {
  const { t } = useT();
  return (
    <footer className="border-t border-line bg-paper-subtle mt-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 text-sm">
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-md bg-ink text-paper flex items-center justify-center">
                <span className="serif text-lg leading-none">t</span>
              </div>
              <span className="font-semibold">telos</span>
            </div>
            <p className="text-ink-muted leading-relaxed max-w-xs">{t("ft.about")}</p>
            <div className="mt-4 text-xs text-ink-subtle space-y-0.5">
              <div>{t("ft.pilot")}</div>
              <div>{t("ft.manual")}</div>
            </div>
          </div>
          <div>
            <div className="font-medium mb-3">{t("ft.about.t")}</div>
            <ul className="space-y-2 text-ink-muted">
              <li>
                <Link href="/como-funciona" className="hover:text-ink">
                  {t("nav.how")}
                </Link>
              </li>
              <li>
                <Link href="/transparencia" className="hover:text-ink">
                  {t("nav.transparency")}
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <div className="font-medium mb-3">{t("ft.act")}</div>
            <ul className="space-y-2 text-ink-muted">
              <li>
                <Link href="/donar" className="hover:text-ink">
                  {t("nav.donate")}
                </Link>
              </li>
              <li>
                <Link href="/postular" className="hover:text-ink">
                  {t("ft.bebiz")}
                </Link>
              </li>
              <li>
                <Link href="/portal/agencia" className="hover:text-ink">
                  {t("ft.beagency")}
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <div className="font-medium mb-3">{t("ft.contact")}</div>
            <ul className="space-y-2 text-ink-muted">
              <li>hola@telos.foundation</li>
              <li>Bogotá · Medellín</li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-6 border-t border-line flex flex-wrap items-center justify-between gap-3 text-xs text-ink-subtle">
          <div>© 2026 Fundación Telos · {t("ft.rights")}</div>
          <div className="flex gap-5">
            <span className="hover:text-ink cursor-pointer">{t("ft.privacy")}</span>
            <span className="hover:text-ink cursor-pointer">{t("ft.terms")}</span>
            <span className="hover:text-ink cursor-pointer">{t("ft.code")}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

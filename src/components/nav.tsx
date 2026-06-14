"use client";

import Link from "next/link";
import { useState } from "react";
import {
  HeartHandshake,
  Menu,
  X,
  UserRound,
  ChevronDown,
  HandCoins,
  Briefcase,
  ShieldCheck,
} from "lucide-react";
import { useT } from "@/lib/i18n/context";
import { LanguageSwitcher } from "./language-switcher";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/como-funciona", key: "nav.how" },
  { href: "/transparencia", key: "nav.transparency" },
  { href: "/negocios", key: "nav.businesses" },
  { href: "/postulados", key: "nav.postulados" },
  { href: "/agencias", key: "nav.agencies" },
];

export function Nav() {
  const { t } = useT();
  const [menuOpen, setMenuOpen] = useState(false);
  const [portalOpen, setPortalOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-paper/85 backdrop-blur border-b border-line">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-7 h-7 rounded-md bg-ink text-paper flex items-center justify-center">
            <span className="serif text-lg leading-none">t</span>
          </div>
          <span className="font-semibold tracking-tight text-[15px]">telos</span>
          <span className="text-ink-faint text-xs hidden sm:inline">· fundación</span>
        </Link>

        <nav className="hidden md:flex items-center gap-7 text-sm text-ink-muted">
          {navLinks.map((l) => (
            <Link key={l.href} href={l.href} className="hover:text-ink transition">
              {t(l.key)}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <div className="hidden lg:flex items-center relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setPortalOpen((s) => !s);
              }}
              className="flex items-center gap-1 text-xs text-ink-subtle border border-line rounded-full px-2 py-1 hover:text-ink"
            >
              <UserRound className="w-3.5 h-3.5" />
              <span>{t("nav.portals")}</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
            {portalOpen && (
              <div
                className="absolute right-0 top-full mt-2 bg-paper border border-line rounded-xl shadow-lg w-56 p-1.5 text-sm"
                onClick={(e) => e.stopPropagation()}
              >
                <PortalLink href="/portal/donante" icon={<HandCoins className="w-4 h-4 text-ink-muted" />} label={t("nav.portal.donor")} />
                <PortalLink href="/portal/agencia" icon={<Briefcase className="w-4 h-4 text-ink-muted" />} label={t("nav.portal.agency")} />
                <PortalLink href="/admin" icon={<ShieldCheck className="w-4 h-4 text-ink-muted" />} label={t("nav.portal.admin")} />
              </div>
            )}
          </div>
          <Link
            href="/donar"
            className="inline-flex items-center gap-1.5 bg-ink text-paper text-sm font-medium px-3 sm:px-3.5 py-2 rounded-full hover:bg-stone-800 transition"
          >
            <HeartHandshake className="w-4 h-4" />
            <span>{t("nav.donate")}</span>
          </Link>
          <button
            onClick={() => setMenuOpen((s) => !s)}
            className="md:hidden p-2 -mr-2 text-ink-muted hover:text-ink"
            aria-label="Menu"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-line bg-paper">
          <nav className="px-4 py-3 space-y-0.5 text-sm">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setMenuOpen(false)}
                className="block px-3 py-2.5 rounded-lg hover:bg-paper-sunken"
              >
                {t(l.key)}
              </Link>
            ))}
            <div className="border-t border-line my-2" />
            <div className="text-[10px] uppercase tracking-wider text-ink-subtle px-3 py-1.5">
              {t("nav.portals")}
            </div>
            <PortalLink href="/portal/donante" icon={<HandCoins className="w-4 h-4 text-ink-muted" />} label={t("nav.portal.donor")} onClick={() => setMenuOpen(false)} />
            <PortalLink href="/portal/agencia" icon={<Briefcase className="w-4 h-4 text-ink-muted" />} label={t("nav.portal.agency")} onClick={() => setMenuOpen(false)} />
            <PortalLink href="/admin" icon={<ShieldCheck className="w-4 h-4 text-ink-muted" />} label={t("nav.portal.admin")} onClick={() => setMenuOpen(false)} />
          </nav>
        </div>
      )}
    </header>
  );
}

function PortalLink({
  href,
  icon,
  label,
  onClick,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn("flex items-center gap-2 px-3 py-2.5 rounded-lg hover:bg-paper-sunken")}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}

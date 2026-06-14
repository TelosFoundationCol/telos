"use client";

import { useT } from "@/lib/i18n/context";

export function LogoutButton() {
  const { t } = useT();
  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  }
  return (
    <button onClick={logout} className="text-ink-subtle hover:text-ink underline normal-case tracking-normal">
      {t("dp.logout")}
    </button>
  );
}

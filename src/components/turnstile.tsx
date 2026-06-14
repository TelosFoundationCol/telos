"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { publicEnv } from "@/lib/env";
import { useT } from "@/lib/i18n/context";

declare global {
  interface Window {
    turnstile?: {
      render: (
        el: HTMLElement,
        opts: {
          sitekey: string;
          callback: (token: string) => void;
          "error-callback"?: () => void;
          "expired-callback"?: () => void;
          theme?: "light" | "dark" | "auto";
        },
      ) => string;
      remove: (widgetId: string) => void;
      reset: (widgetId: string) => void;
    };
  }
}

const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js";
let scriptPromise: Promise<void> | null = null;

function loadScript() {
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise<void>((resolve, reject) => {
    if (typeof window === "undefined") return resolve();
    if (window.turnstile) return resolve();
    const s = document.createElement("script");
    s.src = SCRIPT_SRC;
    s.async = true;
    s.defer = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("turnstile-script-failed"));
    document.head.appendChild(s);
  });
  return scriptPromise;
}

export function TurnstileGate({
  onVerified,
  onClose,
}: {
  onVerified: (token: string) => void;
  onClose?: () => void;
}) {
  const { t } = useT();
  const hostRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [errored, setErrored] = useState(false);

  useEffect(() => {
    let cancelled = false;
    loadScript()
      .then(() => {
        if (cancelled || !hostRef.current || !window.turnstile) return;
        widgetIdRef.current = window.turnstile.render(hostRef.current, {
          sitekey: publicEnv.turnstileSiteKey || "1x00000000000000000000AA", // CF test key fallback
          callback: (token) => onVerified(token),
          "error-callback": () => setErrored(true),
          theme: "light",
        });
      })
      .catch(() => setErrored(true));
    return () => {
      cancelled = true;
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div className="bg-paper rounded-2xl max-w-sm w-full p-6 shadow-xl">
        <div className="flex items-center justify-between mb-1">
          <div className="font-semibold">{t("ts.title")}</div>
          <button onClick={onClose} className="text-ink-faint hover:text-ink">
            <X className="w-4 h-4" />
          </button>
        </div>
        <p className="text-sm text-ink-muted">{t("ts.sub")}</p>
        <div className="mt-4 border border-line rounded-xl p-3 flex justify-center min-h-[80px]">
          <div ref={hostRef} />
        </div>
        {errored && (
          <p className="mt-3 text-xs text-rose-600">{t("common.error")}</p>
        )}
        <div className="mt-4 text-xs text-ink-subtle">{t("ts.privacy")}</div>
      </div>
    </div>
  );
}

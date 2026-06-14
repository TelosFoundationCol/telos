import type { Metadata } from "next";
import { LangProvider } from "@/lib/i18n/context";
import { getLang } from "@/lib/i18n/server";
import "./globals.css";

export const metadata: Metadata = {
  title: "Telos — Capital con propósito",
  description:
    "Fundación dedicada a impulsar pequeños negocios en Colombia con servicios profesionales financiados por donantes globales.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  openGraph: {
    title: "Telos — Capital con propósito",
    description:
      "Conectamos donantes con agencias verificadas que entregan servicios a pequeños negocios. Cada peso es trazable.",
    url: "/",
    siteName: "Telos",
    locale: "es_CO",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Telos — Capital con propósito",
    description:
      "Conectamos donantes con agencias verificadas que entregan servicios a pequeños negocios. Cada peso es trazable.",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const lang = await getLang();
  return (
    <html lang={lang}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Instrument+Serif&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <LangProvider initialLang={lang}>{children}</LangProvider>
      </body>
    </html>
  );
}

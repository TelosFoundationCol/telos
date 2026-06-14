import { Button, Heading, Text } from "@react-email/components";
import { TelosEmail } from "./_layout";

export default function MagicLinkEmail({
  url = "https://telos.foundation/auth/verify?token=demo",
  lang = "es" as "es" | "en",
}: {
  url?: string;
  lang?: "es" | "en";
}) {
  const t = lang === "en" ? en : es;
  return (
    <TelosEmail preview={t.preview}>
      <Heading style={{ fontSize: 24, margin: "0 0 12px 0", letterSpacing: "-0.02em" }}>
        {t.heading}
      </Heading>
      <Text style={{ color: "#57534e", margin: "0 0 24px 0", lineHeight: 1.5 }}>
        {t.body}
      </Text>
      <Button
        href={url}
        style={{
          backgroundColor: "#0c0a09",
          color: "#ffffff",
          padding: "12px 20px",
          borderRadius: 999,
          fontWeight: 500,
          textDecoration: "none",
        }}
      >
        {t.cta}
      </Button>
      <Text style={{ fontSize: 12, color: "#78716c", margin: "24px 0 0 0" }}>
        {t.expiry}
      </Text>
      <Text style={{ fontSize: 12, color: "#a8a29e", margin: "12px 0 0 0", wordBreak: "break-all" }}>
        {t.fallback}
        <br />
        {url}
      </Text>
    </TelosEmail>
  );
}

const es = {
  preview: "Tu link mágico para entrar al portal Telos.",
  heading: "Tu link mágico está listo.",
  body: "Haz clic en el botón para entrar a tu portal de donante. No necesitas contraseña — Telos verifica que eres tú porque el link llegó a tu email.",
  cta: "Abrir mi portal",
  expiry: "Este link expira en 15 minutos. Si no funciona, pide uno nuevo.",
  fallback: "Si el botón no funciona, copia esta URL en tu navegador:",
};

const en = {
  preview: "Your magic link to sign in to Telos.",
  heading: "Your magic link is ready.",
  body: "Click the button to access your donor portal. No password needed — Telos verifies it's you because the link arrived at your email.",
  cta: "Open my portal",
  expiry: "This link expires in 15 minutes. Request a new one if it doesn't work.",
  fallback: "If the button doesn't work, copy this URL into your browser:",
};

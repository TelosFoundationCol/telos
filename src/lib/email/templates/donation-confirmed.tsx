import { Button, Heading, Section, Text } from "@react-email/components";
import { TelosEmail } from "./_layout";

export default function DonationConfirmedEmail({
  reference = "TX-2026-784100",
  amount = "USD $100",
  donorName,
  ledgerUrl = "https://telos.foundation/transparencia",
}: {
  reference?: string;
  amount?: string;
  donorName?: string;
  ledgerUrl?: string;
}) {
  return (
    <TelosEmail preview="Tu aporte está validado y publicado en el libro mayor.">
      <Heading style={{ fontSize: 24, margin: "0 0 12px 0", letterSpacing: "-0.02em" }}>
        {donorName ? `${donorName}, ` : ""}tu aporte está validado.
      </Heading>
      <Text style={{ color: "#57534e", margin: "0 0 24px 0", lineHeight: 1.5 }}>
        Confirmamos {amount} en nuestra cuenta. Tu aporte ya está publicado en
        el libro mayor con trazabilidad completa.
      </Text>
      <Section
        style={{
          backgroundColor: "#ecfdf5",
          border: "1px solid #a7f3d0",
          borderRadius: 12,
          padding: 16,
          marginBottom: 24,
        }}
      >
        <Text style={{ fontSize: 12, color: "#064e3b", margin: 0 }}>REFERENCIA</Text>
        <Text
          style={{
            fontFamily: "ui-monospace, SFMono-Regular, monospace",
            fontSize: 16,
            margin: "4px 0 0 0",
            color: "#064e3b",
          }}
        >
          {reference}
        </Text>
      </Section>
      <Button
        href={ledgerUrl}
        style={{
          backgroundColor: "#0c0a09",
          color: "#ffffff",
          padding: "12px 20px",
          borderRadius: 999,
          fontWeight: 500,
          textDecoration: "none",
        }}
      >
        Ver mi aporte en el libro mayor
      </Button>
    </TelosEmail>
  );
}

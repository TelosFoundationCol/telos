import { Heading, Section, Text } from "@react-email/components";
import { TelosEmail } from "./_layout";

export default function DonationReceivedEmail({
  reference = "TX-2026-784100",
  amount = "USD $100",
  donorName,
}: {
  reference?: string;
  amount?: string;
  donorName?: string;
}) {
  return (
    <TelosEmail preview="Recibimos tu comprobante. Validaremos en 24–48h.">
      <Heading style={{ fontSize: 24, margin: "0 0 12px 0", letterSpacing: "-0.02em" }}>
        {donorName ? `Hola ${donorName}, ` : ""}recibimos tu comprobante.
      </Heading>
      <Text style={{ color: "#57534e", margin: "0 0 24px 0", lineHeight: 1.5 }}>
        Validaremos tu aporte contra el banco en las próximas 24–48 horas y te
        notificaremos cuando aparezca confirmado en el libro mayor público.
      </Text>
      <Section
        style={{
          backgroundColor: "#fafaf9",
          border: "1px solid #e7e5e4",
          borderRadius: 12,
          padding: 16,
          marginBottom: 16,
        }}
      >
        <Text style={{ fontSize: 12, color: "#78716c", margin: 0 }}>
          REFERENCIA
        </Text>
        <Text
          style={{
            fontFamily: "ui-monospace, SFMono-Regular, monospace",
            fontSize: 16,
            margin: "4px 0 12px 0",
          }}
        >
          {reference}
        </Text>
        <Text style={{ fontSize: 12, color: "#78716c", margin: 0 }}>MONTO</Text>
        <Text style={{ fontSize: 16, margin: "4px 0 0 0" }}>{amount}</Text>
      </Section>
      <Text style={{ fontSize: 14, color: "#57534e", margin: 0 }}>
        En esta fase piloto no emitimos certificados con beneficio tributario.
        Gracias por tu confianza — vamos a poner cada peso a trabajar.
      </Text>
    </TelosEmail>
  );
}

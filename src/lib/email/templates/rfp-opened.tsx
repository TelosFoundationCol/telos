import { Button, Heading, Section, Text } from "@react-email/components";
import { TelosEmail } from "./_layout";

export default function RfpOpenedEmail({
  agencyName = "Marca Viva",
  smbName = "Pescadería Buenaventura",
  smbCity = "Tumaco, Nariño",
  need = "Branding + redes sociales",
  budget = "COP 2.5M – 4.0M",
  deadlineDays = 7,
  rfpUrl = "https://telos.foundation/portal/agencia",
}: {
  agencyName?: string;
  smbName?: string;
  smbCity?: string;
  need?: string;
  budget?: string;
  deadlineDays?: number;
  rfpUrl?: string;
}) {
  return (
    <TelosEmail preview={`Nuevo RFP abierto: ${smbName}`}>
      <Heading style={{ fontSize: 22, margin: "0 0 8px 0", letterSpacing: "-0.02em" }}>
        Nuevo RFP abierto para {agencyName}
      </Heading>
      <Text style={{ color: "#57534e", margin: "0 0 24px 0", lineHeight: 1.5 }}>
        Un negocio aprobado por Telos está buscando agencia. Tu categoría
        aplica. Si quieres postular, sube tu propuesta antes del deadline.
      </Text>
      <Section
        style={{
          backgroundColor: "#fafaf9",
          border: "1px solid #e7e5e4",
          borderRadius: 12,
          padding: 16,
          marginBottom: 24,
        }}
      >
        <Text style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>{smbName}</Text>
        <Text style={{ fontSize: 13, color: "#78716c", margin: "4px 0 12px 0" }}>
          {smbCity}
        </Text>
        <Text style={{ fontSize: 14, color: "#0c0a09", margin: "0 0 8px 0" }}>
          <strong>Necesita:</strong> {need}
        </Text>
        <Text style={{ fontSize: 14, color: "#0c0a09", margin: "0 0 8px 0" }}>
          <strong>Presupuesto:</strong> {budget}
        </Text>
        <Text style={{ fontSize: 14, color: "#0c0a09", margin: 0 }}>
          <strong>Deadline:</strong> {deadlineDays} días
        </Text>
      </Section>
      <Button
        href={rfpUrl}
        style={{
          backgroundColor: "#0c0a09",
          color: "#ffffff",
          padding: "12px 20px",
          borderRadius: 999,
          fontWeight: 500,
          textDecoration: "none",
        }}
      >
        Ver el RFP y postular
      </Button>
      <Text style={{ fontSize: 12, color: "#78716c", margin: "24px 0 0 0" }}>
        Este email se envió a todas las agencias vetadas en las categorías del
        RFP. No es invitación a dedo — la postulación es abierta.
      </Text>
    </TelosEmail>
  );
}

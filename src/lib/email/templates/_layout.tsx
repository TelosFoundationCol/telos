import {
  Body,
  Container,
  Head,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import type { ReactNode } from "react";

export function TelosEmail({
  preview,
  children,
}: {
  preview: string;
  children: ReactNode;
}) {
  return (
    <Html lang="es">
      <Head />
      <Preview>{preview}</Preview>
      <Body
        style={{
          backgroundColor: "#fafaf9",
          fontFamily:
            "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
          margin: 0,
          padding: "32px 0",
          color: "#0c0a09",
        }}
      >
        <Container
          style={{
            maxWidth: 560,
            margin: "0 auto",
            backgroundColor: "#ffffff",
            border: "1px solid #e7e5e4",
            borderRadius: 16,
            padding: 32,
          }}
        >
          <Section style={{ marginBottom: 24 }}>
            <Text
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: "#0c0a09",
                margin: 0,
                letterSpacing: "-0.01em",
              }}
            >
              telos
            </Text>
          </Section>
          {children}
          <Section
            style={{
              marginTop: 32,
              paddingTop: 16,
              borderTop: "1px solid #e7e5e4",
            }}
          >
            <Text style={{ fontSize: 12, color: "#78716c", margin: 0 }}>
              Fundación Telos · Bogotá / Medellín · Colombia
            </Text>
            <Text style={{ fontSize: 12, color: "#a8a29e", margin: "4px 0 0 0" }}>
              Si recibiste este email por error, simplemente ignóralo.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

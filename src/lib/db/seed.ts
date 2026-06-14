import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { eq, sql } from "drizzle-orm";
import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

const conn = neon(process.env.DATABASE_URL);
const db = drizzle(conn, { schema });

function cents(cop: number) {
  return cop * 100; // 1 COP = 100 cents (cents abstraction; you may keep it whole-peso for COP)
}

async function main() {
  console.log("Seeding…");

  // Wipe (safe for dev; never run on prod data)
  await db.execute(sql`TRUNCATE TABLE
    ledger, disbursements, donations, proposals, rfps,
    postulado_votes, businesses, postulados, agencies,
    magic_link_tokens, users, rate_limit_buckets
    RESTART IDENTITY CASCADE`);

  // ── Agencies ────────────────────────────────────────────────────────
  const [marcaViva, cifrasClaras, pixelNorte, legalCo, comercioGlobal] = await db
    .insert(schema.agencies)
    .values([
      {
        name: "Marca Viva",
        category: "marketing",
        city: "Medellín",
        leadName: "Camila Restrepo",
        contactEmail: "hola@marcaviva.co",
        blurbEs:
          "Estudio de branding y marketing digital con 12 años de experiencia con pymes regionales.",
        blurbEn: "Branding and digital marketing studio with 12 years working with regional SMBs.",
        certificationsEs: "Google Partner, MAA Colombia",
        certificationsEn: "Google Partner, MAA Colombia",
        teamSize: 8,
        csat: 48,
        projectsCompleted: 23,
        status: "active",
        verifiedAt: new Date(),
      },
      {
        name: "Cifras Claras",
        category: "accounting",
        city: "Bogotá",
        leadName: "Jorge Patiño",
        contactEmail: "contacto@cifrasclaras.co",
        blurbEs:
          "Firma de contabilidad enfocada en microempresas. Especialistas en formalización tributaria.",
        blurbEn:
          "Accounting firm focused on microbusinesses. Specialists in tax formalization.",
        certificationsEs: "JCC · Contadores titulados",
        certificationsEn: "JCC · Certified accountants",
        teamSize: 6,
        csat: 49,
        projectsCompleted: 18,
        status: "active",
        verifiedAt: new Date(),
      },
      {
        name: "Pixel Norte",
        category: "tech",
        city: "Cali",
        leadName: "Valentina Ríos",
        contactEmail: "hola@pixelnorte.co",
        blurbEs:
          "Equipo de desarrollo web especializado en e-commerce para negocios artesanales.",
        blurbEn:
          "Web dev team specializing in e-commerce for artisanal businesses.",
        certificationsEs: "Shopify Partner, AWS Cloud Practitioner",
        certificationsEn: "Shopify Partner, AWS Cloud Practitioner",
        teamSize: 5,
        csat: 46,
        projectsCompleted: 14,
        status: "active",
        verifiedAt: new Date(),
      },
      {
        name: "Legal & Co",
        category: "legal",
        city: "Bogotá",
        leadName: "Mauricio Vargas",
        contactEmail: "contacto@legalandco.co",
        blurbEs: "Boutique legal para formalización empresarial y compliance básico.",
        blurbEn: "Boutique law firm for business formalization and basic compliance.",
        certificationsEs: "Bar Bogotá · Tarjeta profesional",
        certificationsEn: "Bogotá Bar · Professional license",
        teamSize: 4,
        csat: 50,
        projectsCompleted: 9,
        status: "active",
        verifiedAt: new Date(),
      },
      {
        name: "Comercio Global",
        category: "export",
        city: "Barranquilla",
        leadName: "Andrea Bermúdez",
        contactEmail: "hola@comercioglobal.co",
        blurbEs:
          "Consultora de comercio exterior con red de compradores en EE.UU., Europa y México.",
        blurbEn: "Foreign trade consultancy with buyer network in US, Europe and Mexico.",
        certificationsEs: "ProColombia · Exportador autorizado",
        certificationsEn: "ProColombia · Authorized exporter",
        teamSize: 3,
        csat: 47,
        projectsCompleted: 5,
        status: "active",
        verifiedAt: new Date(),
      },
    ])
    .returning();

  // ── Postulados ──────────────────────────────────────────────────────
  const postuladoRows = await db
    .insert(schema.postulados)
    .values([
      {
        name: "Pescadería Buenaventura",
        city: "Tumaco, Nariño",
        address: "Muelle El Pueblo, sector pescador",
        yearsOperating: 7,
        category: "marketing",
        emoji: "🐟",
        storyEs:
          "Cooperativa de pescadores artesanales del Pacífico. Quieren venderle directo a restaurantes en Cali y Medellín, sin intermediarios.",
        storyEn:
          "Artisanal fishermen cooperative from the Pacific. They want to sell directly to restaurants in Cali and Medellín, skipping middlemen.",
        needEs: "Branding + redes sociales para venta directa a restaurantes",
        needEn: "Branding + social media for direct restaurant sales",
        youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        postulantName: "María Lozano",
        postulantEmail: "maria@ejemplo.co",
        postulantRelation: "customer",
        status: "approved",
        votesCount: 147,
        approvedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
      },
      {
        name: "Heladería La Frontera",
        city: "Pasto, Nariño",
        address: "Carrera 24 #18-32, centro",
        yearsOperating: 6,
        category: "marketing",
        emoji: "🍦",
        storyEs:
          "Pequeña heladería con sabores andinos (mortiño, arrayán). El dueño tiene 60 recetas pero no logra contar la historia.",
        storyEn:
          "Small ice cream shop with Andean flavors (mortiño, arrayán). The owner has 60 recipes but struggles to tell the story.",
        needEs: "Marketing digital + diseño de menú",
        needEn: "Digital marketing + menu design",
        youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        postulantName: "Laura Cabrera",
        postulantEmail: "laura@ejemplo.co",
        postulantRelation: "friend",
        status: "approved",
        votesCount: 128,
        approvedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
      },
      {
        name: "Carpintería Hermanos López",
        city: "Manizales, Caldas",
        address: "Calle 50 #21-04",
        yearsOperating: 22,
        category: "tech",
        emoji: "🪵",
        storyEs:
          "Dos hermanos artesanos, tercera generación de carpinteros. Trabajan con maderas locales certificadas.",
        storyEn:
          "Two artisan brothers, third-generation carpenters. They work with certified local woods.",
        needEs: "Tienda online de muebles a medida",
        needEn: "Custom furniture online store",
        postulantName: "Carlos López",
        postulantEmail: "carlos@ejemplo.co",
        postulantRelation: "family",
        status: "approved",
        votesCount: 94,
        approvedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
      },
      {
        name: "Mototaller Cumbal",
        city: "Ipiales, Nariño",
        address: "Vía Cumbal Km 3",
        yearsOperating: 14,
        category: "legal",
        emoji: "🏍️",
        storyEs:
          "Taller en la frontera con Ecuador. Don Mauricio repara motos hace 14 años pero no puede facturar formal.",
        storyEn:
          "Border workshop with Ecuador. Don Mauricio has repaired bikes for 14 years but cannot invoice formally.",
        needEs: "Formalización y registro mercantil",
        needEn: "Legal formalization & business registry",
        postulantName: "Jorge Andrade",
        postulantEmail: "jorge@ejemplo.co",
        postulantRelation: "customer",
        status: "funded",
        votesCount: 71,
        approvedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14),
      },
      {
        name: "Restaurante El Mirador",
        city: "Pereira, Risaralda",
        address: "Vía a Cerritos Km 5",
        yearsOperating: 9,
        category: "accounting",
        emoji: "🍛",
        storyEs:
          "Restaurante familiar en zona cafetera, especialidad bandeja paisa. Crece rápido pero no sabe sus márgenes reales.",
        storyEn:
          "Family restaurant in coffee country, specialty in bandeja paisa. Growing fast but unaware of real margins.",
        needEs: "Contabilidad y control de costos",
        needEn: "Accounting & cost control",
        youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        postulantName: "Diego Salazar",
        postulantEmail: "diego@ejemplo.co",
        postulantRelation: "owner",
        status: "approved",
        votesCount: 58,
        approvedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 11),
      },
      {
        name: "Lavandería Mi Manantial",
        city: "Tunja, Boyacá",
        address: "Carrera 9 #21-33",
        yearsOperating: 6,
        category: "marketing",
        emoji: "🧺",
        storyEs:
          "Doña Ana lleva 6 años con su lavandería de barrio. Quiere capturar el mercado de Airbnbs cercanos.",
        storyEn:
          "Doña Ana has run her neighborhood laundromat for 6 years. She wants to capture the nearby Airbnb market.",
        needEs: "Identidad visual + presencia en Google",
        needEn: "Visual identity + Google presence",
        postulantName: "Patricia Rojas",
        postulantEmail: "patricia@ejemplo.co",
        postulantRelation: "friend",
        status: "pending_review",
        votesCount: 42,
      },
      {
        name: "Vivero Tropical Caribe",
        city: "Santa Marta, Magdalena",
        address: "Vía Ciénaga Km 7",
        yearsOperating: 8,
        category: "export",
        emoji: "🌺",
        storyEs:
          "Cultivan orquídeas nativas con permiso ICA. Quieren exportar a EE.UU. y Europa cumpliendo CITES.",
        storyEn:
          "They grow native orchids with ICA permit. They want to export to US and Europe complying with CITES.",
        needEs: "Consultoría de exportación de orquídeas",
        needEn: "Orchid export consulting",
        youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        postulantName: "Sofía Bermúdez",
        postulantEmail: "sofia@ejemplo.co",
        postulantRelation: "owner",
        status: "pending_review",
        votesCount: 33,
      },
      {
        name: "Confitería Doña Rosa",
        city: "Cúcuta, Norte de Santander",
        address: "Avenida 5 #14-22",
        yearsOperating: 19,
        category: "marketing",
        emoji: "🍬",
        storyEs:
          "Confitería tradicional santandereana, 4 generaciones. Empaque casero les impide entrar a supermercados.",
        storyEn:
          "Traditional Santander candy shop, 4 generations. Homemade packaging keeps them out of supermarkets.",
        needEs: "Branding y empaques",
        needEn: "Branding & packaging",
        postulantName: "Ana Pérez",
        postulantEmail: "ana@ejemplo.co",
        postulantRelation: "family",
        status: "pending_review",
        votesCount: 21,
      },
    ])
    .returning();

  const pescaderia = postuladoRows.find((p) => p.name === "Pescadería Buenaventura")!;
  const carpinteria = postuladoRows.find((p) => p.name === "Carpintería Hermanos López")!;
  const mototaller = postuladoRows.find((p) => p.name === "Mototaller Cumbal")!;
  const elMirador = postuladoRows.find((p) => p.name === "Restaurante El Mirador")!;

  // ── Businesses (funded) ─────────────────────────────────────────────
  const [mototallerBiz] = await db
    .insert(schema.businesses)
    .values([
      {
        postuladoId: mototaller.id,
        name: mototaller.name,
        ownerName: "Edgar Salinas",
        city: mototaller.city,
        yearsOperating: mototaller.yearsOperating,
        category: "legal",
        emoji: "🏍️",
        storyEs: mototaller.storyEs,
        storyEn: mototaller.storyEn,
        needEs: "Formalización SAS + RUT + cámara",
        needEn: "SAS incorporation + tax ID + chamber",
        status: "completed",
        agencyId: legalCo.id,
        goalCents: 1_200_000,
        raisedCents: 1_200_000,
        donorsCount: 18,
        milestones: [
          { titleEs: "Constitución SAS", titleEn: "SAS incorporation", done: true },
          { titleEs: "RUT y cámara", titleEn: "Tax ID & chamber", done: true },
          { titleEs: "Primer contrato", titleEn: "First contract", done: true },
        ],
        completedAt: new Date(),
      },
      {
        name: "Café Origen",
        ownerName: "Andrés Quintero",
        city: "Bogotá, Cundinamarca",
        yearsOperating: 3,
        category: "accounting",
        emoji: "☕",
        storyEs:
          "Andrés tuesta café de origen con productores en el Cauca. Sus libros estaban en cuadernos; necesita orden contable para escalar.",
        storyEn:
          "Andrés roasts single-origin coffee with Cauca farmers. His books were on paper notebooks; he needs proper accounting to scale.",
        needEs: "Contabilidad y sistema POS",
        needEn: "Accounting & POS system",
        status: "completed",
        agencyId: cifrasClaras.id,
        goalCents: 4_200_000,
        raisedCents: 4_200_000,
        donorsCount: 38,
        milestones: [
          { titleEs: "Diagnóstico financiero", titleEn: "Financial diagnosis", done: true },
          { titleEs: "Implementación POS", titleEn: "POS implementation", done: true },
          { titleEs: "3 meses de soporte", titleEn: "3 months support", done: true },
        ],
        completedAt: new Date(),
      },
      {
        name: "Panadería La Esperanza",
        ownerName: "Doña María Restrepo",
        city: "Medellín, Antioquia",
        yearsOperating: 8,
        category: "marketing",
        emoji: "🥐",
        storyEs:
          "Doña María atiende su panadería desde 1996. Quiere modernizar la marca para competir con cadenas, sin perder el alma de barrio.",
        storyEn:
          "Doña María has run her bakery since 1996. She wants to refresh the brand to compete with chains without losing the neighborhood feel.",
        needEs: "Marketing digital y rediseño de marca",
        needEn: "Digital marketing & rebrand",
        status: "in_progress",
        agencyId: marcaViva.id,
        goalCents: 3_500_000,
        raisedCents: 2_100_000,
        donorsCount: 24,
        milestones: [
          { titleEs: "Auditoría de marca", titleEn: "Brand audit", done: true },
          { titleEs: "Nueva identidad visual", titleEn: "New visual identity", done: true },
          { titleEs: "Lanzamiento Instagram", titleEn: "Instagram launch", done: false },
          { titleEs: "Campaña local 30 días", titleEn: "30-day local campaign", done: false },
        ],
      },
    ])
    .returning();

  // ── RFP for Pescadería Buenaventura ─────────────────────────────────
  const [pescaderiaBiz] = await db
    .insert(schema.businesses)
    .values({
      postuladoId: pescaderia.id,
      name: pescaderia.name,
      ownerName: "Cooperativa Wikan",
      city: pescaderia.city,
      yearsOperating: pescaderia.yearsOperating,
      category: "marketing",
      emoji: "🐟",
      storyEs: pescaderia.storyEs,
      storyEn: pescaderia.storyEn,
      needEs: pescaderia.needEs,
      needEn: pescaderia.needEn,
      status: "in_rfp",
      goalCents: 3_500_000,
      raisedCents: 0,
      donorsCount: 0,
      milestones: [],
    })
    .returning();

  const [pescaderiaRfp] = await db
    .insert(schema.rfps)
    .values({
      businessId: pescaderiaBiz.id,
      categories: ["marketing"],
      status: "open",
      budgetMinCents: 2_500_000,
      budgetMaxCents: 4_000_000,
      openedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4),
      deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3),
    })
    .returning();

  await db.insert(schema.proposals).values([
    {
      rfpId: pescaderiaRfp.id,
      agencyId: marcaViva.id,
      scopeEs:
        "Auditoría de marca, identidad visual nueva, 6 meses de contenido en redes y conexión con 8 restaurantes objetivo en Cali y Medellín.",
      scopeEn:
        "Brand audit, new visual identity, 6 months of social content, intro to 8 target restaurants in Cali and Medellín.",
      costCents: 3_500_000,
      weeks: 8,
      teamSize: 3,
    },
  ]);

  // ── RFP for Carpintería Hermanos López (open, mixed categories) ─────
  const [carpinteriaBiz] = await db
    .insert(schema.businesses)
    .values({
      postuladoId: carpinteria.id,
      name: carpinteria.name,
      ownerName: "Hermanos López",
      city: carpinteria.city,
      yearsOperating: carpinteria.yearsOperating,
      category: "tech",
      emoji: "🪵",
      storyEs: carpinteria.storyEs,
      storyEn: carpinteria.storyEn,
      needEs: carpinteria.needEs,
      needEn: carpinteria.needEn,
      status: "in_rfp",
      goalCents: 5_800_000,
      raisedCents: 0,
      donorsCount: 0,
      milestones: [],
    })
    .returning();

  const [carpinteriaRfp] = await db
    .insert(schema.rfps)
    .values({
      businessId: carpinteriaBiz.id,
      categories: ["tech", "marketing"],
      status: "open",
      budgetMinCents: 4_000_000,
      budgetMaxCents: 7_000_000,
      openedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
      deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5),
    })
    .returning();

  await db.insert(schema.proposals).values({
    rfpId: carpinteriaRfp.id,
    agencyId: pixelNorte.id,
    scopeEs: "Shopify con catálogo de 30 muebles, sesión fotográfica en taller, capacitación de 2 días.",
    scopeEn: "Shopify with 30-piece catalog, on-site photo shoot, 2-day training.",
    costCents: 5_800_000,
    weeks: 6,
    teamSize: 2,
  });

  // ── RFP for El Mirador (deadline passed → review) ───────────────────
  const [miradorBiz] = await db
    .insert(schema.businesses)
    .values({
      postuladoId: elMirador.id,
      name: elMirador.name,
      ownerName: "Familia Salazar",
      city: elMirador.city,
      yearsOperating: elMirador.yearsOperating,
      category: "accounting",
      emoji: "🍛",
      storyEs: elMirador.storyEs,
      storyEn: elMirador.storyEn,
      needEs: elMirador.needEs,
      needEn: elMirador.needEn,
      status: "in_rfp",
      goalCents: 2_400_000,
      raisedCents: 0,
      donorsCount: 0,
      milestones: [],
    })
    .returning();

  const [miradorRfp] = await db
    .insert(schema.rfps)
    .values({
      businessId: miradorBiz.id,
      categories: ["accounting"],
      status: "review",
      budgetMinCents: 1_800_000,
      budgetMaxCents: 3_000_000,
      openedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10),
      deadline: new Date(Date.now() - 1000 * 60 * 60 * 24 * 0.5),
    })
    .returning();

  await db.insert(schema.proposals).values([
    {
      rfpId: miradorRfp.id,
      agencyId: cifrasClaras.id,
      scopeEs:
        "Implementación de Siigo + plan de cuentas para restaurante + 3 meses de soporte.",
      scopeEn: "Siigo setup + chart of accounts for restaurants + 3 months support.",
      costCents: 2_400_000,
      weeks: 4,
      teamSize: 2,
    },
  ]);

  // ── Donations + ledger entries ──────────────────────────────────────
  const donations = await db
    .insert(schema.donations)
    .values([
      {
        reference: "TX-2026-784100",
        donorEmail: "sarah.mitchell@example.com",
        donorName: "Sarah Mitchell",
        donorCountry: "US",
        amountCents: 100_00, // $100 USD (cents)
        currency: "USD",
        destinationKind: "general",
        status: "pending_proof",
        submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1),
      },
      {
        reference: "TX-2026-783600",
        donorEmail: "anon@example.com",
        anonymous: true,
        donorCountry: "US",
        amountCents: 250_00,
        currency: "USD",
        destinationKind: "business",
        destinationBusinessId: mototallerBiz?.id,
        status: "confirmed",
        submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
        validatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
        transferredAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
      },
    ])
    .returning();

  // ── Ledger feed entries ─────────────────────────────────────────────
  await db.insert(schema.ledger).values([
    {
      kind: "donation",
      fromName: "Sarah Mitchell (US)",
      toName: "Telos · Fondo general",
      purposeEs: "Donación · pendiente de validación",
      purposeEn: "Donation · awaiting validation",
      amountCents: 100_00,
      currency: "USD",
      referenceHash: "TX-784100",
      sourceTable: "donations",
      sourceId: donations[0].id,
      occurredAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
    },
    {
      kind: "donation",
      fromName: "Anónimo (US)",
      toName: "Telos · Mototaller Cumbal",
      purposeEs: "Donación dirigida",
      purposeEn: "Earmarked donation",
      amountCents: 250_00,
      currency: "USD",
      referenceHash: "TX-783600",
      sourceTable: "donations",
      sourceId: donations[1].id,
      occurredAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
    },
    {
      kind: "disbursement",
      fromName: "Telos",
      toName: "Legal & Co",
      purposeEs: "Pago final · Mototaller Cumbal",
      purposeEn: "Final payment · Mototaller Cumbal",
      amountCents: 1_200_000_00,
      currency: "COP",
      referenceHash: "TX-783401",
      sourceTable: "disbursements",
      occurredAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4),
    },
    {
      kind: "deliverable",
      fromName: "Legal & Co",
      toName: "Mototaller Cumbal",
      purposeEs: "Entregable: SAS constituida + RUT + cámara",
      purposeEn: "Deliverable: SAS incorporated + tax ID + chamber",
      referenceHash: "DL-001284",
      sourceTable: "disbursements",
      occurredAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4),
    },
  ]);

  // Update votes_count denormalized field (already set above)
  await db.execute(sql`
    UPDATE postulados p SET votes_count = (
      SELECT COUNT(*) FROM postulado_votes pv WHERE pv.postulado_id = p.id
    ) WHERE EXISTS (SELECT 1 FROM postulado_votes pv WHERE pv.postulado_id = p.id)
  `);

  console.log("✅ Seed complete");
  console.log(`  Agencies:    ${(await db.select().from(schema.agencies)).length}`);
  console.log(`  Postulados:  ${(await db.select().from(schema.postulados)).length}`);
  console.log(`  Businesses:  ${(await db.select().from(schema.businesses)).length}`);
  console.log(`  RFPs:        ${(await db.select().from(schema.rfps)).length}`);
  console.log(`  Proposals:   ${(await db.select().from(schema.proposals)).length}`);
  console.log(`  Donations:   ${(await db.select().from(schema.donations)).length}`);
  console.log(`  Ledger:      ${(await db.select().from(schema.ledger)).length}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

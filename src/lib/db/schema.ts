import { relations, sql } from "drizzle-orm";
import {
  bigint,
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  serial,
  smallint,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

// ─────────────────────────────────────────────────────────────────────
// Enums
// ─────────────────────────────────────────────────────────────────────

export const userRole = pgEnum("user_role", ["donor", "agency_member", "admin"]);
export const serviceCategory = pgEnum("service_category", [
  "marketing",
  "tech",
  "accounting",
  "legal",
  "export",
]);
export const postuladoStatus = pgEnum("postulado_status", [
  "pending_review",
  "approved",
  "rejected",
  "funded",
]);
export const donationStatus = pgEnum("donation_status", [
  "pending_proof",
  "confirmed",
  "rejected",
]);
export const donationCurrency = pgEnum("donation_currency", ["COP", "USD", "USDC"]);
export const donationDestinationKind = pgEnum("donation_destination_kind", [
  "general",
  "business",
  "category",
]);
export const agencyStatus = pgEnum("agency_status", [
  "pending_verification",
  "active",
  "suspended",
]);
export const businessStatus = pgEnum("business_status", [
  "in_rfp",
  "matched",
  "in_progress",
  "completed",
]);
export const rfpStatus = pgEnum("rfp_status", ["open", "review", "awarded", "cancelled"]);
export const ledgerKind = pgEnum("ledger_kind", [
  "donation",
  "disbursement",
  "deliverable",
]);

// ─────────────────────────────────────────────────────────────────────
// Users (donors, agency members, admins). Email-keyed, no password.
// ─────────────────────────────────────────────────────────────────────

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: varchar("email", { length: 255 }).notNull(),
    name: varchar("name", { length: 120 }),
    country: varchar("country", { length: 80 }),
    role: userRole("role").notNull().default("donor"),
    agencyId: uuid("agency_id"), // FK to agencies.id; nullable, set if role=agency_member
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    lastSignInAt: timestamp("last_sign_in_at", { withTimezone: true }),
  },
  (t) => ({
    emailIdx: uniqueIndex("users_email_idx").on(t.email),
  }),
);

// Magic-link auth tokens (single use, short TTL)
export const magicLinkTokens = pgTable(
  "magic_link_tokens",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    tokenHash: varchar("token_hash", { length: 128 }).notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    usedAt: timestamp("used_at", { withTimezone: true }),
    requestedIp: varchar("requested_ip", { length: 64 }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    tokenHashIdx: uniqueIndex("magic_link_token_hash_idx").on(t.tokenHash),
    userIdx: index("magic_link_user_idx").on(t.userId),
  }),
);

// ─────────────────────────────────────────────────────────────────────
// Agencies (service providers — must be formally vetted)
// ─────────────────────────────────────────────────────────────────────

export const agencies = pgTable("agencies", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 160 }).notNull(),
  category: serviceCategory("category").notNull(),
  city: varchar("city", { length: 120 }).notNull(),
  leadName: varchar("lead_name", { length: 120 }),
  contactEmail: varchar("contact_email", { length: 255 }).notNull(),
  blurbEs: text("blurb_es"),
  blurbEn: text("blurb_en"),
  certificationsEs: text("certifications_es"),
  certificationsEn: text("certifications_en"),
  teamSize: smallint("team_size").default(1),
  csat: integer("csat_x10"), // 4.8 stored as 48; null if no history yet
  projectsCompleted: integer("projects_completed").notNull().default(0),
  status: agencyStatus("status").notNull().default("pending_verification"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  verifiedAt: timestamp("verified_at", { withTimezone: true }),
});

// ─────────────────────────────────────────────────────────────────────
// Postulados (community nominations — submitted by anyone)
// Becomes a Business when approved.
// ─────────────────────────────────────────────────────────────────────

export const postulados = pgTable(
  "postulados",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 160 }).notNull(),
    city: varchar("city", { length: 120 }).notNull(),
    address: text("address"), // PRIVATE — never exposed publicly
    yearsOperating: smallint("years_operating"),
    category: serviceCategory("category").notNull(),
    storyEs: text("story_es").notNull(),
    storyEn: text("story_en"),
    needEs: text("need_es").notNull(),
    needEn: text("need_en"),
    whyEs: text("why_es"),
    whyEn: text("why_en"),
    youtubeUrl: text("youtube_url"),
    emoji: varchar("emoji", { length: 8 }).default("🌱"),

    // postulant (the person who submitted — may not be the owner)
    postulantName: varchar("postulant_name", { length: 120 }).notNull(),
    postulantEmail: varchar("postulant_email", { length: 255 }).notNull(),
    postulantRelation: varchar("postulant_relation", { length: 32 }).notNull(), // owner | family | customer | friend | other

    status: postuladoStatus("status").notNull().default("pending_review"),
    votesCount: integer("votes_count").notNull().default(0), // denormalized cache
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    approvedAt: timestamp("approved_at", { withTimezone: true }),
    rejectedAt: timestamp("rejected_at", { withTimezone: true }),
    rejectionReason: text("rejection_reason"),
  },
  (t) => ({
    statusIdx: index("postulados_status_idx").on(t.status),
    categoryIdx: index("postulados_category_idx").on(t.category),
  }),
);

// Votes (anonymous, anti-abuse via Turnstile + per-IP + per-day uniqueness)
export const postuladoVotes = pgTable(
  "postulado_votes",
  {
    id: serial("id").primaryKey(),
    postuladoId: uuid("postulado_id").notNull().references(() => postulados.id, { onDelete: "cascade" }),
    ipHash: varchar("ip_hash", { length: 64 }).notNull(), // sha256 of IP + salt
    voteDay: varchar("vote_day", { length: 10 }).notNull(), // YYYY-MM-DD
    userAgentHash: varchar("user_agent_hash", { length: 64 }),
    country: varchar("country", { length: 4 }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    uniqueDailyVote: uniqueIndex("postulado_votes_unique_daily").on(
      t.postuladoId,
      t.ipHash,
      t.voteDay,
    ),
    postuladoIdx: index("postulado_votes_postulado_idx").on(t.postuladoId),
  }),
);

// ─────────────────────────────────────────────────────────────────────
// Businesses (approved + funded SMBs receiving services)
// ─────────────────────────────────────────────────────────────────────

export const businesses = pgTable("businesses", {
  id: uuid("id").primaryKey().defaultRandom(),
  postuladoId: uuid("postulado_id").references(() => postulados.id),
  name: varchar("name", { length: 160 }).notNull(),
  ownerName: varchar("owner_name", { length: 120 }),
  city: varchar("city", { length: 120 }).notNull(),
  yearsOperating: smallint("years_operating"),
  category: serviceCategory("category").notNull(),
  emoji: varchar("emoji", { length: 8 }).default("🌱"),
  storyEs: text("story_es"),
  storyEn: text("story_en"),
  needEs: text("need_es"),
  needEn: text("need_en"),
  status: businessStatus("status").notNull().default("in_rfp"),
  agencyId: uuid("agency_id").references(() => agencies.id),
  goalCents: bigint("goal_cents", { mode: "number" }).notNull(), // in COP cents
  raisedCents: bigint("raised_cents", { mode: "number" }).notNull().default(0),
  donorsCount: integer("donors_count").notNull().default(0),
  milestones: jsonb("milestones").$type<Array<{ titleEs: string; titleEn?: string; done: boolean; doneAt?: string }>>().notNull().default(sql`'[]'::jsonb`),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  completedAt: timestamp("completed_at", { withTimezone: true }),
});

// ─────────────────────────────────────────────────────────────────────
// RFPs (open request for proposals — broadcast to all vetted agencies)
// ─────────────────────────────────────────────────────────────────────

export const rfps = pgTable("rfps", {
  id: uuid("id").primaryKey().defaultRandom(),
  businessId: uuid("business_id").notNull().references(() => businesses.id, { onDelete: "cascade" }),
  categories: jsonb("categories").$type<string[]>().notNull(), // ["marketing", "tech"] — eligible agency categories
  status: rfpStatus("status").notNull().default("open"),
  budgetMinCents: bigint("budget_min_cents", { mode: "number" }).notNull(),
  budgetMaxCents: bigint("budget_max_cents", { mode: "number" }).notNull(),
  openedAt: timestamp("opened_at", { withTimezone: true }).notNull().defaultNow(),
  deadline: timestamp("deadline", { withTimezone: true }).notNull(),
  awardedProposalId: uuid("awarded_proposal_id"),
  awardedAt: timestamp("awarded_at", { withTimezone: true }),
  notes: text("notes"),
});

export const proposals = pgTable(
  "proposals",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    rfpId: uuid("rfp_id").notNull().references(() => rfps.id, { onDelete: "cascade" }),
    agencyId: uuid("agency_id").notNull().references(() => agencies.id, { onDelete: "cascade" }),
    scopeEs: text("scope_es").notNull(),
    scopeEn: text("scope_en"),
    costCents: bigint("cost_cents", { mode: "number" }).notNull(),
    weeks: smallint("weeks").notNull(),
    teamSize: smallint("team_size").notNull(),
    submittedAt: timestamp("submitted_at", { withTimezone: true }).notNull().defaultNow(),
    withdrawnAt: timestamp("withdrawn_at", { withTimezone: true }),
  },
  (t) => ({
    rfpIdx: index("proposals_rfp_idx").on(t.rfpId),
    rfpAgencyUnique: uniqueIndex("proposals_rfp_agency_unique").on(t.rfpId, t.agencyId),
  }),
);

// ─────────────────────────────────────────────────────────────────────
// Donations (manual proof-upload model; validated by Telos team)
// ─────────────────────────────────────────────────────────────────────

export const donations = pgTable(
  "donations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    reference: varchar("reference", { length: 32 }).notNull(), // TX-2026-XXXXXX
    donorUserId: uuid("donor_user_id").references(() => users.id), // null if no account match yet
    donorEmail: varchar("donor_email", { length: 255 }).notNull(),
    donorName: varchar("donor_name", { length: 120 }),
    donorCountry: varchar("donor_country", { length: 4 }),
    anonymous: boolean("anonymous").notNull().default(false),

    amountCents: bigint("amount_cents", { mode: "number" }).notNull(),
    currency: donationCurrency("currency").notNull(),

    destinationKind: donationDestinationKind("destination_kind").notNull().default("general"),
    destinationBusinessId: uuid("destination_business_id").references(() => businesses.id),
    destinationCategory: serviceCategory("destination_category"),

    proofObjectKey: text("proof_object_key"), // R2 key for the uploaded proof file
    bankReference: varchar("bank_reference", { length: 80 }),
    transferredAt: timestamp("transferred_at", { withTimezone: true }),
    message: text("message"),

    status: donationStatus("status").notNull().default("pending_proof"),
    submittedAt: timestamp("submitted_at", { withTimezone: true }).notNull().defaultNow(),
    validatedAt: timestamp("validated_at", { withTimezone: true }),
    validatedByUserId: uuid("validated_by_user_id").references(() => users.id),
    rejectionReason: text("rejection_reason"),
  },
  (t) => ({
    referenceIdx: uniqueIndex("donations_reference_idx").on(t.reference),
    statusIdx: index("donations_status_idx").on(t.status),
    emailIdx: index("donations_email_idx").on(t.donorEmail),
  }),
);

// ─────────────────────────────────────────────────────────────────────
// Disbursements (Telos → agency, against milestones)
// ─────────────────────────────────────────────────────────────────────

export const disbursements = pgTable("disbursements", {
  id: uuid("id").primaryKey().defaultRandom(),
  businessId: uuid("business_id").notNull().references(() => businesses.id),
  agencyId: uuid("agency_id").notNull().references(() => agencies.id),
  milestoneIndex: smallint("milestone_index").notNull(),
  amountCents: bigint("amount_cents", { mode: "number" }).notNull(),
  reference: varchar("reference", { length: 32 }).notNull(),
  paidAt: timestamp("paid_at", { withTimezone: true }).notNull().defaultNow(),
  proofObjectKey: text("proof_object_key"), // deliverable uploaded by agency
  notes: text("notes"),
});

// ─────────────────────────────────────────────────────────────────────
// Public ledger view (denormalized for fast feed rendering)
// ─────────────────────────────────────────────────────────────────────

export const ledger = pgTable(
  "ledger",
  {
    id: serial("id").primaryKey(),
    kind: ledgerKind("kind").notNull(),
    fromName: varchar("from_name", { length: 200 }).notNull(),
    toName: varchar("to_name", { length: 200 }).notNull(),
    purposeEs: text("purpose_es").notNull(),
    purposeEn: text("purpose_en"),
    amountCents: bigint("amount_cents", { mode: "number" }), // null for deliverables
    currency: donationCurrency("currency"),
    referenceHash: varchar("reference_hash", { length: 32 }).notNull(), // e.g. TX-7841 or DL-1287
    sourceTable: varchar("source_table", { length: 32 }), // 'donations' | 'disbursements' | 'deliverables'
    sourceId: uuid("source_id"),
    occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    occurredIdx: index("ledger_occurred_idx").on(t.occurredAt),
    kindIdx: index("ledger_kind_idx").on(t.kind),
  }),
);

// ─────────────────────────────────────────────────────────────────────
// Rate-limiting buckets (per-IP, per-action). Cheap server-side guard.
// ─────────────────────────────────────────────────────────────────────

export const rateLimitBuckets = pgTable(
  "rate_limit_buckets",
  {
    key: varchar("key", { length: 200 }).primaryKey(), // e.g. "vote:1.2.3.4:postulado:abc"
    count: integer("count").notNull().default(0),
    windowStart: timestamp("window_start", { withTimezone: true }).notNull().defaultNow(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  },
  (t) => ({
    expiresIdx: index("rate_limit_expires_idx").on(t.expiresAt),
  }),
);

// ─────────────────────────────────────────────────────────────────────
// Relations
// ─────────────────────────────────────────────────────────────────────

export const usersRelations = relations(users, ({ one, many }) => ({
  agency: one(agencies, { fields: [users.agencyId], references: [agencies.id] }),
  donations: many(donations),
  magicLinkTokens: many(magicLinkTokens),
}));

export const magicLinkTokensRelations = relations(magicLinkTokens, ({ one }) => ({
  user: one(users, { fields: [magicLinkTokens.userId], references: [users.id] }),
}));

export const agenciesRelations = relations(agencies, ({ many }) => ({
  members: many(users),
  proposals: many(proposals),
  disbursements: many(disbursements),
  businesses: many(businesses),
}));

export const postuladosRelations = relations(postulados, ({ many }) => ({
  votes: many(postuladoVotes),
}));

export const postuladoVotesRelations = relations(postuladoVotes, ({ one }) => ({
  postulado: one(postulados, { fields: [postuladoVotes.postuladoId], references: [postulados.id] }),
}));

export const businessesRelations = relations(businesses, ({ one, many }) => ({
  postulado: one(postulados, { fields: [businesses.postuladoId], references: [postulados.id] }),
  agency: one(agencies, { fields: [businesses.agencyId], references: [agencies.id] }),
  rfps: many(rfps),
  disbursements: many(disbursements),
  donations: many(donations),
}));

export const rfpsRelations = relations(rfps, ({ one, many }) => ({
  business: one(businesses, { fields: [rfps.businessId], references: [businesses.id] }),
  proposals: many(proposals),
}));

export const proposalsRelations = relations(proposals, ({ one }) => ({
  rfp: one(rfps, { fields: [proposals.rfpId], references: [rfps.id] }),
  agency: one(agencies, { fields: [proposals.agencyId], references: [agencies.id] }),
}));

export const donationsRelations = relations(donations, ({ one }) => ({
  donor: one(users, { fields: [donations.donorUserId], references: [users.id] }),
  destinationBusiness: one(businesses, {
    fields: [donations.destinationBusinessId],
    references: [businesses.id],
  }),
}));

export const disbursementsRelations = relations(disbursements, ({ one }) => ({
  business: one(businesses, { fields: [disbursements.businessId], references: [businesses.id] }),
  agency: one(agencies, { fields: [disbursements.agencyId], references: [agencies.id] }),
}));

// ─────────────────────────────────────────────────────────────────────
// Inferred types
// ─────────────────────────────────────────────────────────────────────

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Agency = typeof agencies.$inferSelect;
export type NewAgency = typeof agencies.$inferInsert;
export type Postulado = typeof postulados.$inferSelect;
export type NewPostulado = typeof postulados.$inferInsert;
export type Business = typeof businesses.$inferSelect;
export type Rfp = typeof rfps.$inferSelect;
export type Proposal = typeof proposals.$inferSelect;
export type Donation = typeof donations.$inferSelect;
export type LedgerEntry = typeof ledger.$inferSelect;

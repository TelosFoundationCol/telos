CREATE TYPE "public"."agency_status" AS ENUM('pending_verification', 'active', 'suspended');--> statement-breakpoint
CREATE TYPE "public"."business_status" AS ENUM('in_rfp', 'matched', 'in_progress', 'completed');--> statement-breakpoint
CREATE TYPE "public"."donation_currency" AS ENUM('COP', 'USD', 'USDC');--> statement-breakpoint
CREATE TYPE "public"."donation_destination_kind" AS ENUM('general', 'business', 'category');--> statement-breakpoint
CREATE TYPE "public"."donation_status" AS ENUM('pending_proof', 'confirmed', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."ledger_kind" AS ENUM('donation', 'disbursement', 'deliverable');--> statement-breakpoint
CREATE TYPE "public"."postulado_status" AS ENUM('pending_review', 'approved', 'rejected', 'funded');--> statement-breakpoint
CREATE TYPE "public"."rfp_status" AS ENUM('open', 'review', 'awarded', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."service_category" AS ENUM('marketing', 'tech', 'accounting', 'legal', 'export');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('donor', 'agency_member', 'admin');--> statement-breakpoint
CREATE TABLE "agencies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(160) NOT NULL,
	"category" "service_category" NOT NULL,
	"city" varchar(120) NOT NULL,
	"lead_name" varchar(120),
	"contact_email" varchar(255) NOT NULL,
	"blurb_es" text,
	"blurb_en" text,
	"certifications_es" text,
	"certifications_en" text,
	"team_size" smallint DEFAULT 1,
	"csat_x10" integer,
	"projects_completed" integer DEFAULT 0 NOT NULL,
	"status" "agency_status" DEFAULT 'pending_verification' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"verified_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "businesses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"postulado_id" uuid,
	"name" varchar(160) NOT NULL,
	"owner_name" varchar(120),
	"city" varchar(120) NOT NULL,
	"years_operating" smallint,
	"category" "service_category" NOT NULL,
	"emoji" varchar(8) DEFAULT '🌱',
	"story_es" text,
	"story_en" text,
	"need_es" text,
	"need_en" text,
	"status" "business_status" DEFAULT 'in_rfp' NOT NULL,
	"agency_id" uuid,
	"goal_cents" bigint NOT NULL,
	"raised_cents" bigint DEFAULT 0 NOT NULL,
	"donors_count" integer DEFAULT 0 NOT NULL,
	"milestones" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "disbursements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid NOT NULL,
	"agency_id" uuid NOT NULL,
	"milestone_index" smallint NOT NULL,
	"amount_cents" bigint NOT NULL,
	"reference" varchar(32) NOT NULL,
	"paid_at" timestamp with time zone DEFAULT now() NOT NULL,
	"proof_object_key" text,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "donations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"reference" varchar(32) NOT NULL,
	"donor_user_id" uuid,
	"donor_email" varchar(255) NOT NULL,
	"donor_name" varchar(120),
	"donor_country" varchar(4),
	"anonymous" boolean DEFAULT false NOT NULL,
	"amount_cents" bigint NOT NULL,
	"currency" "donation_currency" NOT NULL,
	"destination_kind" "donation_destination_kind" DEFAULT 'general' NOT NULL,
	"destination_business_id" uuid,
	"destination_category" "service_category",
	"proof_object_key" text,
	"bank_reference" varchar(80),
	"transferred_at" timestamp with time zone,
	"message" text,
	"status" "donation_status" DEFAULT 'pending_proof' NOT NULL,
	"submitted_at" timestamp with time zone DEFAULT now() NOT NULL,
	"validated_at" timestamp with time zone,
	"validated_by_user_id" uuid,
	"rejection_reason" text
);
--> statement-breakpoint
CREATE TABLE "ledger" (
	"id" serial PRIMARY KEY NOT NULL,
	"kind" "ledger_kind" NOT NULL,
	"from_name" varchar(200) NOT NULL,
	"to_name" varchar(200) NOT NULL,
	"purpose_es" text NOT NULL,
	"purpose_en" text,
	"amount_cents" bigint,
	"currency" "donation_currency",
	"reference_hash" varchar(32) NOT NULL,
	"source_table" varchar(32),
	"source_id" uuid,
	"occurred_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "magic_link_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token_hash" varchar(128) NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"used_at" timestamp with time zone,
	"requested_ip" varchar(64),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "postulado_votes" (
	"id" serial PRIMARY KEY NOT NULL,
	"postulado_id" uuid NOT NULL,
	"ip_hash" varchar(64) NOT NULL,
	"vote_day" varchar(10) NOT NULL,
	"user_agent_hash" varchar(64),
	"country" varchar(4),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "postulados" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(160) NOT NULL,
	"city" varchar(120) NOT NULL,
	"address" text,
	"years_operating" smallint,
	"category" "service_category" NOT NULL,
	"story_es" text NOT NULL,
	"story_en" text,
	"need_es" text NOT NULL,
	"need_en" text,
	"why_es" text,
	"why_en" text,
	"youtube_url" text,
	"emoji" varchar(8) DEFAULT '🌱',
	"postulant_name" varchar(120) NOT NULL,
	"postulant_email" varchar(255) NOT NULL,
	"postulant_relation" varchar(32) NOT NULL,
	"status" "postulado_status" DEFAULT 'pending_review' NOT NULL,
	"votes_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"approved_at" timestamp with time zone,
	"rejected_at" timestamp with time zone,
	"rejection_reason" text
);
--> statement-breakpoint
CREATE TABLE "proposals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"rfp_id" uuid NOT NULL,
	"agency_id" uuid NOT NULL,
	"scope_es" text NOT NULL,
	"scope_en" text,
	"cost_cents" bigint NOT NULL,
	"weeks" smallint NOT NULL,
	"team_size" smallint NOT NULL,
	"submitted_at" timestamp with time zone DEFAULT now() NOT NULL,
	"withdrawn_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "rate_limit_buckets" (
	"key" varchar(200) PRIMARY KEY NOT NULL,
	"count" integer DEFAULT 0 NOT NULL,
	"window_start" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rfps" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid NOT NULL,
	"categories" jsonb NOT NULL,
	"status" "rfp_status" DEFAULT 'open' NOT NULL,
	"budget_min_cents" bigint NOT NULL,
	"budget_max_cents" bigint NOT NULL,
	"opened_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deadline" timestamp with time zone NOT NULL,
	"awarded_proposal_id" uuid,
	"awarded_at" timestamp with time zone,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"name" varchar(120),
	"country" varchar(80),
	"role" "user_role" DEFAULT 'donor' NOT NULL,
	"agency_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_sign_in_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "businesses" ADD CONSTRAINT "businesses_postulado_id_postulados_id_fk" FOREIGN KEY ("postulado_id") REFERENCES "public"."postulados"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "businesses" ADD CONSTRAINT "businesses_agency_id_agencies_id_fk" FOREIGN KEY ("agency_id") REFERENCES "public"."agencies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "disbursements" ADD CONSTRAINT "disbursements_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "disbursements" ADD CONSTRAINT "disbursements_agency_id_agencies_id_fk" FOREIGN KEY ("agency_id") REFERENCES "public"."agencies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "donations" ADD CONSTRAINT "donations_donor_user_id_users_id_fk" FOREIGN KEY ("donor_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "donations" ADD CONSTRAINT "donations_destination_business_id_businesses_id_fk" FOREIGN KEY ("destination_business_id") REFERENCES "public"."businesses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "donations" ADD CONSTRAINT "donations_validated_by_user_id_users_id_fk" FOREIGN KEY ("validated_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "magic_link_tokens" ADD CONSTRAINT "magic_link_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "postulado_votes" ADD CONSTRAINT "postulado_votes_postulado_id_postulados_id_fk" FOREIGN KEY ("postulado_id") REFERENCES "public"."postulados"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "proposals" ADD CONSTRAINT "proposals_rfp_id_rfps_id_fk" FOREIGN KEY ("rfp_id") REFERENCES "public"."rfps"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "proposals" ADD CONSTRAINT "proposals_agency_id_agencies_id_fk" FOREIGN KEY ("agency_id") REFERENCES "public"."agencies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rfps" ADD CONSTRAINT "rfps_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "donations_reference_idx" ON "donations" USING btree ("reference");--> statement-breakpoint
CREATE INDEX "donations_status_idx" ON "donations" USING btree ("status");--> statement-breakpoint
CREATE INDEX "donations_email_idx" ON "donations" USING btree ("donor_email");--> statement-breakpoint
CREATE INDEX "ledger_occurred_idx" ON "ledger" USING btree ("occurred_at");--> statement-breakpoint
CREATE INDEX "ledger_kind_idx" ON "ledger" USING btree ("kind");--> statement-breakpoint
CREATE UNIQUE INDEX "magic_link_token_hash_idx" ON "magic_link_tokens" USING btree ("token_hash");--> statement-breakpoint
CREATE INDEX "magic_link_user_idx" ON "magic_link_tokens" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "postulado_votes_unique_daily" ON "postulado_votes" USING btree ("postulado_id","ip_hash","vote_day");--> statement-breakpoint
CREATE INDEX "postulado_votes_postulado_idx" ON "postulado_votes" USING btree ("postulado_id");--> statement-breakpoint
CREATE INDEX "postulados_status_idx" ON "postulados" USING btree ("status");--> statement-breakpoint
CREATE INDEX "postulados_category_idx" ON "postulados" USING btree ("category");--> statement-breakpoint
CREATE INDEX "proposals_rfp_idx" ON "proposals" USING btree ("rfp_id");--> statement-breakpoint
CREATE UNIQUE INDEX "proposals_rfp_agency_unique" ON "proposals" USING btree ("rfp_id","agency_id");--> statement-breakpoint
CREATE INDEX "rate_limit_expires_idx" ON "rate_limit_buckets" USING btree ("expires_at");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
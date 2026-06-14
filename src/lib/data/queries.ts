/**
 * Read-side data access. Use from Server Components.
 *
 * All queries swallow connection errors and fall back to empty arrays so the
 * site still renders during initial setup (before the DB is reachable).
 * Errors are logged for debugging.
 */
import { and, desc, eq, gt, gte, inArray, sql } from "drizzle-orm";
import { getDb } from "@/lib/db";
import {
  agencies,
  businesses,
  donations,
  ledger,
  postulados,
  postuladoVotes,
  proposals,
  rfps,
} from "@/lib/db/schema";

function logErr(name: string, err: unknown) {
  console.error(`[query:${name}]`, err);
}

export async function fetchKpis() {
  try {
    const db = getDb();
    const [donationStats] = await db
      .select({
        raised: sql<number>`COALESCE(SUM(${donations.amountCents}) FILTER (WHERE ${donations.status} = 'confirmed'), 0)::bigint`,
        donors: sql<number>`COUNT(DISTINCT ${donations.donorEmail}) FILTER (WHERE ${donations.status} = 'confirmed')::int`,
      })
      .from(donations);

    const [bizStats] = await db
      .select({
        impacted: sql<number>`COUNT(*) FILTER (WHERE ${businesses.status} IN ('in_progress','completed'))::int`,
        cities: sql<number>`COUNT(DISTINCT ${businesses.city})::int`,
      })
      .from(businesses);

    const [agencyCount] = await db
      .select({ active: sql<number>`COUNT(*) FILTER (WHERE ${agencies.status} = 'active')::int` })
      .from(agencies);

    return {
      raisedCents: Number(donationStats?.raised ?? 0),
      donors: donationStats?.donors ?? 0,
      businesses: bizStats?.impacted ?? 0,
      cities: bizStats?.cities ?? 0,
      activeAgencies: agencyCount?.active ?? 0,
    };
  } catch (err) {
    logErr("kpis", err);
    return { raisedCents: 0, donors: 0, businesses: 0, cities: 0, activeAgencies: 0 };
  }
}

export async function fetchFeaturedBusinesses(limit = 3) {
  try {
    const db = getDb();
    return await db
      .select()
      .from(businesses)
      .where(inArray(businesses.status, ["in_progress", "completed", "matched"]))
      .orderBy(desc(businesses.createdAt))
      .limit(limit);
  } catch (err) {
    logErr("featured", err);
    return [];
  }
}

export async function fetchAllBusinesses() {
  try {
    const db = getDb();
    return await db.select().from(businesses).orderBy(desc(businesses.createdAt));
  } catch (err) {
    logErr("businesses", err);
    return [];
  }
}

export async function fetchBusiness(id: string) {
  try {
    const db = getDb();
    const row = (await db.select().from(businesses).where(eq(businesses.id, id)).limit(1))[0];
    if (!row) return null;
    const agency = row.agencyId
      ? (await db.select().from(agencies).where(eq(agencies.id, row.agencyId)).limit(1))[0]
      : null;
    return { business: row, agency };
  } catch (err) {
    logErr("business", err);
    return null;
  }
}

export async function fetchPostulados(
  opts: { sort?: "votes" | "recent"; statuses?: ("pending_review" | "approved")[] } = {},
) {
  try {
    const db = getDb();
    const statuses = opts.statuses ?? ["pending_review", "approved"];
    const order =
      opts.sort === "recent"
        ? desc(postulados.createdAt)
        : [desc(postulados.votesCount), desc(postulados.createdAt)];
    return await db
      .select()
      .from(postulados)
      .where(inArray(postulados.status, statuses))
      .orderBy(...(Array.isArray(order) ? order : [order]));
  } catch (err) {
    logErr("postulados", err);
    return [];
  }
}

export async function fetchPostulado(id: string) {
  try {
    const db = getDb();
    return (await db.select().from(postulados).where(eq(postulados.id, id)).limit(1))[0] ?? null;
  } catch (err) {
    logErr("postulado", err);
    return null;
  }
}

export async function fetchAgencies() {
  try {
    const db = getDb();
    return await db.select().from(agencies).orderBy(desc(agencies.projectsCompleted));
  } catch (err) {
    logErr("agencies", err);
    return [];
  }
}

export async function fetchAgencyByUser(userId: string) {
  try {
    const db = getDb();
    const rows = await db.execute(sql`
      SELECT a.* FROM users u JOIN agencies a ON a.id = u.agency_id
      WHERE u.id = ${userId} LIMIT 1
    `);
    type Row = typeof agencies.$inferSelect;
    const all = rows.rows as unknown as Row[];
    return all[0] ?? null;
  } catch (err) {
    logErr("agencyByUser", err);
    return null;
  }
}

export async function fetchLedger(opts: { limit?: number; type?: "donation" | "disbursement" | "deliverable"; q?: string } = {}) {
  try {
    const db = getDb();
    const filters = [] as ReturnType<typeof eq>[];
    if (opts.type) filters.push(eq(ledger.kind, opts.type));
    const query = db.select().from(ledger).orderBy(desc(ledger.occurredAt)).limit(opts.limit ?? 50);
    const rows = await (filters.length ? query.where(and(...filters)) : query);
    if (opts.q) {
      const q = opts.q.toLowerCase();
      return rows.filter(
        (r) =>
          r.fromName.toLowerCase().includes(q) ||
          r.toName.toLowerCase().includes(q) ||
          r.referenceHash.toLowerCase().includes(q) ||
          r.purposeEs.toLowerCase().includes(q),
      );
    }
    return rows;
  } catch (err) {
    logErr("ledger", err);
    return [];
  }
}

export async function fetchOpenRfps() {
  try {
    const db = getDb();
    const rows = await db
      .select({
        rfp: rfps,
        business: businesses,
      })
      .from(rfps)
      .innerJoin(businesses, eq(businesses.id, rfps.businessId))
      .where(inArray(rfps.status, ["open", "review"]))
      .orderBy(desc(rfps.openedAt));

    // Fetch proposals for each
    const withProposals = await Promise.all(
      rows.map(async (r) => {
        const props = await db
          .select()
          .from(proposals)
          .where(eq(proposals.rfpId, r.rfp.id))
          .orderBy(desc(proposals.submittedAt));
        const propsWithAgency = await Promise.all(
          props.map(async (p) => {
            const agency = (
              await db.select().from(agencies).where(eq(agencies.id, p.agencyId)).limit(1)
            )[0];
            return { ...p, agency };
          }),
        );
        return { ...r, proposals: propsWithAgency };
      }),
    );
    return withProposals;
  } catch (err) {
    logErr("openRfps", err);
    return [];
  }
}

export async function fetchAllRfpsWithProposals() {
  try {
    const db = getDb();
    const rows = await db
      .select({ rfp: rfps, business: businesses })
      .from(rfps)
      .innerJoin(businesses, eq(businesses.id, rfps.businessId))
      .orderBy(desc(rfps.openedAt));
    const withProposals = await Promise.all(
      rows.map(async (r) => {
        const props = await db.select().from(proposals).where(eq(proposals.rfpId, r.rfp.id));
        const propsWithAgency = await Promise.all(
          props.map(async (p) => {
            const agency = (
              await db.select().from(agencies).where(eq(agencies.id, p.agencyId)).limit(1)
            )[0];
            return { ...p, agency };
          }),
        );
        return { ...r, proposals: propsWithAgency };
      }),
    );
    return withProposals;
  } catch (err) {
    logErr("allRfps", err);
    return [];
  }
}

export async function fetchRfpsForAgency(agencyId: string) {
  try {
    const db = getDb();
    const agency = (await db.select().from(agencies).where(eq(agencies.id, agencyId)).limit(1))[0];
    if (!agency) return [];
    const rows = await db
      .select({ rfp: rfps, business: businesses })
      .from(rfps)
      .innerJoin(businesses, eq(businesses.id, rfps.businessId))
      .where(eq(rfps.status, "open"))
      .orderBy(desc(rfps.openedAt));
    // Filter by category match (categories array contains agency's category)
    const matched = rows.filter((r) => (r.rfp.categories ?? []).includes(agency.category));
    // Mark which we've already bid on
    const proposalRows = await db
      .select()
      .from(proposals)
      .where(eq(proposals.agencyId, agencyId));
    const bidRfpIds = new Set(proposalRows.map((p) => p.rfpId));
    return matched.map((r) => ({ ...r, alreadyBid: bidRfpIds.has(r.rfp.id) }));
  } catch (err) {
    logErr("rfpsForAgency", err);
    return [];
  }
}

export async function fetchDonorImpact(email: string) {
  try {
    const db = getDb();
    return await db
      .select()
      .from(donations)
      .where(eq(donations.donorEmail, email.toLowerCase()))
      .orderBy(desc(donations.submittedAt));
  } catch (err) {
    logErr("donorImpact", err);
    return [];
  }
}

export async function fetchPendingDonations() {
  try {
    const db = getDb();
    return await db
      .select()
      .from(donations)
      .where(eq(donations.status, "pending_proof"))
      .orderBy(desc(donations.submittedAt));
  } catch (err) {
    logErr("pendingDonations", err);
    return [];
  }
}

export async function fetchPendingPostulados() {
  try {
    const db = getDb();
    return await db
      .select()
      .from(postulados)
      .where(eq(postulados.status, "pending_review"))
      .orderBy(desc(postulados.createdAt));
  } catch (err) {
    logErr("pendingPostulados", err);
    return [];
  }
}

export async function fetchAgenciesByCategory(categories: string[]) {
  try {
    const db = getDb();
    if (!categories.length) return [];
    return await db
      .select()
      .from(agencies)
      .where(
        and(
          eq(agencies.status, "active"),
          // @ts-expect-error category is enum, cast in SQL
          inArray(agencies.category, categories),
        ),
      );
  } catch (err) {
    logErr("agenciesByCategory", err);
    return [];
  }
}

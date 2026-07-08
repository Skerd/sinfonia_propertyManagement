/**
 * KPI drill-down URL builders — filters aligned with dashboard.ts aggregation logic.
 *
 * Limitations (by design):
 * - Payment-plan KPIs link to sales with paymentType=payment_plan (no dedicated list).
 * - Occupancy / average KPIs link to the underlying population, not the computed ratio.
 */

import { UnitStatus } from "armonia/src/modules/propertyManagement/api/realEstate/private/unit/unit/unit.constants";
import type { FilterGroup } from "armonia/src/modules/core/database/filter";
import {
    buildFilterGroup,
    buildFilterRule,
    buildListDrillDownUrl,
} from "@coreModule/helpers/filter/filterUrl.ts";

export type KpiDrillDownContext = {
    from?: string;
    to?: string;
    edificeId?: string;
    edificeName?: string;
};

const SALE_PAYMENT_CASH = "cash";
const SALE_PAYMENT_PLAN = "payment_plan";

const TERMINAL_MODIFICATION_STATUSES = ["completed", "rejected", "cancelled"] as const;

function contextQueryParams(ctx: KpiDrillDownContext): Record<string, string | undefined> {
    const q: Record<string, string | undefined> = {};
    if (ctx.edificeId) q.edificeId = ctx.edificeId;
    if (ctx.edificeName) q.edificeName = ctx.edificeName;
    return q;
}

function saleDateFilter(ctx: KpiDrillDownContext): FilterGroup | undefined {
    if (!ctx.from && !ctx.to) return undefined;
    const start = ctx.from ?? ctx.to!;
    const end = ctx.to ?? ctx.from!;
    return buildFilterGroup([
        buildFilterRule("saleDate", "between", [start, end]),
    ]);
}

function mergeFilters(...groups: (FilterGroup | undefined)[]): FilterGroup | undefined {
    const rules = groups.flatMap((g) => g?.rules ?? []);
    if (rules.length === 0) return undefined;
    return buildFilterGroup(rules);
}

function unitsUrl(ctx: KpiDrillDownContext, status?: UnitStatus | UnitStatus[]): string {
    let filter: FilterGroup | undefined;
    if (status != null) {
        const values = Array.isArray(status) ? status : [status];
        filter =
            values.length === 1
                ? buildFilterGroup([buildFilterRule("status", "equals", values[0])])
                : buildFilterGroup([buildFilterRule("status", "in", values)]);
    }
    return buildListDrillDownUrl("/realEstate/units", {
        filter,
        queryParams: contextQueryParams(ctx),
    });
}

function salesUrl(ctx: KpiDrillDownContext, extraRules: ReturnType<typeof buildFilterRule>[] = []): string {
    const filter = mergeFilters(saleDateFilter(ctx), extraRules.length ? buildFilterGroup(extraRules) : undefined);
    return buildListDrillDownUrl("/realEstate/sales", {
        filter,
        queryParams: contextQueryParams(ctx),
    });
}

function reservationsUrl(ctx: KpiDrillDownContext, extraRules: ReturnType<typeof buildFilterRule>[] = []): string {
    const filter = extraRules.length ? buildFilterGroup(extraRules) : undefined;
    return buildListDrillDownUrl("/realEstate/reservations", {
        filter,
        queryParams: contextQueryParams(ctx),
    });
}

function toISODate(d: Date): string {
    return d.toISOString().slice(0, 10);
}

function expiringReservationWindow(): [string, string] {
    const now = new Date();
    const end = new Date(now);
    end.setDate(end.getDate() + 7);
    return [toISODate(now), toISODate(end)];
}

// ── Units ────────────────────────────────────────────────────────────────────

export const kpiUnitsTotal = (ctx: KpiDrillDownContext) => unitsUrl(ctx);
export const kpiUnitsAvailable = (ctx: KpiDrillDownContext) => unitsUrl(ctx, UnitStatus.AVAILABLE);
export const kpiUnitsReserved = (ctx: KpiDrillDownContext) => unitsUrl(ctx, UnitStatus.RESERVED);
export const kpiUnitsSold = (ctx: KpiDrillDownContext) => unitsUrl(ctx, UnitStatus.SOLD);
export const kpiUnitsUnavailable = (ctx: KpiDrillDownContext) => unitsUrl(ctx, UnitStatus.UNAVAILABLE);
export const kpiUnitsRented = (ctx: KpiDrillDownContext) => unitsUrl(ctx, UnitStatus.RENTED);
/** Inventory value KPI: available + reserved units (matches dashboard inventoryValueAgg). */
export const kpiInventoryValue = (ctx: KpiDrillDownContext) =>
    unitsUrl(ctx, [UnitStatus.AVAILABLE, UnitStatus.RESERVED]);
/** Occupancy links to sold units (numerator of occupancy rate). */
export const kpiOccupancyRate = (ctx: KpiDrillDownContext) => unitsUrl(ctx, UnitStatus.SOLD);

// ── Sales / revenue ──────────────────────────────────────────────────────────

export const kpiTotalRevenue = (ctx: KpiDrillDownContext) => salesUrl(ctx);
export const kpiTotalSales = (ctx: KpiDrillDownContext) => salesUrl(ctx);
export const kpiAverageSalePrice = (ctx: KpiDrillDownContext) => salesUrl(ctx);
export const kpiCollected = (ctx: KpiDrillDownContext) => salesUrl(ctx);
export const kpiCashSales = (ctx: KpiDrillDownContext) =>
    salesUrl(ctx, [buildFilterRule("paymentType", "equals", SALE_PAYMENT_CASH)]);
export const kpiPaymentPlanSales = (ctx: KpiDrillDownContext) =>
    salesUrl(ctx, [buildFilterRule("paymentType", "equals", SALE_PAYMENT_PLAN)]);

// ── Reservations ─────────────────────────────────────────────────────────────

export const kpiActiveReservations = (ctx: KpiDrillDownContext) =>
    reservationsUrl(ctx, [buildFilterRule("isActive", "equals", true)]);
export const kpiExpiringReservations = (ctx: KpiDrillDownContext) => {
    const [start, end] = expiringReservationWindow();
    return reservationsUrl(ctx, [
        buildFilterRule("isActive", "equals", true),
        buildFilterRule("expirationDate", "between", [start, end]),
    ]);
};
export const kpiReservationDeposits = (ctx: KpiDrillDownContext) => kpiActiveReservations(ctx);

// ── Payment plans (best-effort → sales with payment_plan) ────────────────────

export const kpiActivePaymentPlans = (ctx: KpiDrillDownContext) => kpiPaymentPlanSales(ctx);
export const kpiOverdueInstallments = (ctx: KpiDrillDownContext) => kpiPaymentPlanSales(ctx);
export const kpiTotalOutstanding = (ctx: KpiDrillDownContext) => kpiPaymentPlanSales(ctx);
export const kpiPaymentPlansCompleted = (ctx: KpiDrillDownContext) => kpiPaymentPlanSales(ctx);

// ── Unit costs ───────────────────────────────────────────────────────────────

export const kpiVerifiedPaidCosts = (_ctx: KpiDrillDownContext) =>
    buildListDrillDownUrl("/realEstate/unitCosts", {
        queryParams: { verificationStatus: "verified", paymentStatus: "paid" },
    });

export const kpiVerifiedOutstandingCosts = (_ctx: KpiDrillDownContext) =>
    buildListDrillDownUrl("/realEstate/unitCosts", {
        filter: buildFilterGroup([
            buildFilterRule("verificationStatus", "equals", "verified"),
            buildFilterRule("paymentStatus", "in", ["unpaid", "partially_paid", "disputed"]),
        ]),
    });

export const kpiPendingVerificationCosts = (_ctx: KpiDrillDownContext) =>
    buildListDrillDownUrl("/realEstate/unitCosts", {
        filter: buildFilterGroup([
            buildFilterRule("verificationStatus", "in", ["pending_verification", "needs_revision"]),
        ]),
    });

export const kpiTotalUnitCostDocuments = (_ctx: KpiDrillDownContext) =>
    buildListDrillDownUrl("/realEstate/unitCosts", {});

// ── Inspections ────────────────────────────────────────────────────────────

export const kpiTotalInspections = (_ctx: KpiDrillDownContext) =>
    buildListDrillDownUrl("/realEstate/inspections", {});

export const kpiFollowUpInspections = (_ctx: KpiDrillDownContext) =>
    buildListDrillDownUrl("/realEstate/inspections", {
        filter: buildFilterGroup([buildFilterRule("followUpRequired", "equals", true)]),
    });

// ── Modification requests ───────────────────────────────────────────────────

export const kpiOpenModificationRequests = (_ctx: KpiDrillDownContext) =>
    buildListDrillDownUrl("/realEstate/modificationRequests", {
        filter: buildFilterGroup([
            buildFilterRule("status", "notIn", [...TERMINAL_MODIFICATION_STATUSES]),
        ]),
    });

export const kpiTotalModificationRequests = (_ctx: KpiDrillDownContext) =>
    buildListDrillDownUrl("/realEstate/modificationRequests", {});

// ── Hierarchy counts ─────────────────────────────────────────────────────────

export const kpiTotalProjects = (_ctx: KpiDrillDownContext) =>
    buildListDrillDownUrl("/realEstate/projects", {});

export const kpiTotalEdifices = (_ctx: KpiDrillDownContext) =>
    buildListDrillDownUrl("/realEstate/edifices", {});

export const kpiTotalFloors = (_ctx: KpiDrillDownContext) =>
    buildListDrillDownUrl("/realEstate/floors", {});

// ── Dashboard-specific ──────────────────────────────────────────────────────

export const kpiAvgPricePerSqm = (ctx: KpiDrillDownContext) => salesUrl(ctx);

/** Re-export context builder used by overview/dashboard parents. */
export function buildDrillDownContextFromPeriod(
    from: string,
    to: string,
    edifice?: { _id: string; name?: string } | null,
): KpiDrillDownContext {
    return {
        from,
        to,
        edificeId: edifice?._id,
        edificeName: edifice?.name,
    };
}

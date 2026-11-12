import {
    PAYMENTS_HUB_DATE_FIELD_VALUES,
    PAYMENTS_HUB_STATUS_VALUES,
    type PaymentsHubDateField,
    type PaymentsHubGroupBy,
} from "armonia/src/modules/propertyManagement/api/realEstate/private/paymentsHub/paymentsHub.constants.ts";
import type {PaymentsHubRow} from "armonia/src/modules/propertyManagement/api/realEstate/private/paymentsHub/paymentsHub.dto.ts";
import type {PaymentsHubScopeFormType} from "armonia/src/modules/propertyManagement/api/realEstate/private/paymentsHub/paymentsHub.form.type.ts";
import {fmtDate} from "@propertyManagementModule/clients/panel/private/rentalsHub/rentalsHubHelpers.ts";
import {formatDate} from "@coreModule/helpers/general/dateTime.ts";

/** Every filter on the page. Held once by the page so the tiles, list and calendar stay in step. */
export type PaymentsHubScope = {
    search: string;
    project: string;
    edifice: string;
    floor: string;
    unit: string;
    status: string;
    kind: string;
    dateField: PaymentsHubDateField;
    dateFrom: string;
    dateTo: string;
};

export const EMPTY_PAYMENTS_SCOPE: PaymentsHubScope = {
    search: "",
    project: "",
    edifice: "",
    floor: "",
    unit: "",
    status: "",
    kind: "",
    dateField: "dueDate",
    dateFrom: "",
    dateTo: "",
};

/** The URL params a link may preset the hub with (the dashboard's "Collected" sends its period and edifice). */
export const PAYMENTS_HUB_URL_PARAMS = ["status", "unit", "edifice", "dateField", "dateFrom", "dateTo"] as const;

const LOCAL_DAY = /^\d{4}-\d{2}-\d{2}$/;

function oneOf<T extends string>(values: readonly T[], value: string | null): T | undefined {
    return values.find((candidate) => candidate === value);
}

/** The starting scope from the URL; an unknown status or date field, or a day that is not `YYYY-MM-DD`, is ignored. */
export function scopeFromSearchParams(params: URLSearchParams): PaymentsHubScope {
    const day = (key: string) => {
        const value = params.get(key) ?? "";
        return LOCAL_DAY.test(value) ? value : "";
    };
    return {
        ...EMPTY_PAYMENTS_SCOPE,
        status: oneOf(PAYMENTS_HUB_STATUS_VALUES, params.get("status")) ?? "",
        unit: params.get("unit") ?? "",
        edifice: params.get("edifice") ?? "",
        dateField: oneOf(PAYMENTS_HUB_DATE_FIELD_VALUES, params.get("dateField")) ?? EMPTY_PAYMENTS_SCOPE.dateField,
        dateFrom: day("dateFrom"),
        dateTo: day("dateTo"),
    };
}

export function hasActiveScope(scope: PaymentsHubScope): boolean {
    return Boolean(
        scope.search.trim()
        || scope.project
        || scope.edifice
        || scope.floor
        || scope.unit
        || scope.status
        || scope.kind
        || scope.dateFrom
        || scope.dateTo
        || scope.dateField !== "dueDate",
    );
}

/** Scope filters only — the date range is added by the callers that use one. */
export function scopeToBody(scope: PaymentsHubScope): PaymentsHubScopeFormType {
    const body: PaymentsHubScopeFormType = {};
    if (scope.search.trim()) body.search = scope.search.trim();
    if (scope.project) body.project = scope.project;
    if (scope.edifice) body.edifice = scope.edifice;
    if (scope.floor) body.floor = scope.floor;
    if (scope.unit) body.unit = scope.unit;
    if (scope.status) body.status = scope.status as PaymentsHubScopeFormType["status"];
    if (scope.kind) body.kind = scope.kind as PaymentsHubScopeFormType["kind"];
    return body;
}

export function paymentsStatusBadgeVariant(
    status: string,
): "default" | "secondary" | "outline" | "destructive" {
    switch (status) {
        case "paid": return "default";
        case "partially_paid": return "secondary";
        case "overdue": return "destructive";
        case "pending": return "secondary";
        default: return "outline";
    }
}

/** Buyer as one line: a person's name, or the buying company. */
export function clientLabel(client: PaymentsHubRow["client"]): string {
    if (!client) return "—";
    if (client.companyName) return client.companyName;
    return [client.name, client.surname].filter(Boolean).join(" ") || "—";
}

/** "Installment 3" / "Down payment" / "Cash sale" / "Reservation deposit", for the Type column. */
export function kindLabel(
    row: PaymentsHubRow,
    rk: (key: string) => string,
): string {
    if (row.kind !== "installment") return rk(`kind.${row.kind}`);
    return row.installmentNumber != null
        ? rk("kind.installmentNumbered").replace("{number}", String(row.installmentNumber))
        : rk("kind.installment");
}

/** The record a row opens: its payment plan, its cash sale, or its reservation. */
export type PaymentsHubRowTarget = {type: "plan" | "sale" | "reservation"; id: string};

export function rowTarget(row: PaymentsHubRow): PaymentsHubRowTarget | null {
    if (row.kind === "cash_sale") return row.saleId ? {type: "sale", id: row.saleId} : null;
    if (row.kind === "reservation_deposit") return row.reservationId ? {type: "reservation", id: row.reservationId} : null;
    return row.planId ? {type: "plan", id: row.planId} : null;
}

/** The code shown for a row: its sale's, or (a deposit) its reservation's. */
export function rowCode(row: PaymentsHubRow): string | undefined {
    return row.saleCode ?? row.reservationCode;
}

/**
 * Period heading: a single day, a week as "from – to", or the month name. Periods
 * are local days (`YYYY-MM-DD`, D115), read as UTC midnight and so labelled in UTC —
 * otherwise a viewer west of Greenwich would see a heading one day before its own bucket.
 */
export function periodLabel(
    periodStart: string,
    periodEnd: string,
    groupBy: PaymentsHubGroupBy,
): string {
    if (groupBy === "month") {
        // The core date helper, in the app's language (GLB-09).
        return formatDate(periodStart, {timeZone: "UTC", format: {month: "long", year: "numeric"}}) || periodStart;
    }
    if (groupBy === "week") return `${fmtDate(periodStart, "UTC")} – ${fmtDate(periodEnd, "UTC")}`;
    return fmtDate(periodStart, "UTC");
}

/** `yyyy-MM-dd` of a period start, for handing a period back to the date-range filter. */
export function ymdOf(iso: string): string {
    return iso.slice(0, 10);
}

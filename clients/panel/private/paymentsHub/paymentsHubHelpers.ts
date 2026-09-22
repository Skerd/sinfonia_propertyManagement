import type {
    PaymentsHubDateField,
    PaymentsHubGroupBy,
} from "armonia/src/modules/propertyManagement/api/realEstate/private/paymentsHub/paymentsHub.constants.ts";
import type {PaymentsHubRow} from "armonia/src/modules/propertyManagement/api/realEstate/private/paymentsHub/paymentsHub.dto.ts";
import type {PaymentsHubScopeFormType} from "armonia/src/modules/propertyManagement/api/realEstate/private/paymentsHub/paymentsHub.form.type.ts";
import {fmtDate} from "@propertyManagementModule/clients/panel/private/rentalsHub/rentalsHubHelpers.ts";

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

/** "Installment 3" / "Down payment", for the Type column. */
export function kindLabel(
    row: PaymentsHubRow,
    rk: (key: string) => string,
): string {
    if (row.kind === "down_payment") return rk("kind.down_payment");
    return row.installmentNumber != null
        ? rk("kind.installmentNumbered").replace("{number}", String(row.installmentNumber))
        : rk("kind.installment");
}

/**
 * Period heading: a single day, a week as "from – to", or the month name. Periods
 * are bucketed in UTC on the server, so they are labelled in UTC too — otherwise a
 * viewer west of Greenwich would see a heading one day before its own bucket.
 */
export function periodLabel(
    periodStart: string,
    periodEnd: string,
    groupBy: PaymentsHubGroupBy,
    locale: string,
): string {
    if (groupBy === "month") {
        const date = new Date(periodStart);
        if (Number.isNaN(date.getTime())) return periodStart;
        return date.toLocaleDateString(locale, {month: "long", year: "numeric", timeZone: "UTC"});
    }
    if (groupBy === "week") return `${fmtDate(periodStart, "UTC")} – ${fmtDate(periodEnd, "UTC")}`;
    return fmtDate(periodStart, "UTC");
}

/** `yyyy-MM-dd` of a period start, for handing a period back to the date-range filter. */
export function ymdOf(iso: string): string {
    return iso.slice(0, 10);
}

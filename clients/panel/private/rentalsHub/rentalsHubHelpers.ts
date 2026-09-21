import type {ResolveLanguageKey} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {generateUUID} from "@coreModule/helpers/general/uuid.ts";
import type {FilterGroup, FilterRule} from "armonia/src/modules/core/database/filter";
import {formatDate} from "@coreModule/helpers/general/dateTime.ts";
import {getName} from "@coreModule/helpers/general/names.ts";
import {formatNumber} from "@coreModule/helpers/general/numbers.ts";

const DAY_FORMAT: Intl.DateTimeFormatOptions = {day: "2-digit", month: "2-digit", year: "numeric"};

export function fmtDate(iso: string | undefined, timezone?: string): string {
    return formatDate(iso, {timeZone: timezone, format: DAY_FORMAT}) || "—";
}

export function fmtMoney(amount: number | undefined, symbol?: string): string {
    const formatted = formatNumber(amount, {maximumFractionDigits: 2});
    return formatted ? `${symbol ?? ""} ${formatted}`.trim() : "—";
}

export function personName(parts: {name?: string; surname?: string} | undefined): string {
    return getName(parts) || "—";
}

export function unitLabel(unit: {name?: string; unitNumber?: string | number} | undefined): string {
    if (!unit) return "—";
    return [unit.name, unit.unitNumber != null ? String(unit.unitNumber) : undefined]
        .filter(Boolean)
        .join(" / ") || "—";
}

export function paginationSummary(
    rk: ResolveLanguageKey,
    prefix: string,
    page: number,
    limit: number,
    total: number,
): string {
    if (total === 0) return "";
    const from = (page - 1) * limit + 1;
    const to = Math.min(page * limit, total);
    return String(rk(`${prefix}.pagination.summary`))
        .replace("{from}", String(from))
        .replace("{to}", String(to))
        .replace("{total}", String(total));
}

export function leaseStatusBadgeVariant(
    status: string,
): "default" | "secondary" | "outline" | "destructive" {
    switch (status) {
        case "active": return "default";
        case "expired": return "secondary";
        case "terminated": return "destructive";
        default: return "outline";
    }
}

export function paymentStatusBadgeVariant(
    status: string,
): "default" | "secondary" | "outline" | "destructive" {
    switch (status) {
        case "paid": return "default";
        case "pending": return "secondary";
        case "partially_paid": return "secondary";
        case "overdue": return "destructive";
        case "waived": return "outline";
        default: return "outline";
    }
}

function buildFilterRule(field: string, value: string | string[]): FilterRule | undefined {
    const values = (Array.isArray(value) ? value : [value]).filter(Boolean);
    if (values.length === 0) return undefined;
    return {
        id: generateUUID(),
        field,
        operator: values.length === 1 ? "equals" : "in",
        value: values.length === 1 ? values[0] : values,
    };
}

function buildEqualsFilterGroup(entries: {field: string; value: string | string[]}[]): FilterGroup | undefined {
    const rules = entries
        .map(({field, value}) => buildFilterRule(field, value))
        .filter((r): r is FilterRule => !!r);
    if (rules.length === 0) return undefined;
    return {id: generateUUID(), operator: "and", rules, groups: []};
}

/** Build ApiSelect `postBody` with DSL filters for cascading hierarchy selects. */
export function selectBodyWithFilters(
    entries: {field: string; value: string | string[]}[],
): Record<string, unknown> | undefined {
    const filters = buildEqualsFilterGroup(entries);
    return filters ? {filters} : undefined;
}

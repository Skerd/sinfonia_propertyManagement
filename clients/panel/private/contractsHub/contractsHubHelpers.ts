import type {ResolveLanguageKey} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {generateUUID} from "@coreModule/helpers/general/uuid.ts";
import type {FilterGroup, FilterRule} from "armonia/src/modules/core/database/filter";
import type {
    ClientRegistryStatus,
    ContractPaymentStatus,
    ContractRegistryStatus,
    ContractRegistryType,
} from "armonia/src/modules/propertyManagement/api/realEstate/private/contractsHub/contractsHub.constants";
import {DATE_FORMATS, formatDate} from "@coreModule/helpers/general/dateTime.ts";
import {getName} from "@coreModule/helpers/general/names.ts";
import {formatNumber} from "@coreModule/helpers/general/numbers.ts";
import {formatAmountWithCurrency} from "@coreModule/components/viewEngine/engine/format.ts";
import type {CurrencySimple} from "armonia/src/modules/core/dto/currency.dto.ts";

/** A calendar day, read as UTC midnight so it never shifts a day in the viewer's zone. */
export function fmtDate(iso: string | undefined, _timezone?: string): string {
    return formatDate(iso, {timeZone: "UTC", format: DATE_FORMATS.mediumDate}) || "—";
}

export function fmtDateTime(iso: string | undefined, timezone?: string): string {
    return formatDate(iso, {timeZone: timezone, format: DATE_FORMATS.mediumDateTime}) || "—";
}

/** The amount in its own currency, at the currency's decimal places (UX-07). */
export function fmtMoney(amount: number | undefined, currency: Partial<CurrencySimple> | undefined): string {
    return formatAmountWithCurrency(amount, currency) || "—";
}

export function fmtSurface(value: number | undefined): string {
    return formatNumber(value, {minimumFractionDigits: 2, maximumFractionDigits: 2}) || "—";
}

export function personName(parts: {name?: string; surname?: string} | undefined): string {
    return getName(parts) || "—";
}

/** "Name / number", or one of them when the other is missing or the same text. */
export function unitLabel(unit: {name?: string; unitNumber?: string | number} | undefined): string {
    if (!unit) return "—";
    const number = unit.unitNumber != null ? String(unit.unitNumber) : undefined;
    const parts = [unit.name, number].filter(Boolean);
    return [...new Set(parts)].join(" / ") || "—";
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
    const template = String(rk(`${prefix}.pagination.summary`));
    return template
        .replace("{from}", String(from))
        .replace("{to}", String(to))
        .replace("{total}", String(total));
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

export function contractTypeBadgeVariant(type: ContractRegistryType): "default" | "secondary" | "outline" {
    switch (type) {
        case "reservation": return "secondary";
        case "payment_plan_sale": return "outline";
        default: return "default";
    }
}

export function contractStatusBadgeVariant(status: ContractRegistryStatus): "default" | "secondary" | "outline" | "destructive" {
    switch (status) {
        case "sold": return "default";
        case "active": return "secondary";
        case "cancelled": return "destructive";
        default: return "outline";
    }
}

export function paymentStatusBadgeVariant(status: ContractPaymentStatus): "default" | "secondary" | "outline" | "destructive" {
    switch (status) {
        case "ok": return "default";
        case "partially": return "secondary";
        case "unpaid": return "destructive";
        default: return "outline";
    }
}

export function clientStatusBadgeVariant(status: ClientRegistryStatus): "default" | "secondary" {
    return status === "sold" ? "default" : "secondary";
}

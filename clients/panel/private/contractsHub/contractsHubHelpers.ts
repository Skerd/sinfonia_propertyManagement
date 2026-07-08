import type {ResolveLanguageKey} from "@coreModule/helpers/hocs/withLanguage.tsx";
import type {
    ClientRegistryStatus,
    ContractPaymentStatus,
    ContractRegistryStatus,
    ContractRegistryType,
} from "armonia/src/modules/propertyManagement/api/realEstate/private/contractsHub/contractsHub.constants";

export function fmtDate(iso: string | undefined, timezone?: string): string {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        timeZone: timezone,
    });
}

export function fmtDateTime(iso: string | undefined, timezone?: string): string {
    if (!iso) return "—";
    return new Date(iso).toLocaleString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: timezone,
    });
}

export function fmtMoney(amount: number | undefined, symbol = "€"): string {
    if (amount == null || Number.isNaN(amount)) return "—";
    return `${symbol} ${amount.toLocaleString("en-US", {minimumFractionDigits: 0, maximumFractionDigits: 2})}`.trim();
}

export function fmtSurface(value: number | undefined): string {
    if (value == null || Number.isNaN(value)) return "—";
    return value.toLocaleString("en-US", {minimumFractionDigits: 2, maximumFractionDigits: 2});
}

export function personName(parts: {name?: string; surname?: string} | undefined): string {
    if (!parts) return "—";
    return [parts.name, parts.surname].filter(Boolean).join(" ") || "—";
}

export function unitLabel(unit: {name?: string; unitNumber?: string} | undefined): string {
    if (!unit) return "—";
    return [unit.name, unit.unitNumber].filter(Boolean).join(" / ") || "—";
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

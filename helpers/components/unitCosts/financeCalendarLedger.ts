import type { UnitCost } from "armonia/src/modules/propertyManagement/api/realEstate/private/unit/unitCost/unitCost.dto.ts";

/**
 * Calendar ledger categories for payment-date–based views.
 *
 * - paid: Document is settled (paymentStatus === paid).
 * - overdue: Verified, not settled (not paid/waived), and paymentDate is strictly before local today.
 * - pending: Everything else in the filtered set (e.g. future due dates, awaiting verification, partial).
 */
export type FinanceCalendarLedgerCategory = "paid" | "pending" | "overdue";

function startOfLocalDay(d: Date): Date {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function deriveCalendarLedgerCategory(cost: UnitCost, today: Date = new Date()): FinanceCalendarLedgerCategory {
    if (cost.paymentStatus === "paid") {
        return "paid";
    }
    const paymentYmd = cost.paymentDate?.slice(0, 10);
    if (!paymentYmd) {
        return "pending";
    }
    const pay = new Date(paymentYmd + "T12:00:00");
    const todayStart = startOfLocalDay(today);
    if (cost.verificationStatus === "verified" && pay < todayStart && cost.paymentStatus !== "waived") {
        return "overdue";
    }
    return "pending";
}

export function paymentDateYmd(cost: UnitCost): string | null {
    const d = cost.paymentDate?.slice(0, 10);
    return d && /^\d{4}-\d{2}-\d{2}$/.test(d) ? d : null;
}

export type CurrencySubtotalMap = Map<string, { symbol?: string; abbreviation?: string; total: number }>;

export function addToCurrencyMap(
    map: CurrencySubtotalMap,
    cost: UnitCost,
    amount: number,
): void {
    const id = cost.currency?._id ?? "_none";
    const prev = map.get(id) ?? {
        symbol: cost.currency?.symbol,
        abbreviation: cost.currency?.abbreviation,
        total: 0,
    };
    prev.total += amount;
    if (!prev.symbol && cost.currency?.symbol) prev.symbol = cost.currency.symbol;
    if (!prev.abbreviation && cost.currency?.abbreviation) prev.abbreviation = cost.currency.abbreviation;
    map.set(id, prev);
}

export function formatCurrencyLine(
    entry: { symbol?: string; abbreviation?: string; total: number },
    locale: string,
): string {
    const n = entry.total;
    const formatted = new Intl.NumberFormat(locale, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(n);
    if (entry.symbol) return `${formatted} ${entry.symbol}`.trim();
    if (entry.abbreviation) return `${formatted} ${entry.abbreviation}`.trim();
    return formatted;
}

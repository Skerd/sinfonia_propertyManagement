export type UnitsByStatusCounts = {
    available?: number;
    reserved?: number;
    sold?: number;
    unavailable?: number;
    leased?: number;
};

export type EntityStatusStats = {
    sold: number;
    reserved: number;
    available: number;
    blocked: number;
    leased: number;
    totalUnits: number;
};

export function unitsByStatusToEntityStats(
    unitsByStatus: UnitsByStatusCounts | undefined,
    totalUnits?: number,
): EntityStatusStats {
    const available = unitsByStatus?.available ?? 0;
    const reserved = unitsByStatus?.reserved ?? 0;
    const sold = unitsByStatus?.sold ?? 0;
    const blocked = unitsByStatus?.unavailable ?? 0;
    const leased = unitsByStatus?.leased ?? 0;
    const total =
        totalUnits ??
        (available + reserved + sold + blocked + leased || 0);
    return {sold, reserved, available, blocked, leased, totalUnits: total};
}

const DEFAULT_CURRENCY_SYMBOL = "€";

/**
 * Short money label for dashboard tiles (`2.5M €`).
 *
 * Thresholds are applied to the magnitude so negative balances compact the same way; comparing
 * the signed value let every negative amount fall through to the uncompacted branch.
 */
export function formatCompactCurrency(value: number, symbol: string = DEFAULT_CURRENCY_SYMBOL): string {
    if (!Number.isFinite(value)) return `0 ${symbol}`;
    const sign = value < 0 ? "-" : "";
    const magnitude = Math.abs(value);
    if (magnitude >= 1_000_000) return `${sign}${(magnitude / 1_000_000).toFixed(1)}M ${symbol}`;
    if (magnitude >= 1_000) return `${sign}${(magnitude / 1_000).toFixed(0)}K ${symbol}`;
    return `${sign}${magnitude} ${symbol}`;
}

/** One amount in one currency: the statistics keep money per currency and never add two together (GLB-08). */
export type CurrencyAmount = {value: number; symbol: string};

type MoneyByCurrencyRow = {currency?: {symbol?: string; abbreviation?: string; name?: string}; value?: number};

/** Statistics `{currency, value}` rows → one amount per currency, labelled by symbol, else code, else name. */
export function toCurrencyAmounts(rows: MoneyByCurrencyRow[] | undefined): CurrencyAmount[] {
    return (rows ?? []).map((row) => ({
        value: row.value ?? 0,
        symbol: row.currency?.symbol || row.currency?.abbreviation || row.currency?.name || "",
    }));
}

/** One compact amount per currency ("5.8M € · 120K CHF"); "—" when there is none (UX-07). */
export function formatCompactCurrencies(amounts: CurrencyAmount[]): string {
    if (amounts.length === 0) return "—";
    return amounts.map((amount) => formatCompactCurrency(amount.value, amount.symbol).trim()).join(" · ");
}

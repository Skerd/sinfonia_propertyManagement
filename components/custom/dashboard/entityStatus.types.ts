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

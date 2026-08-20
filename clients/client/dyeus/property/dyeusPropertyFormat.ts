import type {MarketingUnitSingle} from "@propertyManagementModule/clients/client/public/shared/publicTypes.ts";

export const MISSING_VALUE = "—";

export type DyeusPropertyCopy = (key: string) => string;

export function formatAreaSqm(value?: number) {
    return value != null
        ? `${value.toLocaleString(undefined, {maximumFractionDigits: 2})} m²`
        : MISSING_VALUE;
}

export function formatCount(value?: number) {
    return value != null ? String(value) : MISSING_VALUE;
}

export function formatUnitPrice(unit: MarketingUnitSingle, onRequest: string) {
    if (unit.price == null) return onRequest;
    const symbol = unit.priceCurrency?.symbol ?? unit.priceCurrency?.abbreviation ?? "€";
    return `${symbol}${unit.price.toLocaleString()}`;
}

export function formatPricePerSqm(pricePerSqm?: MarketingUnitSingle["averagePricePerSquareMeter"]) {
    if (pricePerSqm?.value == null) return MISSING_VALUE;
    const symbol = pricePerSqm.currency?.symbol ?? pricePerSqm.currency?.abbreviation ?? "€";
    const formatted = pricePerSqm.value.toLocaleString(undefined, {maximumFractionDigits: 3});
    return `${symbol}${formatted}/m²`;
}

export function formatFloor(unit: MarketingUnitSingle) {
    if (unit.floorLabel) return unit.floorLabel;
    if (unit.floorLevel != null && unit.totalFloorsInEdifice != null) {
        return `${unit.floorLevel}/${unit.totalFloorsInEdifice}`;
    }
    if (unit.floorLevel != null) return String(unit.floorLevel);
    return MISSING_VALUE;
}

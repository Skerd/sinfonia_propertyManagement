import type {RevenueByCurrency} from "armonia/src/modules/propertyManagement/api/realEstate/private/dashboard/dashboard.form.response.type.ts";
import {formatNumber} from "@coreModule/helpers/general/numbers.ts";
import {
    formatRevenueByCurrencyCompact,
    formatRevenueByCurrencyLines,
} from "@propertyManagementModule/helpers/rentals/formatRevenueByCurrency.ts";

/** A dashboard tile's figure: `value` as the tile shows it, `fullValue` exact for hover and screen readers. */
export type KpiValue = {value: string; fullValue: string};

/** Counts shorten from 10,000 ("12.3K"): below that every digit fits a tile and reads faster than a suffix. */
export function kpiCount(count: number): KpiValue {
    const fullValue = formatNumber(count);
    return {value: Math.abs(count) >= 10_000 ? formatNumber(count, {compact: true}) : fullValue, fullValue};
}

/** Money per currency, shortened from 1,000 ("€ 1.8M"), never summed across currencies (GLB-08). */
export function kpiMoney(rows: RevenueByCurrency[] | undefined): KpiValue {
    return {value: formatRevenueByCurrencyCompact(rows), fullValue: formatRevenueByCurrencyLines(rows)};
}

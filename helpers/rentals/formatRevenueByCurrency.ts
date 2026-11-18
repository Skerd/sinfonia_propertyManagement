import type {RevenueByCurrency} from "armonia/src/modules/propertyManagement/api/realEstate/private/dashboard/dashboard.form.response.type.ts";
import {formatAmountWithCurrency} from "@coreModule/components/viewEngine/engine/format.ts";
import {formatNumber} from "@coreModule/helpers/general/numbers.ts";

function currencyOf(row: RevenueByCurrency) {
    return {symbol: row.currencySymbol, abbreviation: row.currencyName, decimalPlaces: row.currencyDecimalPlaces};
}

/**
 * Each currency's amount at its own decimal places (D90), in the panel's one money format (UX-07: "€ 12.50"),
 * joined with " · "; "—" when there is none.
 */
export function formatRevenueByCurrencyLines(rows: RevenueByCurrency[] | undefined): string {
    if (!rows?.length) return "—";
    return rows.map((row) => formatAmountWithCurrency(row.value ?? 0, currencyOf(row))).join(" · ");
}

/**
 * The same amounts shortened from 1,000 up ("€ 1.8M · CHF 332.6K") for a dashboard tile, which shows the exact
 * {@link formatRevenueByCurrencyLines} on hover. Below 1,000 the amount stays exact; the currency still comes first.
 */
export function formatRevenueByCurrencyCompact(rows: RevenueByCurrency[] | undefined): string {
    if (!rows?.length) return "—";
    return rows
        .map((row) => {
            const value = row.value ?? 0;
            if (Math.abs(value) < 1_000) return formatAmountWithCurrency(value, currencyOf(row));
            const label = row.currencySymbol?.trim() || row.currencyName?.trim() || "";
            const short = formatNumber(value, {compact: true});
            return label ? `${label} ${short}` : short;
        })
        .join(" · ");
}

import type {RevenueByCurrency} from "armonia/src/modules/propertyManagement/api/realEstate/private/dashboard/dashboard.form.response.type.ts";
import {formatAmountWithCurrency} from "@coreModule/components/viewEngine/engine/format.ts";

/**
 * Each currency's amount at its own decimal places (D90), in the panel's one money format (UX-07: "€ 12.50"),
 * joined with " · "; "—" when there is none.
 */
export function formatRevenueByCurrencyLines(rows: RevenueByCurrency[] | undefined): string {
    if (!rows?.length) return "—";
    return rows
        .map((row) => formatAmountWithCurrency(row.value ?? 0, {
            symbol: row.currencySymbol,
            abbreviation: row.currencyName,
            decimalPlaces: row.currencyDecimalPlaces,
        }))
        .join(" · ");
}

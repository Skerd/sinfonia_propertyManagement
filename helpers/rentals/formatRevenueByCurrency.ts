import type {RevenueByCurrency} from "armonia/src/modules/propertyManagement/api/realEstate/private/dashboard/dashboard.form.response.type.ts";
import {DEFAULT_DECIMAL_PLACES} from "armonia/src/modules/core/helpers/money.ts";

/** Each currency's amount at its own decimal places (D90), joined with " · "; "—" when there is none. */
export function formatRevenueByCurrencyLines(
    rows: RevenueByCurrency[] | undefined,
    locale: string,
): string {
    if (!rows?.length) return "—";
    return rows
        .map((row) => {
            const decimals = row.currencyDecimalPlaces ?? DEFAULT_DECIMAL_PLACES;
            const formatted = new Intl.NumberFormat(locale, {
                minimumFractionDigits: decimals,
                maximumFractionDigits: decimals,
            }).format(row.value ?? 0);
            const suffix = row.currencySymbol ?? row.currencyName ?? "";
            return suffix ? `${formatted} ${suffix}` : formatted;
        })
        .join(" · ");
}

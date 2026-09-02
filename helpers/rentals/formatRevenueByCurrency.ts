import type {RevenueByCurrency} from "armonia/src/modules/propertyManagement/api/realEstate/private/dashboard/dashboard.form.response.type.ts";

export function formatRevenueByCurrencyLines(
    rows: RevenueByCurrency[] | undefined,
    locale: string,
): string {
    if (!rows?.length) return "—";
    return rows
        .map((row) => {
            const formatted = new Intl.NumberFormat(locale, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            }).format(row.value ?? 0);
            const suffix = row.currencySymbol ?? row.currencyName ?? "";
            return suffix ? `${formatted} ${suffix}` : formatted;
        })
        .join(" · ");
}

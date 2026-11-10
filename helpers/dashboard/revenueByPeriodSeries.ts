import type {ChartConfig} from "@coreModule/components/ui/chart.tsx";
import type {PeriodDatum} from "armonia/src/modules/propertyManagement/api/realEstate/private/dashboard/dashboard.form.response.type.ts";

const SERIES_COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];

/**
 * The revenue-by-month bars, one series per sale currency: revenue in two currencies is never added or stacked
 * (GLB-08). Each row is a month with one key per currency it has revenue in.
 */
export function revenueByPeriodSeries(revenueByPeriod: PeriodDatum[], formatMonth: (month: string) => string) {
    const config: ChartConfig = {};
    const keys: string[] = [];
    const data = revenueByPeriod.map((period) => {
        const row: Record<string, string | number> = {name: formatMonth(period.month)};
        for (const revenue of period.revenue ?? []) {
            const key = `currency_${revenue.currencyId}`;
            if (!config[key]) {
                config[key] = {label: revenue.currencySymbol || revenue.currencyName || "", color: SERIES_COLORS[keys.length % SERIES_COLORS.length]};
                keys.push(key);
            }
            row[key] = revenue.value;
        }
        return row;
    });
    return {data, config, keys};
}

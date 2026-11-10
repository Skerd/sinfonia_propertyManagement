import {describe, expect, it} from "vitest";
import type {RevenueByCurrency} from "armonia/src/modules/propertyManagement/api/realEstate/private/dashboard/dashboard.form.response.type.ts";
import {dashboardSummaryToRevenueChart} from "@propertyManagementModule/components/custom/dashboard/revenueChart.tsx";

const chf = (value: number): RevenueByCurrency => ({currencyId: "chf", currencySymbol: "CHF", value});
const eur = (value: number): RevenueByCurrency => ({currencyId: "eur", currencyName: "Euro", value});

type ChartSummary = NonNullable<Parameters<typeof dashboardSummaryToRevenueChart>[0]>;

const summary = (rows: Partial<ChartSummary>): ChartSummary => ({
    totalRevenue: [],
    inventoryValue: [],
    verifiedPaidUnitCosts: [],
    verifiedOutstandingUnitCosts: [],
    paymentPlans: {byStatus: {active: 0, completed: 0, defaulted: 0, cancelled: 0}, totalOutstanding: [], overdueInstallmentsCount: 0},
    ...rows,
});

describe("dashboardSummaryToRevenueChart (TD-B171)", () => {
    it("builds one series per currency from real summary figures, never adding two currencies", () => {
        const series = dashboardSummaryToRevenueChart(summary({
            totalRevenue: [chf(200000.1), eur(300000)],
            inventoryValue: [chf(249999.99)],
            paymentPlans: {byStatus: {active: 1, completed: 0, defaulted: 0, cancelled: 0}, totalOutstanding: [eur(124999.45)], overdueInstallmentsCount: 0},
            verifiedPaidUnitCosts: [chf(300.35)],
            verifiedOutstandingUnitCosts: [chf(5000.5)],
        }));
        expect(series).toEqual([
            {currencyId: "chf", currencyLabel: "CHF", soldValue: 200000.1, pendingSales: 0, unsoldValue: 249999.99, totalExpenses: 5300.85},
            {currencyId: "eur", currencyLabel: "Euro", soldValue: 300000, pendingSales: 124999.45, unsoldValue: 0, totalExpenses: 0},
        ]);
    });

    it("has no series without a summary", () => {
        expect(dashboardSummaryToRevenueChart(undefined)).toEqual([]);
    });
});

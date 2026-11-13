import {render, screen} from "@testing-library/react";
import {describe, expect, it} from "vitest";
import type {RoiCurrencyTotals, RoiProjectSummary} from "armonia/src/modules/propertyManagement/api/realEstate/private/roi/roi.response.type.ts";
import type {ResolveLanguageKey} from "@coreModule/helpers/hocs/withLanguage.tsx";
import RoiSummaryCharts from "../roiSummaryCharts.tsx";

const resolveLanguageKey = ((key: string) => key) as ResolveLanguageKey;

const total = (currencySymbol: string, roiPercent: number): RoiCurrencyTotals => ({
    currencySymbol, decimals: 2, totalRevenue: 1000, totalCosts: 400, netProfit: 600, roiPercent,
});

const summary = (totals: RoiCurrencyTotals[]): RoiProjectSummary => ({
    scopeType: "project", scopeLabel: "Aria Residences", projectId: "project-1", projectName: "Aria Residences",
    totalUnits: 4, soldUnits: 2, availableUnits: 1, rentedUnits: 1, totals, averageRoiPercent: 50,
});

// TD-B223: amounts in different currencies never share a chart or a total.
describe("the ROI summary charts", () => {
    it("draws one financial chart for a single currency, titled as before, with its ROI", () => {
        const {container} = render(<RoiSummaryCharts summary={summary([total("€", 150)])} resolveLanguageKey={resolveLanguageKey} />);
        expect(screen.getAllByText("charts.financialTitle")).toHaveLength(1);
        expect(container.textContent).toContain("150.0%");
        expect(container.textContent).not.toContain("(€)");
    });

    it("draws one financial chart per currency and names each currency's ROI", () => {
        const {container} = render(<RoiSummaryCharts summary={summary([total("CHF", -10), total("€", 150)])} resolveLanguageKey={resolveLanguageKey} />);
        expect(screen.getByText("charts.financialTitle · CHF")).toBeTruthy();
        expect(screen.getByText("charts.financialTitle · €")).toBeTruthy();
        expect(container.textContent).toContain("-10.0% (CHF)");
        expect(container.textContent).toContain("150.0% (€)");
    });

    it("draws no financial chart without sales or costs", () => {
        const {container} = render(<RoiSummaryCharts summary={summary([])} resolveLanguageKey={resolveLanguageKey} />);
        expect(screen.queryByText("charts.financialTitle")).toBeNull();
        expect(container.textContent).toContain("projectSummary.roi: —");
    });
});

import {render, screen} from "@testing-library/react";
import {describe, expect, it} from "vitest";
import type {RoiCurrencyTotals, RoiProjectSummary} from "armonia/src/modules/propertyManagement/api/realEstate/private/roi/roi.response.type.ts";
import type {ResolveLanguageKey} from "@coreModule/helpers/hocs/withLanguage.tsx";
import RoiSummaryCharts, {formatAxisMoney} from "../roiSummaryCharts.tsx";

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

// TD-F102: the financial chart's domain ends at 112 % of the largest bar, so its ticks fall between minor units.
describe("the ROI financial chart's Y-axis ticks", () => {
    it("never show more fraction digits than the currency has", () => {
        expect(formatAxisMoney(2063445.1712, 2, "€")).toBe("2,063,445.17 €");
        expect(formatAxisMoney(1.00049, 3, "KD")).toBe("1 KD");
        expect(formatAxisMoney(1.0456, 3, "KD")).toBe("1.046 KD");
        expect(formatAxisMoney(1234.5, 0, "¥")).toBe("1,235 ¥");
    });

    it("keep round ticks short and read without a symbol the caller may not see", () => {
        expect(formatAxisMoney(500000, 2, "€")).toBe("500,000 €");
        expect(formatAxisMoney(0.5, 2)).toBe("0.5");
    });
});

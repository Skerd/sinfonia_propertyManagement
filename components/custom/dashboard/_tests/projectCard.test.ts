import {describe, expect, it} from "vitest";
import type {Project} from "armonia/src/modules/propertyManagement/api/realEstate/private/project/project.dto.ts";
import {getProjectStatsFromStatistics} from "@propertyManagementModule/components/custom/dashboard/projectCard.tsx";

const eur = {_id: "eur", name: "Euro", symbol: "€", abbreviation: "EUR"};
const chf = {_id: "chf", name: "Swiss franc", symbol: "", abbreviation: "CHF"};
const project = (statistics: Project["statistics"]): Project => ({_id: "p1", name: "Aria Residence", statistics} as Project);

describe("getProjectStatsFromStatistics", () => {
    it("shows the listing value and the money collected, like the building cards", () => {
        const stats = getProjectStatsFromStatistics(project({
            totalUnits: 56,
            totalInvestmentValue: [{value: 62_000_000, currency: eur}],
            totalValue: [{value: 21_476_707, currency: eur}, {value: 500_000, currency: chf}],
            collectedAmount: [{value: 1_411_503.9, currency: eur}],
        }));
        // One amount per currency, never a sum of euros and francs (TD-F136).
        expect(stats.totalValue).toEqual([{value: 21_476_707, symbol: "€"}, {value: 500_000, symbol: "CHF"}]);
        expect(stats.collectedAmount).toEqual([{value: 1_411_503.9, symbol: "€"}]);
    });

    it("has no amounts when the project has no statistics yet", () => {
        const stats = getProjectStatsFromStatistics(project(undefined));
        expect(stats.totalValue).toEqual([]);
        expect(stats.collectedAmount).toEqual([]);
    });
});

import {describe, expect, it} from "vitest";
import type {Project} from "armonia/src/modules/propertyManagement/api/realEstate/private/project/project.dto.ts";
import {getProjectStatsFromStatistics} from "@propertyManagementModule/components/custom/dashboard/projectCard.tsx";

const project = (statistics: Project["statistics"]): Project => ({_id: "p1", name: "Aria Residence", statistics} as Project);

describe("getProjectStatsFromStatistics", () => {
    it("shows the listing value and the money collected, like the building cards", () => {
        const stats = getProjectStatsFromStatistics(project({
            totalUnits: 56,
            totalInvestmentValue: [{value: 62_000_000}],
            totalValue: [{value: 21_476_707}],
            collectedAmount: [{value: 1_411_503.9}],
        }));
        expect(stats.totalValue).toBe(21_476_707);
        expect(stats.collectedAmount).toBe(1_411_503.9);
    });

    it("reads zero when the project has no statistics yet", () => {
        const stats = getProjectStatsFromStatistics(project(undefined));
        expect(stats.totalValue).toBe(0);
        expect(stats.collectedAmount).toBe(0);
    });
});

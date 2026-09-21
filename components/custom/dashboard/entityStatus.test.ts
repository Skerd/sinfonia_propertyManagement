/**
 * `entityStatus.types.ts` is pure, so it is the one part of the card system that can be pinned
 * exactly. `formatCompactCurrency` feeds the dashboard value row; `unitsByStatusToEntityStats`
 * feeds both the breakdown bar and the badge row.
 */
import {describe, expect, it} from "vitest";
import {
    formatCompactCurrency,
    unitsByStatusToEntityStats,
} from "@propertyManagementModule/components/custom/dashboard/entityStatus.types.ts";

describe("unitsByStatusToEntityStats", () => {
    it("maps the server's status buckets onto the card vocabulary", () => {
        expect(
            unitsByStatusToEntityStats({available: 1, reserved: 2, sold: 3, unavailable: 4, leased: 5}),
        ).toEqual({available: 1, reserved: 2, sold: 3, blocked: 4, leased: 5, totalUnits: 15});
    });

    it("treats missing buckets as zero", () => {
        expect(unitsByStatusToEntityStats(undefined)).toEqual({
            available: 0,
            reserved: 0,
            sold: 0,
            blocked: 0,
            leased: 0,
            totalUnits: 0,
        });
    });

    it("lets an explicit total override the sum", () => {
        expect(unitsByStatusToEntityStats({sold: 2}, 10).totalUnits).toBe(10);
    });
});

describe("formatCompactCurrency", () => {
    it("compacts millions and thousands", () => {
        expect(formatCompactCurrency(2_500_000)).toContain("2.5M");
        expect(formatCompactCurrency(2_000)).toContain("2K");
    });

    it("leaves small amounts uncompacted", () => {
        expect(formatCompactCurrency(250)).toContain("250");
    });

    /*
     * C10 regression. Every threshold used `>=`, so negatives fell through to the bare branch
     * and rendered unformatted — a -2,000,000 balance printed as "-2000000".
     */
    it("compacts negative amounts with the same thresholds", () => {
        expect(formatCompactCurrency(-2_500_000)).toContain("-2.5M");
        expect(formatCompactCurrency(-2_000)).toContain("-2K");
    });

    /* C10 regression: the symbol was hard-coded to €, so a CHF tenant saw euro amounts. */
    it("uses the currency symbol it is given", () => {
        expect(formatCompactCurrency(2_500_000, "CHF")).toBe("2.5M CHF");
        expect(formatCompactCurrency(250, "$")).toBe("250 $");
    });

    it("still defaults to € for existing callers", () => {
        expect(formatCompactCurrency(250)).toBe("250 €");
    });
});

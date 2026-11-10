import {describe, expect, it} from "vitest";
import {kpiCollected} from "@propertyManagementModule/helpers/dashboard/kpiDrillDown.ts";
import {EMPTY_PAYMENTS_SCOPE, scopeFromSearchParams} from "../paymentsHubHelpers.ts";

const scopeOf = (url: string) => scopeFromSearchParams(new URL(url, "https://panel.test").searchParams);

describe("payments hub scope from the URL (TD-B178)", () => {
    it("opens on the dashboard's Collected period: paid day, from / to and edifice", () => {
        const url = kpiCollected({from: "2026-05-01", to: "2026-05-31", edificeId: "64b7f0c2a1b2c3d4e5f60718", edificeName: "Block A"});
        expect(url.startsWith("/realEstate/paymentsHub?")).toBe(true);
        expect(scopeOf(url)).toEqual({
            ...EMPTY_PAYMENTS_SCOPE,
            edifice: "64b7f0c2a1b2c3d4e5f60718",
            dateField: "paidDate",
            dateFrom: "2026-05-01",
            dateTo: "2026-05-31",
        });
    });

    it("keeps the status and unit links working", () => {
        expect(scopeOf("/realEstate/paymentsHub?status=overdue&unit=u1")).toEqual({...EMPTY_PAYMENTS_SCOPE, status: "overdue", unit: "u1"});
    });

    it("ignores an unknown status or date field and a day that is not YYYY-MM-DD", () => {
        expect(scopeOf("/realEstate/paymentsHub?status=lost&dateField=createdAt&dateFrom=05/01/2026&dateTo=2026-5-31")).toEqual(EMPTY_PAYMENTS_SCOPE);
    });

    it("without a period, opens on every paid row", () => {
        expect(scopeOf(kpiCollected({}))).toEqual({...EMPTY_PAYMENTS_SCOPE, dateField: "paidDate"});
    });
});

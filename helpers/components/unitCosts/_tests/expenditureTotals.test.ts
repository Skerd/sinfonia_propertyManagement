import {describe, expect, it} from "vitest";
import {expenditureTotals} from "@propertyManagementModule/helpers/components/unitCosts/expenditureTotals.ts";

describe("unit cost expenditure totals", () => {
    it("multiplies each line exactly and sums the lines", () => {
        expect(expenditureTotals([
            {amount: 3, pricePerUnit: "0.1"},
            {amount: "2.5", pricePerUnit: "19.99"},
        ])).toEqual({lineTotals: [0.3, 49.98], subtotal: 50.28});
    });

    it("rounds the unit price to cents first, as the server does", () => {
        expect(expenditureTotals([{amount: 10, pricePerUnit: "1.005"}]).lineTotals).toEqual([10.1]);
    });

    it("leaves a line out until both numbers are typed", () => {
        expect(expenditureTotals([
            {amount: 1, pricePerUnit: ""},
            {amount: "", pricePerUnit: "5"},
            {amount: 2, pricePerUnit: "1."},
        ])).toEqual({lineTotals: [undefined, undefined, 2], subtotal: 2});
    });

    it("rounds at the picked currency's decimal places", () => {
        const lines = [{amount: 3, pricePerUnit: "1.0005"}, {amount: 2, pricePerUnit: "0.3333"}];
        expect(expenditureTotals(lines, 3)).toEqual({lineTotals: [3.003, 0.666], subtotal: 3.669});
        expect(expenditureTotals(lines, 0)).toEqual({lineTotals: [3, 0], subtotal: 3});
    });
});

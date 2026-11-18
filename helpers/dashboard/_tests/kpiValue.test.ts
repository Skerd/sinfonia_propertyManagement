import {describe, expect, it} from "vitest";
import {formatNumber} from "@coreModule/helpers/general/numbers.ts";
import {kpiCount, kpiMoney} from "../kpiValue.ts";
import {formatRevenueByCurrencyLines} from "../../rentals/formatRevenueByCurrency.ts";

describe("kpiCount", () => {
    it("keeps counts under 10,000 exact", () => {
        expect(kpiCount(9_999)).toEqual({value: formatNumber(9_999), fullValue: formatNumber(9_999)});
    });

    it("shortens from 10,000 and keeps the exact count for hover", () => {
        expect(kpiCount(74_396)).toEqual({value: formatNumber(74_396, {compact: true}), fullValue: formatNumber(74_396)});
    });
});

describe("kpiMoney", () => {
    it("pairs the short amounts with the exact ones", () => {
        const rows = [{currencyId: "eur", currencySymbol: "€", value: 368_472.35}];
        expect(kpiMoney(rows).fullValue).toBe(formatRevenueByCurrencyLines(rows));
        expect(kpiMoney(rows).value).toBe(`€ ${formatNumber(368_472.35, {compact: true})}`);
    });
});

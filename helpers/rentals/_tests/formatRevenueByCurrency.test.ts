import {describe, expect, it} from "vitest";
import {formatRevenueByCurrencyLines} from "../formatRevenueByCurrency.ts";

describe("formatRevenueByCurrencyLines (TD-B176)", () => {
    it("shows each currency at its own decimal places, 2 when the row does not say", () => {
        expect(formatRevenueByCurrencyLines([
            {currencyId: "jpy", currencySymbol: "¥", currencyDecimalPlaces: 0, value: 1500},
            {currencyId: "kwd", currencySymbol: "KD", currencyDecimalPlaces: 3, value: 12.5},
            {currencyId: "chf", currencySymbol: "CHF", value: 10},
        ], "en-US")).toBe("1,500 ¥ · 12.500 KD · 10.00 CHF");
    });

    it("shows a dash when there is no amount", () => {
        expect(formatRevenueByCurrencyLines([], "en-US")).toBe("—");
        expect(formatRevenueByCurrencyLines(undefined, "en-US")).toBe("—");
    });
});

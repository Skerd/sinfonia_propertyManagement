import {describe, expect, it} from "vitest";
import {formatAmountWithCurrency} from "@coreModule/components/viewEngine/engine/format.ts";
import {formatRevenueByCurrencyLines} from "../formatRevenueByCurrency.ts";

describe("formatRevenueByCurrencyLines (TD-B176)", () => {
    it("shows each currency at its own decimal places, 2 when the row does not say", () => {
        expect(formatRevenueByCurrencyLines([
            {currencyId: "jpy", currencySymbol: "¥", currencyDecimalPlaces: 0, value: 1500},
            {currencyId: "kwd", currencySymbol: "KD", currencyDecimalPlaces: 3, value: 12.5},
            {currencyId: "chf", currencySymbol: "CHF", value: 10},
        ])).toBe([
            formatAmountWithCurrency(1500, {symbol: "¥", decimalPlaces: 0}),
            formatAmountWithCurrency(12.5, {symbol: "KD", decimalPlaces: 3}),
            formatAmountWithCurrency(10, {symbol: "CHF"}),
        ].join(" · "));
    });

    it("prints the symbol before the amount, like every other amount in the panel (UX-07)", () => {
        expect(formatRevenueByCurrencyLines([{currencyId: "eur", currencySymbol: "€", value: 950}])).toBe(
            formatAmountWithCurrency(950, {symbol: "€", decimalPlaces: 2}),
        );
        expect(formatRevenueByCurrencyLines([{currencyId: "eur", currencySymbol: "€", value: 950}]).startsWith("€ ")).toBe(true);
    });

    it("falls back to the currency name when the row has no symbol", () => {
        expect(formatRevenueByCurrencyLines([{currencyId: "x", currencyName: "Lek", value: 5}]).startsWith("Lek ")).toBe(true);
    });

    it("shows a dash when there is no amount", () => {
        expect(formatRevenueByCurrencyLines([])).toBe("—");
        expect(formatRevenueByCurrencyLines(undefined)).toBe("—");
    });
});

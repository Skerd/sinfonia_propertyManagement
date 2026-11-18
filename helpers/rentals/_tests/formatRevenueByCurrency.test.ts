import {describe, expect, it} from "vitest";
import {formatAmountWithCurrency} from "@coreModule/components/viewEngine/engine/format.ts";
import {formatNumber} from "@coreModule/helpers/general/numbers.ts";
import {formatRevenueByCurrencyCompact, formatRevenueByCurrencyLines} from "../formatRevenueByCurrency.ts";

describe("formatRevenueByCurrencyCompact", () => {
    it("shortens each currency from 1,000 up, symbol first like the full format", () => {
        expect(formatRevenueByCurrencyCompact([
            {currencyId: "eur", currencySymbol: "€", value: 1_842_361.76},
            {currencyId: "chf", currencySymbol: "CHF", value: 332_608},
        ])).toBe(`€ ${formatNumber(1_842_361.76, {compact: true})} · CHF ${formatNumber(332_608, {compact: true})}`);
        expect(formatNumber(1_842_361.76, {compact: true})).toMatch(/1[.,]8\s?M/);
    });

    it("keeps an amount under 1,000 exact at its decimals", () => {
        expect(formatRevenueByCurrencyCompact([{currencyId: "eur", currencySymbol: "€", value: 950}])).toBe(
            formatAmountWithCurrency(950, {symbol: "€", decimalPlaces: 2}),
        );
    });

    it("falls back to the currency name, and shows a dash when there is no amount", () => {
        expect(formatRevenueByCurrencyCompact([{currencyId: "x", currencyName: "Lek", value: 25_000}]).startsWith("Lek ")).toBe(true);
        expect(formatRevenueByCurrencyCompact(undefined)).toBe("—");
    });
});

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

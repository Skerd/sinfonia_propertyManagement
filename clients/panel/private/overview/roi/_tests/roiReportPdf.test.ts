import {describe, expect, it} from "vitest";
import {formatRoiMoney} from "../roiReportPdf.ts";

// TD-F103: a unit's sale price, net profit and rent are shown at their currency's decimals, in the table and the PDF.
describe("a unit's ROI amount", () => {
    it("has no decimals in a 0-decimal currency", () => {
        expect(formatRoiMoney({amount: 30000000, decimals: 0, currencySymbol: "JPY"})).toBe("30,000,000 JPY");
        expect(formatRoiMoney({amount: -1250000, decimals: 0, currencySymbol: "JPY"})).toBe("-1,250,000 JPY");
    });

    it("keeps three decimals in a 3-decimal currency", () => {
        expect(formatRoiMoney({amount: 69999.625, decimals: 3, currencySymbol: "KWD"})).toBe("69,999.625 KWD");
        expect(formatRoiMoney({amount: 450.5, decimals: 3, currencySymbol: "KWD"})).toBe("450.500 KWD");
    });

    it("leaves the symbol off when it may not be read, and reads — without an amount", () => {
        expect(formatRoiMoney({amount: 1000, decimals: 2})).toBe("1,000.00");
        expect(formatRoiMoney(undefined)).toBe("—");
    });
});

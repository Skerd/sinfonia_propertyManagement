import {describe, expect, it} from "vitest";
import {DATE_FORMATS, formatDate} from "@coreModule/helpers/general/dateTime.ts";
import {fmtDate, fmtMoney, unitLabel} from "../rentalsHubHelpers.ts";
import {fmtDate as contractFmtDate, fmtDateTime} from "../../contractsHub/contractsHubHelpers.ts";

const UTC_MIDNIGHT = "2026-03-15T00:00:00.000Z";

describe("hub fmtDate", () => {
    it("prints a UTC-midnight instant as the UTC calendar day even for New York, in the panel's medium date (UX-08)", () => {
        const utcDay = formatDate(UTC_MIDNIGHT, {timeZone: "UTC", format: DATE_FORMATS.mediumDate});
        const nyDay = formatDate(UTC_MIDNIGHT, {timeZone: "America/New_York", format: DATE_FORMATS.mediumDate});
        expect(fmtDate(UTC_MIDNIGHT, "America/New_York")).toBe(utcDay);
        expect(contractFmtDate(UTC_MIDNIGHT, "America/New_York")).toBe(utcDay);
        expect(utcDay).not.toBe(nyDay);
    });

    it("prints datetimes in the profile timezone", () => {
        expect(fmtDateTime(UTC_MIDNIGHT, "America/New_York")).toBe(
            formatDate(UTC_MIDNIGHT, {timeZone: "America/New_York", format: DATE_FORMATS.mediumDateTime}),
        );
        expect(fmtDateTime(UTC_MIDNIGHT, "America/New_York")).not.toBe(
            formatDate(UTC_MIDNIGHT, {timeZone: "UTC", format: DATE_FORMATS.mediumDateTime}),
        );
    });

    it("prints a dash for a missing day", () => {
        expect(fmtDate(undefined)).toBe("—");
    });
});

describe("hub fmtMoney", () => {
    it("puts the row's symbol first and keeps the currency's decimals", () => {
        expect(fmtMoney(950, {symbol: "€", decimalPlaces: 2})).toMatch(/^€ 950[.,]00$/);
        expect(fmtMoney(1500, {symbol: "¥", decimalPlaces: 0})).toMatch(/^¥ 1.?500$/);
    });

    it("prints a dash when there is no amount", () => {
        expect(fmtMoney(undefined, {symbol: "€"})).toBe("—");
    });
});

describe("hub unitLabel", () => {
    it("shows the name once when the number says the same", () => {
        expect(unitLabel({name: "A0-05 Floor 0", unitNumber: "A0-05 Floor 0"})).toBe("A0-05 Floor 0");
    });

    it("shows name and number when they differ, or whichever exists", () => {
        expect(unitLabel({name: "Garden flat", unitNumber: "A0-05"})).toBe("Garden flat / A0-05");
        expect(unitLabel({unitNumber: 12})).toBe("12");
        expect(unitLabel(undefined)).toBe("—");
    });
});

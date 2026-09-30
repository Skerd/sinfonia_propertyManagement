import {describe, expect, it} from "vitest";
import {formatDate} from "@coreModule/helpers/general/dateTime.ts";
import {fmtDate} from "../rentalsHubHelpers.ts";
import {fmtDate as contractFmtDate, fmtDateTime} from "../../contractsHub/contractsHubHelpers.ts";

const UTC_MIDNIGHT = "2026-03-15T00:00:00.000Z";
const DAY_FORMAT: Intl.DateTimeFormatOptions = {day: "2-digit", month: "2-digit", year: "numeric"};

describe("hub fmtDate", () => {
    it("prints a UTC-midnight instant as the UTC calendar day even for New York", () => {
        const utcDay = formatDate(UTC_MIDNIGHT, {timeZone: "UTC", format: DAY_FORMAT});
        const nyDay = formatDate(UTC_MIDNIGHT, {timeZone: "America/New_York", format: DAY_FORMAT});
        expect(fmtDate(UTC_MIDNIGHT, "America/New_York")).toBe(utcDay);
        expect(contractFmtDate(UTC_MIDNIGHT, "America/New_York")).toBe(utcDay);
        expect(utcDay).not.toBe(nyDay);
    });

    it("prints datetimes in the profile timezone", () => {
        expect(fmtDateTime(UTC_MIDNIGHT, "America/New_York")).toBe(
            formatDate(UTC_MIDNIGHT, {
                timeZone: "America/New_York",
                format: {...DAY_FORMAT, hour: "2-digit", minute: "2-digit"},
            }),
        );
        expect(fmtDateTime(UTC_MIDNIGHT, "America/New_York")).not.toBe(
            formatDate(UTC_MIDNIGHT, {
                timeZone: "UTC",
                format: {...DAY_FORMAT, hour: "2-digit", minute: "2-digit"},
            }),
        );
    });
});

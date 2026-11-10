import {describe, expect, it} from "vitest";
import {addDays, companyToday, monthOf} from "../companyDay.ts";

describe("company calendar days (D115, D116)", () => {
    it("takes today where the company is: 00:30 in Zurich is already the next day", () => {
        const now = new Date("2026-02-28T23:30:00Z");
        expect(companyToday("Europe/Zurich", now)).toBe("2026-03-01");
        expect(companyToday("UTC", now)).toBe("2026-02-28");
    });

    it("steps whole days across a DST change and month ends", () => {
        // Zurich springs forward on 2026-03-29; a day is still one day.
        expect(addDays("2026-03-28", 1)).toBe("2026-03-29");
        expect(addDays("2026-03-29", 1)).toBe("2026-03-30");
        expect(addDays("2026-02-28", 1)).toBe("2026-03-01");
        expect(addDays("2026-03-01", -1)).toBe("2026-02-28");
        expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
    });

    it("bounds the month a day falls in", () => {
        expect(monthOf("2026-02-14")).toEqual({from: "2026-02-01", to: "2026-02-28"});
        expect(monthOf("2028-02-14")).toEqual({from: "2028-02-01", to: "2028-02-29"});
    });
});

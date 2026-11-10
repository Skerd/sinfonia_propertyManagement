import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";
import type {RentalPayment} from "armonia/src/modules/propertyManagement/api/realEstate/private/rentalPayment/rentalPayment.dto.ts";
import type {InstallmentRowForEmail} from "@propertyManagementModule/clients/panel/private/sales/center/actions/manualInstallmentClientEmails.tsx";
import {rentEmailVisibility} from "@propertyManagementModule/clients/panel/private/leases/center/actions/manualRentClientEmails.tsx";
import {installmentEmailVisibility} from "@propertyManagementModule/clients/panel/private/sales/center/actions/manualInstallmentClientEmails.tsx";

/** Due 1 March, stored at midnight UTC like every calendar day today. */
const DUE = "2026-03-01T00:00:00.000Z";
const rent: RentalPayment = {_id: "r1", dueDate: DUE, amount: 1000, remaining: 1000, status: "pending"};
const installment: InstallmentRowForEmail = {installmentNumber: 1, dueDate: DUE, amount: 1000, principalAmount: 1000, interestAmount: 0, status: "pending"};

describe("manual rent and installment emails count days in the company's zone (TD-B140)", () => {
    beforeEach(() => {
        vi.useFakeTimers();
        // 00:30 on 2 March in Zurich: the 1 March due day is over there, not yet in UTC.
        vi.setSystemTime(new Date("2026-03-01T23:30:00Z"));
    });
    afterEach(() => vi.useRealTimers());

    it("offers the overdue notice once the due day is over where the company is", () => {
        expect(rentEmailVisibility(rent, "Europe/Zurich")).toMatchObject({"0d": false, remaining_days: false, overdue: true});
        expect(rentEmailVisibility(rent, "UTC")).toMatchObject({"0d": true, remaining_days: true, overdue: false});
        expect(installmentEmailVisibility(installment, "Europe/Zurich")).toMatchObject({installment_remind_today: false, installment_send_overdue: true});
        expect(installmentEmailVisibility(installment, "UTC")).toMatchObject({installment_remind_today: true, installment_send_overdue: false});
    });

    it("offers nothing for a paid row", () => {
        expect(Object.values(rentEmailVisibility({...rent, status: "paid", remaining: 0}, "Europe/Zurich")).some(Boolean)).toBe(false);
        expect(Object.values(installmentEmailVisibility({...installment, status: "paid"}, "Europe/Zurich")).some(Boolean)).toBe(false);
    });
});

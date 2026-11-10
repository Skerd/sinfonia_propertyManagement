import {describe, expect, it} from "vitest";
import type {PaymentsHubRow} from "armonia/src/modules/propertyManagement/api/realEstate/private/paymentsHub/paymentsHub.dto.ts";
import {kindLabel, rowCode, rowTarget} from "../paymentsHubHelpers.ts";

const row = (overrides: Partial<PaymentsHubRow> & Pick<PaymentsHubRow, "kind">): PaymentsHubRow => ({
    _id: "row",
    status: "paid",
    ...overrides,
});

const rk = (key: string) => `<${key}>`;

describe("payments hub rows (TD-B180)", () => {
    it("labels every kind, numbering installments", () => {
        expect(kindLabel(row({kind: "installment", installmentNumber: 3}), rk)).toBe("<kind.installmentNumbered>");
        expect(kindLabel(row({kind: "installment"}), rk)).toBe("<kind.installment>");
        expect(kindLabel(row({kind: "down_payment"}), rk)).toBe("<kind.down_payment>");
        expect(kindLabel(row({kind: "cash_sale"}), rk)).toBe("<kind.cash_sale>");
        expect(kindLabel(row({kind: "reservation_deposit"}), rk)).toBe("<kind.reservation_deposit>");
    });

    it("opens a plan row's plan, a cash sale's sale and a deposit's reservation", () => {
        expect(rowTarget(row({kind: "installment", planId: "p1", saleId: "s1"}))).toEqual({type: "plan", id: "p1"});
        expect(rowTarget(row({kind: "down_payment", planId: "p1", saleId: "s1"}))).toEqual({type: "plan", id: "p1"});
        expect(rowTarget(row({kind: "cash_sale", saleId: "s2"}))).toEqual({type: "sale", id: "s2"});
        expect(rowTarget(row({kind: "reservation_deposit", reservationId: "r1"}))).toEqual({type: "reservation", id: "r1"});
        expect(rowTarget(row({kind: "reservation_deposit"}))).toBeNull();
    });

    it("shows the sale's code, or a deposit's reservation code", () => {
        expect(rowCode(row({kind: "cash_sale", saleCode: "SALE-1"}))).toBe("SALE-1");
        expect(rowCode(row({kind: "reservation_deposit", reservationCode: "RES-1"}))).toBe("RES-1");
    });
});

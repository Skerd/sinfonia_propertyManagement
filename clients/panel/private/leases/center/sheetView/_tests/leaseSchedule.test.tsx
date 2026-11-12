import {render, screen} from "@testing-library/react";
import {describe, expect, it, vi} from "vitest";
import type {Lease} from "armonia/src/modules/propertyManagement/api/realEstate/private/lease/lease.dto.ts";

// Stable across renders, as the real hooks' results are.
const {requests, answer} = vi.hoisted(() => ({
    requests: [] as {url: string; body: Record<string, unknown>; count: number}[],
    answer: {data: {data: [], total: 0}, loading: false, error: null},
}));

vi.mock("@coreModule/helpers/hooks/useAccess.ts", () => ({useAccess: () => ({read: {tenant: {}}, write: true})}));
vi.mock("@coreModule/helpers/hooks/useCompanyTimeZone.ts", () => ({useCompanyTimeZone: () => "Europe/Zurich"}));
vi.mock("@coreModule/helpers/hooks/useHttpRequest.ts", () => ({
    default: (request: {url: string}, body: Record<string, unknown>, count: number) => {
        requests.push({url: request.url, body, count});
        return answer;
    },
}));
vi.mock("@propertyManagementModule/components/custom/leases/recordRentPaymentDialog.tsx", () => ({
    default: () => <p>record-dialog</p>,
}));

import LeaseSchedulePanel from "../leaseSchedulePanel.tsx";
import {LeaseScheduleRequest} from "../leaseScheduleRequest.ts";
import {RECORD_RENT_PAYMENT_ACTION} from "@propertyManagementModule/clients/panel/private/leases/center/actions/recordRentPayment.tsx";

const lease: Lease = {_id: "lease-1", name: "LEASE-1", status: "active", startDate: "2026-11-12", endDate: "2027-11-11", monthlyRent: 1200};

describe("the lease rent schedule as a sheet token (#LeaseSchedule)", () => {
    it("loads the lease's own months, oldest due day first", () => {
        render(<LeaseSchedulePanel lease={lease} resolveLanguageKey={(key: string) => key} />);

        const sent = requests.filter((request) => request.url === "/api/realEstate/rentalPayment" && request.count > 0).at(-1);
        expect(sent?.body).toMatchObject({lease: "lease-1", sortBy: "dueDate", sortOrder: "asc"});
    });

    it("opens the record payment dialog when the sheet menu asks for it, and reports the request handled", () => {
        const handled = vi.fn();
        render(
            <LeaseScheduleRequest.Provider value={{requestedAction: RECORD_RENT_PAYMENT_ACTION, onRequestedActionHandled: handled}}>
                <LeaseSchedulePanel lease={lease} resolveLanguageKey={(key: string) => key} />
            </LeaseScheduleRequest.Provider>,
        );

        expect(screen.getByText("record-dialog")).toBeTruthy();
        expect(handled).toHaveBeenCalled();
    });
});

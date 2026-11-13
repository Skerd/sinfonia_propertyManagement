import {fireEvent, render, screen} from "@testing-library/react";
import {useContext, type ReactNode} from "react";
import {describe, expect, it, vi} from "vitest";
import type {Lease} from "armonia/src/modules/propertyManagement/api/realEstate/private/lease/lease.dto.ts";
import {LeaseScheduleRequest} from "../leaseScheduleRequest.ts";

vi.mock("@coreModule/helpers/hooks/useAccess.ts", () => ({useAccess: () => ({read: true, write: true})}));
vi.mock("@coreModule/helpers/hooks/useViewConfig.ts", () => ({useViewConfig: () => ({nodes: []})}));
vi.mock("@coreModule/helpers/hocs/withLanguage.tsx", () => ({
    default: () => <P,>(Component: P) => Component,
}));
vi.mock("@coreModule/helpers/hocs/withDebug.tsx", () => ({
    default: () => <P,>(Component: P) => Component,
}));
// The renderer's menu: the sheet's own items, and what the schedule token was asked to open.
vi.mock("@coreModule/components/viewEngine/SheetViewRenderer.tsx", () => ({
    default: function SheetViewRendererMock({actionMenuChildren}: {actionMenuChildren: ReactNode}) {
        const {requestedAction} = useContext(LeaseScheduleRequest);
        return (
            <div>
                {actionMenuChildren}
                <p>schedule asked: {requestedAction || "nothing"}</p>
            </div>
        );
    },
}));
vi.mock("@propertyManagementModule/clients/panel/private/leases/center/actions/recordRentPayment.tsx", () => ({
    RECORD_RENT_PAYMENT_ACTION: "recordRentPayment",
    default: ({onAction}: {onAction: (action: string) => void}) => <button type="button" onClick={() => onAction("recordRentPayment")}>record</button>,
}));

import LeaseSheetView from "../leaseSheetView.tsx";

const lease: Lease = {_id: "lease-1", name: "LEASE-1", status: "active", startDate: "2026-11-12", endDate: "2027-11-11", monthlyRent: 1200};

// TD-F77: "Record rent payment" from the sheet menu opened the schedule's dialog and the card's.
describe("the lease sheet's record payment item", () => {
    it("asks only the rent schedule, never the card or list that opened the sheet", () => {
        const ownerAction = vi.fn();
        render(
            <LeaseSheetView open onOpenChange={() => {}} lease={lease} onActionMenuAction={ownerAction} resolveLanguageKey={(key: string) => key} />,
        );

        fireEvent.click(screen.getByText("record"));

        expect(screen.getByText("schedule asked: recordRentPayment")).toBeTruthy();
        expect(ownerAction).not.toHaveBeenCalled();
    });
});

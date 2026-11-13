import {render, screen} from "@testing-library/react";
import {beforeEach, describe, expect, it, vi} from "vitest";
import type {Inspection} from "armonia/src/modules/propertyManagement/api/realEstate/private/unit/inspection/inspection.dto.ts";

const access = vi.hoisted(() => ({write: true, actions: {start: true, complete: true, reschedule: true, cancelScheduled: true, updateChecklistItems: true} as Record<string, boolean>}));
vi.mock("@coreModule/helpers/hooks/useAccess.ts", () => ({useAccess: () => ({read: true, write: access.write})}));
vi.mock("@coreModule/helpers/hooks/useActionAccess.ts", () => ({
    useActionAccess: (collection: string, action: string) => collection === "inspections" && access.actions[action] === true,
}));
// Each menu item as its name, so the test reads which ones the row offers.
vi.mock("@propertyManagementModule/clients/panel/private/inspections/center/actions/start.tsx", () => ({default: () => <p>start</p>}));
vi.mock("@propertyManagementModule/clients/panel/private/inspections/center/actions/complete.tsx", () => ({default: () => <p>complete</p>}));
vi.mock("@propertyManagementModule/clients/panel/private/inspections/center/actions/reschedule.tsx", () => ({default: () => <p>reschedule</p>}));
vi.mock("@propertyManagementModule/clients/panel/private/inspections/center/actions/cancel.tsx", () => ({default: () => <p>cancel</p>}));
vi.mock("@propertyManagementModule/clients/panel/private/inspections/center/actions/updateChecklist.tsx", () => ({default: () => <p>checklist</p>}));

import InspectionRowMenuExtras from "../inspectionRowMenuExtras.tsx";

const inspection = (status: string, checklistTemplate?: string): Inspection => ({
    _id: "inspection-1", name: "INSP-1", status, type: "routine", inspectionDate: "2026-11-20",
    unit: {_id: "unit-1", name: "A2-01"}, inspectedBy: {_id: "user-1", name: "Ana", surname: "Test"},
    media: [], followUpRequired: false, ...(checklistTemplate ? {checklistTemplate: {_id: checklistTemplate, name: "CHK-1"}} : {}),
});
const items = (status: string, checklistTemplate?: string) => {
    const {container} = render(<InspectionRowMenuExtras inspection={inspection(status, checklistTemplate)} onAction={() => {}} />);
    return Array.from(container.querySelectorAll("p"), (item) => item.textContent);
};

// TD-B215: Reschedule sits beside Start while the inspection has not started.
describe("the inspection row menu's reschedule item", () => {
    beforeEach(() => {
        access.write = true;
        access.actions = {start: true, complete: true, reschedule: true, cancelScheduled: true, updateChecklistItems: true};
    });

    it("is offered on a scheduled or rescheduled inspection", () => {
        expect(items("scheduled")).toContain("reschedule");
        expect(items("rescheduled")).toContain("reschedule");
    });

    it("is not offered once the inspection started, ended or was cancelled", () => {
        for (const status of ["in_progress", "completed", "cancelled"]) {
            expect(items(status)).not.toContain("reschedule");
        }
    });

    it("is not offered without the action's permission", () => {
        access.actions.reschedule = false;
        render(<InspectionRowMenuExtras inspection={inspection("scheduled")} onAction={() => {}} />);
        expect(screen.queryByText("reschedule")).toBeNull();
    });
});

// TD-F97: Start and Complete follow their own action permissions, not the model's write permission.
describe("the inspection row menu's start and complete items", () => {
    beforeEach(() => {
        access.write = true;
        access.actions = {start: true, complete: true, reschedule: true, cancelScheduled: true, updateChecklistItems: true};
    });

    it("offers start before the visit and complete during it", () => {
        expect(items("scheduled")).toContain("start");
        expect(items("rescheduled")).toContain("start");
        expect(items("in_progress")).toContain("complete");
        expect(items("in_progress")).not.toContain("start");
        expect(items("scheduled")).not.toContain("complete");
    });

    it("hides each one without its action permission, even with write access", () => {
        access.actions = {...access.actions, start: false, complete: false};
        expect(items("scheduled")).not.toContain("start");
        expect(items("in_progress")).not.toContain("complete");
    });

    it("shows each one with its action permission, even without write access", () => {
        access.write = false;
        expect(items("scheduled")).toContain("start");
        expect(items("in_progress")).toContain("complete");
    });
});

// TD-B224 (D156): a rescheduled inspection is cancelled like a scheduled one.
describe("the inspection row menu's cancel item", () => {
    beforeEach(() => {
        access.write = true;
        access.actions = {start: true, complete: true, reschedule: true, cancelScheduled: true, updateChecklistItems: true};
    });

    it("is offered on a scheduled or rescheduled inspection only", () => {
        expect(items("scheduled")).toContain("cancel");
        expect(items("rescheduled")).toContain("cancel");
        for (const status of ["in_progress", "completed", "cancelled"]) {
            expect(items(status)).not.toContain("cancel");
        }
    });
});

// TD-F101: Cancel and Update checklist follow their own action permissions, not the model's write permission.
describe("the inspection row menu's cancel and checklist items", () => {
    beforeEach(() => {
        access.write = true;
        access.actions = {start: true, complete: true, reschedule: true, cancelScheduled: true, updateChecklistItems: true};
    });

    it("hides each one without its action permission, even with write access", () => {
        access.actions = {...access.actions, cancelScheduled: false, updateChecklistItems: false};
        const offered = items("scheduled", "template-1");
        expect(offered).not.toContain("cancel");
        expect(offered).not.toContain("checklist");
    });

    it("shows each one with its action permission, even without write access", () => {
        access.write = false;
        const offered = items("scheduled", "template-1");
        expect(offered).toContain("cancel");
        expect(offered).toContain("checklist");
    });
});

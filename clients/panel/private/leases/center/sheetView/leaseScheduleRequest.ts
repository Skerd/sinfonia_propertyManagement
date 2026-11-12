import {createContext} from "react";

/**
 * An action picked in the lease sheet's menu ("Record rent payment") that the rent schedule opens. The schedule is a
 * sheet token (`#LeaseSchedule`, rendered by the view engine), so it reaches the sheet through context.
 */
export const LeaseScheduleRequest = createContext<{requestedAction: string; onRequestedActionHandled: () => void}>({
    requestedAction: "",
    onRequestedActionHandled: () => {},
});

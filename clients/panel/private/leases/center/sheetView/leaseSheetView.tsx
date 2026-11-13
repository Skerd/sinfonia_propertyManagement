import {compose} from "redux";
import {useCallback, useEffect, useMemo, useState, type ReactNode} from "react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useAccess} from "@coreModule/helpers/hooks/useAccess.ts";
import type {Lease} from "armonia/src/modules/propertyManagement/api/realEstate/private/lease/lease.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import SheetViewRenderer from "@coreModule/components/viewEngine/SheetViewRenderer.tsx";
import {useViewConfig} from "@coreModule/helpers/hooks/useViewConfig.ts";
import RecordRentPayment, {RECORD_RENT_PAYMENT_ACTION} from "@propertyManagementModule/clients/panel/private/leases/center/actions/recordRentPayment.tsx";
import {LeaseScheduleRequest} from "@propertyManagementModule/clients/panel/private/leases/center/sheetView/leaseScheduleRequest.ts";
import SheetNameTitle from "@coreModule/components/entityPage/sheet/sheetNameTitle.tsx";
import StatusBadge from "@coreModule/components/entityPage/sheet/statusBadge.tsx";
import {getName} from "@coreModule/helpers/general/names.ts";

export type LeaseSheetViewOwnProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    lease?: Lease;
    hideActions?: boolean;
    onDelete?: (response?: DeletedData) => void;
    onRestore?: () => void;
    fetchId?: string;
    actionMenuChildren?: ReactNode;
    actionMenuAllowCustomChildren?: boolean;
    onActionMenuAction?: (action: string) => void;
    onSheetRowPatched?: (row: Record<string, unknown>) => void;
};

function buildLeaseEditPath(lease: Lease) {
    const params = new URLSearchParams();
    params.set("leaseId", lease._id);
    if (lease.name) params.set("leaseName", lease.name);
    return `/realEstate/leases/edit?${params.toString()}`;
}

function LeaseSheetView({
    open,
    onOpenChange,
    lease: leaseProp,
    resolveLanguageKey,
    hideActions = false,
    onDelete = () => {},
    onRestore = () => {},
    fetchId,
    actionMenuChildren,
    actionMenuAllowCustomChildren,
    onActionMenuAction,
    onSheetRowPatched,
}: LeaseSheetViewOwnProps & WithLanguageType) {
    const [sheetData, setSheetData] = useState<Record<string, any>>(leaseProp || {_id: fetchId});
    const [requestedScheduleAction, setRequestedScheduleAction] = useState("");
    const access = useAccess("leases");
    const viewConfig = useViewConfig("leases", "sheet");

    useEffect(() => {
        if (!leaseProp) return;
        setSheetData(leaseProp);
    }, [leaseProp]);

    const handleRequestedHandled = useCallback(() => {
        setRequestedScheduleAction("");
    }, []);
    const scheduleRequest = useMemo(
        () => ({requestedAction: requestedScheduleAction, onRequestedActionHandled: handleRequestedHandled}),
        [requestedScheduleAction, handleRequestedHandled],
    );

    // While the sheet is open its rent schedule records the payment; handing the action on as well made the card or
    // list open a second record dialog (TD-F77).
    const handleMenuAction = (action: string) => {
        if (action === RECORD_RENT_PAYMENT_ACTION) setRequestedScheduleAction(action);
        else onActionMenuAction?.(action);
    };

    const entityId = leaseProp?._id ?? fetchId;
    if (!viewConfig || !entityId) return null;

    const lease = sheetData as Lease;

    return (
        <LeaseScheduleRequest.Provider value={scheduleRequest}>
            <SheetViewRenderer
                config={viewConfig}
                url="/api/realEstate/lease/single"
                fetchId={fetchId}
                onDataFetched={(data) => setSheetData(data)}
                data={sheetData}
                open={open}
                onOpenChange={onOpenChange}
                resolveLanguageKey={resolveLanguageKey}
                // Named by the tenant, the code as a badge and the state in tone (UX-01, UX-02, D151).
                headerTitle={<SheetNameTitle name={getName(lease.tenant)} code={lease.name} typeLabel={String(resolveLanguageKey("lease"))} />}
                headerDescription={
                    <StatusBadge
                        tableConfigKey="leases"
                        field="status"
                        value={lease.status}
                        label={String(resolveLanguageKey(`statusValues.${lease.status}`))}
                    />
                }
                access={access}
                hideActions={hideActions}
                onDelete={onDelete}
                onRestore={onRestore}
                editPath={buildLeaseEditPath(lease)}
                actionMenuAllowCustomChildren={actionMenuAllowCustomChildren ?? true}
                onActionMenuAction={handleMenuAction}
                onSheetRowPatched={onSheetRowPatched}
                actionMenuChildren={(
                    <>
                        {actionMenuChildren}
                        <RecordRentPayment lease={lease} onAction={handleMenuAction} />
                    </>
                )}
            />
        </LeaseScheduleRequest.Provider>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/leases/center/sheetView/leaseSheetView.tsx"),
    withDebug(true, true, "leases"),
)(LeaseSheetView);

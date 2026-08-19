import {compose} from "redux";
import {useEffect, useState, type ReactNode} from "react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import type {Lease} from "armonia/src/modules/propertyManagement/api/realEstate/private/lease/lease.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import SheetViewRenderer from "@coreModule/components/viewEngine/SheetViewRenderer.tsx";
import {useViewConfig} from "@coreModule/helpers/hooks/useViewConfig.ts";

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
    const access = useAccess("leases");
    const viewConfig = useViewConfig("leases", "sheet");

    useEffect(() => {
        if (!leaseProp) return;
        setSheetData(leaseProp);
    }, [leaseProp]);

    const entityId = leaseProp?._id ?? fetchId;
    if (!viewConfig || !entityId) return null;

    return (
        <SheetViewRenderer
            config={viewConfig}
            url="/api/realEstate/lease/single"
            fetchId={fetchId}
            onDataFetched={(data) => setSheetData(data)}
            data={sheetData}
            open={open}
            onOpenChange={onOpenChange}
            resolveLanguageKey={resolveLanguageKey}
            access={access}
            hideActions={hideActions}
            onDelete={onDelete}
            onRestore={onRestore}
            editPath={buildLeaseEditPath(sheetData as Lease)}
            actionMenuChildren={actionMenuChildren}
            actionMenuAllowCustomChildren={actionMenuAllowCustomChildren}
            onActionMenuAction={onActionMenuAction}
            onSheetRowPatched={onSheetRowPatched}
        />
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/leases/center/sheetView/leaseSheetView.tsx"),
    withDebug(true, true, "leases"),
)(LeaseSheetView);

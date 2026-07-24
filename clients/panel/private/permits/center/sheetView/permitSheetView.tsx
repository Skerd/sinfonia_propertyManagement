import {compose} from "redux";
import {useEffect, useState} from "react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import type {Permit} from "armonia/src/modules/propertyManagement/api/realEstate/private/permit/permit.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import SheetViewRenderer from "@coreModule/components/viewEngine/SheetViewRenderer.tsx";
import {useViewConfig} from "@coreModule/helpers/hooks/useViewConfig.ts";

export type PermitSheetViewOwnProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    permit?: Permit;
    hideActions?: boolean;
    onDelete?: (response?: DeletedData) => void;
    onRestore?: () => void;
    fetchId?: string;
};

function buildEditPath(permit: Permit) {
    const params = new URLSearchParams();
    params.set("permitId", permit._id);
    if (permit.name) params.set("permitName", permit.name);
    if (permit.project?._id) params.set("projectId", permit.project._id);
    if (permit.project?.name) params.set("projectName", permit.project.name);
    return `/realEstate/permits/edit?${params.toString()}`;
}

function PermitSheetView({
    open,
    onOpenChange,
    permit: permitProp,
    resolveLanguageKey,
    hideActions = false,
    onDelete = () => {},
    onRestore = () => {},
    fetchId,
}: PermitSheetViewOwnProps & WithLanguageType) {
    const [sheetData, setSheetData] = useState<Record<string, any>>(permitProp || {_id: fetchId});
    const access = useAccess("permits");
    const viewConfig = useViewConfig("permits", "sheet");

    useEffect(() => {
        if (!permitProp) return;
        setSheetData(permitProp);
    }, [permitProp]);

    const entityId = permitProp?._id ?? fetchId;
    if (!viewConfig || !entityId) return null;

    return (
        <SheetViewRenderer
            config={viewConfig}
            url="/api/realEstate/permit/single"
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
            editPath={buildEditPath(sheetData as Permit)}
        />
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/permits/center/sheetView/permitSheetView.tsx"),
    withDebug(true, true),
)(PermitSheetView);

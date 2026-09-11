import {compose} from "redux";
import {useEffect, useState} from "react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useAccess} from "@coreModule/helpers/context/accessContext.tsx";
import type {HandoverPackage} from "armonia/src/modules/propertyManagement/api/realEstate/private/handoverPackage/handoverPackage.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import SheetViewRenderer from "@coreModule/components/viewEngine/SheetViewRenderer.tsx";
import {useViewConfig} from "@coreModule/helpers/hooks/useViewConfig.ts";
import UpdateHandover from "@propertyManagementModule/clients/panel/private/sales/center/actions/updateHandover.tsx";
import UpdateHandoverDialog from "@propertyManagementModule/components/custom/sales/updateHandoverDialog.tsx";
import {canUpdateHandoverPackage} from "@propertyManagementModule/components/custom/sale/saleHandoverVisibility.ts";

type Props = WithLanguageType & {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    entity?: HandoverPackage;
    hideActions?: boolean;
    onDelete?: (response?: DeletedData) => void;
    onRestore?: () => void;
    fetchId?: string;
};

function Sheet({open, onOpenChange, entity, resolveLanguageKey, hideActions = false, onDelete = () => {}, onRestore = () => {}, fetchId}: Props) {
    const [sheetData, setSheetData] = useState<Record<string, unknown>>(entity || {_id: fetchId});
    const [action, setAction] = useState("");
    const access = useAccess("handoverpackages");
    const viewConfig = useViewConfig("handoverpackages", "sheet");
    useEffect(() => { if (entity) setSheetData(entity); }, [entity]);
    useEffect(() => { if (!open) setAction(""); }, [open]);
    const entityId = entity?._id ?? fetchId;
    if (!viewConfig || !entityId) return null;
    const params = new URLSearchParams();
    params.set("handoverPackageId", String(entityId));
    const pkg = sheetData as HandoverPackage;
    const write = access.write;
    const canTick = write === true || (typeof write === "object" && write !== null && (write as Record<string, unknown>).items !== undefined);
    return (
        <>
            <SheetViewRenderer
                config={viewConfig}
                url="/api/realEstate/handoverPackage/single"
                fetchId={fetchId}
                onDataFetched={(data) => setSheetData(data)}
                data={sheetData}
                open={open}
                onOpenChange={onOpenChange}
                resolveLanguageKey={resolveLanguageKey}
                access={access}
                hideActions={hideActions}
                hideEdit={pkg.titleTransferred}
                onDelete={onDelete}
                onRestore={onRestore}
                editPath={`/realEstate/handoverPackages/edit?${params.toString()}`}
                actionMenuAllowCustomChildren={true}
                actionMenuChildren={
                    canTick && canUpdateHandoverPackage(pkg) ? <UpdateHandover onAction={setAction} /> : null
                }
            />
            {action === "updateHandover" && (
                <UpdateHandoverDialog
                    open
                    onClose={() => setAction("")}
                    handoverPackage={pkg}
                    onSuccess={(updated) => {
                        if (updated) setSheetData(updated);
                        setAction("");
                    }}
                />
            )}
        </>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/handoverPackages/center/sheetView/handoverPackageSheetView.tsx"),
    withDebug(true, true, "handoverpackages"),
)(Sheet);

import {compose} from "redux";
import {useEffect, useState} from "react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import type {Snag} from "armonia/src/modules/propertyManagement/api/realEstate/private/snag/snag.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import SheetViewRenderer from "@coreModule/components/viewEngine/SheetViewRenderer.tsx";
import {useViewConfig} from "@coreModule/helpers/hooks/useViewConfig.ts";

export type SnagSheetViewOwnProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    snag?: Snag;
    hideActions?: boolean;
    onDelete?: (response?: DeletedData) => void;
    onRestore?: () => void;
    fetchId?: string;
};

function buildSnagEditPath(snag: Snag) {
    const params = new URLSearchParams();
    params.set("snagId", snag._id);
    if (snag.name) params.set("snagName", snag.name);
    if (snag.unit?._id) params.set("unitId", snag.unit._id);
    if (snag.unit?.name) params.set("unitName", snag.unit.name);
    return `/realEstate/snags/edit?${params.toString()}`;
}

function SnagSheetView({
    open,
    onOpenChange,
    snag: snagProp,
    resolveLanguageKey,
    hideActions = false,
    onDelete = () => {},
    onRestore = () => {},
    fetchId,
}: SnagSheetViewOwnProps & WithLanguageType) {
    const [sheetData, setSheetData] = useState<Record<string, any>>(snagProp || {_id: fetchId});
    const access = useAccess("snags");
    const viewConfig = useViewConfig("snags", "sheet");

    useEffect(() => {
        if (!snagProp) return;
        setSheetData(snagProp);
    }, [snagProp]);

    const entityId = snagProp?._id ?? fetchId;

    if (!viewConfig) return null;
    if (!entityId) return null;

    return (
        <SheetViewRenderer
            config={viewConfig}
            url="/api/realEstate/snag/single"
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
            editPath={buildSnagEditPath(sheetData as Snag)}
        />
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/snags/center/sheetView/snagSheetView.tsx"),
    withDebug(true, true),
)(SnagSheetView);

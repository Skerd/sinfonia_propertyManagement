import {compose} from "redux";
import {useEffect, useState} from "react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import {Constructor} from "armonia/src/modules/propertyManagement/api/realEstate/private/constructor/constructor.dto.ts";
import type {DeleteResponse} from "armonia/src/modules/core/types/shared.types.ts";
import {useViewConfig} from "@coreModule/helpers/hooks/useViewConfig.ts";
import SheetViewRenderer from "@coreModule/components/viewEngine/SheetViewRenderer.tsx";

export type ConstructorSheetViewOwnProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    /** Full row from list/card, or bootstrap from DisplayCard while `/single` loads. */
    constructor?: Constructor;
    hideActions?: boolean;
    onDelete?: (response?: DeleteResponse) => void;
    onRestore?: () => void;
    isRestored?: boolean;
    fetchId?: string;
};

function constructorEditPath(c: Constructor) {
    const params = new URLSearchParams();
    params.set("constructorId", c._id);
    if (c.name) params.set("constructorName", c.name);
    return `/tenancy/systemSettings/constructors/edit?${params.toString()}`;
}

function ConstructorSheetView({
    open,
    onOpenChange,
    constructor: constructorProp,
    resolveLanguageKey,
    hideActions = false,
    onDelete = () => {},
    onRestore = () => {},
    fetchId,
}: ConstructorSheetViewOwnProps & WithLanguageType) {

    const [sheetData, setSheetData] = useState<Record<string, any>>(constructorProp || {_id: fetchId});
    const access = useAccess("constructors");
    const viewConfig = useViewConfig("constructors", "sheet");

    useEffect(() => {
        if (!constructorProp) return;
        setSheetData(constructorProp);
    }, [constructorProp]);

    const entityId = constructorProp?._id ?? fetchId;

    if (!viewConfig) return null;
    if (!entityId) return null;

    return (
        <SheetViewRenderer
            config={viewConfig}
            url="/api/realEstate/constructor/single"
            fetchId={fetchId}
            onDataFetched={(data) => {
                setSheetData(data);
            }}
            data={sheetData}
            open={open}
            onOpenChange={onOpenChange}
            resolveLanguageKey={resolveLanguageKey}
            access={access}
            hideActions={hideActions}
            onDelete={onDelete}
            onRestore={onRestore}
            editPath={constructorEditPath(sheetData as Constructor)}
        />
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/constructors/center/sheetView/constructorSheetView.tsx"),
    withDebug(true, true, "constructors")
)(ConstructorSheetView);

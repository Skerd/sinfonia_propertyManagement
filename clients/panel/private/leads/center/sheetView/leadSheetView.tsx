import {compose} from "redux";
import {useEffect, useState} from "react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import {Lead} from "armonia/src/modules/propertyManagement/api/realEstate/private/lead/lead.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import {useViewConfig} from "@coreModule/helpers/hooks/useViewConfig.ts";
import SheetViewRenderer from "@coreModule/components/viewEngine/SheetViewRenderer.tsx";

export type LeadSheetViewOwnProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    lead?: Lead;
    hideActions?: boolean;
    onDelete?: (response?: DeletedData) => void;
    onRestore?: () => void;
    fetchId?: string;
};

function leadEditPath(lead: Lead) {
    const params = new URLSearchParams();
    params.set("leadId", lead._id);
    const fullName = [lead.firstName, lead.lastName].filter(Boolean).join(" ");
    if (fullName) params.set("leadName", fullName);
    return `/realEstate/leads/edit?${params.toString()}`;
}

function LeadSheetView({
    open,
    onOpenChange,
    lead: leadProp,
    resolveLanguageKey,
    hideActions = false,
    onDelete = () => {},
    onRestore = () => {},
    fetchId,
}: LeadSheetViewOwnProps & WithLanguageType) {

    const [sheetData, setSheetData] = useState<Record<string, any>>(leadProp || {_id: fetchId});
    const access = useAccess("leads");
    const viewConfig = useViewConfig("leads", "sheet");

    useEffect(() => {
        if (!leadProp) return;
        setSheetData(leadProp);
    }, [leadProp]);

    const entityId = leadProp?._id ?? fetchId;

    if (!viewConfig) return null;
    if (!entityId) return null;

    return (
        <SheetViewRenderer
            config={viewConfig}
            url="/api/realEstate/lead/single"
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
            editPath={leadEditPath(sheetData as Lead)}
        />
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/leads/center/sheetView/leadSheetView.tsx"),
    withDebug(true, true, "leads"),
)(LeadSheetView);

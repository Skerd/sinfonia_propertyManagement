import {compose} from "redux";
import {useEffect, useState} from "react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useAccess} from "@coreModule/helpers/hooks/useAccess.ts";
import type {AdCampaignRecipient} from "armonia/src/modules/propertyManagement/api/realEstate/private/adCampaignRecipient/adCampaignRecipient.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import SheetViewRenderer from "@coreModule/components/viewEngine/SheetViewRenderer.tsx";
import {useViewConfig} from "@coreModule/helpers/hooks/useViewConfig.ts";

type Props = WithLanguageType & {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    entity?: AdCampaignRecipient;
    hideActions?: boolean;
    onDelete?: (response?: DeletedData) => void;
    onRestore?: () => void;
    fetchId?: string;
};

function Sheet({
    open,
    onOpenChange,
    entity,
    resolveLanguageKey,
    onDelete = () => {},
    onRestore = () => {},
    fetchId,
}: Props) {
    const [sheetData, setSheetData] = useState<Record<string, any>>(entity || {_id: fetchId});
    const access = useAccess("adcampaignrecipients");
    const viewConfig = useViewConfig("adcampaignrecipients", "sheet");
    useEffect(() => { if (entity) setSheetData(entity); }, [entity]);
    const entityId = entity?._id ?? fetchId;
    if (!viewConfig || !entityId) return null;
    return (
        <SheetViewRenderer
            config={viewConfig}
            url="/api/realEstate/adCampaignRecipient/single"
            fetchId={fetchId}
            onDataFetched={(data) => setSheetData(data)}
            data={sheetData}
            open={open}
            onOpenChange={onOpenChange}
            resolveLanguageKey={resolveLanguageKey}
            access={access}
            // Rows are written by the send engine; there is nothing here a
            // person may edit, delete or restore.
            hideActions
            onDelete={onDelete}
            onRestore={onRestore}
        />
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/adCampaigns/recipients/center/sheetView/adCampaignRecipientSheetView.tsx"),
    withDebug(true, true, "adcampaignrecipients"),
)(Sheet);

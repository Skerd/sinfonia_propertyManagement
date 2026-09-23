import {compose} from "redux";
import {useEffect, useState} from "react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useAccess} from "@coreModule/helpers/hooks/useAccess.ts";
import type {AdCampaign} from "armonia/src/modules/propertyManagement/api/realEstate/private/adCampaign/adCampaign.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import SheetViewRenderer from "@coreModule/components/viewEngine/SheetViewRenderer.tsx";
import {useViewConfig} from "@coreModule/helpers/hooks/useViewConfig.ts";

type Props = WithLanguageType & {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    campaign?: AdCampaign;
    hideActions?: boolean;
    onDelete?: (response?: DeletedData) => void;
    onRestore?: () => void;
    fetchId?: string;
};

function Sheet({
    open,
    onOpenChange,
    campaign,
    resolveLanguageKey,
    hideActions = false,
    onDelete = () => {},
    onRestore = () => {},
    fetchId,
}: Props) {
    const [sheetData, setSheetData] = useState<Record<string, any>>(campaign || {_id: fetchId});
    const access = useAccess("adcampaigns");
    const viewConfig = useViewConfig("adcampaigns", "sheet");
    useEffect(() => { if (campaign) setSheetData(campaign); }, [campaign]);
    const entityId = campaign?._id ?? fetchId;
    if (!viewConfig || !entityId) return null;
    const params = new URLSearchParams();
    params.set("adCampaignId", String(entityId));
    return (
        <SheetViewRenderer
            config={viewConfig}
            url="/api/realEstate/adCampaign/single"
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
            editPath={`/tenancy/systemSettings/adCampaigns/edit?${params.toString()}`}
        />
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/adCampaigns/center/sheetView/adCampaignSheetView.tsx"),
    withDebug(true, true, "adcampaigns"),
)(Sheet);

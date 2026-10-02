import {compose} from "redux";
import {useEffect, useState} from "react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useAccess} from "@coreModule/helpers/hooks/useAccess.ts";
import type {AdCampaign} from "armonia/src/modules/propertyManagement/api/realEstate/private/adCampaign/adCampaign.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import SheetViewRenderer from "@coreModule/components/viewEngine/SheetViewRenderer.tsx";
import {useViewConfig} from "@coreModule/helpers/hooks/useViewConfig.ts";
import AdCampaignRowMenuExtras from "@propertyManagementModule/clients/panel/private/adCampaigns/center/actions/adCampaignRowMenuExtras.tsx";
import AdCampaignWorkflowDialogs from "@propertyManagementModule/clients/panel/private/adCampaigns/center/actions/adCampaignWorkflowDialogs.tsx";
import AdCampaignProgressPoll from "@propertyManagementModule/clients/panel/private/adCampaigns/center/adCampaignProgressPoll.tsx";

type Props = WithLanguageType & {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    campaign?: AdCampaign;
    hideActions?: boolean;
    onDelete?: (response?: DeletedData) => void;
    onRestore?: () => void;
    fetchId?: string;
    onSheetRowPatched?: (row: Record<string, unknown>) => void;
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
    onSheetRowPatched,
}: Props) {
    const [sheetData, setSheetData] = useState<Record<string, any>>(campaign || {_id: fetchId});
    const [action, setAction] = useState("");
    const access = useAccess("adcampaigns");
    const viewConfig = useViewConfig("adcampaigns", "sheet");

    useEffect(() => { if (campaign) setSheetData(campaign); }, [campaign]);
    useEffect(() => { if (!open) setAction(""); }, [open]);

    const entityId = campaign?._id ?? fetchId;
    const status = sheetData.status as string | undefined;

    if (!viewConfig || !entityId) return null;
    const params = new URLSearchParams();
    params.set("adCampaignId", String(entityId));
    const asCampaign = sheetData as AdCampaign;

    return (
        <>
            <AdCampaignProgressPoll
                entityId={entityId}
                status={status}
                enabled={open}
                onPatched={(data) => {
                    setSheetData(data);
                    onSheetRowPatched?.(data);
                }}
            />
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
                actionMenuAllowCustomChildren={true}
                onSheetRowPatched={(row) => {
                    setSheetData(row);
                    onSheetRowPatched?.(row);
                }}
                actionMenuChildren={
                    hideActions ? null : (
                        <AdCampaignRowMenuExtras campaign={asCampaign} onAction={setAction} />
                    )
                }
            />
            <AdCampaignWorkflowDialogs
                action={action}
                campaign={asCampaign}
                onClose={() => setAction("")}
                onSuccess={(updated) => {
                    if (updated) {
                        setSheetData(updated);
                        onSheetRowPatched?.(updated);
                    }
                    setAction("");
                }}
            />
        </>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/adCampaigns/center/sheetView/adCampaignSheetView.tsx"),
    withDebug(true, true, "adcampaigns"),
)(Sheet);

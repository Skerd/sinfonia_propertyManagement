import {compose} from "redux";
import {useEffect, useState} from "react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import {Commission} from "armonia/src/modules/propertyManagement/api/realEstate/private/commission/commission.dto.ts";
import CommissionRowMenuExtras from "@propertyManagementModule/clients/panel/private/commissions/center/actions/commissionRowMenuExtras.tsx";
import {useViewConfig} from "@coreModule/helpers/hooks/useViewConfig.ts";
import SheetViewRenderer from "@coreModule/components/viewEngine/SheetViewRenderer.tsx";
import {Badge} from "@coreModule/components/ui/badge.tsx";
import {cn} from "@coreModule/components/lib/utils.ts";

export type CommissionSheetViewOwnProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    /** Full row from list/card, or bootstrap from DisplayCard while `/single` loads. */
    commission?: Commission;
    hideActions?: boolean;
    onModifySuccess?: (updated?: Commission) => void;
    fetchId?: string;
};

export function commissionConfirmLabel(c: Commission) {
    const a = c.agent;
    return [a?.name, a?.surname].filter(Boolean).join(" ").trim() || undefined;
}

function CommissionSheetView({
    open,
    onOpenChange,
    commission: commissionProp,
    resolveLanguageKey,
    hideActions = false,
    onModifySuccess,
    fetchId,
}: CommissionSheetViewOwnProps & WithLanguageType) {
    const [sheetData, setSheetData] = useState<Record<string, any>>(commissionProp || {_id: fetchId});
    const access = useAccess("commissions");
    const viewConfig = useViewConfig("commissions", "sheet");
    const read = access.read as Record<string, unknown> | undefined;

    useEffect(() => {
        if (!commissionProp) return;
        setSheetData(commissionProp);
    }, [commissionProp]);

    const entityId = commissionProp?._id ?? fetchId;
    const asCommission = sheetData as Commission;

    if (!viewConfig) return null;
    if (!entityId) return null;

    const statusBadge = (status: string) => {
        const s = (status || "").toLowerCase();
        const className =
            s === "paid"
                ? "bg-success/10 text-success border-success/30"
                : s === "voided"
                  ? "bg-destructive/10 text-destructive border-destructive/30"
                  : s === "pending_approval"
                    ? "bg-info/10 text-info border-info/30"
                    : "bg-warning/10 text-warning border-warning/30";
        return (
            <Badge variant="outline" className={cn("text-xs font-medium", className)}>
                {resolveLanguageKey(`fields.!enums.status.${s}`) as string}
            </Badge>
        );
    };

    const st = (asCommission.sourceType || "").toLowerCase();
    const sourceLabel = resolveLanguageKey(`fields.!enums.sourceType.${st}`) as string;

    const agentTitle = commissionConfirmLabel(asCommission) ?? "—";

    const headerTitle = (
        <>
            <span className="truncate text-3xl w-fit">{agentTitle}</span>
            <Badge variant="secondary">{resolveLanguageKey("modelType")}</Badge>
        </>
    );

    const headerDescription = (
        <>
            {statusBadge(asCommission.status)}
            <span className="text-muted-foreground">
                {resolveLanguageKey("sourceType")}: {sourceLabel}
            </span>
        </>
    );

    return (
        <SheetViewRenderer
            config={viewConfig}
            url="/api/realEstate/commission/single"
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
            hideEdit={true}
            hideDelete={true}
            hideRestore={true}
            editPath=""
            headerTitle={headerTitle}
            headerDescription={headerDescription}
            deleteRestoreConfirmLabel={read?.agent != null ? commissionConfirmLabel(asCommission) : undefined}
            actionMenuAllowCustomChildren={true}
            actionMenuChildren={
                <CommissionRowMenuExtras commission={asCommission} onModify={(updated) => onModifySuccess?.(updated)} />
            }
        />
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/commissions/center/sheetView/commissionSheetView.tsx"),
    withDebug(true, true, "commissions"),
)(CommissionSheetView);

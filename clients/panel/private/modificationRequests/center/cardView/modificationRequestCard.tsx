import {compose} from "redux";
import {Badge} from "@coreModule/components/ui/badge.tsx";
import {Card, CardContent} from "@coreModule/components/ui/card.tsx";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import HiddenElement from "@coreModule/components/custom/hiddenElement.tsx";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import ActionMenu from "@coreModule/components/custom/actions/menu/actionMenu.tsx";
import DeleteAction from "@coreModule/components/custom/actions/deleteAction.tsx";
import RestoreAction from "@coreModule/components/custom/actions/restoreAction.tsx";
import ModificationRequestRowMenuExtras, {
    modificationRequestShouldHideEdit,
} from "@propertyManagementModule/clients/panel/private/modificationRequests/center/actions/modificationRequestRowMenuExtras.tsx";
import type {DeletedData, SingleForm} from "armonia/src/modules/core/types/shared.types.ts";
import {useEffect, useImperativeHandle, useMemo, useState} from "react";
import TooltipDisplayer from "@coreModule/components/custom/tooltipDisplayer.tsx";
import {format} from "date-fns";
import {
    ModificationRequest,
} from "armonia/src/modules/propertyManagement/api/realEstate/private/unit/modificationRequest/modificationRequest.dto.ts";
import ModificationRequestSheetView from "@propertyManagementModule/clients/panel/private/modificationRequests/center/sheetView/modificationRequestSheetView.tsx";
import {
    IconActivity,
    IconCalendar,
    IconCashBanknote,
    IconHome,
    IconPackage,
    IconTag,
    IconUser,
    IconX,
} from "@tabler/icons-react";
import {cn} from "@coreModule/components/lib/utils.ts";
import DeletedInfo from "@coreModule/components/custom/deletedInfo";
import CopyTooltip from "@coreModule/components/custom/copyTooltip.tsx";
import InfoRow from "@coreModule/components/custom/infoRow.tsx";
import {MdiIcon} from "@coreModule/components/custom/mdiIcons/mdiIcon.tsx";
import withAxios, {WithAxiosType} from "@coreModule/helpers/hocs/withAxios.tsx";
import {useEntityCard} from "@coreModule/helpers/hooks/useEntityCard.ts";
import {EntityCardShell} from "@propertyManagementModule/components/custom/cards/EntityCardShell.tsx";
import {EntityCardFetchGuard} from "@propertyManagementModule/components/custom/cards/EntityCardFetchGuard.tsx";
import {EntityCardActionMenu} from "@propertyManagementModule/components/custom/cards/EntityCardActionMenu.tsx";
import {
    CARD_BODY_CLASS,
    CARD_INFO_ROWS_CLASS,
    STATUS_BADGE_DANGER,
    STATUS_BADGE_INFO,
    STATUS_BADGE_SUCCESS,
    STATUS_BADGE_WARNING,
    STATUS_BADGE_NEUTRAL,
} from "@propertyManagementModule/components/custom/cards/entityCard.constants.ts";
import ApproveModificationRequestDialog from "@propertyManagementModule/components/custom/modificationRequests/approveModificationRequestDialog.tsx";
import SubmitRevisionModificationRequestDialog from "@propertyManagementModule/components/custom/modificationRequests/submitRevisionModificationRequestDialog.tsx";
import FinanceModificationRequestDialog from "@propertyManagementModule/components/custom/modificationRequests/financeModificationRequestDialog.tsx";
import DeliverModificationRequestDialog from "@propertyManagementModule/components/custom/modificationRequests/deliverModificationRequestDialog.tsx";
import CancelModificationRequestDialog from "@propertyManagementModule/components/custom/modificationRequests/cancelModificationRequestDialog.tsx";

function modificationRequestEditPath(requestId: string, name: string, unitId: string, unitName?: string) {
    const params = new URLSearchParams();
    params.set("modificationRequestId", requestId);
    params.set("modificationRequestName", name);
    params.set("unitId", unitId);
    if (unitName) params.set("unitName", unitName);
    return `/realEstate/modificationRequests/edit?${params.toString()}`;
}

type ModificationRequestCardProps = WithLanguageType & WithAxiosType<ModificationRequest, SingleForm> & {
    request: ModificationRequest;
    unitId?: string;
    unitName?: string;
    fetchId?: string;
    onDelete?: (request?: ModificationRequest, response?: DeletedData & Partial<ModificationRequest>,) => void;
    onRestore?: () => void;
    onModified?: (updated?: ModificationRequest) => void;
    isRestored?: boolean;
    small?: boolean;
};

function ModificationRequestCard({
    request: paramRequest,
    resolveLanguageKey,
    unitId,
    unitName,
    fetchId,
    onFilterChange,
    loading,
    error,
    innerRef,
    onDelete = () => {},
    onRestore = () => {},
    onModified,
    isRestored = false,
    small
}: ModificationRequestCardProps) {

    const {action, setAction, entity: displayRequest, setEntity: setLocalRequest, hideAfterDeletion, onDelete: onDeleteSuccess, onRestore: onRestoreSuccess} = useEntityCard({
        entityProp: paramRequest,
        onDeleteProp: (req, data) => onDelete?.(req, data),
        onRestoreProp: onRestore,
        syncPropOnChange: !fetchId,
    });
    const [forceReload, setForceReload] = useState(1);
    const {read, restore, write} = useAccess("modificationRequests");

    useEffect(() => {
        if (fetchId) {
            onFilterChange({_id: fetchId});
        }
    }, [fetchId, forceReload]);

    useImperativeHandle(innerRef, () => ({
        success: (data: unknown) => {
            const wrapped = data as {data?: ModificationRequest[]};
            const next =
                Array.isArray(wrapped?.data) && wrapped.data.length > 0 ? wrapped.data[0] : (data as ModificationRequest);
            setLocalRequest(next);
        },
    }));

    const resolvedUnitId = unitId ?? displayRequest.unit?._id ?? "";
    const resolvedUnitName = unitName ?? displayRequest.unit?.name;

    const unitInfoRow = useMemo(() => {
        const embeddedUnitType = displayRequest.unit?.unitType;
        const mdiName = embeddedUnitType?.icon;
        const label = embeddedUnitType?.name || resolveLanguageKey("unit");
        const valueStr = displayRequest.unit
            ? String(displayRequest.unit.name ?? displayRequest.unit.unitNumber ?? displayRequest.unit._id)
            : "";
        return {label, valueStr, mdiName, tooltip: label};
    }, [displayRequest.unit, resolveLanguageKey]);

    if (!read || !Object.keys(read).length) {
        return <HiddenElement />;
    }
    if (hideAfterDeletion && !restore) {
        return <></>;
    }

    const formatFinanceCurrency = (fd: typeof displayRequest.financeDetails) =>
        String(fd?.currency?.symbol || fd?.currency?.abbreviation || fd?.currency?.name || "—");

    const getStatusColor = (status: string) => {
        if (!status) return STATUS_BADGE_NEUTRAL;
        const statusLower = status.toLowerCase();
        if (statusLower === "finance_completed" || statusLower === "pending_delivery") {
            return STATUS_BADGE_WARNING;
        }
        if (statusLower.includes('approved') || statusLower.includes('completed') || statusLower.includes('delivered')) {
            return STATUS_BADGE_SUCCESS;
        }
        if (statusLower.includes('rejected') || statusLower.includes('cancelled')) {
            return STATUS_BADGE_DANGER;
        }
        if (statusLower.includes('pending') || statusLower.includes('finance_completed')) {
            return STATUS_BADGE_WARNING;
        }
        return STATUS_BADGE_INFO;
    }

    const getApprovalDecisionColor = (decision: string) => {
        if (decision === "approved") return "bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/30";
        if (decision === "rejected") return "bg-red-500/20 text-red-700 dark:text-red-400 border-red-500/30";
        return "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border-yellow-500/30";
    };
    const getStageStatus = (stage: string) => {
        switch (stage) {
            case "architect":
                if (displayRequest.architectApproval?.decision === "approved") return "completed";
                if (displayRequest.architectApproval?.decision === "rejected") return "rejected";
                if (displayRequest.status === "pending_architect" || displayRequest.status === "pending_architect_revision") return "current";
                return "upcoming";
            case "engineer":
                if (displayRequest.engineerApproval?.decision === "approved") return "completed";
                if (displayRequest.engineerApproval?.decision === "rejected") return "rejected";
                if (displayRequest.status === "pending_engineer" || displayRequest.status === "pending_engineer_revision") return "current";
                return "upcoming";
            case "ceo":
                if (displayRequest.ceoApproval?.decision === "approved") return "completed";
                if (displayRequest.ceoApproval?.decision === "rejected") return "rejected";
                if (displayRequest.status === "pending_ceo") return "current";
                return "upcoming";
            case "finance":
                if (displayRequest.status === "finance_completed" || displayRequest.status === "completed") return "completed";
                if (displayRequest.status === "pending_finance") return "current";
                return "upcoming";
            case "delivery":
                if (displayRequest.deliveryApproval?.decision === "approved") return "completed";
                if (displayRequest.deliveryApproval?.decision === "rejected") return "rejected";
                if (displayRequest.status === "finance_completed" || displayRequest.status === "pending_delivery") return "current";
                return "upcoming";
            default:
                return "upcoming";
        }
    };
    const getStageDotClass = (status: string) => {
        switch (status) {
            case "completed":
                return "bg-green-500 border-green-600 ring-2 ring-green-500/20";
            case "rejected":
                return "bg-red-500 border-red-600 ring-2 ring-red-500/20";
            case "current":
                return "bg-yellow-500 border-yellow-600 ring-2 ring-yellow-500/20 animate-pulse";
            default:
                return "bg-gray-300 border-gray-400 dark:bg-gray-600 dark:border-gray-500";
        }
    };
    const getLineClass = (fromStatus: string, toStatus: string) => {
        const from = getStageStatus(fromStatus);
        const to = getStageStatus(toStatus);

        if (from === "completed" && (to === "completed" || to === "current" || to === "rejected")) {
            return "bg-green-500";
        }
        if (from === "rejected" || to === "rejected") {
            return "bg-red-500";
        }
        if (from === "current") {
            return "bg-yellow-500";
        }
        return "bg-gray-300 dark:bg-gray-600";
    };

    const renderApprovalPopoverContent = (
        approval: any,
        stageLabel: string,
        permissions: any = {},
        isDelivery?: boolean,
        stageType?: "architect" | "engineer" | "ceo" | "delivery",
    ) => {

        return (
            <Card className="space-y-2 w-full gap-0 min-w-56">
                <div className="flex items-center gap-2 px-4 pt-4 pb-2">
                    <p className="text-sm font-semibold">{stageLabel}</p>
                    <HiddenElement>
                        {
                            permissions.decision &&
                            <>
                                {
                                    !!approval.decision &&
                                    <p className={`text-xs px-2 py-0.5 rounded-md border ${getApprovalDecisionColor(approval?.decision)}`}>
                                        {resolveLanguageKey(approval?.decision)}
                                    </p>
                                }
                            </>
                        }
                    </HiddenElement>
                </div>
                <CardContent className="space-y-2">
                    <HiddenElement>
                        {
                            permissions.user &&
                            <>
                                {
                                    !!approval.user &&
                                    <InfoRow
                                        label={resolveLanguageKey("reviewedBy")}
                                        value={
                                            <div className="flex items-center space-x-1">
                                                <HiddenElement>
                                                    {
                                                        permissions.user?.keys?.name &&
                                                        <p>{approval?.user?.name}</p>
                                                    }
                                                </HiddenElement>
                                                <HiddenElement>
                                                    {
                                                        permissions.user?.keys?.surname &&
                                                        <p>{approval?.user?.surname}</p>
                                                    }
                                                </HiddenElement>
                                            </div>
                                        }
                                        icon={IconUser}
                                    />
                                }
                            </>
                        }
                    </HiddenElement>
                    <HiddenElement>
                        {
                            permissions.reviewedAt &&
                            <>
                                {
                                    !!approval.reviewedAt &&
                                    <InfoRow
                                        label={resolveLanguageKey("reviewedAt")}
                                        value={
                                            <div className="flex items-center space-x-1">
                                                {format(new Date(approval.reviewedAt), "PPp")}
                                            </div>
                                        }
                                        icon={IconCalendar}
                                    />
                                }
                            </>
                        }
                    </HiddenElement>
                    <HiddenElement>
                        {
                            permissions.notes &&
                            <>
                                {
                                    approval.notes &&
                                    <div className="pt-1 border-t">
                                        <p className="text-xs font-medium text-muted-foreground mb-1">{resolveLanguageKey("notesLabel")}</p>
                                        <p className="text-xs text-muted-foreground italic whitespace-pre-wrap max-h-32 overflow-y-auto">
                                            {approval.notes.length > 250 ? approval.notes.slice(0, 250) + "…" : approval.notes}
                                        </p>
                                    </div>
                                }
                            </>
                        }
                    </HiddenElement>
                    <HiddenElement>
                        {
                            permissions.media &&
                            <>
                                {
                                    Array.isArray(approval?.media) && approval.media.length > 0 &&
                                    <div className="pt-1 border-t">
                                        <p className="text-xs font-medium text-muted-foreground mb-1">{approval.media.length} {resolveLanguageKey(approval.media.length === 1 ? "attachment" : "attachments")}</p>
                                    </div>
                                }
                            </>
                        }
                    </HiddenElement>
                    {/*<HiddenElement>*/}
                        {
                            stageType === "engineer" &&
                            <>
                                {
                                    Array.isArray(approval?.materialsPlan) && approval.materialsPlan.length > 0 &&
                                    <div className="pt-1 border-t">
                                        <p className="text-xs font-medium text-muted-foreground mb-1">{resolveLanguageKey("materials")}</p>
                                        <div className="space-y-1 max-h-32 overflow-y-auto">
                                            {
                                                approval.materialsPlan.map((material: any, index: number) => {
                                                    return (
                                                        <div key={index} className="text-xs text-muted-foreground flex items-center gap-1">
                                                            <p className="font-medium text-foreground">{material.item}</p>
                                                                {
                                                                    (material.quantity != null || material.unit) &&
                                                                    <p>
                                                                        ({material.quantity ?? 1}{material.unit ? ` ${material.unit}` : ""})
                                                                    </p>
                                                                }
                                                        </div>
                                                    )
                                                }
                                            )}
                                        </div>
                                    </div>
                                }
                            </>
                        }
                    {/*</HiddenElement>*/}
                    {
                        isDelivery &&
                        <>
                            <HiddenElement>
                                {
                                    (permissions.inspections  || true )&&
                                    <>
                                        {
                                            (((displayRequest?.deliveryApproval as any)?.inspections?.length) || 0) > 0 &&
                                            <div className="pt-1 border-t">
                                                <p className="text-xs font-medium text-muted-foreground mb-1">{(displayRequest?.deliveryApproval as any)?.inspections?.length} {resolveLanguageKey(((displayRequest?.deliveryApproval as any)?.inspections?.length) === 1 ? "inspection" : "inspections")} {resolveLanguageKey("linked")}</p>
                                            </div>
                                        }
                                    </>
                                }
                            </HiddenElement>
                        </>
                    }
                </CardContent>
            </Card>
        );
    };
    const renderFinancePopoverContent = (financeDetails: any, stageLabel: string, permissions: any = {}) => {
        const cPermissions = permissions.costBreakdown?.keys || {};
        return (
            <Card className="space-y-2 w-full gap-0 min-w-56">
                <div className="flex items-center gap-2 px-4 pt-4 pb-2">
                    <p className="text-sm font-semibold">{stageLabel}</p>
                    {
                        !!financeDetails ?
                        <p className={`text-xs px-2 py-0.5 rounded-md border ${getApprovalDecisionColor("approved")}`}>
                            {resolveLanguageKey("completed")}
                        </p>
                        :
                        <p className={`text-xs px-2 py-0.5 rounded-md border ${getApprovalDecisionColor("pending")}`}>
                            {resolveLanguageKey("pending")}
                        </p>
                    }
                </div>
                {
                    !!financeDetails &&
                    <CardContent className="space-y-2">
                        <InfoRow
                            label={resolveLanguageKey("totalCost")}
                            value={<HiddenElement>
                                {
                                    permissions.totalCost &&
                                    <>
                                        {
                                            financeDetails.totalCost !== undefined ?
                                            <div className="text-green-400 font-semibold">
                                                {formatFinanceCurrency(financeDetails)}{Number(financeDetails.totalCost).toLocaleString()}
                                            </div>
                                            :
                                            null
                                        }
                                    </>
                                }
                            </HiddenElement>}
                            icon={IconCashBanknote}
                        />
                        <InfoRow
                            label={resolveLanguageKey("estimatedCompletionDate")}
                            value={<HiddenElement>
                                {
                                    permissions.estimatedCompletionDate &&
                                    <>
                                        {
                                            financeDetails.estimatedCompletionDate ?
                                                <>
                                                    {format(new Date(financeDetails.estimatedCompletionDate), "PPp")}
                                                </>
                                                :
                                                null
                                        }
                                    </>
                                }
                            </HiddenElement>}
                            icon={IconCalendar}
                        />

                        <HiddenElement>
                            {
                                permissions.costBreakdown &&
                                <>
                                    <div className="text-xs pt-1 border-t">
                                        <p className="font-medium text-muted-foreground mb-1">{resolveLanguageKey("costBreakdown")}</p>
                                        <div className="space-y-1.5 max-h-40 overflow-y-auto">
                                            {
                                                financeDetails.costBreakdown?.map((item: any, index: number) => {
                                                        return (
                                                            <div key={index} className="text-xs p-2 rounded bg-muted/50 border border-border/30">
                                                                <div className="flex justify-between items-start">
                                                                    <HiddenElement>
                                                                        {
                                                                            cPermissions.item &&
                                                                            <>
                                                                                <p className="font-medium">{item.item}</p>
                                                                            </>
                                                                        }
                                                                    </HiddenElement>
                                                                    <HiddenElement>
                                                                        {
                                                                            !!cPermissions.quantity && !!cPermissions.cost &&
                                                                            <>
                                                                                <p className="text-green-400">
                                                                                    {formatFinanceCurrency(financeDetails)}{((item.cost ?? 0) * (item.quantity ?? 0)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                                                </p>
                                                                            </>
                                                                        }
                                                                    </HiddenElement>
                                                                </div>
                                                                <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-1 text-muted-foreground">

                                                                    <div className="flex items-center space-x-1">
                                                                        <p className="text-xs">{resolveLanguageKey("quantity")}:</p>
                                                                        <HiddenElement>
                                                                            {
                                                                                cPermissions.quantity &&
                                                                                <>
                                                                                    <p>{Number(item.quantity)}</p>
                                                                                </>
                                                                            }
                                                                        </HiddenElement>
                                                                    </div>
                                                                    <div className="flex items-center space-x-1">
                                                                        <p className="text-xs">{resolveLanguageKey("units")}:</p>
                                                                        <HiddenElement>
                                                                            {
                                                                                cPermissions.unit &&
                                                                                <>
                                                                                    <p>{item.unit}</p>
                                                                                </>
                                                                            }
                                                                        </HiddenElement>
                                                                    </div>
                                                                    <div className="flex items-center space-x-1">
                                                                        <p className="text-xs">{resolveLanguageKey("cost")}/{resolveLanguageKey("unit")}:</p>
                                                                        <HiddenElement>
                                                                            {
                                                                                cPermissions.cost &&
                                                                                <>
                                                                                    <p>{formatFinanceCurrency(financeDetails)}{item.cost?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                                                                                </>
                                                                            }
                                                                        </HiddenElement>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )
                                                    })
                                                }
                                        </div>
                                    </div>
                                </>
                            }
                        </HiddenElement>
                        <HiddenElement>
                            {
                                permissions.notes &&
                                <>
                                    <div className="pt-1 border-t">
                                        <p className="text-xs font-medium text-muted-foreground mb-1">{resolveLanguageKey("notesLabel")}</p>
                                        <p className="text-xs text-muted-foreground italic whitespace-pre-wrap max-h-32 overflow-y-auto">
                                            {financeDetails.notes && (financeDetails.notes.length > 250 ? financeDetails.notes.slice(0, 250) + "…" : financeDetails.notes)}
                                        </p>
                                    </div>
                                </>
                            }
                        </HiddenElement>
                        <HiddenElement>
                            {
                                permissions.media &&
                                <>
                                    <div className="pt-1 border-t">
                                        <p className="text-xs font-medium text-muted-foreground mb-1">{financeDetails?.media?.length ?? 0} {resolveLanguageKey((financeDetails?.media?.length ?? 0) === 1 ? "attachment" : "attachments")}</p>
                                    </div>
                                </>
                            }
                        </HiddenElement>

                    </CardContent>
                }
            </Card>
        )
    };

    const renderArchitectApproval = (stage: string, stageLabel: string) => {
        const status = getStageStatus(stage);

        return (
            <>
                {
                    read?.architectApproval?.keys?.decision ?
                    <div className={cn("relative flex flex-col cursor-pointer group items-start grow")}>
                        {
                            displayRequest.architectApproval?.decision ?
                            <>
                                <div className={cn("h-0.5 w-full absolute top-2", getLineClass("architect", "engineer"))} />
                                <TooltipDisplayer
                                    contentClassName={cn("p-0 bg-[#00000000]")}
                                    tooltipRender={() => {
                                        return (
                                            <div className="max-w-90 min-w-fit p-0">
                                                {renderApprovalPopoverContent(displayRequest.architectApproval, stageLabel, read?.architectApproval?.keys || {}, false, "architect")}
                                            </div>
                                        )}
                                    }
                                >
                                    <div className={`size-4 rounded-full border-2 transition-all duration-300 hover:scale-100 z-1 ${getStageDotClass(status)} `}/>
                                </TooltipDisplayer>
                            </>
                            :
                            <>
                                <div className={`size-4 rounded-full transition-all duration-300 hover:scale-100 z-1 bg-primary/20 blur-xs`}/>
                                <div className={cn("h-0.5 w-full absolute top-2 blur-xs bg-primary")} />
                            </>
                        }
                        <span className="text-sm mt-1.5 text-center text-muted-foreground whitespace-nowrap">{stageLabel}</span>
                    </div>
                    :
                    <div className="relative flex flex-col cursor-pointer group items-start grow">
                        <div className={`size-4 rounded-full transition-all duration-300 hover:scale-100 z-1 bg-primary/30 blur-xs`}/>
                        <div className={cn("h-0.5 w-full absolute top-2 blur-xs bg-primary")} />
                        <span className="text-sm mt-1.5 text-center text-muted-foreground whitespace-nowrap opacity-0">.</span>
                    </div>
                }
            </>
        )
    }
    const renderEngineerApproval = (stage: string, stageLabel: string) => {
        const status = getStageStatus(stage);
        return (
            <>
                {
                    read?.engineerApproval?.keys?.decision ?
                        <div className={cn("relative flex flex-col cursor-pointer group items-center grow")}>
                            {
                                displayRequest.engineerApproval?.decision ?
                                    <>
                                        <div className={cn("h-0.5 w-full absolute top-2", getLineClass("engineer", "ceo"))} />
                                        <TooltipDisplayer
                                            contentClassName={cn("p-0 min-w-fit bg-[#00000000]")}
                                            tooltipRender={() => {
                                                return (
                                                    <div className="max-w-90  p-0">
                                                        {renderApprovalPopoverContent(displayRequest.engineerApproval, stageLabel, read?.engineerApproval?.keys || {}, false, "engineer")}
                                                    </div>
                                                )}
                                            }
                                        >
                                            <div className={`size-4 rounded-full border-2 transition-all duration-300 hover:scale-100 z-1 ${getStageDotClass(status)} `}/>
                                        </TooltipDisplayer>
                                    </>
                                    :
                                    <>
                                        <div className={`size-4 rounded-full transition-all duration-300 hover:scale-100 z-1 bg-primary/20 blur-xs`}/>
                                        <div className={cn("h-0.5 w-full absolute top-2 blur-xs bg-primary")} />
                                    </>
                            }
                            <span className="text-sm mt-1.5 text-center text-muted-foreground whitespace-nowrap">{stageLabel}</span>
                        </div>
                        :
                        <div className="relative flex flex-col cursor-pointer group items-start grow">
                            <div className={`size-4 rounded-full transition-all duration-300 hover:scale-100 z-1 bg-primary/30 blur-xs`}/>
                            <div className={cn("h-0.5 w-full absolute top-2 blur-xs bg-primary")} />
                            <span className="text-sm mt-1.5 text-center text-muted-foreground whitespace-nowrap opacity-0">.</span>
                        </div>
                }
            </>
        )
    }
    const renderCEOApproval = (stage: string, stageLabel: string) => {
        const status = getStageStatus(stage);
        return (
            <>
                {
                    read?.ceoApproval?.keys?.decision ?
                        <div className={cn("relative flex flex-col cursor-pointer group items-center grow")}>
                            {
                                displayRequest.ceoApproval?.decision ?
                                    <>
                                        <div className={cn("h-0.5 w-full absolute top-2", getLineClass("ceo", "finance"))} />
                                        <TooltipDisplayer
                                            contentClassName={cn("p-0 min-w-fit bg-[#00000000]")}
                                            tooltipRender={() => {
                                                return (
                                                    <div className="max-w-90  p-0">
                                                        {renderApprovalPopoverContent(displayRequest.ceoApproval, stageLabel, read?.ceoApproval?.keys || {}, false, "ceo")}
                                                    </div>
                                                )}
                                            }
                                        >
                                            <div className={`size-4 rounded-full border-2 transition-all duration-300 hover:scale-100 z-1 ${getStageDotClass(status)} `}/>
                                        </TooltipDisplayer>
                                    </>
                                    :
                                    <>
                                        <div className={`size-4 rounded-full transition-all duration-300 hover:scale-100 z-1 bg-primary/20 blur-xs`}/>
                                        <div className={cn("h-0.5 w-full absolute top-2 blur-xs bg-primary")} />
                                    </>
                            }
                            <span className="text-sm mt-1.5 text-center text-muted-foreground whitespace-nowrap">{stageLabel}</span>
                        </div>
                        :
                        <div className="relative flex flex-col cursor-pointer group items-start grow">
                            <div className={`size-4 rounded-full transition-all duration-300 hover:scale-100 z-1 bg-primary/30 blur-xs`}/>
                            <div className={cn("h-0.5 w-full absolute top-2 blur-xs bg-primary")} />
                            <span className="text-sm mt-1.5 text-center text-muted-foreground whitespace-nowrap opacity-0">.</span>
                        </div>
                }
            </>
        )
    }
    const renderFinanceApproval = (stage: string, stageLabel: string) => {
        const status = getStageStatus(stage);
        return (
            <>
                {
                    read?.financeDetails ?
                        <div className={cn("relative flex flex-col cursor-pointer group items-center grow")}>
                            <div className={cn("h-0.5 w-full absolute top-2", getLineClass("finance", "delivery"))} />
                            <TooltipDisplayer
                                contentClassName={cn("p-0 min-w-fit bg-[#00000000]")}
                                tooltipRender={() => {
                                    return (
                                        <div className="max-w-90  p-0">
                                            {renderFinancePopoverContent(displayRequest.financeDetails, stageLabel, read?.financeDetails?.keys || {})}
                                        </div>
                                    )}
                                }
                            >
                                <div className={`size-4 rounded-full border-2 transition-all duration-300 hover:scale-100 z-1 ${getStageDotClass(status)} `}/>
                            </TooltipDisplayer>
                            <span className="text-sm mt-1.5 text-center text-muted-foreground whitespace-nowrap">{stageLabel}</span>
                        </div>
                        :
                        <div className="relative flex flex-col cursor-pointer group items-start grow">
                            <div className={`size-4 rounded-full transition-all duration-300 hover:scale-100 z-1 bg-primary/30 blur-xs`}/>
                            <div className={cn("h-0.5 w-full absolute top-2 blur-xs bg-primary")} />
                            <span className="text-sm mt-1.5 text-center text-muted-foreground whitespace-nowrap opacity-0">.</span>
                        </div>
                }
            </>
        )
    }
    const renderDeliveryApproval = (stage: string, stageLabel: string) => {
        const status = getStageStatus(stage);
        return (
            <>
                {
                    read?.deliveryApproval?.keys?.decision ?
                        <div className={cn("relative flex flex-col cursor-pointer group items-end grow")}>
                            {
                                displayRequest.deliveryApproval?.decision ?
                                    <>
                                        <div className={cn("h-0.5 w-full absolute top-2", getLineClass("delivery", "delivery"))} />
                                        <TooltipDisplayer
                                            contentClassName={cn("p-0 min-w-fit bg-[#00000000]")}
                                            tooltipRender={() => {
                                                return (
                                                    <div className="max-w-90  p-0">
                                                        {renderApprovalPopoverContent(displayRequest.deliveryApproval, stageLabel, read?.deliveryApproval?.keys || {}, true, "delivery")}
                                                    </div>
                                                )}
                                            }
                                        >
                                            <div className={`size-4 rounded-full border-2 transition-all duration-300 hover:scale-100 z-1 ${getStageDotClass(status)} `}/>
                                        </TooltipDisplayer>
                                    </>
                                    :
                                    <>
                                        <div className={`size-4 rounded-full transition-all duration-300 hover:scale-100 z-1 bg-primary/20 blur-xs`}/>
                                        <div className={cn("h-0.5 w-full absolute top-2 blur-xs bg-primary")} />
                                    </>
                            }
                            <span className="text-sm mt-1.5 text-center text-muted-foreground whitespace-nowrap">{stageLabel}</span>
                        </div>
                        :
                        <div className="relative flex flex-col cursor-pointer group items-start grow">
                            <div className={`size-4 rounded-full transition-all duration-300 hover:scale-100 z-1 bg-primary/30 blur-xs`}/>
                            <div className={cn("h-0.5 w-full absolute top-2 blur-xs bg-primary")} />
                            <span className="text-sm mt-1.5 text-center text-muted-foreground whitespace-nowrap opacity-0">.</span>
                        </div>
                }
            </>
        )
    }

    return (
        <EntityCardFetchGuard
            fetchId={fetchId}
            loading={loading}
            error={error}
            failedTitle={resolveLanguageKey("failedTitle")}
            failedDescription={resolveLanguageKey("failedDescription")}
            onRetry={() => setForceReload((n) => n + 1)}
        >
            <>
            <EntityCardShell onClick={fetchId ? undefined : () => setAction("view")} disableClick={!!fetchId}>
                    <div className="flex w-full items-stretch">
                        {
                            (read?.deletedBy || read?.deletedAt) &&
                            <DeletedInfo
                                deletedBy={displayRequest.deletedBy}
                                deletedAt={displayRequest.deletedAt}
                                restored={isRestored}
                            />
                        }
                        <div className="w-full min-w-0">
                            <div className={cn(CARD_BODY_CLASS, "dark:bg-card")}>
                                <div className="relative w-full max-w-full">
                                    <div className="relative flex flex-wrap items-center gap-2">
                                        <HiddenElement>
                                            {
                                                read?.name &&
                                                <>
                                                    {
                                                        displayRequest.name ?
                                                        <div className="flex items-center gap-1 font-semibold truncate">
                                                            <p>{displayRequest.name}</p>
                                                            <CopyTooltip text={displayRequest?.name} />
                                                        </div>
                                                        :
                                                        <div className="flex items-center gap-1 font-semibold truncate h-7">
                                                            {resolveLanguageKey("modificationRequest")}
                                                        </div>
                                                    }
                                                </>
                                            }
                                        </HiddenElement>
                                        <HiddenElement>
                                            {
                                                read?.constructionType &&
                                                <>
                                                    <TooltipDisplayer tooltip={resolveLanguageKey("constructionType")}>
                                                        <Badge variant="outline" className="font-medium">
                                                            <IconTag className="h-3 w-3 mr-1" />
                                                            {resolveLanguageKey(`constructionTypes.${displayRequest.constructionType}`)}
                                                        </Badge>
                                                    </TooltipDisplayer>
                                                </>
                                            }
                                        </HiddenElement>
                                        <HiddenElement>
                                            {
                                                read?.status &&
                                                <>
                                                    <TooltipDisplayer tooltip={resolveLanguageKey("status")}>
                                                        <Badge variant="outline" className={cn("font-medium border", getStatusColor(displayRequest.status ?? ""))}>
                                                            <IconActivity className="h-3 w-3 mr-1" />
                                                            {resolveLanguageKey(`statuses.${displayRequest.status}`)}
                                                        </Badge>
                                                    </TooltipDisplayer>
                                                </>
                                            }
                                        </HiddenElement>
                                        <EntityCardActionMenu variant="inline">
                                            <ActionMenu
                                                accessModel={"modificationRequests"}
                                                deletedData={displayRequest}
                                                hideEdit={modificationRequestShouldHideEdit(displayRequest, write)}
                                                onAction={(a: string) => setAction(a)}
                                                editPath={modificationRequestEditPath(displayRequest._id, displayRequest.name ?? "", resolvedUnitId, resolvedUnitName)}
                                                allowMenuForCustomChildren={true}
                                            >
                                                <ModificationRequestRowMenuExtras
                                                    request={displayRequest}
                                                    onAction={(a: string) => setAction(a)}
                                                    onModified={(updated: any) => {
                                                        setLocalRequest(updated);
                                                        onModified?.(updated);
                                                    }}
                                                />
                                            </ActionMenu>
                                        </EntityCardActionMenu>
                                    </div>
                                    <HiddenElement>
                                        {
                                            read?.title &&
                                            <>
                                                <p className="text-sm font-semibold line-clamp-2">{displayRequest.title}</p>
                                            </>
                                        }
                                    </HiddenElement>
                                </div>
                                <div className={cn(CARD_INFO_ROWS_CLASS, "grid grid-cols-1 sm:grid-cols-2 gap-1")}>
                                    <HiddenElement>
                                        {read?.unit && (
                                            <InfoRow
                                                show={!!read?.unit}
                                                label={unitInfoRow.label}
                                                tooltip={unitInfoRow.tooltip}
                                                value={displayRequest.unit != null ? unitInfoRow.valueStr : null}
                                                icon={IconHome}
                                                iconReplacement={
                                                    unitInfoRow.mdiName ? (
                                                        <MdiIcon
                                                            icon={unitInfoRow.mdiName}
                                                            size={0.75}
                                                            showFallback
                                                            className="text-muted-foreground"
                                                        />
                                                    ) : undefined
                                                }
                                            />
                                        )}
                                    </HiddenElement>
                                    {
                                        !small &&
                                        <HiddenElement>
                                            {read.submittedAt && (
                                                <InfoRow
                                                    show={!!read.submittedAt}
                                                    label={resolveLanguageKey("submittedAt")}
                                                    value={
                                                        displayRequest.submittedAt
                                                            ? format(new Date(displayRequest.submittedAt), "PP")
                                                            : null
                                                    }
                                                    icon={IconCalendar}
                                                />
                                            )}
                                        </HiddenElement>
                                    }
                                    {!!displayRequest.stageDueDate && (
                                        <InfoRow
                                            show={!!read?.stageDueDate}
                                            label={resolveLanguageKey("stageDueDate")}
                                            tooltip={resolveLanguageKey("stageDueDate")}
                                            value={format(new Date(displayRequest.stageDueDate), "PP")}
                                            icon={IconCalendar}
                                        />
                                    )}
                                    <HiddenElement>
                                        {read?.requestedBy && (
                                            <InfoRow
                                                show={!!read?.requestedBy}
                                                label={resolveLanguageKey("requestedBy")}
                                                value={
                                                    displayRequest.requestedBy
                                                        ? `${displayRequest.requestedBy.name ?? ""} ${displayRequest.requestedBy.surname ?? ""}`.trim() ||
                                                          null
                                                        : null
                                                }
                                                icon={IconUser}
                                            />
                                        )}
                                    </HiddenElement>
                                    <HiddenElement>
                                        {read?.completedAt && (
                                            <InfoRow
                                                show={!!read?.completedAt}
                                                label={resolveLanguageKey("deliveredAt")}
                                                className="text-green-400"
                                                value={
                                                    displayRequest.completedAt
                                                        ? format(new Date(displayRequest.completedAt), "PPp")
                                                        : null
                                                }
                                                icon={IconPackage}
                                            />
                                        )}
                                    </HiddenElement>
                                    <HiddenElement>
                                        {read?.cancelledAt && (
                                            <InfoRow
                                                show={!!read?.cancelledAt}
                                                label={resolveLanguageKey("cancelledAt")}
                                                className="text-red-400"
                                                value={
                                                    displayRequest.cancelledAt
                                                        ? format(new Date(displayRequest.cancelledAt), "PPp")
                                                        : null
                                                }
                                                icon={IconX}
                                            />
                                        )}
                                    </HiddenElement>
                                    <HiddenElement>
                                        {
                                            read?.financeDetails &&
                                            <>
                                                <InfoRow
                                                    label={resolveLanguageKey("totalCost")}
                                                    className="text-green-400"
                                                    value={
                                                        <div className="flex items-center space-x-0">
                                                            <HiddenElement>
                                                                {
                                                                    (read?.financeDetails?.keys?.currency?.keys?.symbol || read?.financeDetails?.keys?.currency?.keys?.abbreviation || read?.financeDetails?.keys?.currency?.keys?.name) &&
                                                                    <>
                                                                        <p className="font-semibold">
                                                                            {displayRequest.financeDetails?.currency?.symbol || displayRequest.financeDetails?.currency?.abbreviation || displayRequest.financeDetails?.currency?.name || ""}
                                                                        </p>
                                                                    </>
                                                                }
                                                            </HiddenElement>
                                                            <HiddenElement>
                                                                {
                                                                    read?.financeDetails?.keys?.totalCost &&
                                                                    <>
                                                                        <p className="font-semibold">
                                                                            {Number(displayRequest.financeDetails?.totalCost).toLocaleString()}
                                                                        </p>
                                                                    </>
                                                                }
                                                            </HiddenElement>
                                                        </div>
                                                    }
                                                    icon={IconCashBanknote}
                                                />
                                            </>
                                        }
                                    </HiddenElement>
                                </div>
                                {/* Timeline */}
                                <div className="flex w-full flex-nowrap">
                                    {renderArchitectApproval("architect", resolveLanguageKey("architectApproval"))}
                                    {renderEngineerApproval("engineer", resolveLanguageKey("engineerApproval"))}
                                    {renderCEOApproval("ceo", resolveLanguageKey("ceoApproval"))}
                                    {renderFinanceApproval("finance", resolveLanguageKey("finance"))}
                                    {renderDeliveryApproval("delivery", resolveLanguageKey("delivery"))}
                                </div>
                            </div>
                        </div>
                    </div>
                </EntityCardShell>

            <ModificationRequestSheetView
                open={action === "view"}
                onOpenChange={(open: boolean) => !open && setAction("")}
                request={displayRequest}
                unitId={resolvedUnitId}
                unitName={resolvedUnitName}
                onDelete={(req: ModificationRequest, response: DeletedData) => {
                    onDeleteSuccess(response);
                    onDelete?.(req, response);
                }}
                onRestore={() => {
                    setLocalRequest((prev) => ({...prev, deletedAt: undefined, deletedBy: undefined}));
                    onRestoreSuccess();
                    onRestore();
                }}
                onModified={(updated: ModificationRequest) => {
                    if (updated) setLocalRequest(updated);
                    onModified?.(updated);
                }}
                isRestored={isRestored}
            />

            {!!action && action !== "view" && (
                <>
                    {action === "delete" && (
                        <DeleteAction
                            accessModel={"modificationRequests"}
                            deleteId={displayRequest._id}
                            openAlert={action === "delete"}
                            name={read?.name && displayRequest.name}
                            confirmName={read?.name && displayRequest.name}
                            onSuccess={(data: DeletedData) => {
                                onDeleteSuccess(data);
                                setAction("");
                            }}
                            onCancel={() => setAction("")}
                            url={`/api/realEstate/unit/modificationRequest`}
                        />
                    )}
                    {action === "restore" && (
                        <RestoreAction
                            accessModel={"modificationRequests"}
                            deleteId={displayRequest._id}
                            openAlert={action === "restore"}
                            name={read?.name && displayRequest.name}
                            confirmName={read?.name && displayRequest.name}
                            onSuccess={() => {
                                setLocalRequest((prev) => ({...prev, deletedAt: undefined, deletedBy: undefined}));
                                onRestoreSuccess();
                                onRestore();
                                setAction("");
                            }}
                            onCancel={() => setAction("")}
                            url={`/api/realEstate/unit/modificationRequest/restore`}
                        />
                    )}
                    {action === "approve" && (
                        <ApproveModificationRequestDialog
                            open
                            onClose={() => setAction("")}
                            request={displayRequest}
                            onSuccess={(updated?: ModificationRequest) => {
                                if (updated) {
                                    setLocalRequest(updated);
                                    onModified?.(updated);
                                }
                                setAction("");
                            }}
                        />
                    )}
                    {action === "submitRevision" && (
                        <SubmitRevisionModificationRequestDialog
                            open
                            onClose={() => setAction("")}
                            request={displayRequest}
                            onSuccess={(updated?: ModificationRequest) => {
                                if (updated) {
                                    setLocalRequest(updated);
                                    onModified?.(updated);
                                }
                                setAction("");
                            }}
                        />
                    )}
                    {action === "finance" && (
                        <FinanceModificationRequestDialog
                            open
                            onClose={() => setAction("")}
                            request={displayRequest}
                            onSuccess={(updated?: ModificationRequest) => {
                                if (updated) {
                                    setLocalRequest(updated);
                                    onModified?.(updated);
                                }
                                setAction("");
                            }}
                        />
                    )}
                    {action === "deliver" && (
                        <DeliverModificationRequestDialog
                            open
                            onClose={() => setAction("")}
                            request={displayRequest}
                            onSuccess={(updated?: ModificationRequest) => {
                                if (updated) {
                                    setLocalRequest(updated);
                                    onModified?.(updated);
                                }
                                setAction("");
                            }}
                        />
                    )}
                    {action === "cancel" && (
                        <CancelModificationRequestDialog
                            open
                            onClose={() => setAction("")}
                            request={displayRequest}
                            onSuccess={(updated?: ModificationRequest) => {
                                if (updated) {
                                    setLocalRequest(updated);
                                    onModified?.(updated);
                                }
                                setAction("");
                            }}
                        />
                    )}
                </>
            )}
            </>
        </EntityCardFetchGuard>
    )
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/modificationRequests/center/cardView/modificationRequestCard.tsx"),
    withAxios(
        {
            url: "/api/realEstate/unit/modificationRequest/single",
            method: "POST",
            data: {},
        },
        true,
    ),
    withDebug(true, true),
)(ModificationRequestCard);

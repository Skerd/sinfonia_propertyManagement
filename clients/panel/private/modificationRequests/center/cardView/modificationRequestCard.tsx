import {compose} from "redux";
import {Card, CardContent} from "@coreModule/components/ui/card.tsx";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import HiddenElement from "@coreModule/components/custom/hiddenElement.tsx";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import ModificationRequestRowMenuExtras, {
    modificationRequestShouldHideEdit,
} from "@propertyManagementModule/clients/panel/private/modificationRequests/center/actions/modificationRequestRowMenuExtras.tsx";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import TooltipDisplayer from "@coreModule/components/custom/tooltipDisplayer.tsx";
import {
    ModificationRequest,
} from "armonia/src/modules/propertyManagement/api/realEstate/private/unit/modificationRequest/modificationRequest.dto.ts";
import ModificationRequestSheetView from "@propertyManagementModule/clients/panel/private/modificationRequests/center/sheetView/modificationRequestSheetView.tsx";
import {
    IconCalendar,
    IconCashBanknote,
    IconHome,
    IconTag,
    IconUser,
} from "@tabler/icons-react";
import {cn} from "@coreModule/components/lib/utils.ts";
import CopyTooltip from "@coreModule/components/custom/copyTooltip.tsx";
import {MdiIcon} from "@coreModule/components/custom/mdiIcons/mdiIcon.tsx";
import DisplayRow from "@coreModule/components/custom/displayValue/displayRow.tsx";
import EntityCard from "@coreModule/components/custom/systemCards/entityCard.tsx";
import type {WithAxiosLifecycleRef} from "@coreModule/helpers/hocs/withAxios.tsx";
import type {RefObject} from "react";
import ApproveModificationRequestDialog from "@propertyManagementModule/components/custom/modificationRequests/approveModificationRequestDialog.tsx";
import SubmitRevisionModificationRequestDialog from "@propertyManagementModule/components/custom/modificationRequests/submitRevisionModificationRequestDialog.tsx";
import FinanceModificationRequestDialog from "@propertyManagementModule/components/custom/modificationRequests/financeModificationRequestDialog.tsx";
import DeliverModificationRequestDialog from "@propertyManagementModule/components/custom/modificationRequests/deliverModificationRequestDialog.tsx";
import CancelModificationRequestDialog from "@propertyManagementModule/components/custom/modificationRequests/cancelModificationRequestDialog.tsx";

function modificationRequestEditPath(req: ModificationRequest, unitId: string, unitName?: string) {
    const params = new URLSearchParams();
    params.set("modificationRequestId", req._id);
    params.set("modificationRequestName", req.name ?? "");
    params.set("unitId", unitId);
    if (unitName) params.set("unitName", unitName);
    return `/realEstate/modificationRequests/edit?${params.toString()}`;
}

type ModificationRequestCardProps = WithLanguageType & {
    request: ModificationRequest;
    unitId?: string;
    unitName?: string;
    fetchId?: string;
    hideActions?: boolean;
    onDelete?: (request?: ModificationRequest, response?: DeletedData) => void;
    onRestore?: () => void;
    onModified?: (updated?: ModificationRequest) => void;
    isRestored?: boolean;
    small?: boolean;
    sheetOnly?: boolean;
    innerRef?: RefObject<WithAxiosLifecycleRef<ModificationRequest> | null>;
};

function ModificationRequestCard({
    request,
    resolveLanguageKey,
    unitId,
    unitName,
    fetchId,
    hideActions = false,
    onDelete,
    onRestore,
    onModified,
    isRestored = false,
    small,
    sheetOnly = false,
    innerRef,
}: ModificationRequestCardProps) {
    const {write} = useAccess("modificationRequests");

    return (
        <EntityCard
            resource="modificationRequests"
            entity={request}
            fetchId={fetchId}
            singleUrl="/api/realEstate/unit/modificationRequest/single"
            onDelete={onDelete}
            onRestore={onRestore}
            hideActions={hideActions}
            sheetOnly={sheetOnly}
            hideEdit={(entity) => modificationRequestShouldHideEdit(entity, write)}
            editPath={(row) =>
                modificationRequestEditPath(
                    row,
                    unitId ?? row.unit?._id ?? "",
                    unitName ?? row.unit?.name,
                )
            }
            Sheet={ModificationRequestSheetView}
            sheetEntityProp="request"
            deleteUrl="/api/realEstate/unit/modificationRequest"
            restoreUrl="/api/realEstate/unit/modificationRequest/restore"
            failedTitle={String(resolveLanguageKey("failedTitle"))}
            failedDescription={String(resolveLanguageKey("failedDescription"))}
            titlePath="name"
            innerRef={innerRef}
            sheetProps={({entity, setEntity}) => ({
                fetchId,
                unitId: unitId ?? entity.unit?._id ?? "",
                unitName: unitName ?? entity.unit?.name,
                onModified: (updated?: ModificationRequest) => {
                    if (updated) setEntity({...entity, ...updated});
                    onModified?.(updated);
                },
                isRestored,
            })}
            extraDialogs={({action, setAction, entity, setEntity}) => {
                const handleSuccess = (updated?: ModificationRequest) => {
                    if (updated) {
                        setEntity({...entity, ...updated});
                        onModified?.(updated);
                    }
                    setAction("");
                };
                return (
                    <>
                        {action === "approve" && (
                            <ApproveModificationRequestDialog
                                open
                                onClose={() => setAction("")}
                                request={entity}
                                onSuccess={handleSuccess}
                            />
                        )}
                        {action === "submitRevision" && (
                            <SubmitRevisionModificationRequestDialog
                                open
                                onClose={() => setAction("")}
                                request={entity}
                                onSuccess={handleSuccess}
                            />
                        )}
                        {action === "finance" && (
                            <FinanceModificationRequestDialog
                                open
                                onClose={() => setAction("")}
                                request={entity}
                                onSuccess={handleSuccess}
                            />
                        )}
                        {action === "deliver" && (
                            <DeliverModificationRequestDialog
                                open
                                onClose={() => setAction("")}
                                request={entity}
                                onSuccess={handleSuccess}
                            />
                        )}
                        {action === "cancel" && (
                            <CancelModificationRequestDialog
                                open
                                onClose={() => setAction("")}
                                request={entity}
                                onSuccess={handleSuccess}
                            />
                        )}
                    </>
                );
            }}
        >
            {({entity: displayRequest, setAction, setEntity: setLocalRequest, read: readUnknown}) => {
                const read = readUnknown as Record<string, any>;
                const unitTypeName = displayRequest.unit?.unitType?.name;
                const unitMdi = displayRequest.unit?.unitType?.icon;

            const formatFinanceCurrency = (fd: typeof displayRequest.financeDetails) =>
                String(fd?.currency?.symbol || fd?.currency?.abbreviation || fd?.currency?.name || "—");

            const getApprovalDecisionColor = (decision: string) => {
                if (decision === "approved") return "bg-success/20 text-success border-success/30";
                if (decision === "rejected") return "bg-destructive/20 text-destructive border-destructive/30";
                return "bg-warning/20 text-warning border-warning/30";
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
                        return "bg-success border-success/50 ring-2 ring-success/20";
                    case "rejected":
                        return "bg-destructive border-destructive/50 ring-2 ring-destructive/20";
                    case "current":
                        return "bg-warning border-warning/50 ring-2 ring-warning/20 animate-pulse";
                    default:
                        return "bg-muted border-border";
                }
            };
            const getLineClass = (fromStatus: string, toStatus: string) => {
                const from = getStageStatus(fromStatus);
                const to = getStageStatus(toStatus);

                if (from === "completed" && (to === "completed" || to === "current" || to === "rejected")) {
                    return "bg-success";
                }
                if (from === "rejected" || to === "rejected") {
                    return "bg-destructive";
                }
                if (from === "current") {
                    return "bg-warning";
                }
                return "bg-muted";
            };

            const renderApprovalPopoverContent = (
                approval: any,
                stageLabel: string,
                permissions: any = {},
                isDelivery?: boolean,
                stageType?: "architect" | "engineer" | "ceo" | "delivery",
            ) => {

                return (
                    <Card className="flex flex-col gap-y-2 w-full gap-0 min-w-56">
                        <div className="flex items-center gap-2 px-4 pt-4 pb-2">
                            <p className="text-sm font-semibold">{stageLabel}</p>
                            <HiddenElement>
                                {
                                    permissions.decision &&
                                    <>
                                        {
                                            !!approval.decision &&
                                            <p className={`text-xs px-2 py-0.5 rounded-md border ${getApprovalDecisionColor(approval?.decision)}`}>
                                                {resolveLanguageKey(`decisions.${approval?.decision}`)}
                                            </p>
                                        }
                                    </>
                                }
                            </HiddenElement>
                        </div>
                        <CardContent className="flex flex-col gap-y-2">
                            <HiddenElement>
                                {
                                    permissions.user &&
                                    <>
                                        {
                                            !!approval.user &&
                                            <DisplayRow
                                                label={resolveLanguageKey("reviewedBy")}
                                                show={!!permissions.user}
                                                type="user"
                                                value={approval?.user}
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
                                            <DisplayRow
                                                label={resolveLanguageKey("reviewedAt")}
                                                show={!!permissions.reviewedAt}
                                                type="dateTime"
                                                value={approval.reviewedAt}
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
                                                <div className="flex flex-col gap-y-1 max-h-32 overflow-y-auto">
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
                    <Card className="flex flex-col gap-y-2 w-full gap-0 min-w-56">
                        <div className="flex items-center gap-2 px-4 pt-4 pb-2">
                            <p className="text-sm font-semibold">{stageLabel}</p>
                            {
                                !!financeDetails ?
                                <p className={`text-xs px-2 py-0.5 rounded-md border ${getApprovalDecisionColor("approved")}`}>
                                    {resolveLanguageKey("completed")}
                                </p>
                                :
                                <p className={`text-xs px-2 py-0.5 rounded-md border ${getApprovalDecisionColor("pending")}`}>
                                    {resolveLanguageKey("decisions.pending")}
                                </p>
                            }
                        </div>
                        {
                            !!financeDetails &&
                            <CardContent className="flex flex-col gap-y-2">
                                <DisplayRow
                                    label={resolveLanguageKey("totalCost")}
                                    show={!!permissions.totalCost}
                                    type="currency"
                                    value={{amount: financeDetails.totalCost, currency: financeDetails.currency}}
                                    icon={IconCashBanknote}
                                >
                                    {(formatted) => (
                                        <div className="text-success font-semibold">{formatted}</div>
                                    )}
                                </DisplayRow>
                                <DisplayRow
                                    label={resolveLanguageKey("estimatedCompletionDate")}
                                    show={!!permissions.estimatedCompletionDate}
                                    type="dateTime"
                                    value={financeDetails.estimatedCompletionDate}
                                    icon={IconCalendar}
                                />

                                <HiddenElement>
                                    {
                                        permissions.costBreakdown &&
                                        <>
                                            <div className="text-xs pt-1 border-t">
                                                <p className="font-medium text-muted-foreground mb-1">{resolveLanguageKey("costBreakdown")}</p>
                                                <div className="flex flex-col gap-y-1.5 max-h-40 overflow-y-auto">
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
                                                                                        <p className="text-success">
                                                                                            {formatFinanceCurrency(financeDetails)}{((item.cost ?? 0) * (item.quantity ?? 0)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                                                        </p>
                                                                                    </>
                                                                                }
                                                                            </HiddenElement>
                                                                        </div>
                                                                        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-1 text-muted-foreground">

                                                                            <div className="flex items-center gap-x-1">
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
                                                                            <div className="flex items-center gap-x-1">
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
                                                                            <div className="flex items-center gap-x-1">
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
                                            contentClassName={cn("p-0 bg-transparent")}
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
                                                    contentClassName={cn("p-0 min-w-fit bg-transparent")}
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
                                                    contentClassName={cn("p-0 min-w-fit bg-transparent")}
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
                                        contentClassName={cn("p-0 min-w-fit bg-transparent")}
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
                                                    contentClassName={cn("p-0 min-w-fit bg-transparent")}
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
                    <>
                        <EntityCard.Header
                            titlePath="name"
                            title={
                                <span className="flex items-center gap-1 truncate">
                                    {displayRequest.name || resolveLanguageKey("modificationRequest")}
                                    {displayRequest.name ? <CopyTooltip text={displayRequest.name} /> : null}
                                </span>
                            }
                            subtitle={displayRequest.title}
                            subtitlePath="title"
                        >
                            <ModificationRequestRowMenuExtras
                                request={displayRequest}
                                onAction={setAction}
                                onModified={(updated) => {
                                    if (updated) setLocalRequest({...displayRequest, ...updated});
                                    onModified?.(updated);
                                }}
                            />
                        </EntityCard.Header>
                        <EntityCard.Body>
                            <DisplayRow
                                icon={IconHome}
                                iconReplacement={
                                    unitMdi ? (
                                        <MdiIcon
                                            icon={unitMdi}
                                            size={0.75}
                                            showFallback
                                            className="text-muted-foreground"
                                        />
                                    ) : undefined
                                }
                                label={unitTypeName || resolveLanguageKey("unit")}
                                tooltip={unitTypeName || resolveLanguageKey("unit")}
                                path="unit"
                                value={displayRequest.unit?.name ?? displayRequest.unit?.unitNumber}
                            />
                            <DisplayRow
                                icon={IconTag}
                                label={resolveLanguageKey("constructionType")}
                                tooltip={resolveLanguageKey("constructionType")}
                                path="constructionType"
                                type="enum"
                                languageKeyCategory="constructionTypes"
                                value={displayRequest.constructionType}
                            />
                            <DisplayRow
                                icon={IconTag}
                                label={resolveLanguageKey("status")}
                                tooltip={resolveLanguageKey("status")}
                                path="status"
                                type="enum"
                                languageKeyCategory="statuses"
                                value={displayRequest.status}
                            />
                            {!small && (
                                <DisplayRow
                                    icon={IconCalendar}
                                    label={resolveLanguageKey("submittedAt")}
                                    tooltip={resolveLanguageKey("submittedAt")}
                                    path="submittedAt"
                                    type="date"
                                    value={displayRequest.submittedAt}
                                />
                            )}
                            <DisplayRow
                                icon={IconCalendar}
                                label={resolveLanguageKey("stageDueDate")}
                                tooltip={resolveLanguageKey("stageDueDate")}
                                path="stageDueDate"
                                type="date"
                                value={displayRequest.stageDueDate}
                            />
                            <DisplayRow
                                icon={IconUser}
                                label={resolveLanguageKey("requestedBy")}
                                tooltip={resolveLanguageKey("requestedBy")}
                                path="requestedBy"
                                type="user"
                                value={displayRequest.requestedBy}
                            />
                            <DisplayRow
                                icon={IconCashBanknote}
                                label={resolveLanguageKey("totalCost")}
                                tooltip={resolveLanguageKey("totalCost")}
                                path="financeDetails.totalCost"
                                type="currency"
                                value={{
                                    amount: displayRequest.financeDetails?.totalCost,
                                    currency: displayRequest.financeDetails?.currency,
                                }}
                            />
                            <div className="flex w-full flex-nowrap">
                                {renderArchitectApproval("architect", resolveLanguageKey("architectApproval"))}
                                {renderEngineerApproval("engineer", resolveLanguageKey("engineerApproval"))}
                                {renderCEOApproval("ceo", resolveLanguageKey("ceoApproval"))}
                                {renderFinanceApproval("finance", resolveLanguageKey("finance"))}
                                {renderDeliveryApproval("delivery", resolveLanguageKey("delivery"))}
                            </div>
                        </EntityCard.Body>
                    </>
                );
            }}
        </EntityCard>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/modificationRequests/center/cardView/modificationRequestCard.tsx"),
    withDebug(true, true),
)(ModificationRequestCard);

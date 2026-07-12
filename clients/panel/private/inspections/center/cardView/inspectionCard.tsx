import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {useEffect, useImperativeHandle, useMemo, useState} from "react";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import withAxios, {WithAxiosType} from "@coreModule/helpers/hocs/withAxios.tsx";
import InspectionSheetView from "@propertyManagementModule/clients/panel/private/inspections/center/sheetView/inspectionSheetView.tsx";
import ActionMenu from "@coreModule/components/custom/actions/menu/actionMenu.tsx";
import DeleteAction from "@coreModule/components/custom/actions/deleteAction.tsx";
import RestoreAction from "@coreModule/components/custom/actions/restoreAction.tsx";
import CancelInspection from "@propertyManagementModule/clients/panel/private/inspections/center/actions/cancel.tsx";
import CancelInspectionDialog from "@propertyManagementModule/components/custom/inspections/cancelInspectionDialog.tsx";
import type {DeletedData, SingleForm} from "armonia/src/modules/core/types/shared.types.ts";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import {Badge} from "@coreModule/components/ui/badge.tsx";
import {Inspection} from "armonia/src/modules/propertyManagement/api/realEstate/private/unit/inspection/inspection.dto.ts";
import {Separator} from "@coreModule/components/ui/separator.tsx";
import {format} from "date-fns";
import HiddenElement from "@coreModule/components/custom/hiddenElement.tsx";
import TooltipDisplayer from "@coreModule/components/custom/tooltipDisplayer.tsx";
import {
    IconActivity,
    IconAlertCircle,
    IconAlertTriangle,
    IconCalendar,
    IconCalendarClock,
    IconFileText,
    IconHome,
    IconList,
    IconStar,
    IconTag,
} from "@tabler/icons-react";
import {cn} from "@coreModule/components/lib/utils.ts";
import DeletedInfo from "@coreModule/components/custom/deletedInfo";
import CopyTooltip from "@coreModule/components/custom/copyTooltip.tsx";
import InfoRow from "@coreModule/components/custom/infoRow.tsx";
import {MdiIcon} from "@coreModule/components/custom/mdiIcons/mdiIcon.tsx";
import ValueNotSet from "@coreModule/components/custom/valueNotSet.tsx";
import {buildInspectionEditPath} from "@propertyManagementModule/clients/panel/private/inspections";
import {useEntityCard} from "@coreModule/helpers/hooks/useEntityCard.ts";
import {EntityCardShell} from "@propertyManagementModule/components/custom/cards/EntityCardShell.tsx";
import {EntityCardFetchGuard} from "@propertyManagementModule/components/custom/cards/EntityCardFetchGuard.tsx";
import {EntityCardActionMenu} from "@propertyManagementModule/components/custom/cards/EntityCardActionMenu.tsx";
import {
    STATUS_BADGE_DANGER,
    STATUS_BADGE_INFO,
    STATUS_BADGE_NEUTRAL,
    STATUS_BADGE_SUCCESS,
    STATUS_BADGE_WARNING,
} from "@propertyManagementModule/components/custom/cards/entityCard.constants.ts";

type InspectionCardProps = WithLanguageType &
    WithAxiosType<Inspection, SingleForm> & {
    inspection: Inspection,
    /** When set, loads full inspection from `/api/realEstate/unit/inspection/single` using this id. */
    fetchId?: string,
    unitId: string,
    unitName: string,
    hideActions?: boolean,
    onDelete?: (deletedInspection: Inspection, response: DeletedData) => void,
    onRestore?: () => void,
    onCancelSuccess?: (updatedInspection?: Inspection) => void,
    /** When true, treat as restored and show Delete instead of Restore (for optimistic UI) */
    isRestored?: boolean,
    /** Controlled open state when sheetOnly. */
    open?: boolean,
    /** Called when sheet open state changes when sheetOnly. */
    onOpenChange?: (open: boolean) => void,
    small?: boolean,
}
function InspectionCard({
    inspection: propInspection,
    fetchId,
    onFilterChange,
    loading,
    error,
    innerRef,
    resolveLanguageKey,
    unitId,
    unitName,
    hideActions = false,
    onDelete: onDeleteProp,
    onRestore: onRestoreProp,
    onCancelSuccess,
    isRestored: isRestoredProp,
    open: controlledOpen,
    onOpenChange: controlledOnOpenChange,
    small
}: InspectionCardProps) {

    const {read, restore} = useAccess("inspections");
    const {action, setAction, entity: inspection, setEntity: setInspection, hideAfterDeletion, onDelete, onRestore} = useEntityCard({
        entityProp: propInspection,
        onDeleteProp,
        onRestoreProp,
        syncPropOnChange: !fetchId,
    });
    const [restored, setRestored] = useState(false);
    const isRestored = isRestoredProp ?? restored;
    const [forceReload, setForceReload] = useState(1);

    const isControlledSheet = controlledOnOpenChange != null;
    const viewSheetOpen = isControlledSheet ? (controlledOpen ?? false) : action === "view";
    const handleViewSheetOpenChange = (open: boolean) => {
        if (isControlledSheet) {
            controlledOnOpenChange?.(open);
        } else if (!open) {
            setAction("");
        }
    };

    const totalFindingsCount = useMemo(() => {
        if (!inspection.findings) return 0;
        const keys = ['structuralIssues', 'electricalIssues', 'plumbingIssues', 'hvacIssues', 'safetyConcerns', 'cosmeticIssues', 'otherObservations'] as const;
        return keys.reduce((sum, key) => {
            const items = inspection.findings?.[key];
            return sum + (Array.isArray(items) ? items.length : 0);
        }, 0);
    }, [inspection.findings]);

    const getStatusColor = (status?: string) => {
        if (!status) return STATUS_BADGE_NEUTRAL;
        const s = status.toLowerCase();
        if (s === 'scheduled') return STATUS_BADGE_INFO;
        if (s === 'in_progress') return STATUS_BADGE_WARNING;
        if (s === 'completed') return STATUS_BADGE_SUCCESS;
        if (s === 'cancelled') return STATUS_BADGE_DANGER;
        if (s === 'rescheduled') return "border-violet-500/30 bg-violet-500/10 text-violet-600 dark:text-violet-400";
        return STATUS_BADGE_NEUTRAL;
    }

    const getRatingColor = (rating?: number) => {
        if (!rating) return '';
        if (rating >= 8) return 'text-status-sold';
        if (rating >= 6) return 'text-status-reserved';
        return 'text-status-blocked';
    }

    useEffect(() => {
        if (fetchId) {
            onFilterChange({_id: fetchId});
        }
    }, [fetchId, forceReload]);

    useImperativeHandle(innerRef, () => ({
        success: (data: Inspection) => {
            setInspection(data);
        },
    }));

    if (hideAfterDeletion || !restore) {
        return <></>;
    }
    if (!read || !Object.keys(read).length) {
        return <HiddenElement />;
    }

    const cardInner = (
        <EntityCardShell
            onClick={fetchId ? undefined : () => setAction("view")}
            disableClick={!!fetchId}
        >
                <div className="flex w-full items-stretch">
                    {
                        (read?.deletedBy || read?.deletedAt) &&
                        <DeletedInfo
                            restored={isRestored}
                            deletedAt={inspection.deletedAt}
                            deletedBy={inspection.deletedBy}
                        />
                    }
                    <div className="w-full min-w-0">
                        <div className="relative dark:bg-card">
                            <div className="p-2 space-y-1">
                                {!!read?.name && (
                                    <p className="font-semibold text-base leading-tight line-clamp-1">{inspection.name}</p>
                                )}
                                <div className="flex flex-wrap gap-1">
                                    {!!read?.type && !!inspection.type && (
                                        <TooltipDisplayer tooltip={resolveLanguageKey("type")}>
                                            <Badge variant="outline" className="text-xs font-medium">
                                                <IconTag className="h-3 w-3 mr-1" />
                                                {resolveLanguageKey(`types.${inspection.type}`)}
                                            </Badge>
                                        </TooltipDisplayer>
                                    )}
                                    {!!read?.status && !!inspection.status && (
                                        <TooltipDisplayer tooltip={resolveLanguageKey("status")}>
                                            <Badge variant="outline" className={cn("text-xs font-medium", getStatusColor(inspection.status))}>
                                                <IconActivity className="h-3 w-3 mr-1" />
                                                {resolveLanguageKey(`statuses.${inspection.status}`)}
                                            </Badge>
                                        </TooltipDisplayer>
                                    )}
                                    {!!read?.rating && inspection.rating != null && (
                                        <TooltipDisplayer tooltip={resolveLanguageKey("rating")}>
                                            <Badge variant="outline" className={cn("text-xs font-medium", getRatingColor(inspection.rating))}>
                                                <IconStar className="h-3 w-3 mr-1" />
                                                {inspection.rating}/10
                                            </Badge>
                                        </TooltipDisplayer>
                                    )}
                                </div>
                                {small ? (
                                    <div className="flex flex-wrap gap-x-2 gap-y-0.5 px-1">
                                        <InfoRow
                                            icon={IconHome}
                                            iconReplacement={
                                                inspection.unit?.unitType?.icon ? (
                                                    <MdiIcon
                                                        icon={inspection.unit.unitType.icon}
                                                        size={0.75}
                                                        showFallback
                                                        className="text-muted-foreground"
                                                    />
                                                ) : undefined
                                            }
                                            label={inspection.unit?.unitType?.name ?? resolveLanguageKey("unit")}
                                            tooltip={inspection.unit?.unitType?.name ?? resolveLanguageKey("unit")}
                                            show={!!read?.unit}
                                            value={inspection.unit != null && (inspection.unit.name ?? inspection.unit.unitNumber ?? null)}
                                        />
                                        <InfoRow
                                            icon={IconList}
                                            label={resolveLanguageKey("findings")}
                                            tooltip={resolveLanguageKey("findings")}
                                            show={!!read?.findings}
                                            value={totalFindingsCount}
                                        />
                                        {!!inspection.notes && !!read?.notes && (
                                            <TooltipDisplayer tooltip={resolveLanguageKey("notes")}>
                                                <Badge variant="outline" className="text-xs font-medium text-muted-foreground">
                                                    <IconFileText className="h-3 w-3 mr-1" />
                                                    {resolveLanguageKey("notes")}
                                                </Badge>
                                            </TooltipDisplayer>
                                        )}
                                    </div>
                                ) : (
                                    <>
                                        <Separator />
                                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-1">
                                            <InfoRow
                                                icon={IconHome}
                                                iconReplacement={
                                                    inspection.unit?.unitType?.icon ? (
                                                        <MdiIcon
                                                            icon={inspection.unit.unitType.icon}
                                                            size={0.75}
                                                            showFallback
                                                            className="text-muted-foreground"
                                                        />
                                                    ) : undefined
                                                }
                                                label={inspection.unit?.unitType?.name ?? resolveLanguageKey("unit")}
                                                tooltip={inspection.unit?.unitType?.name ?? resolveLanguageKey("unit")}
                                                show={!!read?.unit}
                                                value={inspection.unit != null && (inspection.unit.name ?? inspection.unit.unitNumber ?? null)}
                                            />
                                            <InfoRow
                                                icon={IconCalendarClock}
                                                label={resolveLanguageKey("inspectedBy")}
                                                tooltip={resolveLanguageKey("inspectedBy")}
                                                show={!!read?.inspectedBy}
                                                value={inspection.inspectedBy != null && `${inspection.inspectedBy.name} ${inspection.inspectedBy.surname}`}
                                            />
                                            <InfoRow
                                                icon={IconCalendar}
                                                label={resolveLanguageKey("inspectionDate")}
                                                tooltip={resolveLanguageKey("inspectionDate")}
                                                show={!!read?.inspectionDate}
                                                value={inspection.inspectionDate != null && format(new Date(inspection.inspectionDate), "PP")}
                                            />
                                            <InfoRow
                                                icon={IconCalendarClock}
                                                label={resolveLanguageKey("nextInspectionDate")}
                                                tooltip={resolveLanguageKey("nextInspectionDate")}
                                                show={!!read?.nextInspectionDate}
                                                value={inspection.nextInspectionDate != null && format(new Date(inspection.nextInspectionDate), "PP")}
                                            />
                                            {!!read?.scheduledDate && !!inspection.scheduledDate && inspection.status === "scheduled" && (
                                                <InfoRow
                                                    icon={IconCalendar}
                                                    label={resolveLanguageKey("scheduledDate")}
                                                    tooltip={resolveLanguageKey("scheduledDate")}
                                                    show={true}
                                                    value={format(new Date(inspection.scheduledDate), "PP")}
                                                />
                                            )}
                                        </div>
                                        {(read?.followUpInspection || read?.followedUpByInspection) && (
                                            <>
                                                <Separator />
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 w-full">
                                                    <div className="w-full">
                                                        <p className="text-xs font-medium text-muted-foreground">{resolveLanguageKey("followUpInspection")}</p>
                                                        <HiddenElement>
                                                            {read?.followUpInspection && (
                                                                <>
                                                                    {inspection.followUpInspection ? (
                                                                        <div className="flex items-center gap-1 font-semibold truncate mt-1">
                                                                            <p>{inspection.followUpInspection.name}</p>
                                                                            <CopyTooltip text={inspection?.followUpInspection?.name} />
                                                                        </div>
                                                                    ) : (
                                                                        <div className="mt-2"><ValueNotSet /></div>
                                                                    )}
                                                                </>
                                                            )}
                                                        </HiddenElement>
                                                    </div>
                                                    <div className="w-full">
                                                        <p className="text-xs font-medium text-muted-foreground">{resolveLanguageKey("followedUpByInspection")}</p>
                                                        <HiddenElement>
                                                            {read?.followedUpByInspection && (
                                                                <>
                                                                    {inspection.followedUpByInspection ? (
                                                                        <div className="flex items-center gap-1 font-semibold truncate mt-1">
                                                                            <p>{inspection.followedUpByInspection.name}</p>
                                                                            <CopyTooltip text={inspection?.followedUpByInspection?.name} />
                                                                        </div>
                                                                    ) : (
                                                                        <div className="mt-2"><ValueNotSet /></div>
                                                                    )}
                                                                </>
                                                            )}
                                                        </HiddenElement>
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                        {(read?.followUpRequired || read?.findings || read?.notes) && (
                                            <>
                                                <Separator />
                                                <div className="flex items-center gap-1 flex-wrap">
                                                    <HiddenElement>
                                                        {read?.followUpRequired && (
                                                            <>
                                                                {(inspection.followUpRequiredOutstanding === true ||
                                                                    (inspection.followUpRequiredOutstanding === undefined &&
                                                                        inspection.followUpRequired &&
                                                                        !inspection.followUpInspection &&
                                                                        !inspection.followedUpByInspection)) && (
                                                                    <TooltipDisplayer tooltip={resolveLanguageKey("followUpRequired")}>
                                                                        <Badge variant="outline" className={cn("flex items-center justify-center border rounded-lg text-sm", STATUS_BADGE_WARNING)}>
                                                                            <IconAlertTriangle className="h-3 w-3 mr-1" />
                                                                            {resolveLanguageKey("followUpRequired")}
                                                                        </Badge>
                                                                    </TooltipDisplayer>
                                                                )}
                                                            </>
                                                        )}
                                                    </HiddenElement>
                                                    <HiddenElement>
                                                        {
                                                            read?.findings &&
                                                            <>
                                                                <TooltipDisplayer tooltip={resolveLanguageKey("findings")}>
                                                                    <Badge variant="outline" className="flex items-center justify-center border rounded-lg text-sm text-muted-foreground">
                                                                        <IconAlertCircle className="h-3 w-3 mr-1" />
                                                                        {totalFindingsCount} {resolveLanguageKey("findings")}
                                                                    </Badge>
                                                                </TooltipDisplayer>
                                                            </>
                                                        }
                                                    </HiddenElement>
                                                    <HiddenElement>
                                                        {
                                                            read?.notes &&
                                                            <>
                                                                <TooltipDisplayer tooltip={resolveLanguageKey("notes")}>
                                                                    <Badge variant="outline" className="flex items-center justify-center border rounded-lg text-sm text-muted-foreground">
                                                                        <IconFileText className="h-3 w-3 mr-1" />
                                                                        {resolveLanguageKey("notes")}
                                                                    </Badge>
                                                                </TooltipDisplayer>
                                                            </>
                                                        }
                                                    </HiddenElement>
                                                </div>
                                            </>
                                        )}
                                    </>
                                )}
                            </div>
                            {
                                !hideActions &&
                                <EntityCardActionMenu>
                                    <ActionMenu
                                        accessModel="inspections"
                                        deletedData={inspection}
                                        onAction={(a: string) => setAction(a)}
                                        editPath={buildInspectionEditPath(inspection)}
                                        allowMenuForCustomChildren={(inspection as {status?: string}).status === "scheduled"}
                                    >
                                        {(inspection as {status?: string}).status === "scheduled" && (
                                            <CancelInspection onAction={(a: string) => setAction(a)} />
                                        )}
                                    </ActionMenu>
                                </EntityCardActionMenu>
                            }
                        </div>
                    </div>
                </div>
        </EntityCardShell>
    );

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
                {cardInner}

            {
                !!action &&
                <>
                    {
                        action === "view" &&
                        <InspectionSheetView
                            open={viewSheetOpen}
                            onOpenChange={handleViewSheetOpenChange}
                            inspection={inspection}
                            unitId={unitId}
                            unitName={unitName}
                            hideActions={hideActions}
                            onDelete={onDelete}
                            onRestore={() => { setRestored(true); onRestore(); }}
                            onCancelSuccess={onCancelSuccess}
                            isRestored={isRestored}
                        />
                    }
                    {
                        action === "delete" &&
                        <DeleteAction
                            accessModel="inspections"
                            deleteId={inspection._id}
                            openAlert={action === "delete"}
                            name={read?.name && inspection.name}
                            confirmName={read?.name && inspection.name}
                            onSuccess={(data: DeletedData) => {
                                onDelete(data);
                                setAction("");
                            }}
                            onCancel={() => setAction("")}
                            url="/api/realEstate/unit/inspection"
                        />
                    }
                    {
                        action === "restore" &&
                        <RestoreAction
                            accessModel="inspections"
                            deleteId={inspection._id}
                            openAlert={action === "restore"}
                            name={read?.name && inspection.name}
                            confirmName={read?.name && inspection.name}
                            onSuccess={() => {
                                setRestored(true);
                                onRestore();
                                setAction("");
                            }}
                            onCancel={() => setAction("")}
                            url="/api/realEstate/unit/inspection/restore"
                        />
                    }
                    {
                        action === "cancelInspection" &&
                        <CancelInspectionDialog
                            open={action === "cancelInspection"}
                            onClose={() => setAction("")}
                            inspection={inspection}
                            onSuccess={(data?: Inspection) => {
                                onCancelSuccess?.(data);
                                setAction("");
                            }}
                        />
                    }
                </>
            }
            </>
        </EntityCardFetchGuard>
    )
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/inspections/center/cardView/inspectionCard.tsx"),
    withAxios(
        {
            url: "/api/realEstate/unit/inspection/single",
            method: "POST",
            data: {},
        },
        true,
    ),
    withDebug(true, true),
)(InspectionCard);

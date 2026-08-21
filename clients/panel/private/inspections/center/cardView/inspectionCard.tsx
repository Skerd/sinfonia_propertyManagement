import {compose} from "redux";
import withLanguage, {type ResolveLanguageKey, WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import InspectionSheetView from "@propertyManagementModule/clients/panel/private/inspections/center/sheetView/inspectionSheetView.tsx";
import CancelInspection from "@propertyManagementModule/clients/panel/private/inspections/center/actions/cancel.tsx";
import CancelInspectionDialog from "@propertyManagementModule/components/custom/inspections/cancelInspectionDialog.tsx";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import {Inspection} from "armonia/src/modules/propertyManagement/api/realEstate/private/unit/inspection/inspection.dto.ts";
import {
    IconAlertTriangle,
    IconArrowBack,
    IconArrowForward,
    IconCalendar,
    IconCalendarClock,
    IconHome,
    IconNotes,
    IconStar,
    IconTag,
    IconUser,
} from "@tabler/icons-react";
import {buildInspectionEditPath} from "@propertyManagementModule/clients/panel/private/inspections";
import DisplayRow from "@coreModule/components/custom/displayValue/displayRow.tsx";
import DisplayValue from "@coreModule/components/custom/displayValue/displayValue.tsx";
import EntityCard from "@coreModule/components/custom/systemCards/entityCard.tsx";
import {Badge} from "@coreModule/components/ui/badge.tsx";
import {Separator} from "@coreModule/components/ui/separator.tsx";
import {cn} from "@coreModule/components/lib/utils.ts";
import {
    CARD_INFO_ROWS_TWO_COL_CLASS,
    STATUS_BADGE_NEUTRAL,
    STATUS_BADGE_WARNING,
} from "@coreModule/components/custom/cards/entityCard.constants.ts";
import type {WithAxiosLifecycleRef} from "@coreModule/helpers/hocs/withAxios.tsx";
import type {ReactNode, RefObject} from "react";

function inspectionStatusTextClass(status: string): string {
    switch (status) {
        case "completed":
            return "text-status-sold";
        case "scheduled":
            return "text-status-available";
        case "in_progress":
        case "rescheduled":
            return "text-status-reserved";
        case "cancelled":
            return "text-status-blocked";
        default:
            return "text-muted-foreground";
    }
}

/** Rating scale is 1–10. */
function inspectionRatingTextClass(rating: number): string {
    if (rating >= 8) return "text-status-sold";
    if (rating >= 5) return "text-status-reserved";
    return "text-status-blocked";
}

function InspectionCardFooterBadges({
    entity,
    resolveLanguageKey,
}: {
    entity: Inspection;
    resolveLanguageKey: ResolveLanguageKey;
}): ReactNode {
    const followUpRequired = entity.followUpRequired;
    const notes = entity.notes?.trim();

    if (!followUpRequired && !notes) return null;

    return (
        <div className="flex flex-wrap items-center gap-1.5">
            {followUpRequired ? (
                <DisplayValue path="followUpRequired" type="boolean" value={followUpRequired}>
                    {() => (
                        <Badge variant="outline" className={cn("text-xs gap-1", STATUS_BADGE_WARNING)}>
                            <IconAlertTriangle className="size-3" aria-hidden />
                            {String(resolveLanguageKey("followUpRequired"))}
                        </Badge>
                    )}
                </DisplayValue>
            ) : null}
            {notes ? (
                <DisplayValue path="notes" value={notes}>
                    {() => (
                        <Badge variant="secondary" className={cn("text-xs gap-1", STATUS_BADGE_NEUTRAL)}>
                            <IconNotes className="size-3" aria-hidden />
                            {String(resolveLanguageKey("notes"))}
                        </Badge>
                    )}
                </DisplayValue>
            ) : null}
        </div>
    );
}

type InspectionCardProps = WithLanguageType & {
    inspection: Inspection;
    fetchId?: string;
    unitId: string;
    unitName: string;
    hideActions?: boolean;
    onDelete?: (deletedInspection?: Inspection, response?: DeletedData) => void;
    onRestore?: () => void;
    onCancelSuccess?: (updatedInspection?: Inspection) => void;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    sheetOnly?: boolean;
    small?: boolean;
    innerRef?: RefObject<WithAxiosLifecycleRef<Inspection> | null>;
};

function InspectionCard({
    inspection,
    fetchId,
    resolveLanguageKey,
    unitId,
    unitName,
    hideActions = false,
    onDelete,
    onRestore,
    onCancelSuccess,
    open,
    onOpenChange,
    sheetOnly = false,
    small,
    innerRef,
}: InspectionCardProps) {
    const controlled = onOpenChange != null;

    return (
        <>
            <EntityCard
                resource="inspections"
                entity={inspection}
                fetchId={fetchId}
                singleUrl="/api/realEstate/unit/inspection/single"
                onDelete={onDelete}
                onRestore={onRestore}
                hideActions={hideActions}
                sheetOnly={sheetOnly || controlled}
                editPath={buildInspectionEditPath}
                Sheet={InspectionSheetView}
                sheetEntityProp="inspection"
                deleteUrl="/api/realEstate/unit/inspection"
                restoreUrl="/api/realEstate/unit/inspection/restore"
                failedTitle={String(resolveLanguageKey("failedTitle"))}
                failedDescription={String(resolveLanguageKey("failedDescription"))}
                titlePath="name"
                innerRef={innerRef}
                sheetProps={() => ({
                    fetchId,
                    unitId,
                    unitName,
                    onCancelSuccess,
                })}
                extraDialogs={({action, setAction, entity}) => (
                    <>
                        {action === "cancelInspection" && (
                            <CancelInspectionDialog
                                open
                                onClose={() => setAction("")}
                                inspection={entity}
                                onSuccess={(data?: Inspection) => {
                                    onCancelSuccess?.(data);
                                    setAction("");
                                }}
                            />
                        )}
                    </>
                )}
            >
                {({entity, setAction}) => {
                    const hasFooterBadges = Boolean(entity.followUpRequired || entity.notes?.trim());
                    const status = entity.status;
                    const rating = entity.rating;
                    return (
                        <>
                            <EntityCard.Header titlePath="name" title={entity.name}>
                                {status === "scheduled" ? <CancelInspection onAction={setAction} /> : null}
                            </EntityCard.Header>
                            <EntityCard.Body className="grid min-w-0 grid-cols-1 sm:grid-cols-3 [&_[data-slot=item]]:w-full [&_[data-slot=restricted-fields]]:col-span-full">
                                <DisplayRow
                                    icon={IconTag}
                                    label={resolveLanguageKey("type")}
                                    tooltip={resolveLanguageKey("type")}
                                    path="type"
                                    type="enum"
                                    languageKeyCategory="types"
                                    value={entity.type}
                                />
                                <DisplayRow
                                    icon={IconTag}
                                    label={resolveLanguageKey("status")}
                                    tooltip={resolveLanguageKey("status")}
                                    path="status"
                                    type="enum"
                                    languageKeyCategory="statuses"
                                    value={status}
                                >
                                    {(formatted) => (
                                        <span className={cn("font-medium", status ? inspectionStatusTextClass(status) : undefined)}>
                                            {formatted}
                                        </span>
                                    )}
                                </DisplayRow>
                                <DisplayRow
                                    icon={IconStar}
                                    label={resolveLanguageKey("rating")}
                                    tooltip={resolveLanguageKey("rating")}
                                    path="rating"
                                    type="number"
                                    value={rating}
                                >
                                    {(formatted) =>
                                        rating != null ? (
                                            <span className={cn("font-medium", inspectionRatingTextClass(rating))}>
                                                {formatted}/10
                                            </span>
                                        ) : (
                                            formatted
                                        )
                                    }
                                </DisplayRow>
                            </EntityCard.Body>
                            <Separator className="-mx-(--density-pad) w-auto self-stretch" />
                            <EntityCard.Body className={CARD_INFO_ROWS_TWO_COL_CLASS}>
                                <DisplayRow
                                    icon={IconHome}
                                    label={entity.unit?.unitType?.name ?? resolveLanguageKey("unit")}
                                    tooltip={entity.unit?.unitType?.name ?? resolveLanguageKey("unit")}
                                    path="unit"
                                    value={entity.unit?.name ?? entity.unit?.unitNumber}
                                />
                                <DisplayRow
                                    icon={IconUser}
                                    label={resolveLanguageKey("inspectedBy")}
                                    tooltip={resolveLanguageKey("inspectedBy")}
                                    path="inspectedBy"
                                    type="user"
                                    value={entity.inspectedBy}
                                />
                                {!small && (
                                    <>
                                        <DisplayRow
                                            icon={IconCalendar}
                                            label={resolveLanguageKey("inspectionDate")}
                                            tooltip={resolveLanguageKey("inspectionDate")}
                                            path="inspectionDate"
                                            type="date"
                                            value={entity.inspectionDate}
                                        />
                                        <DisplayRow
                                            icon={IconCalendarClock}
                                            label={resolveLanguageKey("nextInspectionDate")}
                                            tooltip={resolveLanguageKey("nextInspectionDate")}
                                            path="nextInspectionDate"
                                            type="date"
                                            value={entity.nextInspectionDate}
                                        />
                                    </>
                                )}
                            </EntityCard.Body>
                            {!small && (
                                <>
                                    <Separator className="-mx-(--density-pad) w-auto self-stretch" />
                                    <EntityCard.Body className={CARD_INFO_ROWS_TWO_COL_CLASS}>
                                        <DisplayRow
                                            icon={IconArrowForward}
                                            label={resolveLanguageKey("followUpInspection")}
                                            tooltip={resolveLanguageKey("followUpInspection")}
                                            path="followUpInspection"
                                            value={entity.followUpInspection?.name}
                                        />
                                        <DisplayRow
                                            icon={IconArrowBack}
                                            label={resolveLanguageKey("followedUpByInspection")}
                                            tooltip={resolveLanguageKey("followedUpByInspection")}
                                            path="followedUpByInspection"
                                            value={entity.followedUpByInspection?.name}
                                        />
                                    </EntityCard.Body>
                                </>
                            )}
                            {!small && hasFooterBadges && (
                                <>
                                    <Separator className="-mx-(--density-pad) w-auto self-stretch" />
                                    <InspectionCardFooterBadges
                                        entity={entity}
                                        resolveLanguageKey={resolveLanguageKey}
                                    />
                                </>
                            )}
                        </>
                    );
                }}
            </EntityCard>
            {controlled && (
                <InspectionSheetView
                    open={open ?? false}
                    onOpenChange={onOpenChange}
                    inspection={inspection}
                    unitId={unitId}
                    unitName={unitName}
                    hideActions={hideActions}
                    onDelete={onDelete}
                    onRestore={onRestore}
                    onCancelSuccess={onCancelSuccess}
                />
            )}
        </>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/inspections/center/cardView/inspectionCard.tsx"),
    withDebug(true, true, "inspections"),
)(InspectionCard);

import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import InspectionSheetView, {inspectionTitle} from "@propertyManagementModule/clients/panel/private/inspections/center/sheetView/inspectionSheetView.tsx";
import InspectionRowMenuExtras from "@propertyManagementModule/clients/panel/private/inspections/center/actions/inspectionRowMenuExtras.tsx";
import CancelInspectionDialog from "@propertyManagementModule/components/custom/inspections/cancelInspectionDialog.tsx";
import UpdateInspectionChecklistDialog from "@propertyManagementModule/components/custom/inspections/updateInspectionChecklistDialog.tsx";
import InspectionLifecycleDialogs from "@propertyManagementModule/clients/panel/private/inspections/center/actions/inspectionLifecycleDialogs.tsx";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import {Inspection} from "armonia/src/modules/propertyManagement/api/realEstate/private/unit/inspection/inspection.dto.ts";
import {IconAlertTriangle, IconCalendar, IconCalendarClock, IconStar, IconUser} from "@tabler/icons-react";
import {buildInspectionEditPath} from "@propertyManagementModule/clients/panel/private/inspections";
import EntityCardRow from "@coreModule/components/entityPage/list/card/entityCardRow.tsx";
import DisplayValue from "@coreModule/components/viewEngine/widgets/display/displayValue.tsx";
import EntityCard from "@coreModule/components/entityPage/list/card/entityCard.tsx";
import {Badge} from "@coreModule/components/ui/badge.tsx";
import StatusBadge from "@coreModule/components/entityPage/sheet/statusBadge.tsx";
import {cn} from "@coreModule/components/lib/utils.ts";
import {CARD_INFO_ROWS_TWO_COL_CLASS, STATUS_BADGE_WARNING} from "@coreModule/components/entityPage/list/entityCard.constants.ts";
import type {WithAxiosLifecycleRef} from "@coreModule/helpers/hocs/withAxios.tsx";
import type {RefObject} from "react";

/** Rating scale is 1–10. */
function inspectionRatingTextClass(rating: number): string {
    if (rating >= 8) return "text-success";
    if (rating >= 5) return "text-warning";
    return "text-destructive";
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
    onChecklistSuccess?: (updatedInspection?: Inspection) => void;
    onLifecycleSuccess?: (updatedInspection?: Inspection) => void;
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
    onChecklistSuccess,
    onLifecycleSuccess,
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
                failedTitle={resolveLanguageKey("failedTitle")}
                failedDescription={resolveLanguageKey("failedDescription")}
                titlePath="name"
                innerRef={innerRef}
                sheetProps={() => ({
                    fetchId,
                    unitId,
                    unitName,
                    onCancelSuccess,
                    onChecklistSuccess,
                    onLifecycleSuccess,
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
                        {action === "updateInspectionChecklist" && (
                            <UpdateInspectionChecklistDialog
                                open
                                onClose={() => setAction("")}
                                inspection={entity}
                                onSuccess={(data?: Inspection) => {
                                    onChecklistSuccess?.(data);
                                    setAction("");
                                }}
                            />
                        )}
                        <InspectionLifecycleDialogs
                            action={action}
                            inspection={entity}
                            onClose={() => setAction("")}
                            onSuccess={(data?: Inspection) => {
                                onLifecycleSuccess?.(data);
                                setAction("");
                            }}
                        />
                    </>
                )}
            >
                {({entity, setAction}) => {
                    const rating = entity.rating;
                    const title = inspectionTitle(entity, String(resolveLanguageKey(`types.${entity.type}`)));
                    return (
                        <>
                            {/* Named by its type and unit, the code beside it, the state and an open follow-up as badges (UX-01, UX-02, D151). */}
                            <EntityCard.Header
                                titlePath={["type", "unit"]}
                                title={title || entity.name}
                                subtitlePath="name"
                                subtitle={title ? entity.name : undefined}
                                badgesBesideTitle
                                badges={
                                    <>
                                        <StatusBadge
                                            tableConfigKey="inspections"
                                            field="status"
                                            value={entity.status}
                                            label={String(resolveLanguageKey(`statuses.${entity.status}`))}
                                        />
                                        {entity.followUpRequired ? (
                                            <DisplayValue path="followUpRequired" type="boolean" value={entity.followUpRequired}>
                                                {() => (
                                                    <Badge variant="outline" className={cn("text-xs gap-1", STATUS_BADGE_WARNING)}>
                                                        <IconAlertTriangle className="size-3" aria-hidden />
                                                        {String(resolveLanguageKey("followUpRequired"))}
                                                    </Badge>
                                                )}
                                            </DisplayValue>
                                        ) : null}
                                    </>
                                }
                            >
                                <InspectionRowMenuExtras inspection={entity} onAction={setAction} />
                            </EntityCard.Header>
                            {/* When → who → how it went → what comes next (UX-02). */}
                            <EntityCard.Body className={CARD_INFO_ROWS_TWO_COL_CLASS}>
                                <EntityCardRow
                                    icon={IconCalendar}
                                    label={resolveLanguageKey("inspectionDate")}
                                    tooltip={resolveLanguageKey("inspectionDate")}
                                    path="inspectionDate"
                                    type="date"
                                    value={entity.inspectionDate}
                                />
                                <EntityCardRow
                                    icon={IconUser}
                                    label={resolveLanguageKey("inspectedBy")}
                                    tooltip={resolveLanguageKey("inspectedBy")}
                                    path="inspectedBy"
                                    type="user"
                                    value={entity.inspectedBy}
                                />
                                {rating != null ? (
                                    <EntityCardRow
                                        icon={IconStar}
                                        label={resolveLanguageKey("rating")}
                                        tooltip={resolveLanguageKey("rating")}
                                        path="rating"
                                        type="number"
                                        value={rating}
                                    >
                                        {(formatted) => (
                                            <span className={cn("font-medium", inspectionRatingTextClass(rating))}>
                                                {formatted}/10
                                            </span>
                                        )}
                                    </EntityCardRow>
                                ) : null}
                                {!small && entity.nextInspectionDate ? (
                                    <EntityCardRow
                                        icon={IconCalendarClock}
                                        label={resolveLanguageKey("nextInspectionDate")}
                                        tooltip={resolveLanguageKey("nextInspectionDate")}
                                        path="nextInspectionDate"
                                        type="date"
                                        value={entity.nextInspectionDate}
                                    />
                                ) : null}
                            </EntityCard.Body>
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
                    onChecklistSuccess={onChecklistSuccess}
                    onLifecycleSuccess={onLifecycleSuccess}
                />
            )}
        </>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/inspections/center/cardView/inspectionCard.tsx"),
    withDebug(true, true, "inspections"),
)(InspectionCard);

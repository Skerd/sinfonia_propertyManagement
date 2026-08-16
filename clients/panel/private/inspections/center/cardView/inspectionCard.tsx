import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import InspectionSheetView from "@propertyManagementModule/clients/panel/private/inspections/center/sheetView/inspectionSheetView.tsx";
import CancelInspection from "@propertyManagementModule/clients/panel/private/inspections/center/actions/cancel.tsx";
import CancelInspectionDialog from "@propertyManagementModule/components/custom/inspections/cancelInspectionDialog.tsx";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import {Inspection} from "armonia/src/modules/propertyManagement/api/realEstate/private/unit/inspection/inspection.dto.ts";
import {IconCalendar, IconCalendarClock, IconHome, IconList, IconStar, IconTag} from "@tabler/icons-react";
import {buildInspectionEditPath} from "@propertyManagementModule/clients/panel/private/inspections";
import DisplayRow from "@coreModule/components/custom/displayValue/displayRow.tsx";
import EntityCard from "@coreModule/components/custom/systemCards/entityCard.tsx";
import type {WithAxiosLifecycleRef} from "@coreModule/helpers/hocs/withAxios.tsx";
import type {RefObject} from "react";

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

function findingsCount(inspection: Inspection): number {
    if (!inspection.findings) return 0;
    const keys = [
        "structuralIssues",
        "electricalIssues",
        "plumbingIssues",
        "hvacIssues",
        "safetyConcerns",
        "cosmeticIssues",
        "otherObservations",
    ] as const;
    return keys.reduce((sum, key) => {
        const items = inspection.findings?.[key];
        return sum + (Array.isArray(items) ? items.length : 0);
    }, 0);
}

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
                {({entity, setAction}) => (
                    <>
                        <EntityCard.Header titlePath="name" title={entity.name}>
                            {entity.status === "scheduled" ? <CancelInspection onAction={setAction} /> : null}
                        </EntityCard.Header>
                        <EntityCard.Body>
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
                                value={entity.status}
                            />
                            <DisplayRow
                                icon={IconHome}
                                label={entity.unit?.unitType?.name ?? resolveLanguageKey("unit")}
                                tooltip={entity.unit?.unitType?.name ?? resolveLanguageKey("unit")}
                                path="unit"
                                value={entity.unit?.name ?? entity.unit?.unitNumber}
                            />
                            <DisplayRow
                                icon={IconList}
                                label={resolveLanguageKey("findings")}
                                tooltip={resolveLanguageKey("findings")}
                                path="findings"
                                type="number"
                                value={findingsCount(entity)}
                            />
                            {!small && (
                                <>
                                    <DisplayRow
                                        icon={IconCalendarClock}
                                        label={resolveLanguageKey("inspectedBy")}
                                        tooltip={resolveLanguageKey("inspectedBy")}
                                        path="inspectedBy"
                                        type="user"
                                        value={entity.inspectedBy}
                                    />
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
                                    <DisplayRow
                                        icon={IconStar}
                                        label={resolveLanguageKey("rating")}
                                        tooltip={resolveLanguageKey("rating")}
                                        path="rating"
                                        type="number"
                                        value={entity.rating}
                                    />
                                </>
                            )}
                        </EntityCard.Body>
                    </>
                )}
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
    withDebug(true, true),
)(InspectionCard);

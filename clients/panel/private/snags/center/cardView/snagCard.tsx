import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import type {Snag} from "armonia/src/modules/propertyManagement/api/realEstate/private/snag/snag.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import {IconAlertTriangle, IconCalendar, IconDoor, IconLabel, IconMapPin} from "@tabler/icons-react";
import SnagSheetView from "@propertyManagementModule/clients/panel/private/snags/center/sheetView/snagSheetView.tsx";
import CopyTooltip from "@coreModule/components/custom/copyTooltip.tsx";
import AssignSnag, {ASSIGN_SNAG_ACTION} from "@propertyManagementModule/clients/panel/private/snags/center/actions/assign.tsx";
import StartWorkingSnag, {START_WORKING_SNAG_ACTION} from "@propertyManagementModule/clients/panel/private/snags/center/actions/startWorking.tsx";
import FinishWorkingSnag, {FINISH_WORKING_SNAG_ACTION} from "@propertyManagementModule/clients/panel/private/snags/center/actions/finishWorking.tsx";
import AssignSnagDialog from "@propertyManagementModule/components/custom/snags/assignSnagDialog.tsx";
import StartWorkingSnagDialog from "@propertyManagementModule/components/custom/snags/startWorkingSnagDialog.tsx";
import FinishWorkingSnagDialog from "@propertyManagementModule/components/custom/snags/finishWorkingSnagDialog.tsx";
import DisplayRow from "@coreModule/components/custom/displayValue/displayRow.tsx";
import EntityCard from "@coreModule/components/custom/systemCards/entityCard.tsx";
import type {WithAxiosLifecycleRef} from "@coreModule/helpers/hocs/withAxios.tsx";
import type {RefObject} from "react";

function snagEditPath(snag: Snag) {
    const params = new URLSearchParams();
    params.set("snagId", snag._id);
    if (snag.name) params.set("snagName", snag.name);
    if (snag.unit?._id) params.set("unitId", snag.unit._id);
    if (snag.unit?.name) params.set("unitName", snag.unit.name);
    return `/realEstate/snags/edit?${params.toString()}`;
}

type SnagCardProps = WithLanguageType & {
    snag: Snag;
    fetchId?: string;
    hideActions?: boolean;
    onDelete?: (deletedSnag?: Snag, response?: DeletedData) => void;
    onRestore?: () => void;
    onActionSuccess?: (updated?: Snag) => void;
    sheetOnly?: boolean;
    innerRef?: RefObject<WithAxiosLifecycleRef<Snag> | null>;
};

function SnagCard({
    snag,
    resolveLanguageKey,
    fetchId,
    hideActions = false,
    onDelete,
    onRestore,
    onActionSuccess,
    sheetOnly = false,
    innerRef,
}: SnagCardProps) {
    return (
        <EntityCard
            resource="snags"
            entity={snag}
            fetchId={fetchId}
            singleUrl="/api/realEstate/snag/single"
            onDelete={onDelete}
            onRestore={onRestore}
            hideActions={hideActions}
            sheetOnly={sheetOnly}
            editPath={snagEditPath}
            Sheet={SnagSheetView}
            sheetEntityProp="snag"
            deleteUrl="/api/realEstate/snag"
            restoreUrl="/api/realEstate/snag/restore"
            failedTitle=""
            failedDescription=""
            titlePath="title"
            innerRef={innerRef}
            sheetProps={() => ({fetchId})}
            extraDialogs={({action, setAction, entity, setEntity}) => {
                const handleSuccess = (updated?: Snag) => {
                    if (updated) setEntity({...entity, ...updated});
                    onActionSuccess?.(updated);
                    setAction("");
                };
                return (
                    <>
                        {action === ASSIGN_SNAG_ACTION && (
                            <AssignSnagDialog open onClose={() => setAction("")} snag={entity} onSuccess={handleSuccess} />
                        )}
                        {action === START_WORKING_SNAG_ACTION && (
                            <StartWorkingSnagDialog open onClose={() => setAction("")} snag={entity} onSuccess={handleSuccess} />
                        )}
                        {action === FINISH_WORKING_SNAG_ACTION && (
                            <FinishWorkingSnagDialog open onClose={() => setAction("")} snag={entity} onSuccess={handleSuccess} />
                        )}
                    </>
                );
            }}
        >
            {({entity, setAction}) => (
                <>
                    <EntityCard.Header
                        titlePath="title"
                        title={
                            <span className="flex min-w-0 items-center gap-1">
                                <span className="truncate">{entity.title}</span>
                                {entity.name ? <CopyTooltip text={entity.name} /> : null}
                            </span>
                        }
                    >
                        <AssignSnag snag={entity} onAction={setAction} />
                        <StartWorkingSnag snag={entity} onAction={setAction} />
                        <FinishWorkingSnag snag={entity} onAction={setAction} />
                    </EntityCard.Header>
                    <EntityCard.Body>
                        <DisplayRow
                            icon={IconLabel}
                            label={resolveLanguageKey("fields.name")}
                            tooltip={resolveLanguageKey("fields.name")}
                            path="name"
                            value={entity.name}
                        />
                        <DisplayRow
                            icon={IconLabel}
                            label={resolveLanguageKey("statusLabel")}
                            tooltip={resolveLanguageKey("statusLabel")}
                            path="status"
                            type="enum"
                            languageKeyCategory="fields.!enums.status"
                            value={entity.status}
                        />
                        <DisplayRow
                            icon={IconAlertTriangle}
                            label={resolveLanguageKey("severityLabel")}
                            tooltip={resolveLanguageKey("severityLabel")}
                            path="severity"
                            type="enum"
                            languageKeyCategory="fields.!enums.severity"
                            value={entity.severity}
                        />
                        <DisplayRow
                            icon={IconDoor}
                            label={resolveLanguageKey("fields.unit")}
                            tooltip={resolveLanguageKey("fields.unit")}
                            path="unit"
                            value={entity.unit?.name || entity.unit?.unitNumber}
                        />
                        <DisplayRow
                            icon={IconMapPin}
                            label={resolveLanguageKey("fields.location")}
                            tooltip={resolveLanguageKey("fields.location")}
                            path="location"
                            value={entity.location}
                        />
                        <DisplayRow
                            icon={IconCalendar}
                            label={resolveLanguageKey("fields.dueDate")}
                            tooltip={resolveLanguageKey("fields.dueDate")}
                            path="dueDate"
                            type="date"
                            value={entity.dueDate}
                        />
                        <DisplayRow
                            icon={IconAlertTriangle}
                            label={resolveLanguageKey("fields.assignedTo")}
                            tooltip={resolveLanguageKey("fields.assignedTo")}
                            path="assignedTo"
                            type="user"
                            value={entity.assignedTo}
                        />
                    </EntityCard.Body>
                </>
            )}
        </EntityCard>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/snags/center/cardView/snagCard.tsx"),
    withDebug(true, true),
)(SnagCard);

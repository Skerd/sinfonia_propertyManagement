import {compose} from "redux";
import {useSearchParams} from "react-router-dom";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useMemo} from "react";
import {buildPageTitle} from "@coreModule/helpers/general/pageTitle.ts";
import {buildUrlWithExistingParams} from "@coreModule/helpers/general/url.ts";
import EntityListPage, {type QuickFilterDef} from "@coreModule/components/entityPage/pages/entityListPage.tsx";
import {GRID_COLS_MAX_3, GRID_TRANSACTIONAL} from "@propertyManagementModule/components/custom/cards/entityCard.constants.ts";
import {COLUMN_TYPE} from "armonia/src/modules/core/database/filter/typeOperators";
import InspectionCard from "@propertyManagementModule/clients/panel/private/inspections/center/cardView/inspectionCard.tsx";
import InspectionSheetView from "@propertyManagementModule/clients/panel/private/inspections/center/sheetView/inspectionSheetView.tsx";
import InspectionRowMenuExtras from "@propertyManagementModule/clients/panel/private/inspections/center/actions/inspectionRowMenuExtras.tsx";
import CancelInspectionDialog from "@propertyManagementModule/components/custom/inspections/cancelInspectionDialog.tsx";
import UpdateInspectionChecklistDialog from "@propertyManagementModule/components/custom/inspections/updateInspectionChecklistDialog.tsx";
import {Inspection} from "armonia/src/modules/propertyManagement/api/realEstate/private/unit/inspection/inspection.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import {IconTextPlus} from "@tabler/icons-react";
import { cn } from "@coreModule/components/lib/utils";

export function buildInspectionEditPath(inspection: Inspection): string {
    return buildUrlWithExistingParams(window.location.href, "/realEstate/inspections/edit", {
        inspectionId: inspection._id,
        inspectionName: inspection.name,
        unitId: inspection.unit?._id ?? "",
        unitName: inspection.unit?.name ?? "",
    });
}

function AllInspections({resolveLanguageKey}: WithLanguageType) {
    const [searchParams] = useSearchParams();

    const projectName = searchParams.get("projectName") || undefined;
    const edificeName = searchParams.get("edificeName") || undefined;
    const floorName   = searchParams.get("floorName")   || undefined;
    const unitId   = searchParams.get("unitId")   || undefined;
    const unitName = searchParams.get("unitName") || undefined;

    const createPath = buildUrlWithExistingParams(window.location.href, "/realEstate/inspections/create");

    const extraFilters = useMemo(() => (unitId ? {unit: unitId} : undefined), [unitId]);

    const quickFilters = useMemo<QuickFilterDef[]>(() => [
        {
            field: "project",
            label: resolveLanguageKey("fields.project"),
            type: COLUMN_TYPE.OBJECT_ID,
            apiUrl: "/api/realEstate/project/select",
            asExtraParam: true,
        },
        {
            field: "edifice",
            label: resolveLanguageKey("fields.edifice"),
            type: COLUMN_TYPE.OBJECT_ID,
            apiUrl: "/api/realEstate/edifice/select",
            dependsOn: "project",
            asExtraParam: true,
        },
        {
            field: "floor",
            label: resolveLanguageKey("fields.floor"),
            type: COLUMN_TYPE.OBJECT_ID,
            apiUrl: "/api/realEstate/floor/select",
            dependsOn: ["edifice", "project"],
            asExtraParam: true,
        },
        {
            field: "unit",
            label: resolveLanguageKey("fields.unit"),
            type: COLUMN_TYPE.OBJECT_ID,
            apiUrl: "/api/realEstate/unit/select",
            dependsOn: ["floor", "edifice", "project"],
        },
        {
            field: "status",
            label: resolveLanguageKey("fields.status"),
            type: COLUMN_TYPE.ENUM,
            enumValues: [
                {value: "scheduled",   label: resolveLanguageKey("fields.!enums.status.scheduled")},
                {value: "in_progress", label: resolveLanguageKey("fields.!enums.status.in_progress")},
                {value: "completed",   label: resolveLanguageKey("fields.!enums.status.completed")},
                {value: "cancelled",   label: resolveLanguageKey("fields.!enums.status.cancelled")},
                {value: "rescheduled", label: resolveLanguageKey("fields.!enums.status.rescheduled")},
            ],
        },
        {
            field: "type",
            label: resolveLanguageKey("fields.type"),
            type: COLUMN_TYPE.ENUM,
            enumValues: [
                {value: "initial",    label: resolveLanguageKey("fields.!enums.type.initial")},
                {value: "follow_up",  label: resolveLanguageKey("fields.!enums.type.follow_up")},
                {value: "final",      label: resolveLanguageKey("fields.!enums.type.final")},
                {value: "routine",    label: resolveLanguageKey("fields.!enums.type.routine")},
                {value: "complaint",  label: resolveLanguageKey("fields.!enums.type.complaint")},
                {value: "pre_sale",   label: resolveLanguageKey("fields.!enums.type.pre_sale")},
                {value: "post_sale",  label: resolveLanguageKey("fields.!enums.type.post_sale")},
            ],
        },
        {
            field: "followUpRequired",
            label: resolveLanguageKey("fields.followUpRequired"),
            type: COLUMN_TYPE.BOOLEAN,
        },
    ], [resolveLanguageKey]);

    const headerTitle = useMemo(
        () => buildPageTitle(resolveLanguageKey("title"), [projectName, edificeName, floorName, unitName]),
        [resolveLanguageKey, unitName],
    );

    const headerDescription = useMemo(
        () => resolveLanguageKey(unitId ? "descriptionWithContext" : "description"),
        [resolveLanguageKey, unitId],
    );

    return (
        <EntityListPage<Inspection>
            apiUrl="/api/realEstate/unit/inspection"
            collectionName="inspections"
            accessModel="inspections"
            tableConfigKey="inspections"
            createPath={createPath}
            createIcon={<IconTextPlus />}
            createLanguageKey="createInspection"
            headerTitle={headerTitle}
            headerDescription={headerDescription}
            extraFilters={extraFilters}
            quickFilters={quickFilters}
            // syncExtraFiltersKeys={["unitId"]}
            buildEditPath={buildInspectionEditPath}
            resolveLanguageKey={resolveLanguageKey}
            cardViewClassName={cn(GRID_TRANSACTIONAL, GRID_COLS_MAX_3, "mt-0.5")}
            rowActionMenu={{allowMenuForCustomChildren: true}}
            renderCard={(inspection, onDelete, onRestore, listRef) => (
                <InspectionCard
                    inspection={inspection}
                    unitId={unitId ?? inspection.unit?._id ?? ""}
                    unitName={unitName ?? ""}
                    hideActions={false}
                    onDelete={(row: Inspection | undefined, response?: DeletedData) =>
                        onDelete(row ?? inspection, response)
                    }
                    onRestore={() => onRestore(inspection)}
                    onCancelSuccess={(updated?: Inspection) =>
                        updated && listRef.current?.updateRow?.(updated._id, updated)
                    }
                    onChecklistSuccess={(updated?: Inspection) =>
                        updated && listRef.current?.updateRow?.(updated._id, updated)
                    }
                />
            )}
            renderActionMenuChildren={(inspection, bindRowAction) => (
                <InspectionRowMenuExtras inspection={inspection} onAction={bindRowAction} />
            )}
            renderFloatingModals={({action, entity, resetAction, listRef}) => {
                if (action === "cancelInspection") {
                    return (
                        <CancelInspectionDialog
                            open={true}
                            onClose={resetAction}
                            inspection={entity}
                            onSuccess={(updated?: Inspection) => {
                                if (updated) listRef.current?.updateRow?.(updated._id, updated);
                                resetAction();
                            }}
                        />
                    );
                }
                if (action === "updateInspectionChecklist") {
                    return (
                        <UpdateInspectionChecklistDialog
                            open={true}
                            onClose={resetAction}
                            inspection={entity}
                            onSuccess={(updated?: Inspection) => {
                                if (updated) listRef.current?.updateRow?.(updated._id, updated);
                                resetAction();
                            }}
                        />
                    );
                }
                return null;
            }}
            renderSheet={({entity, open, onOpenChange, onDelete, onRestore, listRef}) => (
                <InspectionSheetView
                    open={open}
                    onOpenChange={(o: boolean) => { if (!o) onOpenChange(); }}
                    inspection={entity}
                    unitId={unitId ?? entity.unit?._id ?? ""}
                    unitName={unitName ?? ""}
                    onDelete={(response?: DeletedData) => onDelete(response)}
                    onRestore={() => onRestore()}
                    onCancelSuccess={(updated?: Inspection) =>
                        updated && listRef.current?.updateRow?.(updated._id, updated)
                    }
                    onChecklistSuccess={(updated?: Inspection) =>
                        updated && listRef.current?.updateRow?.(updated._id, updated)
                    }
                />
            )}
        />
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/inspections/index.tsx"),
    withDebug(true, true, "inspections"),
)(AllInspections);

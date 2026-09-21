import {compose} from "redux";
import {useSearchParams} from "react-router-dom";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useMemo} from "react";
import {buildPageTitle} from "@coreModule/helpers/general/pageTitle.ts";
import {buildUrlWithExistingParams} from "@coreModule/helpers/general/url.ts";
import {useAccess} from "@coreModule/helpers/hooks/useAccess.ts";
import EntityListPage, {type QuickFilterDef} from "@coreModule/components/entityPage/pages/entityListPage.tsx";
import {cn} from "@coreModule/components/lib/utils.ts";
import {GRID_COLS_MAX_3, GRID_TRANSACTIONAL} from "@propertyManagementModule/components/custom/cards/entityCard.constants.ts";
import {COLUMN_TYPE} from "armonia/src/modules/core/database/filter/typeOperators";
import ModificationRequestCard from "@propertyManagementModule/clients/panel/private/modificationRequests/center/cardView/modificationRequestCard.tsx";
import ModificationRequestSheetView from "@propertyManagementModule/clients/panel/private/modificationRequests/center/sheetView/modificationRequestSheetView.tsx";
import ModificationRequestRowMenuExtras, {
    modificationRequestShouldHideEdit,
} from "@propertyManagementModule/clients/panel/private/modificationRequests/center/actions/modificationRequestRowMenuExtras.tsx";
import {ModificationRequest} from "armonia/src/modules/propertyManagement/api/realEstate/private/unit/modificationRequest/modificationRequest.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import {IconAdjustmentsPlus} from "@tabler/icons-react";
import ApproveModificationRequestDialog from "@propertyManagementModule/components/custom/modificationRequests/approveModificationRequestDialog.tsx";
import SubmitRevisionModificationRequestDialog from "@propertyManagementModule/components/custom/modificationRequests/submitRevisionModificationRequestDialog.tsx";
import FinanceModificationRequestDialog from "@propertyManagementModule/components/custom/modificationRequests/financeModificationRequestDialog.tsx";
import DeliverModificationRequestDialog from "@propertyManagementModule/components/custom/modificationRequests/deliverModificationRequestDialog.tsx";
import CancelModificationRequestDialog from "@propertyManagementModule/components/custom/modificationRequests/cancelModificationRequestDialog.tsx";
import ClientCostApproveModificationRequestDialog from "@propertyManagementModule/components/custom/modificationRequests/clientCostApproveModificationRequestDialog.tsx";

export function buildModificationRequestEditPath(request: ModificationRequest): string {
    return buildUrlWithExistingParams(window.location.href, "/realEstate/modificationRequests/edit", {
        modificationRequestId: request._id,
        modificationRequestName: request.name ?? "",
        unitId: request.unit?._id ?? "",
        unitName: request.unit?.name ?? request.unit?.unitNumber ?? "",
    });
}

function AllModificationRequests({resolveLanguageKey}: WithLanguageType) {
    const [searchParams] = useSearchParams();
    const unitId   = searchParams.get("unitId")   || undefined;
    const unitName = searchParams.get("unitName") || undefined;
    const {write} = useAccess("modificationRequests");

    const createPath = buildUrlWithExistingParams(window.location.href, "/realEstate/modificationRequests/create");

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
                {value: "pending_architect",          label: resolveLanguageKey("fields.!enums.status.pending_architect")},
                {value: "pending_engineer",           label: resolveLanguageKey("fields.!enums.status.pending_engineer")},
                {value: "pending_ceo",                label: resolveLanguageKey("fields.!enums.status.pending_ceo")},
                {value: "pending_architect_revision", label: resolveLanguageKey("fields.!enums.status.pending_architect_revision")},
                {value: "pending_engineer_revision",  label: resolveLanguageKey("fields.!enums.status.pending_engineer_revision")},
                {value: "pending_finance",            label: resolveLanguageKey("fields.!enums.status.pending_finance")},
                {value: "pending_client_approval",    label: resolveLanguageKey("fields.!enums.status.pending_client_approval")},
                {value: "finance_completed",          label: resolveLanguageKey("fields.!enums.status.finance_completed")},
                {value: "pending_delivery",           label: resolveLanguageKey("fields.!enums.status.pending_delivery")},
                {value: "completed",                  label: resolveLanguageKey("fields.!enums.status.completed")},
                {value: "cancelled",                  label: resolveLanguageKey("fields.!enums.status.cancelled")},
            ],
        },
        {
            field: "constructionType",
            label: resolveLanguageKey("fields.constructionType"),
            type: COLUMN_TYPE.ENUM,
            enumValues: [
                {value: "materials",      label: resolveLanguageKey("fields.!enums.constructionType.materials")},
                {value: "room_division",  label: resolveLanguageKey("fields.!enums.constructionType.room_division")},
                {value: "flooring",       label: resolveLanguageKey("fields.!enums.constructionType.flooring")},
                {value: "utilities",      label: resolveLanguageKey("fields.!enums.constructionType.utilities")},
                {value: "structural",     label: resolveLanguageKey("fields.!enums.constructionType.structural")},
                {value: "electrical",     label: resolveLanguageKey("fields.!enums.constructionType.electrical")},
                {value: "plumbing",       label: resolveLanguageKey("fields.!enums.constructionType.plumbing")},
                {value: "hvac",           label: resolveLanguageKey("fields.!enums.constructionType.hvac")},
                {value: "cosmetic",       label: resolveLanguageKey("fields.!enums.constructionType.cosmetic")},
                {value: "other",          label: resolveLanguageKey("fields.!enums.constructionType.other")},
            ],
        },
    ], [resolveLanguageKey]);

    const headerTitle = useMemo(
        () => buildPageTitle(resolveLanguageKey("title"), [unitName]),
        [resolveLanguageKey, unitName],
    );

    const headerDescription = useMemo(
        () => resolveLanguageKey(unitId ? "descriptionWithContext" : "description"),
        [resolveLanguageKey, unitId],
    );

    return (
        <EntityListPage<ModificationRequest>
            apiUrl="/api/realEstate/unit/modificationRequest"
            collectionName="modificationrequests"
            accessModel="modificationRequests"
            tableConfigKey="modificationrequests"
            createPath={createPath}
            createIcon={<IconAdjustmentsPlus className="h-4 w-4" />}
            createLanguageKey="createModificationRequest"
            headerTitle={headerTitle}
            headerDescription={headerDescription}
            extraFilters={extraFilters}
            quickFilters={quickFilters}
            buildEditPath={buildModificationRequestEditPath}
            resolveLanguageKey={resolveLanguageKey}
            cardViewClassName={cn(GRID_TRANSACTIONAL, GRID_COLS_MAX_3)}
            rowActionMenu={{
                allowMenuForCustomChildren: true,
                hideEdit: (request) => modificationRequestShouldHideEdit(request, write),
            }}
            renderCard={(request, onDelete, onRestore, listRef) => (
                <ModificationRequestCard
                    request={request}
                    unitId={unitId ?? request.unit?._id ?? ""}
                    unitName={unitName}
                    onDelete={(row?: ModificationRequest, response?: DeletedData) => onDelete(row ?? request, response)}
                    onRestore={() => onRestore(request)}
                    onModified={(updated: ModificationRequest | undefined) => updated && listRef.current?.updateRow?.(updated._id, updated)}
                />
            )}
            renderActionMenuChildren={(request, bindRowAction, {replaceRow}) => (
                <ModificationRequestRowMenuExtras
                    request={request}
                    onAction={bindRowAction}
                    onModified={(updated) => updated && replaceRow(updated)}
                />
            )}
            renderFloatingModals={({action, entity, resetAction, listRef}) => {
                const onSuccess = (updated?: ModificationRequest) => {
                    if (updated?._id) listRef.current?.updateRow?.(updated._id, updated);
                    resetAction();
                };
                if (action === "approve")
                    return <ApproveModificationRequestDialog open onClose={resetAction} request={entity} onSuccess={onSuccess} />;
                if (action === "submitRevision")
                    return <SubmitRevisionModificationRequestDialog open onClose={resetAction} request={entity} onSuccess={onSuccess} />;
                if (action === "finance")
                    return <FinanceModificationRequestDialog open onClose={resetAction} request={entity} onSuccess={onSuccess} />;
                if (action === "deliver")
                    return <DeliverModificationRequestDialog open onClose={resetAction} request={entity} onSuccess={onSuccess} />;
                if (action === "cancel")
                    return <CancelModificationRequestDialog open onClose={resetAction} request={entity} onSuccess={onSuccess} />;
                if (action === "clientCostApprove")
                    return <ClientCostApproveModificationRequestDialog open onClose={resetAction} request={entity} onSuccess={onSuccess} />;
                return null;
            }}
            renderSheet={({entity, open, onOpenChange, onDelete, onRestore, listRef}) => (
                <ModificationRequestSheetView
                    open={open}
                    onOpenChange={(o: boolean) => { if (!o) onOpenChange(); }}
                    request={entity}
                    unitId={unitId ?? entity.unit?._id ?? ""}
                    unitName={unitName ?? entity.unit?.name ?? entity.unit?.unitNumber ?? ""}
                    onDelete={(response?: DeletedData) => onDelete(response)}
                    onRestore={() => onRestore()}
                    onModified={(updated?: ModificationRequest) =>
                        updated && listRef.current?.updateRow?.(updated._id, updated)
                    }
                />
            )}
        />
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/modificationRequests/index.tsx"),
    withDebug(true, true, "modificationRequests"),
)(AllModificationRequests);

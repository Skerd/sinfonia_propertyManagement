import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import EntityListPage from "@coreModule/components/entityPage/EntityListPage.tsx";
import {cn} from "@coreModule/components/lib/utils.ts";
import {GRID_COLS_MAX_4, GRID_TRANSACTIONAL} from "@propertyManagementModule/components/custom/cards/entityCard.constants.ts";
import {IconClipboardCheck} from "@tabler/icons-react";
import type {Snag} from "armonia/src/modules/propertyManagement/api/realEstate/private/snag/snag.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import SnagCard from "@propertyManagementModule/clients/panel/private/snags/center/cardView/snagCard.tsx";
import AssignSnag, {ASSIGN_SNAG_ACTION} from "@propertyManagementModule/clients/panel/private/snags/center/actions/assign.tsx";
import StartWorkingSnag, {START_WORKING_SNAG_ACTION} from "@propertyManagementModule/clients/panel/private/snags/center/actions/startWorking.tsx";
import FinishWorkingSnag, {FINISH_WORKING_SNAG_ACTION} from "@propertyManagementModule/clients/panel/private/snags/center/actions/finishWorking.tsx";
import AssignSnagDialog from "@propertyManagementModule/components/custom/snags/assignSnagDialog.tsx";
import StartWorkingSnagDialog from "@propertyManagementModule/components/custom/snags/startWorkingSnagDialog.tsx";
import FinishWorkingSnagDialog from "@propertyManagementModule/components/custom/snags/finishWorkingSnagDialog.tsx";

interface AllSnagsProps extends WithLanguageType {
    unitId?: string;
    unitName?: string;
}

function buildSnagEditPath(snag: Snag) {
    const params = new URLSearchParams();
    params.set("snagId", snag._id);
    if (snag.name) params.set("snagName", snag.name);
    if (snag.unit?._id) params.set("unitId", snag.unit._id);
    if (snag.unit?.name) params.set("unitName", snag.unit.name);
    return `/realEstate/snags/edit?${params.toString()}`;
}

function AllSnags({resolveLanguageKey, unitId, unitName}: AllSnagsProps) {
    const extraFilters = unitId ? {unitId} : undefined;

    return (
        <EntityListPage<Snag>
            apiUrl="/api/realEstate/snag"
            collectionName="snags"
            accessModel="snags"
            tableConfigKey="snags"
            createPath={unitId
                ? `/realEstate/snags/create?unitId=${unitId}${unitName ? `&unitName=${encodeURIComponent(unitName)}` : ""}`
                : "/realEstate/snags/create"
            }
            createIcon={<IconClipboardCheck className="h-4 w-4" />}
            createLanguageKey="createSnag"
            buildEditPath={buildSnagEditPath}
            resolveLanguageKey={resolveLanguageKey}
            sheetLanguagePath="src/modules/propertyManagement/clients/panel/private/snags/center/sheetView/snagSheetView.tsx"
            cardViewClassName={cn(GRID_TRANSACTIONAL, GRID_COLS_MAX_4)}
            extraFilters={extraFilters}
            rowActionMenu={{allowMenuForCustomChildren: true}}
            renderActionMenuChildren={(snag, bindRowAction) => (
                <>
                    <AssignSnag snag={snag} onAction={bindRowAction} />
                    <StartWorkingSnag snag={snag} onAction={bindRowAction} />
                    <FinishWorkingSnag snag={snag} onAction={bindRowAction} />
                </>
            )}
            renderFloatingModals={({action, entity, resetAction, listRef}) => {
                const onSuccess = (updated?: Snag) => {
                    if (updated?._id) listRef.current?.updateRow?.(updated._id, updated);
                    resetAction();
                };
                if (action === ASSIGN_SNAG_ACTION)
                    return <AssignSnagDialog open onClose={resetAction} snag={entity} onSuccess={onSuccess} />;
                if (action === START_WORKING_SNAG_ACTION)
                    return <StartWorkingSnagDialog open onClose={resetAction} snag={entity} onSuccess={onSuccess} />;
                if (action === FINISH_WORKING_SNAG_ACTION)
                    return <FinishWorkingSnagDialog open onClose={resetAction} snag={entity} onSuccess={onSuccess} />;
                return null;
            }}
            renderCard={(snag, onDelete, onRestore, listRef) => (
                <SnagCard
                    snag={snag}
                    onDelete={(row: Snag | undefined, response?: DeletedData) => onDelete(row, response)}
                    onRestore={() => onRestore(snag)}
                    onActionSuccess={(updated?: Snag) =>
                        updated && listRef.current?.updateRow?.(updated._id, updated)
                    }
                />
            )}
        />
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/snags/index.tsx"),
    withDebug(true, true),
)(AllSnags);

import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import EntityListPage from "@coreModule/components/entityPage/EntityListPage.tsx";
import {GRID_TRANSACTIONAL} from "@propertyManagementModule/components/custom/cards/entityCard.constants.ts";
import {IconPlus} from "@tabler/icons-react";
import type {CommissioningRecord} from "armonia/src/modules/propertyManagement/api/realEstate/private/commissioningRecord/commissioningRecord.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import CommissioningRecordCard from "@propertyManagementModule/clients/panel/private/commissioningRecords/center/cardView/commissioningRecordCard.tsx";

interface Props extends WithLanguageType {
    projectId?: string;
    projectName?: string;
}

function buildEditPath(row: CommissioningRecord) {
    const params = new URLSearchParams();
    params.set("commissioningRecordId", row._id);
    if (row.name) params.set("commissioningRecordName", row.name);
    return `/realEstate/commissioningRecords/edit?${params.toString()}`;
}

function AllCommissioningRecords({resolveLanguageKey, projectId}: Props) {
    return (
        <EntityListPage<CommissioningRecord>
            apiUrl="/api/realEstate/commissioningRecord"
            collectionName="commissioningrecords"
            accessModel="commissioningrecords"
            tableConfigKey="commissioningrecords"
            createPath="/realEstate/commissioningRecords/create"
            createIcon={<IconPlus className="h-4 w-4" />}
            createLanguageKey="createCommissioningRecord"
            buildEditPath={buildEditPath}
            resolveLanguageKey={resolveLanguageKey}
            sheetLanguagePath="src/modules/propertyManagement/clients/panel/private/commissioningRecords/center/sheetView/commissioningRecordSheetView.tsx"
            cardViewClassName={GRID_TRANSACTIONAL}
            extraFilters={projectId ? {projectId} : undefined}
            renderCard={(row, onDelete, onRestore) => (
                <CommissioningRecordCard
                    entity={row}
                    onDelete={(r: CommissioningRecord | undefined, response?: DeletedData) => onDelete(r, response)}
                    onRestore={() => onRestore(row)}
                />
            )}
        />
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/commissioningRecords/index.tsx"),
    withDebug(true, true),
)(AllCommissioningRecords);

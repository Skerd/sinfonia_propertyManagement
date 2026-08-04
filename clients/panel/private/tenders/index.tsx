import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import EntityListPage from "@coreModule/components/entityPage/EntityListPage.tsx";
import {GRID_TRANSACTIONAL} from "@propertyManagementModule/components/custom/cards/entityCard.constants.ts";
import {IconPlus} from "@tabler/icons-react";
import type {Tender} from "armonia/src/modules/propertyManagement/api/realEstate/private/tender/tender.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import TenderCard from "@propertyManagementModule/clients/panel/private/tenders/center/cardView/tenderCard.tsx";

interface Props extends WithLanguageType {
    projectId?: string;
}

function buildEditPath(row: Tender) {
    const params = new URLSearchParams();
    params.set("tenderId", row._id);
    if (row.name) params.set("tenderName", row.name);
    return `/realEstate/tenders/edit?${params.toString()}`;
}

function AllTenders({resolveLanguageKey, projectId}: Props) {
    return (
        <EntityListPage<Tender>
            apiUrl="/api/realEstate/tender"
            collectionName="tenders"
            accessModel="tenders"
            tableConfigKey="tenders"
            createPath="/realEstate/tenders/create"
            createIcon={<IconPlus className="h-4 w-4" />}
            createLanguageKey="createTender"
            buildEditPath={buildEditPath}
            resolveLanguageKey={resolveLanguageKey}
            sheetLanguagePath="src/modules/propertyManagement/clients/panel/private/tenders/center/sheetView/tenderSheetView.tsx"
            cardViewClassName={GRID_TRANSACTIONAL}
            extraFilters={projectId ? {projectId} : undefined}
            renderCard={(row, onDelete, onRestore) => (
                <TenderCard
                    entity={row}
                    onDelete={(r: Tender | undefined, response?: DeletedData) => onDelete(r, response)}
                    onRestore={() => onRestore(row)}
                />
            )}
        />
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/tenders/index.tsx"),
    withDebug(true, true),
)(AllTenders);

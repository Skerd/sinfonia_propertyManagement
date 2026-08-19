import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import EntityListPage from "@coreModule/components/entityPage/EntityListPage.tsx";
import {GRID_TRANSACTIONAL} from "@propertyManagementModule/components/custom/cards/entityCard.constants.ts";
import {IconPlus} from "@tabler/icons-react";
import type {BoqItem} from "armonia/src/modules/propertyManagement/api/realEstate/private/boqItem/boqItem.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import BoqItemCard from "@propertyManagementModule/clients/panel/private/boqItems/center/cardView/boqItemCard.tsx";

interface Props extends WithLanguageType {
    projectId?: string;
    projectName?: string;
}

function buildEditPath(row: BoqItem) {
    const params = new URLSearchParams();
    params.set("boqItemId", row._id);
    if (row.name) params.set("boqItemName", row.name);
    return `/realEstate/boqItems/edit?${params.toString()}`;
}

function AllBoqItems({resolveLanguageKey, projectId}: Props) {
    return (
        <EntityListPage<BoqItem>
            apiUrl="/api/realEstate/boqItem"
            collectionName="boqitems"
            accessModel="boqitems"
            tableConfigKey="boqitems"
            createPath="/realEstate/boqItems/create"
            createIcon={<IconPlus className="h-4 w-4" />}
            createLanguageKey="createBoqItem"
            buildEditPath={buildEditPath}
            resolveLanguageKey={resolveLanguageKey}
            sheetLanguagePath="src/modules/propertyManagement/clients/panel/private/boqItems/center/sheetView/boqItemSheetView.tsx"
            cardViewClassName={GRID_TRANSACTIONAL}
            extraFilters={projectId ? {projectId} : undefined}
            renderCard={(row, onDelete, onRestore) => (
                <BoqItemCard
                    entity={row}
                    onDelete={(r: BoqItem | undefined, response?: DeletedData) => onDelete(r, response)}
                    onRestore={() => onRestore(row)}
                />
            )}
        />
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/boqItems/index.tsx"),
    withDebug(true, true, "boqitems"),
)(AllBoqItems);

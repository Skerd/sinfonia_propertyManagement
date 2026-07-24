import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import EntityListPage from "@coreModule/components/entityPage/EntityListPage.tsx";
import {GRID_TRANSACTIONAL_WIDE} from "@propertyManagementModule/components/custom/cards/entityCard.constants.ts";
import {IconPlus} from "@tabler/icons-react";
import type {Rfi} from "armonia/src/modules/propertyManagement/api/realEstate/private/rfi/rfi.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import RfiCard from "@propertyManagementModule/clients/panel/private/rfis/center/cardView/rfiCard.tsx";

interface Props extends WithLanguageType {
    projectId?: string;
    projectName?: string;
}

function buildEditPath(row: Rfi) {
    const params = new URLSearchParams();
    params.set("rfiId", row._id);
    if (row.name) params.set("rfiName", row.name);
    return `/realEstate/rfis/edit?${params.toString()}`;
}

function AllRfis({resolveLanguageKey, projectId}: Props) {
    return (
        <EntityListPage<Rfi>
            apiUrl="/api/realEstate/rfi"
            collectionName="rfis"
            accessModel="rfis"
            tableConfigKey="rfis"
            createPath="/realEstate/rfis/create"
            createIcon={<IconPlus className="h-4 w-4" />}
            createLanguageKey="createRfi"
            buildEditPath={buildEditPath}
            resolveLanguageKey={resolveLanguageKey}
            sheetLanguagePath="src/modules/propertyManagement/clients/panel/private/rfis/center/sheetView/rfiSheetView.tsx"
            cardViewClassName={GRID_TRANSACTIONAL_WIDE}
            extraFilters={projectId ? {projectId} : undefined}
            renderCard={(row, onDelete, onRestore) => (
                <RfiCard
                    entity={row}
                    onDelete={(r: Rfi | undefined, response?: DeletedData) => onDelete(r, response)}
                    onRestore={() => onRestore(row)}
                />
            )}
        />
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/rfis/index.tsx"),
    withDebug(true, true),
)(AllRfis);

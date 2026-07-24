import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import EntityListPage from "@coreModule/components/entityPage/EntityListPage.tsx";
import {GRID_TRANSACTIONAL_WIDE} from "@propertyManagementModule/components/custom/cards/entityCard.constants.ts";
import {IconPlus} from "@tabler/icons-react";
import type {SiteDiary} from "armonia/src/modules/propertyManagement/api/realEstate/private/siteDiary/siteDiary.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import SiteDiaryCard from "@propertyManagementModule/clients/panel/private/siteDiaries/center/cardView/siteDiaryCard.tsx";

interface Props extends WithLanguageType {
    projectId?: string;
    projectName?: string;
}

function buildEditPath(row: SiteDiary) {
    const params = new URLSearchParams();
    params.set("siteDiaryId", row._id);
    if (row.name) params.set("siteDiaryName", row.name);
    return `/realEstate/siteDiaries/edit?${params.toString()}`;
}

function AllSiteDiarys({resolveLanguageKey, projectId}: Props) {
    return (
        <EntityListPage<SiteDiary>
            apiUrl="/api/realEstate/siteDiary"
            collectionName="sitediaries"
            accessModel="sitediaries"
            tableConfigKey="sitediaries"
            createPath="/realEstate/siteDiaries/create"
            createIcon={<IconPlus className="h-4 w-4" />}
            createLanguageKey="createSiteDiary"
            buildEditPath={buildEditPath}
            resolveLanguageKey={resolveLanguageKey}
            sheetLanguagePath="src/modules/propertyManagement/clients/panel/private/siteDiaries/center/sheetView/siteDiarySheetView.tsx"
            cardViewClassName={GRID_TRANSACTIONAL_WIDE}
            extraFilters={projectId ? {projectId} : undefined}
            renderCard={(row, onDelete, onRestore) => (
                <SiteDiaryCard
                    entity={row}
                    onDelete={(r: SiteDiary | undefined, response?: DeletedData) => onDelete(r, response)}
                    onRestore={() => onRestore(row)}
                />
            )}
        />
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/siteDiaries/index.tsx"),
    withDebug(true, true),
)(AllSiteDiarys);

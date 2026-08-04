import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import EntityListPage from "@coreModule/components/entityPage/EntityListPage.tsx";
import {GRID_TRANSACTIONAL} from "@propertyManagementModule/components/custom/cards/entityCard.constants.ts";
import {IconPlus} from "@tabler/icons-react";
import type {Submittal} from "armonia/src/modules/propertyManagement/api/realEstate/private/submittal/submittal.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import SubmittalCard from "@propertyManagementModule/clients/panel/private/submittals/center/cardView/submittalCard.tsx";

interface Props extends WithLanguageType {
    projectId?: string;
    projectName?: string;
}

function buildEditPath(row: Submittal) {
    const params = new URLSearchParams();
    params.set("submittalId", row._id);
    if (row.name) params.set("submittalName", row.name);
    return `/realEstate/submittals/edit?${params.toString()}`;
}

function AllSubmittals({resolveLanguageKey, projectId}: Props) {
    return (
        <EntityListPage<Submittal>
            apiUrl="/api/realEstate/submittal"
            collectionName="submittals"
            accessModel="submittals"
            tableConfigKey="submittals"
            createPath="/realEstate/submittals/create"
            createIcon={<IconPlus className="h-4 w-4" />}
            createLanguageKey="createSubmittal"
            buildEditPath={buildEditPath}
            resolveLanguageKey={resolveLanguageKey}
            sheetLanguagePath="src/modules/propertyManagement/clients/panel/private/submittals/center/sheetView/submittalSheetView.tsx"
            cardViewClassName={GRID_TRANSACTIONAL}
            extraFilters={projectId ? {projectId} : undefined}
            renderCard={(row, onDelete, onRestore) => (
                <SubmittalCard
                    entity={row}
                    onDelete={(r: Submittal | undefined, response?: DeletedData) => onDelete(r, response)}
                    onRestore={() => onRestore(row)}
                />
            )}
        />
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/submittals/index.tsx"),
    withDebug(true, true),
)(AllSubmittals);

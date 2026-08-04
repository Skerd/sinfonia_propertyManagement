import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import EntityListPage from "@coreModule/components/entityPage/EntityListPage.tsx";
import {GRID_TRANSACTIONAL} from "@propertyManagementModule/components/custom/cards/entityCard.constants.ts";
import {IconPlus} from "@tabler/icons-react";
import type {FeasibilityStudy} from "armonia/src/modules/propertyManagement/api/realEstate/private/feasibilityStudy/feasibilityStudy.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import FeasibilityStudyCard from "@propertyManagementModule/clients/panel/private/feasibilityStudies/center/cardView/feasibilityStudyCard.tsx";

interface Props extends WithLanguageType {
    projectId?: string;
    projectName?: string;
}

function buildEditPath(row: FeasibilityStudy) {
    const params = new URLSearchParams();
    params.set("feasibilityStudyId", row._id);
    if (row.name) params.set("feasibilityStudyName", row.name);
    return `/realEstate/feasibilityStudies/edit?${params.toString()}`;
}

function AllFeasibilityStudys({resolveLanguageKey, projectId}: Props) {
    return (
        <EntityListPage<FeasibilityStudy>
            apiUrl="/api/realEstate/feasibilityStudy"
            collectionName="feasibilitystudies"
            accessModel="feasibilitystudies"
            tableConfigKey="feasibilitystudies"
            createPath="/realEstate/feasibilityStudies/create"
            createIcon={<IconPlus className="h-4 w-4" />}
            createLanguageKey="createFeasibilityStudy"
            buildEditPath={buildEditPath}
            resolveLanguageKey={resolveLanguageKey}
            sheetLanguagePath="src/modules/propertyManagement/clients/panel/private/feasibilityStudies/center/sheetView/feasibilityStudySheetView.tsx"
            cardViewClassName={GRID_TRANSACTIONAL}
            extraFilters={projectId ? {projectId} : undefined}
            renderCard={(row, onDelete, onRestore) => (
                <FeasibilityStudyCard
                    entity={row}
                    onDelete={(r: FeasibilityStudy | undefined, response?: DeletedData) => onDelete(r, response)}
                    onRestore={() => onRestore(row)}
                />
            )}
        />
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/feasibilityStudies/index.tsx"),
    withDebug(true, true),
)(AllFeasibilityStudys);

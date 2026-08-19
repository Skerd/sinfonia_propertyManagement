import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import EntityListPage from "@coreModule/components/entityPage/EntityListPage.tsx";
import {GRID_TRANSACTIONAL} from "@propertyManagementModule/components/custom/cards/entityCard.constants.ts";
import {IconPlus} from "@tabler/icons-react";
import type {SafetyIncident} from "armonia/src/modules/propertyManagement/api/realEstate/private/safetyIncident/safetyIncident.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import SafetyIncidentCard from "@propertyManagementModule/clients/panel/private/safetyIncidents/center/cardView/safetyIncidentCard.tsx";

interface Props extends WithLanguageType {
    projectId?: string;
    projectName?: string;
}

function buildEditPath(row: SafetyIncident) {
    const params = new URLSearchParams();
    params.set("safetyIncidentId", row._id);
    if (row.name) params.set("safetyIncidentName", row.name);
    return `/realEstate/safetyIncidents/edit?${params.toString()}`;
}

function AllSafetyIncidents({resolveLanguageKey, projectId}: Props) {
    return (
        <EntityListPage<SafetyIncident>
            apiUrl="/api/realEstate/safetyIncident"
            collectionName="safetyincidents"
            accessModel="safetyincidents"
            tableConfigKey="safetyincidents"
            createPath="/realEstate/safetyIncidents/create"
            createIcon={<IconPlus className="h-4 w-4" />}
            createLanguageKey="createSafetyIncident"
            buildEditPath={buildEditPath}
            resolveLanguageKey={resolveLanguageKey}
            sheetLanguagePath="src/modules/propertyManagement/clients/panel/private/safetyIncidents/center/sheetView/safetyIncidentSheetView.tsx"
            cardViewClassName={GRID_TRANSACTIONAL}
            extraFilters={projectId ? {projectId} : undefined}
            renderCard={(row, onDelete, onRestore) => (
                <SafetyIncidentCard
                    entity={row}
                    onDelete={(r: SafetyIncident | undefined, response?: DeletedData) => onDelete(r, response)}
                    onRestore={() => onRestore(row)}
                />
            )}
        />
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/safetyIncidents/index.tsx"),
    withDebug(true, true, "safetyincidents"),
)(AllSafetyIncidents);

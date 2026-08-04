import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import EntityListPage from "@coreModule/components/entityPage/EntityListPage.tsx";
import {GRID_TRANSACTIONAL} from "@propertyManagementModule/components/custom/cards/entityCard.constants.ts";
import {IconPlus} from "@tabler/icons-react";
import type {InspectionChecklistTemplate} from "armonia/src/modules/propertyManagement/api/realEstate/private/inspectionChecklistTemplate/inspectionChecklistTemplate.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import InspectionChecklistTemplateCard from "@propertyManagementModule/clients/panel/private/inspectionChecklistTemplates/center/cardView/inspectionChecklistTemplateCard.tsx";

interface Props extends WithLanguageType {
    projectId?: string;
    projectName?: string;
}

function buildEditPath(row: InspectionChecklistTemplate) {
    const params = new URLSearchParams();
    params.set("inspectionChecklistTemplateId", row._id);
    if (row.name) params.set("inspectionChecklistTemplateName", row.name);
    return `/realEstate/inspectionChecklistTemplates/edit?${params.toString()}`;
}

function AllInspectionChecklistTemplates({resolveLanguageKey, projectId}: Props) {
    return (
        <EntityListPage<InspectionChecklistTemplate>
            apiUrl="/api/realEstate/inspectionChecklistTemplate"
            collectionName="inspectionchecklisttemplates"
            accessModel="inspectionchecklisttemplates"
            tableConfigKey="inspectionchecklisttemplates"
            createPath="/realEstate/inspectionChecklistTemplates/create"
            createIcon={<IconPlus className="h-4 w-4" />}
            createLanguageKey="createInspectionChecklistTemplate"
            buildEditPath={buildEditPath}
            resolveLanguageKey={resolveLanguageKey}
            sheetLanguagePath="src/modules/propertyManagement/clients/panel/private/inspectionChecklistTemplates/center/sheetView/inspectionChecklistTemplateSheetView.tsx"
            cardViewClassName={GRID_TRANSACTIONAL}
            extraFilters={projectId ? {projectId} : undefined}
            renderCard={(row, onDelete, onRestore) => (
                <InspectionChecklistTemplateCard
                    entity={row}
                    onDelete={(r: InspectionChecklistTemplate | undefined, response?: DeletedData) => onDelete(r, response)}
                    onRestore={() => onRestore(row)}
                />
            )}
        />
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/inspectionChecklistTemplates/index.tsx"),
    withDebug(true, true),
)(AllInspectionChecklistTemplates);

import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import EntityListPage from "@coreModule/components/entityPage/EntityListPage.tsx";
import {GRID_TRANSACTIONAL} from "@propertyManagementModule/components/custom/cards/entityCard.constants.ts";
import {IconPlus} from "@tabler/icons-react";
import type {Specification} from "armonia/src/modules/propertyManagement/api/realEstate/private/specification/specification.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import SpecificationCard from "@propertyManagementModule/clients/panel/private/specifications/center/cardView/specificationCard.tsx";

interface Props extends WithLanguageType {
    projectId?: string;
}

function buildEditPath(row: Specification) {
    const params = new URLSearchParams();
    params.set("specificationId", row._id);
    if (row.name) params.set("specificationName", row.name);
    return `/realEstate/specifications/edit?${params.toString()}`;
}

function AllSpecifications({resolveLanguageKey, projectId}: Props) {
    return (
        <EntityListPage<Specification>
            apiUrl="/api/realEstate/specification"
            collectionName="specifications"
            accessModel="specifications"
            tableConfigKey="specifications"
            createPath="/realEstate/specifications/create"
            createIcon={<IconPlus className="h-4 w-4" />}
            createLanguageKey="createSpecification"
            buildEditPath={buildEditPath}
            resolveLanguageKey={resolveLanguageKey}
            sheetLanguagePath="src/modules/propertyManagement/clients/panel/private/specifications/center/sheetView/specificationSheetView.tsx"
            cardViewClassName={GRID_TRANSACTIONAL}
            extraFilters={projectId ? {projectId} : undefined}
            renderCard={(row, onDelete, onRestore) => (
                <SpecificationCard
                    entity={row}
                    onDelete={(r: Specification | undefined, response?: DeletedData) => onDelete(r, response)}
                    onRestore={() => onRestore(row)}
                />
            )}
        />
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/specifications/index.tsx"),
    withDebug(true, true, "specifications"),
)(AllSpecifications);

import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import EntityListPage from "@coreModule/components/entityPage/EntityListPage.tsx";
import {GRID_TRANSACTIONAL} from "@propertyManagementModule/components/custom/cards/entityCard.constants.ts";
import {IconPlus} from "@tabler/icons-react";
import type {HandoverPackage} from "armonia/src/modules/propertyManagement/api/realEstate/private/handoverPackage/handoverPackage.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import HandoverPackageCard from "@propertyManagementModule/clients/panel/private/handoverPackages/center/cardView/handoverPackageCard.tsx";

interface Props extends WithLanguageType {
    projectId?: string;
    projectName?: string;
}

function buildEditPath(row: HandoverPackage) {
    const params = new URLSearchParams();
    params.set("handoverPackageId", row._id);
    if (row.name) params.set("handoverPackageName", row.name);
    return `/realEstate/handoverPackages/edit?${params.toString()}`;
}

function AllHandoverPackages({resolveLanguageKey, projectId}: Props) {
    return (
        <EntityListPage<HandoverPackage>
            apiUrl="/api/realEstate/handoverPackage"
            collectionName="handoverpackages"
            accessModel="handoverpackages"
            tableConfigKey="handoverpackages"
            createPath="/realEstate/handoverPackages/create"
            createIcon={<IconPlus className="h-4 w-4" />}
            createLanguageKey="createHandoverPackage"
            buildEditPath={buildEditPath}
            resolveLanguageKey={resolveLanguageKey}
            sheetLanguagePath="src/modules/propertyManagement/clients/panel/private/handoverPackages/center/sheetView/handoverPackageSheetView.tsx"
            cardViewClassName={GRID_TRANSACTIONAL}
            extraFilters={projectId ? {projectId} : undefined}
            renderCard={(row, onDelete, onRestore) => (
                <HandoverPackageCard
                    entity={row}
                    onDelete={(r: HandoverPackage | undefined, response?: DeletedData) => onDelete(r, response)}
                    onRestore={() => onRestore(row)}
                />
            )}
        />
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/handoverPackages/index.tsx"),
    withDebug(true, true),
)(AllHandoverPackages);

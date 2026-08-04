import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import EntityListPage from "@coreModule/components/entityPage/EntityListPage.tsx";
import {GRID_TRANSACTIONAL} from "@propertyManagementModule/components/custom/cards/entityCard.constants.ts";
import {IconPlus} from "@tabler/icons-react";
import type {Warranty} from "armonia/src/modules/propertyManagement/api/realEstate/private/warranty/warranty.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import WarrantyCard from "@propertyManagementModule/clients/panel/private/warranties/center/cardView/warrantyCard.tsx";

interface Props extends WithLanguageType {
    projectId?: string;
    projectName?: string;
}

function buildEditPath(row: Warranty) {
    const params = new URLSearchParams();
    params.set("warrantyId", row._id);
    if (row.name) params.set("warrantyName", row.name);
    return `/realEstate/warranties/edit?${params.toString()}`;
}

function AllWarrantys({resolveLanguageKey, projectId}: Props) {
    return (
        <EntityListPage<Warranty>
            apiUrl="/api/realEstate/warranty"
            collectionName="warranties"
            accessModel="warranties"
            tableConfigKey="warranties"
            createPath="/realEstate/warranties/create"
            createIcon={<IconPlus className="h-4 w-4" />}
            createLanguageKey="createWarranty"
            buildEditPath={buildEditPath}
            resolveLanguageKey={resolveLanguageKey}
            sheetLanguagePath="src/modules/propertyManagement/clients/panel/private/warranties/center/sheetView/warrantySheetView.tsx"
            cardViewClassName={GRID_TRANSACTIONAL}
            extraFilters={projectId ? {projectId} : undefined}
            renderCard={(row, onDelete, onRestore) => (
                <WarrantyCard
                    entity={row}
                    onDelete={(r: Warranty | undefined, response?: DeletedData) => onDelete(r, response)}
                    onRestore={() => onRestore(row)}
                />
            )}
        />
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/warranties/index.tsx"),
    withDebug(true, true),
)(AllWarrantys);

import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import EntityListPage from "@coreModule/components/entityPage/EntityListPage.tsx";
import {GRID_TRANSACTIONAL_WIDE} from "@propertyManagementModule/components/custom/cards/entityCard.constants.ts";
import {IconPlus} from "@tabler/icons-react";
import type {ProgressClaim} from "armonia/src/modules/propertyManagement/api/realEstate/private/progressClaim/progressClaim.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import ProgressClaimCard from "@propertyManagementModule/clients/panel/private/progressClaims/center/cardView/progressClaimCard.tsx";

interface Props extends WithLanguageType {
    projectId?: string;
    projectName?: string;
}

function buildEditPath(row: ProgressClaim) {
    const params = new URLSearchParams();
    params.set("progressClaimId", row._id);
    if (row.name) params.set("progressClaimName", row.name);
    return `/realEstate/progressClaims/edit?${params.toString()}`;
}

function AllProgressClaims({resolveLanguageKey, projectId}: Props) {
    return (
        <EntityListPage<ProgressClaim>
            apiUrl="/api/realEstate/progressClaim"
            collectionName="progressclaims"
            accessModel="progressclaims"
            tableConfigKey="progressclaims"
            createPath="/realEstate/progressClaims/create"
            createIcon={<IconPlus className="h-4 w-4" />}
            createLanguageKey="createProgressClaim"
            buildEditPath={buildEditPath}
            resolveLanguageKey={resolveLanguageKey}
            sheetLanguagePath="src/modules/propertyManagement/clients/panel/private/progressClaims/center/sheetView/progressClaimSheetView.tsx"
            cardViewClassName={GRID_TRANSACTIONAL_WIDE}
            extraFilters={projectId ? {projectId} : undefined}
            renderCard={(row, onDelete, onRestore) => (
                <ProgressClaimCard
                    entity={row}
                    onDelete={(r: ProgressClaim | undefined, response?: DeletedData) => onDelete(r, response)}
                    onRestore={() => onRestore(row)}
                />
            )}
        />
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/progressClaims/index.tsx"),
    withDebug(true, true),
)(AllProgressClaims);

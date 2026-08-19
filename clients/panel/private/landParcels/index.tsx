import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import EntityListPage from "@coreModule/components/entityPage/EntityListPage.tsx";
import {GRID_TRANSACTIONAL} from "@propertyManagementModule/components/custom/cards/entityCard.constants.ts";
import {IconPlus} from "@tabler/icons-react";
import type {LandParcel} from "armonia/src/modules/propertyManagement/api/realEstate/private/landParcel/landParcel.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import LandParcelCard from "@propertyManagementModule/clients/panel/private/landParcels/center/cardView/landParcelCard.tsx";

interface Props extends WithLanguageType {
    projectId?: string;
    projectName?: string;
}

function buildEditPath(row: LandParcel) {
    const params = new URLSearchParams();
    params.set("landParcelId", row._id);
    if (row.name) params.set("landParcelName", row.name);
    return `/realEstate/landParcels/edit?${params.toString()}`;
}

function AllLandParcels({resolveLanguageKey, projectId}: Props) {
    return (
        <EntityListPage<LandParcel>
            apiUrl="/api/realEstate/landParcel"
            collectionName="landparcels"
            accessModel="landparcels"
            tableConfigKey="landparcels"
            createPath="/realEstate/landParcels/create"
            createIcon={<IconPlus className="h-4 w-4" />}
            createLanguageKey="createLandParcel"
            buildEditPath={buildEditPath}
            resolveLanguageKey={resolveLanguageKey}
            sheetLanguagePath="src/modules/propertyManagement/clients/panel/private/landParcels/center/sheetView/landParcelSheetView.tsx"
            cardViewClassName={GRID_TRANSACTIONAL}
            extraFilters={projectId ? {projectId} : undefined}
            renderCard={(row, onDelete, onRestore) => (
                <LandParcelCard
                    entity={row}
                    onDelete={(r: LandParcel | undefined, response?: DeletedData) => onDelete(r, response)}
                    onRestore={() => onRestore(row)}
                />
            )}
        />
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/landParcels/index.tsx"),
    withDebug(true, true, "landparcels"),
)(AllLandParcels);

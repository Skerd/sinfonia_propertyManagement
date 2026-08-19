import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {IconStack2} from "@tabler/icons-react";
import {StoryType} from "armonia/src/modules/propertyManagement/api/realEstate/private/storyType/storyType.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import StoryTypeCard from "@propertyManagementModule/clients/panel/private/storyTypes/center/cardView/storyTypeCard.tsx";
import EntityListPage from "@coreModule/components/entityPage/EntityListPage.tsx";
import {GRID_TRANSACTIONAL} from "@propertyManagementModule/components/custom/cards/entityCard.constants.ts";

function storyTypeEditPath(storyType: StoryType) {
    const params = new URLSearchParams();
    params.set("storyTypeId", storyType._id);
    if (storyType.name) params.set("storyTypeName", storyType.name);
    return `/tenancy/systemSettings/storyTypes/edit?${params.toString()}`;
}

function AllStoryTypes({resolveLanguageKey}: WithLanguageType) {
    return (
        <EntityListPage<StoryType>
            apiUrl="/api/realEstate/storyType"
            collectionName="storytypes"
            accessModel="storyTypes"
            tableConfigKey="storytypes"
            createPath="/tenancy/systemSettings/storyTypes/create"
            createIcon={<IconStack2 />}
            createLanguageKey="createStoryType"
            buildEditPath={storyTypeEditPath}
            resolveLanguageKey={resolveLanguageKey}
            cardViewClassName={GRID_TRANSACTIONAL}
            sheetLanguagePath="src/modules/propertyManagement/clients/panel/private/storyTypes/center/sheetView/storyTypeSheetView.tsx"
            renderCard={(storyType, onDelete, onRestore) => (
                <StoryTypeCard
                    storyType={storyType}
                    onDelete={(row: StoryType | undefined, response?: DeletedData) => onDelete(row, response)}
                    onRestore={() => onRestore(storyType)}
                />
            )}
        />
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/storyTypes/index.tsx"),
    withDebug(true, true, "storyTypes"),
)(AllStoryTypes);

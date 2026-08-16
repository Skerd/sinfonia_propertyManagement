import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {StoryType} from "armonia/src/modules/propertyManagement/api/realEstate/private/storyType/storyType.dto.ts";
import {IconListNumbers} from "@tabler/icons-react";
import StoryTypeSheetView from "@propertyManagementModule/clients/panel/private/storyTypes/center/sheetView/storyTypeSheetView.tsx";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import DisplayRow from "@coreModule/components/custom/displayValue/displayRow.tsx";
import EntityCard from "@coreModule/components/custom/systemCards/entityCard.tsx";
import type {WithAxiosLifecycleRef} from "@coreModule/helpers/hocs/withAxios.tsx";
import type {RefObject} from "react";

function storyTypeEditPath(storyType: StoryType) {
    const params = new URLSearchParams();
    params.set("storyTypeId", storyType._id);
    if (storyType.name) params.set("storyTypeName", storyType.name);
    return `/tenancy/systemSettings/storyTypes/edit?${params.toString()}`;
}

type StoryTypeCardProps = WithLanguageType & {
    storyType: StoryType;
    fetchId?: string;
    hideActions?: boolean;
    onDelete?: (deletedStoryType?: StoryType, response?: DeletedData) => void;
    onRestore?: () => void;
    sheetOnly?: boolean;
    innerRef?: RefObject<WithAxiosLifecycleRef<StoryType> | null>;
};

function StoryTypeCard({
    storyType,
    resolveLanguageKey,
    fetchId,
    hideActions = false,
    onDelete,
    onRestore,
    sheetOnly = false,
    innerRef,
}: StoryTypeCardProps) {
    return (
        <EntityCard
            resource="storyTypes"
            entity={storyType}
            fetchId={fetchId}
            singleUrl="/api/realEstate/storyType/single"
            onDelete={onDelete}
            onRestore={onRestore}
            hideActions={hideActions}
            sheetOnly={sheetOnly}
            editPath={storyTypeEditPath}
            Sheet={StoryTypeSheetView}
            sheetEntityProp="storyType"
            deleteUrl="/api/realEstate/storyType"
            restoreUrl="/api/realEstate/storyType/restore"
            failedTitle={String(resolveLanguageKey("failedTitle") || "")}
            failedDescription={String(resolveLanguageKey("failedDescription") || "")}
            titlePath="name"
            innerRef={innerRef}
        >
            {({entity}) => (
                <>
                    <EntityCard.Header
                        titlePath="name"
                        title={entity.name}
                    />
                    <EntityCard.Body>
                        <DisplayRow
                            icon={IconListNumbers}
                            label={resolveLanguageKey("sortOrder")}
                            tooltip={resolveLanguageKey("sortOrder")}
                            path="sortOrder"
                            type="number"
                            value={entity.sortOrder}
                        />
                    </EntityCard.Body>
                </>
            )}
        </EntityCard>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/storyTypes/center/cardView/storyTypeCard.tsx"),
    withDebug(true, true),
)(StoryTypeCard);

import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import type {SpecificationItem} from "armonia/src/modules/propertyManagement/api/realEstate/private/specificationItem/specificationItem.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import {Badge} from "@coreModule/components/ui/badge.tsx";
import Sheet from "@propertyManagementModule/clients/panel/private/specificationItems/center/sheetView/specificationItemSheetView.tsx";
import {STATUS_BADGE_NEUTRAL} from "@propertyManagementModule/components/custom/cards/entityCard.constants.ts";
import {cn} from "@coreModule/components/lib/utils.ts";
import EntityCard from "@coreModule/components/custom/systemCards/entityCard.tsx";
import type {WithAxiosLifecycleRef} from "@coreModule/helpers/hocs/withAxios.tsx";
import type {RefObject} from "react";

function specificationItemEditPath(entity: SpecificationItem) {
    const params = new URLSearchParams();
    params.set("specificationItemId", entity._id);
    if (entity.name) params.set("specificationItemName", entity.name);
    return `/realEstate/specificationItems/edit?${params.toString()}`;
}

type SpecificationItemCardProps = WithLanguageType & {
    entity: SpecificationItem;
    fetchId?: string;
    hideActions?: boolean;
    onDelete?: (deleted?: SpecificationItem, response?: DeletedData) => void;
    onRestore?: () => void;
    sheetOnly?: boolean;
    innerRef?: RefObject<WithAxiosLifecycleRef<SpecificationItem> | null>;
};

function SpecificationItemCard({
    entity,
    fetchId,
    hideActions = false,
    onDelete,
    onRestore,
    sheetOnly = false,
    innerRef,
}: SpecificationItemCardProps) {
    return (
        <EntityCard
            resource="specificationitems"
            entity={entity}
            fetchId={fetchId}
            singleUrl="/api/realEstate/specificationItem/single"
            onDelete={onDelete}
            onRestore={onRestore}
            hideActions={hideActions}
            sheetOnly={sheetOnly}
            editPath={specificationItemEditPath}
            Sheet={Sheet}
            sheetEntityProp="entity"
            deleteUrl="/api/realEstate/specificationItem"
            restoreUrl="/api/realEstate/specificationItem/restore"
            failedTitle=""
            failedDescription=""
            titlePath="title"
            innerRef={innerRef}
            sheetProps={() => ({fetchId})}
        >
            {({entity: row}) => (
                <EntityCard.Header
                    titlePath="title"
                    title={row.title}
                    subtitle={row.npkPosition || row.name}
                    subtitlePath="npkPosition"
                    badges={
                        <>
                            {row.status ? (
                                <Badge variant="secondary" className={cn("text-xs", STATUS_BADGE_NEUTRAL)}>{row.status}</Badge>
                            ) : null}
                            {row.isRPosition ? (
                                <Badge variant="secondary" className={cn("text-xs", STATUS_BADGE_NEUTRAL)}>R</Badge>
                            ) : null}
                        </>
                    }
                />
            )}
        </EntityCard>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/specificationItems/center/cardView/specificationItemCard.tsx"),
    withDebug(true, true),
)(SpecificationItemCard);

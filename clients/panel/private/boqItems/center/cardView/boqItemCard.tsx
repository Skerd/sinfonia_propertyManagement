import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import type {BoqItem} from "armonia/src/modules/propertyManagement/api/realEstate/private/boqItem/boqItem.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import {Badge} from "@coreModule/components/ui/badge.tsx";
import Sheet from "@propertyManagementModule/clients/panel/private/boqItems/center/sheetView/boqItemSheetView.tsx";
import {STATUS_BADGE_NEUTRAL} from "@propertyManagementModule/components/custom/cards/entityCard.constants.ts";
import {cn} from "@coreModule/components/lib/utils.ts";
import EntityCard from "@coreModule/components/custom/systemCards/entityCard.tsx";
import type {WithAxiosLifecycleRef} from "@coreModule/helpers/hocs/withAxios.tsx";
import type {RefObject} from "react";

function boqItemEditPath(boqItem: BoqItem) {
    const params = new URLSearchParams();
    params.set("boqItemId", boqItem._id);
    if (boqItem.name) params.set("boqItemName", boqItem.name);
    return `/realEstate/boqItems/edit?${params.toString()}`;
}

type BoqItemCardProps = WithLanguageType & {
    entity: BoqItem;
    fetchId?: string;
    hideActions?: boolean;
    onDelete?: (deleted?: BoqItem, response?: DeletedData) => void;
    onRestore?: () => void;
    sheetOnly?: boolean;
    innerRef?: RefObject<WithAxiosLifecycleRef<BoqItem> | null>;
};

function BoqItemCard({
    resolveLanguageKey,
    entity,
    fetchId,
    hideActions = false,
    onDelete,
    onRestore,
    sheetOnly = false,
    innerRef,
}: BoqItemCardProps) {
    return (
        <EntityCard
            resource="boqitems"
            entity={entity}
            fetchId={fetchId}
            singleUrl="/api/realEstate/boqItem/single"
            onDelete={onDelete}
            onRestore={onRestore}
            hideActions={hideActions}
            sheetOnly={sheetOnly}
            editPath={boqItemEditPath}
            Sheet={Sheet}
            sheetEntityProp="entity"
            deleteUrl="/api/realEstate/boqItem"
            restoreUrl="/api/realEstate/boqItem/restore"
            failedTitle={String(resolveLanguageKey("failedTitle") || "")}
            failedDescription={String(resolveLanguageKey("failedDescription") || "")}
            titlePath="title"
            innerRef={innerRef}
            sheetProps={() => ({fetchId})}
        >
            {({entity: row}) => (
                <EntityCard.Header
                    titlePath="title"
                    title={row.title}
                    subtitle={row.name}
                    subtitlePath="name"
                    badges={row.status ? (
                        <Badge variant="secondary" className={cn("text-xs", STATUS_BADGE_NEUTRAL)}>{String(resolveLanguageKey(`status.${row.status}`, true) || resolveLanguageKey(`statuses.${row.status}`, true) || row.status)}</Badge>
                    ) : null}
                />
            )}
        </EntityCard>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/boqItems/center/cardView/boqItemCard.tsx"),
    withDebug(true, true),
)(BoqItemCard);

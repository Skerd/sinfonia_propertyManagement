import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import type {VariationOrder} from "armonia/src/modules/propertyManagement/api/realEstate/private/variationOrder/variationOrder.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import {Badge} from "@coreModule/components/ui/badge.tsx";
import Sheet from "@propertyManagementModule/clients/panel/private/variationOrders/center/sheetView/variationOrderSheetView.tsx";
import {STATUS_BADGE_NEUTRAL} from "@propertyManagementModule/components/custom/cards/entityCard.constants.ts";
import {cn} from "@coreModule/components/lib/utils.ts";
import EntityCard from "@coreModule/components/custom/systemCards/entityCard.tsx";
import type {WithAxiosLifecycleRef} from "@coreModule/helpers/hocs/withAxios.tsx";
import type {RefObject} from "react";

function variationOrderEditPath(entity: VariationOrder) {
    const params = new URLSearchParams();
    params.set("variationOrderId", entity._id);
    if (entity.name) params.set("variationOrderName", entity.name);
    return `/realEstate/variationOrders/edit?${params.toString()}`;
}

type VariationOrderCardProps = WithLanguageType & {
    entity: VariationOrder;
    fetchId?: string;
    hideActions?: boolean;
    onDelete?: (deleted?: VariationOrder, response?: DeletedData) => void;
    onRestore?: () => void;
    sheetOnly?: boolean;
    innerRef?: RefObject<WithAxiosLifecycleRef<VariationOrder> | null>;
};

function VariationOrderCard({
    resolveLanguageKey,
    entity,
    fetchId,
    hideActions = false,
    onDelete,
    onRestore,
    sheetOnly = false,
    innerRef,
}: VariationOrderCardProps) {
    return (
        <EntityCard
            resource="variationorders"
            entity={entity}
            fetchId={fetchId}
            singleUrl="/api/realEstate/variationOrder/single"
            onDelete={onDelete}
            onRestore={onRestore}
            hideActions={hideActions}
            sheetOnly={sheetOnly}
            editPath={variationOrderEditPath}
            Sheet={Sheet}
            sheetEntityProp="entity"
            deleteUrl="/api/realEstate/variationOrder"
            restoreUrl="/api/realEstate/variationOrder/restore"
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
    withLanguage("src/modules/propertyManagement/clients/panel/private/variationOrders/center/cardView/variationOrderCard.tsx"),
    withDebug(true, true, "variationorders"),
)(VariationOrderCard);

import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import type {MaintenanceWorkOrder} from "armonia/src/modules/propertyManagement/api/realEstate/private/maintenanceWorkOrder/maintenanceWorkOrder.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import {Badge} from "@coreModule/components/ui/badge.tsx";
import Sheet from "@propertyManagementModule/clients/panel/private/maintenanceWorkOrders/center/sheetView/maintenanceWorkOrderSheetView.tsx";
import {STATUS_BADGE_NEUTRAL} from "@propertyManagementModule/components/custom/cards/entityCard.constants.ts";
import {cn} from "@coreModule/components/lib/utils.ts";
import EntityCard from "@coreModule/components/custom/systemCards/entityCard.tsx";
import type {WithAxiosLifecycleRef} from "@coreModule/helpers/hocs/withAxios.tsx";
import type {RefObject} from "react";

function maintenanceWorkOrderEditPath(entity: MaintenanceWorkOrder) {
    const params = new URLSearchParams();
    params.set("maintenanceWorkOrderId", entity._id);
    if (entity.name) params.set("maintenanceWorkOrderName", entity.name);
    return `/realEstate/maintenanceWorkOrders/edit?${params.toString()}`;
}

type MaintenanceWorkOrderCardProps = WithLanguageType & {
    entity: MaintenanceWorkOrder;
    fetchId?: string;
    hideActions?: boolean;
    onDelete?: (deleted?: MaintenanceWorkOrder, response?: DeletedData) => void;
    onRestore?: () => void;
    sheetOnly?: boolean;
    innerRef?: RefObject<WithAxiosLifecycleRef<MaintenanceWorkOrder> | null>;
};

function MaintenanceWorkOrderCard({
    resolveLanguageKey,
    entity,
    fetchId,
    hideActions = false,
    onDelete,
    onRestore,
    sheetOnly = false,
    innerRef,
}: MaintenanceWorkOrderCardProps) {
    return (
        <EntityCard
            resource="maintenanceworkorders"
            entity={entity}
            fetchId={fetchId}
            singleUrl="/api/realEstate/maintenanceWorkOrder/single"
            onDelete={onDelete}
            onRestore={onRestore}
            hideActions={hideActions}
            sheetOnly={sheetOnly}
            editPath={maintenanceWorkOrderEditPath}
            Sheet={Sheet}
            sheetEntityProp="entity"
            deleteUrl="/api/realEstate/maintenanceWorkOrder"
            restoreUrl="/api/realEstate/maintenanceWorkOrder/restore"
            failedTitle={String(resolveLanguageKey("failedTitle") || "")}
            failedDescription={String(resolveLanguageKey("failedDescription") || "")}
            titlePath="name"
            innerRef={innerRef}
            sheetProps={() => ({fetchId})}
        >
            {({entity: row}) => (
                <EntityCard.Header
                    titlePath="name"
                    title={row.name}
                    subtitle={row.type}
                    subtitlePath="type"
                    badges={row.status ? (
                        <Badge variant="secondary" className={cn("text-xs", STATUS_BADGE_NEUTRAL)}>{String(resolveLanguageKey(`status.${row.status}`, true) || resolveLanguageKey(`statuses.${row.status}`, true) || row.status)}</Badge>
                    ) : null}
                />
            )}
        </EntityCard>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/maintenanceWorkOrders/center/cardView/maintenanceWorkOrderCard.tsx"),
    withDebug(true, true, "maintenanceworkorders"),
)(MaintenanceWorkOrderCard);

import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import type {MaintenancePlan} from "armonia/src/modules/propertyManagement/api/realEstate/private/maintenancePlan/maintenancePlan.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import Sheet from "@propertyManagementModule/clients/panel/private/maintenancePlans/center/sheetView/maintenancePlanSheetView.tsx";
import EntityCard from "@coreModule/components/custom/systemCards/entityCard.tsx";
import type {WithAxiosLifecycleRef} from "@coreModule/helpers/hocs/withAxios.tsx";
import type {RefObject} from "react";

function maintenancePlanEditPath(entity: MaintenancePlan) {
    const params = new URLSearchParams();
    params.set("maintenancePlanId", entity._id);
    if (entity.name) params.set("maintenancePlanName", entity.name);
    return `/realEstate/maintenancePlans/edit?${params.toString()}`;
}

type MaintenancePlanCardProps = WithLanguageType & {
    entity: MaintenancePlan;
    fetchId?: string;
    hideActions?: boolean;
    onDelete?: (deleted?: MaintenancePlan, response?: DeletedData) => void;
    onRestore?: () => void;
    sheetOnly?: boolean;
    innerRef?: RefObject<WithAxiosLifecycleRef<MaintenancePlan> | null>;
};

function MaintenancePlanCard({
    entity,
    fetchId,
    hideActions = false,
    onDelete,
    onRestore,
    sheetOnly = false,
    innerRef,
}: MaintenancePlanCardProps) {
    return (
        <EntityCard
            resource="maintenanceplans"
            entity={entity}
            fetchId={fetchId}
            singleUrl="/api/realEstate/maintenancePlan/single"
            onDelete={onDelete}
            onRestore={onRestore}
            hideActions={hideActions}
            sheetOnly={sheetOnly}
            editPath={maintenancePlanEditPath}
            Sheet={Sheet}
            sheetEntityProp="entity"
            deleteUrl="/api/realEstate/maintenancePlan"
            restoreUrl="/api/realEstate/maintenancePlan/restore"
            failedTitle=""
            failedDescription=""
            titlePath="name"
            innerRef={innerRef}
            sheetProps={() => ({fetchId})}
        >
            {({entity: row}) => (
                <EntityCard.Header
                    titlePath="name"
                    title={row.name}
                    subtitle={row.planType}
                    subtitlePath="planType"
                />
            )}
        </EntityCard>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/maintenancePlans/center/cardView/maintenancePlanCard.tsx"),
    withDebug(true, true),
)(MaintenancePlanCard);

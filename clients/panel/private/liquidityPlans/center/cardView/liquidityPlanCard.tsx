import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import type {LiquidityPlan} from "armonia/src/modules/propertyManagement/api/realEstate/private/liquidityPlan/liquidityPlan.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import Sheet from "@propertyManagementModule/clients/panel/private/liquidityPlans/center/sheetView/liquidityPlanSheetView.tsx";
import EntityCard from "@coreModule/components/custom/systemCards/entityCard.tsx";
import type {WithAxiosLifecycleRef} from "@coreModule/helpers/hocs/withAxios.tsx";
import type {RefObject} from "react";

function liquidityPlanEditPath(entity: LiquidityPlan) {
    const params = new URLSearchParams();
    params.set("liquidityPlanId", entity._id);
    if (entity.name) params.set("liquidityPlanName", entity.name);
    return `/realEstate/liquidityPlans/edit?${params.toString()}`;
}

type LiquidityPlanCardProps = WithLanguageType & {
    entity: LiquidityPlan;
    fetchId?: string;
    hideActions?: boolean;
    onDelete?: (deleted?: LiquidityPlan, response?: DeletedData) => void;
    onRestore?: () => void;
    sheetOnly?: boolean;
    innerRef?: RefObject<WithAxiosLifecycleRef<LiquidityPlan> | null>;
};

function LiquidityPlanCard({
    resolveLanguageKey,
    entity,
    fetchId,
    hideActions = false,
    onDelete,
    onRestore,
    sheetOnly = false,
    innerRef,
}: LiquidityPlanCardProps) {
    return (
        <EntityCard
            resource="liquidityplans"
            entity={entity}
            fetchId={fetchId}
            singleUrl="/api/realEstate/liquidityPlan/single"
            onDelete={onDelete}
            onRestore={onRestore}
            hideActions={hideActions}
            sheetOnly={sheetOnly}
            editPath={liquidityPlanEditPath}
            Sheet={Sheet}
            sheetEntityProp="entity"
            deleteUrl="/api/realEstate/liquidityPlan"
            restoreUrl="/api/realEstate/liquidityPlan/restore"
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
                    subtitle={row.title}
                    subtitlePath="title"
                />
            )}
        </EntityCard>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/liquidityPlans/center/cardView/liquidityPlanCard.tsx"),
    withDebug(true, true),
)(LiquidityPlanCard);

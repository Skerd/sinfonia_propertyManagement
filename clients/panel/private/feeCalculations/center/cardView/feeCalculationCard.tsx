import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import type {FeeCalculation} from "armonia/src/modules/propertyManagement/api/realEstate/private/feeCalculation/feeCalculation.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import {Badge} from "@coreModule/components/ui/badge.tsx";
import Sheet from "@propertyManagementModule/clients/panel/private/feeCalculations/center/sheetView/feeCalculationSheetView.tsx";
import {STATUS_BADGE_NEUTRAL} from "@propertyManagementModule/components/custom/cards/entityCard.constants.ts";
import {cn} from "@coreModule/components/lib/utils.ts";
import EntityCard from "@coreModule/components/custom/systemCards/entityCard.tsx";
import type {WithAxiosLifecycleRef} from "@coreModule/helpers/hocs/withAxios.tsx";
import type {RefObject} from "react";

function feeCalculationEditPath(entity: FeeCalculation) {
    const params = new URLSearchParams();
    params.set("feeCalculationId", entity._id);
    if (entity.name) params.set("feeCalculationName", entity.name);
    return `/realEstate/feeCalculations/edit?${params.toString()}`;
}

type FeeCalculationCardProps = WithLanguageType & {
    entity: FeeCalculation;
    fetchId?: string;
    hideActions?: boolean;
    onDelete?: (deleted?: FeeCalculation, response?: DeletedData) => void;
    onRestore?: () => void;
    sheetOnly?: boolean;
    innerRef?: RefObject<WithAxiosLifecycleRef<FeeCalculation> | null>;
};

function FeeCalculationCard({
    entity,
    fetchId,
    hideActions = false,
    onDelete,
    onRestore,
    sheetOnly = false,
    innerRef,
}: FeeCalculationCardProps) {
    return (
        <EntityCard
            resource="feecalculations"
            entity={entity}
            fetchId={fetchId}
            singleUrl="/api/realEstate/feeCalculation/single"
            onDelete={onDelete}
            onRestore={onRestore}
            hideActions={hideActions}
            sheetOnly={sheetOnly}
            editPath={feeCalculationEditPath}
            Sheet={Sheet}
            sheetEntityProp="entity"
            deleteUrl="/api/realEstate/feeCalculation"
            restoreUrl="/api/realEstate/feeCalculation/restore"
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
                    badges={row.status ? (
                        <Badge variant="secondary" className={cn("text-xs", STATUS_BADGE_NEUTRAL)}>{row.status}</Badge>
                    ) : null}
                />
            )}
        </EntityCard>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/feeCalculations/center/cardView/feeCalculationCard.tsx"),
    withDebug(true, true),
)(FeeCalculationCard);

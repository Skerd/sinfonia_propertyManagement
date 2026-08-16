import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import type {LiquidityLine} from "armonia/src/modules/propertyManagement/api/realEstate/private/liquidityLine/liquidityLine.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import Sheet from "@propertyManagementModule/clients/panel/private/liquidityLines/center/sheetView/liquidityLineSheetView.tsx";
import EntityCard from "@coreModule/components/custom/systemCards/entityCard.tsx";
import type {WithAxiosLifecycleRef} from "@coreModule/helpers/hocs/withAxios.tsx";
import type {RefObject} from "react";

function liquidityLineEditPath(entity: LiquidityLine) {
    const params = new URLSearchParams();
    params.set("liquidityLineId", entity._id);
    if (entity.name) params.set("liquidityLineName", entity.name);
    return `/realEstate/liquidityLines/edit?${params.toString()}`;
}

type LiquidityLineCardProps = WithLanguageType & {
    entity: LiquidityLine;
    fetchId?: string;
    hideActions?: boolean;
    onDelete?: (deleted?: LiquidityLine, response?: DeletedData) => void;
    onRestore?: () => void;
    sheetOnly?: boolean;
    innerRef?: RefObject<WithAxiosLifecycleRef<LiquidityLine> | null>;
};

function LiquidityLineCard({
    entity,
    fetchId,
    hideActions = false,
    onDelete,
    onRestore,
    sheetOnly = false,
    innerRef,
}: LiquidityLineCardProps) {
    return (
        <EntityCard
            resource="liquiditylines"
            entity={entity}
            fetchId={fetchId}
            singleUrl="/api/realEstate/liquidityLine/single"
            onDelete={onDelete}
            onRestore={onRestore}
            hideActions={hideActions}
            sheetOnly={sheetOnly}
            editPath={liquidityLineEditPath}
            Sheet={Sheet}
            sheetEntityProp="entity"
            deleteUrl="/api/realEstate/liquidityLine"
            restoreUrl="/api/realEstate/liquidityLine/restore"
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
                    subtitle={row.direction}
                    subtitlePath="direction"
                />
            )}
        </EntityCard>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/liquidityLines/center/cardView/liquidityLineCard.tsx"),
    withDebug(true, true),
)(LiquidityLineCard);

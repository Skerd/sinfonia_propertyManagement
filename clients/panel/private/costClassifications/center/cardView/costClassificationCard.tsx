import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import type {CostClassification} from "armonia/src/modules/propertyManagement/api/realEstate/private/costClassification/costClassification.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import {Badge} from "@coreModule/components/ui/badge.tsx";
import Sheet from "@propertyManagementModule/clients/panel/private/costClassifications/center/sheetView/costClassificationSheetView.tsx";
import {STATUS_BADGE_NEUTRAL} from "@propertyManagementModule/components/custom/cards/entityCard.constants.ts";
import {cn} from "@coreModule/components/lib/utils.ts";
import EntityCard from "@coreModule/components/custom/systemCards/entityCard.tsx";
import type {WithAxiosLifecycleRef} from "@coreModule/helpers/hocs/withAxios.tsx";
import type {RefObject} from "react";

function costClassificationEditPath(entity: CostClassification) {
    const params = new URLSearchParams();
    params.set("costClassificationId", entity._id);
    if (entity.name) params.set("costClassificationName", entity.name);
    return `/realEstate/costClassifications/edit?${params.toString()}`;
}

type CostClassificationCardProps = WithLanguageType & {
    entity: CostClassification;
    fetchId?: string;
    hideActions?: boolean;
    onDelete?: (deleted?: CostClassification, response?: DeletedData) => void;
    onRestore?: () => void;
    sheetOnly?: boolean;
    innerRef?: RefObject<WithAxiosLifecycleRef<CostClassification> | null>;
};

function CostClassificationCard({
    entity,
    fetchId,
    hideActions = false,
    onDelete,
    onRestore,
    sheetOnly = false,
    innerRef,
}: CostClassificationCardProps) {
    return (
        <EntityCard
            resource="costclassifications"
            entity={entity}
            fetchId={fetchId}
            singleUrl="/api/realEstate/costClassification/single"
            onDelete={onDelete}
            onRestore={onRestore}
            hideActions={hideActions}
            sheetOnly={sheetOnly}
            editPath={costClassificationEditPath}
            Sheet={Sheet}
            sheetEntityProp="entity"
            deleteUrl="/api/realEstate/costClassification"
            restoreUrl="/api/realEstate/costClassification/restore"
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
                    subtitle={row.code}
                    subtitlePath="code"
                    badges={row.standard ? (
                        <Badge variant="secondary" className={cn("text-xs", STATUS_BADGE_NEUTRAL)}>{row.standard}</Badge>
                    ) : null}
                />
            )}
        </EntityCard>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/costClassifications/center/cardView/costClassificationCard.tsx"),
    withDebug(true, true),
)(CostClassificationCard);

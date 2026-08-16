import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import type {BimQuantity} from "armonia/src/modules/propertyManagement/api/realEstate/private/bimQuantity/bimQuantity.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import Sheet from "@propertyManagementModule/clients/panel/private/bimQuantities/center/sheetView/bimQuantitySheetView.tsx";
import EntityCard from "@coreModule/components/custom/systemCards/entityCard.tsx";
import type {WithAxiosLifecycleRef} from "@coreModule/helpers/hocs/withAxios.tsx";
import type {RefObject} from "react";

function bimQuantityEditPath(bimQuantity: BimQuantity) {
    const params = new URLSearchParams();
    params.set("bimQuantityId", bimQuantity._id);
    if (bimQuantity.name) params.set("bimQuantityName", bimQuantity.name);
    return `/realEstate/bimQuantities/edit?${params.toString()}`;
}

type BimQuantityCardProps = WithLanguageType & {
    entity: BimQuantity;
    fetchId?: string;
    hideActions?: boolean;
    onDelete?: (deleted?: BimQuantity, response?: DeletedData) => void;
    onRestore?: () => void;
    sheetOnly?: boolean;
    innerRef?: RefObject<WithAxiosLifecycleRef<BimQuantity> | null>;
};

function BimQuantityCard({
    entity,
    fetchId,
    hideActions = false,
    onDelete,
    onRestore,
    sheetOnly = false,
    innerRef,
}: BimQuantityCardProps) {
    return (
        <EntityCard
            resource="bimquantities"
            entity={entity}
            fetchId={fetchId}
            singleUrl="/api/realEstate/bimQuantity/single"
            onDelete={onDelete}
            onRestore={onRestore}
            hideActions={hideActions}
            sheetOnly={sheetOnly}
            editPath={bimQuantityEditPath}
            Sheet={Sheet}
            sheetEntityProp="entity"
            deleteUrl="/api/realEstate/bimQuantity"
            restoreUrl="/api/realEstate/bimQuantity/restore"
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
                    subtitle={row.classificationCode}
                    subtitlePath="classificationCode"
                />
            )}
        </EntityCard>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/bimQuantities/center/cardView/bimQuantityCard.tsx"),
    withDebug(true, true),
)(BimQuantityCard);

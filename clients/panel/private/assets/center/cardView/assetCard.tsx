import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import type {Asset} from "armonia/src/modules/propertyManagement/api/realEstate/private/asset/asset.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import {Badge} from "@coreModule/components/ui/badge.tsx";
import Sheet from "@propertyManagementModule/clients/panel/private/assets/center/sheetView/assetSheetView.tsx";
import {STATUS_BADGE_NEUTRAL} from "@propertyManagementModule/components/custom/cards/entityCard.constants.ts";
import {cn} from "@coreModule/components/lib/utils.ts";
import EntityCard from "@coreModule/components/custom/systemCards/entityCard.tsx";
import type {WithAxiosLifecycleRef} from "@coreModule/helpers/hocs/withAxios.tsx";
import type {RefObject} from "react";

function assetEditPath(asset: Asset) {
    const params = new URLSearchParams();
    params.set("assetId", asset._id);
    if (asset.name) params.set("assetName", asset.name);
    return `/realEstate/assets/edit?${params.toString()}`;
}

type AssetCardProps = WithLanguageType & {
    entity: Asset;
    fetchId?: string;
    hideActions?: boolean;
    onDelete?: (deleted?: Asset, response?: DeletedData) => void;
    onRestore?: () => void;
    sheetOnly?: boolean;
    innerRef?: RefObject<WithAxiosLifecycleRef<Asset> | null>;
};

function AssetCard({
    resolveLanguageKey,
    entity,
    fetchId,
    hideActions = false,
    onDelete,
    onRestore,
    sheetOnly = false,
    innerRef,
}: AssetCardProps) {
    return (
        <EntityCard
            resource="assets"
            entity={entity}
            fetchId={fetchId}
            singleUrl="/api/realEstate/asset/single"
            onDelete={onDelete}
            onRestore={onRestore}
            hideActions={hideActions}
            sheetOnly={sheetOnly}
            editPath={assetEditPath}
            Sheet={Sheet}
            sheetEntityProp="entity"
            deleteUrl="/api/realEstate/asset"
            restoreUrl="/api/realEstate/asset/restore"
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
                    subtitle={row.category}
                    subtitlePath="category"
                    badges={row.lifecycleStatus ? (
                        <Badge variant="secondary" className={cn("text-xs", STATUS_BADGE_NEUTRAL)}>{row.lifecycleStatus}</Badge>
                    ) : null}
                />
            )}
        </EntityCard>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/assets/center/cardView/assetCard.tsx"),
    withDebug(true, true, "assets"),
)(AssetCard);

import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import type {BidLine} from "armonia/src/modules/propertyManagement/api/realEstate/private/bidLine/bidLine.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import {Badge} from "@coreModule/components/ui/badge.tsx";
import Sheet from "@propertyManagementModule/clients/panel/private/bidLines/center/sheetView/bidLineSheetView.tsx";
import {STATUS_BADGE_NEUTRAL} from "@propertyManagementModule/components/custom/cards/entityCard.constants.ts";
import {cn} from "@coreModule/components/lib/utils.ts";
import EntityCard from "@coreModule/components/custom/systemCards/entityCard.tsx";
import type {WithAxiosLifecycleRef} from "@coreModule/helpers/hocs/withAxios.tsx";
import type {RefObject} from "react";

function bidLineEditPath(bidLine: BidLine) {
    const params = new URLSearchParams();
    params.set("bidLineId", bidLine._id);
    if (bidLine.name) params.set("bidLineName", bidLine.name);
    return `/realEstate/bidLines/edit?${params.toString()}`;
}

type BidLineCardProps = WithLanguageType & {
    entity: BidLine;
    fetchId?: string;
    hideActions?: boolean;
    onDelete?: (deleted?: BidLine, response?: DeletedData) => void;
    onRestore?: () => void;
    sheetOnly?: boolean;
    innerRef?: RefObject<WithAxiosLifecycleRef<BidLine> | null>;
};

function BidLineCard({
    resolveLanguageKey,
    entity,
    fetchId,
    hideActions = false,
    onDelete,
    onRestore,
    sheetOnly = false,
    innerRef,
}: BidLineCardProps) {
    return (
        <EntityCard
            resource="bidlines"
            entity={entity}
            fetchId={fetchId}
            singleUrl="/api/realEstate/bidLine/single"
            onDelete={onDelete}
            onRestore={onRestore}
            hideActions={hideActions}
            sheetOnly={sheetOnly}
            editPath={bidLineEditPath}
            Sheet={Sheet}
            sheetEntityProp="entity"
            deleteUrl="/api/realEstate/bidLine"
            restoreUrl="/api/realEstate/bidLine/restore"
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
                    subtitle={row.specificationItem?.title}
                    subtitlePath="specificationItem"
                    badges={row.lineTotal != null ? (
                        <Badge variant="secondary" className={cn("text-xs", STATUS_BADGE_NEUTRAL)}>{row.lineTotal}</Badge>
                    ) : null}
                />
            )}
        </EntityCard>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/bidLines/center/cardView/bidLineCard.tsx"),
    withDebug(true, true),
)(BidLineCard);

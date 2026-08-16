import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import type {Rfi} from "armonia/src/modules/propertyManagement/api/realEstate/private/rfi/rfi.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import {Badge} from "@coreModule/components/ui/badge.tsx";
import Sheet from "@propertyManagementModule/clients/panel/private/rfis/center/sheetView/rfiSheetView.tsx";
import {STATUS_BADGE_NEUTRAL} from "@propertyManagementModule/components/custom/cards/entityCard.constants.ts";
import {cn} from "@coreModule/components/lib/utils.ts";
import EntityCard from "@coreModule/components/custom/systemCards/entityCard.tsx";
import type {WithAxiosLifecycleRef} from "@coreModule/helpers/hocs/withAxios.tsx";
import type {RefObject} from "react";

function rfiEditPath(rfi: Rfi) {
    const params = new URLSearchParams();
    params.set("rfiId", rfi._id);
    if (rfi.name) params.set("rfiName", rfi.name);
    return `/realEstate/rfis/edit?${params.toString()}`;
}

type RfiCardProps = WithLanguageType & {
    entity: Rfi;
    fetchId?: string;
    hideActions?: boolean;
    onDelete?: (deleted?: Rfi, response?: DeletedData) => void;
    onRestore?: () => void;
    sheetOnly?: boolean;
    innerRef?: RefObject<WithAxiosLifecycleRef<Rfi> | null>;
};

function RfiCard({
    resolveLanguageKey,
    entity,
    fetchId,
    hideActions = false,
    onDelete,
    onRestore,
    sheetOnly = false,
    innerRef,
}: RfiCardProps) {
    return (
        <EntityCard
            resource="rfis"
            entity={entity}
            fetchId={fetchId}
            singleUrl="/api/realEstate/rfi/single"
            onDelete={onDelete}
            onRestore={onRestore}
            hideActions={hideActions}
            sheetOnly={sheetOnly}
            editPath={rfiEditPath}
            Sheet={Sheet}
            sheetEntityProp="entity"
            deleteUrl="/api/realEstate/rfi"
            restoreUrl="/api/realEstate/rfi/restore"
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
    withLanguage("src/modules/propertyManagement/clients/panel/private/rfis/center/cardView/rfiCard.tsx"),
    withDebug(true, true),
)(RfiCard);

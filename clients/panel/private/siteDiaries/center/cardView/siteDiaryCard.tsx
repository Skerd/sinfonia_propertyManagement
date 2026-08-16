import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import type {SiteDiary} from "armonia/src/modules/propertyManagement/api/realEstate/private/siteDiary/siteDiary.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import {Badge} from "@coreModule/components/ui/badge.tsx";
import Sheet from "@propertyManagementModule/clients/panel/private/siteDiaries/center/sheetView/siteDiarySheetView.tsx";
import {STATUS_BADGE_NEUTRAL} from "@propertyManagementModule/components/custom/cards/entityCard.constants.ts";
import {cn} from "@coreModule/components/lib/utils.ts";
import EntityCard from "@coreModule/components/custom/systemCards/entityCard.tsx";
import type {WithAxiosLifecycleRef} from "@coreModule/helpers/hocs/withAxios.tsx";
import type {RefObject} from "react";

function siteDiaryEditPath(entity: SiteDiary) {
    const params = new URLSearchParams();
    params.set("siteDiaryId", entity._id);
    if (entity.name) params.set("siteDiaryName", entity.name);
    return `/realEstate/siteDiaries/edit?${params.toString()}`;
}

type SiteDiaryCardProps = WithLanguageType & {
    entity: SiteDiary;
    fetchId?: string;
    hideActions?: boolean;
    onDelete?: (deleted?: SiteDiary, response?: DeletedData) => void;
    onRestore?: () => void;
    sheetOnly?: boolean;
    innerRef?: RefObject<WithAxiosLifecycleRef<SiteDiary> | null>;
};

function SiteDiaryCard({
    resolveLanguageKey,
    entity,
    fetchId,
    hideActions = false,
    onDelete,
    onRestore,
    sheetOnly = false,
    innerRef,
}: SiteDiaryCardProps) {
    return (
        <EntityCard
            resource="sitediaries"
            entity={entity}
            fetchId={fetchId}
            singleUrl="/api/realEstate/siteDiary/single"
            onDelete={onDelete}
            onRestore={onRestore}
            hideActions={hideActions}
            sheetOnly={sheetOnly}
            editPath={siteDiaryEditPath}
            Sheet={Sheet}
            sheetEntityProp="entity"
            deleteUrl="/api/realEstate/siteDiary"
            restoreUrl="/api/realEstate/siteDiary/restore"
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
    withLanguage("src/modules/propertyManagement/clients/panel/private/siteDiaries/center/cardView/siteDiaryCard.tsx"),
    withDebug(true, true),
)(SiteDiaryCard);

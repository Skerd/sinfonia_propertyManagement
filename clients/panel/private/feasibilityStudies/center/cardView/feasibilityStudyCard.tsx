import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import type {FeasibilityStudy} from "armonia/src/modules/propertyManagement/api/realEstate/private/feasibilityStudy/feasibilityStudy.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import {Badge} from "@coreModule/components/ui/badge.tsx";
import Sheet from "@propertyManagementModule/clients/panel/private/feasibilityStudies/center/sheetView/feasibilityStudySheetView.tsx";
import {STATUS_BADGE_NEUTRAL} from "@propertyManagementModule/components/custom/cards/entityCard.constants.ts";
import {cn} from "@coreModule/components/lib/utils.ts";
import EntityCard from "@coreModule/components/custom/systemCards/entityCard.tsx";
import type {WithAxiosLifecycleRef} from "@coreModule/helpers/hocs/withAxios.tsx";
import type {RefObject} from "react";

function feasibilityStudyEditPath(entity: FeasibilityStudy) {
    const params = new URLSearchParams();
    params.set("feasibilityStudyId", entity._id);
    if (entity.name) params.set("feasibilityStudyName", entity.name);
    return `/realEstate/feasibilityStudies/edit?${params.toString()}`;
}

type FeasibilityStudyCardProps = WithLanguageType & {
    entity: FeasibilityStudy;
    fetchId?: string;
    hideActions?: boolean;
    onDelete?: (deleted?: FeasibilityStudy, response?: DeletedData) => void;
    onRestore?: () => void;
    sheetOnly?: boolean;
    innerRef?: RefObject<WithAxiosLifecycleRef<FeasibilityStudy> | null>;
};

function FeasibilityStudyCard({
    resolveLanguageKey,
    entity,
    fetchId,
    hideActions = false,
    onDelete,
    onRestore,
    sheetOnly = false,
    innerRef,
}: FeasibilityStudyCardProps) {
    return (
        <EntityCard
            resource="feasibilitystudies"
            entity={entity}
            fetchId={fetchId}
            singleUrl="/api/realEstate/feasibilityStudy/single"
            onDelete={onDelete}
            onRestore={onRestore}
            hideActions={hideActions}
            sheetOnly={sheetOnly}
            editPath={feasibilityStudyEditPath}
            Sheet={Sheet}
            sheetEntityProp="entity"
            deleteUrl="/api/realEstate/feasibilityStudy"
            restoreUrl="/api/realEstate/feasibilityStudy/restore"
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
    withLanguage("src/modules/propertyManagement/clients/panel/private/feasibilityStudies/center/cardView/feasibilityStudyCard.tsx"),
    withDebug(true, true, "feasibilitystudies"),
)(FeasibilityStudyCard);

import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import type {ConstructionUpdate} from "armonia/src/modules/propertyManagement/api/realEstate/private/constructionUpdate/constructionUpdate.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import {IconBuilding, IconCalendar, IconLabel, IconPercentage, IconStack2} from "@tabler/icons-react";
import ConstructionUpdateSheetView from "@propertyManagementModule/clients/panel/private/constructionUpdates/center/sheetView/constructionUpdateSheetView.tsx";
import CopyTooltip from "@coreModule/components/custom/copyTooltip.tsx";
import DisplayRow from "@coreModule/components/custom/displayValue/displayRow.tsx";
import EntityCard from "@coreModule/components/custom/systemCards/entityCard.tsx";
import type {WithAxiosLifecycleRef} from "@coreModule/helpers/hocs/withAxios.tsx";
import type {RefObject} from "react";

function constructionUpdateEditPath(update: ConstructionUpdate) {
    const params = new URLSearchParams();
    params.set("constructionUpdateId", update._id);
    if (update.name) params.set("constructionUpdateName", update.name);
    if (update.project?._id) params.set("projectId", update.project._id);
    if (update.project?.name) params.set("projectName", update.project.name);
    return `/realEstate/constructionUpdates/edit?${params.toString()}`;
}

type ConstructionUpdateCardProps = WithLanguageType & {
    constructionUpdate: ConstructionUpdate;
    fetchId?: string;
    hideActions?: boolean;
    onDelete?: (deletedUpdate?: ConstructionUpdate, response?: DeletedData) => void;
    onRestore?: () => void;
    sheetOnly?: boolean;
    innerRef?: RefObject<WithAxiosLifecycleRef<ConstructionUpdate> | null>;
};

function ConstructionUpdateCard({
    constructionUpdate,
    resolveLanguageKey,
    fetchId,
    hideActions = false,
    onDelete,
    onRestore,
    sheetOnly = false,
    innerRef,
}: ConstructionUpdateCardProps) {
    return (
        <EntityCard
            resource="constructionUpdates"
            entity={constructionUpdate}
            fetchId={fetchId}
            singleUrl="/api/realEstate/constructionUpdate/single"
            onDelete={onDelete}
            onRestore={onRestore}
            hideActions={hideActions}
            sheetOnly={sheetOnly}
            editPath={constructionUpdateEditPath}
            Sheet={ConstructionUpdateSheetView}
            sheetEntityProp="constructionUpdate"
            deleteUrl="/api/realEstate/constructionUpdate"
            restoreUrl="/api/realEstate/constructionUpdate/restore"
            failedTitle={String(resolveLanguageKey("failedTitle") || "")}
            failedDescription={String(resolveLanguageKey("failedDescription") || "")}
            titlePath="title"
            innerRef={innerRef}
            sheetProps={() => ({fetchId})}
        >
            {({entity}) => (
                <>
                    <EntityCard.Header
                        titlePath="title"
                        title={
                            <span className="flex min-w-0 items-center gap-1">
                                <span className="truncate">{entity.title}</span>
                                {entity.name ? <CopyTooltip text={entity.name} /> : null}
                            </span>
                        }
                    />
                    <EntityCard.Body>
                        <DisplayRow
                            icon={IconLabel}
                            label={resolveLanguageKey("fields.name")}
                            tooltip={resolveLanguageKey("fields.name")}
                            path="name"
                            value={entity.name}
                        />
                        <DisplayRow
                            icon={IconBuilding}
                            label={resolveLanguageKey("fields.project")}
                            tooltip={resolveLanguageKey("fields.project")}
                            path="project.name"
                            value={entity.project?.name}
                        />
                        <DisplayRow
                            icon={IconStack2}
                            label={resolveLanguageKey("fields.edifice")}
                            tooltip={resolveLanguageKey("fields.edifice")}
                            path="edifice.name"
                            value={entity.edifice?.name}
                        />
                        <DisplayRow
                            icon={IconPercentage}
                            label={resolveLanguageKey("fields.progressPercent")}
                            tooltip={resolveLanguageKey("fields.progressPercent")}
                            path="progressPercent"
                            type="number"
                            value={entity.progressPercent}
                        />
                        <DisplayRow
                            icon={IconCalendar}
                            label={resolveLanguageKey("fields.updateDate")}
                            tooltip={resolveLanguageKey("fields.updateDate")}
                            path="updateDate"
                            type="date"
                            value={entity.updateDate}
                        />
                    </EntityCard.Body>
                </>
            )}
        </EntityCard>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/constructionUpdates/center/cardView/constructionUpdateCard.tsx"),
    withDebug(true, true),
)(ConstructionUpdateCard);

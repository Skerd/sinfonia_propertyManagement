import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import type {ConstructionProgress} from "armonia/src/modules/propertyManagement/api/realEstate/private/constructionProgress/constructionProgress.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import {IconBuilding, IconCalendar, IconCrane, IconMailCheck} from "@tabler/icons-react";
import {AccessGatedGalleryCarousel} from "@coreModule/components/viewEngine/widgets/gallery/galleryCarousel.tsx";
import ConstructionProgressRowMenuExtras from "@propertyManagementModule/clients/panel/private/constructionProgress/center/actions/constructionProgressRowMenuExtras.tsx";
import ConstructionProgressSheetView from "@propertyManagementModule/clients/panel/private/constructionProgress/center/sheetView/constructionProgressSheetView.tsx";
import CopyTooltip from "@coreModule/components/custom/copyTooltip.tsx";
import EntityCardRow from "@coreModule/components/entityPage/list/card/entityCardRow.tsx";
import EntityCard from "@coreModule/components/entityPage/list/card/entityCard.tsx";
import type {WithAxiosLifecycleRef} from "@coreModule/helpers/hocs/withAxios.tsx";
import type {RefObject} from "react";

function constructionProgressEditPath(update: ConstructionProgress) {
    const params = new URLSearchParams();
    params.set("constructionProgressId", update._id);
    if (update.name) params.set("constructionProgressName", update.name);
    if (update.project?._id) params.set("projectId", update.project._id);
    if (update.project?.name) params.set("projectName", update.project.name);
    return `/realEstate/constructionProgress/edit?${params.toString()}`;
}

type ConstructionProgressCardProps = WithLanguageType & {
    constructionProgress: ConstructionProgress;
    fetchId?: string;
    hideActions?: boolean;
    onDelete?: (deletedUpdate?: ConstructionProgress, response?: DeletedData) => void;
    onRestore?: () => void;
    sheetOnly?: boolean;
    innerRef?: RefObject<WithAxiosLifecycleRef<ConstructionProgress> | null>;
};

function ConstructionProgressCard({
    constructionProgress,
    resolveLanguageKey,
    fetchId,
    hideActions = false,
    onDelete,
    onRestore,
    sheetOnly = false,
    innerRef,
}: ConstructionProgressCardProps) {
    return (
        <EntityCard
            resource="constructionprogresses"
            entity={constructionProgress}
            fetchId={fetchId}
            singleUrl="/api/realEstate/constructionProgress/single"
            onDelete={onDelete}
            onRestore={onRestore}
            hideActions={hideActions}
            sheetOnly={sheetOnly}
            editPath={constructionProgressEditPath}
            Sheet={ConstructionProgressSheetView}
            sheetEntityProp="constructionProgress"
            deleteUrl="/api/realEstate/constructionProgress"
            restoreUrl="/api/realEstate/constructionProgress/restore"
            failedTitle={resolveLanguageKey("failedTitle")}
            failedDescription={resolveLanguageKey("failedDescription")}
            titlePath="title"
            innerRef={innerRef}
            sheetProps={() => ({fetchId})}
        >
            {({entity, read}) => {
                const place = [entity.project?.name, entity.edifice?.name].filter(Boolean).join(" · ");
                const phase = entity.phase ? String(resolveLanguageKey(`fields.!enums.phase.${entity.phase}`)) : "";
                const stage = [phase, `${entity.progressPercent}%`].filter(Boolean).join(" · ");
                return (
                    <>
                        {/* Progress reports have no cover field: the first site photo is the cover (UX-02). */}
                        <div className="-mx-(--density-pad) -mt-(--density-pad) w-[calc(100%+2*var(--density-pad))]">
                            <AccessGatedGalleryCarousel
                                read={read}
                                imageGallery={entity.photos || []}
                                mainImagePath="photos"
                                imageGalleryPath="photos"
                                videoGalleryPath="photos"
                                showThumbnails={false}
                                allowFullScreen={false}
                                coverAfterFirst
                            />
                        </div>
                        <EntityCard.Header
                            titlePath="title"
                            title={
                                <span className="flex min-w-0 items-center gap-1">
                                    <span className="truncate">{entity.title}</span>
                                    {entity.name ? <CopyTooltip text={entity.name} /> : null}
                                </span>
                            }
                        >
                            <ConstructionProgressRowMenuExtras constructionProgress={entity} />
                        </EntityCard.Header>
                        {/* Where, how far, when, and whether clients were told (UX-02). */}
                        <EntityCard.Body>
                            {place ? (
                                <EntityCardRow
                                    icon={IconBuilding}
                                    label={resolveLanguageKey("fields.project")}
                                    tooltip={resolveLanguageKey("fields.project")}
                                    path="project"
                                    value={place}
                                />
                            ) : null}
                            <EntityCardRow
                                icon={IconCrane}
                                label={resolveLanguageKey("fields.phase")}
                                tooltip={resolveLanguageKey("fields.phase")}
                                path="phase"
                                value={stage}
                            />
                            <EntityCardRow
                                icon={IconCalendar}
                                label={resolveLanguageKey("fields.updateDate")}
                                tooltip={resolveLanguageKey("fields.updateDate")}
                                path="updateDate"
                                type="date"
                                value={entity.updateDate}
                            />
                            {entity.clientsNotifiedAt ? (
                                <EntityCardRow
                                    icon={IconMailCheck}
                                    label={resolveLanguageKey("fields.clientsNotifiedAt")}
                                    tooltip={resolveLanguageKey("fields.clientsNotifiedAt")}
                                    path="clientsNotifiedAt"
                                    type="date"
                                    value={entity.clientsNotifiedAt}
                                />
                            ) : null}
                        </EntityCard.Body>
                    </>
                );
            }}
        </EntityCard>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/constructionProgress/center/cardView/constructionProgressCard.tsx"),
    withDebug(true, true, "constructionprogresses"),
)(ConstructionProgressCard);

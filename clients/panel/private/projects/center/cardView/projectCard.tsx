import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {useMemo} from "react";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import HiddenElement from "@coreModule/components/custom/hiddenElement.tsx";
import {GalleryCarousel} from "@coreModule/components/custom/images/galleryCarousel.tsx";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import {formatCardAreaM2} from "@propertyManagementModule/helpers/general/formatCardNumber.ts";
import {Project} from "armonia/src/modules/propertyManagement/api/realEstate/private/project/project.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import {withDeletedDrawer} from "@coreModule/helpers/hocs/withDeletedDrawer.tsx";
import InfoRow from "@coreModule/components/custom/infoRow.tsx";
import {
    IconBuilding,
    IconChartArrowsVertical,
    IconDoor,
    IconGrid4x4,
    IconStack,
} from "@tabler/icons-react";
import {EntityCardShell} from "@propertyManagementModule/components/custom/cards/EntityCardShell.tsx";
import {EntityMediaHeader} from "@propertyManagementModule/components/custom/cards/EntityMediaHeader.tsx";
import {EntityStatusBadgeRow} from "@propertyManagementModule/components/custom/cards/EntityStatusBreakdown.tsx";
import {CARD_BODY_CLASS, CARD_INFO_ROWS_CLASS} from "@propertyManagementModule/components/custom/cards/entityCard.constants.ts";
import ProjectSheetView from "@propertyManagementModule/clients/panel/private/projects/center/sheetView/projectSheetView.tsx";
import DeleteAction from "@coreModule/components/custom/actions/deleteAction.tsx";
import RestoreAction from "@coreModule/components/custom/actions/restoreAction.tsx";
import ActionMenu from "@coreModule/components/custom/actions/menu/actionMenu.tsx";
import ViewEdifices from "@propertyManagementModule/clients/panel/private/projects/center/actions/viewEdifices.tsx";
import ViewEdificesOverlay from "@propertyManagementModule/clients/panel/private/projects/center/actions/viewEdificesOverlay.tsx";
import EdificesOverlay from "@propertyManagementModule/components/custom/projects/edificesOverlay.tsx";
import ViewFloorsOverlay from "@propertyManagementModule/clients/panel/private/projects/center/actions/viewFloorsOverlay.tsx";
import ProjectFloorsOverlay from "@propertyManagementModule/components/custom/projects/projectFloorsOverlay.tsx";
import {useEntityCard} from "@coreModule/helpers/hooks/useEntityCard.ts";

type ProjectCardProps = WithLanguageType & {
    project: Project;
    onDelete?: (deletedProject?: Project, response?: DeletedData) => void;
    onRestore?: () => void;
    hideActions?: boolean;
};

function ProjectCard({
    project: projectProp,
    resolveLanguageKey,
    onDelete: onDeleteProp,
    onRestore: onRestoreProp,
    hideActions = false,
}: ProjectCardProps) {

    const {action, setAction, entity: project, hideAfterDeletion, onDelete, onRestore} = useEntityCard({
        entityProp: projectProp,
        onDeleteProp,
        onRestoreProp,
    });

    const {read} = useAccess("projects");
    const {read: readEdifices} = useAccess("edifices");

    const galleryMemo = useMemo(() => (
        <GalleryCarousel
            mainImage={project.mainImage}
            imageGallery={project.imageGallery || []}
            videoGallery={project.videoGallery || []}
            showThumbnails={false}
            allowFullScreen={false}
            coverAfterFirst={true}
        />
    ), [project.imageGallery, project.videoGallery, project.mainImage]);

    if (hideAfterDeletion) {
        return <></>;
    }
    if (!read || !Object.keys(read).length) {
        return <HiddenElement />;
    }

    const editPath = (() => {
        const params = new URLSearchParams();
        params.set("projectId", project._id ?? "");
        if (project.name) params.set("projectName", project.name);
        return `/realEstate/projects/edit?${params.toString()}`;
    })();

    return (
        <>
            <EntityCardShell onClick={() => setAction("view")}>
                <EntityMediaHeader
                    carouselKey={"project_carousel" + project._id}
                    showMedia={!!(read?.mainImage || read?.imageGallery || read?.videoGallery)}
                    gallery={galleryMemo}
                    title={project.name}
                    subtitle={project.description}
                    showTitle={!!read?.name}
                    showSubtitle={!!read?.description}
                    hideActions={hideActions}
                    actionMenu={
                        <ActionMenu
                            accessModel={"projects"}
                            deletedData={project}
                            onAction={(a: string) => { setAction(a); }}
                            allowMenuForCustomChildren={!!readEdifices}
                            editPath={editPath}
                        >
                            <ViewEdifices project={project} />
                            <ViewEdificesOverlay onAction={(a: string) => { setAction(a); }} />
                            <ViewFloorsOverlay onAction={(a: string) => { setAction(a); }} />
                        </ActionMenu>
                    }
                />
                <div className={CARD_BODY_CLASS}>
                    {!!project.statistics && (
                        <div className="flex flex-col gap-1">
                            <div className={CARD_INFO_ROWS_CLASS}>
                                <InfoRow
                                    icon={IconBuilding}
                                    label={resolveLanguageKey("statistics.edifices")}
                                    tooltip={resolveLanguageKey("statistics.edificesTooltip")}
                                    show={!!read?.statistics}
                                    value={project.statistics.totalEdifices != null && project.statistics.totalEdifices}
                                />
                                <InfoRow
                                    icon={IconStack}
                                    label={resolveLanguageKey("statistics.floors")}
                                    tooltip={resolveLanguageKey("statistics.floorsTooltip")}
                                    show={!!read?.statistics}
                                    value={project.statistics.totalFloors != null && project.statistics.totalFloors}
                                />
                                <InfoRow
                                    icon={IconDoor}
                                    label={resolveLanguageKey("statistics.units")}
                                    tooltip={resolveLanguageKey("statistics.unitsTooltip")}
                                    show={!!read?.statistics}
                                    value={project.statistics.totalUnits != null && project.statistics.totalUnits}
                                />
                                <InfoRow
                                    icon={IconGrid4x4}
                                    label={resolveLanguageKey("statistics.area")}
                                    tooltip={resolveLanguageKey("statistics.areaTooltip")}
                                    show={!!read?.statistics}
                                    value={project.statistics.totalArea != null && formatCardAreaM2(project.statistics.totalArea)}
                                />
                                <InfoRow
                                    icon={IconChartArrowsVertical}
                                    label={resolveLanguageKey("statistics.investment")}
                                    tooltip={resolveLanguageKey("statistics.investmentTooltip")}
                                    show={!!read?.statistics}
                                    value={
                                        project.statistics?.totalInvestmentValue && Array.isArray(project.statistics.totalInvestmentValue) && project.statistics.totalInvestmentValue.length > 0 &&
                                        <div className="text-success flex flex-wrap gap-1">
                                            {
                                                project.statistics.totalInvestmentValue.map((inv, index, array) => {
                                                    const {currency, value} = inv;
                                                    const currencyName = currency?.abbreviation ?? currency?.symbol ?? currency?.name ?? "";
                                                    const isLast = index === array.length - 1;
                                                    const hasMultiple = array.length > 1;
                                                    return (
                                                        <div className="flex items-center gap-0.5" key={index}>
                                                            {isLast && hasMultiple && <span>{resolveLanguageKey("and")}</span>}
                                                            <p>{currencyName}</p>
                                                            <p>{(value ?? 0).toLocaleString()}</p>
                                                        </div>
                                                    );
                                                })
                                            }
                                        </div>
                                    }
                                />
                            </div>
                            <EntityStatusBadgeRow
                                unitsByStatus={project.statistics.unitsByStatus}
                                resolveLanguageKey={resolveLanguageKey}
                            />
                        </div>
                    )}
                </div>
            </EntityCardShell>

            {!!action && (
                <>
                    {action === "viewEdificesOverlay" && (
                        <EdificesOverlay
                            project={project}
                            openEdificesOverlay={action === "viewEdificesOverlay"}
                            onClose={() => { setAction(""); }}
                        />
                    )}
                    {action === "viewFloorsOverlay" && (
                        <ProjectFloorsOverlay
                            project={project}
                            openFloorsOverlay={action === "viewFloorsOverlay"}
                            onClose={() => { setAction(""); }}
                        />
                    )}
                    {action === "view" && (
                        <ProjectSheetView
                            open={action === "view"}
                            onOpenChange={() => setAction("")}
                            project={project}
                            onDelete={onDelete}
                            onRestore={onRestore}
                        />
                    )}
                    {action === "delete" && (
                        <DeleteAction
                            accessModel={"projects"}
                            deleteId={project._id}
                            openAlert={action === "delete"}
                            name={read?.name && project.name}
                            confirmName={read?.name && project.name}
                            onSuccess={onDelete}
                            onCancel={() => setAction("")}
                            url="/api/realEstate/project"
                        />
                    )}
                    {action === "restore" && (
                        <RestoreAction
                            accessModel={"projects"}
                            deleteId={project._id}
                            openAlert={action === "restore"}
                            name={read?.name && project.name}
                            confirmName={read?.name && project.name}
                            onSuccess={onRestore}
                            onCancel={() => setAction("")}
                            url="/api/realEstate/project/restore"
                        />
                    )}
                </>
            )}
        </>
    );
}

export default compose(
    (Component: any) => withDeletedDrawer(Component, (props: any) => props.project),
    withLanguage("src/modules/propertyManagement/clients/panel/private/projects/center/cardView/projectCard.tsx"),
    withDebug(true, true)
)(ProjectCard);

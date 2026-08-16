import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {GalleryCarousel} from "@coreModule/components/custom/images/galleryCarousel.tsx";
import {Project} from "armonia/src/modules/propertyManagement/api/realEstate/private/project/project.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import {
    IconBuilding,
    IconChartArrowsVertical,
    IconDoor,
    IconGrid4x4,
    IconStack,
} from "@tabler/icons-react";
import {EntityStatusBadgeRow} from "@propertyManagementModule/components/custom/cards/EntityStatusBreakdown.tsx";
import ProjectSheetView from "@propertyManagementModule/clients/panel/private/projects/center/sheetView/projectSheetView.tsx";
import ViewEdifices from "@propertyManagementModule/clients/panel/private/projects/center/actions/viewEdifices.tsx";
import ViewEdificesOverlay from "@propertyManagementModule/clients/panel/private/projects/center/actions/viewEdificesOverlay.tsx";
import EdificesOverlay from "@propertyManagementModule/components/custom/projects/edificesOverlay.tsx";
import ViewFloorsOverlay from "@propertyManagementModule/clients/panel/private/projects/center/actions/viewFloorsOverlay.tsx";
import ProjectFloorsOverlay from "@propertyManagementModule/components/custom/projects/projectFloorsOverlay.tsx";
import DisplayRow from "@coreModule/components/custom/displayValue/displayRow.tsx";
import DisplayValue from "@coreModule/components/custom/displayValue/displayValue.tsx";
import EntityCard from "@coreModule/components/custom/systemCards/entityCard.tsx";
import type {WithAxiosLifecycleRef} from "@coreModule/helpers/hocs/withAxios.tsx";
import type {RefObject} from "react";

function projectEditPath(project: Project) {
    const params = new URLSearchParams();
    params.set("projectId", project._id ?? "");
    if (project.name) params.set("projectName", project.name);
    return `/realEstate/projects/edit?${params.toString()}`;
}

type ProjectCardProps = WithLanguageType & {
    project: Project;
    fetchId?: string;
    hideActions?: boolean;
    onDelete?: (deletedProject?: Project, response?: DeletedData) => void;
    onRestore?: () => void;
    sheetOnly?: boolean;
    innerRef?: RefObject<WithAxiosLifecycleRef<Project> | null>;
};

function ProjectCard({
    project,
    resolveLanguageKey,
    fetchId,
    hideActions = false,
    onDelete,
    onRestore,
    sheetOnly = false,
    innerRef,
}: ProjectCardProps) {
    return (
        <EntityCard
            resource="projects"
            entity={project}
            fetchId={fetchId}
            singleUrl="/api/realEstate/project/single"
            onDelete={onDelete}
            onRestore={onRestore}
            hideActions={hideActions}
            sheetOnly={sheetOnly}
            editPath={projectEditPath}
            Sheet={ProjectSheetView}
            sheetEntityProp="project"
            deleteUrl="/api/realEstate/project"
            restoreUrl="/api/realEstate/project/restore"
            failedTitle=""
            failedDescription=""
            titlePath="name"
            innerRef={innerRef}
            sheetProps={() => ({fetchId})}
            extraDialogs={({action, setAction, entity}) => (
                <>
                    {action === "viewEdificesOverlay" && (
                        <EdificesOverlay
                            project={entity}
                            openEdificesOverlay
                            onClose={() => setAction("")}
                        />
                    )}
                    {action === "viewFloorsOverlay" && (
                        <ProjectFloorsOverlay
                            project={entity}
                            openFloorsOverlay
                            onClose={() => setAction("")}
                        />
                    )}
                </>
            )}
        >
            {({entity, setAction}) => (
                <>
                    <GalleryCarousel
                        mainImage={entity.mainImage}
                        imageGallery={entity.imageGallery || []}
                        videoGallery={entity.videoGallery || []}
                        showThumbnails={false}
                        allowFullScreen={false}
                        coverAfterFirst
                    />
                    <EntityCard.Header
                        titlePath="name"
                        title={entity.name}
                        subtitle={entity.description}
                        subtitlePath="description"
                    >
                        <ViewEdifices project={entity} />
                        <ViewEdificesOverlay onAction={setAction} />
                        <ViewFloorsOverlay onAction={setAction} />
                    </EntityCard.Header>
                    <EntityCard.Body>
                        <DisplayRow
                            icon={IconBuilding}
                            label={resolveLanguageKey("statistics.edifices")}
                            tooltip={resolveLanguageKey("statistics.edificesTooltip")}
                            show
                            path="statistics.totalEdifices"
                            type="number"
                            value={entity.statistics?.totalEdifices}
                        />
                        <DisplayRow
                            icon={IconStack}
                            label={resolveLanguageKey("statistics.floors")}
                            tooltip={resolveLanguageKey("statistics.floorsTooltip")}
                            show
                            path="statistics.totalFloors"
                            type="number"
                            value={entity.statistics?.totalFloors}
                        />
                        <DisplayRow
                            icon={IconDoor}
                            label={resolveLanguageKey("statistics.units")}
                            tooltip={resolveLanguageKey("statistics.unitsTooltip")}
                            show
                            path="statistics.totalUnits"
                            type="number"
                            value={entity.statistics?.totalUnits}
                        />
                        <DisplayRow
                            icon={IconGrid4x4}
                            label={resolveLanguageKey("statistics.area")}
                            tooltip={resolveLanguageKey("statistics.areaTooltip")}
                            show
                            path="statistics.totalArea"
                            type="area"
                            value={entity.statistics?.totalArea}
                        />
                        <DisplayRow
                            icon={IconChartArrowsVertical}
                            label={resolveLanguageKey("statistics.investment")}
                            tooltip={resolveLanguageKey("statistics.investmentTooltip")}
                            show
                            path="statistics.totalInvestmentValue"
                            value={
                                entity.statistics?.totalInvestmentValue?.length ? (
                                    <span className="flex flex-wrap gap-1">
                                        {entity.statistics.totalInvestmentValue.map((inv, index) => (
                                            <DisplayValue
                                                key={index}
                                                show
                                                path="statistics.totalInvestmentValue"
                                                type="currency"
                                                value={{amount: inv.value, currency: inv.currency}}
                                            />
                                        ))}
                                    </span>
                                ) : null
                            }
                        />
                        {entity.statistics?.unitsByStatus ? (
                            <EntityStatusBadgeRow
                                unitsByStatus={entity.statistics.unitsByStatus}
                                resolveLanguageKey={resolveLanguageKey}
                            />
                        ) : null}
                    </EntityCard.Body>
                </>
            )}
        </EntityCard>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/projects/center/cardView/projectCard.tsx"),
    withDebug(true, true),
)(ProjectCard);

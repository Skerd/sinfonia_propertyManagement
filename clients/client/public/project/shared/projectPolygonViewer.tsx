import {useEffect, useState} from "react";
import {Link, useNavigate} from "react-router-dom";
import {ChevronLeft} from "lucide-react";
import PolygonSelector from "@coreModule/components/custom/polygonSelector.tsx";
import {resolveMarketingMediaUrl} from "@propertyManagementModule/clients/client/public/shared/resolveMarketingMedia.ts";
import {resolveProjectFallbackImage} from "@propertyManagementModule/clients/client/public/project/shared/resolveProjectFallbackImage.ts";
import {useProjectViewerState} from "@propertyManagementModule/clients/client/public/project/shared/useProjectViewerState.ts";
import ProjectViewerSidebar from "@propertyManagementModule/clients/client/public/project/shared/projectViewerSidebar.tsx";
import EdificeInfoPanel from "@propertyManagementModule/clients/client/public/project/shared/edificeInfoPanel.tsx";
import OpenProject3dFloorPropertiesSection from "@propertyManagementModule/clients/client/public/project/sections/openProject3dFloorPropertiesSection.tsx";
import {parseFloorLevel} from "@propertyManagementModule/clients/client/public/project/shared/parseFloorLevel.ts";
import type {
    MarketingFloorListItem,
    MarketingProjectSingle,
    MarketingPolygonItem,
} from "@propertyManagementModule/clients/client/public/shared/publicTypes.ts";

type ProjectPolygonViewerProps = {
    project: MarketingProjectSingle;
    resolveLanguageKey: (key: string) => string;
    className?: string;
    showSidebar?: boolean;
};

function resolveImageUrl(url: string | undefined, project: MarketingProjectSingle): string {
    return resolveMarketingMediaUrl(url) ?? resolveProjectFallbackImage(project);
}

function formatFloorLabel(floor: MarketingFloorListItem | undefined, fallback: string): string {
    if (!floor) {
        return fallback;
    }
    if (floor.name?.trim()) {
        return floor.name;
    }
    const level = parseFloorLevel(floor.levelNumber);
    if (level === -1) {
        return "Basement";
    }
    if (level === 0) {
        return "Ground";
    }
    return `Floor ${level}`;
}

function ProjectPolygonViewer({
    project,
    resolveLanguageKey,
    className = "",
    showSidebar = true,
}: ProjectPolygonViewerProps) {
    const navigate = useNavigate();
    const [imageHoveredId, setImageHoveredId] = useState<string | null>(null);
    const [sidebarHoveredId, setSidebarHoveredId] = useState<string | null>(null);
    const {
        level,
        edifices,
        sortedFloors,
        selectedEdifice,
        selectedFloor,
        selectedEdificeId,
        selectedFloorId,
        selectEdifice,
        selectFloor,
        goBack,
        canGoBack,
    } = useProjectViewerState({project});

    // Clear transient hover when navigating project → building → floor.
    useEffect(() => {
        setImageHoveredId(null);
        setSidebarHoveredId(null);
    }, [level, selectedEdificeId, selectedFloorId]);

    const projectImage = resolveImageUrl(project.mainImage, project);
    const edificeImage = resolveImageUrl(selectedEdifice?.mainImage, project);
    const floorImage = resolveImageUrl(selectedFloor?.mainImage, project);

    const renderHover = (item: MarketingPolygonItem) => (
        <div className="bg-white px-3 py-2 font-aeonik-medium text-sm text-pronix-ink md:text-base">{item.name}</div>
    );

    const handlePolygonClick = (item: MarketingPolygonItem) => {
        if (level === "project") {
            selectEdifice(item._id);
            return;
        }
        if (level === "edifice") {
            selectFloor(item._id);
            return;
        }
        navigate(`/property?projectId=${project._id}&unitId=${item._id}`);
    };

    let imageUrl = projectImage;
    let phantomPoints: MarketingPolygonItem[] = project.edificesCoordinates ?? [];
    let emptyKey = "viewerEmptyProject";
    let stayHovered: string | undefined;

    if (level === "edifice" && selectedEdifice) {
        imageUrl = edificeImage;
        phantomPoints = selectedEdifice.floorsCoordinates ?? [];
        emptyKey = "viewerEmptyEdifice";
        stayHovered = selectedFloorId || undefined;
    } else if (level === "floor" && selectedFloor) {
        imageUrl = floorImage;
        phantomPoints = selectedFloor.unitsCoordinates ?? [];
        emptyKey = "viewerEmptyFloor";
    }

    const hasPolygons = phantomPoints.length > 0;
    const phantomIds = new Set(phantomPoints.map((item) => item._id));
    const listIds =
        level === "project"
            ? new Set(edifices.map((edifice) => edifice._id))
            : level === "edifice"
              ? new Set(sortedFloors.map((floor) => floor._id))
              : phantomIds;

    const externalHoveredId =
        (sidebarHoveredId && phantomIds.has(sidebarHoveredId) && sidebarHoveredId) ||
        (imageHoveredId && phantomIds.has(imageHoveredId) && imageHoveredId) ||
        "";

    const sidebarHighlightId =
        (sidebarHoveredId && listIds.has(sidebarHoveredId) && sidebarHoveredId) ||
        (imageHoveredId && phantomIds.has(imageHoveredId) && imageHoveredId) ||
        null;

    const showEdificeInfo = Boolean(selectedEdifice && level === "edifice");
    const edificeName = selectedEdifice?.name || resolveLanguageKey("unnamedEdifice");
    const floorName = formatFloorLabel(selectedFloor, "Floor");
    const unitHoverId = level === "floor" ? sidebarHighlightId : null;

    const viewerPanel = hasPolygons ? (
        <div className="h-full min-h-0 w-full overflow-hidden rounded-[5px]">
            <PolygonSelector
                fillHeight
                dashboard
                borderless
                disabled
                hideControls
                imageUrl={imageUrl}
                phantomPoints={phantomPoints}
                phantomHoverContent={renderHover}
                onFloorClick={handlePolygonClick}
                stayHovered={stayHovered}
                externalHoveredId={externalHoveredId}
                onPhantomHoverChange={setImageHoveredId}
                initialPoints={[]}
                onPointsChange={() => {}}
            />
        </div>
    ) : (
        <div className="flex h-full min-h-0 flex-col items-center justify-center gap-4 rounded-[5px] border border-dashed border-pronix-border bg-[rgba(24,24,24,0.02)] p-6 text-center">
            <img alt={project.name} className="max-h-[280px] w-full max-w-lg rounded-[5px] object-cover" src={imageUrl} />
            <p className="font-aeonik-light text-base text-pronix-ink-muted md:text-lg">
                {resolveLanguageKey(emptyKey)}
            </p>
            <Link
                to={`/project?projectId=${project._id}`}
                className="font-aeonik-medium text-base text-pronix-blue hover:underline"
            >
                {resolveLanguageKey("viewGrid")}
            </Link>
        </div>
    );

    return (
        <div className={`flex w-full flex-col gap-4 ${className}`}>
            {canGoBack && (
                <div className="-ml-2 flex min-w-0 max-w-full items-center gap-1 sm:-ml-2.5 sm:gap-1.5 md:-ml-3">
                    <button
                        type="button"
                        onClick={goBack}
                        className="flex shrink-0 items-center justify-center rounded-[5px] p-1 text-pronix-ink transition hover:bg-[rgba(24,24,24,0.04)]"
                        aria-label={String(resolveLanguageKey("back"))}
                    >
                        <ChevronLeft className="size-8 sm:size-10 md:size-12" strokeWidth={1.5} aria-hidden />
                    </button>
                    <nav
                        aria-label={String(resolveLanguageKey("back"))}
                        className="flex min-w-0 items-center gap-1.5 sm:gap-2"
                    >
                        {level === "floor" ? (
                            <button
                                type="button"
                                onClick={goBack}
                                className="min-w-0 truncate rounded-[5px] px-1 py-0.5 font-aeonik-medium text-2xl leading-none text-pronix-ink transition hover:bg-[rgba(24,24,24,0.04)] sm:text-3xl md:text-4xl"
                            >
                                {edificeName}
                            </button>
                        ) : (
                            <span className="min-w-0 truncate px-1 py-0.5 font-aeonik-medium text-2xl leading-none text-pronix-ink sm:text-3xl md:text-4xl">
                                {edificeName}
                            </span>
                        )}
                        {level === "floor" ? (
                            <>
                                <span
                                    className="shrink-0 font-aeonik-light text-2xl leading-none text-pronix-ink-muted sm:text-3xl md:text-4xl"
                                    aria-hidden
                                >
                                    /
                                </span>
                                <span className="min-w-0 truncate font-aeonik-medium text-2xl leading-none text-pronix-ink sm:text-3xl md:text-4xl">
                                    {floorName}
                                </span>
                            </>
                        ) : null}
                    </nav>
                </div>
            )}

            <div
                className={`grid w-full grid-cols-1 gap-6 ${
                    showSidebar ? "lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:items-stretch" : ""
                }`}
            >
                <div className="h-[60vh] min-h-[480px] max-h-[75vh] min-w-0">{viewerPanel}</div>
                {showSidebar && (
                    <div className="min-h-[240px] min-w-0 lg:max-h-[75vh]">
                        {level === "floor" ? (
                            <OpenProject3dFloorPropertiesSection
                                project={project}
                                resolveLanguageKey={resolveLanguageKey}
                                hoveredUnitId={unitHoverId}
                                onUnitHover={setSidebarHoveredId}
                            />
                        ) : (
                            <ProjectViewerSidebar
                                level={level}
                                edifices={edifices}
                                sortedFloors={sortedFloors}
                                selectedEdificeId={selectedEdificeId}
                                selectedFloorId={selectedFloorId}
                                selectedEdifice={selectedEdifice}
                                selectedFloor={selectedFloor}
                                hoveredId={sidebarHighlightId}
                                onHoverId={setSidebarHoveredId}
                                onSelectEdifice={selectEdifice}
                                onSelectFloor={selectFloor}
                                resolveLanguageKey={resolveLanguageKey}
                            />
                        )}
                    </div>
                )}
            </div>

            {showEdificeInfo && selectedEdifice ? (
                <EdificeInfoPanel edifice={selectedEdifice} resolveLanguageKey={resolveLanguageKey} />
            ) : null}
        </div>
    );
}

export default ProjectPolygonViewer;

import {Link, useNavigate} from "react-router-dom";
import PolygonSelector from "@coreModule/components/custom/polygonSelector.tsx";
import {resolveMarketingMediaUrl} from "@propertyManagementModule/clients/client/public/shared/resolveMarketingMedia.ts";
import {resolveProjectFallbackImage} from "@propertyManagementModule/clients/client/public/project/shared/resolveProjectFallbackImage.ts";
import {useProjectViewerState} from "@propertyManagementModule/clients/client/public/project/shared/useProjectViewerState.ts";
import ProjectViewerSidebar from "@propertyManagementModule/clients/client/public/project/shared/projectViewerSidebar.tsx";
import type {MarketingProjectSingle, MarketingPolygonItem} from "@propertyManagementModule/clients/client/public/shared/publicTypes.ts";

type ProjectPolygonViewerProps = {
    project: MarketingProjectSingle;
    resolveLanguageKey: (key: string) => string;
    className?: string;
    showSidebar?: boolean;
};

function resolveImageUrl(url: string | undefined, project: MarketingProjectSingle): string {
    return resolveMarketingMediaUrl(url) ?? resolveProjectFallbackImage(project);
}

function ProjectPolygonViewer({
    project,
    resolveLanguageKey,
    className = "",
    showSidebar = true,
}: ProjectPolygonViewerProps) {
    const navigate = useNavigate();
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

    const projectImage = resolveImageUrl(project.mainImage, project);
    const edificeImage = resolveImageUrl(selectedEdifice?.mainImage, project);
    const floorImage = resolveImageUrl(selectedFloor?.mainImage, project);

    const renderHover = (item: MarketingPolygonItem) => (
        <div className="px-2 py-1 font-aeonik-medium text-sm text-pronix-ink">{item.name}</div>
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

    const viewerPanel = hasPolygons ? (
        <div className="h-full min-h-0 w-full overflow-hidden rounded-[5px] border border-pronix-border">
            <PolygonSelector
                fillHeight
                dashboard
                disabled
                imageUrl={imageUrl}
                phantomPoints={phantomPoints}
                phantomHoverContent={renderHover}
                onFloorClick={handlePolygonClick}
                stayHovered={stayHovered}
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
                to={`/project/grid?projectId=${project._id}`}
                className="font-aeonik-medium text-base text-pronix-blue hover:underline"
            >
                {resolveLanguageKey("viewGrid")}
            </Link>
        </div>
    );

    return (
        <div className={`flex w-full flex-col gap-4 ${className}`}>
            {canGoBack && (
                <button
                    type="button"
                    onClick={goBack}
                    className="self-start font-aeonik-light text-base text-pronix-blue hover:underline md:text-lg"
                >
                    ← {resolveLanguageKey("back")}
                </button>
            )}

            <div
                className={`grid w-full grid-cols-1 gap-6 ${
                    showSidebar ? "lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:items-stretch" : ""
                }`}
            >
                <div className="h-[60vh] min-h-[480px] max-h-[75vh] min-w-0">{viewerPanel}</div>
                {showSidebar && (
                    <div className="min-h-[240px] min-w-0 lg:max-h-[75vh]">
                        <ProjectViewerSidebar
                            level={level}
                            edifices={edifices}
                            sortedFloors={sortedFloors}
                            selectedEdificeId={selectedEdificeId}
                            selectedFloorId={selectedFloorId}
                            selectedEdifice={selectedEdifice}
                            selectedFloor={selectedFloor}
                            onSelectEdifice={selectEdifice}
                            onSelectFloor={selectFloor}
                            resolveLanguageKey={resolveLanguageKey}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}

export default ProjectPolygonViewer;

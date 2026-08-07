import {useEffect, useMemo, useState} from "react";
import {useNavigate} from "react-router-dom";
import {ChevronLeft} from "lucide-react";
import {cn} from "@coreModule/components/lib/utils.ts";
import PolygonSelector from "@coreModule/components/custom/polygonSelector.tsx";
import {resolveMarketingMediaUrl} from "@propertyManagementModule/clients/client/public/shared/resolveMarketingMedia.ts";
import {parseFloorLevel} from "@propertyManagementModule/clients/client/public/project/shared/parseFloorLevel.ts";
import DyeusPropertiesList from "@propertyManagementModule/clients/client/dyeus/home/sections/dyeusPropertiesList.tsx";
import {dyeusAssets} from "@propertyManagementModule/clients/client/dyeus/shared/dyeusAssets.ts";
import type {
    MarketingFloorListItem,
    MarketingPolygonItem,
    MarketingProjectSingle,
} from "@propertyManagementModule/clients/client/public/shared/publicTypes.ts";

type DyeusProjectPolygonViewerProps = {
    project: MarketingProjectSingle;
    className?: string;
};

type ViewerLevel = "project" | "edifice" | "floor";

function resolveImageUrl(url: string | undefined, fallback: string): string {
    return resolveMarketingMediaUrl(url) ?? fallback;
}

function formatFloorLabel(floor: MarketingFloorListItem | undefined, fallback: string): string {
    if (!floor) return fallback;
    if (floor.name?.trim()) return floor.name;
    const level = parseFloorLevel(floor.levelNumber);
    if (level === -1) return "Basement";
    if (level === 0) return "Ground";
    return `Floor ${level}`;
}

function DyeusProjectPolygonViewer({project, className}: DyeusProjectPolygonViewerProps) {
    const navigate = useNavigate();
    const edifices = project.edifices ?? [];
    const singleEdifice = edifices.length === 1;

    const [imageHoveredId, setImageHoveredId] = useState<string | null>(null);
    const [listHoveredId, setListHoveredId] = useState<string | null>(null);
    // Seed single-edifice selection on first paint — a post-mount effect remounts the
    // canvas (project → edifice) and flickers the image.
    const [selectedEdificeId, setSelectedEdificeId] = useState(
        () => (edifices.length === 1 ? edifices[0]?._id ?? "" : ""),
    );
    const [selectedFloorId, setSelectedFloorId] = useState("");

    const selectedEdifice = useMemo(
        () => edifices.find((edifice) => edifice._id === selectedEdificeId),
        [edifices, selectedEdificeId],
    );

    const sortedFloors = useMemo(() => {
        const floors = selectedEdifice?.floors ?? [];
        return [...floors].sort(
            (a, b) => parseFloorLevel(b.levelNumber) - parseFloorLevel(a.levelNumber),
        );
    }, [selectedEdifice]);

    const selectedFloor = useMemo(
        () => sortedFloors.find((floor) => floor._id === selectedFloorId),
        [sortedFloors, selectedFloorId],
    );

    const level: ViewerLevel = selectedFloorId && selectedEdificeId
        ? "floor"
        : selectedEdificeId
          ? "edifice"
          : "project";

    // Safety net if edifices arrive/update after first paint.
    useEffect(() => {
        if (singleEdifice && !selectedEdificeId && edifices[0]?._id) {
            setSelectedEdificeId(edifices[0]._id);
        }
    }, [singleEdifice, selectedEdificeId, edifices]);

    // Preload project + edifice images so swaps never flash blank.
    useEffect(() => {
        const urls = [
            resolveMarketingMediaUrl(project.mainImage),
            ...edifices.map((edifice) => resolveMarketingMediaUrl(edifice.mainImage)),
        ];
        for (const url of urls) {
            if (!url) continue;
            const img = new Image();
            img.src = url;
        }
    }, [project.mainImage, edifices]);

    const projectImage = resolveImageUrl(project.mainImage, dyeusAssets.villaFeature);
    const edificeImage = resolveImageUrl(selectedEdifice?.mainImage, projectImage);

    const atProjectLevel = level === "project";
    const canvasImageUrl = atProjectLevel ? projectImage : edificeImage;
    const phantomPoints: MarketingPolygonItem[] = atProjectLevel
        ? (project.edificesCoordinates ?? [])
        : (selectedEdifice?.floorsCoordinates ?? []);
    const stayHovered = !atProjectLevel ? selectedFloorId || undefined : undefined;

    const selectEdifice = (edificeId: string) => {
        setSelectedEdificeId(edificeId);
        setSelectedFloorId("");
        setImageHoveredId(null);
        setListHoveredId(null);
    };

    const selectFloor = (floorId: string) => {
        setSelectedFloorId(floorId);
        setListHoveredId(null);
    };

    const goBack = () => {
        if (level === "floor") {
            setSelectedFloorId("");
            return;
        }
        if (level === "edifice" && !singleEdifice) {
            setSelectedEdificeId("");
            setSelectedFloorId("");
        }
    };

    const handlePolygonClick = (item: MarketingPolygonItem) => {
        if (atProjectLevel) {
            selectEdifice(item._id);
            return;
        }
        selectFloor(item._id);
    };

    const phantomIds = new Set(phantomPoints.map((item) => item._id));
    const externalHoveredId =
        (listHoveredId && phantomIds.has(listHoveredId) && listHoveredId) ||
        (imageHoveredId && phantomIds.has(imageHoveredId) && imageHoveredId) ||
        "";

    const edificeName = selectedEdifice?.name || "Residence";
    const floorName = formatFloorLabel(selectedFloor, "Floor");
    const showBack = level === "floor" || (level === "edifice" && !singleEdifice);
    const showUnitSelector = level === "floor" && !!selectedFloor;

    const renderHover = (item: MarketingPolygonItem) => (
        <div className="bg-dyeus-cream px-3 py-2 font-dyeus-sans text-sm text-dyeus-ink shadow-md">
            {item.name}
        </div>
    );

    const openUnit = (unitId: string) => {
        navigate(`/property?projectId=${project._id}&unitId=${unitId}`);
    };

    return (
        <div
            className={cn(
                "relative w-screen max-w-[100vw] overflow-hidden",
                className,
            )}
            data-node-id="287:444"
        >
            <div className="relative aspect-[1728/974] w-full min-w-full overflow-hidden bg-dyeus-sand">
                <div className="absolute inset-0 size-full [&_[data-slot=card]]:size-full [&_[data-slot=card]]:max-w-none [&_[data-slot=card]]:rounded-none [&_[data-slot=card]]:border-0 [&_[data-slot=card]]:bg-transparent [&_[data-slot=card]]:p-0 [&_[data-slot=card]]:shadow-none [&_[data-slot=card]]:ring-0">
                    <PolygonSelector
                        fillHeight
                        dashboard
                        borderless
                        disabled
                        hideControls
                        imageUrl={canvasImageUrl}
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

                {atProjectLevel && !singleEdifice ? (
                    <p
                        aria-hidden
                        className="pointer-events-none absolute left-[10.13%] top-[15.91%] z-10 w-[67.25%] select-none font-dyeus-serif text-[clamp(4rem,18vw,19rem)] font-light leading-none tracking-[0.2em] text-dyeus-cream"
                    >
                        DYEUS
                    </p>
                ) : null}

                {showBack ? (
                    <div className="absolute left-3 top-3 z-30 md:left-5 md:top-5">
                        <div className="flex max-w-[min(100vw-1.5rem,20rem)] items-center gap-0.5 rounded-md bg-dyeus-cream/90 py-1 pl-1 pr-2 shadow-sm backdrop-blur-sm">
                            <button
                                type="button"
                                onClick={goBack}
                                className="flex size-7 shrink-0 cursor-pointer items-center justify-center rounded text-dyeus-ink/80 transition hover:bg-dyeus-sand/80 hover:text-dyeus-ink"
                                aria-label="Go back"
                            >
                                <ChevronLeft className="size-4" strokeWidth={1.75} aria-hidden />
                            </button>
                            <nav
                                aria-label="Viewer location"
                                className="flex min-w-0 items-center gap-1.5 font-dyeus-serif text-sm leading-none text-dyeus-ink md:text-[0.9375rem]"
                            >
                                {level === "floor" ? (
                                    <button
                                        type="button"
                                        onClick={goBack}
                                        className="min-w-0 truncate cursor-pointer text-dyeus-ink/55 transition hover:text-dyeus-ink"
                                    >
                                        {edificeName}
                                    </button>
                                ) : (
                                    <span className="min-w-0 truncate">{edificeName}</span>
                                )}
                                {level === "floor" ? (
                                    <>
                                        <span className="shrink-0 text-dyeus-ink/30" aria-hidden>
                                            /
                                        </span>
                                        <span className="min-w-0 truncate text-dyeus-ink">
                                            {floorName}
                                        </span>
                                    </>
                                ) : null}
                            </nav>
                        </div>
                    </div>
                ) : null}

                {atProjectLevel && !singleEdifice ? (
                    <div className="absolute bottom-4 left-4 right-4 z-20 flex flex-wrap gap-2 md:bottom-6 md:left-6 md:right-auto">
                        {edifices.map((edifice) => (
                            <button
                                key={edifice._id}
                                type="button"
                                onClick={() => selectEdifice(edifice._id)}
                                onMouseEnter={() => setListHoveredId(edifice._id)}
                                onMouseLeave={() => setListHoveredId(null)}
                                className={cn(
                                    "cursor-pointer rounded-[4px] border px-4 py-2 font-dyeus-serif text-lg transition",
                                    listHoveredId === edifice._id || imageHoveredId === edifice._id
                                        ? "border-dyeus-cream bg-dyeus-cream text-dyeus-ink"
                                        : "border-dyeus-cream/70 bg-dyeus-ink/35 text-dyeus-cream hover:bg-dyeus-cream hover:text-dyeus-ink",
                                )}
                            >
                                {edifice.name || "Residence"}
                            </button>
                        ))}
                    </div>
                ) : null}

                {showUnitSelector && selectedFloor ? (
                    <div className="absolute inset-y-[3.5%] right-[3.5%] z-30 hidden w-[min(512px,34%)] min-w-[20rem] lg:block">
                        <DyeusPropertiesList
                            project={project}
                            floorId={selectedFloor._id}
                            floors={sortedFloors}
                            onClose={goBack}
                            hoveredUnitId={listHoveredId}
                            onUnitHover={setListHoveredId}
                            onUnitClick={openUnit}
                            className="h-full"
                        />
                    </div>
                ) : null}
            </div>

            {showUnitSelector && selectedFloor ? (
                <div className="bg-dyeus-cream px-4 py-6 lg:hidden">
                    <DyeusPropertiesList
                        project={project}
                        floorId={selectedFloor._id}
                        floors={sortedFloors}
                        onClose={goBack}
                        hoveredUnitId={listHoveredId}
                        onUnitHover={setListHoveredId}
                        onUnitClick={openUnit}
                        className="min-h-[32rem]"
                    />
                </div>
            ) : null}
        </div>
    );
}

export default DyeusProjectPolygonViewer;

import {useEffect, useMemo, useState} from "react";
import {ChevronLeft, Eye, EyeOff} from "lucide-react";
import {cn} from "@coreModule/components/lib/utils.ts";
import PolygonSelector from "@coreModule/components/custom/polygonSelector.tsx";
import {resolveMarketingMediaUrl} from "@propertyManagementModule/clients/client/public/shared/resolveMarketingMedia.ts";
import {parseFloorLevel} from "@propertyManagementModule/clients/client/public/project/shared/parseFloorLevel.ts";
import {flattenCatalogUnits} from "@propertyManagementModule/clients/client/public/project/shared/flattenCatalogUnits.ts";
import DyeusPropertiesList from "@propertyManagementModule/clients/client/dyeus/home/sections/dyeusPropertiesList.tsx";
import DyeusUnitPanel from "@propertyManagementModule/clients/client/dyeus/shared/dyeusUnitPanel.tsx";
import {dyeusAssets} from "@propertyManagementModule/clients/client/dyeus/shared/dyeusAssets.ts";
import {
    useDyeusT,
    type DyeusTranslate,
} from "@propertyManagementModule/clients/client/dyeus/shared/useDyeusT.ts";
import type {
    MarketingEdificeListItem,
    MarketingFloorListItem,
    MarketingPolygonItem,
    MarketingProjectSingle,
} from "@propertyManagementModule/clients/client/public/shared/publicTypes.ts";

const HOME_LANGUAGE_PATH =
    "src/modules/propertyManagement/clients/client/dyeus/home/index.tsx";
const FALLBACK_IMAGE_ASPECT = 16 / 10;

type DyeusProjectPolygonViewerProps = {
    project: MarketingProjectSingle;
    className?: string;
};

type ViewerLevel = "project" | "edifice" | "floor";

function resolveImageUrl(url: string | undefined, fallback: string): string {
    return resolveMarketingMediaUrl(url) ?? fallback;
}

function formatFloorLabel(t: DyeusTranslate, floor: MarketingFloorListItem | undefined): string {
    if (!floor) return t("floorFallback");
    if (floor.name?.trim()) return floor.name;
    const level = parseFloorLevel(floor.levelNumber);
    if (level === -1) return t("basement");
    if (level === 0) return t("ground");
    return t("floorN", {level});
}

function ViewerSelectionList({
    items,
    selectedId,
    hoveredId,
    onSelect,
    onHover,
    emptyLabel,
}: {
    items: {id: string; label: string; meta?: string}[];
    selectedId: string;
    hoveredId: string | null;
    onSelect: (id: string) => void;
    onHover: (id: string | null) => void;
    emptyLabel: string;
}) {
    if (items.length === 0) {
        return <p className="font-dyeus-sans text-sm text-dyeus-ink-muted">{emptyLabel}</p>;
    }

    return (
        <ul className="flex flex-col gap-1">
            {items.map((item) => {
                const active = item.id === selectedId;
                const hovered = item.id === hoveredId;
                return (
                    <li key={item.id}>
                        <button
                            type="button"
                            onClick={() => onSelect(item.id)}
                            onMouseEnter={() => onHover(item.id)}
                            onMouseLeave={() => onHover(null)}
                            onFocus={() => onHover(item.id)}
                            onBlur={() => onHover(null)}
                            className={cn(
                                "flex w-full flex-col px-3 py-2.5 text-left transition",
                                active
                                    ? "bg-dyeus-ink text-dyeus-cream"
                                    : hovered
                                      ? "bg-dyeus-sand text-dyeus-ink"
                                      : "text-dyeus-ink hover:bg-dyeus-sand/70",
                            )}
                        >
                            <span className="font-dyeus-serif text-[1.05rem]">{item.label}</span>
                            {item.meta ? (
                                <span
                                    className={cn(
                                        "mt-0.5 font-dyeus-sans text-xs",
                                        active ? "text-dyeus-cream/75" : "text-dyeus-ink-muted",
                                    )}
                                >
                                    {item.meta}
                                </span>
                            ) : null}
                        </button>
                    </li>
                );
            })}
        </ul>
    );
}

function DyeusProjectPolygonViewer({project, className}: DyeusProjectPolygonViewerProps) {
    const {t} = useDyeusT(HOME_LANGUAGE_PATH);
    const edifices = project.edifices ?? [];
    const singleEdifice = edifices.length === 1;

    const [imageHoveredId, setImageHoveredId] = useState<string | null>(null);
    const [listHoveredId, setListHoveredId] = useState<string | null>(null);
    const [imageAspect, setImageAspect] = useState(FALLBACK_IMAGE_ASPECT);
    const [phantomsAlwaysVisible, setPhantomsAlwaysVisible] = useState(true);
    // Seed single-edifice selection on first paint — a post-mount effect remounts the
    // canvas (project → edifice) and flickers the image.
    const [selectedEdificeId, setSelectedEdificeId] = useState(
        () => (edifices.length === 1 ? edifices[0]?._id ?? "" : ""),
    );
    const [selectedFloorId, setSelectedFloorId] = useState("");
    const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);

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

    const level: ViewerLevel =
        selectedFloorId && selectedEdificeId
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

    // Match stage height to the image aspect so contain fills width without cropping.
    useEffect(() => {
        let cancelled = false;
        const img = new Image();
        img.onload = () => {
            if (cancelled || img.naturalWidth <= 0 || img.naturalHeight <= 0) return;
            setImageAspect(img.naturalWidth / img.naturalHeight);
        };
        img.src = canvasImageUrl;
        return () => {
            cancelled = true;
        };
    }, [canvasImageUrl]);

    const selectEdifice = (edificeId: string) => {
        setSelectedEdificeId(edificeId);
        setSelectedFloorId("");
        setSelectedUnitId(null);
        setImageHoveredId(null);
        setListHoveredId(null);
    };

    const selectFloor = (floorId: string) => {
        setSelectedFloorId(floorId);
        setSelectedUnitId(null);
        setListHoveredId(null);
    };

    const goBack = () => {
        if (level === "floor") {
            setSelectedFloorId("");
            setSelectedUnitId(null);
            setListHoveredId(null);
            return;
        }
        if (level === "edifice" && !singleEdifice) {
            setSelectedEdificeId("");
            setSelectedFloorId("");
            setSelectedUnitId(null);
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
    const listIds = new Set(
        (level === "project" ? edifices.map((edifice) => edifice._id) : sortedFloors.map((floor) => floor._id)),
    );

    const externalHoveredId =
        (listHoveredId && phantomIds.has(listHoveredId) && listHoveredId) ||
        (imageHoveredId && phantomIds.has(imageHoveredId) && imageHoveredId) ||
        "";

    // Keep list + polygon hover in sync (hovering either side highlights both).
    const panelHoveredId =
        level === "floor"
            ? listHoveredId
            : (listHoveredId && listIds.has(listHoveredId) && listHoveredId) ||
              (imageHoveredId && listIds.has(imageHoveredId) && imageHoveredId) ||
              null;

    // Only lock a selected floor highlight after a floor is chosen.
    const stayHovered = level === "floor" ? selectedFloorId || undefined : undefined;
    const edificeName = selectedEdifice?.name || t("residenceFallback");
    const floorName = formatFloorLabel(t, selectedFloor);
    const showBack = level === "floor" || (level === "edifice" && !singleEdifice);
    const panelTitle =
        level === "edifice"
            ? edificeName
            : project.name?.trim() || "DYEUS";
    const panelEyebrow =
        level === "edifice" ? t("exploring") : t("projectOverview");
    const panelListLabel = level === "edifice" ? t("floors") : t("buildings");

    const edificeItems = edifices.map((edifice: MarketingEdificeListItem) => ({
        id: edifice._id,
        label: edifice.name || t("residenceFallback"),
        meta:
            edifice.floors?.length != null
                ? t("floorsMeta", {count: edifice.floors.length})
                : undefined,
    }));

    const floorItems = sortedFloors.map((floor) => ({
        id: floor._id,
        label: formatFloorLabel(t, floor),
        meta:
            floor.units?.length != null
                ? t("unitsMeta", {count: floor.units.length})
                : undefined,
    }));

    const renderHover = (item: MarketingPolygonItem) => (
        <div className="bg-dyeus-cream px-3 py-2 font-dyeus-sans text-sm text-dyeus-ink shadow-md">
            {item.name}
        </div>
    );

    const selectedUnitLabel = useMemo(() => {
        if (!selectedUnitId) return undefined;
        return flattenCatalogUnits(project).find((unit) => unit._id === selectedUnitId)?.name;
    }, [project, selectedUnitId]);

    const unitPanelOpen = Boolean(selectedUnitId);
    const [frontSheet, setFrontSheet] = useState<"floor" | "unit">("unit");
    const floorSheetFront = unitPanelOpen && frontSheet === "floor";

    useEffect(() => {
        setFrontSheet("unit");
    }, [selectedUnitId]);

    const floorSheet = level === "floor" && selectedFloor ? (
        <DyeusPropertiesList
            key={selectedFloor._id}
            project={project}
            floorId={selectedFloor._id}
            edificeId={selectedEdificeId}
            floors={sortedFloors}
            onClose={goBack}
            hoveredUnitId={panelHoveredId}
            selectedUnitId={selectedUnitId}
            onUnitHover={setListHoveredId}
            onUnitSelect={setSelectedUnitId}
            panelTitle={`${edificeName} / ${floorName}`}
            className="dyeus-sheet-in h-full min-h-0"
        />
    ) : (
        <>
            <div className="shrink-0 border-b border-dyeus-border px-4 pb-4 pt-4">
                <p className="font-dyeus-sans text-[0.7rem] uppercase tracking-[0.18em] text-dyeus-bronze">
                    {panelEyebrow}
                </p>
                <h2 className="mt-1.5 font-dyeus-serif text-[1.75rem] font-light leading-none tracking-[0.04em] text-dyeus-ink">
                    {panelTitle}
                </h2>
                <p className="mt-3 font-dyeus-sans text-xs text-dyeus-ink-muted">
                    {panelListLabel}
                </p>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-2 py-2">
                <ViewerSelectionList
                    items={level === "edifice" ? floorItems : edificeItems}
                    selectedId={level === "edifice" ? selectedFloorId : selectedEdificeId}
                    hoveredId={panelHoveredId}
                    onSelect={level === "edifice" ? selectFloor : selectEdifice}
                    onHover={setListHoveredId}
                    emptyLabel={level === "edifice" ? t("noFloors") : t("noBuildings")}
                />
            </div>
        </>
    );

    return (
        <div className={cn("w-full", className)} data-node-id="287:444">
            <div className="relative w-full overflow-hidden border border-dyeus-border bg-dyeus-white lg:overflow-visible">
                <div
                    className="relative w-full min-w-0 max-h-[90svh] overflow-hidden bg-dyeus-sand"
                    style={{aspectRatio: String(imageAspect)}}
                >
                    <div className="absolute inset-0 size-full [&_[data-slot=card]]:size-full [&_[data-slot=card]]:max-w-none [&_[data-slot=card]]:rounded-none [&_[data-slot=card]]:border-0 [&_[data-slot=card]]:bg-transparent [&_[data-slot=card]]:p-0 [&_[data-slot=card]]:shadow-none [&_[data-slot=card]]:ring-0">
                        <PolygonSelector
                            key={`${selectedEdificeId || "project"}:${canvasImageUrl}`}
                            fillHeight
                            dashboard
                            borderless
                            disabled
                            hideControls
                            objectFit="contain"
                            phantomsAlwaysVisible={phantomsAlwaysVisible}
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

                    <div className="absolute left-3 top-3 z-30 flex items-start gap-2 md:left-4 md:top-4">
                        {showBack ? (
                            <div className="flex max-w-[min(100vw-1.5rem,20rem)] items-center gap-0.5 bg-dyeus-cream/90 py-1 pl-1 pr-2 shadow-sm backdrop-blur-sm">
                                <button
                                    type="button"
                                    onClick={goBack}
                                    className="flex size-7 shrink-0 cursor-pointer items-center justify-center rounded text-dyeus-ink/80 transition hover:bg-dyeus-sand/80 hover:text-dyeus-ink"
                                    aria-label={t("goBack")}
                                >
                                    <ChevronLeft className="size-4" strokeWidth={1.75} aria-hidden />
                                </button>
                                <nav
                                    aria-label={t("viewerLocationAria")}
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
                        ) : null}
                        {phantomPoints.length > 0 ? (
                            <button
                                type="button"
                                onClick={() => setPhantomsAlwaysVisible((prev) => !prev)}
                                aria-pressed={phantomsAlwaysVisible}
                                aria-label={
                                    phantomsAlwaysVisible
                                        ? t("hidePolygons")
                                        : t("showPolygons")
                                }
                                className="flex size-8 shrink-0 cursor-pointer items-center justify-center bg-dyeus-cream/90 text-dyeus-ink/80 shadow-sm backdrop-blur-sm transition hover:bg-dyeus-cream hover:text-dyeus-ink"
                            >
                                {phantomsAlwaysVisible ? (
                                    <Eye className="size-4" strokeWidth={1.75} aria-hidden />
                                ) : (
                                    <EyeOff className="size-4" strokeWidth={1.75} aria-hidden />
                                )}
                            </button>
                        ) : null}
                    </div>
                </div>

                <aside
                    className={cn(
                        "flex min-h-[16rem] w-full flex-col border-t border-dyeus-border bg-dyeus-white",
                        "lg:absolute lg:h-auto lg:min-h-0 lg:overflow-hidden lg:border-t-0 lg:origin-top-right lg:transition-[transform,box-shadow,right,top,bottom] lg:duration-500 lg:ease-[cubic-bezier(0.22,1,0.36,1)]",
                        unitPanelOpen
                            ? cn(
                                  "lg:top-8 lg:bottom-12 lg:w-[30rem] lg:border lg:border-dyeus-border lg:right-[calc(min(56rem,72vw)-24rem)]",
                                  floorSheetFront
                                      ? "lg:z-30 lg:-translate-y-2 lg:scale-[1.02] lg:shadow-[14px_22px_52px_rgba(36,28,22,0.28)]"
                                      : "lg:z-10 lg:shadow-[8px_16px_40px_rgba(36,28,22,0.16)]",
                              )
                            : "lg:z-10 lg:inset-y-0 lg:right-0 lg:w-[30rem] lg:border-l lg:border-dyeus-border",
                    )}
                    onMouseEnter={() => {
                        if (unitPanelOpen) setFrontSheet("floor");
                    }}
                    onMouseLeave={() => setFrontSheet("unit")}
                    onFocusCapture={() => {
                        if (unitPanelOpen) setFrontSheet("floor");
                    }}
                >
                    {floorSheet}
                </aside>

                {selectedUnitId ? (
                    <div
                        key={selectedUnitId}
                        className={cn(
                            "dyeus-sheet-in flex min-h-[24rem] w-full flex-col border-t border-dyeus-border bg-dyeus-cream",
                            "lg:absolute lg:top-3 lg:bottom-2 lg:right-2 lg:z-20 lg:min-h-0 lg:w-[min(56rem,72vw)] lg:border lg:border-dyeus-border lg:shadow-[14px_22px_52px_rgba(36,28,22,0.28)]",
                        )}
                        onMouseEnter={() => setFrontSheet("unit")}
                        onFocusCapture={() => setFrontSheet("unit")}
                    >
                        <DyeusUnitPanel
                            projectId={project._id}
                            unitId={selectedUnitId}
                            unitLabel={selectedUnitLabel}
                            onClose={() => setSelectedUnitId(null)}
                        />
                    </div>
                ) : null}
            </div>
        </div>
    );
}

export default DyeusProjectPolygonViewer;

import {useEffect, useMemo, useState} from "react";
import {ChevronLeft} from "lucide-react";
import {cn} from "@coreModule/components/lib/utils.ts";
import PolygonSelector from "@coreModule/components/custom/polygonSelector.tsx";
import {resolveMarketingMediaUrl} from "@propertyManagementModule/clients/client/public/shared/resolveMarketingMedia.ts";
import {useProjectViewerState} from "@propertyManagementModule/clients/client/public/project/shared/useProjectViewerState.ts";
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

const RESIDENCES_LANGUAGE_PATH =
    "src/modules/propertyManagement/clients/client/dyeus/residences/index.tsx";

type DyeusResidencesPolygonViewerProps = {
    project: MarketingProjectSingle;
    className?: string;
};

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

function DyeusViewerSidebar({
    level,
    edifices,
    sortedFloors,
    selectedEdificeId,
    selectedFloorId,
    selectedEdifice,
    selectedFloor,
    hoveredId,
    onHoverId,
    onSelectEdifice,
    onSelectFloor,
    t,
}: {
    level: "project" | "edifice" | "floor";
    edifices: MarketingEdificeListItem[];
    sortedFloors: MarketingFloorListItem[];
    selectedEdificeId: string;
    selectedFloorId: string;
    selectedEdifice?: MarketingEdificeListItem;
    selectedFloor?: MarketingFloorListItem;
    hoveredId?: string | null;
    onHoverId?: (id: string | null) => void;
    onSelectEdifice: (edificeId: string) => void;
    onSelectFloor: (floorId: string) => void;
    t: DyeusTranslate;
}) {
    const items =
        level === "project"
            ? edifices.map((edifice) => ({
                  id: edifice._id,
                  label: edifice.name || t("residenceFallback"),
                  meta:
                      edifice.floors?.length != null
                          ? t("floorsMeta", {count: edifice.floors.length})
                          : undefined,
              }))
            : sortedFloors.map((floor) => ({
                  id: floor._id,
                  label: formatFloorLabel(t, floor),
                  meta:
                      floor.units?.length != null
                          ? t("unitsMeta", {count: floor.units.length})
                          : undefined,
              }));

    const selectedId = level === "project" ? selectedEdificeId : selectedFloorId;
    const onSelect = level === "project" ? onSelectEdifice : onSelectFloor;
    const contextTitle =
        level === "floor"
            ? formatFloorLabel(t, selectedFloor)
            : level === "edifice"
              ? selectedEdifice?.name || t("residenceFallback")
              : t("projectOverview");
    const listLabel = level === "project" ? t("buildings") : t("floors");

    return (
        <aside className="flex h-full min-h-0 w-full flex-col overflow-hidden bg-dyeus-white">
            <div className="border-b border-dyeus-border px-5 pb-4 pt-5">
                <p className="font-dyeus-sans text-xs uppercase tracking-[0.2em] text-dyeus-bronze">
                    {t("exploring")}
                </p>
                <h2 className="mt-1 font-dyeus-serif text-2xl text-dyeus-ink">{contextTitle}</h2>
                <p className="mt-3 font-dyeus-sans text-sm text-dyeus-ink-muted">{listLabel}</p>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
                {items.length === 0 ? (
                    <p className="px-2 py-4 font-dyeus-sans text-sm text-dyeus-ink-muted">
                        {level === "project" ? t("noBuildings") : t("noFloors")}
                    </p>
                ) : (
                    <ul className="flex flex-col gap-1">
                        {items.map((item) => {
                            const active = item.id === selectedId;
                            const hovered = item.id === hoveredId;
                            return (
                                <li key={item.id}>
                                    <button
                                        type="button"
                                        onClick={() => onSelect(item.id)}
                                        onMouseEnter={() => onHoverId?.(item.id)}
                                        onMouseLeave={() => onHoverId?.(null)}
                                        onFocus={() => onHoverId?.(item.id)}
                                        onBlur={() => onHoverId?.(null)}
                                        className={cn(
                                            "flex w-full flex-col px-3 py-3 text-left transition",
                                            active
                                                ? "bg-dyeus-ink text-dyeus-cream"
                                                : hovered
                                                  ? "bg-dyeus-sand text-dyeus-ink"
                                                  : "text-dyeus-ink hover:bg-dyeus-sand/70",
                                        )}
                                    >
                                        <span className="font-dyeus-serif text-lg">{item.label}</span>
                                        {item.meta ? (
                                            <span
                                                className={cn(
                                                    "mt-0.5 font-dyeus-sans text-sm",
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
                )}
            </div>
        </aside>
    );
}

function DyeusResidencesPolygonViewer({project, className}: DyeusResidencesPolygonViewerProps) {
    const {t} = useDyeusT(RESIDENCES_LANGUAGE_PATH);
    const [imageHoveredId, setImageHoveredId] = useState<string | null>(null);
    const [sidebarHoveredId, setSidebarHoveredId] = useState<string | null>(null);
    const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);
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

    useEffect(() => {
        setImageHoveredId(null);
        setSidebarHoveredId(null);
        setSelectedUnitId(null);
    }, [level, selectedEdificeId, selectedFloorId]);

    const projectImage = resolveImageUrl(project.mainImage, dyeusAssets.villaFeature);
    const edificeImage = resolveImageUrl(selectedEdifice?.mainImage, projectImage);

    const renderHover = (item: MarketingPolygonItem) => (
        <div className="bg-dyeus-cream px-3 py-2 font-dyeus-sans text-sm text-dyeus-ink shadow-md">
            {item.name}
        </div>
    );

    // Stay on edifice + floor polygons once a building is open — never swap the
    // main canvas to a floor-plan / unit-polygon view.
    const handlePolygonClick = (item: MarketingPolygonItem) => {
        if (level === "project") {
            selectEdifice(item._id);
            return;
        }
        selectFloor(item._id);
    };

    const atProjectLevel = level === "project";
    const imageUrl = atProjectLevel ? projectImage : edificeImage;
    const phantomPoints: MarketingPolygonItem[] = atProjectLevel
        ? (project.edificesCoordinates ?? [])
        : (selectedEdifice?.floorsCoordinates ?? []);

    const hasPolygons = phantomPoints.length > 0;
    const phantomIds = new Set(phantomPoints.map((item) => item._id));
    const listIds = atProjectLevel
        ? new Set(edifices.map((edifice) => edifice._id))
        : new Set(sortedFloors.map((floor) => floor._id));

    const externalHoveredId =
        (sidebarHoveredId && phantomIds.has(sidebarHoveredId) && sidebarHoveredId) ||
        (imageHoveredId && phantomIds.has(imageHoveredId) && imageHoveredId) ||
        "";

    const sidebarHighlightId =
        level === "floor"
            ? sidebarHoveredId
            : (sidebarHoveredId && listIds.has(sidebarHoveredId) && sidebarHoveredId) ||
              (imageHoveredId && phantomIds.has(imageHoveredId) && imageHoveredId) ||
              null;

    const edificeName = selectedEdifice?.name || t("residenceFallback");
    const floorName = formatFloorLabel(t, selectedFloor);
    const stayHovered = !atProjectLevel ? selectedFloorId || undefined : undefined;
    const unitPanelOpen = Boolean(selectedUnitId);
    const [frontSheet, setFrontSheet] = useState<"floor" | "unit">("unit");
    const floorSheetFront = unitPanelOpen && frontSheet === "floor";

    useEffect(() => {
        setFrontSheet("unit");
    }, [selectedUnitId]);
    const selectedUnitLabel = useMemo(() => {
        if (!selectedUnitId) return undefined;
        return flattenCatalogUnits(project).find((unit) => unit._id === selectedUnitId)?.name;
    }, [project, selectedUnitId]);

    const viewerPanel = hasPolygons ? (
        <div className="h-full min-h-0 w-full overflow-hidden bg-dyeus-sand [&_[data-slot=card]]:size-full [&_[data-slot=card]]:max-w-none [&_[data-slot=card]]:rounded-none [&_[data-slot=card]]:border-0 [&_[data-slot=card]]:bg-transparent [&_[data-slot=card]]:p-0 [&_[data-slot=card]]:shadow-none [&_[data-slot=card]]:ring-0">
            <PolygonSelector
                fillHeight
                dashboard
                borderless
                disabled
                hideControls
                objectFit="contain"
                phantomsAlwaysVisible
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
        <div className="flex h-full min-h-0 flex-col items-center justify-center gap-4 border border-dashed border-dyeus-border bg-dyeus-sand/40 p-6 text-center">
            <img alt={project.name} className="max-h-[280px] w-full max-w-lg object-cover" src={imageUrl} />
            <p className="font-dyeus-sans text-sm text-dyeus-ink-muted">{t("interactiveUnavailable")}</p>
        </div>
    );

    return (
        <div className={cn("flex w-full flex-col gap-4", className)}>
            {canGoBack ? (
                <div className="flex min-w-0 max-w-full items-center gap-1">
                    <button
                        type="button"
                        onClick={goBack}
                        className="flex shrink-0 items-center justify-center p-1 text-dyeus-ink transition hover:bg-dyeus-sand"
                        aria-label={t("goBack")}
                    >
                        <ChevronLeft className="size-8 md:size-10" strokeWidth={1.5} aria-hidden />
                    </button>
                    <nav aria-label={t("viewerLocationAria")} className="flex min-w-0 items-center gap-2">
                        {level === "floor" ? (
                            <button
                                type="button"
                                onClick={goBack}
                                className="min-w-0 truncate px-1 py-0.5 font-dyeus-serif text-2xl text-dyeus-ink/55 transition hover:text-dyeus-ink md:text-4xl"
                            >
                                {edificeName}
                            </button>
                        ) : (
                            <span className="min-w-0 truncate px-1 py-0.5 font-dyeus-serif text-2xl text-dyeus-ink md:text-4xl">
                                {edificeName}
                            </span>
                        )}
                        {level === "floor" ? (
                            <>
                                <span className="shrink-0 font-dyeus-serif text-2xl text-dyeus-ink/30 md:text-4xl" aria-hidden>
                                    /
                                </span>
                                <span className="min-w-0 truncate font-dyeus-serif text-2xl text-dyeus-ink md:text-4xl">
                                    {floorName}
                                </span>
                            </>
                        ) : null}
                    </nav>
                </div>
            ) : null}

            <div className="relative w-full overflow-hidden border border-dyeus-border bg-dyeus-white lg:overflow-visible">
                <div className="h-[60vh] min-h-[480px] max-h-[75vh] min-w-0">{viewerPanel}</div>

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
                    {level === "floor" && selectedFloor ? (
                        <DyeusPropertiesList
                            key={selectedFloor._id}
                            project={project}
                            floorId={selectedFloor._id}
                            floors={sortedFloors}
                            onClose={goBack}
                            hoveredUnitId={sidebarHighlightId}
                            selectedUnitId={selectedUnitId}
                            onUnitHover={setSidebarHoveredId}
                            onUnitSelect={setSelectedUnitId}
                            panelTitle={`${edificeName} / ${floorName}`}
                            className="dyeus-sheet-in h-full min-h-0"
                        />
                    ) : (
                        <DyeusViewerSidebar
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
                            t={t}
                        />
                    )}
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

export default DyeusResidencesPolygonViewer;

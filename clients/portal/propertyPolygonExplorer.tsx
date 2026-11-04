import {useEffect, useMemo, useRef, useState} from "react";
import {Link, useNavigate} from "react-router-dom";
import {ChevronLeft, Maximize2} from "lucide-react";
import {cn} from "@coreModule/components/lib/utils.ts";
import PolygonSelector from "@coreModule/components/customUnchecked/polygonSelector.tsx";
import {Dialog, DialogContent, DialogTitle} from "@coreModule/components/ui/dialog.tsx";
import {parseFloorLevel} from "@propertyManagementModule/clients/client/public/project/shared/parseFloorLevel.ts";
import {
    edificeFacts,
    edificePlace,
    floorFacts,
    floorLabel,
} from "./propertySelectionInfo.ts";
import type {
    MarketingEdificeCatalogListItem,
    MarketingFloorCatalogListItem,
    MarketingPolygonItem,
    MarketingProjectCatalogSingleItem,
    MarketingUnitCatalogListItem,
    MarketingUnitCatalogStatus,
} from "armonia/src/modules/propertyManagement/api/realEstate/public/marketingProjectCatalog/marketingProjectCatalogSingle.form.response.type.ts";

type ExplorerLevel = "project" | "edifice" | "floor";

type PropertyPolygonExplorerProps = {
    project: MarketingProjectCatalogSingleItem;
    unitTo: (unitId: string) => string;
    resolveLanguageKey: (key: string) => string;
    onSelectionChange?: (
        edifice: MarketingEdificeCatalogListItem | undefined,
        floor: MarketingFloorCatalogListItem | undefined,
    ) => void;
};

type PickItem = {
    id: string;
    label: string;
    meta?: string;
    status?: MarketingUnitCatalogStatus;
    href?: string;
};

const STATUS_CHIP: Record<MarketingUnitCatalogStatus, string> = {
    available: "text-success",
    reserved: "text-warning",
    sold: "text-destructive",
    unavailable: "text-muted-foreground",
};

function sortFloors(edifice: MarketingEdificeCatalogListItem | undefined) {
    return [...(edifice?.floors ?? [])].sort((a, b) => parseFloorLevel(b.levelNumber) - parseFloorLevel(a.levelNumber));
}

function unitMeta(unit: MarketingUnitCatalogListItem, resolveLanguageKey: (key: string) => string) {
    return [
        unit.areaSqm != null && `${unit.areaSqm} m²`,
        unit.bedrooms ? resolveLanguageKey("bedroomsCount").replace("{count}", String(unit.bedrooms)) : "",
    ].filter(Boolean).join(" · ");
}

/**
 * Site plan, building and floor in one card: hovering a chip lights the matching
 * polygon, hovering a polygon lights the chip, clicking drills in (or opens a unit).
 */
export default function PropertyPolygonExplorer({project, unitTo, resolveLanguageKey, onSelectionChange}: PropertyPolygonExplorerProps) {
    const navigate = useNavigate();
    const edifices = project.edifices ?? [];
    const [edificeId, setEdificeId] = useState(() => (edifices.length === 1 ? edifices[0]._id : ""));
    const [floorId, setFloorId] = useState("");
    const [mapHover, setMapHover] = useState<string | null>(null);
    const [listHover, setListHover] = useState<string | null>(null);
    const [magnified, setMagnified] = useState(false);
    const onSelectionChangeRef = useRef(onSelectionChange);
    onSelectionChangeRef.current = onSelectionChange;

    const edifice = edifices.find((entry) => entry._id === edificeId);
    const floors = useMemo(() => sortFloors(edifice), [edifice]);
    const floor = floors.find((entry) => entry._id === floorId);
    const level: ExplorerLevel = floor ? "floor" : edifice ? "edifice" : "project";

    useEffect(() => {
        setMapHover(null);
        setListHover(null);
    }, [level, edificeId, floorId]);

    useEffect(() => {
        onSelectionChangeRef.current?.(edifice, floor);
    }, [edifice, floor]);

    const polygons: MarketingPolygonItem[] =
        level === "project" ? project.edificesCoordinates ?? []
        : level === "edifice" ? edifice?.floorsCoordinates ?? []
        : floor?.unitsCoordinates ?? [];

    const image = (
        level === "floor" ? floor?.mainImage
        : level === "edifice" ? edifice?.mainImage || project.mainImage
        : project.mainImage
    ) || "";

    const picks: PickItem[] =
        level === "project" ? edifices.map((entry) => ({
            id: entry._id,
            label: entry.name || resolveLanguageKey("explorer.unnamedEdifice"),
            meta: entry.floors?.length
                ? resolveLanguageKey("explorer.floorsCount").replace("{count}", String(entry.floors.length))
                : undefined,
        }))
        : level === "edifice" ? floors.map((entry) => ({
            id: entry._id,
            label: floorLabel(entry, resolveLanguageKey),
            meta: entry.units?.length
                ? resolveLanguageKey("explorer.unitsCount").replace("{count}", String(entry.units.length))
                : undefined,
        }))
        : (floor?.units ?? []).map((unit) => ({
            id: unit._id,
            label: unit.name,
            meta: unitMeta(unit, resolveLanguageKey) || undefined,
            status: unit.status,
            href: unitTo(unit._id),
        }));

    if (!image && polygons.length === 0 && picks.length === 0) return null;

    const phantomIds = new Set(polygons.map((item) => item._id));
    const hovered =
        (listHover && phantomIds.has(listHover) && listHover)
        || (mapHover && phantomIds.has(mapHover) && mapHover)
        || "";
    const highlight = listHover ?? (mapHover && picks.some((pick) => pick.id === mapHover) ? mapHover : null);
    const canGoBack = level !== "project";
    const place = edifice && !floor ? edificePlace(edifice) : "";
    const selectedFacts = (floor ? floorFacts(floor, resolveLanguageKey) : edifice ? edificeFacts(edifice, resolveLanguageKey) : []).slice(0, 4);
    const selectedFlags = [
        floor?.isAccessible && resolveLanguageKey("accessible"),
        floor?.hasEmergencyExit && resolveLanguageKey("emergencyExit"),
    ].filter((flag): flag is string => Boolean(flag));
    const selectedBlurb = floor?.description;
    const showSummary = level !== "project" && Boolean(place || selectedFacts.length || selectedFlags.length || selectedBlurb);
    const showSide = picks.length > 0 || showSummary;
    const chooseLabel =
        level === "project" ? resolveLanguageKey("explorer.chooseEdifice")
        : level === "edifice" ? resolveLanguageKey("explorer.chooseFloor")
        : resolveLanguageKey("explorer.chooseUnit");

    const goBack = () => {
        if (level === "floor") {
            setFloorId("");
            return;
        }
        setEdificeId("");
        setFloorId("");
    };

    const choose = (id: string) => {
        if (level === "project") {
            setEdificeId(id);
            setFloorId("");
            return;
        }
        if (level === "edifice") setFloorId(id);
    };

    const onPolygonClick = (item: MarketingPolygonItem) => {
        if (level === "floor") {
            if ((floor?.units ?? []).some((unit) => unit._id === item._id)) navigate(unitTo(item._id));
            return;
        }
        choose(item._id);
    };

    const hoverProps = (id: string) => ({
        onMouseEnter: () => setListHover(id),
        onMouseLeave: () => setListHover(null),
        onFocus: () => setListHover(id),
        onBlur: () => setListHover(null),
    });

    const plan = (large: boolean) =>
        image && polygons.length > 0 ? (
            <PolygonSelector
                key={`${level}-${edificeId}-${floorId}-${large ? "lg" : "sm"}`}
                fillHeight
                dashboard
                borderless
                disabled
                hideControls={!large}
                wheelZooms={large}
                phantomsAlwaysVisible
                objectFit="contain"
                imageUrl={image}
                phantomPoints={polygons}
                phantomHoverContent={(item: {name: string}) => (
                    <div className="rounded-lg bg-popover px-3 py-1.5 text-sm font-medium text-popover-foreground shadow-md">
                        {item.name}
                    </div>
                )}
                onFloorClick={onPolygonClick}
                externalHoveredId={hovered}
                onPhantomHoverChange={setMapHover}
                initialPoints={[]}
                onPointsChange={() => {}}
            />
        ) : image ? (
            <img src={image} alt={project.name} className="size-full object-cover" />
        ) : (
            <div className="flex size-full items-center justify-center p-6 text-center text-sm text-muted-foreground">
                {resolveLanguageKey("explorer.noPlan")}
            </div>
        );

    const frame = (large: boolean) => (
        <div className={cn("overflow-hidden bg-card", large ? "flex h-full min-h-0 flex-col" : "rounded-3xl border")}>
            {canGoBack ? (
                <div className={cn("flex items-center gap-1 border-b px-3 py-2.5", large && "pr-12")}>
                    <button
                        type="button"
                        onClick={goBack}
                        className="flex size-8 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        aria-label={resolveLanguageKey("explorer.back")}
                    >
                        <ChevronLeft className="size-5" aria-hidden />
                    </button>
                    <nav className="flex min-w-0 items-center gap-1.5 text-sm font-medium" aria-label={resolveLanguageKey("explorer.back")}>
                        {edifice?.name ? (
                            level === "floor" ? (
                                <button type="button" onClick={goBack} className="truncate rounded-md px-1 py-0.5 hover:bg-muted">
                                    {edifice.name}
                                </button>
                            ) : (
                                <span className="truncate px-1 py-0.5">{edifice.name}</span>
                            )
                        ) : null}
                        {floor ? (
                            <>
                                <span className="text-muted-foreground" aria-hidden>/</span>
                                <span className="truncate px-1 py-0.5">{floorLabel(floor, resolveLanguageKey)}</span>
                            </>
                        ) : null}
                    </nav>
                </div>
            ) : null}

            <div
                className={cn(
                    "grid min-h-0",
                    large && "flex-1",
                    image && showSide && (large
                        ? "lg:grid-cols-[minmax(0,1.5fr)_minmax(16rem,20rem)]"
                        : "lg:grid-cols-[minmax(0,1.25fr)_minmax(13rem,0.75fr)]"),
                )}
            >
                {image ? (
                    <div className={cn("relative min-h-0 overflow-hidden bg-muted", large ? "min-h-[24rem] lg:h-full" : "aspect-[4/3] lg:aspect-auto lg:min-h-[28rem]")}>
                        <div className="absolute inset-0">{plan(large)}</div>
                        {!large ? (
                            <button
                                type="button"
                                onClick={() => setMagnified(true)}
                                className="absolute top-3 right-3 z-10 flex size-9 items-center justify-center rounded-full bg-background/90 text-foreground shadow-md ring-1 ring-border backdrop-blur-sm transition-colors hover:bg-background"
                                aria-label={resolveLanguageKey("explorer.magnify")}
                            >
                                <Maximize2 className="size-4" aria-hidden />
                            </button>
                        ) : null}
                    </div>
                ) : null}

                {showSide ? (
                    <div className="flex min-h-0 flex-col border-t lg:border-t-0 lg:border-l">
                        {showSummary ? (
                            <div className="shrink-0 border-b px-4 py-3">
                                {place ? <p className="text-xs leading-relaxed text-muted-foreground">{place}</p> : null}
                                {selectedFacts.length ? (
                                    <dl className={cn("grid grid-cols-2 gap-x-3 gap-y-2", place && "mt-2")}>
                                        {selectedFacts.map((fact) => (
                                            <div key={fact.label} className="min-w-0">
                                                <dt className="text-[11px] text-muted-foreground">{fact.label}</dt>
                                                <dd className="truncate text-sm font-medium tabular-nums">{fact.value}</dd>
                                            </div>
                                        ))}
                                    </dl>
                                ) : null}
                                {selectedFlags.length ? (
                                    <div className="mt-2 flex flex-wrap gap-1.5">
                                        {selectedFlags.map((flag) => (
                                            <span key={flag} className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium">
                                                {flag}
                                            </span>
                                        ))}
                                    </div>
                                ) : null}
                                {selectedBlurb ? (
                                    <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-muted-foreground">{selectedBlurb}</p>
                                ) : null}
                            </div>
                        ) : null}
                        {picks.length > 0 ? (
                            <>
                                <p className="shrink-0 px-4 pt-4 pb-2 text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">{chooseLabel}</p>
                                <ul
                                    className={cn("min-h-0 flex-1 overflow-y-auto px-2 pb-3", large ? "max-h-none" : "max-h-64 lg:max-h-[min(28rem,70vh)]")}
                                    aria-label={chooseLabel}
                                >
                                    {picks.map((pick) => {
                                        const active = highlight === pick.id;
                                        const meta = [pick.status && resolveLanguageKey(`status.${pick.status}`), pick.meta].filter(Boolean).join(" · ");
                                        const className = cn(
                                            "flex w-full flex-col rounded-xl px-3 py-2 text-left transition-colors",
                                            active ? "bg-foreground text-background" : "hover:bg-muted",
                                        );
                                        const row = (
                                            <>
                                                <span className="truncate text-sm font-medium">{pick.label}</span>
                                                {meta ? (
                                                    <span className={cn("truncate text-xs", active ? "text-background/80" : pick.status ? STATUS_CHIP[pick.status] : "text-muted-foreground")}>
                                                        {meta}
                                                    </span>
                                                ) : null}
                                            </>
                                        );
                                        return (
                                            <li key={pick.id}>
                                                {pick.href ? (
                                                    <Link to={pick.href} className={className} onClick={() => setMagnified(false)} {...hoverProps(pick.id)}>
                                                        {row}
                                                    </Link>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        className={className}
                                                        aria-pressed={active}
                                                        onClick={() => choose(pick.id)}
                                                        {...hoverProps(pick.id)}
                                                    >
                                                        {row}
                                                    </button>
                                                )}
                                            </li>
                                        );
                                    })}
                                </ul>
                            </>
                        ) : null}
                    </div>
                ) : null}
            </div>
        </div>
    );

    return (
        <>
            {frame(false)}
            <Dialog open={magnified} onOpenChange={setMagnified}>
                <DialogContent
                    className="flex h-[min(92dvh,56rem)] w-[min(96vw,88rem)] max-w-none flex-col gap-0 overflow-hidden p-0 sm:max-w-none"
                    onOpenAutoFocus={(event) => event.preventDefault()}
                >
                    <DialogTitle className="sr-only">{resolveLanguageKey("explorer.magnify")}</DialogTitle>
                    {frame(true)}
                </DialogContent>
            </Dialog>
        </>
    );
}

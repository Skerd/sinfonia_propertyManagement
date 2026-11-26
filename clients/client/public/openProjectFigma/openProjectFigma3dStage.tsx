import {useMemo, useState} from "react";
import {useSearchParams} from "react-router-dom";
import {motion} from "motion/react";
import {IconArrowRight} from "@tabler/icons-react";
import PolygonSelector from "@coreModule/components/customUnchecked/polygonSelector.tsx";
import {resolveMarketingMediaUrl} from "@propertyManagementModule/clients/client/public/shared/resolveMarketingMedia.ts";
import {resolveProjectFallbackImage} from "@propertyManagementModule/clients/client/public/project/shared/resolveProjectFallbackImage.ts";
import type {
    MarketingEdificeListItem,
    MarketingPolygonItem,
    MarketingProjectSingle,
} from "@propertyManagementModule/clients/client/public/shared/publicTypes.ts";

type OpenProjectFigma3dStageProps = {
    project: MarketingProjectSingle;
    resolveLanguageKey: (key: string) => string;
    phantomsAlwaysVisible: boolean;
};

function resolveImageUrl(url: string | undefined, project: MarketingProjectSingle): string {
    return resolveMarketingMediaUrl(url) ?? resolveProjectFallbackImage(project);
}

function findEdificeForFloor(
    edifices: MarketingEdificeListItem[],
    floorId: string,
): MarketingEdificeListItem | undefined {
    return edifices.find((edifice) => edifice.floors?.some((floor) => floor._id === floorId));
}

function OpenProjectFigma3dStage({
    project,
    resolveLanguageKey,
    phantomsAlwaysVisible,
}: OpenProjectFigma3dStageProps) {
    const [searchParams, setSearchParams] = useSearchParams();
    const [hoveredId, setHoveredId] = useState<string | null>(null);

    const edifices = useMemo(() => project.edifices ?? [], [project.edifices]);
    const selectedFloorId = searchParams.get("floorId") ?? "";

    const floorPolygons = useMemo(() => {
        const manyEdifices = edifices.length > 1;
        return edifices.flatMap((edifice) =>
            (edifice.floorsCoordinates ?? []).map((polygon) => ({
                ...polygon,
                name: manyEdifices ? `${edifice.name} · ${polygon.name}` : polygon.name,
            })),
        );
    }, [edifices]);

    const floorsCanvasEdifice = useMemo(() => {
        const withFloors = edifices.filter((edifice) => (edifice.floorsCoordinates ?? []).length > 0);
        return withFloors.length === 1 ? withFloors[0] : undefined;
    }, [edifices]);

    const availableByFloorId = useMemo(() => {
        const counts = new Map<string, number>();
        for (const edifice of edifices) {
            for (const floor of edifice.floors ?? []) {
                counts.set(floor._id, (floor.units ?? []).filter((unit) => unit.status === "available").length);
            }
        }
        return counts;
    }, [edifices]);

    const imageUrl = resolveImageUrl(floorsCanvasEdifice?.mainImage ?? project.mainImage, project);

    const setFloorSelection = (floorId: string) => {
        const params = new URLSearchParams(searchParams);
        params.set("projectId", project._id);
        const owner = findEdificeForFloor(edifices, floorId);
        if (owner) {
            params.set("edificeId", owner._id);
            params.set("floorId", floorId);
        } else {
            params.delete("edificeId");
            params.delete("floorId");
        }
        setSearchParams(params);
    };

    const renderHover = (item: MarketingPolygonItem) => {
        const available = availableByFloorId.get(item._id);
        return (
            <div className="animate-in fade-in zoom-in-95 slide-in-from-top-1 bg-white px-3 py-2 text-pronix-ink duration-200 motion-reduce:animate-none">
                <p className="font-aeonik-medium text-sm md:text-base">{item.name}</p>
                {available != null ? (
                    <p className="mt-0.5 flex items-center gap-1.5 font-aeonik-light text-xs text-pronix-ink-muted md:text-sm">
                        <span className={available > 0 ? "size-1.5 rounded-full bg-[#2f9d44]" : "size-1.5 rounded-full bg-[#6b7280]"} />
                        {resolveLanguageKey("floorAvailableCount").replace("{{count}}", String(available))}
                    </p>
                ) : null}
                <p className="mt-1 flex items-center gap-1 font-aeonik-light text-xs text-pronix-blue md:text-sm">
                    {resolveLanguageKey("floorOpenHint")}
                    <IconArrowRight className="size-3.5" strokeWidth={1.75} aria-hidden />
                </p>
            </div>
        );
    };

    if (floorPolygons.length === 0) {
        return (
            <div className="flex h-full w-full items-center justify-center">
                <p className="max-w-md px-6 text-center font-aeonik-light text-lg text-white/80">
                    {resolveLanguageKey("viewerEmptyEdifice")}
                </p>
            </div>
        );
    }

    return (
        <motion.div
            className="h-full min-h-0 w-full"
            initial={{opacity: 0, scale: 1.04}}
            animate={{opacity: 1, scale: 1}}
            transition={{duration: 1.1, ease: [0.22, 1, 0.36, 1]}}
        >
            <PolygonSelector
                fillHeight
                dashboard
                borderless
                disabled
                hideControls
                // `cover` cropped a tall render on wide screens and pushed the building out of view.
                objectFit="contain"
                phantomsAlwaysVisible={phantomsAlwaysVisible}
                imageUrl={imageUrl}
                phantomPoints={floorPolygons}
                phantomHoverContent={renderHover}
                onFloorClick={(item: {_id: string}) => setFloorSelection(item._id)}
                stayHovered={selectedFloorId || undefined}
                externalHoveredId={hoveredId ?? ""}
                onPhantomHoverChange={setHoveredId}
                initialPoints={[]}
                onPointsChange={() => {}}
            />
        </motion.div>
    );
}

export default OpenProjectFigma3dStage;

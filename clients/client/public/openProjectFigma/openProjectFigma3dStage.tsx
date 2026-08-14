import {useMemo, useState} from "react";
import {useSearchParams} from "react-router-dom";
import PolygonSelector from "@coreModule/components/custom/polygonSelector.tsx";
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

function OpenProjectFigma3dStage({project, resolveLanguageKey}: OpenProjectFigma3dStageProps) {
    const [searchParams, setSearchParams] = useSearchParams();
    const [hoveredId, setHoveredId] = useState<string | null>(null);

    const edifices = project.edifices ?? [];
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

    const renderHover = (item: MarketingPolygonItem) => (
        <div className="bg-white px-3 py-2 font-aeonik-medium text-sm text-pronix-ink md:text-base">{item.name}</div>
    );

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
        <div className="h-full min-h-0 w-full">
            <PolygonSelector
                fillHeight
                dashboard
                borderless
                disabled
                hideControls
                imageUrl={imageUrl}
                phantomPoints={floorPolygons}
                phantomHoverContent={renderHover}
                onFloorClick={(item) => setFloorSelection(item._id)}
                stayHovered={selectedFloorId || undefined}
                externalHoveredId={hoveredId ?? ""}
                onPhantomHoverChange={setHoveredId}
                initialPoints={[]}
                onPointsChange={() => {}}
            />
        </div>
    );
}

export default OpenProjectFigma3dStage;

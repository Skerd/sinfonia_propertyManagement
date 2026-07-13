import {useCallback, useMemo} from "react";
import {useSearchParams} from "react-router-dom";
import type {MarketingEdificeListItem, MarketingFloorListItem, MarketingProjectSingle} from "@propertyManagementModule/clients/client/public/shared/publicTypes.ts";
import {parseFloorLevel} from "@propertyManagementModule/clients/client/public/project/shared/parseFloorLevel.ts";

export type ProjectViewerLevel = "project" | "edifice" | "floor";

type UseProjectViewerStateOptions = {
    project: MarketingProjectSingle;
};

export function useProjectViewerState({project}: UseProjectViewerStateOptions) {
    const [searchParams, setSearchParams] = useSearchParams();

    const selectedEdificeId = searchParams.get("edificeId") ?? "";
    const selectedFloorId = searchParams.get("floorId") ?? "";

    const edifices = project.edifices ?? [];

    const level: ProjectViewerLevel = useMemo(() => {
        if (selectedFloorId && selectedEdificeId) {
            return "floor";
        }
        if (selectedEdificeId) {
            return "edifice";
        }
        return "project";
    }, [selectedEdificeId, selectedFloorId]);

    const selectedEdifice = useMemo(
        () => edifices.find((edifice) => edifice._id === selectedEdificeId),
        [edifices, selectedEdificeId],
    );

    const selectedFloor = useMemo(
        () => selectedEdifice?.floors?.find((floor) => floor._id === selectedFloorId),
        [selectedEdifice, selectedFloorId],
    );

    const sortedFloors = useMemo(() => {
        const floors = selectedEdifice?.floors ?? [];
        return [...floors].sort(
            (a, b) => parseFloorLevel(b.levelNumber) - parseFloorLevel(a.levelNumber),
        );
    }, [selectedEdifice]);

    const updateViewerParams = useCallback(
        (next: {edificeId?: string; floorId?: string}) => {
            const params = new URLSearchParams(searchParams);
            params.set("projectId", project._id);

            if ("edificeId" in next) {
                if (next.edificeId) {
                    params.set("edificeId", next.edificeId);
                } else {
                    params.delete("edificeId");
                }
            }

            if ("floorId" in next) {
                if (next.floorId) {
                    params.set("floorId", next.floorId);
                } else {
                    params.delete("floorId");
                }
            }

            setSearchParams(params);
        },
        [project._id, searchParams, setSearchParams],
    );

    const selectEdifice = useCallback(
        (edificeId: string) => {
            updateViewerParams({edificeId, floorId: ""});
        },
        [updateViewerParams],
    );

    const selectFloor = useCallback(
        (floorId: string) => {
            updateViewerParams({floorId});
        },
        [updateViewerParams],
    );

    const goBack = useCallback(() => {
        if (level === "floor") {
            updateViewerParams({floorId: ""});
            return;
        }
        if (level === "edifice") {
            updateViewerParams({edificeId: "", floorId: ""});
        }
    }, [level, updateViewerParams]);

    return {
        level,
        edifices,
        sortedFloors,
        selectedEdificeId,
        selectedFloorId,
        selectedEdifice,
        selectedFloor,
        selectEdifice,
        selectFloor,
        goBack,
        canGoBack: level !== "project",
    };
}

export function findEdifice(project: MarketingProjectSingle, edificeId: string): MarketingEdificeListItem | undefined {
    return project.edifices?.find((edifice) => edifice._id === edificeId);
}

export function findFloor(edifice: MarketingEdificeListItem | undefined, floorId: string): MarketingFloorListItem | undefined {
    return edifice?.floors?.find((floor) => floor._id === floorId);
}

import {createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode} from "react";
import useHttpRequest, {type HttpRequest} from "@coreModule/helpers/hooks/useHttpRequest.ts";
import {
    loadPublicFavorites,
    savePublicFavorites,
} from "@propertyManagementModule/clients/client/public/shared/favorites/publicFavoritesStorage.ts";
import {
    type PublicFavoriteProject,
    type PublicFavoritesState,
    type PublicFavoriteUnit,
} from "@propertyManagementModule/clients/client/public/shared/favorites/publicFavoritesTypes.ts";
import type {MarketingUnitSingle} from "@propertyManagementModule/clients/client/public/shared/publicTypes.ts";

const UNIT_REQUEST: HttpRequest = {method: "post", url: "/api/realEstate/marketingUnit/single"};

function favoriteUnitKey(unit: Pick<PublicFavoriteUnit, "projectId" | "unitId">): string {
    return `${unit.projectId}:${unit.unitId}`;
}

function unitNeedsLocationNames(unit: PublicFavoriteUnit): boolean {
    return !unit.projectName || !unit.edificeName;
}

type PublicFavoritesContextValue = {
    favorites: PublicFavoritesState;
    totalCount: number;
    panelOpen: boolean;
    openPanel: () => void;
    closePanel: () => void;
    isProjectFavorite: (projectId: string) => boolean;
    isUnitFavorite: (projectId: string, unitId: string) => boolean;
    toggleProjectFavorite: (project: PublicFavoriteProject) => void;
    toggleUnitFavorite: (unit: PublicFavoriteUnit) => void;
};

const PublicFavoritesContext = createContext<PublicFavoritesContextValue | null>(null);

function PublicFavoritesProvider({children}: {children: ReactNode}) {
    const [favorites, setFavorites] = useState<PublicFavoritesState>(() => loadPublicFavorites());
    const [panelOpen, setPanelOpen] = useState(false);

    useEffect(() => {
        savePublicFavorites(favorites);
    }, [favorites]);

    // While the panel is open, favourites saved without project/building names are filled in one
    // at a time; a unit is tried once per session, so one that cannot be resolved does not loop.
    const [attempted, setAttempted] = useState<ReadonlySet<string>>(() => new Set());
    const backfillTarget = panelOpen
        ? favorites.units.find((unit) => unitNeedsLocationNames(unit) && !attempted.has(favoriteUnitKey(unit)))
        : undefined;
    const backfillKey = backfillTarget ? favoriteUnitKey(backfillTarget) : "";
    const [backfillCount, setBackfillCount] = useState(0);
    useEffect(() => {
        if (backfillKey) setBackfillCount((count) => count + 1);
    }, [backfillKey]);
    const markAttempted = (key: string) => setAttempted((current) => new Set(current).add(key));
    useHttpRequest<{unit?: MarketingUnitSingle}>(
        UNIT_REQUEST,
        {projectId: backfillTarget?.projectId, unitId: backfillTarget?.unitId},
        backfillCount,
        true,
        {
            success: (data) => {
                if (!backfillTarget) return;
                markAttempted(backfillKey);
                const fetched = data?.unit;
                if (!fetched) return;
                setFavorites((current) => {
                    let changed = false;
                    const units = current.units.map((unit) => {
                        if (favoriteUnitKey(unit) !== backfillKey) return unit;
                        const projectName = unit.projectName || fetched.projectName;
                        const edificeName = unit.edificeName || fetched.edificeName;
                        if (projectName === unit.projectName && edificeName === unit.edificeName) return unit;
                        changed = true;
                        return {...unit, projectName, edificeName};
                    });
                    return changed ? {...current, units} : current;
                });
            },
            error: () => {
                if (backfillKey) markAttempted(backfillKey);
            },
        },
    );

    const totalCount = favorites.projects.length + favorites.units.length;

    const isProjectFavorite = useCallback(
        (projectId: string) => favorites.projects.some((project) => project._id === projectId),
        [favorites.projects],
    );

    const isUnitFavorite = useCallback(
        (projectId: string, unitId: string) =>
            favorites.units.some((unit) => unit.projectId === projectId && unit.unitId === unitId),
        [favorites.units],
    );

    const toggleProjectFavorite = useCallback((project: PublicFavoriteProject) => {
        setFavorites((current) => {
            const exists = current.projects.some((item) => item._id === project._id);
            if (exists) {
                return {
                    ...current,
                    projects: current.projects.filter((item) => item._id !== project._id),
                };
            }

            return {
                ...current,
                projects: [...current.projects, project],
            };
        });
    }, []);

    const toggleUnitFavorite = useCallback((unit: PublicFavoriteUnit) => {
        setFavorites((current) => {
            const exists = current.units.some(
                (item) => item.projectId === unit.projectId && item.unitId === unit.unitId,
            );
            if (exists) {
                return {
                    ...current,
                    units: current.units.filter(
                        (item) => !(item.projectId === unit.projectId && item.unitId === unit.unitId),
                    ),
                };
            }

            return {
                ...current,
                units: [...current.units, unit],
            };
        });
    }, []);

    const value = useMemo(
        () => ({
            favorites,
            totalCount,
            panelOpen,
            openPanel: () => setPanelOpen(true),
            closePanel: () => setPanelOpen(false),
            isProjectFavorite,
            isUnitFavorite,
            toggleProjectFavorite,
            toggleUnitFavorite,
        }),
        [
            favorites,
            totalCount,
            panelOpen,
            isProjectFavorite,
            isUnitFavorite,
            toggleProjectFavorite,
            toggleUnitFavorite,
        ],
    );

    return <PublicFavoritesContext.Provider value={value}>{children}</PublicFavoritesContext.Provider>;
}

function usePublicFavorites() {
    const context = useContext(PublicFavoritesContext);
    if (!context) {
        throw new Error("usePublicFavorites must be used within PublicFavoritesProvider");
    }
    return context;
}

export {PublicFavoritesProvider, usePublicFavorites};

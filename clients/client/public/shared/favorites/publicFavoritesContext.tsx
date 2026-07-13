import {createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode} from "react";
import {
    loadPublicFavorites,
    savePublicFavorites,
} from "@propertyManagementModule/clients/client/public/shared/favorites/publicFavoritesStorage.ts";
import {
    type PublicFavoriteProject,
    type PublicFavoritesState,
    type PublicFavoriteUnit,
} from "@propertyManagementModule/clients/client/public/shared/favorites/publicFavoritesTypes.ts";

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

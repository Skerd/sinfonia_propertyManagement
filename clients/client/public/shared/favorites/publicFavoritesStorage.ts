import {
    getLocalStorageValue,
    setLocalStorageValue,
} from "@coreModule/helpers/context/localStorage/localStorageProvider.ts";
import {
    createEmptyPublicFavoritesState,
    PUBLIC_FAVORITES_STORAGE_KEY,
    type PublicFavoriteProject,
    type PublicFavoritesState,
    type PublicFavoriteUnit,
} from "@propertyManagementModule/clients/client/public/shared/favorites/publicFavoritesTypes.ts";

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value != null;
}

function parseFavoriteProject(value: unknown): PublicFavoriteProject | null {
    if (!isRecord(value) || typeof value._id !== "string" || typeof value.name !== "string") {
        return null;
    }

    return {
        _id: value._id,
        name: value.name,
        location: typeof value.location === "string" ? value.location : undefined,
        mainImage: typeof value.mainImage === "string" ? value.mainImage : undefined,
        minSharePrice: typeof value.minSharePrice === "number" ? value.minSharePrice : undefined,
    };
}

function parseFavoriteUnit(value: unknown): PublicFavoriteUnit | null {
    if (
        !isRecord(value) ||
        typeof value.projectId !== "string" ||
        typeof value.unitId !== "string" ||
        typeof value.name !== "string"
    ) {
        return null;
    }

    return {
        projectId: value.projectId,
        unitId: value.unitId,
        name: value.name,
        projectName: typeof value.projectName === "string" ? value.projectName : undefined,
        edificeName: typeof value.edificeName === "string" ? value.edificeName : undefined,
        imageUrl: typeof value.imageUrl === "string" ? value.imageUrl : undefined,
        price: typeof value.price === "number" ? value.price : undefined,
        floorLabel: typeof value.floorLabel === "string" ? value.floorLabel : undefined,
    };
}

export function loadPublicFavorites(): PublicFavoritesState {
    const raw = getLocalStorageValue(PUBLIC_FAVORITES_STORAGE_KEY);
    if (!raw) {
        return createEmptyPublicFavoritesState();
    }

    try {
        const parsed = JSON.parse(raw) as unknown;
        if (!isRecord(parsed)) {
            return createEmptyPublicFavoritesState();
        }

        const projects = Array.isArray(parsed.projects)
            ? parsed.projects.map(parseFavoriteProject).filter((item): item is PublicFavoriteProject => item != null)
            : [];
        const units = Array.isArray(parsed.units)
            ? parsed.units.map(parseFavoriteUnit).filter((item): item is PublicFavoriteUnit => item != null)
            : [];

        return {projects, units};
    } catch {
        return createEmptyPublicFavoritesState();
    }
}

export function savePublicFavorites(state: PublicFavoritesState): void {
    setLocalStorageValue(PUBLIC_FAVORITES_STORAGE_KEY, JSON.stringify(state));
}

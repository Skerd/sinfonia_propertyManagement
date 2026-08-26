export const PUBLIC_FAVORITES_STORAGE_KEY = "pronix-public-favorites";

export type PublicFavoriteProject = {
    _id: string;
    name: string;
    location?: string;
    mainImage?: string;
    minSharePrice?: number;
};

export type PublicFavoriteUnit = {
    projectId: string;
    unitId: string;
    name: string;
    projectName?: string;
    edificeName?: string;
    imageUrl?: string;
    price?: number;
    floorLabel?: string;
};

export type PublicFavoritesState = {
    projects: PublicFavoriteProject[];
    units: PublicFavoriteUnit[];
};

export function createEmptyPublicFavoritesState(): PublicFavoritesState {
    return {projects: [], units: []};
}

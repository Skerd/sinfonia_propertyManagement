import {
    BedroomFilter,
    ProjectsPriceBounds,
    PropertyTypeId,
} from "@propertyManagementModule/clients/client/public/projects/shared/projectsFilterTypes.ts";

export type ProjectUnitsFilterState = {
    propertyType: PropertyTypeId | null;
    bedrooms: BedroomFilter;
    areaSqm: string;
    priceMin: number;
    priceMax: number;
};

export type ProjectUnitsSortKey =
    | "default"
    | "priceAsc"
    | "priceDesc"
    | "areaAsc"
    | "areaDesc"
    | "roomsAsc"
    | "nameAsc";

export const PROJECT_UNITS_SORT_KEYS: ProjectUnitsSortKey[] = [
    "default",
    "priceAsc",
    "priceDesc",
    "areaAsc",
    "areaDesc",
    "roomsAsc",
    "nameAsc",
];

export function createDefaultUnitFilters(bounds: ProjectsPriceBounds): ProjectUnitsFilterState {
    return {
        propertyType: null,
        bedrooms: "any",
        areaSqm: "",
        priceMin: bounds.min,
        priceMax: bounds.max,
    };
}

export function hasActiveUnitFilters(filters: ProjectUnitsFilterState, bounds: ProjectsPriceBounds): boolean {
    return (
        filters.propertyType != null ||
        filters.bedrooms !== "any" ||
        filters.areaSqm.trim() !== "" ||
        filters.priceMin > bounds.min ||
        filters.priceMax < bounds.max
    );
}

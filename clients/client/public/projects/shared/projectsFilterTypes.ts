export type PropertyTypeId = "apartment" | "studio" | "penthouse" | "commercial" | "villa";

export type BedroomFilter = "any" | "1" | "2" | "3" | "4" | "5" | "6+";

export type ProjectsPriceBounds = {
    min: number;
    max: number;
};

export type ProjectsFilterState = {
    projectId: string;
    city: string;
    propertyType: PropertyTypeId | null;
    bedrooms: BedroomFilter;
    areaSqm: string;
    priceMin: number;
    priceMax: number;
};

export const PROPERTY_TYPE_IDS: PropertyTypeId[] = ["apartment", "studio", "penthouse", "commercial", "villa"];

export const BEDROOM_FILTERS: BedroomFilter[] = ["any", "1", "2", "3", "4", "5", "6+"];

export function createDefaultFilters(bounds: ProjectsPriceBounds): ProjectsFilterState {
    return {
        projectId: "any",
        city: "any",
        propertyType: null,
        bedrooms: "any",
        areaSqm: "",
        priceMin: bounds.min,
        priceMax: bounds.max,
    };
}

export function hasActiveFunctionalFilters(filters: ProjectsFilterState, bounds: ProjectsPriceBounds): boolean {
    return (
        filters.projectId !== "any" ||
        filters.city !== "any" ||
        filters.propertyType != null ||
        filters.bedrooms !== "any" ||
        filters.areaSqm.trim() !== "" ||
        filters.priceMin > bounds.min ||
        filters.priceMax < bounds.max
    );
}

import {ProjectsFilterState} from "@propertyManagementModule/clients/client/public/projects/shared/projectsFilterTypes.ts";

/** Builds POST body for server-side catalog filtering. */
export function buildCatalogFilterRequest(filters: ProjectsFilterState): Record<string, unknown> {
    const payload: Record<string, unknown> = {};

    if (filters.projectId !== "any") {
        payload.projectId = filters.projectId;
    }
    if (filters.city !== "any") {
        payload.city = filters.city;
    }
    if (filters.propertyType) {
        payload.propertyType = filters.propertyType;
    }
    if (filters.bedrooms !== "any") {
        payload.bedrooms = filters.bedrooms;
    }
    const areaSqmMin = Number(filters.areaSqm.trim());
    if (filters.areaSqm.trim() && Number.isFinite(areaSqmMin) && areaSqmMin > 0) {
        payload.areaSqmMin = areaSqmMin;
    }
    payload.priceMin = filters.priceMin;
    payload.priceMax = filters.priceMax;

    return payload;
}

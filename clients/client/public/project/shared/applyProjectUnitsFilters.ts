import {
    BedroomFilter,
    ProjectsPriceBounds,
} from "@propertyManagementModule/clients/client/public/projects/shared/projectsFilterTypes.ts";
import {PropertyListingCardUnit} from "@propertyManagementModule/clients/client/public/project/shared/propertyListingCard.tsx";
import {
    ProjectUnitsFilterState,
    ProjectUnitsSortKey,
} from "@propertyManagementModule/clients/client/public/project/shared/projectUnitsFilterTypes.ts";

function matchesBedrooms(unitBedrooms: number | undefined, filter: BedroomFilter): boolean {
    if (filter === "any") {
        return true;
    }
    if (unitBedrooms == null) {
        return false;
    }
    if (filter === "6+") {
        return unitBedrooms >= 6;
    }
    return unitBedrooms === Number(filter);
}

function hasActivePriceFilter(filters: ProjectUnitsFilterState, bounds: ProjectsPriceBounds): boolean {
    return filters.priceMin > bounds.min || filters.priceMax < bounds.max;
}

export function deriveUnitPriceBounds(units: PropertyListingCardUnit[]): ProjectsPriceBounds {
    const prices = units.map((unit) => unit.price).filter((price): price is number => price != null && price > 0);
    if (prices.length === 0) {
        return {min: 0, max: 0};
    }
    return {min: Math.min(...prices), max: Math.max(...prices)};
}

export function filterCatalogUnits(
    units: PropertyListingCardUnit[],
    filters: ProjectUnitsFilterState,
    bounds: ProjectsPriceBounds,
): PropertyListingCardUnit[] {
    return units.filter((unit) => {
        if (filters.propertyType && unit.propertyType !== filters.propertyType) {
            return false;
        }
        if (!matchesBedrooms(unit.bedrooms, filters.bedrooms)) {
            return false;
        }
        const areaMin = Number(filters.areaSqm.trim());
        if (filters.areaSqm.trim() && Number.isFinite(areaMin) && areaMin > 0) {
            if ((unit.areaSqm ?? 0) < areaMin) {
                return false;
            }
        }
        if (hasActivePriceFilter(filters, bounds)) {
            if (unit.price == null) {
                return false;
            }
            if (unit.price < filters.priceMin || unit.price > filters.priceMax) {
                return false;
            }
        }
        return true;
    });
}

function compareNullableNumbers(a: number | undefined, b: number | undefined, direction: 1 | -1): number {
    if (a == null && b == null) {
        return 0;
    }
    if (a == null) {
        return 1;
    }
    if (b == null) {
        return -1;
    }
    return (a - b) * direction;
}

export function sortCatalogUnits(units: PropertyListingCardUnit[], sortKey: ProjectUnitsSortKey): PropertyListingCardUnit[] {
    if (sortKey === "default") {
        return units;
    }

    const sorted = [...units];
    sorted.sort((a, b) => {
        switch (sortKey) {
            case "priceAsc":
                return compareNullableNumbers(a.price, b.price, 1);
            case "priceDesc":
                return compareNullableNumbers(a.price, b.price, -1);
            case "areaAsc":
                return compareNullableNumbers(a.areaSqm, b.areaSqm, 1);
            case "areaDesc":
                return compareNullableNumbers(a.areaSqm, b.areaSqm, -1);
            case "roomsAsc":
                return compareNullableNumbers(a.bedrooms, b.bedrooms, 1);
            case "nameAsc":
                return a.name.localeCompare(b.name, undefined, {numeric: true, sensitivity: "base"});
            default:
                return 0;
        }
    });
    return sorted;
}

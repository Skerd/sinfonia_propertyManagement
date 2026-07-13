import {MarketingProject} from "@propertyManagementModule/clients/client/public/shared/publicTypes.ts";
import {ProjectsPriceBounds} from "@propertyManagementModule/clients/client/public/projects/shared/projectsFilterTypes.ts";

export function parseCityFromLocation(location?: string): string | undefined {
    if (!location) {
        return undefined;
    }
    const parts = location
        .split(",")
        .map((part) => part.trim())
        .filter(Boolean);
    return parts[parts.length - 1] ?? parts[0];
}

export function derivePriceBounds(projects: MarketingProject[]): ProjectsPriceBounds {
    const prices = projects
        .map((project) => project.minSharePrice)
        .filter((price): price is number => price != null && price > 0);

    if (prices.length === 0) {
        return {min: 0, max: 1_000_000};
    }

    const min = Math.min(...prices);
    const max = Math.max(...prices);
    return {min, max: max <= min ? min + 1 : max};
}

export function deriveProjectOptions(projects: MarketingProject[]) {
    return projects.map((project) => ({id: project._id, name: project.name}));
}

export function deriveCityOptions(projects: MarketingProject[]) {
    const cities = new Set<string>();
    for (const project of projects) {
        const city = parseCityFromLocation(project.location);
        if (city) {
            cities.add(city);
        }
    }
    return Array.from(cities).sort((a, b) => a.localeCompare(b));
}

import type {PropertyTypeId} from "@propertyManagementModule/clients/client/public/shared/publicTypes.ts";
import type {MarketingFeaturedProject} from "@propertyManagementModule/clients/client/public/shared/publicTypes.ts";
import {resolveMarketingMediaUrl} from "@propertyManagementModule/clients/client/public/shared/resolveMarketingMedia.ts";
import {projectsAssets} from "@propertyManagementModule/clients/client/public/projects/projectsAssets.ts";

export type FeaturedSlide = {
    id: number;
    projectId: string;
    image: string;
    title: string;
    location: string;
    type: string;
};

export type FeaturedTypeLabels = Record<PropertyTypeId | "project" | "locationFallback", string>;

const DEFAULT_TYPE_LABELS: FeaturedTypeLabels = {
    apartment: "Apartment",
    studio: "Studio",
    penthouse: "Penthouse",
    commercial: "Commercial",
    villa: "Villa",
    project: "Project",
    locationFallback: "Albania",
};

function propertyTypeLabel(types: PropertyTypeId[] | undefined, labels: FeaturedTypeLabels): string {
    const first = types?.[0];
    if (!first) {
        return labels.project;
    }
    return labels[first] ?? labels.project;
}

export function mapFeaturedProjectsToSlides(
    projects: MarketingFeaturedProject[],
    labels: FeaturedTypeLabels = DEFAULT_TYPE_LABELS,
): FeaturedSlide[] {
    return projects.map((project, index) => {
        const image =
            resolveMarketingMediaUrl(project.mainImage) ?? projectsAssets.cardPlaceholder;
        return {
            id: index,
            projectId: project._id,
            image,
            title: project.name,
            location: project.city || project.location || labels.locationFallback,
            type: propertyTypeLabel(project.propertyTypes, labels),
        };
    });
}

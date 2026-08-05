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

export const FEATURED_SECTION_COPY =
    "Explore our collection of premium properties — apartments, villas and commercial spaces in the best locations.";

const PROPERTY_TYPE_LABELS: Record<PropertyTypeId, string> = {
    apartment: "Apartment",
    studio: "Studio",
    penthouse: "Penthouse",
    commercial: "Commercial",
    villa: "Villa",
};

function propertyTypeLabel(types: PropertyTypeId[] | undefined): string {
    const first = types?.[0];
    if (!first) {
        return "Project";
    }
    return PROPERTY_TYPE_LABELS[first] ?? "Project";
}

export function mapFeaturedProjectsToSlides(projects: MarketingFeaturedProject[]): FeaturedSlide[] {
    return projects.map((project, index) => {
        const image =
            resolveMarketingMediaUrl(project.mainImage) ?? projectsAssets.cardPlaceholder;
        return {
            id: index,
            projectId: project._id,
            image,
            title: project.name,
            location: project.city || project.location || "Albania",
            type: propertyTypeLabel(project.propertyTypes),
        };
    });
}

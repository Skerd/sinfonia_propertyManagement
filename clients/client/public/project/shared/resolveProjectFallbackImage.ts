import {resolveMarketingMediaUrl} from "@propertyManagementModule/clients/client/public/shared/resolveMarketingMedia.ts";
import {projectsAssets} from "@propertyManagementModule/clients/client/public/projects/projectsAssets.ts";
import type {
    MarketingProject,
    MarketingProjectSingle,
} from "@propertyManagementModule/clients/client/public/shared/publicTypes.ts";

export function resolveProjectFallbackImage(project: MarketingProjectSingle): string {
    const candidates = [
        project.mainImage,
        ...(project.imageGallery ?? []),
        project.floorPlans?.[0]?.url,
    ];

    for (const candidate of candidates) {
        const resolved = resolveMarketingMediaUrl(candidate);
        if (resolved) {
            return resolved;
        }
    }

    return projectsAssets.cardPlaceholder;
}

export function resolveProjectCardImages(project: MarketingProject): string[] {
    const seen = new Set<string>();
    const images: string[] = [];

    for (const candidate of [project.mainImage, ...(project.imageGallery ?? [])]) {
        if (!candidate || seen.has(candidate)) {
            continue;
        }
        seen.add(candidate);
        const resolved = resolveMarketingMediaUrl(candidate);
        if (resolved) {
            images.push(resolved);
        }
    }

    if (images.length > 0) {
        return images;
    }

    return [projectsAssets.cardPlaceholder];
}

export function resolveProjectGalleryImages(project: MarketingProjectSingle): string[] {
    const images = [project.mainImage, ...(project.imageGallery ?? [])]
        .map((url) => resolveMarketingMediaUrl(url))
        .filter(Boolean) as string[];

    if (images.length > 0) {
        return images;
    }

    const fallback = resolveProjectFallbackImage(project);
    return fallback ? [fallback] : [projectsAssets.cardPlaceholder];
}

import {ProjectsPriceBounds} from "@propertyManagementModule/clients/client/public/projects/shared/projectsFilterTypes.ts";

const DEFAULT_BUCKET_COUNT = 16;

export function computePriceHistogram(
    prices: number[],
    bounds: ProjectsPriceBounds,
    bucketCount = DEFAULT_BUCKET_COUNT,
): number[] {
    const buckets = Array.from({length: bucketCount}, () => 0);

    if (bounds.max <= bounds.min || prices.length === 0) {
        return buckets;
    }

    const span = bounds.max - bounds.min;

    for (const price of prices) {
        if (!Number.isFinite(price)) {
            continue;
        }

        const clamped = Math.min(bounds.max, Math.max(bounds.min, price));
        const ratio = (clamped - bounds.min) / span;
        const index = Math.min(bucketCount - 1, Math.max(0, Math.floor(ratio * bucketCount)));
        buckets[index] += 1;
    }

    const peak = Math.max(...buckets, 1);
    return buckets.map((count) => count / peak);
}

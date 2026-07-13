export const SHARE_ROI_DEFAULTS = {
    shareAmount: 5000,
    monthlyYield: 400,
    holdingPeriod: 4,
    annualAppreciation: 6,
    occupancyRate: 100,
} as const;

export const SHARE_SLIDER_BOUNDS = {
    shareAmount: {min: 1000, max: 100_000, step: 500},
    monthlyYield: {min: 100, max: 2000, step: 50},
    holdingPeriod: {min: 1, max: 15, step: 1},
    annualAppreciation: {min: 0, max: 15, step: 0.5},
} as const;

export const UNIT_ROI_DEFAULTS = {
    occupancyRate: 85,
    holdingPeriod: 5,
    annualAppreciation: 5,
    rentalType: "long-term" as const,
} as const;

export const UNIT_SLIDER_BOUNDS = {
    occupancyRate: {min: 50, max: 98, step: 1},
    holdingPeriod: {min: 1, max: 15, step: 1},
    annualAppreciation: {min: 0, max: 15, step: 0.5},
} as const;

export function monthlyRentSliderBounds(estimatedRent: number) {
    if (estimatedRent <= 0) {
        return {min: 100, max: 5000, step: 50};
    }

    return {
        min: Math.round(estimatedRent * 0.5),
        max: Math.round(estimatedRent * 2),
        step: 50,
    };
}

export const PROFIT_TAX_RATE = 0.15;
export const SHORT_TERM_RENT_PER_SQM = 18;
export const LONG_TERM_RENT_PER_SQM = 10;

export type RentalType = "short-term" | "long-term";

export type RoiCalculationInput = {
    principal: number;
    monthlyRent: number;
    occupancyRate: number;
    holdingPeriod: number;
    annualAppreciation: number;
};

export type RoiCalculationResult = {
    annualGross: number;
    annualNet: number;
    monthlyNet: number;
    roi: number;
    payback: number;
    futureValue: number;
    capitalGain: number;
    totalReturn: number;
    totalReturnPct: number;
};

export function estimateMonthlyRent({
    unitArea,
    rentalType,
}: {
    unitPrice: number;
    unitArea: number;
    rentalType: RentalType;
}) {
    if (unitArea <= 0) {
        return 0;
    }

    if (rentalType === "short-term") {
        return Math.round(unitArea * SHORT_TERM_RENT_PER_SQM);
    }

    return Math.round(unitArea * LONG_TERM_RENT_PER_SQM);
}

export function calculateRoi({
    principal,
    monthlyRent,
    occupancyRate,
    holdingPeriod,
    annualAppreciation,
}: RoiCalculationInput): RoiCalculationResult {
    if (principal <= 0) {
        return {
            annualGross: 0,
            annualNet: 0,
            monthlyNet: 0,
            roi: 0,
            payback: Infinity,
            futureValue: 0,
            capitalGain: 0,
            totalReturn: 0,
            totalReturnPct: 0,
        };
    }

    const annualGross = monthlyRent * 12 * (occupancyRate / 100);
    const profitTax = annualGross * PROFIT_TAX_RATE;
    const annualNet = annualGross - profitTax;
    const monthlyNet = annualNet / 12;
    const roi = (annualNet / principal) * 100;
    const payback = annualNet > 0 ? principal / annualNet : Infinity;
    const futureValue = principal * Math.pow(1 + annualAppreciation / 100, holdingPeriod);
    const capitalGain = futureValue - principal;
    const totalReturn = capitalGain + annualNet * holdingPeriod;
    const totalReturnPct = (totalReturn / principal) * 100;

    return {
        annualGross,
        annualNet,
        monthlyNet,
        roi,
        payback,
        futureValue,
        capitalGain,
        totalReturn,
        totalReturnPct,
    };
}

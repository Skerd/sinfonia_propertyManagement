import {useMemo, useState} from "react";
import {
    calculateRoi,
    type RoiCalculationResult,
} from "@propertyManagementModule/clients/client/public/shared/roi/calculateRoi.ts";
import {
    SHARE_ROI_DEFAULTS,
    SHARE_SLIDER_BOUNDS,
} from "@propertyManagementModule/clients/client/public/shared/roi/roiDefaults.ts";

export type ShareRoiInputs = {
    shareAmount: number;
    monthlyYield: number;
    holdingPeriod: number;
    annualAppreciation: number;
};

export function useShareRoiCalculator(initial?: Partial<ShareRoiInputs>) {
    const [shareAmount, setShareAmount] = useState(initial?.shareAmount ?? SHARE_ROI_DEFAULTS.shareAmount);
    const [monthlyYield, setMonthlyYield] = useState(initial?.monthlyYield ?? SHARE_ROI_DEFAULTS.monthlyYield);
    const [holdingPeriod, setHoldingPeriod] = useState(initial?.holdingPeriod ?? SHARE_ROI_DEFAULTS.holdingPeriod);
    const [annualAppreciation, setAnnualAppreciation] = useState(
        initial?.annualAppreciation ?? SHARE_ROI_DEFAULTS.annualAppreciation,
    );

    const results: RoiCalculationResult = useMemo(
        () =>
            calculateRoi({
                principal: shareAmount,
                monthlyRent: monthlyYield,
                occupancyRate: SHARE_ROI_DEFAULTS.occupancyRate,
                holdingPeriod,
                annualAppreciation,
            }),
        [annualAppreciation, holdingPeriod, monthlyYield, shareAmount],
    );

    const inputs: ShareRoiInputs = {
        shareAmount,
        monthlyYield,
        holdingPeriod,
        annualAppreciation,
    };

    function setInput<K extends keyof ShareRoiInputs>(key: K, value: ShareRoiInputs[K]) {
        switch (key) {
            case "shareAmount":
                setShareAmount(value as number);
                break;
            case "monthlyYield":
                setMonthlyYield(value as number);
                break;
            case "holdingPeriod":
                setHoldingPeriod(value as number);
                break;
            case "annualAppreciation":
                setAnnualAppreciation(value as number);
                break;
        }
    }

    return {
        inputs,
        setInput,
        results,
        sliderBounds: SHARE_SLIDER_BOUNDS,
    };
}

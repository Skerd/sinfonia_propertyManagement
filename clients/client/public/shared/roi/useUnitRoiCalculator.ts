import {useEffect, useMemo, useState} from "react";
import {
    calculateRoi,
    estimateMonthlyRent,
    type RentalType,
    type RoiCalculationResult,
} from "@propertyManagementModule/clients/client/public/shared/roi/calculateRoi.ts";
import {
    monthlyRentSliderBounds,
    UNIT_ROI_DEFAULTS,
    UNIT_SLIDER_BOUNDS,
} from "@propertyManagementModule/clients/client/public/shared/roi/roiDefaults.ts";

export type UnitRoiInputs = {
    rentalType: RentalType;
    monthlyRent: number;
    occupancyRate: number;
    holdingPeriod: number;
    annualAppreciation: number;
};

type UseUnitRoiCalculatorArgs = {
    unitPrice: number;
    unitArea: number;
};

export function useUnitRoiCalculator({unitPrice, unitArea}: UseUnitRoiCalculatorArgs) {
    const [rentalType, setRentalType] = useState<RentalType>(UNIT_ROI_DEFAULTS.rentalType);
    const [occupancyRate, setOccupancyRate] = useState(UNIT_ROI_DEFAULTS.occupancyRate);
    const [holdingPeriod, setHoldingPeriod] = useState(UNIT_ROI_DEFAULTS.holdingPeriod);
    const [annualAppreciation, setAnnualAppreciation] = useState(UNIT_ROI_DEFAULTS.annualAppreciation);

    const estimatedRent = useMemo(
        () => estimateMonthlyRent({unitPrice, unitArea, rentalType}),
        [unitArea, unitPrice, rentalType],
    );

    const [monthlyRent, setMonthlyRent] = useState(estimatedRent);

    useEffect(() => {
        setMonthlyRent(estimatedRent);
    }, [estimatedRent]);

    const monthlyRentBounds = useMemo(() => monthlyRentSliderBounds(estimatedRent), [estimatedRent]);

    const results: RoiCalculationResult = useMemo(
        () =>
            calculateRoi({
                principal: unitPrice,
                monthlyRent,
                occupancyRate,
                holdingPeriod,
                annualAppreciation,
            }),
        [annualAppreciation, holdingPeriod, monthlyRent, occupancyRate, unitPrice],
    );

    const inputs: UnitRoiInputs = {
        rentalType,
        monthlyRent,
        occupancyRate,
        holdingPeriod,
        annualAppreciation,
    };

    function setInput<K extends keyof UnitRoiInputs>(key: K, value: UnitRoiInputs[K]) {
        switch (key) {
            case "rentalType":
                setRentalType(value as RentalType);
                break;
            case "monthlyRent":
                setMonthlyRent(value as number);
                break;
            case "occupancyRate":
                setOccupancyRate(value as number);
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
        estimatedRent,
        sliderBounds: {
            monthlyRent: monthlyRentBounds,
            occupancyRate: UNIT_SLIDER_BOUNDS.occupancyRate,
            holdingPeriod: UNIT_SLIDER_BOUNDS.holdingPeriod,
            annualAppreciation: UNIT_SLIDER_BOUNDS.annualAppreciation,
        },
    };
}

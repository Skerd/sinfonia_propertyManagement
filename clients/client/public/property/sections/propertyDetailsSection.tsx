import {propertyAssets} from "@propertyManagementModule/clients/client/public/property/propertyAssets.ts";
import {PublicLanguageProps, MarketingUnitSingle} from "@propertyManagementModule/clients/client/public/shared/publicTypes.ts";
import {
    PUBLIC_BODY,
    PUBLIC_HEADING,
    PUBLIC_TITLE,
} from "@propertyManagementModule/clients/client/public/shared/layout/publicLayoutTokens.ts";
import {formatEuro, formatPercent, formatYearsShort} from "@propertyManagementModule/clients/client/public/shared/roi/formatRoiValue.ts";
import RoiFigmaSlider from "@propertyManagementModule/clients/client/public/shared/roi/roiFigmaSlider.tsx";
import RoiProfitPanel from "@propertyManagementModule/clients/client/public/shared/roi/roiProfitPanel.tsx";
import RoiRentalTypeSelect from "@propertyManagementModule/clients/client/public/shared/roi/roiRentalTypeSelect.tsx";
import {useUnitRoiCalculator} from "@propertyManagementModule/clients/client/public/shared/roi/useUnitRoiCalculator.ts";

type PropertyDetailsSectionProps = PublicLanguageProps & {
    unit: MarketingUnitSingle;
};

const MISSING_VALUE = "—";

const AREA_PRICING_ROWS = [
    {labelKey: "area", getValue: (unit: MarketingUnitSingle) => formatAreaSqm(unit.grossAreaSqm)},
    {labelKey: "sharedArea", getValue: (unit: MarketingUnitSingle) => formatAreaSqm(unit.sharedAreaSqm)},
    {labelKey: "netArea", getValue: (unit: MarketingUnitSingle) => formatAreaSqm(unit.netAreaSqm ?? unit.areaSqm)},
    {labelKey: "price", getValue: (unit: MarketingUnitSingle, onRequest: string) => formatUnitPrice(unit, onRequest)},
    {labelKey: "rooms", getValue: (unit: MarketingUnitSingle) => formatCount(unit.bedrooms)},
    {labelKey: "baths", getValue: (unit: MarketingUnitSingle) => formatCount(unit.bathrooms)},
    {labelKey: "averagePricePerSquareMeter", getValue: (unit: MarketingUnitSingle) => formatPricePerSqm(unit.averagePricePerSquareMeter)},
] as const;

const FEATURE_ROWS = [
    {labelKey: "hasBalcony", field: "hasBalcony"},
    {labelKey: "hasTerrace", field: "hasTerrace"},
    {labelKey: "hasSeaView", field: "hasSeaView"},
    {labelKey: "hasCityView", field: "hasCityView"},
    {labelKey: "hasLakeView", field: "hasLakeView"},
    {labelKey: "hasElevator", field: "hasElevator"},
] as const;

function formatAreaSqm(value?: number) {
    return value != null ? `${value} m²` : MISSING_VALUE;
}

function formatCount(value?: number) {
    return value != null ? String(value) : MISSING_VALUE;
}

function formatUnitPrice(unit: MarketingUnitSingle, onRequest: string) {
    if (unit.price == null) {
        return onRequest;
    }
    const symbol = unit.priceCurrency?.symbol ?? unit.priceCurrency?.abbreviation ?? "€";
    return `${symbol}${unit.price.toLocaleString()}`;
}

function formatPricePerSqm(
    pricePerSqm?: MarketingUnitSingle["averagePricePerSquareMeter"],
) {
    if (pricePerSqm?.value == null) {
        return MISSING_VALUE;
    }
    const symbol = pricePerSqm.currency?.symbol ?? pricePerSqm.currency?.abbreviation ?? "€";
    const formatted = pricePerSqm.value.toLocaleString(undefined, {maximumFractionDigits: 3});
    return `${symbol}${formatted}/m²`;
}

function DetailRow({label, value}: {label: string; value: string}) {
    return (
        <div className="flex items-center justify-between border-b border-pronix-border px-3 py-3">
            <span className="font-aeonik-light text-base text-pronix-ink not-italic md:text-xl lg:text-2xl">
                {label}
            </span>
            <span className="font-aeonik-light text-base text-pronix-ink not-italic md:text-xl lg:text-2xl">
                {value}
            </span>
        </div>
    );
}

function PropertyDetailsSection({resolveLanguageKey, unit}: PropertyDetailsSectionProps) {
    const unitPrice = unit.price ?? unit.sharePrice ?? 0;
    const unitArea = unit.netAreaSqm ?? unit.areaSqm ?? 1;

    const {inputs, setInput, results, sliderBounds} = useUnitRoiCalculator({
        unitPrice,
        unitArea,
    });

    const profitRows = [
        {label: resolveLanguageKey("annualGross"), value: formatEuro(results.annualGross), bordered: true},
        {label: resolveLanguageKey("annualNet"), value: formatEuro(results.annualNet), bordered: true},
        {
            label: `${resolveLanguageKey("capitalGain")} (${Math.round(inputs.holdingPeriod)} yr):`,
            value: formatEuro(results.capitalGain),
            bordered: true,
        },
        {label: resolveLanguageKey("monthlyNet"), value: formatEuro(results.monthlyNet), bordered: false},
    ];

    return (
        <div className="relative w-full max-w-5xl" data-node-id="515:6131">
            <div data-node-id="515:6252">
                <h1 className={`${PUBLIC_TITLE} leading-[1.1]`} data-node-id="515:6118">
                    {unit.name}
                </h1>
                <p className={`mt-6 ${PUBLIC_BODY}`} data-node-id="515:6129">
                    {unit.description ?? MISSING_VALUE}
                </p>
            </div>

            <div className="mt-8 w-full" data-node-id="515:6223">
                <h2 className={PUBLIC_HEADING} data-node-id="515:6175">
                    {resolveLanguageKey("areaAndPricing")}
                </h2>
                <div className="mt-3 border-t border-pronix-border" data-node-id="515:6218">
                    {AREA_PRICING_ROWS.map((row) => (
                        <DetailRow
                            key={row.labelKey}
                            label={resolveLanguageKey(row.labelKey)}
                            value={
                                row.labelKey === "price"
                                    ? row.getValue(unit, resolveLanguageKey("priceOnRequest"))
                                    : row.getValue(unit)
                            }
                        />
                    ))}
                </div>
            </div>

            <div className="mt-8 w-full">
                <h2 className={PUBLIC_HEADING}>
                    {resolveLanguageKey("features")}
                </h2>
                <div className="mt-3 border-t border-pronix-border">
                    {FEATURE_ROWS.map((row) => {
                        const value = unit[row.field];
                        const display =
                            value === true
                                ? resolveLanguageKey("yes")
                                : value === false
                                    ? resolveLanguageKey("no")
                                    : MISSING_VALUE;
                        return (
                            <DetailRow
                                key={row.labelKey}
                                label={resolveLanguageKey(row.labelKey)}
                                value={display}
                            />
                        );
                    })}
                </div>
            </div>

            <div
                className="relative mt-8 grid w-full grid-cols-1 overflow-hidden rounded-[5px] border border-pronix-border lg:grid-cols-2"
                data-node-id="520:6254"
            >
                <div className="bg-white p-6 md:p-8" data-node-id="520:6277">
                    <p className={`text-center ${PUBLIC_HEADING}`} data-node-id="520:6279">
                        {resolveLanguageKey("roiTitle")}
                    </p>
                    <div className="mx-auto mt-6 flex max-w-md flex-col gap-6">
                        <RoiRentalTypeSelect
                            label={resolveLanguageKey("rentalType")}
                            value={inputs.rentalType}
                            onChange={(value) => setInput("rentalType", value)}
                            longTermLabel={resolveLanguageKey("rentalTypeLongTerm")}
                            shortTermLabel={resolveLanguageKey("rentalTypeShortTerm")}
                        />
                        <RoiFigmaSlider
                            variant="property"
                            label={resolveLanguageKey("monthlyRent")}
                            value={inputs.monthlyRent}
                            min={sliderBounds.monthlyRent.min}
                            max={sliderBounds.monthlyRent.max}
                            step={sliderBounds.monthlyRent.step}
                            onChange={(value) => setInput("monthlyRent", value)}
                            formatValue={formatEuro}
                        />
                        <RoiFigmaSlider
                            variant="property"
                            label={resolveLanguageKey("occupancyRate")}
                            value={inputs.occupancyRate}
                            min={sliderBounds.occupancyRate.min}
                            max={sliderBounds.occupancyRate.max}
                            step={sliderBounds.occupancyRate.step}
                            onChange={(value) => setInput("occupancyRate", value)}
                            formatValue={(value) => formatPercent(value, 0)}
                        />
                        <RoiFigmaSlider
                            variant="property"
                            label={resolveLanguageKey("annualAppreciation")}
                            value={inputs.annualAppreciation}
                            min={sliderBounds.annualAppreciation.min}
                            max={sliderBounds.annualAppreciation.max}
                            step={sliderBounds.annualAppreciation.step}
                            onChange={(value) => setInput("annualAppreciation", value)}
                            formatValue={formatPercent}
                        />
                        <RoiFigmaSlider
                            variant="property"
                            label={resolveLanguageKey("holdingPeriod")}
                            value={inputs.holdingPeriod}
                            min={sliderBounds.holdingPeriod.min}
                            max={sliderBounds.holdingPeriod.max}
                            step={sliderBounds.holdingPeriod.step}
                            onChange={(value) => setInput("holdingPeriod", value)}
                            formatValue={formatYearsShort}
                        />
                    </div>
                </div>
                <RoiProfitPanel
                    variant="property"
                    results={results}
                    holdingPeriod={inputs.holdingPeriod}
                    title={resolveLanguageKey("profitTitle")}
                    rows={profitRows}
                    disclaimer={resolveLanguageKey("roiDisclaimer")}
                    dataNodeId="520:6255"
                />
            </div>

            <div className="relative mt-8 min-h-[100px] w-full overflow-hidden rounded-[5px] md:min-h-[122px]" data-node-id="522:6333">
                <img alt="" aria-hidden className="absolute inset-0 size-full object-cover" src={propertyAssets.ctaInfoBg} />
                <div className="relative flex w-full flex-col items-start justify-between gap-4 px-6 py-6 sm:flex-row sm:items-center md:px-8" data-node-id="522:6343">
                    <p className="font-aeonik-medium text-2xl text-white not-italic sm:max-w-md md:text-4xl lg:text-5xl leading-[1.2]" data-node-id="522:6337">
                        {resolveLanguageKey("notSureTitle")}
                    </p>
                    <button
                        type="button"
                        className="shrink-0 rounded-[5px] border border-white px-6 py-3 font-aeonik-light text-lg text-white not-italic transition hover:bg-white/10 md:text-2xl"
                        data-node-id="522:6339"
                    >
                        {resolveLanguageKey("requestInfo")}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default PropertyDetailsSection;

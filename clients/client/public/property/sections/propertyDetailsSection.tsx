import {propertyAssets} from "@propertyManagementModule/clients/client/public/property/propertyAssets.ts";
import PropertyPriceHistoryChart from "@propertyManagementModule/clients/client/public/property/components/propertyPriceHistoryChart.tsx";
import {PublicLanguageProps, MarketingUnitSingle} from "@propertyManagementModule/clients/client/public/shared/publicTypes.ts";
import {
    PUBLIC_BODY,
    PUBLIC_HEADING,
} from "@propertyManagementModule/clients/client/public/shared/layout/publicLayoutTokens.ts";
import {formatEuro, formatPercent, formatYearsShort} from "@propertyManagementModule/clients/client/public/shared/roi/formatRoiValue.ts";
import RoiFigmaSlider from "@propertyManagementModule/clients/client/public/shared/roi/roiFigmaSlider.tsx";
import RoiProfitPanel from "@propertyManagementModule/clients/client/public/shared/roi/roiProfitPanel.tsx";
import RoiRentalTypeSelect from "@propertyManagementModule/clients/client/public/shared/roi/roiRentalTypeSelect.tsx";
import {useUnitRoiCalculator} from "@propertyManagementModule/clients/client/public/shared/roi/useUnitRoiCalculator.ts";
import {fillLanguageTemplate} from "@propertyManagementModule/clients/client/public/shared/publicTypes.ts";
import {cn} from "@coreModule/components/lib/utils.ts";
import {buildPropertyPriceHistoryPlot} from "@propertyManagementModule/clients/client/public/property/shared/propertyPriceHistoryData.ts";

type PropertyDetailsSectionProps = PublicLanguageProps & {
    unit: MarketingUnitSingle;
    onRequestInfo: () => void;
};

const MISSING_VALUE = "—";

type DetailValueGetter = (unit: MarketingUnitSingle, resolveLanguageKey: PublicLanguageProps["resolveLanguageKey"]) => string;

const AREA_PRICING_ROWS: {labelKey: string; getValue: DetailValueGetter}[] = [
    {labelKey: "unitNumber", getValue: (unit) => unit.unitNumber?.trim() || MISSING_VALUE},
    {labelKey: "unitType", getValue: (unit) => unit.unitTypeName?.trim() || MISSING_VALUE},
    {
        labelKey: "propertyType",
        getValue: (unit, resolveLanguageKey) =>
            unit.propertyType ? resolveLanguageKey(`propertyType_${unit.propertyType}`) : MISSING_VALUE,
    },
    {labelKey: "area", getValue: (unit) => formatAreaSqm(unit.areaSqm ?? unit.grossAreaSqm)},
    {labelKey: "sharedArea", getValue: (unit) => formatAreaSqm(unit.sharedAreaSqm)},
    {labelKey: "netArea", getValue: (unit) => formatAreaSqm(unit.netAreaSqm)},
    {labelKey: "verandaArea", getValue: (unit) => formatAreaSqm(unit.verandaAreaSqm)},
    {
        labelKey: "price",
        getValue: (unit, resolveLanguageKey) => formatUnitPrice(unit, resolveLanguageKey("priceOnRequest")),
    },
    {labelKey: "rooms", getValue: (unit) => formatCount(unit.bedrooms)},
    {labelKey: "baths", getValue: (unit) => formatCount(unit.bathrooms)},
    {labelKey: "orientation", getValue: (unit) => unit.orientation ?? MISSING_VALUE},
    {
        labelKey: "floor",
        getValue: (unit) => {
            if (unit.floorLabel) return unit.floorLabel;
            if (unit.floorLevel != null && unit.totalFloorsInEdifice != null) {
                return `${unit.floorLevel}/${unit.totalFloorsInEdifice}`;
            }
            if (unit.floorLevel != null) return String(unit.floorLevel);
            return MISSING_VALUE;
        },
    },
    {
        labelKey: "averagePricePerSquareMeter",
        getValue: (unit) => formatPricePerSqm(unit.averagePricePerSquareMeter),
    },
    {
        labelKey: "constructionStatus",
        getValue: (unit, resolveLanguageKey) =>
            unit.constructionStatus
                ? resolveLanguageKey(`constructionStatus_${unit.constructionStatus}`)
                : MISSING_VALUE,
    },
];

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
        <div className="flex items-center justify-between gap-4 border-b border-pronix-border px-3 py-3">
            <span className="font-aeonik-light text-base text-pronix-ink not-italic md:text-xl lg:text-2xl">
                {label}
            </span>
            <span className="shrink-0 text-right font-aeonik-light text-base text-pronix-ink not-italic md:text-xl lg:text-2xl">
                {value}
            </span>
        </div>
    );
}

function PropertyDetailsSection({resolveLanguageKey, unit, onRequestInfo}: PropertyDetailsSectionProps) {
    const unitPrice = unit.price ?? unit.sharePrice ?? 0;
    const unitArea = unit.areaSqm ?? unit.grossAreaSqm ?? 1;
    const priceHistory = unit.priceHistory ?? [];
    const priceHistoryPlot = buildPropertyPriceHistoryPlot(priceHistory);

    const {inputs, setInput, results, sliderBounds} = useUnitRoiCalculator({
        unitPrice,
        unitArea,
    });

    const yearLabels = {
        singular: String(resolveLanguageKey("year")),
        plural: String(resolveLanguageKey("years")),
    };
    const holdingYears = Math.round(inputs.holdingPeriod);
    const yearUnit = holdingYears === 1 ? yearLabels.singular : yearLabels.plural;

    const profitRows = [
        {label: resolveLanguageKey("annualGross"), value: formatEuro(results.annualGross), bordered: true},
        {label: resolveLanguageKey("annualNet"), value: formatEuro(results.annualNet), bordered: true},
        {
            label: fillLanguageTemplate(String(resolveLanguageKey("capitalGainWithYears")), {
                years: holdingYears,
                unit: yearUnit,
            }),
            value: formatEuro(results.capitalGain),
            bordered: true,
        },
        {label: resolveLanguageKey("monthlyNet"), value: formatEuro(results.monthlyNet), bordered: false},
    ];

    return (
        <div className="relative w-full" data-node-id="515:6131">
            <div data-node-id="515:6252">
                <p className={PUBLIC_BODY} data-node-id="515:6129">
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
                            value={row.getValue(unit, resolveLanguageKey)}
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

            {priceHistoryPlot ? (
                <div className="mt-8 flex w-full flex-col overflow-hidden rounded-[5px] border border-pronix-border">
                    <div className="flex items-center justify-between gap-3 border-b border-pronix-border px-4 py-3 md:px-5">
                        <p className="font-aeonik-medium text-base text-pronix-ink not-italic md:text-lg">
                            {resolveLanguageKey("priceHistory")}
                        </p>
                        <p className="font-aeonik-medium text-base text-pronix-ink not-italic md:text-lg">
                            {priceHistoryPlot.latestDisplayPrice}
                        </p>
                    </div>
                    <div className="relative w-full px-4 py-3 md:px-5 md:py-4">
                        <PropertyPriceHistoryChart
                            entries={priceHistory}
                            ariaLabel={String(resolveLanguageKey("priceHistoryChartAriaLabel"))}
                            formatTooltip={(label, value) => {
                                const template = String(resolveLanguageKey("priceHistoryChartTooltip"));
                                return template.replace("{{label}}", label).replace("{{value}}", value);
                            }}
                        />
                    </div>
                </div>
            ) : null}

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
                            formatValue={(value) => formatYearsShort(value, yearLabels)}
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
                        onClick={onRequestInfo}
                        className={cn(
                            "flex shrink-0 cursor-pointer items-center justify-center rounded-[5px] border border-white px-6 py-3 md:px-8 md:py-4",
                            "bg-transparent text-white transition-colors duration-200",
                            "hover:bg-white hover:text-pronix-blue",
                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-pronix-blue",
                        )}
                        data-node-id="522:6339"
                    >
                        <span className="font-aeonik-medium whitespace-nowrap not-italic text-lg leading-[17.15px] md:text-2xl">
                            {resolveLanguageKey("requestInfo")}
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
}

export default PropertyDetailsSection;

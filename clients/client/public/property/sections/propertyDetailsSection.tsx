import {propertyAssets} from "@propertyManagementModule/clients/client/public/property/propertyAssets.ts";
import PropertyPriceHistoryChart from "@propertyManagementModule/clients/client/public/property/components/propertyPriceHistoryChart.tsx";
import {PublicLanguageProps, MarketingUnitSingle} from "@propertyManagementModule/clients/client/public/shared/publicTypes.ts";
import {
    PUBLIC_BODY,
    PUBLIC_BODY_COMPACT,
    PUBLIC_HEADING,
    PUBLIC_HEADING_COMPACT,
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
    /** Break ROI/CTA onto full-width rows (e.g. open-project unit panel side-by-side layout). */
    breakoutSecondary?: boolean;
    /** Smaller type for dense side panels. */
    compact?: boolean;
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

function DetailRow({label, value, compact = false}: {label: string; value: string; compact?: boolean}) {
    return (
        <div
            className={cn(
                "flex items-center justify-between gap-4 border-b border-pronix-border",
                compact ? "px-2 py-2" : "px-3 py-3",
            )}
        >
            <span
                className={cn(
                    "font-aeonik-light text-pronix-ink not-italic",
                    compact ? "text-sm" : "text-base md:text-xl lg:text-2xl",
                )}
            >
                {label}
            </span>
            <span
                className={cn(
                    "shrink-0 text-right font-aeonik-light text-pronix-ink not-italic",
                    compact ? "text-sm" : "text-base md:text-xl lg:text-2xl",
                )}
            >
                {value}
            </span>
        </div>
    );
}

function PropertyDetailsSection({
    resolveLanguageKey,
    unit,
    onRequestInfo,
    breakoutSecondary = false,
    compact = false,
}: PropertyDetailsSectionProps) {
    const unitPrice = unit.price ?? unit.sharePrice ?? 0;
    const unitArea = unit.areaSqm ?? unit.grossAreaSqm ?? 1;
    const priceHistory = unit.priceHistory ?? [];
    const priceHistoryPlot = buildPropertyPriceHistoryPlot(priceHistory);
    const bodyClass = compact ? PUBLIC_BODY_COMPACT : PUBLIC_BODY;
    const headingClass = compact ? PUBLIC_HEADING_COMPACT : PUBLIC_HEADING;
    const sectionGap = compact ? "mt-5" : "mt-8";

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

    const primary = (
        <>
            <div data-node-id="515:6252">
                <p className={bodyClass} data-node-id="515:6129">
                    {unit.description ?? MISSING_VALUE}
                </p>
            </div>

            <div className={`${sectionGap} w-full`} data-node-id="515:6223">
                <h2 className={headingClass} data-node-id="515:6175">
                    {resolveLanguageKey("areaAndPricing")}
                </h2>
                <div className="mt-3 border-t border-pronix-border" data-node-id="515:6218">
                    {AREA_PRICING_ROWS.map((row) => (
                        <DetailRow
                            key={row.labelKey}
                            compact={compact}
                            label={resolveLanguageKey(row.labelKey)}
                            value={row.getValue(unit, resolveLanguageKey)}
                        />
                    ))}
                </div>
            </div>

            <div className={`${sectionGap} w-full`}>
                <h2 className={headingClass}>
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
                                compact={compact}
                                label={resolveLanguageKey(row.labelKey)}
                                value={display}
                            />
                        );
                    })}
                </div>
            </div>

            {priceHistoryPlot ? (
                <div className={`${sectionGap} flex w-full flex-col overflow-hidden rounded-[5px] border border-pronix-border`}>
                    <div className="flex items-center justify-between gap-3 border-b border-pronix-border px-4 py-3 md:px-5">
                        <p className={cn("font-aeonik-medium text-pronix-ink not-italic", compact ? "text-sm" : "text-base md:text-lg")}>
                            {resolveLanguageKey("priceHistory")}
                        </p>
                        <p className={cn("font-aeonik-medium text-pronix-ink not-italic", compact ? "text-sm" : "text-base md:text-lg")}>
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
        </>
    );

    const secondary = (
        <>
            <div
                className={cn(
                    "relative grid w-full grid-cols-1 overflow-hidden rounded-[5px] border border-pronix-border",
                    sectionGap,
                    breakoutSecondary ? "min-[40rem]:grid-cols-2" : "lg:grid-cols-2",
                )}
                data-node-id="520:6254"
            >
                <div className={cn("bg-white", compact ? "p-4 md:p-5" : "p-6 md:p-8")} data-node-id="520:6277">
                    <p
                        className={cn(
                            "text-center text-pronix-ink not-italic",
                            compact ? "font-aeonik-medium text-sm" : headingClass,
                        )}
                        data-node-id="520:6279"
                    >
                        {resolveLanguageKey("roiTitle")}
                    </p>
                    <div className={cn("mx-auto flex max-w-md flex-col", compact ? "mt-4 gap-4" : "mt-6 gap-6")}>
                        <RoiRentalTypeSelect
                            label={resolveLanguageKey("rentalType")}
                            value={inputs.rentalType}
                            onChange={(value) => setInput("rentalType", value)}
                            longTermLabel={resolveLanguageKey("rentalTypeLongTerm")}
                            shortTermLabel={resolveLanguageKey("rentalTypeShortTerm")}
                            compact={compact}
                        />
                        <RoiFigmaSlider
                            variant="property"
                            compact={compact}
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
                            compact={compact}
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
                            compact={compact}
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
                            compact={compact}
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
                    compact={compact}
                    results={results}
                    holdingPeriod={inputs.holdingPeriod}
                    title={resolveLanguageKey("profitTitle")}
                    rows={profitRows}
                    disclaimer={resolveLanguageKey("roiDisclaimer")}
                    dataNodeId="520:6255"
                />
            </div>

            <div
                className={cn(
                    "relative w-full overflow-hidden rounded-[5px]",
                    sectionGap,
                    compact ? "min-h-[88px] md:min-h-[100px]" : "min-h-[100px] md:min-h-[122px]",
                )}
                data-node-id="522:6333"
            >
                <img alt="" aria-hidden className="absolute inset-0 size-full object-cover" src={propertyAssets.ctaInfoBg} />
                <div
                    className={cn(
                        "relative flex w-full flex-col items-start justify-between gap-4 sm:flex-row sm:items-center",
                        compact ? "px-4 py-4 md:px-5" : "px-6 py-6 md:px-8",
                    )}
                    data-node-id="522:6343"
                >
                    <p
                        className={cn(
                            "font-aeonik-medium text-white not-italic leading-[1.2] sm:max-w-md",
                            compact ? "text-base md:text-lg" : "text-2xl md:text-4xl lg:text-5xl",
                        )}
                        data-node-id="522:6337"
                    >
                        {resolveLanguageKey("notSureTitle")}
                    </p>
                    <button
                        type="button"
                        onClick={onRequestInfo}
                        className={cn(
                            "flex shrink-0 cursor-pointer items-center justify-center rounded-[5px] border border-white",
                            compact ? "px-4 py-2.5 md:px-5 md:py-3" : "px-6 py-3 md:px-8 md:py-4",
                            "bg-transparent text-white transition-colors duration-200",
                            "hover:bg-white hover:text-pronix-blue",
                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-pronix-blue",
                        )}
                        data-node-id="522:6339"
                    >
                        <span
                            className={cn(
                                "font-aeonik-medium whitespace-nowrap not-italic leading-[17.15px]",
                                compact ? "text-sm" : "text-lg md:text-2xl",
                            )}
                        >
                            {resolveLanguageKey("requestInfo")}
                        </span>
                    </button>
                </div>
            </div>
        </>
    );

    if (breakoutSecondary) {
        return (
            <>
                <div
                    className="relative w-full min-w-0 min-[48rem]:order-1 min-[48rem]:col-span-7"
                    data-node-id="515:6131"
                >
                    {primary}
                </div>
                <div className="relative w-full min-w-0 min-[48rem]:order-3 min-[48rem]:col-span-12">
                    {secondary}
                </div>
            </>
        );
    }

    return (
        <div className="relative w-full" data-node-id="515:6131">
            {primary}
            {secondary}
        </div>
    );
}

export default PropertyDetailsSection;

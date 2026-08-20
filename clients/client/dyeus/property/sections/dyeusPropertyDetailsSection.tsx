import {dyeusAssets} from "@propertyManagementModule/clients/client/dyeus/shared/dyeusAssets.ts";
import PropertyPriceHistoryChart from "@propertyManagementModule/clients/client/public/property/components/propertyPriceHistoryChart.tsx";
import {buildPropertyPriceHistoryPlot} from "@propertyManagementModule/clients/client/public/property/shared/propertyPriceHistoryData.ts";
import {fillLanguageTemplate, type MarketingUnitSingle} from "@propertyManagementModule/clients/client/public/shared/publicTypes.ts";
import {cn} from "@coreModule/components/lib/utils.ts";
import {
    MISSING_VALUE,
    formatAreaSqm,
    formatCount,
    formatFloor,
    formatPricePerSqm,
    formatUnitPrice,
    type DyeusPropertyCopy,
} from "@propertyManagementModule/clients/client/dyeus/property/dyeusPropertyFormat.ts";

type DyeusPropertyDetailsSectionProps = {
    unit: MarketingUnitSingle;
    t: DyeusPropertyCopy;
    onRequestInfo: () => void;
};

type DetailValueGetter = (unit: MarketingUnitSingle, t: DyeusPropertyCopy) => string;

const AREA_PRICING_ROWS: {labelKey: string; getValue: DetailValueGetter}[] = [
    {labelKey: "unitNumber", getValue: (unit) => unit.unitNumber?.trim() || MISSING_VALUE},
    {labelKey: "unitType", getValue: (unit) => unit.unitTypeName?.trim() || MISSING_VALUE},
    {
        labelKey: "propertyType",
        getValue: (unit, t) => (unit.propertyType ? t(`propertyType_${unit.propertyType}`) : MISSING_VALUE),
    },
    {labelKey: "grossArea", getValue: (unit) => formatAreaSqm(unit.grossAreaSqm)},
    {labelKey: "area", getValue: (unit) => formatAreaSqm(unit.areaSqm)},
    {labelKey: "sharedArea", getValue: (unit) => formatAreaSqm(unit.sharedAreaSqm)},
    {labelKey: "netArea", getValue: (unit) => formatAreaSqm(unit.netAreaSqm)},
    {labelKey: "verandaArea", getValue: (unit) => formatAreaSqm(unit.verandaAreaSqm)},
    {labelKey: "price", getValue: (unit, t) => formatUnitPrice(unit, t("priceOnRequest"))},
    {labelKey: "bedrooms", getValue: (unit) => formatCount(unit.bedrooms)},
    {labelKey: "bathrooms", getValue: (unit) => formatCount(unit.bathrooms)},
    {labelKey: "orientation", getValue: (unit) => unit.orientation ?? MISSING_VALUE},
    {labelKey: "floor", getValue: formatFloor},
    {labelKey: "averagePricePerSquareMeter", getValue: (unit) => formatPricePerSqm(unit.averagePricePerSquareMeter)},
    {
        labelKey: "constructionStatus",
        getValue: (unit, t) =>
            unit.constructionStatus ? t(`constructionStatus_${unit.constructionStatus}`) : MISSING_VALUE,
    },
    {
        labelKey: "projectedYield",
        getValue: (unit) =>
            unit.projectedYield != null
                ? `${unit.projectedYield.toLocaleString(undefined, {maximumFractionDigits: 2})}%`
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

function DetailRow({label, value}: {label: string; value: string}) {
    return (
        <div className="flex items-center justify-between gap-4 border-b border-dyeus-border px-3 py-3">
            <span className="font-dyeus-serif text-base text-dyeus-ink md:text-xl lg:text-2xl">{label}</span>
            <span className="shrink-0 text-right font-dyeus-serif text-base text-dyeus-ink md:text-xl lg:text-2xl">
                {value}
            </span>
        </div>
    );
}

function DyeusPropertyDetailsSection({unit, t, onRequestInfo}: DyeusPropertyDetailsSectionProps) {
    const priceHistory = unit.priceHistory ?? [];
    const priceHistoryPlot = buildPropertyPriceHistoryPlot(priceHistory);
    const areaRows = AREA_PRICING_ROWS.filter((row) => {
        if (row.labelKey === "area") return unit.grossAreaSqm == null && unit.areaSqm != null;
        if (row.labelKey === "projectedYield") return unit.projectedYield != null;
        return true;
    });

    return (
        <div className="relative w-full">
            {unit.description?.trim() ? (
                <p className="font-dyeus-serif text-base leading-[1.4] text-dyeus-ink-muted md:text-lg lg:text-xl">
                    {unit.description.trim()}
                </p>
            ) : null}

            <div className={`w-full ${unit.description?.trim() ? "mt-8" : ""}`}>
                <h2 className="font-dyeus-serif text-2xl font-bold leading-[1.2] text-dyeus-ink md:text-[32px]">
                    {t("areaAndPricing")}
                </h2>
                <div className="mt-3 border-t border-dyeus-border">
                    {areaRows.map((row) => (
                        <DetailRow key={row.labelKey} label={t(row.labelKey)} value={row.getValue(unit, t)} />
                    ))}
                </div>
            </div>

            <div className="mt-8 w-full">
                <h2 className="font-dyeus-serif text-2xl font-bold leading-[1.2] text-dyeus-ink md:text-[32px]">
                    {t("features")}
                </h2>
                <div className="mt-3 border-t border-dyeus-border">
                    {FEATURE_ROWS.map((row) => {
                        const value = unit[row.field];
                        const display =
                            value === true ? t("yes") : value === false ? t("no") : MISSING_VALUE;
                        return <DetailRow key={row.labelKey} label={t(row.labelKey)} value={display} />;
                    })}
                </div>
            </div>

            {priceHistoryPlot ? (
                <div className="mt-8 flex w-full flex-col overflow-hidden border border-dyeus-border bg-dyeus-white">
                    <div className="flex items-center justify-between gap-3 border-b border-dyeus-border px-4 py-3 md:px-5">
                        <p className="font-dyeus-serif text-base font-bold text-dyeus-ink md:text-lg">
                            {t("priceHistory")}
                        </p>
                        <p className="font-dyeus-serif text-base font-bold text-dyeus-ink md:text-lg">
                            {priceHistoryPlot.latestDisplayPrice}
                        </p>
                    </div>
                    <div className="relative w-full px-4 py-3 md:px-5 md:py-4">
                        <PropertyPriceHistoryChart
                            entries={priceHistory}
                            accentColor="#b28e6b"
                            tooltipClassName="border-dyeus-border bg-dyeus-cream font-dyeus-sans text-xs text-dyeus-ink"
                            captionClassName="font-dyeus-sans text-[11px] leading-4 text-dyeus-ink-muted"
                            ariaLabel={t("priceHistoryChartAriaLabel")}
                            formatTooltip={(label, value) =>
                                fillLanguageTemplate(t("priceHistoryChartTooltip"), {label, value})
                            }
                        />
                    </div>
                </div>
            ) : null}

            <div className="relative mt-8 min-h-[100px] w-full overflow-hidden md:min-h-[122px]">
                <img
                    alt=""
                    aria-hidden
                    className="absolute inset-0 size-full object-cover"
                    src={dyeusAssets.aboutPool}
                />
                <div className="absolute inset-0 bg-dyeus-ink/45" />
                <div className="relative flex w-full flex-col items-start justify-between gap-4 px-6 py-6 sm:flex-row sm:items-center md:px-8">
                    <p className="font-dyeus-serif text-2xl font-bold leading-[1.2] text-dyeus-cream sm:max-w-md md:text-4xl lg:text-5xl">
                        {t("notSureTitle")}
                    </p>
                    <button
                        type="button"
                        onClick={onRequestInfo}
                        className={cn(
                            "flex shrink-0 cursor-pointer items-center justify-center border border-dyeus-cream px-6 py-3 md:px-8 md:py-4",
                            "bg-transparent text-dyeus-cream transition-colors duration-200",
                            "hover:bg-dyeus-cream hover:text-dyeus-ink",
                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dyeus-cream/70 focus-visible:ring-offset-2 focus-visible:ring-offset-dyeus-ink",
                        )}
                    >
                        <span className="whitespace-nowrap font-dyeus-sans text-xs uppercase tracking-[0.2em] md:text-sm">
                            {t("requestInfo")}
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
}

export default DyeusPropertyDetailsSection;

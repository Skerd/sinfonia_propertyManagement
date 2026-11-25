import type {MarketingEdificeListItem} from "@propertyManagementModule/clients/client/public/shared/publicTypes.ts";
import type {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";

type OpenProjectFigmaEdificeStatsProps = {
    edifice: MarketingEdificeListItem;
    resolveLanguageKey: WithLanguageType["resolveLanguageKey"];
    variant?: "gallery" | "finance";
};

/** Each stat rises in after the one before it; the parent re-keys per building so switching replays it. */
const STATS_GRID_CLASS =
    "grid grid-cols-2 gap-x-6 gap-y-6 lg:gap-x-10 lg:gap-y-7 [&>div]:animate-in [&>div]:fade-in [&>div]:slide-in-from-bottom-2 [&>div]:fill-mode-both [&>div]:duration-500 motion-reduce:[&>div]:animate-none " +
    "[&>div:nth-child(2)]:delay-[40ms] [&>div:nth-child(3)]:delay-[80ms] [&>div:nth-child(4)]:delay-[120ms] [&>div:nth-child(5)]:delay-[160ms] [&>div:nth-child(6)]:delay-[200ms] [&>div:nth-child(n+7)]:delay-[240ms]";

function formatMoney(amount: number, currencyLabel?: string): string {
    const formatted = amount.toLocaleString();
    if (currencyLabel?.includes("€") || currencyLabel?.toLowerCase() === "euro") {
        return `€ ${formatted}`;
    }
    if (currencyLabel) {
        return `${currencyLabel} ${formatted}`;
    }
    return `€ ${formatted}`;
}

function display(value: string | number | undefined | null, unset: string, suffix = ""): string {
    if (value == null || value === "") {
        return unset;
    }
    return `${typeof value === "number" ? value.toLocaleString() : value}${suffix}`;
}

function unitStatusCounts(edifice: MarketingEdificeListItem) {
    const units = (edifice.floors ?? []).flatMap((floor) => floor.units ?? []);
    if (units.length > 0) {
        return {
            available: units.filter((unit) => unit.status === "available").length,
            sold: units.filter((unit) => unit.status === "sold").length,
            reserved: units.filter((unit) => unit.status === "reserved").length,
        };
    }
    const available = edifice.availableUnitCount;
    const sold = edifice.soldUnitCount;
    const total = edifice.unitCount;
    const reserved =
        available != null && sold != null && total != null ? Math.max(0, total - available - sold) : undefined;
    return {available, sold, reserved};
}

function OpenProjectFigmaEdificeStats({
    edifice,
    resolveLanguageKey,
    variant = "gallery",
}: OpenProjectFigmaEdificeStatsProps) {
    const unset = String(resolveLanguageKey("valueNotSet"));

    if (variant === "finance") {
        const counts = unitStatusCounts(edifice);
        const constructors = (edifice.constructors ?? []).filter(Boolean);
        return (
            <dl className={STATS_GRID_CLASS}>
                <div className="min-w-0">
                    <dt className="font-aeonik-light text-lg leading-[1.1] text-pronix-ink-muted sm:text-xl lg:text-[clamp(1.125rem,1.5vw,26px)]">
                        {resolveLanguageKey("availableUnitsLabel")}
                    </dt>
                    <dd className="mt-1.5 text-2xl font-normal leading-none text-pronix-ink sm:text-[28px] lg:text-[clamp(1.5rem,1.9vw,32px)]">
                        {display(counts.available, unset)}
                    </dd>
                </div>
                <div className="min-w-0">
                    <dt className="font-aeonik-light text-lg leading-[1.1] text-pronix-ink-muted sm:text-xl lg:text-[clamp(1.125rem,1.5vw,26px)]">
                        {resolveLanguageKey("soldUnitsLabel")}
                    </dt>
                    <dd className="mt-1.5 text-2xl font-normal leading-none text-pronix-ink sm:text-[28px] lg:text-[clamp(1.5rem,1.9vw,32px)]">
                        {display(counts.sold, unset)}
                    </dd>
                </div>
                <div className="min-w-0">
                    <dt className="font-aeonik-light text-lg leading-[1.1] text-pronix-ink-muted sm:text-xl lg:text-[clamp(1.125rem,1.5vw,26px)]">
                        {resolveLanguageKey("investedLabel")}
                    </dt>
                    <dd className="mt-1.5 text-2xl font-normal leading-none text-pronix-ink sm:text-[28px] lg:text-[clamp(1.5rem,1.9vw,32px)]">
                        {edifice.investedAmount != null
                            ? formatMoney(edifice.investedAmount, edifice.investedCurrency)
                            : unset}
                    </dd>
                </div>
                <div className="min-w-0">
                    <dt className="font-aeonik-light text-lg leading-[1.1] text-pronix-ink-muted sm:text-xl lg:text-[clamp(1.125rem,1.5vw,26px)]">
                        {resolveLanguageKey("reservedUnitsLabel")}
                    </dt>
                    <dd className="mt-1.5 text-2xl font-normal leading-none text-pronix-ink sm:text-[28px] lg:text-[clamp(1.5rem,1.9vw,32px)]">
                        {display(counts.reserved, unset)}
                    </dd>
                </div>
                <div className="col-span-2 min-w-0">
                    <dt className="font-aeonik-light text-lg leading-[1.1] text-pronix-ink-muted sm:text-xl lg:text-[clamp(1.125rem,1.5vw,26px)]">
                        {resolveLanguageKey("constructorsLabel")}
                    </dt>
                    {constructors.length > 0 ? (
                        constructors.map((name, index) => (
                            <dd
                                key={`${name}-${index}`}
                                className="mt-3 text-2xl font-normal leading-none text-pronix-ink sm:text-[28px] lg:text-[clamp(1.5rem,1.9vw,32px)] first-of-type:mt-1.5"
                            >
                                {name}
                            </dd>
                        ))
                    ) : (
                        <dd className="mt-1.5 text-2xl font-normal leading-none text-pronix-ink sm:text-[28px] lg:text-[clamp(1.5rem,1.9vw,32px)]">{unset}</dd>
                    )}
                </div>
            </dl>
        );
    }

    const rows = [
        {label: resolveLanguageKey("greenAreaLabel"), value: display(edifice.greenAreaSqm, unset, " m²")},
        {label: resolveLanguageKey("distanceLabel"), value: display(edifice.distanceFromCityCenterM, unset, " m")},
        {label: resolveLanguageKey("pricePerSqmLabel"), value: display(edifice.pricePerSqm, unset, " €/m²")},
        {
            label: resolveLanguageKey("verandaPricePerSqmLabel"),
            value: display(edifice.verandaPricePerSqm, unset, " €/m²"),
        },
        {
            label: resolveLanguageKey("saleCurrencyLabel"),
            value: display(edifice.saleCurrency || edifice.investedCurrency, unset),
        },
        {label: resolveLanguageKey("floorsLabel"), value: display(edifice.floorCount, unset)},
        {label: resolveLanguageKey("floorsAboveLabel"), value: display(edifice.floorsAboveGround, unset)},
        {label: resolveLanguageKey("floorsUnderLabel"), value: display(edifice.floorsUnderGround, unset)},
        {label: resolveLanguageKey("parkingLabel"), value: display(edifice.parkingSpaces, unset)},
        {label: resolveLanguageKey("garagesLabel"), value: display(edifice.garages, unset)},
        {label: resolveLanguageKey("totalAreaLabel"), value: display(edifice.totalAreaSqm, unset, " m²")},
        {label: resolveLanguageKey("energyClassLabel"), value: display(edifice.energyClass, unset)},
        {label: resolveLanguageKey("unitsLabel"), value: display(edifice.unitCount, unset)},
        {label: resolveLanguageKey("availableLabel"), value: display(edifice.availableUnitCount, unset)},
        {label: resolveLanguageKey("constructionStartLabel"), value: display(edifice.constructionStartYear, unset)},
        {label: resolveLanguageKey("completionLabel"), value: display(edifice.expectedCompletionYear, unset)},
    ];

    return (
        <dl className={STATS_GRID_CLASS}>
            {rows.map((row) => (
                <div key={row.label} className="min-w-0">
                    <dt className="font-aeonik-light text-lg leading-[1.1] text-pronix-ink-muted sm:text-xl lg:text-[clamp(1.125rem,1.5vw,26px)]">{row.label}</dt>
                    <dd className="mt-1.5 text-2xl font-normal leading-none text-pronix-ink sm:text-[28px] lg:text-[clamp(1.5rem,1.9vw,32px)]">{row.value}</dd>
                </div>
            ))}
        </dl>
    );
}

export default OpenProjectFigmaEdificeStats;

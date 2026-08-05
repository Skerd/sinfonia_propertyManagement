import type {MarketingEdificeListItem} from "@propertyManagementModule/clients/client/public/shared/publicTypes.ts";

type EdificeInfoPanelProps = {
    edifice: MarketingEdificeListItem;
    resolveLanguageKey: (key: string) => string;
    className?: string;
};

type DetailRow = {
    label: string;
    value: string;
};

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

function DetailTile({label, value}: DetailRow) {
    return (
        <div className="min-w-0 rounded-[5px] bg-[rgba(24,24,24,0.04)] px-2.5 py-1.5">
            <dt className="truncate font-aeonik-light text-xs text-pronix-ink-muted">{label}</dt>
            <dd className="mt-0.5 truncate font-aeonik-medium text-sm text-pronix-ink">{value}</dd>
        </div>
    );
}

function FacilityList({
    title,
    items,
    empty,
}: {
    title: string;
    items: string[];
    empty: string;
}) {
    return (
        <div className="min-w-0">
            <p className="font-aeonik-medium text-xs text-pronix-ink">{title}</p>
            {items.length > 0 ? (
                <ul className="mt-1.5 flex flex-wrap gap-1.5">
                    {items.map((item) => (
                        <li
                            key={item}
                            className="rounded-[5px] border border-pronix-border px-2 py-0.5 font-aeonik-light text-xs text-pronix-ink-muted"
                        >
                            {item}
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="mt-1 font-aeonik-light text-xs text-pronix-ink-muted">{empty}</p>
            )}
        </div>
    );
}

function EdificeInfoPanel({edifice, resolveLanguageKey, className = ""}: EdificeInfoPanelProps) {
    const unset = resolveLanguageKey("valueNotSet");

    const display = (value: string | number | undefined | null, suffix = ""): string => {
        if (value == null || value === "") {
            return unset;
        }
        return `${typeof value === "number" ? value.toLocaleString() : value}${suffix}`;
    };

    const detailRows: DetailRow[] = [
        {label: resolveLanguageKey("greenAreaLabel"), value: display(edifice.greenAreaSqm, " m²")},
        {
            label: resolveLanguageKey("distanceLabel"),
            value: display(edifice.distanceFromCityCenterM, " m"),
        },
        {
            label: resolveLanguageKey("investedLabel"),
            value:
                edifice.investedAmount != null
                    ? formatMoney(edifice.investedAmount, edifice.investedCurrency)
                    : unset,
        },
        {
            label: resolveLanguageKey("pricePerSqmLabel"),
            value: display(edifice.pricePerSqm, " €/m²"),
        },
        {
            label: resolveLanguageKey("verandaPricePerSqmLabel"),
            value: display(edifice.verandaPricePerSqm, " €/m²"),
        },
        {
            label: resolveLanguageKey("saleCurrencyLabel"),
            value: display(edifice.saleCurrency || edifice.investedCurrency),
        },
        {label: resolveLanguageKey("floorsLabel"), value: display(edifice.floorCount)},
        {label: resolveLanguageKey("floorsAboveLabel"), value: display(edifice.floorsAboveGround)},
        {label: resolveLanguageKey("floorsUnderLabel"), value: display(edifice.floorsUnderGround)},
        {label: resolveLanguageKey("parkingLabel"), value: display(edifice.parkingSpaces)},
        {label: resolveLanguageKey("garagesLabel"), value: display(edifice.garages)},
        {label: resolveLanguageKey("totalAreaLabel"), value: display(edifice.totalAreaSqm, " m²")},
        {label: resolveLanguageKey("energyClassLabel"), value: display(edifice.energyClass)},
        {label: resolveLanguageKey("unitsLabel"), value: display(edifice.unitCount)},
        {label: resolveLanguageKey("availableLabel"), value: display(edifice.availableUnitCount)},
        {
            label: resolveLanguageKey("constructionStartLabel"),
            value: display(edifice.constructionStartYear),
        },
        {label: resolveLanguageKey("completionLabel"), value: display(edifice.expectedCompletionYear)},
    ];

    const locationLine = [edifice.street, edifice.postalCode, edifice.location || edifice.city]
        .filter(Boolean)
        .join(" · ");
    const commercialFacilities = edifice.commercialFacilities ?? [];
    const neighborhoodFacilities = edifice.neighborhoodFacilities ?? [];
    const constructors = edifice.constructors ?? [];

    return (
        <section className={`w-full min-w-0 ${className}`}>
            <div className="flex min-w-0 flex-wrap items-baseline gap-x-3 gap-y-0.5">
                <p className="font-aeonik-light text-xs text-pronix-ink-muted">
                    {resolveLanguageKey("edificeDetails")}
                </p>
                <h3 className="font-aeonik-medium text-lg text-pronix-ink md:text-xl">
                    {edifice.name || resolveLanguageKey("unnamedEdifice")}
                </h3>
                {locationLine ? (
                    <p className="font-aeonik-light text-sm text-pronix-ink-muted">{locationLine}</p>
                ) : null}
            </div>

            <dl className="mt-3 grid grid-cols-2 gap-1.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
                {detailRows.map((row) => (
                    <DetailTile key={row.label} {...row} />
                ))}
            </dl>

            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <FacilityList
                    title={resolveLanguageKey("commercialFacilitiesTitle")}
                    items={commercialFacilities}
                    empty={unset}
                />
                <FacilityList
                    title={resolveLanguageKey("neighborhoodFacilitiesTitle")}
                    items={neighborhoodFacilities}
                    empty={unset}
                />
                <FacilityList
                    title={resolveLanguageKey("constructorsTitle")}
                    items={constructors}
                    empty={unset}
                />
            </div>
        </section>
    );
}

export default EdificeInfoPanel;

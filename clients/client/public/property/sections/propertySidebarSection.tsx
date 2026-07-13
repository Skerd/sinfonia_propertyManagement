import {PublicLanguageProps} from "@propertyManagementModule/clients/client/public/shared/publicTypes.ts";
import {MarketingUnitSingle} from "@propertyManagementModule/clients/client/public/shared/publicTypes.ts";
import {propertyAssets} from "@propertyManagementModule/clients/client/public/property/propertyAssets.ts";
import {resolveMarketingMediaUrl} from "@propertyManagementModule/clients/client/public/shared/resolveMarketingMedia.ts";
import {
    PUBLIC_SUBTITLE,
    PUBLIC_TITLE,
} from "@propertyManagementModule/clients/client/public/shared/layout/publicLayoutTokens.ts";

type PropertySidebarSectionProps = PublicLanguageProps & {
    unit: MarketingUnitSingle;
};

const MISSING_VALUE = "—";

function formatFloorLabel(unit: MarketingUnitSingle) {
    if (unit.floorLabel) {
        return unit.floorLabel;
    }
    if (unit.floorLevel != null && unit.totalFloorsInEdifice != null) {
        return `${unit.floorLevel}/${unit.totalFloorsInEdifice}`;
    }
    return MISSING_VALUE;
}

function formatUnitPrice(unit: MarketingUnitSingle, onRequest: string) {
    if (unit.price == null) {
        return onRequest;
    }
    const symbol = unit.priceCurrency?.symbol ?? unit.priceCurrency?.abbreviation ?? "€";
    return `${symbol}${unit.price.toLocaleString()}`;
}

function PropertySidebarSection({resolveLanguageKey, unit}: PropertySidebarSectionProps) {
    const priceLabel = formatUnitPrice(unit, resolveLanguageKey("priceOnRequest"));
    const areaLabel = unit.grossAreaSqm != null ? `${unit.grossAreaSqm} m²` : MISSING_VALUE;
    const roomsLabel = unit.bedrooms != null ? String(unit.bedrooms) : MISSING_VALUE;
    const bathsLabel = unit.bathrooms != null ? String(unit.bathrooms) : MISSING_VALUE;
    const floorLabel = formatFloorLabel(unit);
    const specImage = resolveMarketingMediaUrl(unit.floorPlanImage) ?? propertyAssets.specArea;

    return (
        <div className="relative w-full max-w-xl lg:max-w-[599px]" data-node-id="515:6253">
            <div
                className="relative overflow-hidden rounded-[5px] border border-pronix-border bg-white p-5 md:p-6"
                data-node-id="515:6120"
            >
                <div
                    className="absolute right-5 top-5 flex items-center gap-2 rounded-[5px] border border-pronix-border px-4 py-2 md:right-6 md:top-9"
                    data-node-id="515:6144"
                >
                    <span className="size-2.5 rounded-full bg-green-500" />
                    <span className="font-aeonik-light text-base text-pronix-ink not-italic md:text-lg">
                        {unit.status || resolveLanguageKey("available")}
                    </span>
                </div>
                <div className="pt-2" data-node-id="515:6174">
                    <div data-node-id="515:6139">
                        <p className={`${PUBLIC_SUBTITLE} text-pronix-ink`}>
                            {resolveLanguageKey("price")}
                        </p>
                        <p className={`mt-3 ${PUBLIC_TITLE} leading-[1.1] text-pronix-ink`}>
                            {priceLabel}
                        </p>
                    </div>
                    <div className="my-6 h-px w-full bg-pronix-border" />
                    <div className="grid grid-cols-2 gap-6 sm:grid-cols-3" data-node-id="515:6149">
                        <div>
                            <p className="font-aeonik-light text-base text-pronix-ink-muted not-italic md:text-xl">
                                {resolveLanguageKey("area")}
                            </p>
                            <p className={`${PUBLIC_SUBTITLE} text-pronix-ink`}>{areaLabel}</p>
                        </div>
                        <div>
                            <p className="font-aeonik-light text-base text-pronix-ink-muted not-italic md:text-xl">
                                {resolveLanguageKey("orientation")}
                            </p>
                            <p className={`${PUBLIC_SUBTITLE} text-pronix-ink`}>
                                {MISSING_VALUE}
                            </p>
                        </div>
                        <div>
                            <p className="font-aeonik-light text-base text-pronix-ink-muted not-italic md:text-xl">
                                {resolveLanguageKey("rooms")}
                            </p>
                            <p className={`${PUBLIC_SUBTITLE} text-pronix-ink`}>{roomsLabel}</p>
                        </div>
                        <div>
                            <p className="font-aeonik-light text-base text-pronix-ink-muted not-italic md:text-xl">
                                {resolveLanguageKey("floor")}
                            </p>
                            <p className={`${PUBLIC_SUBTITLE} text-pronix-ink`}>
                                {floorLabel}
                            </p>
                        </div>
                        <div>
                            <p className="font-aeonik-light text-base text-pronix-ink-muted not-italic md:text-xl">
                                {resolveLanguageKey("baths")}
                            </p>
                            <p className={`${PUBLIC_SUBTITLE} text-pronix-ink`}>{bathsLabel}</p>
                        </div>
                    </div>
                    <div className="my-6 h-px w-full bg-pronix-border" />
                    <button
                        type="button"
                        className="w-full rounded-[5px] bg-pronix-blue py-4 font-aeonik-medium text-white not-italic transition hover:opacity-90 md:py-5 md:text-lg"
                        data-node-id="515:6169"
                    >
                        {resolveLanguageKey("reserveOnline")}
                    </button>
                </div>
                <div
                    className="mt-6 overflow-hidden rounded-[5px] border border-pronix-border md:mt-8"
                    data-node-id="550:1943"
                >
                    <img alt="" aria-hidden className="aspect-[559/384] w-full object-contain bg-white p-4" src={specImage} />
                </div>
            </div>
        </div>
    );
}

export default PropertySidebarSection;

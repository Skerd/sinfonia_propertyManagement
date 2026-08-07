import {useState} from "react";
import {toast} from "sonner";
import {PublicLanguageProps} from "@propertyManagementModule/clients/client/public/shared/publicTypes.ts";
import {MarketingUnitSingle} from "@propertyManagementModule/clients/client/public/shared/publicTypes.ts";
import {propertyAssets} from "@propertyManagementModule/clients/client/public/property/propertyAssets.ts";
import {resolveMarketingMediaUrl} from "@propertyManagementModule/clients/client/public/shared/resolveMarketingMedia.ts";
import {
    PUBLIC_SUBTITLE,
    PUBLIC_TITLE,
} from "@propertyManagementModule/clients/client/public/shared/layout/publicLayoutTokens.ts";
import {cn} from "@coreModule/components/lib/utils.ts";
import apiClient from "@coreModule/helpers/axiosClients/apiClient.ts";

type PropertySidebarSectionProps = PublicLanguageProps & {
    unit: MarketingUnitSingle;
    onReserve: () => void;
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

function downloadBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
}

function PropertySidebarSection({resolveLanguageKey, unit, onReserve}: PropertySidebarSectionProps) {
    const [downloadingBrochure, setDownloadingBrochure] = useState(false);
    const priceLabel = formatUnitPrice(unit, resolveLanguageKey("priceOnRequest"));
    const areaLabel = unit.grossAreaSqm != null ? `${unit.grossAreaSqm} m²` : MISSING_VALUE;
    const roomsLabel = unit.bedrooms != null ? String(unit.bedrooms) : MISSING_VALUE;
    const bathsLabel = unit.bathrooms != null ? String(unit.bathrooms) : MISSING_VALUE;
    const floorLabel = formatFloorLabel(unit);
    const orientationLabel = unit.orientation ?? MISSING_VALUE;
    const unitTypeLabel = unit.unitTypeName?.trim() || MISSING_VALUE;
    const specImage = resolveMarketingMediaUrl(unit.floorPlanImage) ?? propertyAssets.specArea;

    const handleDownloadBrochure = async () => {
        if (downloadingBrochure) {
            return;
        }
        setDownloadingBrochure(true);
        try {
            const response = await apiClient.post(
                "/api/realEstate/marketingUnit/brochure",
                {projectId: unit.projectId, unitId: unit._id},
                {responseType: "blob"},
            );
            const blob = response.data instanceof Blob
                ? response.data
                : new Blob([response.data], {type: "application/pdf"});

            // Axios + responseType:blob turns JSON errors into Blob too — detect that.
            if (blob.type.includes("application/json") || blob.type.includes("text/")) {
                throw new Error("brochure_unavailable");
            }
            const header = await blob.slice(0, 5).text();
            if (header.trimStart().startsWith("{")) {
                throw new Error("brochure_unavailable");
            }

            const unitLabel = unit.unitNumber || unit.name || unit._id;
            downloadBlob(blob, `marketing-booklet-${unitLabel}.pdf`);
        } catch {
            toast.error(resolveLanguageKey("brochureError"));
        } finally {
            setDownloadingBrochure(false);
        }
    };

    return (
        <div className="relative w-full lg:sticky lg:top-6" data-node-id="515:6253">
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
                                {orientationLabel}
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
                        <div>
                            <p className="font-aeonik-light text-base text-pronix-ink-muted not-italic md:text-xl">
                                {resolveLanguageKey("unitType")}
                            </p>
                            <p className={`${PUBLIC_SUBTITLE} text-pronix-ink`}>{unitTypeLabel}</p>
                        </div>
                    </div>
                    <div className="my-6 h-px w-full bg-pronix-border" />
                    <div className="flex flex-col gap-3">
                        <button
                            type="button"
                            onClick={onReserve}
                            className={cn(
                                "flex w-full cursor-pointer items-center justify-center border border-pronix-ink px-6 py-4 md:py-5",
                                "bg-transparent text-pronix-ink transition-colors duration-200",
                                "hover:bg-pronix-ink hover:text-white",
                                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pronix-ink/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
                            )}
                            data-node-id="515:6169"
                        >
                            <span className="font-aeonik-medium whitespace-nowrap not-italic text-base leading-[17.15px] md:text-lg">
                                {resolveLanguageKey("reserveOnline")}
                            </span>
                        </button>
                        <button
                            type="button"
                            onClick={handleDownloadBrochure}
                            disabled={downloadingBrochure}
                            className={cn(
                                "flex w-full cursor-pointer items-center justify-center border border-pronix-ink px-6 py-4 md:py-5",
                                "bg-transparent text-pronix-ink transition-colors duration-200",
                                "hover:bg-pronix-ink hover:text-white",
                                "disabled:cursor-wait disabled:opacity-70",
                                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pronix-ink/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
                            )}
                            data-node-id="515:6170"
                        >
                            <span className="font-aeonik-medium whitespace-nowrap not-italic text-base leading-[17.15px] md:text-lg">
                                {downloadingBrochure
                                    ? resolveLanguageKey("downloadingBrochure")
                                    : resolveLanguageKey("downloadBrochure")}
                            </span>
                        </button>
                    </div>
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

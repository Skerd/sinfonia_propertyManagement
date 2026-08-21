import {useState} from "react";
import {toast} from "sonner";
import {
    MarketingUnitSingle,
    MarketingUnitStatus,
    PublicLanguageProps,
} from "@propertyManagementModule/clients/client/public/shared/publicTypes.ts";
import {propertyAssets} from "@propertyManagementModule/clients/client/public/property/propertyAssets.ts";
import {resolveMarketingMediaUrl} from "@propertyManagementModule/clients/client/public/shared/resolveMarketingMedia.ts";
import {
    PUBLIC_SUBTITLE,
    PUBLIC_SUBTITLE_COMPACT,
    PUBLIC_TITLE,
    PUBLIC_TITLE_COMPACT,
} from "@propertyManagementModule/clients/client/public/shared/layout/publicLayoutTokens.ts";
import {cn} from "@coreModule/components/lib/utils.ts";
import apiClient from "@coreModule/helpers/axiosClients/apiClient.ts";

type PropertySidebarSectionProps = PublicLanguageProps & {
    unit: MarketingUnitSingle;
    onReserve: () => void;
    sticky?: boolean;
    compact?: boolean;
};

const MISSING_VALUE = "—";

const STATUS_LANGUAGE_KEYS: Record<MarketingUnitStatus, string> = {
    available: "statusAvailable",
    reserved: "statusReserved",
    sold: "statusSold",
};

const STATUS_DOT_CLASS: Record<MarketingUnitStatus, string> = {
    available: "bg-green-500",
    reserved: "bg-yellow-500",
    sold: "bg-red-500",
};

const STATUS_TEXT_CLASS: Record<MarketingUnitStatus, string> = {
    available: "text-green-600",
    reserved: "text-yellow-600",
    sold: "text-red-600",
};

function resolveUnitStatus(status: string | undefined): MarketingUnitStatus {
    if (status === "reserved" || status === "sold") {
        return status;
    }
    return "available";
}

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

function PropertySidebarSection({
    resolveLanguageKey,
    unit,
    onReserve,
    sticky = true,
    compact = false,
}: PropertySidebarSectionProps) {
    const [downloadingBrochure, setDownloadingBrochure] = useState(false);
    const priceLabel = formatUnitPrice(unit, resolveLanguageKey("priceOnRequest"));
    const areaLabel = unit.grossAreaSqm != null ? `${unit.grossAreaSqm} m²` : MISSING_VALUE;
    const roomsLabel = unit.bedrooms != null ? String(unit.bedrooms) : MISSING_VALUE;
    const bathsLabel = unit.bathrooms != null ? String(unit.bathrooms) : MISSING_VALUE;
    const floorLabel = formatFloorLabel(unit);
    const orientationLabel = unit.orientation ?? MISSING_VALUE;
    const unitTypeLabel = unit.unitTypeName?.trim() || MISSING_VALUE;
    const specImage = resolveMarketingMediaUrl(unit.floorPlanImage) ?? propertyAssets.specArea;
    const unitStatus = resolveUnitStatus(unit.status);
    const canReserve = unitStatus === "available";
    const subtitleClass = compact ? PUBLIC_SUBTITLE_COMPACT : PUBLIC_SUBTITLE;
    const titleClass = compact ? PUBLIC_TITLE_COMPACT : PUBLIC_TITLE;
    const labelClass = compact
        ? "font-aeonik-medium text-sm text-pronix-ink-muted not-italic"
        : "font-aeonik-light text-base text-pronix-ink-muted not-italic md:text-xl";
    const buttonTextClass = compact
        ? "font-aeonik-light whitespace-nowrap not-italic text-sm leading-[17.15px]"
        : "font-aeonik-medium whitespace-nowrap not-italic text-base leading-[17.15px] md:text-lg";

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
        <div
            className={cn("relative w-full", sticky && "sticky top-0 z-[1] lg:top-6")}
            data-node-id="515:6253"
        >
            <div
                className={cn(
                    "relative overflow-hidden rounded-[5px] border border-pronix-border bg-white",
                    compact ? "p-4 md:p-5" : "p-5 md:p-6",
                )}
                data-node-id="515:6120"
            >
                <div
                    className={cn(
                        "absolute flex items-center gap-2 rounded-[5px] border border-pronix-border px-3 py-1.5",
                        compact ? "right-4 top-4 md:right-5 md:top-5" : "right-5 top-5 px-4 py-2 md:right-6 md:top-9",
                    )}
                    data-node-id="515:6144"
                >
                    <span className={cn("size-2.5 rounded-full", STATUS_DOT_CLASS[unitStatus])} />
                    <span
                        className={cn(
                            "font-aeonik-light not-italic",
                            compact ? "text-sm" : "text-base md:text-lg",
                            STATUS_TEXT_CLASS[unitStatus],
                        )}
                    >
                        {resolveLanguageKey(STATUS_LANGUAGE_KEYS[unitStatus])}
                    </span>
                </div>
                <div className="pt-2" data-node-id="515:6174">
                    <div data-node-id="515:6139">
                        <p className={`${subtitleClass} text-pronix-ink`}>
                            {resolveLanguageKey("price")}
                        </p>
                        <p className={`mt-2 ${titleClass} leading-[1.1] text-pronix-ink`}>
                            {priceLabel}
                        </p>
                    </div>
                    <div className={cn("h-px w-full bg-pronix-border", compact ? "my-4" : "my-6")} />
                    <div
                        className={cn("grid grid-cols-2 sm:grid-cols-3", compact ? "gap-3" : "gap-6")}
                        data-node-id="515:6149"
                    >
                        <div>
                            <p className={labelClass}>{resolveLanguageKey("area")}</p>
                            <p className={`${subtitleClass} text-pronix-ink`}>{areaLabel}</p>
                        </div>
                        <div>
                            <p className={labelClass}>{resolveLanguageKey("orientation")}</p>
                            <p className={`${subtitleClass} text-pronix-ink`}>{orientationLabel}</p>
                        </div>
                        <div>
                            <p className={labelClass}>{resolveLanguageKey("rooms")}</p>
                            <p className={`${subtitleClass} text-pronix-ink`}>{roomsLabel}</p>
                        </div>
                        <div>
                            <p className={labelClass}>{resolveLanguageKey("floor")}</p>
                            <p className={`${subtitleClass} text-pronix-ink`}>{floorLabel}</p>
                        </div>
                        <div>
                            <p className={labelClass}>{resolveLanguageKey("baths")}</p>
                            <p className={`${subtitleClass} text-pronix-ink`}>{bathsLabel}</p>
                        </div>
                        <div>
                            <p className={labelClass}>{resolveLanguageKey("unitType")}</p>
                            <p className={`${subtitleClass} text-pronix-ink`}>{unitTypeLabel}</p>
                        </div>
                    </div>
                    <div className={cn("h-px w-full bg-pronix-border", compact ? "my-4" : "my-6")} />
                    <div className="flex flex-col gap-3">
                        {canReserve ? (
                            <button
                                type="button"
                                onClick={onReserve}
                                className={cn(
                                    "flex w-full cursor-pointer items-center justify-center border border-pronix-ink",
                                    compact ? "px-4 py-3" : "px-6 py-4 md:py-5",
                                    "bg-transparent text-pronix-ink transition-colors duration-200",
                                    "hover:bg-pronix-ink hover:text-white",
                                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pronix-ink/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
                                )}
                                data-node-id="515:6169"
                            >
                                <span className={buttonTextClass}>
                                    {resolveLanguageKey("reserveOnline")}
                                </span>
                            </button>
                        ) : null}
                        <button
                            type="button"
                            onClick={handleDownloadBrochure}
                            disabled={downloadingBrochure}
                            className={cn(
                                "flex w-full cursor-pointer items-center justify-center border border-pronix-ink",
                                compact ? "px-4 py-3" : "px-6 py-4 md:py-5",
                                "bg-transparent text-pronix-ink transition-colors duration-200",
                                "hover:bg-pronix-ink hover:text-white",
                                "disabled:cursor-wait disabled:opacity-70",
                                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pronix-ink/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
                            )}
                            data-node-id="515:6170"
                        >
                            <span className={buttonTextClass}>
                                {downloadingBrochure
                                    ? resolveLanguageKey("downloadingBrochure")
                                    : resolveLanguageKey("downloadBrochure")}
                            </span>
                        </button>
                    </div>
                </div>
                <div
                    className={cn(
                        "overflow-hidden rounded-[5px] border border-pronix-border",
                        compact ? "mt-4" : "mt-6 md:mt-8",
                    )}
                    data-node-id="550:1943"
                >
                    <img
                        alt=""
                        aria-hidden
                        className={cn("aspect-[559/384] w-full object-contain bg-white", compact ? "p-2" : "p-4")}
                        src={specImage}
                    />
                </div>
            </div>
        </div>
    );
}

export default PropertySidebarSection;

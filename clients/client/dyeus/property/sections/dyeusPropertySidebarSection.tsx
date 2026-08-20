import {useState} from "react";
import {toast} from "sonner";
import {cn} from "@coreModule/components/lib/utils.ts";
import apiClient from "@coreModule/helpers/axiosClients/apiClient.ts";
import {dyeusAssets} from "@propertyManagementModule/clients/client/dyeus/shared/dyeusAssets.ts";
import {resolveMarketingMediaUrl} from "@propertyManagementModule/clients/client/public/shared/resolveMarketingMedia.ts";
import type {MarketingUnitSingle} from "@propertyManagementModule/clients/client/public/shared/publicTypes.ts";
import {
    MISSING_VALUE,
    formatAreaSqm,
    formatCount,
    formatFloor,
    formatUnitPrice,
    type DyeusPropertyCopy,
} from "@propertyManagementModule/clients/client/dyeus/property/dyeusPropertyFormat.ts";

type DyeusPropertySidebarSectionProps = {
    unit: MarketingUnitSingle;
    t: DyeusPropertyCopy;
    onReserve: () => void;
};

const STATUS_KEYS: Record<string, string> = {
    available: "statusAvailable",
    reserved: "statusReserved",
    sold: "statusSold",
};

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

function Spec({label, value}: {label: string; value: string}) {
    return (
        <div>
            <p className="font-dyeus-sans text-xs uppercase tracking-[0.18em] text-dyeus-ink-muted md:text-sm">
                {label}
            </p>
            <p className="mt-1 font-dyeus-serif text-lg leading-[1.2] text-dyeus-ink md:text-2xl">{value}</p>
        </div>
    );
}

function DyeusPropertySidebarSection({unit, t, onReserve}: DyeusPropertySidebarSectionProps) {
    const [downloadingBrochure, setDownloadingBrochure] = useState(false);
    const priceLabel = formatUnitPrice(unit, t("priceOnRequest"));
    const specImage =
        resolveMarketingMediaUrl(unit.floorPlanImage) ?? dyeusAssets.aboutPlan;
    const statusKey = STATUS_KEYS[unit.status] ?? "statusAvailable";
    const statusLabel = t(statusKey);

    const handleDownloadBrochure = async () => {
        if (downloadingBrochure) return;
        setDownloadingBrochure(true);
        try {
            const response = await apiClient.post(
                "/api/realEstate/marketingUnit/brochure",
                {projectId: unit.projectId, unitId: unit._id},
                {responseType: "blob"},
            );
            const blob =
                response.data instanceof Blob
                    ? response.data
                    : new Blob([response.data], {type: "application/pdf"});

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
            toast.error(t("brochureError"));
        } finally {
            setDownloadingBrochure(false);
        }
    };

    return (
        <div className="relative w-full lg:sticky lg:top-6">
            <div className="relative border border-dyeus-border bg-dyeus-white p-5 md:p-6">
                <div
                    className={cn(
                        "absolute right-5 top-5 flex items-center gap-2 border px-4 py-2 md:right-6 md:top-8",
                        unit.status === "available" && "border-dyeus-available/30 bg-[rgba(18,183,106,0.1)]",
                        unit.status === "reserved" && "border-amber-700/30 bg-amber-700/10",
                        unit.status !== "available" && unit.status !== "reserved" && "border-dyeus-border",
                    )}
                >
                    {unit.status === "available" ? (
                        <img src={dyeusAssets.iconAvailable} alt="" className="size-[18px]" />
                    ) : (
                        <span
                            className={cn(
                                "size-2.5 rounded-full",
                                unit.status === "reserved" ? "bg-amber-700" : "bg-dyeus-ink/50",
                            )}
                        />
                    )}
                    <span className="font-dyeus-serif text-sm font-bold leading-[1.2] text-dyeus-ink md:text-lg">
                        {statusLabel}
                    </span>
                </div>

                <div className="pt-2">
                    <p className="font-dyeus-sans text-xs uppercase tracking-[0.2em] text-dyeus-ink-muted">
                        {t("price")}
                    </p>
                    <p className="mt-3 max-w-[70%] font-dyeus-serif text-4xl font-bold leading-[1.1] text-dyeus-ink sm:text-5xl md:text-[56px]">
                        {priceLabel}
                    </p>
                    <div className="my-6 h-px w-full bg-dyeus-border" />
                    <div className="grid grid-cols-2 gap-6 sm:grid-cols-3">
                        <Spec label={t("area")} value={formatAreaSqm(unit.grossAreaSqm ?? unit.areaSqm)} />
                        <Spec label={t("orientation")} value={unit.orientation ?? MISSING_VALUE} />
                        <Spec label={t("bedrooms")} value={formatCount(unit.bedrooms)} />
                        <Spec label={t("floor")} value={formatFloor(unit)} />
                        <Spec label={t("bathrooms")} value={formatCount(unit.bathrooms)} />
                        <Spec label={t("unitType")} value={unit.unitTypeName?.trim() || MISSING_VALUE} />
                    </div>
                    <div className="my-6 h-px w-full bg-dyeus-border" />
                    <div className="flex flex-col gap-3">
                        <button
                            type="button"
                            onClick={onReserve}
                            className={cn(
                                "flex w-full cursor-pointer items-center justify-center border border-dyeus-ink px-6 py-4 md:py-5",
                                "bg-transparent text-dyeus-ink transition-colors duration-200",
                                "hover:bg-dyeus-ink hover:text-dyeus-cream",
                                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dyeus-ink/40 focus-visible:ring-offset-2 focus-visible:ring-offset-dyeus-white",
                            )}
                        >
                            <span className="whitespace-nowrap font-dyeus-sans text-xs uppercase tracking-[0.2em] md:text-sm">
                                {t("reserveOnline")}
                            </span>
                        </button>
                        <button
                            type="button"
                            onClick={handleDownloadBrochure}
                            disabled={downloadingBrochure}
                            className={cn(
                                "flex w-full cursor-pointer items-center justify-center border border-dyeus-ink px-6 py-4 md:py-5",
                                "bg-transparent text-dyeus-ink transition-colors duration-200",
                                "hover:bg-dyeus-ink hover:text-dyeus-cream",
                                "disabled:cursor-wait disabled:opacity-70",
                                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dyeus-ink/40 focus-visible:ring-offset-2 focus-visible:ring-offset-dyeus-white",
                            )}
                        >
                            <span className="whitespace-nowrap font-dyeus-sans text-xs uppercase tracking-[0.2em] md:text-sm">
                                {downloadingBrochure ? t("downloadingBrochure") : t("downloadBrochure")}
                            </span>
                        </button>
                    </div>
                </div>

                <div className="mt-6 overflow-hidden border border-dyeus-border bg-dyeus-cream md:mt-8">
                    <img
                        alt=""
                        aria-hidden
                        className="aspect-[559/384] w-full object-contain p-4"
                        src={specImage}
                    />
                </div>
            </div>
        </div>
    );
}

export default DyeusPropertySidebarSection;

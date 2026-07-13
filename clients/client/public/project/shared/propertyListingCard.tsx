import {Link} from "react-router-dom";
import PublicFavoriteHeartButton from "@propertyManagementModule/clients/client/public/shared/favorites/publicFavoriteHeartButton.tsx";
import {projectsAssets} from "@propertyManagementModule/clients/client/public/projects/projectsAssets.ts";
import {MarketingUnitStatus} from "@propertyManagementModule/clients/client/public/shared/publicTypes.ts";
import {
    PUBLIC_CARD_TITLE,
    PUBLIC_SUBTITLE,
} from "@propertyManagementModule/clients/client/public/shared/layout/publicLayoutTokens.ts";

import {PropertyTypeId} from "@propertyManagementModule/clients/client/public/projects/shared/projectsFilterTypes.ts";

export type PropertyListingCardUnit = {
    _id: string;
    name: string;
    status: MarketingUnitStatus | string;
    areaSqm?: number;
    bedrooms?: number;
    bathrooms?: number;
    floorLabel?: string;
    floorId?: string;
    orientation?: string;
    price?: number;
    propertyType?: PropertyTypeId;
    imageUrl?: string;
};

type PropertyListingCardProps = {
    unit: PropertyListingCardUnit;
    projectId: string;
    availableLabel: string;
    soldLabel: string;
    reservedLabel: string;
    areaLabel: string;
    roomsLabel: string;
    floorLabel: string;
    bathsLabel: string;
    orientationLabel: string;
    favoriteAddLabel?: string;
    favoriteRemoveLabel?: string;
    projectName?: string;
    nodeId?: string;
    variant?: "grid" | "compact";
};

function statusLabel(status: string, availableLabel: string, soldLabel: string, reservedLabel: string) {
    if (status === "available") return availableLabel;
    if (status === "sold") return soldLabel;
    if (status === "reserved") return reservedLabel;
    return status;
}

function statusOverlayClassName(status: string): string {
    if (status === "available") {
        return "rounded-full bg-[rgba(91,184,93,0.4)] px-4 py-2 font-aeonik-light text-base leading-[1.2] text-white backdrop-blur-[17px]";
    }
    if (status === "reserved") {
        return "rounded-full bg-[rgba(245,158,11,0.45)] px-4 py-2 font-aeonik-light text-base leading-[1.2] text-white backdrop-blur-[17px]";
    }
    if (status === "sold") {
        return "rounded-full bg-[rgba(24,24,24,0.45)] px-4 py-2 font-aeonik-light text-base leading-[1.2] text-white backdrop-blur-[17px]";
    }
    return "rounded-full bg-[rgba(24,24,24,0.45)] px-4 py-2 font-aeonik-light text-base leading-[1.2] text-white backdrop-blur-[17px]";
}

function PropertyListingCard({
    unit,
    projectId,
    availableLabel,
    soldLabel,
    reservedLabel,
    areaLabel,
    roomsLabel,
    floorLabel,
    bathsLabel,
    orientationLabel,
    favoriteAddLabel,
    favoriteRemoveLabel,
    projectName,
    nodeId,
    variant = "grid",
}: PropertyListingCardProps) {
    const image = unit.imageUrl ?? projectsAssets.cardPlaceholder;
    const statusText = statusLabel(unit.status, availableLabel, soldLabel, reservedLabel);
    const priceText = unit.price != null ? `€${unit.price.toLocaleString()}` : "—";
    const areaText = unit.areaSqm != null ? `${unit.areaSqm} m²` : "—";
    const roomsText = unit.bedrooms != null ? String(unit.bedrooms) : "—";
    const bathsText = unit.bathrooms != null ? String(unit.bathrooms) : "—";

    if (variant === "compact") {
        return (
            <Link
                to={`/property?projectId=${projectId}&unitId=${unit._id}`}
                className="relative flex w-full min-w-0 overflow-hidden rounded-[5px] border border-[rgba(24,24,24,0.1)] bg-white transition hover:shadow-md"
                data-node-id={nodeId}
            >
                <div className="relative aspect-[230/182] w-[40%] min-w-[7.5rem] shrink-0 overflow-hidden sm:max-w-[45%]">
                    <img alt={unit.name} className="size-full object-cover" src={image} />
                </div>
                <div className="flex min-w-0 flex-1 flex-col px-3 py-3">
                    <div className="flex min-w-0 items-center justify-between gap-2">
                        <p className="min-w-0 truncate font-aeonik-medium text-lg leading-[1.2] text-pronix-ink not-italic sm:text-2xl">
                            {unit.name}
                        </p>
                        <span className="inline-flex shrink-0 items-center gap-1 font-aeonik-light text-xs text-pronix-ink not-italic">
                            <span className="size-2 rounded-full bg-pronix-blue" />
                            {statusText}
                        </span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-4 sm:gap-7">
                        <div className="min-w-0">
                            <p className="font-aeonik-light text-sm text-pronix-ink-muted not-italic">{areaLabel}</p>
                            <p className="font-aeonik-medium text-base text-pronix-ink not-italic sm:text-lg">{areaText}</p>
                        </div>
                        <div className="min-w-0">
                            <p className="font-aeonik-light text-sm text-pronix-ink-muted not-italic">{roomsLabel}</p>
                            <p className="font-aeonik-medium text-base text-pronix-ink not-italic sm:text-lg">{roomsText}</p>
                        </div>
                        <div className="min-w-0">
                            <p className="font-aeonik-light text-sm text-pronix-ink-muted not-italic">{bathsLabel}</p>
                            <p className="font-aeonik-medium text-base text-pronix-ink not-italic sm:text-lg">{bathsText}</p>
                        </div>
                    </div>
                    <p className="mt-auto text-center font-aeonik-medium text-base text-pronix-ink not-italic sm:text-lg">
                        {priceText}
                    </p>
                </div>
            </Link>
        );
    }

    return (
        <Link
            to={`/property?projectId=${projectId}&unitId=${unit._id}`}
            className="relative flex w-full min-w-0 flex-col overflow-hidden rounded-[5px] border border-pronix-border bg-white transition duration-300 hover:-translate-y-1 hover:shadow-lg"
            data-node-id={nodeId}
        >
            <div className="flex flex-col gap-5 p-4 sm:gap-6 sm:p-6">
                <div className="relative w-full" data-node-id="495:674">
                    <div className="relative aspect-[515/449] min-h-[12.5rem] w-full overflow-hidden rounded-[2px]">
                        <img alt={unit.name} className="size-full object-cover" src={image} />
                    </div>
                    <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-4">
                        <div className="pointer-events-auto flex flex-wrap gap-2">
                            <span className={statusOverlayClassName(unit.status)} data-node-id="497:927">
                                {statusText}
                            </span>
                        </div>
                        {favoriteAddLabel && favoriteRemoveLabel ? (
                            <PublicFavoriteHeartButton
                                kind="unit"
                                projectId={projectId}
                                projectName={projectName}
                                unit={unit}
                                addLabel={favoriteAddLabel}
                                removeLabel={favoriteRemoveLabel}
                                nodeId="545:1735"
                            />
                        ) : (
                            <div
                                className="pointer-events-auto flex size-9 shrink-0 items-center justify-center rounded-full border border-[rgba(24,24,24,0.1)] bg-white"
                                data-node-id="545:1735"
                            >
                                <img alt="" aria-hidden className="size-6" src={projectsAssets.heartOutline} />
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex min-w-0 flex-col gap-2" data-node-id="497:926">
                    <h2 className={`${PUBLIC_CARD_TITLE} wrap-break-word`}>{unit.name}</h2>
                    <p className={`${PUBLIC_SUBTITLE} wrap-break-word text-pronix-ink-muted`}>
                        {unit.floorLabel ?? "—"}
                    </p>
                </div>

                <div className="flex w-full min-w-0 flex-col" data-node-id="497:931">
                    <div className="flex flex-wrap gap-3">
                        <span className="inline-flex items-center gap-2 rounded-full border border-pronix-border px-4 py-2 font-aeonik-light text-base text-pronix-ink">
                            {areaLabel}: {areaText}
                        </span>
                        <span className="inline-flex items-center gap-2 rounded-full border border-pronix-border px-4 py-2 font-aeonik-light text-base text-pronix-ink">
                            <img alt="" aria-hidden className="size-5" src={projectsAssets.iconUnits} />
                            {roomsLabel}: {roomsText}
                        </span>
                        <span className="inline-flex items-center gap-2 rounded-full border border-pronix-border px-4 py-2 font-aeonik-light text-base text-pronix-ink">
                            {bathsLabel}: {bathsText}
                        </span>
                        {unit.orientation ? (
                            <span className="inline-flex items-center gap-2 rounded-full border border-pronix-border px-4 py-2 font-aeonik-light text-base text-pronix-ink">
                                {orientationLabel}: {unit.orientation}
                            </span>
                        ) : null}
                    </div>
                    <div className="mt-6 flex justify-center" data-node-id="497:950">
                        <p className="rounded-[2px] border border-pronix-blue px-3 py-3 font-aeonik-medium text-xl leading-[1.2] text-pronix-blue not-italic sm:text-2xl">
                            {priceText}
                        </p>
                    </div>
                </div>
            </div>
        </Link>
    );
}

export default PropertyListingCard;

import {Badge} from "@coreModule/components/ui/badge.tsx";
import {cn} from "@coreModule/components/lib/utils.ts";

export type UnitAvailabilityStatus =
    | "available_unit"
    | "reserved_unit"
    | "sold_unit"
    | "unavailable_unit"
    | "rented_unit"
    | string;

const STATUS_STYLE: Record<string, string> = {
    sold_unit: "border-status-sold text-status-sold bg-status-sold/10",
    reserved_unit: "border-status-reserved text-status-reserved bg-status-reserved/10",
    available_unit: "border-status-available text-status-available bg-status-available/10",
    unavailable_unit: "border-status-blocked text-status-blocked bg-status-blocked/10",
    rented_unit: "border-violet-500 text-violet-600 dark:text-violet-400 bg-violet-500/10",
};

const STATUS_LABEL_KEY: Record<string, string> = {
    sold_unit: "statusSold",
    reserved_unit: "statusReserved",
    available_unit: "statusAvailable",
    unavailable_unit: "statusUnavailable",
    rented_unit: "statusLeased",
};

type UnitStatusBadgeProps = {
    status: UnitAvailabilityStatus;
    resolveLanguageKey: (key: string) => string;
    /** Overlay on media header (white text on colored pill). */
    variant?: "default" | "overlay";
    className?: string;
};

export function UnitStatusBadge({
    status,
    resolveLanguageKey,
    variant = "default",
    className,
}: UnitStatusBadgeProps) {
    const labelKey = STATUS_LABEL_KEY[status] ?? "statusUnknown";
    const label = resolveLanguageKey(labelKey);

    if (variant === "overlay") {
        const overlayTone =
            status === "available_unit"
                ? "bg-status-available/90"
                : status === "reserved_unit"
                  ? "bg-status-reserved/90"
                  : status === "sold_unit"
                    ? "bg-status-sold/90"
                    : status === "rented_unit"
                      ? "bg-violet-500/90"
                      : "bg-status-blocked/90";
        return (
            <span
                className={cn(
                    "shrink-0 text-xs px-2 py-0.5 rounded-full font-semibold text-white mb-0.5",
                    overlayTone,
                    className,
                )}
            >
                {label}
            </span>
        );
    }

    return (
        <Badge
            variant="outline"
            className={cn("shrink-0 text-xs font-medium", STATUS_STYLE[status], className)}
        >
            {label}
        </Badge>
    );
}

export function resolveUnitStatusKey(
    status: string | undefined,
    isAvailable: boolean | undefined,
): "available" | "reserved" | "sold" | "leased" | "notAvailable" | null {
    if (status == null && isAvailable == null) return null;
    const resolved = status || (isAvailable ? "available_unit" : "unavailable_unit");
    switch (resolved) {
        case "available_unit":
            return "available";
        case "unavailable_unit":
            return "notAvailable";
        case "reserved_unit":
            return "reserved";
        case "sold_unit":
            return "sold";
        case "rented_unit":
            return "leased";
        default:
            return isAvailable ? "available" : "notAvailable";
    }
}

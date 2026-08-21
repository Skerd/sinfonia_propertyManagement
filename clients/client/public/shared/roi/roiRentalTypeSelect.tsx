import type {RentalType} from "@propertyManagementModule/clients/client/public/shared/roi/calculateRoi.ts";
import {cn} from "@coreModule/components/lib/utils.ts";

type RoiRentalTypeSelectProps = {
    value: RentalType;
    onChange: (value: RentalType) => void;
    longTermLabel: string;
    shortTermLabel: string;
    label: string;
    compact?: boolean;
};

function RoiRentalTypeSelect({
    value,
    onChange,
    longTermLabel,
    shortTermLabel,
    label,
    compact = false,
}: RoiRentalTypeSelectProps) {
    return (
        <div>
            <p
                className={cn(
                    "text-pronix-ink not-italic",
                    compact
                        ? "font-aeonik-light text-sm"
                        : "font-aeonik-medium text-lg md:text-2xl",
                )}
            >
                {label}
            </p>
            <div className={cn("flex rounded-[5px] border border-pronix-border p-1", compact ? "mt-1.5" : "mt-2")}>
                <button
                    type="button"
                    onClick={() => onChange("long-term")}
                    className={cn(
                        "flex-1 rounded-[3px] font-aeonik-light text-pronix-ink not-italic transition",
                        compact ? "px-2 py-1.5 text-sm" : "px-3 py-2 text-base md:text-xl",
                        value === "long-term" ? "bg-pronix-blue text-white" : "hover:bg-pronix-ink/5",
                    )}
                >
                    {longTermLabel}
                </button>
                <button
                    type="button"
                    onClick={() => onChange("short-term")}
                    className={cn(
                        "flex-1 rounded-[3px] font-aeonik-light text-pronix-ink not-italic transition",
                        compact ? "px-2 py-1.5 text-sm" : "px-3 py-2 text-base md:text-xl",
                        value === "short-term" ? "bg-pronix-blue text-white" : "hover:bg-pronix-ink/5",
                    )}
                >
                    {shortTermLabel}
                </button>
            </div>
        </div>
    );
}

export default RoiRentalTypeSelect;

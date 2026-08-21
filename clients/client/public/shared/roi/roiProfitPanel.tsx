import type {ReactNode} from "react";
import {
    PUBLIC_SUBTITLE,
    PUBLIC_TITLE,
} from "@propertyManagementModule/clients/client/public/shared/layout/publicLayoutTokens.ts";
import type {RoiCalculationResult} from "@propertyManagementModule/clients/client/public/shared/roi/calculateRoi.ts";
import {formatEuro, formatYearsShort} from "@propertyManagementModule/clients/client/public/shared/roi/formatRoiValue.ts";
import {cn} from "@coreModule/components/lib/utils.ts";

export type RoiProfitRow = {
    label: string;
    value: string;
    bordered?: boolean;
};

type RoiProfitPanelProps = {
    variant: "home" | "property";
    results: RoiCalculationResult;
    holdingPeriod: number;
    title?: string;
    totalReturnLabel?: string;
    rows?: RoiProfitRow[];
    footer?: ReactNode;
    disclaimer?: string;
    dataNodeId?: string;
    compact?: boolean;
};

function defaultHomeRows(results: RoiCalculationResult, holdingPeriod: number): RoiProfitRow[] {
    return [
        {label: "Annual rental", value: formatEuro(results.annualGross), bordered: true},
        {label: "Capital appreciation", value: formatEuro(results.capitalGain), bordered: true},
        {label: "Holding period", value: formatYearsShort(holdingPeriod), bordered: false},
    ];
}

function defaultPropertyRows(results: RoiCalculationResult, holdingPeriod: number): RoiProfitRow[] {
    return [
        {label: "Annual Gross Income:", value: formatEuro(results.annualGross), bordered: true},
        {label: "Annual Net Income:", value: formatEuro(results.annualNet), bordered: true},
        {label: `Capital Gain (${Math.round(holdingPeriod)} yr):`, value: formatEuro(results.capitalGain), bordered: true},
        {label: "Monthly net:", value: formatEuro(results.monthlyNet), bordered: false},
    ];
}

function RoiProfitPanel({
    variant,
    results,
    holdingPeriod,
    title = "Profit",
    totalReturnLabel = "Total return",
    rows,
    footer,
    disclaimer,
    dataNodeId,
    compact = false,
}: RoiProfitPanelProps) {
    const displayRows =
        rows ?? (variant === "home" ? defaultHomeRows(results, holdingPeriod) : defaultPropertyRows(results, holdingPeriod));

    if (variant === "home") {
        return (
            <div className="flex w-full cursor-default flex-col bg-[#0247fe] p-6 sm:p-8 md:p-10 lg:w-1/2 lg:min-h-[min(70vh,42rem)]" data-node-id={dataNodeId}>
                <p className="mb-8 cursor-default text-center font-aeonik-medium text-white not-italic text-xl md:text-2xl leading-[1.1] lg:mb-14">
                    {title}
                </p>
                <div className="mx-auto flex w-full max-w-xl flex-col gap-10 md:gap-16">
                    <div className="flex w-full flex-col items-start not-italic gap-6 md:gap-6">
                        <div className="flex w-full flex-col items-start gap-3 text-white leading-[1.1]">
                            <p className="font-aeonik-medium w-full cursor-default text-lg md:text-2xl">{totalReturnLabel}</p>
                            <p className={`font-kamerik-bold w-full ${PUBLIC_TITLE} !text-white`}>
                                {formatEuro(results.totalReturn)}
                            </p>
                        </div>
                        <div className="flex w-full flex-col items-start gap-4 whitespace-nowrap text-pronix-cream text-base md:text-xl md:gap-6">
                            {displayRows.map((row) => (
                                <div
                                    key={row.label}
                                    className={`flex w-full cursor-default items-center justify-between px-2 py-3 md:px-[10px] md:py-4 ${row.bordered !== false ? "border-b border-[#f5ede4]" : ""}`}
                                >
                                    <p className="font-aeonik-medium cursor-default">{row.label}</p>
                                    <p className="font-kamerik-bold cursor-default">{row.value}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                    {footer}
                </div>
                {disclaimer && (
                    <p className="mt-8 hidden cursor-default font-aeonik-light text-center text-white not-italic text-xs leading-[1.1] md:mt-auto md:block md:pt-8 lg:mx-auto lg:max-w-[min(100%,29rem)]">
                        {disclaimer}
                    </p>
                )}
            </div>
        );
    }

    return (
        <div className={cn("bg-[#0247fe]", compact ? "p-5 md:p-7" : "p-6 md:p-8")} data-node-id={dataNodeId}>
            <p
                className={cn(
                    "text-center text-white not-italic",
                    compact ? "font-aeonik-medium text-sm" : `text-center ${PUBLIC_SUBTITLE} text-white`,
                )}
            >
                {title}
            </p>
            <div className={cn("text-white", compact ? "mt-4 md:px-12" : "mt-6")}>
                <p
                    className={cn(
                        "not-italic",
                        compact ? "font-aeonik-light text-sm" : "font-aeonik-medium text-lg md:text-2xl",
                    )}
                >
                    {totalReturnLabel}
                </p>
                <p
                    className={cn(
                        "mt-2 not-italic",
                        compact
                            ? "font-aeonik-medium text-base leading-[1.2]"
                            : "font-aeonik-medium text-3xl leading-[1.1] md:text-5xl",
                    )}
                >
                    {formatEuro(results.totalReturn)}
                </p>
                <div
                    className={cn(
                        "flex flex-col",
                        compact ? "mt-4 gap-2.5" : "mt-6 gap-4 text-base md:text-2xl",
                    )}
                >
                    {displayRows.map((row) => (
                        <div
                            key={row.label}
                            className={cn(
                                "flex items-center justify-between border-b border-white/20",
                                compact ? "pb-2" : "pb-4",
                            )}
                        >
                            <span
                                className={cn(
                                    "font-aeonik-light not-italic",
                                    compact && "text-sm",
                                )}
                            >
                                {row.label}
                            </span>
                            <span
                                className={cn(
                                    "not-italic",
                                    compact ? "font-aeonik-light text-sm" : "font-aeonik-medium",
                                )}
                            >
                                {row.value}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
            {disclaimer && (
                <p
                    className={cn(
                        "font-aeonik-light text-white not-italic leading-[1.1]",
                        compact ? "mt-5 text-sm md:px-12" : "mt-8 text-sm md:text-base",
                    )}
                >
                    {disclaimer}
                </p>
            )}
        </div>
    );
}

export default RoiProfitPanel;

import type {ReactNode} from "react";
import {PUBLIC_SUBTITLE, PUBLIC_TITLE} from "@propertyManagementModule/clients/client/public/shared/layout/publicLayoutTokens.ts";
import type {RoiCalculationResult} from "@propertyManagementModule/clients/client/public/shared/roi/calculateRoi.ts";
import {formatEuro, formatYearsShort} from "@propertyManagementModule/clients/client/public/shared/roi/formatRoiValue.ts";

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
                            <p className={`font-kamerik-bold w-full ${PUBLIC_TITLE}`}>
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
                    <p className="mt-8 cursor-default font-aeonik-light text-center text-white not-italic text-xs leading-[1.1] md:mt-auto md:pt-8 lg:mx-auto lg:max-w-[min(100%,29rem)]">
                        {disclaimer}
                    </p>
                )}
            </div>
        );
    }

    return (
        <div className="bg-[#0247fe] p-6 md:p-8" data-node-id={dataNodeId}>
            <p className={`text-center ${PUBLIC_SUBTITLE} text-white`}>{title}</p>
            <div className="mt-6 text-white">
                <p className="font-aeonik-medium text-lg md:text-2xl">{totalReturnLabel}</p>
                <p className="mt-2 font-aeonik-medium text-3xl leading-[1.1] md:text-5xl">{formatEuro(results.totalReturn)}</p>
                <div className="mt-6 flex flex-col gap-4 text-base md:text-2xl">
                    {displayRows.map((row) => (
                        <div key={row.label} className="flex items-center justify-between border-b border-white/20 pb-4">
                            <span className="font-aeonik-light not-italic">{row.label}</span>
                            <span className="font-aeonik-medium not-italic">{row.value}</span>
                        </div>
                    ))}
                </div>
            </div>
            {disclaimer && (
                <p className="mt-8 font-aeonik-light text-sm text-white not-italic md:text-base leading-[1.1]">{disclaimer}</p>
            )}
        </div>
    );
}

export default RoiProfitPanel;

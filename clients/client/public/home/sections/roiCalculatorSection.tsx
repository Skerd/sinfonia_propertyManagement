import {Link} from "react-router-dom";
import {cn} from "@coreModule/components/lib/utils.ts";
import {
    PUBLIC_SUBTITLE,
    PUBLIC_TITLE,
} from "@propertyManagementModule/clients/client/public/shared/layout/publicLayoutTokens.ts";
import type {PublicLanguageProps} from "@propertyManagementModule/clients/client/public/shared/publicTypes.ts";
import {
    formatEuro,
    formatPercent,
    formatYears,
    formatYearsShort,
} from "@propertyManagementModule/clients/client/public/shared/roi/formatRoiValue.ts";
import RoiFigmaSlider from "@propertyManagementModule/clients/client/public/shared/roi/roiFigmaSlider.tsx";
import RoiProfitPanel from "@propertyManagementModule/clients/client/public/shared/roi/roiProfitPanel.tsx";
import {useShareRoiCalculator} from "@propertyManagementModule/clients/client/public/shared/roi/useShareRoiCalculator.ts";

type RoiCalculatorSectionProps = Pick<PublicLanguageProps, "resolveLanguageKey">;

function RoiCalculatorSection({resolveLanguageKey}: RoiCalculatorSectionProps) {
    const {inputs, setInput, results, sliderBounds} = useShareRoiCalculator();
    const t = (key: string) => String(resolveLanguageKey(key));
    const yearLabels = {singular: t("roiYearCapital"), plural: t("roiYearsCapital")};
    const yearLabelsShort = {singular: t("roiYear"), plural: t("roiYears")};

    return (
        <div className="relative w-full" data-node-id="94:255">
            <div className="flex w-full flex-col items-center gap-4 text-center md:gap-6 lg:gap-8" data-node-id="94:256">
                <p className={`w-full ${PUBLIC_TITLE}`} data-node-id="94:257">
                    {t("roiTitle")}
                </p>
                <p className={`max-w-3xl ${PUBLIC_SUBTITLE} text-pronix-ink-muted`} data-node-id="94:258">
                    {t("roiSubtitle")}
                </p>
            </div>

            <div
                className="mt-6 flex w-full flex-col overflow-hidden rounded-[5px] border border-[rgba(24,24,24,0.2)] md:mt-8 lg:flex-row"
                data-node-id="94:259"
            >
                <div className="flex w-full flex-col bg-white p-6 sm:p-8 md:p-10 lg:w-1/2 lg:min-h-[min(70vh,42rem)]" data-node-id="94:282">
                    <p
                        className="mb-8 cursor-default text-center font-aeonik-medium text-pronix-ink not-italic text-xl md:text-2xl leading-[1.1] lg:mb-12"
                        data-node-id="94:284"
                    >
                        {t("roiCalculatorLabel")}
                    </p>
                    <div className="mx-auto flex w-full max-w-xl flex-col gap-8 md:gap-11" data-node-id="94:285">
                        <RoiFigmaSlider
                            dataNodeId="94:286"
                            label={t("roiShareAmount")}
                            value={inputs.shareAmount}
                            min={sliderBounds.shareAmount.min}
                            max={sliderBounds.shareAmount.max}
                            step={sliderBounds.shareAmount.step}
                            onChange={(value) => setInput("shareAmount", value)}
                            formatValue={formatEuro}
                            logoCentered
                        />
                        <RoiFigmaSlider
                            dataNodeId="94:296"
                            label={t("roiHoldPeriod")}
                            value={inputs.holdingPeriod}
                            min={sliderBounds.holdingPeriod.min}
                            max={sliderBounds.holdingPeriod.max}
                            step={sliderBounds.holdingPeriod.step}
                            onChange={(value) => setInput("holdingPeriod", value)}
                            formatValue={(value) => formatYears(value, yearLabels)}
                        />
                        <RoiFigmaSlider
                            dataNodeId="94:306"
                            label={t("roiProjectedYield")}
                            value={inputs.monthlyYield}
                            min={sliderBounds.monthlyYield.min}
                            max={sliderBounds.monthlyYield.max}
                            step={sliderBounds.monthlyYield.step}
                            onChange={(value) => setInput("monthlyYield", value)}
                            formatValue={formatEuro}
                            valueAlign="center"
                        />
                        <RoiFigmaSlider
                            dataNodeId="94:339"
                            label={t("roiAppreciationRate")}
                            value={inputs.annualAppreciation}
                            min={sliderBounds.annualAppreciation.min}
                            max={sliderBounds.annualAppreciation.max}
                            step={sliderBounds.annualAppreciation.step}
                            onChange={(value) => setInput("annualAppreciation", value)}
                            formatValue={formatPercent}
                        />
                    </div>
                </div>

                <RoiProfitPanel
                    variant="home"
                    results={results}
                    holdingPeriod={inputs.holdingPeriod}
                    title={t("roiProfit")}
                    totalReturnLabel={t("roiTotalReturn")}
                    rows={[
                        {label: t("roiAnnualRental"), value: formatEuro(results.annualGross), bordered: true},
                        {label: t("roiCapitalAppreciation"), value: formatEuro(results.capitalGain), bordered: true},
                        {label: t("roiHoldingPeriod"), value: formatYearsShort(inputs.holdingPeriod, yearLabelsShort), bordered: false},
                    ]}
                    dataNodeId="94:260"
                    disclaimer={t("roiDisclaimer")}
                    footer={
                        <div className="flex w-full flex-col items-center" data-node-id="94:277">
                            <Link
                                to="/projects"
                                className={cn(
                                    "flex w-full cursor-pointer items-center justify-center border border-white px-6 py-3 md:px-12 md:py-4",
                                    "bg-transparent text-white transition-colors duration-200",
                                    "hover:bg-white hover:text-pronix-blue",
                                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0247fe]",
                                )}
                                data-node-id="94:278"
                            >
                                <span className="font-aeonik-medium whitespace-nowrap text-center not-italic text-base leading-[17.15px] md:text-xl lg:text-[24px]">
                                    {t("roiCta")}
                                </span>
                            </Link>
                        </div>
                    }
                />
            </div>
        </div>
    );
}

export default RoiCalculatorSection;

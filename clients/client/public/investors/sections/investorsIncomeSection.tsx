import {PublicLanguageProps} from "@propertyManagementModule/clients/client/public/shared/publicTypes.ts";
import {investorsAssets} from "@propertyManagementModule/clients/client/public/investors/investorsAssets.ts";
import {
    FIGMA_INVESTORS_INCOME,
    figmaImageCropStyle,
} from "@propertyManagementModule/clients/client/public/shared/layout/figmaDimensions.ts";
import {
    PUBLIC_BODY,
    PUBLIC_CONTAINER,
} from "@propertyManagementModule/clients/client/public/shared/layout/publicLayoutTokens.ts";

function InvestorsIncomeSection({resolveLanguageKey}: PublicLanguageProps) {
    const {mainImageAspect, sideImageAspect, mainImageCrop} = FIGMA_INVESTORS_INCOME;

    return (
        <div className={`${PUBLIC_CONTAINER} w-full py-8 md:py-16`} data-node-id="357:4708">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,62fr)_minmax(0,38fr)] lg:gap-x-12 lg:gap-y-10">
                <div className="order-3 overflow-hidden rounded-[5px] lg:order-1 lg:row-span-1">
                    <div className="relative w-full overflow-hidden rounded-[5px]" style={{aspectRatio: mainImageAspect}}>
                        <img
                            alt=""
                            aria-hidden
                            className="absolute max-w-none object-cover"
                            src={investorsAssets.sectionIncomeMain}
                            style={figmaImageCropStyle(mainImageCrop)}
                        />
                    </div>
                </div>

                <div className="order-1 flex flex-col gap-6 lg:order-2 lg:col-start-2 lg:row-start-1">
                    <h2 className="cursor-default font-aeonik-medium text-[40px] leading-[1.2] tracking-normal text-pronix-ink not-italic md:text-5xl lg:text-[56px]">
                        {resolveLanguageKey("incomeTitle")}
                    </h2>
                    <div className="flex flex-col gap-6 cursor-default font-aeonik-light text-[18px] leading-[1.2] tracking-normal text-pronix-ink not-italic md:text-2xl md:leading-[1.4] lg:text-[24px]">
                        <p>{resolveLanguageKey("incomeBody1")}</p>
                        <p>{resolveLanguageKey("incomeBody2")}</p>
                    </div>
                </div>

                <div className="order-4 overflow-hidden rounded-[5px] lg:order-3 lg:col-start-2 lg:row-start-2 lg:self-end">
                    <div className="relative w-full overflow-hidden rounded-[5px]" style={{aspectRatio: sideImageAspect}}>
                        <img
                            alt=""
                            aria-hidden
                            className="size-full object-cover"
                            src={investorsAssets.sectionIncomeSide}
                        />
                    </div>
                </div>

                <p className={`order-5 lg:order-4 lg:col-start-1 lg:row-start-2 ${PUBLIC_BODY}`}>
                    {resolveLanguageKey("incomeFooter")}
                </p>
            </div>
        </div>
    );
}

export default InvestorsIncomeSection;

import {Link} from "react-router-dom";
import {cn} from "@coreModule/components/lib/utils.ts";
import {PublicLanguageProps} from "@propertyManagementModule/clients/client/public/shared/publicTypes.ts";
import {investorsAssets} from "@propertyManagementModule/clients/client/public/investors/investorsAssets.ts";
import {figmaAssets} from "@propertyManagementModule/clients/client/public/shared/figmaAssets.ts";
import {
    FIGMA_INVESTORS_ALBANIA,
    FIGMA_IMAGE_CROPS,
    figmaImageCropStyle,
} from "@propertyManagementModule/clients/client/public/shared/layout/figmaDimensions.ts";
import {
    PUBLIC_CONTAINER,
} from "@propertyManagementModule/clients/client/public/shared/layout/publicLayoutTokens.ts";

const CHECK_KEYS = ["albaniaCheck1", "albaniaCheck2", "albaniaCheck3", "albaniaCheck4", "albaniaCheck5"] as const;

function InvestorsAlbaniaSection({resolveLanguageKey}: PublicLanguageProps) {
    const {collageAspect, columnWidthRatio, leftImageCrop, rightImageCrop, logoSizeRatio} =
        FIGMA_INVESTORS_ALBANIA;

    return (
        <div
            className={`${PUBLIC_CONTAINER} flex w-full flex-col gap-10 py-8 pb-16 md:pb-8 lg:flex-row lg:items-center lg:gap-[min(20vw,324px)]`}
            data-node-id="353:537"
        >
            <div className="relative mx-auto w-full max-w-[868px] shrink-0" style={{aspectRatio: collageAspect}}>
                <div
                    className="absolute left-0 top-0 h-full overflow-hidden rounded-[5px]"
                    style={{width: `${columnWidthRatio * 100}%`}}
                >
                    <img
                        alt=""
                        aria-hidden
                        className="absolute max-w-none object-cover"
                        src={investorsAssets.albaniaLeft}
                        style={figmaImageCropStyle(leftImageCrop)}
                    />
                </div>
                <div
                    className="absolute right-0 top-0 h-full overflow-hidden rounded-[5px]"
                    style={{width: `${columnWidthRatio * 100}%`}}
                >
                    <img
                        alt=""
                        aria-hidden
                        className="absolute max-w-none object-cover"
                        src={investorsAssets.albaniaRight}
                        style={figmaImageCropStyle(rightImageCrop)}
                    />
                </div>
                <div
                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                    style={{width: `${logoSizeRatio * 100}%`, aspectRatio: "1 / 1"}}
                >
                    <img alt="" aria-hidden className="size-full" src={investorsAssets.albaniaLogoEllipse} />
                    <div className="absolute left-1/2 top-1/2 h-[32%] w-[54%] -translate-x-1/2 -translate-y-1/2 overflow-hidden">
                        <img
                            alt=""
                            aria-hidden
                            className="absolute max-w-none"
                            src={figmaAssets.ctaLogo}
                            style={figmaImageCropStyle(FIGMA_IMAGE_CROPS.ctaLogo)}
                        />
                    </div>
                </div>
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-6 md:max-w-md md:gap-8 lg:max-w-none xl:max-w-md">
                <div>
                    <h2 className="cursor-default font-aeonik-medium text-[40px] leading-[1.2] tracking-normal text-pronix-ink not-italic md:text-5xl lg:text-[56px]">
                        {resolveLanguageKey("albaniaTitle")}
                    </h2>
                    <p className="mt-3 cursor-default font-aeonik-light text-[18px] leading-[1.2] tracking-normal text-pronix-ink not-italic md:text-2xl md:leading-[1.4] lg:text-[24px]">
                        {resolveLanguageKey("albaniaBody")}
                    </p>
                </div>
                <div className="flex flex-col gap-3">
                    {CHECK_KEYS.map((key) => (
                        <div key={key} className="flex items-start gap-2.5">
                            <span
                                className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-[#0247FE]"
                                aria-hidden
                            >
                                <svg viewBox="0 0 12 12" className="size-3" fill="none">
                                    <path
                                        d="M2 6.2 4.6 8.8 10 3.2"
                                        stroke="white"
                                        strokeWidth="1.6"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </span>
                            <p className="font-aeonik-light text-[18px] leading-[1.2] tracking-normal text-pronix-ink not-italic md:text-lg lg:text-2xl">
                                {resolveLanguageKey(key)}
                            </p>
                        </div>
                    ))}
                </div>
                <Link
                    to="/projects"
                    className={cn(
                        "inline-flex w-fit cursor-pointer items-center justify-center border border-pronix-ink px-6 py-3 md:px-12 md:py-4",
                        "bg-transparent text-pronix-ink transition-colors duration-200",
                        "hover:bg-pronix-ink hover:text-white",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pronix-ink/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
                    )}
                >
                    <span className="font-aeonik-medium whitespace-nowrap not-italic text-base leading-[17.15px] md:text-lg lg:text-[24px]">
                        {resolveLanguageKey("albaniaCta")}
                    </span>
                </Link>
            </div>
        </div>
    );
}

export default InvestorsAlbaniaSection;

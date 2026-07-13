import {Link} from "react-router-dom";
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
    PUBLIC_SUBTITLE,
    PUBLIC_TITLE,
} from "@propertyManagementModule/clients/client/public/shared/layout/publicLayoutTokens.ts";

const CHECK_KEYS = ["albaniaCheck1", "albaniaCheck2", "albaniaCheck3", "albaniaCheck4", "albaniaCheck5"] as const;

function InvestorsAlbaniaSection({resolveLanguageKey}: PublicLanguageProps) {
    const {collageAspect, columnWidthRatio, leftImageCrop, rightImageCrop, logoSizeRatio} =
        FIGMA_INVESTORS_ALBANIA;

    return (
        <div
            className={`${PUBLIC_CONTAINER} flex w-full flex-col gap-10 py-8 lg:flex-row lg:items-center lg:gap-[min(20vw,324px)]`}
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
                    <h2 className={PUBLIC_TITLE}>{resolveLanguageKey("albaniaTitle")}</h2>
                    <p className={`mt-3 ${PUBLIC_SUBTITLE}`}>{resolveLanguageKey("albaniaBody")}</p>
                </div>
                <div className="flex flex-col gap-3">
                    {CHECK_KEYS.map((key) => (
                        <div key={key} className="flex items-start gap-2.5">
                            <img alt="" aria-hidden className="mt-1 size-6 shrink-0" src={investorsAssets.checkCircle} />
                            <p className="font-aeonik-light text-base text-pronix-ink not-italic md:text-lg lg:text-2xl leading-[1.2]">
                                {resolveLanguageKey(key)}
                            </p>
                        </div>
                    ))}
                </div>
                <Link
                    to="/projects"
                    className="inline-flex w-fit items-center justify-center rounded-[5px] border border-pronix-border px-6 py-3 font-aeonik-light text-lg text-pronix-ink not-italic md:text-2xl leading-[1.1]"
                >
                    {resolveLanguageKey("albaniaCta")}
                </Link>
            </div>
        </div>
    );
}

export default InvestorsAlbaniaSection;

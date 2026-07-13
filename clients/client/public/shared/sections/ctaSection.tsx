import {Link} from "react-router-dom";
import {figmaAssets} from "@propertyManagementModule/clients/client/public/shared/figmaAssets.ts";
import {figmaImageCropStyle, FIGMA_IMAGE_CROPS} from "@propertyManagementModule/clients/client/public/shared/layout/figmaDimensions.ts";
import {PUBLIC_GRID_TWO_COL, PUBLIC_SUBTITLE, PUBLIC_TITLE} from "@propertyManagementModule/clients/client/public/shared/layout/publicLayoutTokens.ts";

type CtaSectionProps = {
    resolveLanguageKey?: (key: string) => string;
    titleKey?: string;
    bodyKey?: string;
    browseKey?: string;
    developerCardKey?: string;
};

const DEFAULT_COPY = {
    title: "Start owning, not just browsing.",
    body: "Create an account, verify once, and start reviewing live co-ownership deals in Albania — with every share registered and every distribution tracked.",
    browse: "Browse properties",
    developerCard: "Building something? List it on Pronix.",
};

function CtaSection({
    resolveLanguageKey,
    titleKey = "ctaTitle",
    bodyKey = "ctaBody",
    browseKey = "ctaBrowse",
    developerCardKey = "ctaDeveloperCard",
}: CtaSectionProps) {
    const title = resolveLanguageKey?.(titleKey) ?? DEFAULT_COPY.title;
    const body = resolveLanguageKey?.(bodyKey) ?? DEFAULT_COPY.body;
    const browse = resolveLanguageKey?.(browseKey) ?? DEFAULT_COPY.browse;
    const developerCard = resolveLanguageKey?.(developerCardKey) ?? DEFAULT_COPY.developerCard;

    return (
        <div className="relative min-w-0 w-full max-w-full overflow-x-hidden" data-node-id="357:340">
            <div className={PUBLIC_GRID_TWO_COL}>
                <div
                    className="relative flex aspect-[801/691] w-full min-w-0 flex-col overflow-hidden rounded-[5px] border border-[rgba(24,24,24,0.2)] lg:flex-row"
                    data-node-id="357:341"
                >
                    <div className="flex min-h-0 flex-1 flex-col justify-between gap-6 p-6 sm:p-10 lg:p-11">
                        <div className="flex w-full min-w-0 flex-col items-start gap-4 not-italic leading-[1.2] sm:gap-6">
                            <p className={`w-full min-w-0 ${PUBLIC_TITLE}`}>{title}</p>
                            <p className={`w-full min-w-0 ${PUBLIC_SUBTITLE} text-pronix-ink-muted`}>{body}</p>
                        </div>
                        <Link
                            to="/projects"
                            className="inline-flex w-fit items-center justify-center rounded-[5px] border border-[rgba(24,24,24,0.2)] px-6 py-3"
                        >
                            <p className={`${PUBLIC_SUBTITLE} whitespace-nowrap text-pronix-ink`}>{browse}</p>
                        </Link>
                    </div>
                    <div className="relative min-h-[12rem] w-full shrink-0 overflow-hidden sm:min-h-[16rem] lg:min-h-0 lg:w-auto lg:flex-[0_0_30%]">
                        <img
                            alt=""
                            aria-hidden
                            className="absolute inset-0 size-full object-cover"
                            src={figmaAssets.ctaBuilding}
                        />
                    </div>
                </div>

                <Link
                    to="/developers"
                    className="relative block aspect-[802/691] w-full min-w-0 overflow-hidden rounded-[5px]"
                    data-node-id="357:351"
                >
                    <div className="absolute inset-0 bg-pronix-cream" />
                    <img
                        alt=""
                        aria-hidden
                        className="absolute inset-0 size-full object-cover"
                        src={figmaAssets.ctaScene}
                    />
                    <div className="absolute bottom-[8%] left-[5%] w-[min(40%,15rem)] sm:bottom-[10%] sm:left-[6%]" data-node-id="357:354">
                        <div
                            className="rounded-[5px] border border-[rgba(255,255,255,0.2)] p-5 backdrop-blur-[47px]"
                            style={{background: "rgba(255, 255, 255, 0.1)"}}
                        >
                            <div className="relative mb-4 size-12 overflow-hidden">
                                <img alt="" aria-hidden className="size-full" src={figmaAssets.ctaEllipse} />
                                <div className="relative ml-1 mt-1 h-[19px] w-[31px] overflow-hidden">
                                    <img
                                        alt=""
                                        aria-hidden
                                        className="absolute max-w-none"
                                        src={figmaAssets.ctaLogo}
                                        style={figmaImageCropStyle(FIGMA_IMAGE_CROPS.ctaLogo)}
                                    />
                                </div>
                            </div>
                            <p className="font-aeonik-medium text-base leading-[1.2] text-white not-italic sm:text-lg">
                                {developerCard}
                            </p>
                        </div>
                    </div>
                </Link>
            </div>
        </div>
    );
}

export default CtaSection;

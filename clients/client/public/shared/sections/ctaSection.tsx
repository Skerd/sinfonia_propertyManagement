import {Link} from "react-router-dom";
import {cn} from "@coreModule/components/lib/utils.ts";
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
                            className={cn(
                                "inline-flex w-fit cursor-pointer items-center justify-center border border-pronix-ink px-6 py-3 md:px-12 md:py-4",
                                "bg-transparent text-pronix-ink transition-colors duration-200",
                                "hover:bg-pronix-ink hover:text-white",
                                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pronix-ink/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
                            )}
                        >
                            <span className="font-aeonik-medium whitespace-nowrap not-italic text-base leading-[17.15px] md:text-lg lg:text-[24px]">
                                {browse}
                            </span>
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
                    className="group relative block aspect-[802/691] w-full min-w-0 overflow-hidden rounded-[5px]"
                    data-node-id="357:351"
                >
                    <div className="absolute inset-0 bg-pronix-cream" />
                    <img
                        alt=""
                        aria-hidden
                        className="absolute inset-0 size-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                        src={figmaAssets.ctaScene}
                    />
                    <div
                        className="absolute inset-0 bg-black/0 transition-colors duration-500 group-hover:bg-black/15"
                        aria-hidden
                    />
                    <div className="absolute bottom-[8%] left-[5%] w-[min(40%,15rem)] sm:bottom-[10%] sm:left-[6%]" data-node-id="357:354">
                        <div
                            className={cn(
                                "rounded-[5px] border border-[rgba(255,255,255,0.2)] p-5 backdrop-blur-[47px]",
                                "bg-[rgba(255,255,255,0.1)] transition-all duration-500 ease-out",
                                "group-hover:-translate-y-1 group-hover:border-white/45 group-hover:bg-[rgba(255,255,255,0.2)]",
                            )}
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

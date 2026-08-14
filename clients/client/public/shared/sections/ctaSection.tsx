import {Link} from "react-router-dom";
import {cn} from "@coreModule/components/lib/utils.ts";
import {figmaAssets} from "@propertyManagementModule/clients/client/public/shared/figmaAssets.ts";
import {figmaImageCropStyle, FIGMA_IMAGE_CROPS} from "@propertyManagementModule/clients/client/public/shared/layout/figmaDimensions.ts";
import {PUBLIC_GRID_TWO_COL} from "@propertyManagementModule/clients/client/public/shared/layout/publicLayoutTokens.ts";

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
    const questionMarkAt = developerCard.indexOf("?");
    const developerCardLines =
        questionMarkAt >= 0
            ? [developerCard.slice(0, questionMarkAt + 1).trim(), developerCard.slice(questionMarkAt + 1).trim()].filter(Boolean)
            : [developerCard];

    return (
        <div className="relative min-w-0 w-full max-w-full overflow-x-hidden" data-node-id="357:340">
            <div className={PUBLIC_GRID_TWO_COL}>
                <div
                    className="relative flex aspect-[801/691] w-full min-w-0 flex-row items-stretch overflow-hidden rounded-[5px] border border-[rgba(24,24,24,0.2)] p-4 sm:p-5 lg:p-6"
                    data-node-id="357:341"
                >
                    <div className="flex min-h-0 min-w-0 flex-1 flex-col justify-between gap-4 pr-3 sm:gap-6 sm:pr-6 lg:pr-8">
                        <div className="flex w-full min-w-0 flex-col items-start gap-3 not-italic leading-[1.2] sm:gap-6">
                            <p className="w-full min-w-0 cursor-default font-aeonik-medium text-[28.07px] not-italic leading-[1.2] tracking-normal text-pronix-ink sm:text-4xl md:text-5xl lg:text-[56px]">
                                {title}
                            </p>
                            <p className="w-full min-w-0 cursor-default font-aeonik-light text-base leading-[1.2] tracking-normal text-[rgba(24,24,24,0.8)] not-italic sm:text-xl md:text-2xl lg:text-[24px]">
                                {body}
                            </p>
                        </div>
                        <Link
                            to="/projects"
                            className={cn(
                                "group inline-flex w-fit cursor-pointer items-center justify-center rounded-[5px] border border-[rgba(24,24,24,0.2)] px-4 py-2 md:px-12 md:py-4",
                                "bg-transparent text-[#181818] transition-colors duration-200",
                                "hover:border-[#181818] hover:bg-[#181818] hover:text-white",
                                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#181818]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
                            )}
                        >
                            <span className="font-aeonik-light whitespace-nowrap not-italic text-base leading-[1.2] tracking-normal text-[#181818] md:text-lg lg:text-[24px] group-hover:text-white">
                                {browse}
                            </span>
                        </Link>
                    </div>
                    <div className="relative min-h-0 w-auto min-w-0 flex-[0_0_30%] shrink-0 overflow-hidden rounded-[5px]">
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
                    <div className="absolute bottom-5 left-5 w-[min(72%,15rem)] sm:bottom-8 sm:left-8 sm:w-[min(42%,16rem)]" data-node-id="357:354">
                        <div
                            className={cn(
                                "flex flex-col gap-8 rounded-[5px] border border-[rgba(255,255,255,0.2)] p-4 backdrop-blur-[47px] sm:gap-20 sm:p-5",
                                "bg-[rgba(255,255,255,0.1)] transition-all duration-500 ease-out",
                                "group-hover:-translate-y-1 group-hover:border-white/45 group-hover:bg-[rgba(255,255,255,0.2)]",
                            )}
                        >
                            <div className="relative size-12 shrink-0">
                                <img alt="" aria-hidden className="size-full" src={figmaAssets.ctaEllipse} />
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
                            <p className="font-aeonik-medium text-[18px] font-medium not-italic leading-[1.2] tracking-normal text-white">
                                {developerCardLines.map((line) => (
                                    <span key={line} className="block">
                                        {line}
                                    </span>
                                ))}
                            </p>
                        </div>
                    </div>
                </Link>
            </div>
        </div>
    );
}

export default CtaSection;

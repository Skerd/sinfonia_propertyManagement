import {cn} from "@coreModule/components/lib/utils.ts";
import {figmaAssets} from "@propertyManagementModule/clients/client/public/shared/figmaAssets.ts";
import {FIGMA_HERO_ORB, FIGMA_PLATFORM_ORB} from "@propertyManagementModule/clients/client/public/shared/layout/figmaDimensions.ts";

type AiOrbVisualProps = {
    variant: "hero" | "platform";
    className?: string;
    /** Clip orb paint to its box — use on FAB and other fixed-size containers. */
    clipped?: boolean;
    /** Hide the ellipse glow layer (platform section center orb). */
    hideGlow?: boolean;
};

type OrbTokens = typeof FIGMA_HERO_ORB;

function FluidOrbCanvas({
    tokens,
    clipped,
    className,
    clipGlow,
    hideGlow,
}: {
    tokens: OrbTokens;
    clipped?: boolean;
    className?: string;
    /** Clip ellipse glow bleed when glow is shown. */
    clipGlow?: boolean;
    hideGlow?: boolean;
}) {
    const overflowClass = clipped || (clipGlow && !hideGlow) ? "overflow-hidden" : "overflow-visible";

    return (
        <div className={cn("relative aspect-square w-full min-w-0 @container", overflowClass, className)}>
            <div className="absolute inset-0">
                {!hideGlow && (
                    <div className="absolute inset-0">
                        <div className="absolute" style={{inset: "-295.59%"}}>
                            <img alt="" aria-hidden className="block size-full max-w-none" src={figmaAssets.aiOrbEllipse} />
                        </div>
                    </div>
                )}
                <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    aria-hidden
                    className="pointer-events-none absolute max-w-none object-cover"
                    src={figmaAssets.aiOrbVideo}
                    style={{
                        left: `calc(50% + ${tokens.offsetXRatio * 100}cqw)`,
                        top: `calc(50% + ${tokens.offsetYRatio * 100}cqw)`,
                        width: `${tokens.videoWidthRatio * 100}cqw`,
                        height: `${tokens.videoHeightRatio * 100}cqw`,
                        transform: "translate(-50%, -50%)",
                        WebkitMaskImage: `url(${figmaAssets.aiOrbMask})`,
                        maskImage: `url(${figmaAssets.aiOrbMask})`,
                        WebkitMaskRepeat: "no-repeat",
                        maskRepeat: "no-repeat",
                        WebkitMaskSize: `${tokens.maskWidthRatio * 100}cqw ${tokens.maskHeightRatio * 100}cqw`,
                        maskSize: `${tokens.maskWidthRatio * 100}cqw ${tokens.maskHeightRatio * 100}cqw`,
                        WebkitMaskPosition: `${tokens.maskXRatio * 100}cqw ${tokens.maskYRatio * 100}cqw`,
                        maskPosition: `${tokens.maskXRatio * 100}cqw ${tokens.maskYRatio * 100}cqw`,
                    }}
                />
            </div>
        </div>
    );
}

function AiOrbVisual({variant, className, clipped, hideGlow}: AiOrbVisualProps) {
    if (variant === "platform") {
        return <FluidOrbCanvas tokens={FIGMA_PLATFORM_ORB} hideGlow clipped className={className} />;
    }

    return <FluidOrbCanvas tokens={FIGMA_HERO_ORB} clipped={clipped} hideGlow={hideGlow} className={className} />;
}

export default AiOrbVisual;

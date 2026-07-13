import {useLayoutEffect, useRef, useState} from "react";
import {useMotionValue} from "motion/react";
import FeaturedRouletteOrbit from "@propertyManagementModule/clients/client/public/home/sections/featuredRouletteOrbit.tsx";
import {
    FEATURED_CENTER_COPY,
    FEATURED_CENTER_TEXT,
    FEATURED_ORBIT_RADIUS,
    FEATURED_TILE_SIZE,
} from "@propertyManagementModule/clients/client/public/home/sections/featuredRouletteConfig.ts";
import {
    computeRouletteDotPosition,
    computeRouletteDotsChromeStyle,
    computeStageCanvasInnerStyle,
    computeStageScaledCanvasDimensions,
    FIGMA_STAGE_CANVAS,
} from "@propertyManagementModule/clients/client/public/home/sections/featuredRouletteLayout.ts";
import {featuredRouletteSlides} from "@propertyManagementModule/clients/client/public/home/sections/featuredRouletteSlides.ts";
import {computePublicSectionScale} from "@propertyManagementModule/clients/client/public/shared/hooks/usePublicSectionScale.ts";
import {FIGMA_CANVAS_WIDTH} from "@propertyManagementModule/clients/client/public/shared/figmaRouteMap.ts";

function computeLayoutWidth(containerWidth: number) {
    return Math.min(containerWidth, FIGMA_CANVAS_WIDTH);
}

function computeCenteredLeft(hostWidth: number, layoutWidth: number) {
    return Math.max(0, (hostWidth - layoutWidth) / 2);
}

type StageLayout = {
    containerWidth: number;
    layoutWidth: number;
    stageLeftInAnchor: number;
};

function FeaturedRouletteIntroPreview() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [stageLayout, setStageLayout] = useState<StageLayout | null>(null);
    const rotationDeg = useMotionValue(0);
    const zoomBlend = useMotionValue(0);

    useLayoutEffect(() => {
        const element = containerRef.current;
        if (!element) {
            return;
        }

        const updateLayout = () => {
            const anchorRect = element.getBoundingClientRect();
            const containerWidth = anchorRect.width;
            if (containerWidth <= 0) {
                return;
            }

            const layoutWidth = computeLayoutWidth(containerWidth);
            const stageLeft = computeCenteredLeft(window.innerWidth, layoutWidth);
            setStageLayout({
                containerWidth,
                layoutWidth,
                stageLeftInAnchor: stageLeft - anchorRect.left,
            });
        };

        updateLayout();
        const observer = new ResizeObserver(updateLayout);
        observer.observe(element);
        window.addEventListener("scroll", updateLayout, {passive: true});
        window.addEventListener("resize", updateLayout);
        return () => {
            observer.disconnect();
            window.removeEventListener("scroll", updateLayout);
            window.removeEventListener("resize", updateLayout);
        };
    }, []);

    const layoutWidth = stageLayout?.layoutWidth ?? 0;
    const layoutScale = layoutWidth > 0 ? computePublicSectionScale(layoutWidth, FIGMA_CANVAS_WIDTH) : 1;
    const radius = FEATURED_ORBIT_RADIUS * layoutScale;
    const tileSize = FEATURED_TILE_SIZE * layoutScale;
    const scaledCanvas = computeStageScaledCanvasDimensions(layoutScale);
    const scaledCanvasWidth = scaledCanvas.width;
    const scaledCanvasHeight = scaledCanvas.height;
    const dotsChromeStyle = computeRouletteDotsChromeStyle();
    const centerCopyWidthRatio = FEATURED_CENTER_COPY.width / FIGMA_STAGE_CANVAS.width;

    return (
        <div
            ref={containerRef}
            className="pointer-events-none relative h-full w-full overflow-hidden bg-white"
            aria-hidden
        >
            {stageLayout !== null && (
                <div
                    className="absolute overflow-hidden"
                    style={{
                        top: 0,
                        left: stageLayout.stageLeftInAnchor,
                        width: layoutWidth,
                        height: scaledCanvasHeight,
                    }}
                >
                    <div
                        className="relative mx-auto overflow-hidden"
                        style={{
                            width: layoutWidth,
                            height: scaledCanvasHeight,
                        }}
                    >
                        <div
                            className="relative overflow-hidden"
                            style={{
                                width: scaledCanvasWidth,
                                height: scaledCanvasHeight,
                            }}
                        >
                            <div style={computeStageCanvasInnerStyle(layoutScale)}>
                                <div className="absolute left-1/2 top-1/2">
                                    <FeaturedRouletteOrbit
                                        rotationDeg={rotationDeg}
                                        zoomBlend={zoomBlend}
                                        radius={radius}
                                        tileSize={tileSize}
                                        isActive={false}
                                    />
                                </div>

                                <div className="absolute inset-0 z-10 flex items-center justify-center">
                                    <div
                                        className="relative text-center"
                                        style={{width: `${centerCopyWidthRatio * 100}%`}}
                                    >
                                        <p
                                            className="font-aeonik-medium text-center text-pronix-ink not-italic"
                                            data-node-id="71:1834"
                                            style={{
                                                fontSize: FEATURED_CENTER_COPY.fontSize,
                                                lineHeight: FEATURED_CENTER_COPY.lineHeight,
                                            }}
                                        >
                                            {FEATURED_CENTER_TEXT}
                                        </p>
                                    </div>
                                </div>

                                <div className="absolute" style={{...dotsChromeStyle, opacity: 0.6}}>
                                    {featuredRouletteSlides.map((slide, index) => (
                                        <div
                                            key={slide.id}
                                            className="absolute rounded-full bg-pronix-ink"
                                            style={{
                                                ...computeRouletteDotPosition(index, featuredRouletteSlides.length),
                                                opacity: 0.25,
                                            }}
                                            aria-hidden
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default FeaturedRouletteIntroPreview;

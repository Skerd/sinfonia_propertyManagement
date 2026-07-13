import {useEffect, useRef} from "react";
import {motion, useMotionValueEvent, useTransform, type MotionValue} from "motion/react";
import FeaturedRouletteOrbit from "@propertyManagementModule/clients/client/public/home/sections/featuredRouletteOrbit.tsx";
import {
    FEATURED_CENTER_COPY,
    FEATURED_CENTER_TEXT,
    FEATURED_COPY_HIDE_ZOOM,
    FEATURED_INTRO_RATIO,
    FEATURED_ORBIT_RADIUS,
    FEATURED_ORBIT_SHIFT_X,
    FEATURED_TILE_SIZE,
    FEATURED_TITLE_REVEAL_ZOOM,
    FEATURED_ZOOM_SCALE,
    lerp,
    smootherstep,
} from "@propertyManagementModule/clients/client/public/home/sections/featuredRouletteConfig.ts";
import {computeFocusTitleAnchor} from "@propertyManagementModule/clients/client/public/home/sections/featuredRouletteTitleLayout.ts";
import {
    computeRouletteDotPosition,
    computeRouletteDotsChromeStyle,
    computeStageCanvasInnerStyle,
    computeStageScaledCanvasDimensions,
    FIGMA_STAGE_CANVAS,
} from "@propertyManagementModule/clients/client/public/home/sections/featuredRouletteLayout.ts";
import {featuredRouletteSlides} from "@propertyManagementModule/clients/client/public/home/sections/featuredRouletteSlides.ts";
import type {FeaturedRouletteStageRect} from "@propertyManagementModule/clients/client/public/home/sections/useFeaturedRouletteScroll.ts";
import {computePublicSectionScale} from "@propertyManagementModule/clients/client/public/shared/hooks/usePublicSectionScale.ts";
import {FIGMA_CANVAS_WIDTH} from "@propertyManagementModule/clients/client/public/shared/figmaRouteMap.ts";
import {PUBLIC_LAYER_CAROUSEL} from "@propertyManagementModule/clients/client/public/shared/layout/publicLayoutTokens.ts";

type FeaturedRouletteStageProps = {
    stageRect: FeaturedRouletteStageRect;
    rotationDeg: MotionValue<number>;
    focusIndex: MotionValue<number>;
    zoomBlend: MotionValue<number>;
    scrollProgress: MotionValue<number>;
    isPinned: boolean;
};

function computeTitleStyle(slideIndex: number, focus: number, introBlend: number, zoom: number) {
    if (focus < 0 || introBlend < 0.05 || zoom < FEATURED_TITLE_REVEAL_ZOOM) {
        return {transform: "translate3d(0, 110%, 0)", opacity: 0};
    }

    const distance = slideIndex - focus;
    const absDistance = Math.abs(distance);
    const activeWeight = smootherstep(Math.max(0, 1 - absDistance));
    const translateY = lerp(110, 0, activeWeight) + distance * (zoom > 0.5 ? 12 : 18);
    const titleReveal = smootherstep(
        (zoom - FEATURED_TITLE_REVEAL_ZOOM) / Math.max(0.001, 1 - FEATURED_TITLE_REVEAL_ZOOM),
    );
    const opacity = activeWeight * introBlend * titleReveal;

    return {
        transform: `translate3d(0, ${translateY}%, 0)`,
        opacity,
    };
}

function FeaturedRouletteStage({
    stageRect,
    rotationDeg,
    focusIndex,
    zoomBlend,
    scrollProgress,
    isPinned,
}: FeaturedRouletteStageProps) {
    const titleRefs = useRef<(HTMLSpanElement | null)[]>([]);
    const titleContainerRef = useRef<HTMLDivElement>(null);
    const dotRefs = useRef<(HTMLDivElement | null)[]>([]);
    const activeTitleRef = useRef<HTMLParagraphElement>(null);

    const layoutScale = computePublicSectionScale(stageRect.width, FIGMA_CANVAS_WIDTH);
    const orbitScale = layoutScale;
    const radius = FEATURED_ORBIT_RADIUS * orbitScale;
    const tileSize = FEATURED_TILE_SIZE * orbitScale;
    const scaledCanvas = computeStageScaledCanvasDimensions(layoutScale);
    const scaledCanvasWidth = scaledCanvas.width;
    const scaledCanvasHeight = scaledCanvas.height;
    const dotsChromeStyle = computeRouletteDotsChromeStyle();
    const centerCopyWidthRatio = FEATURED_CENTER_COPY.width / FIGMA_STAGE_CANVAS.width;

    const orbitShiftX = useTransform(zoomBlend, (z) => lerp(0, FEATURED_ORBIT_SHIFT_X, z));
    const orbitZoomScale = useTransform(zoomBlend, (z) => lerp(1, FEATURED_ZOOM_SCALE, z));
    const copyOpacity = useTransform(zoomBlend, (z) => {
        if (z >= FEATURED_COPY_HIDE_ZOOM) {
            return 0;
        }
        return 1 - smootherstep(z / FEATURED_COPY_HIDE_ZOOM);
    });
    const copyVisibility = useTransform(zoomBlend, (z) =>
        z >= FEATURED_COPY_HIDE_ZOOM ? "hidden" : "visible",
    );

    const applyLayout = (focus: number, progress: number, zoom: number) => {
        const introBlend = progress <= FEATURED_INTRO_RATIO ? progress / FEATURED_INTRO_RATIO : 1;

        titleRefs.current.forEach((el, index) => {
            if (!el) {
                return;
            }
            const style = computeTitleStyle(index, focus, introBlend, zoom);
            el.style.transform = style.transform;
            el.style.opacity = String(style.opacity);
        });

        if (titleContainerRef.current) {
            if (zoom < FEATURED_TITLE_REVEAL_ZOOM) {
                titleContainerRef.current.style.visibility = "hidden";
                titleContainerRef.current.style.opacity = "0";
            } else {
                const anchor = computeFocusTitleAnchor(zoom, layoutScale);
                titleContainerRef.current.style.visibility = "visible";
                titleContainerRef.current.style.opacity = "1";
                titleContainerRef.current.style.left = `${anchor.left}px`;
                titleContainerRef.current.style.top = `${anchor.top}px`;
                titleContainerRef.current.style.transform = "translate(-50%, 0)";
            }
        }

        const activeIndex = focus < 0 ? -1 : Math.round(focus);
        if (activeTitleRef.current) {
            activeTitleRef.current.textContent =
                activeIndex >= 0 && introBlend > 0.5 && zoom >= FEATURED_TITLE_REVEAL_ZOOM
                    ? featuredRouletteSlides[activeIndex]?.title ?? ""
                    : "";
        }

        dotRefs.current.forEach((el, index) => {
            if (!el) {
                return;
            }
            const distance = focus < 0 ? 2 : Math.abs(index - focus);
            const active = focus >= 0 && distance < 0.45;
            el.style.transform = `scale(${active ? 1.35 : 1})`;
            el.style.opacity = String(focus < 0 ? 0.25 : active ? 1 : 0.35 * introBlend);
        });
    };

    useMotionValueEvent(focusIndex, "change", (focus) => {
        applyLayout(focus, scrollProgress.get(), zoomBlend.get());
    });

    useMotionValueEvent(scrollProgress, "change", (progress) => {
        applyLayout(focusIndex.get(), progress, zoomBlend.get());
    });

    useMotionValueEvent(zoomBlend, "change", (zoom) => {
        applyLayout(focusIndex.get(), scrollProgress.get(), zoom);
    });

    useEffect(() => {
        applyLayout(focusIndex.get(), scrollProgress.get(), zoomBlend.get());
    }, [focusIndex, scrollProgress, zoomBlend, stageRect, layoutScale]);

    return (
        <div
            className="pointer-events-none fixed inset-0 bg-white"
            data-node-id="71:1839"
            data-name="Featured properties"
            style={{
                zIndex: PUBLIC_LAYER_CAROUSEL,
                overflow: "clip",
                contain: "strict",
            }}
        >
            <div
                className="absolute overflow-hidden"
                style={{
                    top: stageRect.top,
                    left: stageRect.left,
                    width: stageRect.width,
                    height: stageRect.height,
                }}
            >
                <div
                    className="relative mx-auto overflow-hidden"
                    style={{
                        width: stageRect.width,
                        height: stageRect.height,
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
                            <motion.div
                                className="absolute left-1/2 top-1/2"
                                style={{
                                    x: orbitShiftX,
                                    scale: orbitZoomScale,
                                    willChange: isPinned ? "transform" : "auto",
                                }}
                            >
                                <FeaturedRouletteOrbit
                                    rotationDeg={rotationDeg}
                                    zoomBlend={zoomBlend}
                                    radius={radius}
                                    tileSize={tileSize}
                                    isActive={isPinned}
                                />
                            </motion.div>

                            <div className="absolute inset-0 z-10 flex items-center justify-center">
                                <motion.div
                                    className="relative text-center"
                                    style={{
                                        width: `${centerCopyWidthRatio * 100}%`,
                                        opacity: copyOpacity,
                                        visibility: copyVisibility,
                                    }}
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
                                </motion.div>
                            </div>

                            <div
                                ref={titleContainerRef}
                                className="absolute z-20 overflow-hidden"
                                style={{
                                    left: `${50}%`,
                                    top: 0,
                                    width: `${centerCopyWidthRatio * 100}%`,
                                    height: 32,
                                    visibility: "hidden",
                                    opacity: 0,
                                    transform: "translate(-50%, 0)",
                                }}
                            >
                                <div className="relative flex h-full items-center justify-center">
                                    {featuredRouletteSlides.map((slide, index) => (
                                        <span
                                            key={slide.id}
                                            ref={(el) => {
                                                titleRefs.current[index] = el;
                                            }}
                                            className="font-aeonik-medium absolute inset-x-0 text-center not-italic text-pronix-ink whitespace-nowrap"
                                            style={{
                                                fontSize: FEATURED_CENTER_COPY.fontSize,
                                                lineHeight: FEATURED_CENTER_COPY.lineHeight,
                                                willChange: "transform, opacity",
                                            }}
                                            aria-hidden
                                        >
                                            {slide.title}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <p ref={activeTitleRef} className="sr-only" aria-live="polite" />

                            <div
                                className="absolute"
                                style={{
                                    ...dotsChromeStyle,
                                    opacity: isPinned ? 1 : 0.6,
                                }}
                            >
                                {featuredRouletteSlides.map((slide, index) => {
                                    const dotStyle = computeRouletteDotPosition(index, featuredRouletteSlides.length);
                                    return (
                                        <div
                                            key={slide.id}
                                            ref={(el) => {
                                                dotRefs.current[index] = el;
                                            }}
                                            className="absolute rounded-full bg-pronix-ink"
                                            style={{
                                                ...dotStyle,
                                                willChange: "transform, opacity",
                                            }}
                                            aria-hidden
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default FeaturedRouletteStage;

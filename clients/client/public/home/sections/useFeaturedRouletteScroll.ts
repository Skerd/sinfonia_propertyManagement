import {useCallback, useEffect, useLayoutEffect, useRef, useState, type RefObject} from "react";
import {
    useMotionValueEvent,
    useScroll,
    useSpring,
    useTransform,
    type MotionValue,
} from "motion/react";
import {FIGMA_CANVAS_WIDTH} from "@propertyManagementModule/clients/client/public/shared/figmaRouteMap.ts";
import {
    FEATURED_RUNWAY_VIEWPORTS,
    FEATURED_SECTION_HEIGHT,
    FEATURED_SLIDE_COUNT,
    FEATURED_SPRING,
    FEATURED_SPRING_REDUCED,
    FEATURED_STAGE_HEIGHT,
    FEATURED_ZOOM_RAMP,
    smootherstep,
} from "@propertyManagementModule/clients/client/public/home/sections/featuredRouletteConfig.ts";

export type FeaturedRouletteStageRect = {
    top: number;
    left: number;
    width: number;
    height: number;
};

export type FeaturedRouletteScrollEngine = {
    runwayRef: RefObject<HTMLDivElement | null>;
    anchorRef: RefObject<HTMLDivElement | null>;
    scrollProgress: MotionValue<number>;
    rotationDeg: MotionValue<number>;
    focusIndex: MotionValue<number>;
    zoomBlend: MotionValue<number>;
    stageRect: FeaturedRouletteStageRect | null;
    isVisible: boolean;
    isPinned: boolean;
    runwayHeight: number;
    stageHeight: number;
    scrollToIndex: (index: number) => void;
    reducedMotion: boolean;
};

const RUNWAY_ENGAGE_TOP_PX = 0.5;

function computeLayoutWidth(containerWidth: number) {
    return Math.min(containerWidth, FIGMA_CANVAS_WIDTH);
}

function computeStageHeight(layoutWidth: number) {
    const aspect = FEATURED_STAGE_HEIGHT / FIGMA_CANVAS_WIDTH;
    return Math.min(FEATURED_STAGE_HEIGHT, Math.max(400, layoutWidth * aspect));
}

function computeRunwayHeight(stageHeight: number) {
    return stageHeight + FEATURED_RUNWAY_VIEWPORTS * window.innerHeight;
}

function computeCenteredLeft(hostWidth: number, layoutWidth: number) {
    return Math.max(0, (hostWidth - layoutWidth) / 2);
}

function computeLockedStageRect(containerWidth: number): FeaturedRouletteStageRect {
    const layoutWidth = computeLayoutWidth(containerWidth);
    const height = computeStageHeight(layoutWidth);

    return {
        top: 0,
        left: computeCenteredLeft(window.innerWidth, layoutWidth),
        width: layoutWidth,
        height,
    };
}

function isRunwayEngaged(runwayTop: number, runwayBottom: number) {
    return runwayTop <= RUNWAY_ENGAGE_TOP_PX && runwayBottom > 0;
}

function isInPinZone(progress: number) {
    return progress >= 0 && progress < 1;
}

export function useFeaturedRouletteScroll(): FeaturedRouletteScrollEngine {
    const runwayRef = useRef<HTMLDivElement>(null);
    const anchorRef = useRef<HTMLDivElement>(null);
    const [runwayHeight, setRunwayHeight] = useState(FEATURED_SECTION_HEIGHT);
    const [stageHeight, setStageHeight] = useState(FEATURED_STAGE_HEIGHT);
    const [stageRect, setStageRect] = useState<FeaturedRouletteStageRect | null>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [isPinned, setIsPinned] = useState(false);
    const [reducedMotion, setReducedMotion] = useState(false);

    const {scrollYProgress} = useScroll({
        target: runwayRef,
        offset: ["start start", "end start"],
    });

    const carouselProgress = scrollYProgress;

    const focusIndexRaw = useTransform(carouselProgress, (t) => {
        if (t <= 0) {
            return -1;
        }
        return t * (FEATURED_SLIDE_COUNT - 1);
    });

    const rotationRaw = useTransform(focusIndexRaw, (f) => {
        if (f < 0) {
            return 0;
        }
        return f * (360 / FEATURED_SLIDE_COUNT);
    });

    const zoomBlendRaw = useTransform(carouselProgress, (t) => {
        if (t <= 0) {
            return 0;
        }
        return smootherstep(Math.min(1, t / FEATURED_ZOOM_RAMP));
    });

    const springConfig = reducedMotion ? FEATURED_SPRING_REDUCED : FEATURED_SPRING;
    const rotationDeg = useSpring(rotationRaw, springConfig);
    const focusIndex = useSpring(focusIndexRaw, springConfig);
    const zoomBlend = useSpring(zoomBlendRaw, springConfig);

    const recomputeHeights = useCallback(() => {
        const anchor = anchorRef.current;
        const containerWidth = anchor?.getBoundingClientRect().width ?? window.innerWidth;
        const layoutWidth = computeLayoutWidth(containerWidth);
        const nextStageHeight = computeStageHeight(layoutWidth);
        setStageHeight(nextStageHeight);
        setRunwayHeight(computeRunwayHeight(nextStageHeight));
    }, []);

    const updateStageGeometry = useCallback((progress: number) => {
        const runway = runwayRef.current;
        const anchor = anchorRef.current;

        if (!runway || !anchor) {
            setIsVisible(false);
            setStageRect(null);
            setIsPinned(false);
            return;
        }

        const runwayRect = runway.getBoundingClientRect();
        const containerWidth = anchor.getBoundingClientRect().width || window.innerWidth;
        const engaged = isRunwayEngaged(runwayRect.top, runwayRect.bottom);
        const shouldLock = engaged && isInPinZone(progress);

        if (shouldLock) {
            setIsVisible(true);
            setStageRect(computeLockedStageRect(containerWidth));
            setIsPinned(true);
            return;
        }

        setIsVisible(false);
        setStageRect(null);
        setIsPinned(false);
    }, []);

    useLayoutEffect(() => {
        recomputeHeights();
        window.addEventListener("resize", recomputeHeights);
        return () => window.removeEventListener("resize", recomputeHeights);
    }, [recomputeHeights]);

    useEffect(() => {
        const media = window.matchMedia("(prefers-reduced-motion: reduce)");
        const update = () => setReducedMotion(media.matches);
        update();
        media.addEventListener("change", update);
        return () => media.removeEventListener("change", update);
    }, []);

    useMotionValueEvent(scrollYProgress, "change", updateStageGeometry);

    useLayoutEffect(() => {
        updateStageGeometry(scrollYProgress.get());
    }, [runwayHeight, stageHeight, updateStageGeometry, scrollYProgress]);

    useEffect(() => {
        const onResize = () => {
            recomputeHeights();
            updateStageGeometry(scrollYProgress.get());
        };

        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, [scrollYProgress, updateStageGeometry, recomputeHeights]);

    const scrollToIndex = useCallback(
        (index: number) => {
            const runway = runwayRef.current;
            if (!runway) {
                return;
            }

            const clampedIndex = Math.min(FEATURED_SLIDE_COUNT - 1, Math.max(0, index));
            const targetProgress = clampedIndex / (FEATURED_SLIDE_COUNT - 1);
            const rect = runway.getBoundingClientRect();
            const scrollable = rect.height;
            const currentProgress = scrollYProgress.get();
            const targetScrollY = window.scrollY + (targetProgress - currentProgress) * scrollable;

            window.scrollTo({top: targetScrollY, behavior: reducedMotion ? "auto" : "smooth"});
        },
        [scrollYProgress, reducedMotion],
    );

    return {
        runwayRef,
        anchorRef,
        scrollProgress: scrollYProgress,
        rotationDeg,
        focusIndex,
        zoomBlend,
        stageRect,
        isVisible,
        isPinned,
        runwayHeight,
        stageHeight,
        scrollToIndex,
        reducedMotion,
    };
}

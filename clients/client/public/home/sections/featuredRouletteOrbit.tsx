import {motion, useTransform, type MotionValue} from "motion/react";
import {
    FEATURED_ACTIVE_OPACITY,
    FEATURED_ACTIVE_SCALE,
    FEATURED_FOCUS_ANGLE,
    FEATURED_REST_OPACITY,
    FEATURED_REST_SCALE,
    FEATURED_SLIDE_COUNT,
    FEATURED_TILE_SIZE_MIN,
    FEATURED_ZOOM_ACTIVE_SCALE,
    FEATURED_ZOOM_REST_OPACITY,
    FEATURED_ZOOM_REST_SCALE,
    angularDistance,
    lerp,
    smootherstep,
} from "@propertyManagementModule/clients/client/public/home/sections/featuredRouletteConfig.ts";
import {
    featuredRouletteSlides,
    type FeaturedRouletteSlide,
} from "@propertyManagementModule/clients/client/public/home/sections/featuredRouletteSlides.ts";

type FeaturedRouletteOrbitProps = {
    rotationDeg: MotionValue<number>;
    zoomBlend: MotionValue<number>;
    radius: number;
    tileSize: number;
    isActive: boolean;
};

type RouletteTileProps = {
    slide: FeaturedRouletteSlide;
    index: number;
    angle: number;
    radius: number;
    tileSize: number;
    stepDeg: number;
    rotationDeg: MotionValue<number>;
    zoomBlend: MotionValue<number>;
};

function RouletteTile({slide, index: _index, angle, radius, tileSize, stepDeg, rotationDeg, zoomBlend}: RouletteTileProps) {
    const counterRotation = useTransform(rotationDeg, (r) => -angle - r);

    const prominence = useTransform([rotationDeg, zoomBlend], ([rotation, _zoom]: number[]) => {
        const tileAngle = (((angle + rotation) % 360) + 360) % 360;
        const dist = angularDistance(tileAngle, FEATURED_FOCUS_ANGLE);
        const normalizedDist = dist / (stepDeg / 2);
        return smootherstep(Math.min(1, normalizedDist / 1.05));
    });

    const scale = useTransform([prominence, zoomBlend], ([falloff, zoom]: number[]) => {
        if (zoom <= 0.01) {
            return lerp(1, 1, falloff);
        }

        const heroScale = lerp(FEATURED_ACTIVE_SCALE, FEATURED_ZOOM_ACTIVE_SCALE, zoom);
        const restScale = lerp(FEATURED_REST_SCALE, FEATURED_ZOOM_REST_SCALE, zoom);
        return lerp(heroScale, restScale, falloff);
    });

    const opacity = useTransform([prominence, zoomBlend], ([falloff, zoom]: number[]) => {
        if (zoom <= 0.01) {
            return 1;
        }

        const restOpacity = lerp(FEATURED_REST_OPACITY, FEATURED_ZOOM_REST_OPACITY, zoom);
        return lerp(FEATURED_ACTIVE_OPACITY, restOpacity, falloff);
    });

    const zIndex = useTransform(prominence, (falloff) => Math.round((1 - falloff) * 100));

    return (
        <div
            className="absolute left-0 top-0"
            data-node-id={slide.nodeId}
            style={{
                transform: `rotate(${angle}deg) translateY(-${radius}px)`,
                transformOrigin: "0 0",
            }}
        >
            <motion.div
                style={{
                    rotate: counterRotation,
                    scale,
                    opacity,
                    zIndex,
                    width: tileSize,
                    height: tileSize,
                    marginLeft: -tileSize / 2,
                    marginTop: -tileSize / 2,
                    willChange: "transform, opacity",
                }}
                className="overflow-hidden rounded-full shadow-sm"
            >
                <img
                    alt=""
                    aria-hidden
                    src={slide.image}
                    draggable={false}
                    decoding="async"
                    className="size-full object-cover"
                />
            </motion.div>
        </div>
    );
}

function FeaturedRouletteOrbit({rotationDeg, zoomBlend, radius, tileSize, isActive}: FeaturedRouletteOrbitProps) {
    const safeTileSize = Math.max(FEATURED_TILE_SIZE_MIN, tileSize);
    const stepDeg = 360 / FEATURED_SLIDE_COUNT;

    return (
        <motion.div
            className="absolute left-1/2 top-1/2"
            style={{
                rotate: rotationDeg,
                willChange: isActive ? "transform" : "auto",
            }}
        >
            {featuredRouletteSlides.map((slide, index) => (
                <RouletteTile
                    key={slide.id}
                    slide={slide}
                    index={index}
                    angle={stepDeg * index + FEATURED_FOCUS_ANGLE}
                    radius={radius}
                    tileSize={safeTileSize}
                    stepDeg={stepDeg}
                    rotationDeg={rotationDeg}
                    zoomBlend={zoomBlend}
                />
            ))}
        </motion.div>
    );
}

export default FeaturedRouletteOrbit;

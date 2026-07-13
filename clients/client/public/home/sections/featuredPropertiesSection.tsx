import {useCallback, useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent} from "react";
import {ChevronLeft, ChevronRight} from "lucide-react";
import {useReducedMotion} from "motion/react";
import {
    FEATURED_SECTION_COPY,
    featuredSlides,
    type FeaturedSlide,
} from "@propertyManagementModule/clients/client/public/home/sections/featuredSlides.ts";
import FadeIn from "@propertyManagementModule/clients/client/public/shared/fadeIn.tsx";
import {
    PUBLIC_BODY,
    PUBLIC_TITLE,
} from "@propertyManagementModule/clients/client/public/shared/layout/publicLayoutTokens.ts";

const CARD_GAP_PX = 12;
/** Three identical strips — wrap is always invisible because clones match. */
const LOOP_COPIES = 3;
const FOCUS_SCALE = 1;
const SIDE_SCALE = 0.78;
const SIDE_SINK_PX = 28;
const SIDE_TILT_DEG = 10;

type LoopedSlide = FeaturedSlide & {
    key: string;
    logicalIndex: number;
};

function formatIndex(index: number) {
    return String(index + 1).padStart(2, "0");
}

function buildLoopedSlides(): LoopedSlide[] {
    const slides: LoopedSlide[] = [];
    for (let copy = 0; copy < LOOP_COPIES; copy++) {
        for (const slide of featuredSlides) {
            slides.push({
                ...slide,
                key: `${copy}-${slide.id}`,
                logicalIndex: slide.id,
            });
        }
    }
    return slides;
}

/** Keep offset in the middle strip so left/right wrapping never hits an empty edge. */
function wrapOffset(offset: number, setWidth: number) {
    if (setWidth <= 0) {
        return offset;
    }
    let next = offset;
    while (next >= setWidth * 2) {
        next -= setWidth;
    }
    while (next < setWidth) {
        next += setWidth;
    }
    return next;
}

function FeaturedPropertiesSection() {
    const viewportRef = useRef<HTMLDivElement>(null);
    const trackRef = useRef<HTMLDivElement>(null);
    const offsetRef = useRef(0);
    const setWidthRef = useRef(0);
    const strideRef = useRef(0);
    const velocityRef = useRef(0);
    const rafRef = useRef(0);
    const dragRef = useRef<{pointerId: number; lastX: number; lastTime: number} | null>(null);
    const reducedMotion = useReducedMotion();
    const loopedSlides = useMemo(() => buildLoopedSlides(), []);
    const [activeIndex, setActiveIndex] = useState(0);

    const applyCoverflow = useCallback(() => {
        const viewport = viewportRef.current;
        const track = trackRef.current;
        if (!viewport || !track) {
            return;
        }

        const stride = strideRef.current;
        if (stride <= 0) {
            return;
        }

        const focusX = offsetRef.current + viewport.clientWidth / 2;
        const cards = track.querySelectorAll<HTMLElement>("[data-featured-card]");

        cards.forEach((card) => {
            const cardCenter = card.offsetLeft + card.offsetWidth / 2;
            const signed = (cardCenter - focusX) / stride;
            const distance = Math.min(1.35, Math.abs(signed));
            const t = Math.min(1, distance);
            const scale = FOCUS_SCALE - (FOCUS_SCALE - SIDE_SCALE) * t;
            const sink = SIDE_SINK_PX * t;
            const tilt = reducedMotion ? 0 : -Math.sign(signed || 1) * SIDE_TILT_DEG * t;
            const z = Math.round((1 - t) * 20);

            card.style.transform = `translateY(${sink}px) rotateY(${tilt}deg) scale(${scale})`;
            card.style.zIndex = String(z);
        });
    }, [reducedMotion]);

    const applyTransform = useCallback(() => {
        const track = trackRef.current;
        if (!track) {
            return;
        }
        track.style.transform = `translate3d(${-offsetRef.current}px, 0, 0)`;
        applyCoverflow();
    }, [applyCoverflow]);

    const syncActiveIndex = useCallback(() => {
        const setWidth = setWidthRef.current;
        const stride = strideRef.current;
        if (setWidth <= 0 || stride <= 0) {
            return;
        }
        const local = ((offsetRef.current % setWidth) + setWidth) % setWidth;
        const index = Math.round(local / stride) % featuredSlides.length;
        setActiveIndex((current) => (current === index ? current : index));
    }, []);

    const measure = useCallback(() => {
        const track = trackRef.current;
        const viewport = viewportRef.current;
        if (!track || !viewport) {
            return;
        }

        const cards = track.querySelectorAll<HTMLElement>("[data-featured-card]");
        if (cards.length < featuredSlides.length * 2) {
            return;
        }

        const first = cards[0];
        const secondSetFirst = cards[featuredSlides.length];
        // Prefer measured strip distance (includes gaps) so wrap is pixel-perfect.
        const setWidth = secondSetFirst.offsetLeft - first.offsetLeft;
        const stride = first.offsetWidth + CARD_GAP_PX;
        if (setWidth <= 0 || stride <= 0) {
            return;
        }

        strideRef.current = stride;
        setWidthRef.current = setWidth;
        offsetRef.current = wrapOffset(offsetRef.current || setWidth, setWidth);
        applyTransform();
        syncActiveIndex();
    }, [applyTransform, syncActiveIndex]);

    const stopInertia = useCallback(() => {
        if (rafRef.current) {
            cancelAnimationFrame(rafRef.current);
            rafRef.current = 0;
        }
        velocityRef.current = 0;
    }, []);

    const tickInertia = useCallback(() => {
        const friction = reducedMotion ? 1 : 0.95;
        velocityRef.current *= friction;

        if (Math.abs(velocityRef.current) < 0.05) {
            stopInertia();
            syncActiveIndex();
            return;
        }

        offsetRef.current = wrapOffset(offsetRef.current + velocityRef.current, setWidthRef.current);
        applyTransform();
        syncActiveIndex();
        rafRef.current = requestAnimationFrame(tickInertia);
    }, [applyTransform, reducedMotion, stopInertia, syncActiveIndex]);

    const startInertia = useCallback(() => {
        if (rafRef.current) {
            cancelAnimationFrame(rafRef.current);
        }
        rafRef.current = requestAnimationFrame(tickInertia);
    }, [tickInertia]);

    const animateBy = useCallback(
        (delta: number) => {
            stopInertia();
            if (reducedMotion || Math.abs(delta) < 1) {
                offsetRef.current = wrapOffset(offsetRef.current + delta, setWidthRef.current);
                applyTransform();
                syncActiveIndex();
                return;
            }

            const start = offsetRef.current;
            const target = start + delta;
            const duration = 380;
            const startTime = performance.now();

            const step = (now: number) => {
                const t = Math.min(1, (now - startTime) / duration);
                const eased = 1 - Math.pow(1 - t, 3);
                offsetRef.current = wrapOffset(start + (target - start) * eased, setWidthRef.current);
                applyTransform();
                syncActiveIndex();
                if (t < 1) {
                    rafRef.current = requestAnimationFrame(step);
                } else {
                    rafRef.current = 0;
                }
            };

            rafRef.current = requestAnimationFrame(step);
        },
        [applyTransform, reducedMotion, stopInertia, syncActiveIndex],
    );

    useEffect(() => {
        measure();
        const viewport = viewportRef.current;
        if (!viewport) {
            return;
        }

        const resizeObserver = new ResizeObserver(() => measure());
        resizeObserver.observe(viewport);
        if (trackRef.current) {
            resizeObserver.observe(trackRef.current);
        }

        const onWheel = (event: WheelEvent) => {
            // Only claim horizontal intent so vertical page scroll still works over the strip.
            if (Math.abs(event.deltaX) <= Math.abs(event.deltaY) || Math.abs(event.deltaX) < 0.5) {
                return;
            }
            event.preventDefault();
            stopInertia();
            offsetRef.current = wrapOffset(offsetRef.current + event.deltaX, setWidthRef.current);
            applyTransform();
            syncActiveIndex();
            velocityRef.current = event.deltaX * 0.35;
            startInertia();
        };

        viewport.addEventListener("wheel", onWheel, {passive: false});

        return () => {
            resizeObserver.disconnect();
            viewport.removeEventListener("wheel", onWheel);
            stopInertia();
        };
    }, [applyTransform, measure, startInertia, stopInertia, syncActiveIndex]);

    const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
        if (event.button !== 0) {
            return;
        }
        stopInertia();
        dragRef.current = {
            pointerId: event.pointerId,
            lastX: event.clientX,
            lastTime: performance.now(),
        };
        event.currentTarget.setPointerCapture(event.pointerId);
    };

    const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
        const drag = dragRef.current;
        if (!drag || drag.pointerId !== event.pointerId) {
            return;
        }
        const now = performance.now();
        const dx = event.clientX - drag.lastX;
        const dt = Math.max(1, now - drag.lastTime);
        offsetRef.current = wrapOffset(offsetRef.current - dx, setWidthRef.current);
        velocityRef.current = (-dx / dt) * 16;
        drag.lastX = event.clientX;
        drag.lastTime = now;
        applyTransform();
        syncActiveIndex();
    };

    const endDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
        const drag = dragRef.current;
        if (!drag || drag.pointerId !== event.pointerId) {
            return;
        }
        dragRef.current = null;
        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
            event.currentTarget.releasePointerCapture(event.pointerId);
        }
        startInertia();
    };

    const scrollByCard = (direction: -1 | 1) => {
        const stride = strideRef.current || 400;
        animateBy(direction * stride);
    };

    const scrollToIndex = (logicalIndex: number) => {
        const stride = strideRef.current;
        const setWidth = setWidthRef.current;
        if (stride <= 0 || setWidth <= 0) {
            return;
        }

        const local = ((offsetRef.current % setWidth) + setWidth) % setWidth;
        const current = Math.round(local / stride) % featuredSlides.length;
        let steps = logicalIndex - current;
        const half = featuredSlides.length / 2;
        if (steps > half) {
            steps -= featuredSlides.length;
        }
        if (steps < -half) {
            steps += featuredSlides.length;
        }
        animateBy(steps * stride);
    };

    const scrollProgress = ((activeIndex + 1) / featuredSlides.length) * 100;

    return (
        <div className="w-full" data-node-id="71:1839" data-name="Featured properties">
            <FadeIn className="mb-8 flex items-end justify-between gap-6 md:mb-12">
                <div className="max-w-2xl">
                    <p className="font-aeonik-medium mb-3 text-sm tracking-[0.18em] text-pronix-blue uppercase">
                        Collection
                    </p>
                    <h2 className={PUBLIC_TITLE}>Featured properties</h2>
                    <p className={`mt-4 ${PUBLIC_BODY}`}>{FEATURED_SECTION_COPY}</p>
                </div>
                <div className="hidden shrink-0 items-center gap-3 sm:flex">
                    <span className="font-aeonik-light hidden text-sm text-pronix-ink-muted tabular-nums md:inline">
                        {formatIndex(activeIndex)}
                        <span className="text-pronix-ink-faded">
                            {" "}
                            / {String(featuredSlides.length).padStart(2, "0")}
                        </span>
                    </span>
                    <button
                        type="button"
                        aria-label="Previous featured properties"
                        className="flex size-12 items-center justify-center rounded-[5px] border border-pronix-border text-pronix-ink transition duration-300 hover:border-pronix-blue hover:bg-pronix-blue hover:text-white"
                        onClick={() => scrollByCard(-1)}
                    >
                        <ChevronLeft className="size-5" aria-hidden />
                    </button>
                    <button
                        type="button"
                        aria-label="Next featured properties"
                        className="flex size-12 items-center justify-center rounded-[5px] border border-pronix-border text-pronix-ink transition duration-300 hover:border-pronix-blue hover:bg-pronix-blue hover:text-white"
                        onClick={() => scrollByCard(1)}
                    >
                        <ChevronRight className="size-5" aria-hidden />
                    </button>
                </div>
            </FadeIn>

            <div
                ref={viewportRef}
                className="relative cursor-grab overflow-hidden touch-pan-y py-6 active:cursor-grabbing [perspective:1200px]"
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={endDrag}
                onPointerCancel={endDrag}
            >
                <div
                    ref={trackRef}
                    className="flex w-max items-end gap-3 will-change-transform [transform-style:preserve-3d]"
                    style={{transform: "translate3d(0,0,0)"}}
                >
                    {loopedSlides.map((slide) => {
                        return (
                            <article
                                key={slide.key}
                                data-featured-card
                                data-logical-index={slide.logicalIndex}
                                data-node-id={slide.nodeId}
                                className="group relative w-[min(86vw,400px)] shrink-0 origin-bottom overflow-hidden rounded-[5px] border border-pronix-border bg-white md:w-[400px]"
                                style={{transform: "translateY(0) rotateY(0deg) scale(1)"}}
                            >
                                <div className="relative aspect-[3/4] w-full overflow-hidden bg-pronix-cream">
                                    <img
                                        alt={slide.title}
                                        className="pointer-events-none size-full object-cover"
                                        src={slide.image}
                                        draggable={false}
                                    />
                                    <div className="absolute inset-x-0 top-0 flex items-start justify-between p-4 md:p-5">
                                        <span className="font-aeonik-medium text-xs tracking-[0.16em] text-white tabular-nums drop-shadow-[0_1px_2px_rgba(0,0,0,0.45)]">
                                            {formatIndex(slide.logicalIndex)}
                                        </span>
                                        <span className="font-aeonik-light rounded-[2px] border border-white/50 bg-black/25 px-2.5 py-1 text-xs text-white">
                                            {slide.type}
                                        </span>
                                    </div>
                                </div>
                                <div className="px-4 py-4 md:px-5 md:py-5">
                                    <p className="font-aeonik-light text-sm text-pronix-ink-muted">
                                        {slide.location}
                                    </p>
                                    <h3 className="font-aeonik-medium mt-1 text-xl leading-[1.15] text-pronix-ink md:text-2xl">
                                        {slide.title}
                                    </h3>
                                    <div
                                        aria-hidden
                                        className="mt-3 h-px w-0 bg-pronix-blue transition-all duration-500 ease-out group-hover:w-12"
                                    />
                                </div>
                            </article>
                        );
                    })}
                </div>
            </div>

            <div className="mt-6 flex items-center gap-4 md:mt-8">
                <div className="h-px min-w-0 flex-1 bg-pronix-border">
                    <div
                        className="h-px bg-pronix-blue transition-[width] duration-300 ease-out"
                        style={{width: `${scrollProgress}%`}}
                    />
                </div>
                <div className="flex shrink-0 gap-1.5" role="tablist" aria-label="Featured property slides">
                    {featuredSlides.map((slide, index) => (
                        <button
                            key={slide.id}
                            type="button"
                            role="tab"
                            aria-label={`Go to ${slide.title}`}
                            aria-selected={index === activeIndex}
                            className={`h-1.5 rounded-sm transition-all duration-300 ${
                                index === activeIndex
                                    ? "w-7 bg-pronix-blue"
                                    : "w-1.5 bg-pronix-border hover:bg-pronix-ink-faded"
                            }`}
                            onClick={() => scrollToIndex(index)}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

export default FeaturedPropertiesSection;

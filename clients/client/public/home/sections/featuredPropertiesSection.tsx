import React, {useCallback, useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent} from "react";
import {useNavigate} from "react-router-dom";
import {compose} from "redux";
import {ChevronLeft, ChevronRight} from "lucide-react";
import {useReducedMotion} from "motion/react";
import withLanguage from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import withAxios, {WithAxiosType} from "@coreModule/helpers/hocs/withAxios.tsx";
import {
    FEATURED_SECTION_COPY,
    mapFeaturedProjectsToSlides,
    type FeaturedSlide,
} from "@propertyManagementModule/clients/client/public/home/sections/featuredSlides.ts";
import FadeIn from "@propertyManagementModule/clients/client/public/shared/fadeIn.tsx";
import {
    PUBLIC_BODY,
    PUBLIC_TITLE,
} from "@propertyManagementModule/clients/client/public/shared/layout/publicLayoutTokens.ts";
import type {MarketingFeaturedProjectsResponse} from "@propertyManagementModule/clients/client/public/shared/publicTypes.ts";

const CARD_GAP_PX = 12;
/** Three identical strips — wrap is always invisible because clones match. */
const LOOP_COPIES = 3;
const FOCUS_SCALE = 1;
const SIDE_SCALE = 0.78;
const SIDE_SINK_PX = 28;
const SIDE_TILT_DEG = 10;
/** Ignore sub-threshold jitter so taps still open the property. */
const DRAG_THRESHOLD_PX = 14;

type LoopedSlide = FeaturedSlide & {
    key: string;
    logicalIndex: number;
};

type DragState = {
    pointerId: number;
    startX: number;
    startY: number;
    lastX: number;
    lastTime: number;
    dragging: boolean;
    projectId: string | null;
};

type FeaturedPropertiesSectionProps = WithAxiosType<MarketingFeaturedProjectsResponse>;

function formatIndex(index: number) {
    return String(index + 1).padStart(2, "0");
}

function buildLoopedSlides(slides: FeaturedSlide[]): LoopedSlide[] {
    const looped: LoopedSlide[] = [];
    for (let copy = 0; copy < LOOP_COPIES; copy++) {
        for (const slide of slides) {
            looped.push({
                ...slide,
                key: `${copy}-${slide.projectId}`,
                logicalIndex: slide.id,
            });
        }
    }
    return looped;
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

function FeaturedPropertiesSectionInner({data, loading, onFilterChange}: FeaturedPropertiesSectionProps) {
    const navigate = useNavigate();
    const initialFetchDone = useRef(false);
    const viewportRef = useRef<HTMLDivElement>(null);
    const trackRef = useRef<HTMLDivElement>(null);
    const offsetRef = useRef(0);
    const setWidthRef = useRef(0);
    const strideRef = useRef(0);
    const velocityRef = useRef(0);
    const rafRef = useRef(0);
    const dragRef = useRef<DragState | null>(null);
    const reducedMotion = useReducedMotion();
    const [activeIndex, setActiveIndex] = useState(0);

    useEffect(() => {
        if (initialFetchDone.current) {
            return;
        }
        initialFetchDone.current = true;
        onFilterChange({});
    }, []);

    const slides = useMemo(
        () => mapFeaturedProjectsToSlides(data?.projects ?? []),
        [data?.projects],
    );
    const slideCount = slides.length;
    const loopedSlides = useMemo(() => buildLoopedSlides(slides), [slides]);

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
            // Side cards overlap in 3D space and steal hits — only near-focus cards receive input.
            card.style.pointerEvents = Math.abs(signed) < 0.9 ? "auto" : "none";
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
        if (setWidth <= 0 || stride <= 0 || slideCount <= 0) {
            return;
        }
        const local = ((offsetRef.current % setWidth) + setWidth) % setWidth;
        const index = Math.round(local / stride) % slideCount;
        setActiveIndex((current) => (current === index ? current : index));
    }, [slideCount]);

    const measure = useCallback(() => {
        const track = trackRef.current;
        const viewport = viewportRef.current;
        if (!track || !viewport || slideCount <= 0) {
            return;
        }

        const cards = track.querySelectorAll<HTMLElement>("[data-featured-card]");
        if (cards.length < slideCount * 2) {
            return;
        }

        const first = cards[0];
        const secondSetFirst = cards[slideCount];
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
    }, [applyTransform, slideCount, syncActiveIndex]);

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
        if (slideCount <= 0) {
            return;
        }
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
            const horizontal = event.deltaX;
            const vertical = event.deltaY;
            // Drive the gallery on horizontal / shift+wheel; leave plain vertical to page scroll.
            const dominant =
                Math.abs(horizontal) >= Math.abs(vertical) || event.shiftKey
                    ? horizontal || vertical
                    : 0;
            if (Math.abs(dominant) < 0.5) {
                return;
            }
            event.preventDefault();
            stopInertia();
            offsetRef.current = wrapOffset(offsetRef.current + dominant, setWidthRef.current);
            applyTransform();
            syncActiveIndex();
            velocityRef.current = dominant * 0.35;
            startInertia();
        };

        viewport.addEventListener("wheel", onWheel, {passive: false});

        return () => {
            resizeObserver.disconnect();
            viewport.removeEventListener("wheel", onWheel);
            stopInertia();
        };
    }, [applyTransform, measure, slideCount, startInertia, stopInertia, syncActiveIndex]);

    const projectIdFromPoint = (clientX: number, clientY: number) => {
        const stack = document.elementsFromPoint(clientX, clientY);
        let bestId: string | null = null;
        let bestZ = -Infinity;
        for (const node of stack) {
            if (!(node instanceof Element)) {
                continue;
            }
            const card = node.closest("[data-featured-card]");
            if (!(card instanceof HTMLElement)) {
                continue;
            }
            const id = card.getAttribute("data-project-id");
            if (!id) {
                continue;
            }
            const z = Number(card.style.zIndex || 0);
            if (z >= bestZ) {
                bestZ = z;
                bestId = id;
            }
        }
        return bestId;
    };

    const openProject = useCallback(
        (projectId: string) => {
            navigate(`/project/gallery?projectId=${projectId}`);
        },
        [navigate],
    );

    const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
        if (event.button !== 0) {
            return;
        }
        stopInertia();
        window.getSelection()?.removeAllRanges();
        const fromTarget =
            (event.target as Element | null)?.closest?.("[data-featured-card]")?.getAttribute(
                "data-project-id",
            ) ?? null;
        dragRef.current = {
            pointerId: event.pointerId,
            startX: event.clientX,
            startY: event.clientY,
            lastX: event.clientX,
            lastTime: performance.now(),
            dragging: false,
            projectId: projectIdFromPoint(event.clientX, event.clientY) ?? fromTarget,
        };
        event.currentTarget.setPointerCapture(event.pointerId);
    };

    const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
        const drag = dragRef.current;
        if (!drag || drag.pointerId !== event.pointerId) {
            return;
        }

        const totalDx = event.clientX - drag.startX;
        const totalDy = event.clientY - drag.startY;
        if (!drag.dragging) {
            if (Math.hypot(totalDx, totalDy) < DRAG_THRESHOLD_PX) {
                return;
            }
            drag.dragging = true;
            window.getSelection()?.removeAllRanges();
            drag.lastX = event.clientX;
            drag.lastTime = performance.now();
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

        if (!drag.dragging) {
            const projectId =
                drag.projectId ?? projectIdFromPoint(event.clientX, event.clientY);
            if (projectId) {
                openProject(projectId);
            }
            return;
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
        if (stride <= 0 || setWidth <= 0 || slideCount <= 0) {
            return;
        }

        const local = ((offsetRef.current % setWidth) + setWidth) % setWidth;
        const current = Math.round(local / stride) % slideCount;
        let steps = logicalIndex - current;
        const half = slideCount / 2;
        if (steps > half) {
            steps -= slideCount;
        }
        if (steps < -half) {
            steps += slideCount;
        }
        animateBy(steps * stride);
    };

    if (!loading && slideCount === 0) {
        return null;
    }

    if (loading && slideCount === 0) {
        return (
            <div className="w-full" data-node-id="71:1839" data-name="Featured properties">
                <FadeIn className="mb-8 max-w-2xl md:mb-12">
                    <p className="font-aeonik-medium mb-3 cursor-default text-sm tracking-[0.18em] text-pronix-blue uppercase">
                        Collection
                    </p>
                    <h2 className={PUBLIC_TITLE}>Featured properties</h2>
                    <p className={`mt-4 ${PUBLIC_BODY}`}>{FEATURED_SECTION_COPY}</p>
                </FadeIn>
            </div>
        );
    }

    const scrollProgress = ((activeIndex + 1) / slideCount) * 100;

    return (
        <div className="w-full" data-node-id="71:1839" data-name="Featured properties">
            <FadeIn className="mb-8 flex items-end justify-between gap-6 md:mb-12">
                <div className="max-w-2xl">
                    <p className="font-aeonik-medium mb-3 cursor-default text-sm tracking-[0.18em] text-pronix-blue uppercase">
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
                            / {String(slideCount).padStart(2, "0")}
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
                className="relative cursor-grab select-none overflow-hidden touch-pan-y py-6 [-webkit-user-select:none] active:cursor-grabbing [perspective:1200px]"
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={endDrag}
                onPointerCancel={endDrag}
                onLostPointerCapture={endDrag}
            >
                <div
                    ref={trackRef}
                    className="flex w-max items-end gap-3 will-change-transform select-none [transform-style:preserve-3d]"
                    style={{transform: "translate3d(0,0,0)"}}
                >
                    {loopedSlides.map((slide) => (
                        <article
                            key={slide.key}
                            role="link"
                            tabIndex={0}
                            data-featured-card
                            data-project-id={slide.projectId}
                            data-logical-index={slide.logicalIndex}
                            className="group relative w-[min(86vw,400px)] shrink-0 origin-bottom cursor-pointer select-none md:w-[400px]"
                            style={{transform: "translateY(0) rotateY(0deg) scale(1)"}}
                            draggable={false}
                            onDragStart={(event) => event.preventDefault()}
                            onKeyDown={(event) => {
                                if (event.key === "Enter" || event.key === " ") {
                                    event.preventDefault();
                                    openProject(slide.projectId);
                                }
                            }}
                        >
                            {/* pointer-events-none: hover/click always hit the article, not children or overlaps */}
                            <div className="pointer-events-none overflow-hidden rounded-[5px] border border-pronix-border bg-white">
                                <div className="relative aspect-[3/4] w-full overflow-hidden bg-pronix-cream">
                                    <img
                                        alt={slide.title}
                                        className="size-full object-cover select-none"
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
                            </div>
                        </article>
                    ))}
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
                    {slides.map((slide, index) => (
                        <button
                            key={slide.projectId}
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

export default compose(
    withLanguage("src/modules/propertyManagement/clients/client/public/home/sections/featuredPropertiesSection.tsx"),
    withAxios<MarketingFeaturedProjectsResponse>(
        {method: "post", url: "/api/realEstate/marketingFeaturedProjects", data: {}},
        true,
    ),
    withDebug(true, true),
)(FeaturedPropertiesSectionInner) as unknown as React.ComponentType;

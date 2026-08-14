import {Children, useEffect, useRef, useState, type ReactNode} from "react";

type PublicSnapCarouselProps = {
    children: ReactNode;
    scrollerClassName: string;
    itemClassName?: string;
    rowNodeId?: string;
    inactiveDotClassName?: string;
    dotsClassName?: string;
};

export function PublicSnapCarousel({
    children,
    scrollerClassName,
    itemClassName,
    rowNodeId,
    inactiveDotClassName = "bg-[#d9d9d9]",
    dotsClassName,
}: PublicSnapCarouselProps) {
    const items = Children.toArray(children);
    const scrollerRef = useRef<HTMLDivElement>(null);
    const [activeIndex, setActiveIndex] = useState(0);

    useEffect(() => {
        const scroller = scrollerRef.current;
        if (!scroller) {
            return;
        }

        const updateActive = () => {
            const childNodes = Array.from(scroller.children) as HTMLElement[];
            if (childNodes.length === 0) {
                return;
            }
            const origin = scroller.scrollLeft;
            let nextIndex = 0;
            let closest = Number.POSITIVE_INFINITY;
            childNodes.forEach((child, index) => {
                const distance = Math.abs(child.offsetLeft - origin);
                if (distance < closest) {
                    closest = distance;
                    nextIndex = index;
                }
            });
            setActiveIndex(nextIndex);
        };

        updateActive();
        scroller.addEventListener("scroll", updateActive, {passive: true});
        return () => scroller.removeEventListener("scroll", updateActive);
    }, [items.length]);

    const scrollToIndex = (index: number) => {
        const child = scrollerRef.current?.children[index] as HTMLElement | undefined;
        child?.scrollIntoView({behavior: "smooth", inline: "start", block: "nearest"});
    };

    return (
        <>
            <div ref={scrollerRef} className={scrollerClassName} data-node-id={rowNodeId}>
                {items.map((child, index) => (
                    <div key={(child as {key?: string | null}).key ?? index} className={itemClassName}>
                        {child}
                    </div>
                ))}
            </div>
            <div className={`mt-3 flex w-full items-center justify-center gap-2.5 md:hidden ${dotsClassName ?? ""}`} role="tablist" aria-label="Carousel">
                {items.map((child, index) => {
                    const isActive = index === activeIndex;
                    return (
                        <button
                            key={(child as {key?: string | null}).key ?? index}
                            type="button"
                            role="tab"
                            aria-selected={isActive}
                            aria-label={`${index + 1}`}
                            onClick={() => scrollToIndex(index)}
                            className={
                                isActive
                                    ? "h-2.5 w-8 shrink-0 rounded-full bg-pronix-blue"
                                    : `size-2.5 shrink-0 rounded-full ${inactiveDotClassName}`
                            }
                        />
                    );
                })}
            </div>
        </>
    );
}

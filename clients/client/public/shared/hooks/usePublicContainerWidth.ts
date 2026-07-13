import {useEffect, useState, type RefObject} from "react";

export function usePublicContainerWidth(ref: RefObject<HTMLElement | null>) {
    const [width, setWidth] = useState(0);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        const update = () => setWidth(element.getBoundingClientRect().width);
        update();

        const observer = new ResizeObserver(update);
        observer.observe(element);
        return () => observer.disconnect();
    }, [ref]);

    return width;
}

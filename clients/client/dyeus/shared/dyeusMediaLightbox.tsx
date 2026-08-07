import {useEffect, useState} from "react";
import {ChevronLeft, ChevronRight, X} from "lucide-react";

type DyeusMediaLightboxProps = {
    images?: string[];
    videos?: string[];
    /** Which collection to show initially. */
    kind: "image" | "video";
    initialIndex?: number;
    onClose: () => void;
};

function DyeusMediaLightbox({
    images = [],
    videos = [],
    kind,
    initialIndex = 0,
    onClose,
}: DyeusMediaLightboxProps) {
    const items = kind === "image" ? images : videos;
    const [index, setIndex] = useState(() =>
        Math.min(Math.max(initialIndex, 0), Math.max(items.length - 1, 0)),
    );

    useEffect(() => {
        const previous = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = previous;
        };
    }, []);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                onClose();
                return;
            }
            if (items.length < 2) return;
            if (e.key === "ArrowLeft") {
                setIndex((current) => (current - 1 + items.length) % items.length);
            }
            if (e.key === "ArrowRight") {
                setIndex((current) => (current + 1) % items.length);
            }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [items.length, onClose]);

    if (items.length === 0) return null;

    const src = items[index] ?? items[0];
    const showNav = items.length > 1;

    return (
        <div
            role="dialog"
            aria-modal="true"
            aria-label={kind === "image" ? "Image viewer" : "Video player"}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-dyeus-ink/92 p-4 md:p-10"
            onClick={onClose}
        >
            <button
                type="button"
                onClick={onClose}
                className="absolute right-4 top-4 z-10 flex size-10 cursor-pointer items-center justify-center text-dyeus-cream transition hover:text-dyeus-bronze md:right-6 md:top-6"
                aria-label="Close"
            >
                <X className="size-6" strokeWidth={1.5} />
            </button>

            {showNav ? (
                <>
                    <button
                        type="button"
                        className="absolute left-2 top-1/2 z-10 flex size-10 -translate-y-1/2 cursor-pointer items-center justify-center text-dyeus-cream/80 transition hover:text-dyeus-cream md:left-4 md:size-12"
                        aria-label="Previous"
                        onClick={(e) => {
                            e.stopPropagation();
                            setIndex((current) => (current - 1 + items.length) % items.length);
                        }}
                    >
                        <ChevronLeft className="size-8" strokeWidth={1.5} />
                    </button>
                    <button
                        type="button"
                        className="absolute right-2 top-1/2 z-10 flex size-10 -translate-y-1/2 cursor-pointer items-center justify-center text-dyeus-cream/80 transition hover:text-dyeus-cream md:right-4 md:size-12"
                        aria-label="Next"
                        onClick={(e) => {
                            e.stopPropagation();
                            setIndex((current) => (current + 1) % items.length);
                        }}
                    >
                        <ChevronRight className="size-8" strokeWidth={1.5} />
                    </button>
                </>
            ) : null}

            <div
                className="relative flex max-h-full max-w-full items-center justify-center"
                onClick={(e) => e.stopPropagation()}
            >
                {kind === "image" ? (
                    <img
                        src={src}
                        alt=""
                        className="max-h-[min(90vh,920px)] max-w-[min(100vw-2rem,1280px)] object-contain"
                    />
                ) : (
                    <video
                        key={src}
                        src={src}
                        controls
                        autoPlay
                        playsInline
                        className="max-h-[min(90vh,920px)] w-full max-w-[min(100vw-2rem,1280px)] bg-dyeus-ink"
                    />
                )}
            </div>

            {showNav ? (
                <p className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 font-dyeus-sans text-xs tracking-[0.18em] text-dyeus-cream/70">
                    {index + 1} / {items.length}
                </p>
            ) : null}
        </div>
    );
}

export default DyeusMediaLightbox;

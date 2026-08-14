import {useEffect, useState} from "react";
import {ChevronLeft, ChevronRight, X} from "lucide-react";
import {cn} from "@coreModule/components/lib/utils.ts";

type ImageLightboxProps = {
    images: string[];
    initialIndex?: number;
    onClose: () => void;
};

function isVideoUrl(url: string) {
    return /\.(mp4|webm|ogg|mov)(\?|$)/i.test(url);
}

function ImageLightbox({images, initialIndex = 0, onClose}: ImageLightboxProps) {
    const [index, setIndex] = useState(() => Math.min(initialIndex, Math.max(0, images.length - 1)));
    const current = images[index];
    const currentIsVideo = current ? isVideoUrl(current) : false;

    useEffect(() => {
        const onKey = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                onClose();
                return;
            }
            if (event.key === "ArrowLeft") {
                setIndex((prev) => (prev - 1 + images.length) % images.length);
            }
            if (event.key === "ArrowRight") {
                setIndex((prev) => (prev + 1) % images.length);
            }
        };
        window.addEventListener("keydown", onKey);
        document.body.style.overflow = "hidden";
        return () => {
            window.removeEventListener("keydown", onKey);
            document.body.style.overflow = "";
        };
    }, [images.length, onClose]);

    if (!current) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-[100] flex flex-col bg-black/92" onClick={onClose}>
            <button
                type="button"
                onClick={onClose}
                className="absolute right-4 top-4 z-10 flex size-10 cursor-pointer items-center justify-center rounded-[5px] text-white transition hover:bg-white/10"
                aria-label="Close"
            >
                <X className="size-6" strokeWidth={1.5} />
            </button>

            <div
                className="relative flex min-h-0 flex-1 items-center justify-center px-14 py-10"
                onClick={(event) => event.stopPropagation()}
            >
                {images.length > 1 ? (
                    <button
                        type="button"
                        className="absolute left-3 flex size-10 cursor-pointer items-center justify-center rounded-[5px] text-white transition hover:bg-white/10"
                        onClick={() => setIndex((prev) => (prev - 1 + images.length) % images.length)}
                        aria-label="Previous"
                    >
                        <ChevronLeft className="size-7" strokeWidth={1.5} />
                    </button>
                ) : null}
                {currentIsVideo ? (
                    <video
                        key={current}
                        src={current}
                        className="max-h-full max-w-full object-contain"
                        controls
                        autoPlay
                    />
                ) : (
                    <img alt="" className="max-h-full max-w-full object-contain" src={current} />
                )}
                {images.length > 1 ? (
                    <button
                        type="button"
                        className="absolute right-3 flex size-10 cursor-pointer items-center justify-center rounded-[5px] text-white transition hover:bg-white/10"
                        onClick={() => setIndex((prev) => (prev + 1) % images.length)}
                        aria-label="Next"
                    >
                        <ChevronRight className="size-7" strokeWidth={1.5} />
                    </button>
                ) : null}
            </div>

            {images.length > 1 ? (
                <div
                    className="shrink-0 overflow-x-auto px-4 pb-5 pt-1"
                    onClick={(event) => event.stopPropagation()}
                >
                    <div className="mx-auto flex w-max gap-2">
                        {images.map((url, itemIndex) => {
                            const selected = itemIndex === index;
                            const video = isVideoUrl(url);
                            return (
                                <button
                                    key={`${url}-${itemIndex}`}
                                    type="button"
                                    onClick={() => setIndex(itemIndex)}
                                    className={cn(
                                        "relative h-16 w-24 shrink-0 cursor-pointer overflow-hidden rounded-[5px] border transition",
                                        selected
                                            ? "border-white"
                                            : "border-white/25 hover:border-white/70",
                                    )}
                                    aria-label={`Media ${itemIndex + 1}`}
                                    aria-current={selected}
                                >
                                    {video ? (
                                        <video src={url} muted playsInline className="size-full object-cover" />
                                    ) : (
                                        <img alt="" className="size-full object-cover" src={url} />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            ) : null}
        </div>
    );
}

export default ImageLightbox;

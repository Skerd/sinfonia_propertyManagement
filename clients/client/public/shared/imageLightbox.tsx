import {useEffect, useState} from "react";
import {compose} from "redux";
import {Dialog, DialogFrame} from "@coreModule/components/ui/dialog.tsx";
import {Button} from "@coreModule/components/ui/button.tsx";
import {IconChevronLeft, IconChevronRight, IconX} from "@tabler/icons-react";
import {cn} from "@coreModule/components/lib/utils.ts";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {fillLanguageTemplate} from "@propertyManagementModule/clients/client/public/shared/publicTypes.ts";

type ImageLightboxProps = WithLanguageType & {
    images: string[];
    initialIndex?: number;
    onClose: () => void;
};

function isVideoUrl(url: string) {
    return /\.(mp4|webm|ogg|mov)(\?|$)/i.test(url);
}

function ImageLightbox({images, initialIndex = 0, onClose, resolveLanguageKey}: ImageLightboxProps) {
    const [index, setIndex] = useState(() => Math.min(initialIndex, Math.max(0, images.length - 1)));
    const current = images[index];
    const currentIsVideo = current ? isVideoUrl(current) : false;

    useEffect(() => {
        const onKey = (event: KeyboardEvent) => {
            if (event.key === "ArrowLeft") {
                setIndex((prev) => (prev - 1 + images.length) % images.length);
            }
            if (event.key === "ArrowRight") {
                setIndex((prev) => (prev + 1) % images.length);
            }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [images.length]);

    if (!current) {
        return null;
    }

    // Radix: focus trap and return, Escape, scroll lock (D23). The viewer is the dialog, so its buttons stay
    // reachable; a click on the dark area around the media closes it.
    return (
        <Dialog open onOpenChange={(next) => !next && onClose()}>
            <DialogFrame
                title={resolveLanguageKey("title")}
                overlayClassName="fixed inset-0 z-[300]"
                className="fixed inset-0 z-[300] flex flex-col bg-black/92"
                onClick={(event) => {
                    if (event.target === event.currentTarget) onClose();
                }}
            >
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    className="absolute right-4 top-4 z-10 flex size-10 cursor-pointer items-center justify-center rounded-[5px] text-white transition hover:bg-white/10 hover:text-white"
                    aria-label={resolveLanguageKey("close")}
                >
                    <IconX className="size-6" strokeWidth={1.5} />
                </Button>

                <div className="relative flex min-h-0 flex-1 items-center justify-center px-14 py-10">
                    {images.length > 1 ? (
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute left-3 flex size-10 cursor-pointer items-center justify-center rounded-[5px] text-white transition hover:bg-white/10 hover:text-white"
                            onClick={() => setIndex((prev) => (prev - 1 + images.length) % images.length)}
                            aria-label={resolveLanguageKey("previous")}
                        >
                            <IconChevronLeft className="size-7" strokeWidth={1.5} />
                        </Button>
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
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-3 flex size-10 cursor-pointer items-center justify-center rounded-[5px] text-white transition hover:bg-white/10 hover:text-white"
                            onClick={() => setIndex((prev) => (prev + 1) % images.length)}
                            aria-label={resolveLanguageKey("next")}
                        >
                            <IconChevronRight className="size-7" strokeWidth={1.5} />
                        </Button>
                    ) : null}
                </div>

                {images.length > 1 ? (
                    <div className="shrink-0 overflow-x-auto px-4 pb-5 pt-1">
                        <div className="mx-auto flex w-max gap-2">
                            {images.map((url, itemIndex) => {
                                const selected = itemIndex === index;
                                const video = isVideoUrl(url);
                                return (
                                    <Button
                                        key={`${url}-${itemIndex}`}
                                        type="button"
                                        variant="ghost"
                                        onClick={() => setIndex(itemIndex)}
                                        className={cn(
                                            "relative block h-16 w-24 shrink-0 cursor-pointer overflow-hidden rounded-[5px] border p-0 transition",
                                            selected
                                                ? "border-white"
                                                : "border-white/25 hover:border-white/70",
                                        )}
                                        aria-label={fillLanguageTemplate(resolveLanguageKey("media"), {index: itemIndex + 1})}
                                        aria-current={selected}
                                    >
                                        {video ? (
                                            <video src={url} muted playsInline className="size-full object-cover" />
                                        ) : (
                                            <img alt="" className="size-full object-cover" src={url} />
                                        )}
                                    </Button>
                                );
                            })}
                        </div>
                    </div>
                ) : null}
            </DialogFrame>
        </Dialog>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/client/public/shared/imageLightbox.tsx"),
)(ImageLightbox);

import {cn} from "@coreModule/components/lib/utils.ts";

export type ModifyImagesOnDarkModeProps = {
    src: string;
    alt?: string;
    className?: string;
};

/**
 * Dark-mode treatment for PM floor/unit plan images.
 * Uses CSS filters under `.dark` so it always applies (no canvas bake / CORS / layout races).
 *
 * Pass to GalleryCarousel: `modifyImagesOnDarkMode={ModifyImagesOnDarkMode}`.
 */
export function ModifyImagesOnDarkMode({
    src,
    alt = "",
    className,
}: ModifyImagesOnDarkModeProps) {
    return (
        <span className="absolute inset-0 block overflow-hidden bg-background dark:bg-black">
            <img
                src={src}
                alt={alt}
                className={cn(
                    className,
                    // Invert only in dark mode via document `.dark` class (theme root).
                    "dark:[filter:invert(1)_hue-rotate(180deg)_contrast(1.12)_saturate(1.2)_brightness(1.05)]",
                )}
                draggable={false}
                decoding="async"
            />
        </span>
    );
}

/** @deprecated Prefer `ModifyImagesOnDarkMode` (PascalCase component). */
export const modifyImagesOnDarkMode = ModifyImagesOnDarkMode;

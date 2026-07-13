import {useEffect} from "react";

type ImageLightboxProps = {
    images: string[];
    initialIndex?: number;
    onClose: () => void;
};

function ImageLightbox({images, initialIndex = 0, onClose}: ImageLightboxProps) {
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [onClose]);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-8" onClick={onClose}>
            <button type="button" onClick={onClose} className="absolute right-6 top-6 font-aeonik-light text-white">Close</button>
            <img
                alt=""
                className="max-h-full max-w-full object-contain"
                src={images[initialIndex]}
                onClick={(e) => e.stopPropagation()}
            />
        </div>
    );
}

export default ImageLightbox;

import {useEffect, useState} from "react";
import {createPortal} from "react-dom";
import {X} from "lucide-react";
import PdfDialogViewer from "@coreModule/components/custom/pdf/PdfDialogViewer.tsx";

type PdfLightboxProps = {
    src: string;
    onClose: () => void;
};

function PdfLightbox({src, onClose}: PdfLightboxProps) {
    const [host, setHost] = useState<HTMLElement | null>(null);

    useEffect(() => {
        setHost(document.body);
    }, []);

    useEffect(() => {
        if (!host) {
            return;
        }
        const onKey = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                onClose();
            }
        };
        window.addEventListener("keydown", onKey);
        const previousOverflow = host.style.overflow;
        host.style.overflow = "hidden";
        return () => {
            window.removeEventListener("keydown", onKey);
            host.style.overflow = previousOverflow;
        };
    }, [host, onClose]);

    if (!host) {
        return null;
    }

    return createPortal(
        <div className="fixed inset-0 z-[300] flex flex-col bg-black/92" onClick={onClose}>
            <button
                type="button"
                onClick={onClose}
                className="absolute right-4 top-4 z-10 flex size-10 cursor-pointer items-center justify-center rounded-[5px] text-white transition hover:bg-white/10"
                aria-label="Close"
            >
                <X className="size-6" strokeWidth={1.5} />
            </button>
            <div
                className="relative flex min-h-0 flex-1 items-stretch justify-center px-4 py-4 sm:px-10 sm:py-6"
                onClick={(event) => event.stopPropagation()}
            >
                <PdfDialogViewer src={src} className="h-full min-h-0 w-full" />
            </div>
        </div>,
        host,
    );
}

export default PdfLightbox;

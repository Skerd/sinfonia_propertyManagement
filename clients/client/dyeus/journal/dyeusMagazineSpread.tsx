import {useEffect, useMemo, useRef, useState} from "react";
import * as pdfjs from "pdfjs-dist";
import {cn} from "@coreModule/components/lib/utils.ts";
import {dyeusAssets} from "@propertyManagementModule/clients/client/dyeus/shared/dyeusAssets.ts";
import {useDyeusT} from "@propertyManagementModule/clients/client/dyeus/shared/useDyeusT.ts";
import {resolveMarketingMediaUrl} from "@propertyManagementModule/clients/client/public/shared/resolveMarketingMedia.ts";
import {ensurePdfjsWorker} from "@coreModule/helpers/pdf/pdfjsWorker.ts";

ensurePdfjsWorker(pdfjs);

const LOAD_TIMEOUT_MS = 12_000;

type DyeusMagazineSpreadProps = {
    fileUrl?: string;
    className?: string;
};

/**
 * Open-book preview of the project magazine PDF (pages 1–2).
 * Falls back to the static Figma spread when no PDF is available or load fails.
 */
export default function DyeusMagazineSpread({fileUrl, className}: DyeusMagazineSpreadProps) {
    const {t} = useDyeusT("src/modules/propertyManagement/clients/client/dyeus/journal/index.tsx");
    const resolvedUrl = useMemo(() => resolveMarketingMediaUrl(fileUrl), [fileUrl]);
    const containerRef = useRef<HTMLDivElement>(null);
    const leftCanvasRef = useRef<HTMLCanvasElement>(null);
    const rightCanvasRef = useRef<HTMLCanvasElement>(null);
    const [failed, setFailed] = useState(false);
    const [ready, setReady] = useState(false);
    const [pageCount, setPageCount] = useState(0);
    const [containerWidth, setContainerWidth] = useState(0);

    useEffect(() => {
        setFailed(false);
        setReady(false);
        setPageCount(0);
    }, [resolvedUrl]);

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        const update = () => {
            const width = el.clientWidth;
            if (width > 0) setContainerWidth(width);
        };
        update();

        const observer = new ResizeObserver(update);
        observer.observe(el);
        return () => observer.disconnect();
    }, [resolvedUrl, failed]);

    useEffect(() => {
        if (!resolvedUrl || failed || containerWidth <= 0) return;

        let cancelled = false;
        const pageWidth = Math.floor((containerWidth - 8) / 2);
        const timeoutId = window.setTimeout(() => {
            if (!cancelled) setFailed(true);
        }, LOAD_TIMEOUT_MS);

        (async () => {
            try {
                const response = await fetch(resolvedUrl);
                if (!response.ok) throw new Error(`media_${response.status}`);
                const data = new Uint8Array(await response.arrayBuffer());
                if (cancelled) return;

                const pdf = await pdfjs.getDocument({data}).promise;
                if (cancelled) return;

                const pages = pdf.numPages;
                setPageCount(pages);

                const renderPage = async (pageNumber: number, canvas: HTMLCanvasElement | null) => {
                    if (!canvas || pageNumber > pages) return;
                    const page = await pdf.getPage(pageNumber);
                    if (cancelled) return;

                    const unscaled = page.getViewport({scale: 1});
                    const scale = pageWidth / unscaled.width;
                    const viewport = page.getViewport({scale});
                    const outputScale = window.devicePixelRatio || 1;

                    canvas.width = Math.floor(viewport.width * outputScale);
                    canvas.height = Math.floor(viewport.height * outputScale);
                    canvas.style.width = `${Math.floor(viewport.width)}px`;
                    canvas.style.height = `${Math.floor(viewport.height)}px`;

                    const context = canvas.getContext("2d");
                    if (!context) throw new Error("canvas_context_unavailable");

                    await page.render({
                        canvasContext: context,
                        canvas,
                        viewport,
                        transform: outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : undefined,
                    }).promise;
                };

                await renderPage(1, leftCanvasRef.current);
                if (pages >= 2) {
                    await renderPage(2, rightCanvasRef.current);
                }
                if (!cancelled) {
                    window.clearTimeout(timeoutId);
                    setReady(true);
                }
            } catch {
                if (!cancelled) setFailed(true);
            }
        })();

        return () => {
            cancelled = true;
            window.clearTimeout(timeoutId);
        };
    }, [resolvedUrl, failed, containerWidth]);

    if (!resolvedUrl || failed) {
        return (
            <div className={cn("w-full overflow-hidden", className)}>
                <img
                    src={dyeusAssets.magazineSpread}
                    alt=""
                    className="h-auto w-full object-cover"
                />
            </div>
        );
    }

    return (
        <div ref={containerRef} className={cn("relative w-full overflow-hidden", className)}>
            {!ready ? (
                <div className="flex aspect-[705/495] w-full items-center justify-center bg-dyeus-sand/30">
                    <span className="font-dyeus-sans text-sm text-dyeus-ink-muted">{t("loadingMagazine")}</span>
                </div>
            ) : null}
            <div
                className={cn(
                    "flex w-full items-stretch gap-1 bg-white shadow-sm",
                    !ready && "pointer-events-none absolute inset-0 opacity-0",
                )}
                aria-hidden={!ready}
            >
                <canvas ref={leftCanvasRef} className="block max-w-full shrink-0" />
                <canvas
                    ref={rightCanvasRef}
                    className={cn("block max-w-full shrink-0", pageCount < 2 && ready && "hidden")}
                />
            </div>
        </div>
    );
}

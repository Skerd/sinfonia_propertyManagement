import {useEffect, useMemo, useState} from "react";
import {compose} from "redux";
import {IconAlertTriangle, IconDeviceDesktop, IconDeviceMobile} from "@tabler/icons-react";
import useHttpRequest, {type HttpRequest} from "@coreModule/helpers/hooks/useHttpRequest.ts";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import type {
    AdCampaignTemplatePreviewResponse,
} from "armonia/src/modules/propertyManagement/api/realEstate/private/adCampaignTemplate/adCampaignTemplate.dto.ts";
import {Button} from "@coreModule/components/ui/button.tsx";
import {Badge} from "@coreModule/components/ui/badge.tsx";
import {cn} from "@coreModule/components/lib/utils.ts";

/** Widths the preview can be framed at. Mobile is the iPhone logical width. */
const WIDTHS = {desktop: "100%", mobile: "375px"} as const;
type PreviewWidth = keyof typeof WIDTHS;

export type EmailHtmlPreviewProps = WithLanguageType & {
    apiUrl: string;
    bodyHtml: string;
    subject?: string;
    previewText?: string;
    campaignType?: string;
    locale?: string;
    campaignId?: string;
    height?: number;
    /** Keystroke-to-request delay. */
    debounceMs?: number;
    className?: string;
};

/**
 * Live preview of a campaign email.
 *
 * The markup is rendered **by the server**, through the same
 * `renderAdCampaignEmail` the sender uses, so what an author approves here is
 * byte-identical to what ships — shell, locale strings, token substitution and
 * sanitization included. Rendering it client-side would preview a different
 * document than the one that goes out, which is worse than no preview.
 *
 * The result lands in an iframe with `sandbox=""` — every capability withheld,
 * including same-origin, scripts and form submission. Campaign HTML is
 * sanitized on write and again on render, and this is the third layer: even a
 * body that somehow carried live markup cannot reach the panel's DOM, cookies
 * or session from inside it.
 */
function EmailHtmlPreview({
    apiUrl,
    bodyHtml,
    subject,
    previewText,
    campaignType,
    locale,
    campaignId,
    height = 520,
    debounceMs = 600,
    resolveLanguageKey,
    className,
}: EmailHtmlPreviewProps) {
    const [result, setResult] = useState<AdCampaignTemplatePreviewResponse | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [width, setWidth] = useState<PreviewWidth>("desktop");

    const previewRequest = useMemo<HttpRequest>(() => ({method: "post", url: apiUrl}), [apiUrl]);
    const previewBody = useMemo(
        () => ({bodyHtml, subject, previewText, campaignType, locale, campaignId}),
        [bodyHtml, subject, previewText, campaignType, locale, campaignId],
    );
    // One render per pause in typing; a newer request aborts an older, slower one.
    const [previewCount, setPreviewCount] = useState(0);
    useEffect(() => {
        if (!campaignType || !locale) {
            // The server needs both to pick locale strings and sample values;
            // until the form has them there is nothing meaningful to render.
            setResult(null);
            return;
        }
        const timer = setTimeout(() => setPreviewCount((count) => count + 1), debounceMs);
        return () => clearTimeout(timer);
    }, [previewRequest, previewBody, campaignType, locale, debounceMs]);
    const {loading: pending} = useHttpRequest<AdCampaignTemplatePreviewResponse>(previewRequest, previewBody, previewCount, true, {
        success: (data) => {
            setResult(data);
            setError(null);
        },
        error: () => setError(String(resolveLanguageKey("previewFailed"))),
    });

    const unresolved = result?.unresolvedPlaceholders ?? [];

    return (
        <div className={cn("flex flex-col gap-2", className)}>
            <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex min-w-0 flex-col">
                    <span className="text-xs text-muted-foreground">{resolveLanguageKey("previewSubject")}</span>
                    <span className="truncate text-sm font-medium">
                        {result?.subject || resolveLanguageKey("previewNoSubject")}
                    </span>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                    {pending ? (
                        <span className="mr-1 text-xs text-muted-foreground">{resolveLanguageKey("previewUpdating")}</span>
                    ) : null}
                    <Button
                        type="button"
                        size="icon"
                        variant={width === "desktop" ? "secondary" : "ghost"}
                        aria-label={String(resolveLanguageKey("previewDesktop"))}
                        aria-pressed={width === "desktop"}
                        onClick={() => setWidth("desktop")}
                    >
                        <IconDeviceDesktop className="h-4 w-4" />
                    </Button>
                    <Button
                        type="button"
                        size="icon"
                        variant={width === "mobile" ? "secondary" : "ghost"}
                        aria-label={String(resolveLanguageKey("previewMobile"))}
                        aria-pressed={width === "mobile"}
                        onClick={() => setWidth("mobile")}
                    >
                        <IconDeviceMobile className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {unresolved.length > 0 ? (
                <div className="flex flex-wrap items-center gap-2 rounded-md border border-amber-500/40 bg-amber-500/10 p-2">
                    <IconAlertTriangle className="h-4 w-4 shrink-0 text-amber-600" />
                    <span className="text-xs text-muted-foreground">{resolveLanguageKey("previewUnresolved")}</span>
                    {unresolved.map((token) => (
                        <Badge key={token} variant="secondary" className="font-mono text-[11px]">
                            {`{${token}}`}
                        </Badge>
                    ))}
                </div>
            ) : null}

            <div className="flex justify-center overflow-auto rounded-md border bg-muted/30 p-2">
                {error ? (
                    <p className="p-6 text-sm text-muted-foreground">{error}</p>
                ) : (
                    <iframe
                        // Empty sandbox: no scripts, no same-origin, no forms, no
                        // top-level navigation. Right for mail markup, which needs none.
                        sandbox=""
                        srcDoc={result?.html ?? ""}
                        title={String(resolveLanguageKey("previewFrameTitle"))}
                        style={{width: WIDTHS[width], height: `${height}px`}}
                        className="rounded border-0 bg-white"
                    />
                )}
            </div>
        </div>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/components/custom/adCampaign/emailHtmlPreview.tsx"),
)(EmailHtmlPreview);

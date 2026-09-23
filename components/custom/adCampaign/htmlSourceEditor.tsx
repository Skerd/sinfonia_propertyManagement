import {useCallback, useEffect, useRef, useState} from "react";
import {compose} from "redux";
import {useFormContext} from "react-hook-form";
import {Code2, Eye, EyeOff} from "lucide-react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {FormControl, FormField, FormItem, FormLabel, FormMessage} from "@coreModule/components/ui/form.tsx";
import {Textarea} from "@coreModule/components/ui/textarea.tsx";
import {Button} from "@coreModule/components/ui/button.tsx";
import TooltipDisplayer from "@coreModule/components/custom/tooltipDisplayer.tsx";
import {cn} from "@coreModule/components/lib/utils.ts";
import EmailHtmlPreview from "@propertyManagementModule/components/custom/adCampaign/emailHtmlPreview.tsx";

/**
 * Ready-made blocks, in table-based email HTML.
 *
 * Hardcoded rather than translated: these are markup, not copy. An author edits
 * the words after inserting, and a localized `<table>` would be the same table.
 */
const SNIPPETS: {id: string; html: string}[] = [
    {id: "paragraph", html: `<p style="margin:0 0 14px;">Text</p>`},
    {
        id: "heading",
        html: `<h2 style="margin:0 0 12px;font-size:19px;font-weight:600;color:#111114;">Heading</h2>`,
    },
    {
        id: "button",
        html:
            `<table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:26px auto 0;">` +
            `<tr><td bgcolor="#111114" style="background-color:#111114;border-radius:8px;">` +
            `<a href="{ctaUrl}" style="display:inline-block;padding:13px 28px;font-family:'Montserrat',Arial,sans-serif;font-size:14px;font-weight:600;color:#ffffff;text-decoration:none;">Read more</a>` +
            `</td></tr></table>`,
    },
    {
        id: "row",
        html:
            `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:22px 0 0;border-collapse:collapse;">` +
            `<tr><td style="padding:10px 0;border-bottom:1px solid #eceef1;color:#8a9099;font-size:13px;">Label</td>` +
            `<td align="right" style="padding:10px 0;border-bottom:1px solid #eceef1;font-size:14px;">Value</td></tr>` +
            `</table>`,
    },
    {id: "list", html: `<ul style="margin:16px 0 0;padding-left:20px;"><li style="margin:0 0 6px;">Item</li></ul>`},
    {
        id: "divider",
        html: `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding:18px 0;"><div style="height:1px;background:#eceef1;"></div></td></tr></table>`,
    },
    {
        id: "image",
        html: `<img src="https://" alt="" width="520" style="display:block;width:100%;max-width:520px;height:auto;border:0;" />`,
    },
];

type HtmlSourceEditorProps = WithLanguageType & {
    name: string;
    /** Already resolved by the form renderer against the page's dictionary. */
    label?: string;
    required?: boolean;
    loading?: boolean;
    disabled?: boolean;
    maxLength?: number;
    rows?: number;
    /** Tokens offered in the palette, from `AD_CAMPAIGN_PLACEHOLDERS`. */
    placeholders?: readonly string[];
    previewApiUrl?: string;
    /** Sibling form fields the preview reads. */
    campaignTypeField?: string;
    localeField?: string;
    subjectField?: string;
    previewTextField?: string;
    /** Used when the form has no locale field of its own (campaign overrides). */
    defaultLocale?: string;
    /** Campaign overrides: blank falls back to the template, so say so. */
    emptyMeansInherit?: boolean;
};

/**
 * HTML source editor for campaign email bodies: a monospace textarea, a
 * click-to-insert token palette, an email-safe snippet toolbar and the live
 * server-rendered preview.
 *
 * Deliberately not a WYSIWYG. The deliverable is *email* HTML — nested tables
 * and inline styles — and the editors that would fit in this bundle emit
 * semantic web markup and quietly rewrite table layouts. The token is the
 * contract, so this can be swapped for a real code editor later without
 * touching a single `.views.ts`.
 */
function HtmlSourceEditor({
    name,
    label,
    required,
    loading = false,
    disabled = false,
    maxLength,
    rows = 20,
    placeholders = [],
    previewApiUrl,
    campaignTypeField = "campaignType",
    localeField,
    subjectField,
    previewTextField,
    defaultLocale = "en-US",
    emptyMeansInherit = false,
    resolveLanguageKey,
}: HtmlSourceEditorProps) {
    const form = useFormContext();
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);
    /** Caret offset to restore once React has committed an inserted token. */
    const pendingCaretRef = useRef<number | null>(null);
    const [showPreview, setShowPreview] = useState(true);

    const value = String(form.watch(name) ?? "");
    const campaignType = campaignTypeField ? (form.watch(campaignTypeField) as string | undefined) : undefined;
    const locale = localeField ? (form.watch(localeField) as string | undefined) : undefined;
    const subject = subjectField ? (form.watch(subjectField) as string | undefined) : undefined;
    const previewText = previewTextField ? (form.watch(previewTextField) as string | undefined) : undefined;

    /**
     * Splice `text` in at the caret, then put the caret after it.
     *
     * Restoring the caret matters: without it the cursor jumps to the end on
     * every insert, so building a body mid-document means re-clicking after
     * each token — enough friction that the palette stops being used.
     *
     * The restore is deferred to an effect rather than done inline, because the
     * textarea still holds the *old* text until React commits the new value;
     * setting the selection before that would position it in the wrong string,
     * and the commit would then reset it anyway.
     */
    const insertAtCaret = useCallback(
        (text: string) => {
            const el = textareaRef.current;
            const current = String(form.getValues(name) ?? "");
            const start = el?.selectionStart ?? current.length;
            const end = el?.selectionEnd ?? current.length;
            let next = current.slice(0, start) + text + current.slice(end);
            if (maxLength != null && next.length > maxLength) next = next.slice(0, maxLength);

            pendingCaretRef.current = Math.min(start + text.length, next.length);
            form.setValue(name, next, {shouldValidate: true, shouldDirty: true});
        },
        [form, name, maxLength],
    );

    useEffect(() => {
        const caret = pendingCaretRef.current;
        if (caret == null) return;
        pendingCaretRef.current = null;
        const el = textareaRef.current;
        el?.focus();
        el?.setSelectionRange(caret, caret);
    }, [value]);

    const readOnly = loading || disabled;
    const overLimit = maxLength != null && value.length > maxLength;

    return (
        <FormField
            control={form.control}
            name={name}
            render={({field}) => (
                <FormItem className="min-w-0">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <FormLabel>
                            {label}
                            {required ? <span aria-hidden className="ml-0.5 text-destructive">*</span> : null}
                        </FormLabel>
                        {previewApiUrl ? (
                            <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                onClick={() => setShowPreview((open) => !open)}
                                aria-expanded={showPreview}
                            >
                                {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                {resolveLanguageKey(showPreview ? "hidePreview" : "showPreview")}
                            </Button>
                        ) : null}
                    </div>

                    {emptyMeansInherit ? (
                        <p className="text-xs text-muted-foreground">{resolveLanguageKey("inheritHint")}</p>
                    ) : null}

                    {SNIPPETS.length > 0 && !readOnly ? (
                        <div className="flex flex-wrap items-center gap-1">
                            <Code2 className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
                            {SNIPPETS.map((snippet) => (
                                <Button
                                    key={snippet.id}
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    className="h-7 px-2 text-xs"
                                    onClick={() => insertAtCaret(snippet.html)}
                                >
                                    {resolveLanguageKey(`snippets.${snippet.id}`)}
                                </Button>
                            ))}
                        </div>
                    ) : null}

                    <FormControl>
                        <Textarea
                            {...field}
                            value={value}
                            ref={(el) => {
                                field.ref(el);
                                textareaRef.current = el;
                            }}
                            rows={rows}
                            spellCheck={false}
                            disabled={readOnly}
                            maxLength={maxLength}
                            // The base Textarea caps at 250px and disables resizing —
                            // far too small for a document-length email body.
                            className="max-h-none min-h-[320px] resize-y font-mono text-xs leading-relaxed"
                            placeholder={String(resolveLanguageKey("bodyPlaceholder"))}
                        />
                    </FormControl>

                    <div className="flex flex-wrap items-center justify-between gap-2">
                        {placeholders.length > 0 && !readOnly ? (
                            // A group of buttons, not a list: each chip does something
                            // when clicked. `Badge asChild` inside a tooltip trigger
                            // nests two Radix Slots and the label does not survive,
                            // so this is a plain button wearing the badge's classes.
                            <div role="group" aria-label={String(resolveLanguageKey("palette"))} className="flex flex-wrap gap-1">
                                {placeholders.map((token) => (
                                    <TooltipDisplayer key={token} tooltip={String(resolveLanguageKey(`tokens.${token}`))}>
                                        <button
                                            type="button"
                                            onClick={() => insertAtCaret(`{${token}}`)}
                                            className={cn(
                                                "inline-flex h-5 shrink-0 cursor-pointer items-center rounded-4xl border border-transparent",
                                                "bg-secondary px-2 font-mono text-[11px] font-medium text-secondary-foreground",
                                                "transition-colors hover:bg-secondary/70",
                                                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                                            )}
                                        >
                                            {`{${token}}`}
                                        </button>
                                    </TooltipDisplayer>
                                ))}
                            </div>
                        ) : <span />}
                        {maxLength != null ? (
                            <span className={cn("shrink-0 text-xs tabular-nums", overLimit ? "text-destructive" : "text-muted-foreground")}>
                                {`${value.length} / ${maxLength}`}
                            </span>
                        ) : null}
                    </div>

                    <FormMessage />

                    {previewApiUrl && showPreview ? (
                        <EmailHtmlPreview
                            apiUrl={previewApiUrl}
                            bodyHtml={value}
                            subject={subject}
                            previewText={previewText}
                            campaignType={campaignType}
                            locale={locale || defaultLocale}
                            className="mt-2"
                        />
                    ) : null}
                </FormItem>
            )}
        />
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/components/custom/adCampaign/htmlSourceEditor.tsx"),
)(HtmlSourceEditor);

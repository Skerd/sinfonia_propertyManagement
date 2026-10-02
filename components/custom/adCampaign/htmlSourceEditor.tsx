import {useCallback, useEffect, useRef, useState, type MouseEvent} from "react";
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

/** Elements that break onto their own line. Inline tags stay with their text. */
const BLOCK_TAGS = new Set([
    "table", "thead", "tbody", "tfoot", "tr", "td", "th",
    "ul", "ol", "li", "div", "p", "blockquote", "center",
    "h1", "h2", "h3", "h4", "h5", "h6",
]);

const VOID_TAGS = new Set([
    "area", "base", "br", "col", "embed", "hr", "img", "input",
    "link", "meta", "param", "source", "track", "wbr",
]);

type HtmlNode =
    | {kind: "text"; text: string}
    | {kind: "el"; name: string; raw: string; children: HtmlNode[]; self: boolean};

function tagName(raw: string): string {
    return /^<\/?\s*([^\s/>]+)/.exec(raw)?.[1]?.toLowerCase() ?? "";
}

function parseHtml(html: string): HtmlNode[] {
    const root: HtmlNode[] = [];
    const stack: HtmlNode[][] = [root];
    const re = /<[^>]+>/g;
    let last = 0;
    let match: RegExpExecArray | null;
    while ((match = re.exec(html))) {
        const parent = stack[stack.length - 1];
        if (!parent) break;
        if (match.index > last) {
            parent.push({kind: "text", text: html.slice(last, match.index)});
        }
        const raw = match[0];
        const name = tagName(raw);
        if (raw.startsWith("</")) {
            if (stack.length > 1) stack.pop();
        } else {
            const self = raw.endsWith("/>") || VOID_TAGS.has(name);
            const el: HtmlNode = {kind: "el", name, raw, children: [], self};
            parent.push(el);
            if (!self) stack.push(el.children);
        }
        last = match.index + raw.length;
    }
    const tail = stack[stack.length - 1];
    if (tail && last < html.length) tail.push({kind: "text", text: html.slice(last)});
    return root;
}

function hasBlock(nodes: HtmlNode[]): boolean {
    return nodes.some((node) => node.kind === "el" && (BLOCK_TAGS.has(node.name) || hasBlock(node.children)));
}

function inlineHtml(nodes: HtmlNode[]): string {
    return nodes.map((node) => {
        if (node.kind === "text") return node.text;
        if (node.self) return node.raw;
        return `${node.raw}${inlineHtml(node.children)}</${node.name}>`;
    }).join("");
}

function blockHtml(nodes: HtmlNode[], depth: number): string {
    const pad = "  ".repeat(depth);
    const lines: string[] = [];
    for (const node of nodes) {
        if (node.kind === "text") {
            if (node.text.trim()) lines.push(pad + node.text.trim());
            continue;
        }
        if (node.self) {
            lines.push(pad + node.raw);
            continue;
        }
        if (!hasBlock(node.children)) {
            lines.push(pad + node.raw + inlineHtml(node.children) + `</${node.name}>`);
            continue;
        }
        lines.push(pad + node.raw);
        const inner = blockHtml(node.children, depth + 1);
        if (inner) lines.push(inner);
        lines.push(pad + `</${node.name}>`);
    }
    return lines.join("\n");
}

/**
 * Break a single-line email body onto indented lines.
 *
 * Only whitespace between tags is rearranged. If the rewrite would not
 * round-trip (a `>` inside an attribute, a comment, a mismatched tag), the
 * original string is kept.
 */
function indentHtml(html: string): string {
    const compact = html.replace(/>\s+</g, "><").trim();
    if (!compact) return "";
    const tree = parseHtml(compact);
    const pretty = hasBlock(tree) ? blockHtml(tree, 0) : inlineHtml(tree);
    const flatten = (source: string) => source.replace(/>\s+</g, "><").trim().toLowerCase();
    return flatten(pretty) === flatten(compact) ? pretty : html.trim();
}

/** A stored one-liner is shown indented. Once the author has line breaks, leave them. */
function editorHtml(html: string): string {
    if (!html || html.includes("\n")) return html;
    return indentHtml(html);
}

/**
 * Indent `block`, then continue its extra lines at the indent of the line
 * the caret is on, so an inserted table lines up with the surrounding markup.
 */
function indentedAtCaret(block: string, doc: string, caret: number): string {
    const pretty = indentHtml(block);
    const lineStart = doc.lastIndexOf("\n", Math.max(0, caret - 1)) + 1;
    const indent = /^ */.exec(doc.slice(lineStart, caret))?.[0] ?? "";
    if (!indent || !pretty.includes("\n")) return pretty;
    return pretty.split("\n").map((line, index) => index === 0 ? line : indent + line).join("\n");
}

/** A toolbar mousedown would blur the textarea and drop the caret. */
function keepCaret(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
}

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
 * HTML source editor for campaign email bodies: an indented textarea, a
 * click-to-insert token palette, an email-safe snippet toolbar and the live
 * server-rendered preview on the row below.
 *
 * The preview is the rendered email. This field stays the markup, broken onto
 * indented lines instead of one long string.
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
    const shown = editorHtml(value);
    const campaignType = campaignTypeField ? (form.watch(campaignTypeField) as string | undefined) : undefined;
    const locale = localeField ? (form.watch(localeField) as string | undefined) : undefined;
    const subject = subjectField ? (form.watch(subjectField) as string | undefined) : undefined;
    const previewText = previewTextField ? (form.watch(previewTextField) as string | undefined) : undefined;
    const campaignIdRaw = form.watch("_id");
    const campaignId = typeof campaignIdRaw === "string" && campaignIdRaw ? campaignIdRaw : undefined;

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
     *
     * The splice reads the textarea, which may be the indented view of a
     * stored one-liner. Writing that view back is what keeps the line breaks.
     */
    const insertAtCaret = useCallback(
        (text: string) => {
            const el = textareaRef.current;
            const current = el?.value ?? shown;
            const start = el?.selectionStart ?? current.length;
            const end = el?.selectionEnd ?? current.length;
            const block = indentedAtCaret(text, current, start);
            let next = current.slice(0, start) + block + current.slice(end);
            if (maxLength != null && next.length > maxLength) next = next.slice(0, maxLength);

            pendingCaretRef.current = Math.min(start + block.length, next.length);
            form.setValue(name, next, {shouldValidate: true, shouldDirty: true});
        },
        [form, name, maxLength, shown],
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
    const overLimit = maxLength != null && shown.length > maxLength;

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

                    {!readOnly ? (
                        <div className="flex flex-wrap items-center gap-1">
                            <Code2 className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
                            {SNIPPETS.map((snippet) => (
                                <Button
                                    key={snippet.id}
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    className="h-7 px-2 text-xs"
                                    onMouseDown={keepCaret}
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
                            value={shown}
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
                                            onMouseDown={keepCaret}
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
                                {`${shown.length} / ${maxLength}`}
                            </span>
                        ) : null}
                    </div>

                    <FormMessage />

                    {previewApiUrl && showPreview ? (
                        <EmailHtmlPreview
                            apiUrl={previewApiUrl}
                            bodyHtml={shown}
                            subject={subject}
                            previewText={previewText}
                            campaignType={campaignType}
                            locale={locale || defaultLocale}
                            campaignId={campaignId}
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

/**
 * Expense line-item reports as PDF (A4), with optional company logo from `/api/company/basicInfo`.
 */

import { jsPDF } from "jspdf";
import apiClient from "@coreModule/helpers/axiosClients/apiClient.ts";
import type { BasicCompanyInfoFormResponseType } from "armonia/src/modules/core/api/company/private/company/company.dto.ts";

export type ExpenditureCostTemplateColumns = {
    item: string;
    category: string;
    quantity: string;
    unit: string;
    price: string;
    lineTotal: string;
};

export type ExpenditureCostTemplateFooter = {
    tableTotal: string;
    purchaser: string;
    signature: string;
};

export type ExpenditureTemplateRow = {
    title: string;
    category: string;
    quantity: string;
    unit: string;
    unitPrice: string;
    lineTotal: string;
};

export type ExpenditureCostTemplateInput = {
    docTitle: string;
    metaRows: { label: string; value: string }[];
    columns: ExpenditureCostTemplateColumns;
    footer: ExpenditureCostTemplateFooter;
};

const MM_MARGIN = 14;
const PAGE_W = 210;
const PAGE_H = 297;
const HEADER_BLUE: [number, number, number] = [30, 58, 95];
const ROW_ALT_GRAY = 246;
const LINE_H = 4.2;
const META_LINE_H = 4;
const TABLE_HEADER_H = 7;
const PAD = 1.2;

/** Column widths (mm); sum = content width inside margins. */
const COL_W = [52, 36, 20, 26, 26, 22];

function pageInnerWidth(): number {
    return PAGE_W - 2 * MM_MARGIN;
}

function colXs(): number[] {
    const w = pageInnerWidth();
    const sum = COL_W.reduce((a, b) => a + b, 0);
    const scale = w / sum;
    const scaled = COL_W.map((c) => c * scale);
    const xs: number[] = [MM_MARGIN];
    for (let i = 0; i < scaled.length - 1; i++) {
        xs.push(xs[i] + scaled[i]);
    }
    return xs;
}

function colWidthsScaled(): number[] {
    const w = pageInnerWidth();
    const sum = COL_W.reduce((a, b) => a + b, 0);
    const scale = w / sum;
    return COL_W.map((c) => c * scale);
}

function uint8ToBase64(bytes: Uint8Array): string {
    let binary = "";
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) binary += String.fromCharCode(bytes[i]!);
    return btoa(binary);
}

function detectImageFormat(bytes: Uint8Array): "PNG" | "JPEG" {
    if (bytes.length >= 2 && bytes[0] === 0xff && bytes[1] === 0xd8) return "JPEG";
    if (bytes.length >= 4 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return "PNG";
    return "JPEG";
}

function loadImageDimensions(base64: string, format: "PNG" | "JPEG"): Promise<{ w: number; h: number }> {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve({ w: img.naturalWidth || 120, h: img.naturalHeight || 40 });
        img.onerror = () => resolve({ w: 120, h: 40 });
        img.src = `data:image/${format.toLowerCase()};base64,${base64}`;
    });
}

type Branding = { companyName: string; logoBase64: string | null; logoFormat: "PNG" | "JPEG" };

async function loadCompanyBranding(): Promise<Branding | null> {
    try {
        const res = await apiClient.get<BasicCompanyInfoFormResponseType>("/api/company/basicInfo");
        const c = res.data;
        if (!c || typeof c.name !== "string") return null;
        let logoBase64: string | null = null;
        let logoFormat: "PNG" | "JPEG" = "JPEG";
        if (c.logo && typeof c.logo === "string" && c.logo.length > 0) {
            try {
                const imgRes = await apiClient.get<ArrayBuffer>(`/api/auxiliary/media/${c.logo}`, { responseType: "arraybuffer" });
                const bytes = new Uint8Array(imgRes.data);
                logoFormat = detectImageFormat(bytes);
                logoBase64 = uint8ToBase64(bytes);
            } catch {
                logoBase64 = null;
            }
        }
        return { companyName: c.name, logoBase64, logoFormat };
    } catch {
        return null;
    }
}

function ensureY(doc: jsPDF, y: number, needMm: number): number {
    if (y + needMm > PAGE_H - MM_MARGIN) {
        doc.addPage();
        return MM_MARGIN;
    }
    return y;
}

function emptyRow(): ExpenditureTemplateRow {
    return { title: "", category: "", quantity: "", unit: "", unitPrice: "", lineTotal: "" };
}

function formatMoney(n: number): string {
    if (!Number.isFinite(n)) return "";
    return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function strEntity(v: unknown): string {
    if (v == null || v === "") return "";
    return String(v);
}

function formatEntityDate(v: unknown): string {
    if (v == null || v === "") return "";
    if (typeof v === "string") {
        const d = new Date(v);
        if (!Number.isNaN(d.getTime())) return d.toLocaleDateString();
        return v;
    }
    return String(v);
}

function entityPersonName(p: unknown): string {
    if (p == null || typeof p !== "object") return "";
    const o = p as Record<string, unknown>;
    const parts = [o.name, o.surname].filter((x) => typeof x === "string" && String(x).trim() !== "");
    return parts.join(" ");
}

function entityUnitLocation(u: unknown): string {
    if (u == null || typeof u !== "object") return "";
    const o = u as Record<string, unknown>;
    const name = typeof o.name === "string" ? o.name : "";
    const num = o.unitNumber != null ? String(o.unitNumber) : "";
    return [name, num].filter((s) => s.trim() !== "").join(" · ");
}

function entityCurrency(c: unknown): string {
    if (c == null || typeof c !== "object") return "";
    const o = c as Record<string, unknown>;
    const abbr = o.abbreviation != null ? String(o.abbreviation) : "";
    const sym = o.symbol != null ? String(o.symbol) : "";
    return abbr || sym || "";
}

async function drawHeader(doc: jsPDF, title: string, branding: Branding | null): Promise<number> {
    let y = MM_MARGIN;
    const logoMaxW = 42;
    const logoMaxH = 14;
    let logoDrawH = 0;

    if (branding?.logoBase64) {
        const { w: iw, h: ih } = await loadImageDimensions(branding.logoBase64, branding.logoFormat);
        const scale = Math.min(logoMaxW / iw, logoMaxH / ih);
        const dw = iw * scale;
        const dh = ih * scale;
        const lx = PAGE_W - MM_MARGIN - dw;
        try {
            doc.addImage(branding.logoBase64, branding.logoFormat, lx, y, dw, dh);
        } catch {
            /* ignore corrupt image */
        }
        logoDrawH = dh;
    }

    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text(title, MM_MARGIN, y + 6, { align: "left" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(60, 60, 60);
    if (branding?.companyName) {
        doc.text(branding.companyName, MM_MARGIN, y + 11, { align: "left" });
    }

    y += Math.max(logoDrawH, 14) + 5;
    doc.setTextColor(0, 0, 0);
    return y;
}

function drawMeta(doc: jsPDF, startY: number, metaRows: { label: string; value: string }[]): number {
    let y = startY;
    doc.setFontSize(8);
    const gap = 5;
    const colW = (pageInnerWidth() - gap) / 2;
    const labelW = 34;

    for (let i = 0; i < metaRows.length; i += 2) {
        const left = metaRows[i];
        const right = metaRows[i + 1];
        const valueW = colW - labelW - 1;

        const leftValLines = left ? doc.splitTextToSize(left.value || "—", valueW) : [];
        const rightValLines = right ? doc.splitTextToSize(right.value || "—", valueW) : [];
        const blockH =
            Math.max(
                left ? Math.max(META_LINE_H, leftValLines.length * META_LINE_H) : 0,
                right ? Math.max(META_LINE_H, rightValLines.length * META_LINE_H) : 0,
                META_LINE_H,
            ) + 2;

        y = ensureY(doc, y, blockH + 1);
        const baseLineY = y + META_LINE_H;

        if (left) {
            doc.setFont("helvetica", "bold");
            doc.text(`${left.label}:`, MM_MARGIN, baseLineY, { align: "left" });
            doc.setFont("helvetica", "normal");
            doc.text(leftValLines, MM_MARGIN + labelW, baseLineY, { align: "left" });
        }
        if (right) {
            const rx = MM_MARGIN + colW + gap;
            doc.setFont("helvetica", "bold");
            doc.text(`${right.label}:`, rx, baseLineY, { align: "left" });
            doc.setFont("helvetica", "normal");
            doc.text(rightValLines, rx + labelW, baseLineY, { align: "left" });
        }
        y += blockH;
    }
    return y + 2;
}

function drawTableHeader(doc: jsPDF, y: number, cols: ExpenditureCostTemplateColumns): number {
    y = ensureY(doc, y, TABLE_HEADER_H + 2);
    const xs = colXs();
    const ws = colWidthsScaled();
    doc.setFillColor(...HEADER_BLUE);
    doc.rect(MM_MARGIN, y - 1, pageInnerWidth(), TABLE_HEADER_H, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    const headers = [cols.item, cols.category, cols.quantity, cols.unit, cols.price, cols.lineTotal];
    for (let i = 0; i < 6; i++) {
        const lines = doc.splitTextToSize(headers[i] || "", ws[i]! - PAD * 2);
        doc.text(lines, xs[i]! + PAD, y + 3.8, { align: "left" });
    }
    doc.setTextColor(0, 0, 0);
    return y + TABLE_HEADER_H + 1;
}

function cellLines(doc: jsPDF, text: string, colW: number): string[] {
    return doc.splitTextToSize(text || "", Math.max(8, colW - PAD * 2));
}

function drawTableBody(
    doc: jsPDF,
    startY: number,
    rows: ExpenditureTemplateRow[],
    cols: ExpenditureCostTemplateColumns,
): number {
    let y = startY;
    const xs = colXs();
    const ws = colWidthsScaled();
    let rowIdx = 0;

    for (const row of rows) {
        const cLines = [
            cellLines(doc, row.title, ws[0]!),
            cellLines(doc, row.category, ws[1]!),
            cellLines(doc, row.quantity, ws[2]!),
            cellLines(doc, row.unit, ws[3]!),
            cellLines(doc, row.unitPrice, ws[4]!),
            cellLines(doc, row.lineTotal, ws[5]!),
        ];
        const lineCount = Math.max(1, ...cLines.map((cl) => cl.length));
        const rowH = lineCount * LINE_H + PAD * 2;

        if (y + rowH > PAGE_H - MM_MARGIN) {
            doc.addPage();
            y = MM_MARGIN;
            y = drawTableHeader(doc, y, cols);
        }

        if (rowIdx % 2 === 1) {
            doc.setFillColor(ROW_ALT_GRAY, ROW_ALT_GRAY, ROW_ALT_GRAY);
            doc.rect(MM_MARGIN, y - 0.5, pageInnerWidth(), rowH, "F");
        }

        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(0, 0, 0);

        const baseY = y + PAD + LINE_H * 0.85;
        for (let ci = 0; ci < 6; ci++) {
            const lines = cLines[ci]!;
            lines.forEach((line, li) => {
                doc.text(line, xs[ci]! + PAD, baseY + li * LINE_H, { align: "left" });
            });
        }

        y += rowH;
        rowIdx++;
    }
    return y;
}

function drawTotalRow(doc: jsPDF, y: number, label: string, value: string): number {
    const xs = colXs();
    const ws = colWidthsScaled();
    const lastColW = Math.max(12, ws[5]! - PAD * 2);
    const valueLines = doc.splitTextToSize(value || "—", lastColW);
    const rowH = Math.max(LINE_H + PAD * 2 + 2, valueLines.length * LINE_H + PAD * 2);
    y = ensureY(doc, y, rowH + 2);
    doc.setFillColor(238, 241, 244);
    doc.rect(MM_MARGIN, y - 0.5, pageInnerWidth(), rowH, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(0, 0, 0);
    doc.text(label, xs[0]! + PAD, y + LINE_H + 1, { align: "left" });
    doc.text(valueLines, xs[5]! + PAD, y + LINE_H + 1, { align: "left" });
    return y + rowH + 2;
}

function drawSignatures(doc: jsPDF, y: number, footer: ExpenditureCostTemplateFooter): number {
    y = ensureY(doc, y, 22);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    const w = (pageInnerWidth() - 10) / 2;
    doc.text(footer.purchaser, MM_MARGIN, y, { align: "left" });
    doc.text(footer.signature, MM_MARGIN + w + 10, y, { align: "left" });
    y += 4;
    doc.setDrawColor(80, 80, 80);
    doc.line(MM_MARGIN, y, MM_MARGIN + w, y);
    doc.line(MM_MARGIN + w + 10, y, MM_MARGIN + 2 * w + 10, y);
    return y + 8;
}

/** Currency abbreviation/symbol for the totals row — taken from the last meta row (always currency). */
function totalWithCurrency(grandTotal: string, metaRows: { label: string; value: string }[]): string {
    const last = metaRows.length > 0 ? metaRows[metaRows.length - 1] : undefined;
    const cur = (last?.value ?? "").trim();
    const amt = grandTotal.trim();
    if (amt && cur) return `${amt} ${cur}`;
    if (amt) return amt;
    if (cur) return cur;
    return "—";
}

async function buildExpenditurePdf(input: ExpenditureCostTemplateInput, rows: ExpenditureTemplateRow[], grandTotal: string): Promise<jsPDF> {
    const branding = await loadCompanyBranding();
    const doc = new jsPDF({ unit: "mm", format: "a4" });

    let y = await drawHeader(doc, input.docTitle, branding);
    y = drawMeta(doc, y, input.metaRows);

    y = drawTableHeader(doc, y, input.columns);
    y = drawTableBody(doc, y, rows, input.columns);
    y = drawTotalRow(doc, y, input.footer.tableTotal, totalWithCurrency(grandTotal, input.metaRows));
    drawSignatures(doc, y, input.footer);

    return doc;
}

export async function downloadExpenditureCostTemplatePdf(
    input: ExpenditureCostTemplateInput,
    options?: { rows?: ExpenditureTemplateRow[]; emptyRowCount?: number; grandTotal?: string; fileName?: string },
): Promise<void> {
    const emptyCount = options?.emptyRowCount ?? 14;
    const rawRows = options?.rows;
    let rows: ExpenditureTemplateRow[];

    if (rawRows && rawRows.length > 0) {
        const pad = Math.max(2, emptyCount - rawRows.length);
        rows = [...rawRows, ...Array.from({ length: pad }, () => emptyRow())];
    } else {
        rows = Array.from({ length: emptyCount }, () => emptyRow());
    }

    let grandTotal = options?.grandTotal ?? "";
    if (grandTotal === "" && rawRows && rawRows.length > 0) {
        let sum = 0;
        let any = false;
        for (const r of rawRows) {
            const q = Number(String(r.quantity).replace(",", "."));
            const p = Number(String(r.unitPrice).replace(",", "."));
            const lt = r.lineTotal.trim()
                ? Number(String(r.lineTotal).replace(/\s/g, "").replace(",", "."))
                : Number.isFinite(q) && Number.isFinite(p)
                  ? q * p
                  : NaN;
            if (Number.isFinite(lt)) {
                sum += lt;
                any = true;
            }
        }
        if (any) grandTotal = formatMoney(sum);
    }

    const doc = await buildExpenditurePdf(input, rows, grandTotal);
    const safeBase = (options?.fileName ?? "unit-cost-expenditure-template").replace(/[^a-zA-Z0-9._-]+/g, "-");
    doc.save(`${safeBase}.pdf`);
}

/**
 * PDF report from a loaded unit cost (sheet / read). `t` resolves keys like the unit cost sheet view.
 */
export async function downloadExpenditureReportFromUnitCostDataPdf(
    entity: Record<string, unknown>,
    t: (key: string) => string,
    options?: { fileName?: string },
): Promise<void> {
    const pay = entity.paymentStatus;
    const payLabel = typeof pay === "string" && pay ? t(`unitCostPayment.${pay}`) : "";

    const metaValues: string[] = [
        strEntity(entity.name),
        strEntity(entity.invoiceNumber),
        strEntity(entity.vendorName),
        formatEntityDate(entity.purchaseDate),
        entityPersonName(entity.purchasePerson),
        entityUnitLocation(entity.unit),
        payLabel,
        formatEntityDate(entity.paymentDate),
        "",
        entityCurrency(entity.currency),
    ];

    const input: ExpenditureCostTemplateInput = {
        docTitle: t("template.docTitle"),
        metaRows: [
            { label: t("template.invoiceName"), value: metaValues[0] ?? "" },
            { label: t("template.invoiceNumber"), value: metaValues[1] ?? "" },
            { label: t("template.vendor"), value: metaValues[2] ?? "" },
            { label: t("template.purchaseDate"), value: metaValues[3] ?? "" },
            { label: t("template.purchaser"), value: metaValues[4] ?? "" },
            { label: t("template.location"), value: metaValues[5] ?? "" },
            { label: t("template.paymentStatus"), value: metaValues[6] ?? "" },
            { label: t("template.paymentDate"), value: metaValues[7] ?? "" },
            { label: t("template.paymentMethod"), value: metaValues[8] ?? "" },
            { label: t("template.currency"), value: metaValues[9] ?? "" },
        ],
        columns: {
            item: t("lineDescription"),
            category: t("category"),
            quantity: t("quantity"),
            unit: t("measureUnitLabel"),
            price: t("pricePerUnit"),
            lineTotal: t("template.colLineTotal"),
        },
        footer: {
            tableTotal: t("template.tableTotal"),
            purchaser: t("template.footerPurchaser"),
            signature: t("template.footerSignature"),
        },
    };

    const rawItems = Array.isArray(entity.expenditureItems) ? (entity.expenditureItems as Record<string, unknown>[]) : [];
    let runningSum = 0;
    const rows: ExpenditureTemplateRow[] = rawItems.map((row) => {
        const title = strEntity(row.title);
        const catRaw = row.category;
        const category = typeof catRaw === "string" && catRaw ? t(`expenditureCategory.${catRaw}`) : "";
        const amount = row.amount;
        const qty =
            amount === "" || amount === undefined || amount === null
                ? ""
                : typeof amount === "number"
                  ? String(amount)
                  : strEntity(amount);
        const unitRaw = row.unit;
        const unit = typeof unitRaw === "string" && unitRaw ? t(`measureUnit.${unitRaw}`) : "";
        const ppu = row.pricePerUnit;
        const priceStr =
            ppu === "" || ppu === undefined || ppu === null
                ? ""
                : typeof ppu === "number"
                  ? String(ppu)
                  : strEntity(ppu);
        let lineTotal = "";
        const qn = Number(String(qty).replace(/\s/g, "").replace(",", "."));
        const pn = Number(String(priceStr).replace(/\s/g, "").replace(",", "."));
        if (Number.isFinite(qn) && Number.isFinite(pn)) {
            const lineAmount = qn * pn;
            runningSum += lineAmount;
            lineTotal = formatMoney(lineAmount);
        }
        return { title, category, quantity: qty, unit, unitPrice: priceStr, lineTotal };
    });

    let grandTotal = "";
    const docSub = entity.documentSubtotal;
    if (typeof docSub === "number" && Number.isFinite(docSub)) {
        grandTotal = formatMoney(docSub);
    } else if (runningSum > 0) {
        grandTotal = formatMoney(runningSum);
    }

    const costName = strEntity(entity.name).trim();
    const inv = strEntity(entity.invoiceNumber).replace(/[^a-zA-Z0-9._-]+/g, "-");
    const id = strEntity(entity._id).slice(-8);
    let base = options?.fileName?.trim();
    if (!base) {
        if (costName) base = costName;
        else if (inv) base = `unit-cost-${inv}`;
        else if (id) base = `unit-cost-${id}`;
        else base = "unit-cost-report";
    }

    await downloadExpenditureCostTemplatePdf(input, { rows, grandTotal, emptyRowCount: 4, fileName: base });
}

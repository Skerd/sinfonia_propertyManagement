/**
 * ROI calculator report export (A4 landscape) with optional company branding.
 */

import {jsPDF} from "jspdf";
import apiClient from "@coreModule/helpers/axiosClients/apiClient.ts";
import {formatDate} from "@coreModule/helpers/general";
import type {BasicCompanyInfoFormResponseType} from "armonia/src/modules/core/api/company/private/company/company.dto.ts";
import type {RoiProjectSummary, RoiResponse, RoiUnitBreakdown} from "armonia/src/modules/propertyManagement/api/realEstate/private/roi/roi.response.type.ts";

export type RoiReportPdfLabels = {
    title: string;
    summary: string;
    computedAt: string;
    scope: string;
    project: string;
    projectSummary: {
        totalUnits: string;
        sold: string;
        available: string;
        rented: string;
        totalRevenue: string;
        totalCosts: string;
        netProfit: string;
        roi: string;
        averageRoi: string;
    };
    columns: {
        unit: string;
        status: string;
        salePrice: string;
        totalCosts: string;
        netProfit: string;
        roi: string;
        monthlyRent: string;
        yield: string;
    };
    unitsSection: string;
    chartsSection: string;
    charts: {
        financialTitle: string;
        unitsByStatusTitle: string;
        otherUnits: string;
    };
    noResults: string;
};

const MM_MARGIN = 12;
const PAGE_W = 297;
const PAGE_H = 210;
const HEADER_BLUE: [number, number, number] = [30, 58, 95];
const ROW_ALT_GRAY = 246;
const LINE_H = 3.8;
const TABLE_HEADER_H = 7;
const PAD = 1.2;
const COL_W = [38, 24, 30, 30, 30, 22, 28, 22];

type Rgb = [number, number, number];

const CHART_GREEN: Rgb = [34, 197, 94];
const CHART_RED: Rgb = [239, 68, 68];
const CHART_BLUE: Rgb = [59, 130, 246];
const CHART_PURPLE: Rgb = [168, 85, 247];
const CHART_GRAY: Rgb = [107, 114, 128];

type Branding = {companyName: string; logoBase64: string | null; logoFormat: "PNG" | "JPEG"};

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
        xs.push(xs[i]! + scaled[i]!);
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
    for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]!);
    return btoa(binary);
}

function detectImageFormat(bytes: Uint8Array): "PNG" | "JPEG" {
    if (bytes.length >= 2 && bytes[0] === 0xff && bytes[1] === 0xd8) return "JPEG";
    if (bytes.length >= 4 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return "PNG";
    return "JPEG";
}

function loadImageDimensions(base64: string, format: "PNG" | "JPEG"): Promise<{w: number; h: number}> {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve({w: img.naturalWidth || 120, h: img.naturalHeight || 40});
        img.onerror = () => resolve({w: 120, h: 40});
        img.src = `data:image/${format.toLowerCase()};base64,${base64}`;
    });
}

async function loadCompanyBranding(): Promise<Branding | null> {
    try {
        const res = await apiClient.get<BasicCompanyInfoFormResponseType>("/api/company/basicInfo");
        const c = res.data;
        if (!c || typeof c.name !== "string") return null;
        let logoBase64: string | null = null;
        let logoFormat: "PNG" | "JPEG" = "JPEG";
        if (c.logo && typeof c.logo === "string" && c.logo.length > 0) {
            try {
                const imgRes = await apiClient.get<ArrayBuffer>(`/api/auxiliary/media/${c.logo}`, {responseType: "arraybuffer"});
                const bytes = new Uint8Array(imgRes.data);
                logoFormat = detectImageFormat(bytes);
                logoBase64 = uint8ToBase64(bytes);
            } catch {
                logoBase64 = null;
            }
        }
        return {companyName: c.name, logoBase64, logoFormat};
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

function fmtMoney(n?: number | null, symbol?: string): string {
    if (n === undefined || n === null || !Number.isFinite(n)) return "—";
    const base = n.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2});
    return symbol ? `${base} ${symbol}` : base;
}

function fmtPct(n?: number | null): string {
    if (n === undefined || n === null || !Number.isFinite(n)) return "—";
    return `${n.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}%`;
}

function statusLabel(status: string): string {
    return status.replace(/_unit$/, "");
}

async function drawHeader(doc: jsPDF, title: string, branding: Branding | null): Promise<number> {
    let y = MM_MARGIN;
    const logoMaxW = 40;
    const logoMaxH = 12;
    let logoDrawH = 0;

    if (branding?.logoBase64) {
        const {w: iw, h: ih} = await loadImageDimensions(branding.logoBase64, branding.logoFormat);
        const scale = Math.min(logoMaxW / iw, logoMaxH / ih);
        const dw = iw * scale;
        const dh = ih * scale;
        try {
            doc.addImage(branding.logoBase64, branding.logoFormat, PAGE_W - MM_MARGIN - dw, y, dw, dh);
        } catch {
            /* ignore */
        }
        logoDrawH = dh;
    }

    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text(title, MM_MARGIN, y + 5);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(60, 60, 60);
    if (branding?.companyName) {
        doc.text(branding.companyName, MM_MARGIN, y + 10);
    }
    y += Math.max(logoDrawH, 12) + 4;
    doc.setTextColor(0, 0, 0);
    return y;
}

function drawMeta(doc: jsPDF, startY: number, rows: {label: string; value: string}[]): number {
    let y = startY;
    doc.setFontSize(8);
    for (const row of rows) {
        y = ensureY(doc, y, LINE_H + 1);
        doc.setFont("helvetica", "bold");
        doc.text(`${row.label}:`, MM_MARGIN, y);
        doc.setFont("helvetica", "normal");
        const lines = doc.splitTextToSize(row.value || "—", pageInnerWidth() - 42);
        doc.text(lines, MM_MARGIN + 40, y);
        y += Math.max(LINE_H, lines.length * LINE_H) + 1;
    }
    return y + 2;
}

function drawSectionTitle(doc: jsPDF, y: number, title: string): number {
    y = ensureY(doc, y, 8);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(title, MM_MARGIN, y);
    return y + 5;
}

function drawSummary(doc: jsPDF, startY: number, summary: RoiProjectSummary, labels: RoiReportPdfLabels): number {
    let y = drawSectionTitle(doc, startY, `${summary.scopeLabel} — ${labels.summary}`);
    const currency = summary.baseCurrencySymbol;
    const items = [
        {label: labels.projectSummary.totalUnits, value: String(summary.totalUnits)},
        {label: labels.projectSummary.sold, value: String(summary.soldUnits)},
        {label: labels.projectSummary.available, value: String(summary.availableUnits)},
        {label: labels.projectSummary.rented, value: String(summary.rentedUnits)},
        {label: labels.projectSummary.totalRevenue, value: fmtMoney(summary.totalRevenue, currency)},
        {label: labels.projectSummary.totalCosts, value: fmtMoney(summary.totalCosts, currency)},
        {label: labels.projectSummary.netProfit, value: fmtMoney(summary.netProfit, currency)},
        {label: labels.projectSummary.roi, value: fmtPct(summary.roiPercent)},
        {label: labels.projectSummary.averageRoi, value: fmtPct(summary.averageRoiPercent)},
    ];

    doc.setFontSize(8);
    const colW = (pageInnerWidth() - 6) / 3;
    for (let i = 0; i < items.length; i += 3) {
        y = ensureY(doc, y, LINE_H + 2);
        for (let c = 0; c < 3; c++) {
            const item = items[i + c];
            if (!item) continue;
            const x = MM_MARGIN + c * (colW + 3);
            doc.setFont("helvetica", "bold");
            doc.text(item.label, x, y);
            doc.setFont("helvetica", "normal");
            doc.text(item.value, x, y + LINE_H);
        }
        y += LINE_H * 2 + 1;
    }
    return y + 2;
}

function drawTableHeader(doc: jsPDF, y: number, labels: RoiReportPdfLabels["columns"]): number {
    y = ensureY(doc, y, TABLE_HEADER_H + 2);
    const xs = colXs();
    const ws = colWidthsScaled();
    doc.setFillColor(...HEADER_BLUE);
    doc.rect(MM_MARGIN, y - 1, pageInnerWidth(), TABLE_HEADER_H, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    const headers = [
        labels.unit,
        labels.status,
        labels.salePrice,
        labels.totalCosts,
        labels.netProfit,
        labels.roi,
        labels.monthlyRent,
        labels.yield,
    ];
    for (let i = 0; i < headers.length; i++) {
        const lines = doc.splitTextToSize(headers[i]!, ws[i]! - PAD * 2);
        doc.text(lines, xs[i]! + PAD, y + 3.6, {align: "left"});
    }
    doc.setTextColor(0, 0, 0);
    return y + TABLE_HEADER_H + 1;
}

function drawPanelBorder(doc: jsPDF, x: number, y: number, w: number, h: number, title: string): void {
    doc.setDrawColor(210, 210, 210);
    doc.setLineWidth(0.2);
    doc.rect(x, y, w, h);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(80, 80, 80);
    doc.text(title, x + 3, y + 5);
    doc.setTextColor(0, 0, 0);
}

function drawFinancialChart(
    doc: jsPDF,
    x: number,
    y: number,
    w: number,
    h: number,
    title: string,
    summary: RoiProjectSummary,
    labels: RoiReportPdfLabels,
): void {
    drawPanelBorder(doc, x, y, w, h, title);

    const sidePad = 5;
    const topInset = 9;
    const valueZoneH = 7;
    const xLabelZoneH = 11;
    const bottomPad = 2;

    const plotX = x + sidePad;
    const plotW = w - sidePad * 2;
    const baseline = y + h - bottomPad - xLabelZoneH;
    const barAreaTop = y + topInset + valueZoneH;
    const barAreaH = Math.max(baseline - barAreaTop, 8);

    const bars = [
        {label: labels.projectSummary.totalRevenue, value: Math.max(0, summary.totalRevenue), color: CHART_GREEN},
        {label: labels.projectSummary.totalCosts, value: Math.max(0, summary.totalCosts), color: CHART_RED},
        {
            label: labels.projectSummary.netProfit,
            value: summary.netProfit,
            color: summary.netProfit >= 0 ? CHART_GREEN : CHART_RED,
        },
    ];
    const maxVal = Math.max(...bars.map((b) => Math.abs(b.value)), 1);
    const slotW = plotW / bars.length;
    const barW = Math.min(slotW * 0.4, 18);

    doc.setDrawColor(220, 220, 220);
    doc.line(plotX, baseline, plotX + plotW, baseline);

    for (let i = 0; i < bars.length; i++) {
        const bar = bars[i]!;
        const cx = plotX + slotW * i + slotW / 2;
        const absH = bar.value !== 0
            ? Math.min((Math.abs(bar.value) / maxVal) * barAreaH, barAreaH)
            : 0;
        const barTop = baseline - absH;
        const barLeft = Math.max(plotX, cx - barW / 2);
        const drawBarW = Math.min(barW, plotX + plotW - barLeft);

        if (absH > 0) {
            doc.setFillColor(...bar.color);
            doc.rect(barLeft, barTop, drawBarW, absH, "F");
        }

        doc.setFont("helvetica", "normal");
        doc.setFontSize(5);
        doc.setTextColor(0, 0, 0);
        const valLines = doc.splitTextToSize(fmtMoney(bar.value, summary.baseCurrencySymbol), slotW - 3);
        const valBlockH = valLines.length * 2.4;
        const valY = Math.max(y + topInset + 1, barTop - valBlockH - 0.5);
        doc.text(valLines, cx, valY, {align: "center", baseline: "top"});

        doc.setTextColor(80, 80, 80);
        doc.setFontSize(5);
        const labelLines = doc.splitTextToSize(bar.label, slotW - 3);
        const labelY = Math.min(baseline + 3, y + h - bottomPad - labelLines.length * 2.4);
        doc.text(labelLines, cx, labelY, {align: "center", baseline: "top"});
    }
    doc.setTextColor(0, 0, 0);
}

function drawStatusChart(
    doc: jsPDF,
    x: number,
    y: number,
    w: number,
    h: number,
    title: string,
    summary: RoiProjectSummary,
    labels: RoiReportPdfLabels,
): void {
    drawPanelBorder(doc, x, y, w, h, title);
    const other = Math.max(
        0,
        summary.totalUnits - summary.soldUnits - summary.availableUnits - summary.rentedUnits,
    );
    const segments = [
        {label: labels.projectSummary.sold, value: summary.soldUnits, color: CHART_GREEN},
        {label: labels.projectSummary.available, value: summary.availableUnits, color: CHART_BLUE},
        {label: labels.projectSummary.rented, value: summary.rentedUnits, color: CHART_PURPLE},
        {label: labels.charts.otherUnits, value: other, color: CHART_GRAY},
    ].filter((s) => s.value > 0);

    const plotX = x + 6;
    const barY = y + 14;
    const plotW = w - 12;
    const barH = 10;
    const total = segments.reduce((s, seg) => s + seg.value, 0) || 1;

    let segX = plotX;
    for (const seg of segments) {
        const segW = Math.max((seg.value / total) * plotW, seg.value > 0 ? 2 : 0);
        doc.setFillColor(...seg.color);
        doc.rect(segX, barY, segW, barH, "F");
        segX += segW;
    }

    doc.setFont("helvetica", "normal");
    doc.setFontSize(6);
    let legendY = barY + barH + 5;
    for (const seg of segments) {
        doc.setFillColor(...seg.color);
        doc.circle(plotX + 1.5, legendY - 1, 1.2, "F");
        doc.setTextColor(60, 60, 60);
        doc.text(`${seg.label}: ${seg.value}`, plotX + 4, legendY);
        legendY += 4;
    }

    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.5);
    const footer = `${labels.projectSummary.totalUnits}: ${summary.totalUnits}  ·  ${labels.projectSummary.roi}: ${fmtPct(summary.roiPercent)}`;
    doc.text(footer, plotX, y + h - 4);
}

function drawSummaryCharts(
    doc: jsPDF,
    startY: number,
    summary: RoiProjectSummary,
    labels: RoiReportPdfLabels,
): number {
    const panelH = 58;
    let y = drawSectionTitle(doc, startY, labels.chartsSection);
    y = ensureY(doc, y, panelH + 2);
    const gap = 4;
    const panelW = (pageInnerWidth() - gap) / 2;
    drawFinancialChart(doc, MM_MARGIN, y, panelW, panelH, labels.charts.financialTitle, summary, labels);
    drawStatusChart(
        doc,
        MM_MARGIN + panelW + gap,
        y,
        panelW,
        panelH,
        labels.charts.unitsByStatusTitle,
        summary,
        labels,
    );
    return y + panelH + 4;
}

function drawUnitRows(doc: jsPDF, startY: number, units: RoiUnitBreakdown[], columnLabels: RoiReportPdfLabels["columns"]): number {
    let y = startY;
    for (let i = 0; i < units.length; i++) {
        const unit = units[i]!;
        const xs = colXs();
        const ws = colWidthsScaled();
        const cells = [
            [unit.unitName, unit.unitNumber].filter(Boolean).join("\n"),
            statusLabel(unit.status),
            unit.salePrice !== undefined ? fmtMoney(unit.salePrice, unit.saleCurrencySymbol) : "—",
            fmtMoney(unit.totalCosts, unit.costCurrencySymbol),
            unit.netProfit !== undefined ? fmtMoney(unit.netProfit, unit.saleCurrencySymbol) : "—",
            fmtPct(unit.roiPercent),
            unit.monthlyRent !== undefined ? fmtMoney(unit.monthlyRent) : "—",
            fmtPct(unit.annualGrossYield),
        ];
        const lineSets = cells.map((cell, idx) => doc.splitTextToSize(cell, ws[idx]! - PAD * 2));
        const rowH = Math.max(...lineSets.map((lines) => lines.length * LINE_H), LINE_H) + PAD * 2;

        if (y + rowH > PAGE_H - MM_MARGIN) {
            doc.addPage();
            y = MM_MARGIN;
            y = drawTableHeader(doc, y, columnLabels);
        }

        if (i % 2 === 1) {
            doc.setFillColor(ROW_ALT_GRAY, ROW_ALT_GRAY, ROW_ALT_GRAY);
            doc.rect(MM_MARGIN, y - 1, pageInnerWidth(), rowH, "F");
        }

        doc.setFont("helvetica", "normal");
        doc.setFontSize(7);
        const textY = y + LINE_H;
        for (let c = 0; c < cells.length; c++) {
            const align = c === 0 || c === 1 ? "left" : "right";
            const x = align === "right" ? xs[c]! + ws[c]! - PAD : xs[c]! + PAD;
            doc.text(lineSets[c]!, x, textY, {align});
        }
        y += rowH;
    }
    return y;
}

function buildMetaRows(
    result: RoiResponse,
    labels: RoiReportPdfLabels,
    timezone?: string,
): {label: string; value: string}[] {
    const rows: {label: string; value: string}[] = [];
    if (result.project?.scopeLabel) {
        rows.push({label: labels.scope, value: result.project.scopeLabel});
    }
    if (result.project?.projectName) {
        rows.push({label: labels.project, value: result.project.projectName});
    }
    rows.push({
        label: labels.computedAt,
        value: formatDate(result.computedAt, {timeZone: timezone}) + (timezone ? ` (${timezone})` : ""),
    });
    return rows;
}

async function buildRoiReportPdf(
    result: RoiResponse,
    labels: RoiReportPdfLabels,
    timezone?: string,
): Promise<jsPDF> {
    const branding = await loadCompanyBranding();
    const doc = new jsPDF({unit: "mm", format: "a4", orientation: "landscape"});

    let y = await drawHeader(doc, labels.title, branding);
    y = drawMeta(doc, y, buildMetaRows(result, labels, timezone));

    if (result.project) {
        y = drawSummary(doc, y, result.project, labels);
        y = drawSummaryCharts(doc, y, result.project, labels);
    }

    y = drawSectionTitle(doc, y, labels.unitsSection);
    y = drawTableHeader(doc, y, labels.columns);

    if (result.units.length === 0) {
        y = ensureY(doc, y, LINE_H + 2);
        doc.setFont("helvetica", "italic");
        doc.setFontSize(8);
        doc.text(labels.noResults, MM_MARGIN, y);
    } else {
        y = drawUnitRows(doc, y, result.units, labels.columns);
    }

    return doc;
}

export async function downloadRoiReportPdf(
    result: RoiResponse,
    labels: RoiReportPdfLabels,
    options?: {timezone?: string; fileName?: string},
): Promise<void> {
    const doc = await buildRoiReportPdf(result, labels, options?.timezone);
    const scope = result.project?.scopeLabel ?? "roi-report";
    const safeBase = (options?.fileName ?? `roi-${scope}`).replace(/[^a-zA-Z0-9._-]+/g, "-");
    doc.save(`${safeBase}.pdf`);
}

/**
 * Agent performance report export (A4 landscape) with optional company branding.
 */

import {jsPDF} from "jspdf";
import apiClient from "@coreModule/helpers/axiosClients/apiClient.ts";
import {formatDate} from "@coreModule/helpers/general";
import type {BasicCompanyInfoFormResponseType} from "armonia/src/modules/core/api/company/private/company/company.dto.ts";
import type {AgentReportEntry, AgentReportResponseType} from "armonia/src/modules/propertyManagement/api/realEstate/private/agentReport/agentReport.response.type.ts";

export type AgentReportPdfLabels = {
    title: string;
    period: string;
    generatedAt: string;
    noResults: string;
    columns: {
        agent: string;
        sales: string;
        cash: string;
        paymentPlan: string;
        reservations: string;
        converted: string;
        conversionRate: string;
        commissionPaid: string;
        commissionPending: string;
        avgRate: string;
    };
};

const MM_MARGIN = 10;
const PAGE_W = 297;
const PAGE_H = 210;
const LINE_H = 3.6;
const TABLE_HEADER_H = 7;
const PAD = 1;
const COL_W = [42, 16, 16, 22, 22, 18, 18, 28, 28, 20];

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

function fmtMoney(n: number): string {
    if (!Number.isFinite(n) || n === 0) return "—";
    return n.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2});
}

function agentName(entry: AgentReportEntry): string {
    const name = [entry.agent.name, entry.agent.surname].filter(Boolean).join(" ").trim();
    return name || entry.agent._id;
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
        doc.text(row.value, MM_MARGIN + 28, y);
        y += LINE_H + 1;
    }
    return y + 2;
}

function drawTableHeader(doc: jsPDF, y: number, labels: AgentReportPdfLabels["columns"]): number {
    y = ensureY(doc, y, TABLE_HEADER_H + 2);
    const xs = colXs();
    const ws = colWidthsScaled();
    const headers = [
        labels.agent,
        labels.sales,
        labels.cash,
        labels.paymentPlan,
        labels.reservations,
        labels.converted,
        labels.conversionRate,
        labels.commissionPaid,
        labels.commissionPending,
        labels.avgRate,
    ];

    doc.setFillColor(30, 58, 95);
    doc.rect(MM_MARGIN, y - 1, pageInnerWidth(), TABLE_HEADER_H, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.5);

    for (let i = 0; i < headers.length; i++) {
        const lines = doc.splitTextToSize(headers[i]!, ws[i]! - PAD * 2);
        const align = i === 0 ? "left" : "center";
        const x = align === "left" ? xs[i]! + PAD : xs[i]! + ws[i]! / 2;
        doc.text(lines, x, y + 3.6, {align});
    }

    doc.setTextColor(0, 0, 0);
    return y + TABLE_HEADER_H + 1;
}

function drawEntryRows(
    doc: jsPDF,
    startY: number,
    entries: AgentReportEntry[],
    columnLabels: AgentReportPdfLabels["columns"],
): number {
    let y = startY;

    for (let i = 0; i < entries.length; i++) {
        const entry = entries[i]!;
        const xs = colXs();
        const ws = colWidthsScaled();
        const cells = [
            agentName(entry),
            String(entry.totalSales),
            String(entry.cashSales),
            String(entry.paymentPlanSales),
            String(entry.totalReservations),
            String(entry.convertedReservations),
            entry.conversionRate > 0 ? `${entry.conversionRate}%` : "—",
            fmtMoney(entry.totalCommissionsPaid),
            fmtMoney(entry.totalCommissionsPending),
            entry.averageCommissionRate > 0 ? `${entry.averageCommissionRate}%` : "—",
        ];
        const lineSets = cells.map((cell, idx) => doc.splitTextToSize(cell, ws[idx]! - PAD * 2));
        const rowH = Math.max(...lineSets.map((lines) => lines.length * LINE_H), LINE_H) + PAD * 2;

        if (y + rowH > PAGE_H - MM_MARGIN) {
            doc.addPage();
            y = MM_MARGIN;
            y = drawTableHeader(doc, y, columnLabels);
        }

        if (i % 2 === 1) {
            doc.setFillColor(246, 246, 246);
            doc.rect(MM_MARGIN, y - 1, pageInnerWidth(), rowH, "F");
        }

        doc.setFont("helvetica", "normal");
        doc.setFontSize(6.5);
        const textY = y + LINE_H;
        for (let c = 0; c < cells.length; c++) {
            const align = c === 0 ? "left" : "center";
            const x = align === "left" ? xs[c]! + PAD : xs[c]! + ws[c]! / 2;
            doc.text(lineSets[c]!, x, textY, {align});
        }
        y += rowH;
    }

    return y;
}

async function buildAgentReportPdf(
    result: AgentReportResponseType,
    labels: AgentReportPdfLabels,
    timezone?: string,
): Promise<jsPDF> {
    const branding = await loadCompanyBranding();
    const doc = new jsPDF({unit: "mm", format: "a4", orientation: "landscape"});

    let y = await drawHeader(doc, labels.title, branding);

    const periodFrom = formatDate(result.period.from, {timeZone: timezone});
    const periodTo = formatDate(result.period.to, {timeZone: timezone});
    y = drawMeta(doc, y, [
        {label: labels.period, value: `${periodFrom} – ${periodTo}`},
        {label: labels.generatedAt, value: formatDate(new Date().toISOString(), {timeZone: timezone}) + (timezone ? ` (${timezone})` : "")},
    ]);

    y = drawTableHeader(doc, y, labels.columns);

    if (result.entries.length === 0) {
        y = ensureY(doc, y, LINE_H + 2);
        doc.setFont("helvetica", "italic");
        doc.setFontSize(8);
        doc.text(labels.noResults, MM_MARGIN, y + LINE_H);
    } else {
        drawEntryRows(doc, y, result.entries, labels.columns);
    }

    return doc;
}

export async function downloadAgentReportPdf(
    result: AgentReportResponseType,
    labels: AgentReportPdfLabels,
    options?: {timezone?: string; fileName?: string},
): Promise<void> {
    const doc = await buildAgentReportPdf(result, labels, options?.timezone);
    const safeBase = (options?.fileName ?? "agent-performance-report").replace(/[^a-zA-Z0-9._-]+/g, "-");
    doc.save(`${safeBase}.pdf`);
}

import type { ResolveLanguageKey } from "@coreModule/helpers/hocs/withLanguage.tsx";
import {
    downloadExpenditureCostTemplatePdf,
    type ExpenditureTemplateRow,
} from "@propertyManagementModule/components/custom/unitCosts/expenditureCostTemplatePdf.ts";

/**
 * Builds the expense PDF from react-hook-form values (create/edit unit cost).
 * `resolveLanguageKey` must be scoped to `formExpenditureItemsField` translations.
 */
export async function downloadUnitCostExpenditurePdfFromFormValues(
    getValues: () => Record<string, unknown>,
    resolveLanguageKey: ResolveLanguageKey,
    expenditureFieldName = "expenditureItems",
    preferredFileName?: string,
): Promise<void> {
    const t = (key: string) => String(resolveLanguageKey(key));

    const buildTemplateInput = (metaValues: string[]) => ({
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
    });

    const paymentStatusLabel = (code: unknown) => {
        if (typeof code !== "string" || !code) return "";
        return t(`template.paymentStatusLabels.${code}`);
    };

    const str = (v: unknown) => (v == null || v === "" ? "" : String(v));

    const looksLikeMongoId = (s: string) => /^[a-fA-F0-9]{24}$/.test(s);

    const metaStr = (v: unknown) => {
        const s = str(v);
        if (!s || looksLikeMongoId(s)) return "";
        return s;
    };

    const v = getValues();
    const lines = (v[expenditureFieldName] as Record<string, unknown>[] | undefined) ?? [];

    const docName = str(v.name).trim() || preferredFileName?.trim() || "";

    const meta: string[] = [
        docName,
        metaStr(v.invoiceNumber),
        metaStr(v.vendorName),
        metaStr(v.purchaseDate),
        metaStr(v.purchasePerson),
        metaStr(v.unit),
        paymentStatusLabel(v.paymentStatus),
        metaStr(v.paymentDate),
        "",
        metaStr(v.currency),
    ];

    let runningSum = 0;
    const rows: ExpenditureTemplateRow[] = lines.map((row) => {
        const title = str(row?.title);
        const catRaw = row?.category;
        const category = typeof catRaw === "string" && catRaw ? t(`expenditureCategory.${catRaw}`) : "";
        const amount = row?.amount;
        const qty =
            amount === "" || amount === undefined || amount === null
                ? ""
                : typeof amount === "number"
                  ? String(amount)
                  : str(amount);
        const unitRaw = row?.unit;
        const unit = typeof unitRaw === "string" && unitRaw ? t(`measureUnit.${unitRaw}`) : "";
        const ppu = row?.pricePerUnit;
        const priceStr =
            ppu === "" || ppu === undefined || ppu === null
                ? ""
                : typeof ppu === "number"
                  ? String(ppu)
                  : str(ppu);
        let lineTotal = "";
        const qn = Number(String(qty).replace(/\s/g, "").replace(",", "."));
        const pn = Number(String(priceStr).replace(/\s/g, "").replace(",", "."));
        if (Number.isFinite(qn) && Number.isFinite(pn)) {
            const lineAmount = qn * pn;
            runningSum += lineAmount;
            lineTotal = lineAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        }
        return { title, category, quantity: qty, unit, unitPrice: priceStr, lineTotal };
    });

    const nameFromForm = str(v.name).trim();
    const inv = str(v.invoiceNumber).trim();
    let fileName = preferredFileName?.trim();
    if (!fileName) fileName = nameFromForm;
    if (!fileName) fileName = inv;
    if (!fileName) fileName = "unit-cost-expenditure-filled";

    await downloadExpenditureCostTemplatePdf(buildTemplateInput(meta), {
        rows,
        grandTotal:
            runningSum > 0
                ? runningSum.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                : "",
        fileName,
    });
}

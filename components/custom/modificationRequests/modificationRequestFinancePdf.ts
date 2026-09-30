import type {ModificationRequest} from "armonia/src/modules/propertyManagement/api/realEstate/private/unit/modificationRequest/modificationRequest.dto.ts";
import {DATE_FORMATS, formatDate} from "@coreModule/helpers/general/dateTime.ts";
import {formatNumber} from "@coreModule/helpers/general/numbers.ts";
import {
    downloadExpenditureCostTemplatePdf,
    type ExpenditureCostTemplateInput,
    type ExpenditureTemplateRow,
} from "@propertyManagementModule/components/custom/unitCosts/expenditureCostTemplatePdf.ts";

function money(n: number | undefined): string {
    if (n == null || !Number.isFinite(n)) return "";
    return formatNumber(n, {minimumFractionDigits: 2, maximumFractionDigits: 2});
}

/**
 * Finance cost breakdown as the same A4 expenditure PDF used for unit-cost invoices.
 * The last meta row is the currency code: the template appends that value to the total.
 */
export async function downloadModificationRequestFinancePdf(
    request: ModificationRequest,
    t: (key: string) => string,
): Promise<void> {
    const finance = request.financeDetails;
    if (!finance) return;

    const breakdownRows: ExpenditureTemplateRow[] = (finance.costBreakdown ?? []).map((item) => {
        const quantity = item.quantity;
        const price = item.cost;
        const line =
            quantity != null && price != null && Number.isFinite(quantity) && Number.isFinite(price)
                ? quantity * price
                : undefined;
        const source =
            item.source === "engineer_material"
                ? t("pdf.source.engineer_material")
                : item.source === "manual"
                  ? t("pdf.source.manual")
                  : "";
        return {
            title: item.item ?? "",
            category: source,
            quantity: quantity == null ? "" : String(quantity),
            unit: item.unit ?? "",
            unitPrice: money(price),
            lineTotal: money(line),
        };
    });
    const totalLabel = money(finance.totalCost);
    const rows: ExpenditureTemplateRow[] =
        breakdownRows.length > 0
            ? breakdownRows
            : [
                  {
                      title: t("totalCost"),
                      category: "",
                      quantity: totalLabel ? "1" : "",
                      unit: "",
                      unitPrice: totalLabel,
                      lineTotal: totalLabel,
                  },
              ];

    const currency = finance.currency?.abbreviation || finance.currency?.symbol || finance.currency?.name || "";
    const unitLabel = [request.unit?.name, request.unit?.unitNumber]
        .filter((part): part is string => typeof part === "string" && part.trim() !== "")
        .join(" · ");
    const completion = finance.estimatedCompletionDate
        ? formatDate(finance.estimatedCompletionDate, {format: DATE_FORMATS.date})
        : "";
    const notes = (finance.notes ?? "").trim();
    const requestLabel = request.name?.trim() || request.title?.trim() || "";

    const metaRows: {label: string; value: string}[] = [
        {label: t("modificationRequest"), value: requestLabel},
    ];
    if (request.title?.trim() && request.title.trim() !== requestLabel) {
        metaRows.push({label: t("title"), value: request.title.trim()});
    }
    if (unitLabel) metaRows.push({label: t("unit"), value: unitLabel});
    if (completion) metaRows.push({label: t("estimatedCompletionDate"), value: completion});
    if (notes) metaRows.push({label: t("notesLabel"), value: notes.length > 180 ? `${notes.slice(0, 180)}…` : notes});
    metaRows.push({label: t("pdf.currency"), value: currency});

    const input: ExpenditureCostTemplateInput = {
        docTitle: t("pdf.docTitle"),
        metaRows,
        columns: {
            item: t("costBreakdown"),
            category: t("pdf.category"),
            quantity: t("quantity"),
            unit: t("units"),
            price: t("cost"),
            lineTotal: t("pdf.lineTotal"),
        },
        footer: {
            tableTotal: t("pdf.tableTotal"),
            purchaser: t("pdf.preparedBy"),
            signature: t("pdf.signature"),
        },
    };

    const base = (requestLabel || `finance-${request._id.slice(-8)}`).replace(/[^a-zA-Z0-9._-]+/g, "-");
    await downloadExpenditureCostTemplatePdf(input, {
        rows,
        grandTotal: totalLabel,
        emptyRowCount: 4,
        fileName: base || "finance",
    });
}

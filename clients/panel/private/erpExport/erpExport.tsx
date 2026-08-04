import {compose} from "redux";
import {useMemo, useState} from "react";
import {useSelector} from "react-redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import Header from "@coreModule/components/custom/header.tsx";
import {Button} from "@coreModule/components/ui/button.tsx";
import {Label} from "@coreModule/components/ui/label.tsx";
import {DateInput} from "@coreModule/components/custom/dateInput.tsx";
import {ApiSelect} from "@coreModule/components/custom/apiSelect";
import {SimpleSelect} from "@coreModule/components/custom/simpleSelect";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@coreModule/components/ui/table/table.tsx";
import type {RootState} from "@coreModule/helpers/redux/store/generalStore.ts";
import {ERP_EXPORT_DATASET_VALUES} from "armonia/src/modules/propertyManagement/api/realEstate/private/erpExport/erpExport.constants.ts";
import {getErpExportColumnLabel} from "armonia/src/modules/propertyManagement/api/realEstate/private/erpExport/erpExport.columnLabels.ts";
import type {ErpExportDataset, ErpExportFormat, ErpExportResponse} from "armonia/src/modules/propertyManagement/api/realEstate/private/erpExport/erpExport.response.type.ts";
import type {ErpExportFormType} from "armonia/src/modules/propertyManagement/api/realEstate/private/erpExport/erpExport.form.type.ts";
import apiClient from "@coreModule/helpers/axiosClients/apiClient.ts";

const DEFAULT_DATASETS: ErpExportDataset[] = ["sales"];

function countRows(result: ErpExportResponse | null, dataset: ErpExportDataset): number {
    if (!result) return 0;
    switch (dataset) {
        case "sales": return result.sales?.length ?? 0;
        case "commissions": return result.commissions?.length ?? 0;
        case "paymentPlans": return result.paymentPlanInstallments?.length ?? 0;
        case "rentalPayments": return result.rentalPayments?.length ?? 0;
        case "unitCosts": return result.unitCosts?.length ?? 0;
        case "boqItems": return result.boqItems?.length ?? 0;
        case "costCommitments": return result.costCommitments?.length ?? 0;
        case "progressClaims": return result.progressClaims?.length ?? 0;
        case "permits": return result.permits?.length ?? 0;
    }
}

function datasetRows(result: ErpExportResponse, dataset: ErpExportDataset): Record<string, unknown>[] {
    switch (dataset) {
        case "sales": return (result.sales ?? []) as Record<string, unknown>[];
        case "commissions": return (result.commissions ?? []) as Record<string, unknown>[];
        case "paymentPlans": return (result.paymentPlanInstallments ?? []) as Record<string, unknown>[];
        case "rentalPayments": return (result.rentalPayments ?? []) as Record<string, unknown>[];
        case "unitCosts": return (result.unitCosts ?? []) as Record<string, unknown>[];
        case "boqItems": return (result.boqItems ?? []) as Record<string, unknown>[];
        case "costCommitments": return (result.costCommitments ?? []) as Record<string, unknown>[];
        case "progressClaims": return (result.progressClaims ?? []) as Record<string, unknown>[];
        case "permits": return (result.permits ?? []) as Record<string, unknown>[];
    }
}

const PREVIEW_TITLE_KEYS: Record<ErpExportDataset, string> = {
    sales: "preview.sales",
    commissions: "preview.commissions",
    paymentPlans: "preview.paymentPlans",
    rentalPayments: "preview.rentalPayments",
    unitCosts: "preview.unitCosts",
    boqItems: "preview.boqItems",
    costCommitments: "preview.costCommitments",
    progressClaims: "preview.progressClaims",
    permits: "preview.permits",
};

async function parseBlobError(blob: Blob): Promise<string> {
    try {
        const text = await blob.text();
        const parsed = JSON.parse(text) as {message?: string};
        return parsed.message ?? "Export failed";
    } catch {
        return "Export failed";
    }
}

function ErpExportPage({resolveLanguageKey}: WithLanguageType) {
    const languageCode = useSelector((state: RootState) => state.language.languageCode);

    const rk = (key: string, vars?: Record<string, string | number>) => {
        let text = String(resolveLanguageKey(key));
        if (vars) {
            for (const [k, v] of Object.entries(vars)) {
                text = text.replace(`{${k}}`, String(v));
            }
        }
        return text;
    };

    const datasetOptions = useMemo(
        () =>
            ERP_EXPORT_DATASET_VALUES.map((value) => ({
                value,
                label: rk(`dataset.${value}`),
            })),
        [resolveLanguageKey],
    );

    const formatOptions = useMemo(
        () => [
            {value: "json", label: rk("formatJson")},
            {value: "csv", label: rk("formatCsv")},
        ],
        [resolveLanguageKey],
    );

    const [datasets, setDatasets] = useState<ErpExportDataset[]>(DEFAULT_DATASETS);
    const [format, setFormat] = useState<ErpExportFormat>("json");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");
    const [projectId, setProjectId] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<ErpExportResponse | null>(null);
    const [error, setError] = useState<string | null>(null);

    const selectedDatasetSet = useMemo(() => new Set(datasets), [datasets]);

    const totalRows = result
        ? datasets.reduce((sum, ds) => sum + countRows(result, ds), 0)
        : 0;

    async function handleExport() {
        if (datasets.length === 0) {
            setError(rk("datasetsRequired"));
            return;
        }

        setLoading(true);
        setError(null);

        const body: ErpExportFormType = {
            datasets,
            format,
        };
        if (dateFrom) body.dateFrom = dateFrom;
        if (dateTo) body.dateTo = dateTo;
        if (projectId) body.projectId = projectId;

        try {
            if (format === "csv") {
                const res = await apiClient.post("/api/realEstate/erpExport", body, {responseType: "blob"});
                const contentType = String(res.headers["content-type"] ?? "");
                if (contentType.includes("application/json")) {
                    throw new Error(await parseBlobError(res.data as Blob));
                }
                const url = URL.createObjectURL(new Blob([res.data], {type: "text/csv"}));
                const a = document.createElement("a");
                a.href = url;
                a.download = `erp-export-${Date.now()}.csv`;
                a.click();
                URL.revokeObjectURL(url);
                setResult(null);
            } else {
                const res = await apiClient.post<ErpExportResponse>("/api/realEstate/erpExport", body);
                setResult(res.data);
            }
        } catch (e: unknown) {
            const err = e as {response?: {data?: {message?: string}}; message?: string};
            setError(err?.response?.data?.message ?? err?.message ?? rk("exportFailed"));
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex flex-col h-full overflow-hidden">
            <Header title={rk("title")} description={rk("description")} />

            <div className="flex flex-col shrink-0 border-b px-4 py-3 gap-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 items-end">
                    <div className="flex flex-col gap-1.5 sm:col-span-2 lg:col-span-2 xl:col-span-2">
                        <Label className="text-xs">{rk("datasetsLabel")}</Label>
                        <SimpleSelect
                            options={datasetOptions}
                            value={datasets}
                            multiple
                            placeholder={rk("datasetsPlaceholder")}
                            onValueChange={(value: string | string[]) => setDatasets(value as ErpExportDataset[])}
                            className="w-full h-9"
                            resolveLanguageKey={resolveLanguageKey}
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <Label className="text-xs">{rk("dateFromLabel")}</Label>
                        <DateInput
                            valueFormat="yyyy-MM-dd"
                            value={dateFrom}
                            onChange={setDateFrom}
                            className="w-full h-9"
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <Label className="text-xs">{rk("dateToLabel")}</Label>
                        <DateInput
                            valueFormat="yyyy-MM-dd"
                            value={dateTo}
                            onChange={setDateTo}
                            className="w-full h-9"
                        />
                    </div>

                    <div className="flex flex-col gap-1.5 sm:col-span-2 lg:col-span-1 xl:col-span-2">
                        <Label className="text-xs">{rk("projectLabel")}</Label>
                        <ApiSelect
                            apiUrl="/api/realEstate/project/select"
                            method="POST"
                            placeholder={rk("projectPlaceholder")}
                            value={projectId || undefined}
                            onValueChange={(value: string | string[]) => setProjectId(typeof value === "string" ? value : "")}
                            pageSize={50}
                            className="w-full h-9"
                            resolveLanguageKey={resolveLanguageKey}
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <Label className="text-xs">{rk("formatLabel")}</Label>
                        <SimpleSelect
                            options={formatOptions}
                            value={format}
                            onValueChange={(value: string | string[]) => setFormat((typeof value === "string" ? value : "json") as ErpExportFormat)}
                            className="w-full h-9"
                            resolveLanguageKey={resolveLanguageKey}
                        />
                    </div>
                </div>

                <div className="flex items-center gap-3 min-h-9">
                    <Button
                        type="button"
                        size="sm"
                        onClick={() => void handleExport()}
                        disabled={loading || datasets.length === 0}
                    >
                        {loading ? rk("exporting") : format === "csv" ? rk("exportCsv") : rk("exportJson")}
                    </Button>
                    {result && (
                        <span className="text-xs text-muted-foreground">
                            {rk("rowsExported", {
                                count: totalRows.toLocaleString(),
                                date: new Date(result.exportedAt).toLocaleString(),
                            })}
                        </span>
                    )}
                    {error && <span className="text-xs text-destructive">{error}</span>}
                </div>
            </div>

            <div className="flex-1 overflow-auto p-4">
                {result && format === "json" && (
                    <div className="flex flex-col gap-y-4">
                        {ERP_EXPORT_DATASET_VALUES.filter((ds) => selectedDatasetSet.has(ds)).map((dataset) => {
                            const rows = datasetRows(result, dataset);
                            if (!rows.length) return null;
                            return (
                                <ExportDataTable
                                    key={dataset}
                                    title={rk(PREVIEW_TITLE_KEYS[dataset])}
                                    rows={rows}
                                    rowsLabel={rk("preview.rows", {count: rows.length})}
                                    resolveHeader={(field) => getErpExportColumnLabel(field, languageCode)}
                                />
                            );
                        })}
                        {totalRows === 0 && (
                            <p className="text-center py-16 text-muted-foreground text-sm">{rk("noData")}</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

function ExportDataTable({
    title,
    rows,
    rowsLabel,
    resolveHeader,
}: {
    title: string;
    rows: Record<string, unknown>[];
    rowsLabel: string;
    resolveHeader: (field: string) => string;
}) {
    const headers = Object.keys(rows[0] ?? {});
    if (!rows.length || !headers.length) return null;

    return (
        <div className="border rounded-lg overflow-hidden">
            <div className="bg-muted px-4 py-2 flex items-center justify-between">
                <h3 className="font-semibold text-sm">{title}</h3>
                <span className="text-xs text-muted-foreground">{rowsLabel}</span>
            </div>
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            {headers.map((h) => (
                                <TableHead key={h} className="whitespace-nowrap text-xs">
                                    {resolveHeader(h)}
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {rows.map((row, i) => (
                            <TableRow key={i}>
                                {headers.map((h) => (
                                    <TableCell key={h} className="whitespace-nowrap text-xs">
                                        {row[h] == null ? "" : String(row[h])}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/erpExport/erpExport.tsx"),
    withDebug(true, true),
)(ErpExportPage);

import {compose} from "redux";
import {useEffect, useMemo, useState} from "react";
import {useSelector} from "react-redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import Header from "@coreModule/components/custom/header.tsx";
import {readPageHelp} from "@coreModule/components/custom/pageHelp.tsx";
import {Button} from "@coreModule/components/ui/button.tsx";
import {Label} from "@coreModule/components/ui/label.tsx";
import {handleError} from "@coreModule/helpers/general/errors.ts";
import {DateInput} from "@coreModule/components/custom/inputs/dateInput.tsx";
import {ApiSelect} from "@coreModule/components/viewEngine/widgets/inputs/apiSelect/apiSelect.tsx";
import {SimpleSelect} from "@coreModule/components/viewEngine/widgets/inputs/simpleSelect.tsx";
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
import useHttpRequest, {type HttpRequest} from "@coreModule/helpers/hooks/useHttpRequest.ts";
import {useAccessHydrated} from "@coreModule/helpers/context/accessContext.tsx";
import {useAccess} from "@coreModule/helpers/hooks/useAccess.ts";
import Forbidden from "@coreModule/components/custom/pages/forbidden.tsx";
import Loader from "@coreModule/components/custom/loader/loader.tsx";
import {hasAnyAccessRead} from "@propertyManagementModule/helpers/access/aggregationAccess.ts";
import {getErpExportSource} from "@propertyManagementModule/helpers/moduleContributions/loadPropertyManagementPanelContributions.ts";
import {useAnyModelRead} from "@propertyManagementModule/helpers/access/useAnyModelRead.ts";
import {DATE_FORMATS, formatDate} from "@coreModule/helpers/general/dateTime.ts";
import {formatNumber} from "@coreModule/helpers/general/numbers.ts";

const DEFAULT_DATASETS: string[] = ["sales"];
const NO_ACCESS_MODELS: readonly string[] = [];

const isPmDataset = (dataset: string): dataset is ErpExportDataset =>
    (ERP_EXPORT_DATASET_VALUES as readonly string[]).includes(dataset);

function pmDatasetRows(result: ErpExportResponse, dataset: ErpExportDataset): Record<string, unknown>[] {
    switch (dataset) {
        case "sales": return result.sales ?? [];
        case "commissions": return result.commissions ?? [];
        case "paymentPlans": return result.paymentPlanInstallments ?? [];
        case "rentalPayments": return result.rentalPayments ?? [];
        case "unitCosts": return result.unitCosts ?? [];
    }
}

/** A contributed dataset's rows: the JSON array under its response key (ErpExportSource). */
function contributedRows(answer: Record<string, unknown> | undefined, responseKey: string): Record<string, unknown>[] {
    const rows = answer?.[responseKey];
    return Array.isArray(rows) ? rows : [];
}

/** The JSON answers of one run: propertyManagement's and the contributing module's. */
type ExportResult = {exportedAt: string; pm?: ErpExportResponse; contributed?: Record<string, unknown>};

/** One previewed dataset: its picker value, title, rows and column headers. */
type DatasetPreview = {value: string; title: string; rows: Record<string, unknown>[]; resolveHeader: (field: string) => string};

async function parseBlobError(blob: Blob): Promise<string> {
    try {
        const text = await blob.text();
        const parsed = JSON.parse(text) as {message?: string};
        return parsed.message ?? "Export failed";
    } catch {
        return "Export failed";
    }
}

/** The request body without `datasets`, which each endpoint gets its own share of. */
type ExportFilters = Omit<ErpExportFormType, "datasets">;

type ExportRun = {
    count: number;
    format: ErpExportFormat;
    body: ExportFilters;
    pm: ErpExportDataset[];
    /** Datasets sent to the contributed endpoint (getErpExportSource). */
    contributed: string[];
};

/** Answers of one run, tagged with its count so a late answer from an older run is ignored. */
type ExportParts = {count: number; pm?: Blob | ErpExportResponse; contributed?: Blob | Record<string, unknown>; failure?: unknown; done?: boolean};

function ErpExportPage({resolveLanguageKey}: WithLanguageType) {
    const languageCode = useSelector((state: RootState) => state.language.languageCode);
    // Datasets another module serves from its own endpoint (propertyManagementPanelContribution, D119).
    const contributedSource = getErpExportSource();

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
        () => [
            ...ERP_EXPORT_DATASET_VALUES.map((value) => ({value, label: rk(`dataset.${value}`)})),
            ...(contributedSource?.datasets ?? []).map(({value}) => ({value, label: contributedSource?.datasetLabel(value, languageCode) ?? value})),
        ],
        [resolveLanguageKey, contributedSource, languageCode],
    );

    const formatOptions = useMemo(
        () => [
            {value: "json", label: rk("formatJson")},
            {value: "csv", label: rk("formatCsv")},
        ],
        [resolveLanguageKey],
    );

    const [datasets, setDatasets] = useState<string[]>(DEFAULT_DATASETS);
    const [format, setFormat] = useState<ErpExportFormat>("json");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");
    const [projectId, setProjectId] = useState("");
    const [result, setResult] = useState<ExportResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    // One export run: propertyManagement's datasets and, when a module contributes some, that module's, as two
    // requests whose answers are combined once both have settled.
    const [exportRun, setExportRun] = useState<ExportRun>({count: 0, format: "json", body: {format: "json"}, pm: [], contributed: []});
    const [parts, setParts] = useState<ExportParts>({count: 0});
    const responseType = exportRun.format === "csv" ? "blob" : undefined;
    const pmRequest = useMemo<HttpRequest>(() => ({method: "post", url: "/api/realEstate/erpExport", responseType}), [responseType]);
    const contributedRequest = useMemo<HttpRequest>(
        () => ({method: "post", url: contributedSource?.url ?? "", responseType}),
        [contributedSource, responseType],
    );
    const pmPart = useHttpRequest<Blob | ErpExportResponse>(pmRequest, {...exportRun.body, datasets: exportRun.pm}, exportRun.pm.length ? exportRun.count : 0, true, {
        success: (data) => setParts((current) => (current.count === exportRun.count ? {...current, pm: data} : current)),
        error: (e) => setParts((current) => (current.count === exportRun.count ? {...current, failure: e} : current)),
    });
    const contributedPart = useHttpRequest<Blob | Record<string, unknown>>(contributedRequest, {...exportRun.body, datasets: exportRun.contributed}, exportRun.contributed.length ? exportRun.count : 0, true, {
        success: (data) => setParts((current) => (current.count === exportRun.count ? {...current, contributed: data} : current)),
        error: (e) => setParts((current) => (current.count === exportRun.count ? {...current, failure: e} : current)),
    });
    const settled = parts.count === exportRun.count && exportRun.count > 0 && (
        parts.failure !== undefined
        || ((!exportRun.pm.length || parts.pm !== undefined) && (!exportRun.contributed.length || parts.contributed !== undefined))
    );
    const loading = pmPart.loading || contributedPart.loading || (exportRun.count > 0 && !parts.done);

    useEffect(() => {
        if (!settled || parts.done) return;
        setParts((current) => ({...current, done: true}));
        if (parts.failure !== undefined) {
            setError(handleError(parts.failure, {context: "ErpExport"})?.displayMessage ?? rk("exportFailed"));
            return;
        }
        if (exportRun.format !== "csv") {
            const pm = parts.pm instanceof Blob ? undefined : parts.pm;
            setResult({
                exportedAt: pm?.exportedAt ?? new Date().toISOString(),
                pm,
                contributed: parts.contributed instanceof Blob ? undefined : parts.contributed,
            });
            return;
        }
        const answers = [parts.pm, parts.contributed];
        void (async () => {
            const blobs = answers.filter((part): part is Blob => part instanceof Blob);
            // A JSON body inside a 2xx blob response is the server's error, not CSV.
            const jsonError = blobs.find((blob) => blob.type.includes("application/json"));
            if (jsonError) {
                setError(await parseBlobError(jsonError));
                return;
            }
            const url = URL.createObjectURL(new Blob(blobs.map((blob) => new Blob([blob], {type: "text/csv"})), {type: "text/csv"}));
            const a = document.createElement("a");
            a.href = url;
            a.download = `erp-export-${Date.now()}.csv`;
            a.click();
            URL.revokeObjectURL(url);
        })();
    }, [settled, parts, exportRun]);
    const accessHydrated = useAccessHydrated();
    const salesAccess = useAccess("sales");
    const commissionsAccess = useAccess("commissions");
    const paymentPlansAccess = useAccess("paymentplans");
    const rentalPaymentsAccess = useAccess("rentalpayments");
    const unitCostsAccess = useAccess("unitcosts");
    const contributedRead = useAnyModelRead(contributedSource?.accessModels ?? NO_ACCESS_MODELS);
    const canRead = contributedRead || hasAnyAccessRead([
        salesAccess,
        commissionsAccess,
        paymentPlansAccess,
        rentalPaymentsAccess,
        unitCostsAccess,
    ]);

    // Previewed datasets in picker order, each with its own titles and headers (contributed ones from their source).
    const previews = useMemo<DatasetPreview[]>(() => {
        if (!result) return [];
        const selected = new Set(datasets);
        const pmHeader = (field: string) => getErpExportColumnLabel(field, languageCode);
        const pm = ERP_EXPORT_DATASET_VALUES.filter((value) => selected.has(value)).map((value) => ({
            value,
            title: rk(`preview.${value}`),
            rows: result.pm ? pmDatasetRows(result.pm, value) : [],
            resolveHeader: pmHeader,
        }));
        const contributed = contributedSource
            ? contributedSource.datasets.filter(({value}) => selected.has(value)).map(({value, responseKey}) => ({
                value,
                title: contributedSource.datasetLabel(value, languageCode),
                rows: contributedRows(result.contributed, responseKey),
                resolveHeader: (field: string) => contributedSource.columnLabel(field, languageCode),
            }))
            : [];
        return [...pm, ...contributed];
    }, [result, datasets, contributedSource, languageCode, resolveLanguageKey]);

    const totalRows = previews.reduce((sum, preview) => sum + preview.rows.length, 0);

    function handleExport() {
        if (!canRead) return;
        if (datasets.length === 0) {
            setError(rk("datasetsRequired"));
            return;
        }

        setError(null);

        const body: ExportFilters = {format};
        if (dateFrom) body.dateFrom = dateFrom;
        if (dateTo) body.dateTo = dateTo;
        if (projectId) body.projectId = projectId;

        const pmDatasets = datasets.filter(isPmDataset);
        const contributedDatasets = datasets.filter((d) => !!contributedSource?.datasets.some(({value}) => value === d));

        setResult(null);
        setParts({count: exportRun.count + 1});
        setExportRun({count: exportRun.count + 1, format, body, pm: pmDatasets, contributed: contributedDatasets});
    }

    if (accessHydrated === false) return <Loader />;
    if (!canRead) return <Forbidden />;

    return (
        <div className="flex flex-col h-full overflow-hidden">
            <Header title={rk("title")} description={rk("description")} help={readPageHelp(resolveLanguageKey)} />

            <div className="flex flex-col shrink-0 border-b px-4 py-3 gap-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 items-end">
                    <div className="flex flex-col gap-1.5 sm:col-span-2 lg:col-span-2 xl:col-span-2">
                        <Label className="text-xs">{rk("datasetsLabel")}</Label>
                        <SimpleSelect
                            options={datasetOptions}
                            value={datasets}
                            multiple
                            placeholder={rk("datasetsPlaceholder")}
                            onValueChange={(value: string | string[]) => setDatasets(typeof value === "string" ? [value] : value)}
                            className="w-full h-9"
                            resolveLanguageKey={resolveLanguageKey}
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <Label className="text-xs">{rk("dateFromLabel")}</Label>
                        <DateInput
                            valueFormat="YYYY-MM-DD"
                            value={dateFrom}
                            onChange={setDateFrom}
                            className="w-full h-9"
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <Label className="text-xs">{rk("dateToLabel")}</Label>
                        <DateInput
                            valueFormat="YYYY-MM-DD"
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
                                count: formatNumber(totalRows),
                                date: formatDate(result.exportedAt, {format: DATE_FORMATS.dateTime}),
                            })}
                        </span>
                    )}
                    {error && <span className="text-xs text-destructive">{error}</span>}
                </div>
            </div>

            <div className="flex-1 overflow-auto p-4">
                {result && format === "json" && (
                    <div className="flex flex-col gap-y-4">
                        {previews.filter((preview) => preview.rows.length > 0).map((preview) => (
                            <ExportDataTable
                                key={preview.value}
                                title={preview.title}
                                rows={preview.rows}
                                rowsLabel={rk("preview.rows", {count: preview.rows.length})}
                                resolveHeader={preview.resolveHeader}
                            />
                        ))}
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
    withDebug(true, true, ["sales", "commissions", "paymentPlans", "rentalPayments", "unitCosts"]),
)(ErpExportPage);

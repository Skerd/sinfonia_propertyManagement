import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useCallback, useMemo, useState} from "react";
import {useSelector} from "react-redux";
import {Download} from "lucide-react";
import type {RoiResponse, RoiUnitBreakdown} from "armonia/src/modules/propertyManagement/api/realEstate/private/roi/roi.response.type.ts";
import type {RoiRequest} from "armonia/src/modules/propertyManagement/api/realEstate/private/roi/roi.request.type.ts";
import type {FilterGroup, FilterRule} from "armonia/src/modules/core/database/filter";
import apiClient from "@coreModule/helpers/axiosClients/apiClient.ts";
import {formatDate, generateUUID} from "@coreModule/helpers/general";
import type {RootState} from "@coreModule/helpers/redux/store/generalStore.ts";
import {ApiSelect} from "@coreModule/components/custom/apiSelect";
import {Label} from "@coreModule/components/ui/label.tsx";
import Loader from "@coreModule/components/custom/loader.tsx";
import {ErrorView} from "@coreModule/components/custom/errorView.tsx";
import {Alert, AlertDescription} from "@coreModule/components/ui/alert.tsx";
import Header from "@coreModule/components/custom/header";
import {readPageHelp} from "@coreModule/components/custom/pageHelp.tsx";
import {Button} from "@coreModule/components/ui/button.tsx";
import RoiSummaryCharts from "./roiSummaryCharts.tsx";
import {downloadRoiReportPdf, type RoiReportPdfLabels} from "./roiReportPdf.ts";

type RoiFilters = {
    projectId: string;
    edificeIds: string[];
    floorIds: string[];
    unitIds: string[];
};

function buildFilterRule(field: string, value: string | string[]): FilterRule | undefined {
    const values = (Array.isArray(value) ? value : [value]).filter(Boolean);
    if (values.length === 0) return undefined;
    return {
        id: generateUUID(),
        field,
        operator: values.length === 1 ? "equals" : "in",
        value: values.length === 1 ? values[0] : values,
    };
}

function buildEqualsFilterGroup(entries: { field: string; value: string | string[] }[]): FilterGroup | undefined {
    const rules = entries
        .map(({field, value}) => buildFilterRule(field, value))
        .filter((r): r is FilterRule => !!r);
    if (rules.length === 0) return undefined;
    return {id: generateUUID(), operator: "and", rules, groups: []};
}

function selectBodyWithFilters(entries: { field: string; value: string | string[] }[]): Record<string, unknown> | undefined {
    const filters = buildEqualsFilterGroup(entries);
    return filters ? {filters} : undefined;
}

function fmt(n?: number, decimals = 2): string {
    if (n === undefined || n === null) return "—";
    return n.toLocaleString("en-US", {minimumFractionDigits: decimals, maximumFractionDigits: decimals});
}

function hasRoiScope(filters: RoiFilters): boolean {
    return !!filters.projectId || filters.unitIds.length > 0;
}

function RoiCalculator({resolveLanguageKey}: WithLanguageType) {
    const rk = (key: string) => String(resolveLanguageKey(key));
    const {timezone} = useSelector((state: RootState) => state.authentication.user);

    const [projectId,  setProjectId]  = useState("");
    const [edificeIds, setEdificeIds] = useState<string[]>([]);
    const [floorIds,   setFloorIds]   = useState<string[]>([]);
    const [unitIds,    setUnitIds]    = useState<string[]>([]);
    const [loading,    setLoading]    = useState(false);
    const [result,     setResult]     = useState<RoiResponse | null>(null);
    const [error,      setError]      = useState<string | null>(null);
    const [exporting,  setExporting]  = useState(false);

    const filters: RoiFilters = useMemo(
        () => ({projectId, edificeIds, floorIds, unitIds}),
        [projectId, edificeIds, floorIds, unitIds],
    );

    const edificeSelectBody = useMemo(
        () => selectBodyWithFilters([{field: "project", value: projectId}]),
        [projectId],
    );
    const floorSelectBody = useMemo(
        () => selectBodyWithFilters([
            {field: "edifice", value: edificeIds},
            {field: "project", value: projectId},
        ]),
        [edificeIds, projectId],
    );
    const unitSelectBody = useMemo(
        () => selectBodyWithFilters([
            {field: "floor", value: floorIds},
            {field: "edifice", value: edificeIds},
            {field: "project", value: projectId},
        ]),
        [floorIds, edificeIds, projectId],
    );

    const calcRoi = useCallback(async (next: RoiFilters) => {
        if (!hasRoiScope(next)) return;
        setLoading(true);
        setError(null);
        setResult(null);
        try {
            const body: RoiRequest = {};
            if (next.projectId) body.projectId = next.projectId;
            if (next.edificeIds.length > 0) body.edificeIds = next.edificeIds;
            if (next.floorIds.length > 0)   body.floorIds   = next.floorIds;
            if (next.unitIds.length > 0)    body.unitIds    = next.unitIds;
            const res = await apiClient.post("/api/realEstate/roi", body);
            setResult(res.data);
        } catch (e: any) {
            setError(e?.response?.data?.message ?? rk("error"));
        } finally {
            setLoading(false);
        }
    }, [rk]);

    function handleProjectChange(id: string) {
        const next: RoiFilters = {projectId: id, edificeIds: [], floorIds: [], unitIds: []};
        setProjectId(id);
        setEdificeIds([]);
        setFloorIds([]);
        setUnitIds([]);
        setResult(null);
        setError(null);
        if (id) calcRoi(next);
    }

    function handleEdificeChange(ids: string | string[]) {
        const nextIds = Array.isArray(ids) ? ids : ids ? [ids] : [];
        const next: RoiFilters = {projectId, edificeIds: nextIds, floorIds: [], unitIds: []};
        setEdificeIds(nextIds);
        setFloorIds([]);
        setUnitIds([]);
        if (projectId) calcRoi(next);
    }

    function handleFloorChange(ids: string | string[]) {
        const nextIds = Array.isArray(ids) ? ids : ids ? [ids] : [];
        const next: RoiFilters = {projectId, edificeIds, floorIds: nextIds, unitIds: []};
        setFloorIds(nextIds);
        setUnitIds([]);
        if (projectId) calcRoi(next);
    }

    function handleUnitChange(ids: string | string[]) {
        const nextIds = Array.isArray(ids) ? ids : ids ? [ids] : [];
        const next: RoiFilters = {projectId, edificeIds, floorIds, unitIds: nextIds};
        setUnitIds(nextIds);
        if (projectId) calcRoi(next);
    }

    const summaryTitle = result?.project
        ? `${result.project.scopeLabel} — ${rk("summary")}`
        : rk("summary");

    const pdfLabels: RoiReportPdfLabels = useMemo(() => ({
        title: rk("roiCalculator.title"),
        summary: rk("summary"),
        computedAt: rk("computedAt"),
        scope: rk("pdf.scope"),
        project: rk("projectLabel"),
        projectSummary: {
            totalUnits: rk("projectSummary.totalUnits"),
            sold: rk("projectSummary.sold"),
            available: rk("projectSummary.available"),
            rented: rk("projectSummary.rented"),
            totalRevenue: rk("projectSummary.totalRevenue"),
            totalCosts: rk("projectSummary.totalCosts"),
            netProfit: rk("projectSummary.netProfit"),
            roi: rk("projectSummary.roi"),
            averageRoi: rk("projectSummary.averageRoi"),
        },
        columns: {
            unit: rk("columns.unit"),
            status: rk("columns.status"),
            salePrice: rk("columns.salePrice"),
            totalCosts: rk("columns.totalCosts"),
            netProfit: rk("columns.netProfit"),
            roi: rk("columns.roi"),
            monthlyRent: rk("columns.monthlyRent"),
            yield: rk("columns.yield"),
        },
        unitsSection: rk("pdf.unitsSection"),
        chartsSection: rk("pdf.chartsSection"),
        charts: {
            financialTitle: rk("charts.financialTitle"),
            unitsByStatusTitle: rk("charts.unitsByStatusTitle"),
            otherUnits: rk("charts.otherUnits"),
        },
        noResults: rk("noResults"),
    }), [resolveLanguageKey]);

    async function handleExportPdf() {
        if (!result) return;
        setExporting(true);
        try {
            await downloadRoiReportPdf(result, pdfLabels, {timezone});
        } finally {
            setExporting(false);
        }
    }

    return (
        <div className="flex flex-col p-6 gap-y-6">

            <Header
                title={rk("roiCalculator.title")}
                description={rk("roiCalculator.description")}
                help={readPageHelp(resolveLanguageKey)}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="flex flex-col gap-1.5">
                    <Label>{rk("projectLabel")}</Label>
                    <ApiSelect
                        apiUrl="/api/realEstate/project/select"
                        method="POST"
                        placeholder={rk("projectPlaceholder")}
                        value={projectId || undefined}
                        onValueChange={(v: string) => handleProjectChange(v)}
                        className="w-full"
                        resolveLanguageKey={resolveLanguageKey}
                    />
                </div>
                <div className="flex flex-col gap-1.5">
                    <Label>{rk("edificeLabel")}</Label>
                    <ApiSelect
                        key={`edifice-${projectId || "none"}`}
                        apiUrl="/api/realEstate/edifice/select"
                        method="POST"
                        postBody={edificeSelectBody}
                        placeholder={rk("edificePlaceholder")}
                        value={edificeIds}
                        onValueChange={handleEdificeChange}
                        multiple
                        showSelectedChips
                        disabled={!projectId}
                        className="w-full"
                        resolveLanguageKey={resolveLanguageKey}
                    />
                </div>
                <div className="flex flex-col gap-1.5">
                    <Label>{rk("floorLabel")}</Label>
                    <ApiSelect
                        key={`floor-${edificeIds.join(",") || projectId || "none"}`}
                        apiUrl="/api/realEstate/floor/select"
                        method="POST"
                        postBody={floorSelectBody}
                        placeholder={rk("floorPlaceholder")}
                        value={floorIds}
                        onValueChange={handleFloorChange}
                        multiple
                        showSelectedChips
                        disabled={!projectId}
                        className="w-full"
                        resolveLanguageKey={resolveLanguageKey}
                    />
                </div>
                <div className="flex flex-col gap-1.5">
                    <Label>{rk("unitLabel")}</Label>
                    <ApiSelect
                        key={`unit-${floorIds.join(",") || edificeIds.join(",") || projectId || "none"}`}
                        apiUrl="/api/realEstate/unit/select"
                        method="POST"
                        postBody={unitSelectBody}
                        placeholder={rk("unitPlaceholder")}
                        value={unitIds}
                        onValueChange={handleUnitChange}
                        multiple
                        showSelectedChips
                        disabled={!projectId}
                        className="w-full"
                        resolveLanguageKey={resolveLanguageKey}
                    />
                </div>
            </div>

            {
                !hasRoiScope(filters) && !loading &&
                <Alert>
                    <AlertDescription>{rk("selectUnitHint")}</AlertDescription>
                </Alert>
            }

            {
                loading ?
                <Loader />
                :
                <>
                    {
                        error ?
                        <ErrorView
                            title={rk("error")}
                            description={error}
                            onClick={() => calcRoi(filters)}
                            resolveLanguageKey={resolveLanguageKey}
                        />
                        :
                        <>
                            {
                                result &&
                                <div className="flex flex-col gap-y-6">
                                    <div className="flex justify-end">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            disabled={exporting}
                                            onClick={() => void handleExportPdf()}
                                        >
                                            <Download className="h-4 w-4 mr-2" />
                                            {exporting ? rk("exportPdfLoading") : rk("exportPdf")}
                                        </Button>
                                    </div>
                                    {
                                        result.project &&
                                        <div className="flex flex-col border rounded-lg p-5 gap-y-4">
                                            <h2 className="font-semibold text-lg">
                                                {summaryTitle}
                                            </h2>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                                <div>
                                                    <p className="text-muted-foreground">{rk("projectSummary.totalUnits")}</p>
                                                    <p className="font-semibold text-lg">{result.project.totalUnits}</p>
                                                </div>
                                                <div>
                                                    <p className="text-muted-foreground">{rk("projectSummary.sold")}</p>
                                                    <p className="font-semibold text-lg text-success">{result.project.soldUnits}</p>
                                                </div>
                                                <div>
                                                    <p className="text-muted-foreground">{rk("projectSummary.available")}</p>
                                                    <p className="font-semibold text-lg text-info">{result.project.availableUnits}</p>
                                                </div>
                                                <div>
                                                    <p className="text-muted-foreground">{rk("projectSummary.rented")}</p>
                                                    <p className="font-semibold text-lg text-primary">{result.project.rentedUnits}</p>
                                                </div>
                                                <div>
                                                    <p className="text-muted-foreground">{rk("projectSummary.totalRevenue")}</p>
                                                    <p className="font-semibold">{fmt(result.project.totalRevenue)} {result.project.baseCurrencySymbol}</p>
                                                </div>
                                                <div>
                                                    <p className="text-muted-foreground">{rk("projectSummary.totalCosts")}</p>
                                                    <p className="font-semibold">{fmt(result.project.totalCosts)}</p>
                                                </div>
                                                <div>
                                                    <p className="text-muted-foreground">{rk("projectSummary.netProfit")}</p>
                                                    <p className={`font-semibold ${result.project.netProfit >= 0 ? "text-success" : "text-destructive"}`}>
                                                        {fmt(result.project.netProfit)}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-muted-foreground">{rk("projectSummary.roi")}</p>
                                                    <p className={`font-bold text-lg ${result.project.roiPercent >= 0 ? "text-success" : "text-destructive"}`}>
                                                        {fmt(result.project.roiPercent)}%
                                                    </p>
                                                </div>
                                            </div>
                                            <RoiSummaryCharts
                                                summary={result.project}
                                                resolveLanguageKey={resolveLanguageKey}
                                            />
                                        </div>
                                    }

                                    <div className="border rounded-lg overflow-hidden">
                                        <table className="w-full text-sm">
                                            <thead className="bg-muted">
                                            <tr>
                                                <th className="text-left px-4 py-2">{rk("columns.unit")}</th>
                                                <th className="text-left px-4 py-2">{rk("columns.status")}</th>
                                                <th className="text-right px-4 py-2">{rk("columns.salePrice")}</th>
                                                <th className="text-right px-4 py-2">{rk("columns.totalCosts")}</th>
                                                <th className="text-right px-4 py-2">{rk("columns.netProfit")}</th>
                                                <th className="text-right px-4 py-2">{rk("columns.roi")}</th>
                                                <th className="text-right px-4 py-2">{rk("columns.monthlyRent")}</th>
                                                <th className="text-right px-4 py-2">{rk("columns.yield")}</th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {result.units.map((u: RoiUnitBreakdown) => (
                                                <tr key={u.unitId} className="border-t hover:bg-muted/50">
                                                    <td className="px-4 py-2">
                                                        <p className="font-medium">{u.unitName}</p>
                                                        <p className="text-xs text-muted-foreground">{u.unitNumber}</p>
                                                    </td>
                                                    <td className="px-4 py-2">
                                        <span className="text-xs px-2 py-0.5 rounded bg-muted">
                                            {u.status.replace("_unit", "")}
                                        </span>
                                                    </td>
                                                    <td className="px-4 py-2 text-right">
                                                        {u.salePrice !== undefined ? `${fmt(u.salePrice)} ${u.saleCurrencySymbol ?? ""}` : "—"}
                                                    </td>
                                                    <td className="px-4 py-2 text-right">
                                                        {fmt(u.totalCosts)} {u.costCurrencySymbol ?? ""}
                                                    </td>
                                                    <td className={`px-4 py-2 text-right font-medium ${(u.netProfit ?? 0) >= 0 ? "text-success" : "text-destructive"}`}>
                                                        {fmt(u.netProfit)}
                                                    </td>
                                                    <td className={`px-4 py-2 text-right font-bold ${(u.roiPercent ?? 0) >= 0 ? "text-success" : "text-destructive"}`}>
                                                        {u.roiPercent !== undefined ? `${fmt(u.roiPercent)}%` : "—"}
                                                    </td>
                                                    <td className="px-4 py-2 text-right">
                                                        {u.monthlyRent !== undefined ? fmt(u.monthlyRent) : "—"}
                                                    </td>
                                                    <td className="px-4 py-2 text-right">
                                                        {u.annualGrossYield !== undefined ? `${fmt(u.annualGrossYield)}%` : "—"}
                                                    </td>
                                                </tr>
                                            ))}
                                            </tbody>
                                        </table>
                                        {result.units.length === 0 && (
                                            <p className="text-center py-8 text-muted-foreground text-sm">{rk("noResults")}</p>
                                        )}
                                    </div>

                                    <p className="text-xs text-muted-foreground">
                                        {rk("computedAt")}{" "}
                                        {formatDate(result.computedAt, {timeZone: timezone})}
                                        {timezone ? ` (${timezone})` : ""}
                                    </p>
                                </div>
                            }
                        </>
                    }
                </>
            }
        </div>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/overview/roi/roiCalculator.tsx"),
    withDebug(true, true, ["projects", "units"]),
)(RoiCalculator);

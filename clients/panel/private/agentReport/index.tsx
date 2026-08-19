import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {compose} from "redux";
import {useSelector} from "react-redux";
import {Download} from "lucide-react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withAxios, {WithAxiosType} from "@coreModule/helpers/hocs/withAxios.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import Header from "@coreModule/components/custom/header.tsx";
import Loader from "@coreModule/components/custom/loader.tsx";
import {ErrorView} from "@coreModule/components/custom/errorView.tsx";
import {Button} from "@coreModule/components/ui/button.tsx";
import {Label} from "@coreModule/components/ui/label.tsx";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@coreModule/components/ui/select.tsx";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@coreModule/components/ui/table/table.tsx";
import {Badge} from "@coreModule/components/ui/badge.tsx";
import {DateInput} from "@coreModule/components/custom/dateInput.tsx";
import {ApiSelect} from "@coreModule/components/custom/apiSelect";
import type {RootState} from "@coreModule/helpers/redux/store/generalStore.ts";
import type {AgentReportResponseType} from "armonia/src/modules/propertyManagement/api/realEstate/private/agentReport/agentReport.response.type.ts";
import type {AgentReportFormType} from "armonia/src/modules/propertyManagement/api/realEstate/private/agentReport/agentReport.form.type.ts";
import {downloadAgentReportPdf, type AgentReportPdfLabels} from "./agentReportPdf.ts";

const PERIOD_OPTIONS: {value: string; fromDaysAgo: number; langKey: string}[] = [
    {value: "last30",       fromDaysAgo: 30,  langKey: "period.last30"},
    {value: "last3months",  fromDaysAgo: 90,  langKey: "period.last3months"},
    {value: "last6months",  fromDaysAgo: 180, langKey: "period.last6months"},
    {value: "last12months", fromDaysAgo: 365, langKey: "period.last12months"},
];

const DEFAULT_PERIOD = "last6months";

function toISODate(d: Date): string {
    return d.toISOString().slice(0, 10);
}

function datesFromPeriod(periodKey: string): {dateFrom: string; dateTo: string} | null {
    const opt = PERIOD_OPTIONS.find((o) => o.value === periodKey);
    if (!opt) return null;
    const to = new Date();
    const from = new Date();
    from.setDate(from.getDate() - opt.fromDaysAgo);
    return {dateFrom: toISODate(from), dateTo: toISODate(to)};
}

const INITIAL_DATES = datesFromPeriod(DEFAULT_PERIOD)!;

function buildFilter(
    dateFrom: string,
    dateTo: string,
    agentIds: string[],
): AgentReportFormType {
    const filter: AgentReportFormType = {dateFrom, dateTo};
    if (agentIds.length > 0) filter.agentIds = agentIds;
    return filter;
}

type AgentReportPageProps = WithLanguageType & WithAxiosType<AgentReportResponseType, AgentReportFormType>;

function AgentReportPage({
    resolveLanguageKey,
    data,
    loading,
    error,
    onFilterChange,
}: AgentReportPageProps) {
    const rk = (key: string) => String(resolveLanguageKey(key));
    const {timezone} = useSelector((state: RootState) => state.authentication.user);

    const [periodKey, setPeriodKey] = useState<string>(DEFAULT_PERIOD);
    const [dateFrom, setDateFrom] = useState(INITIAL_DATES.dateFrom);
    const [dateTo, setDateTo] = useState(INITIAL_DATES.dateTo);
    const [agentIds, setAgentIds] = useState<string[]>([]);
    const [exporting, setExporting] = useState(false);

    const onFilterChangeRef = useRef(onFilterChange);
    onFilterChangeRef.current = onFilterChange;

    const agentIdsKey = agentIds.join(",");

    useEffect(() => {
        if (!dateFrom || !dateTo) return;
        onFilterChangeRef.current(buildFilter(dateFrom, dateTo, agentIds));
    }, [dateFrom, dateTo, agentIdsKey, agentIds]);

    const refetch = useCallback(() => {
        if (!dateFrom || !dateTo) return;
        onFilterChangeRef.current(buildFilter(dateFrom, dateTo, agentIds));
    }, [agentIds, dateFrom, dateTo]);

    const handlePeriodChange = (value: string) => {
        const dates = datesFromPeriod(value);
        if (!dates) return;
        setPeriodKey(value);
        setDateFrom(dates.dateFrom);
        setDateTo(dates.dateTo);
    };

    const handleDateFromChange = (value: string) => {
        setPeriodKey("");
        setDateFrom(value);
    };

    const handleDateToChange = (value: string) => {
        setPeriodKey("");
        setDateTo(value);
    };

    const handleAgentChange = (value: string | string[]) => {
        setAgentIds(Array.isArray(value) ? value : value ? [value] : []);
    };

    const entries = data?.entries ?? [];
    const period = data?.period;

    const pdfLabels: AgentReportPdfLabels = useMemo(() => ({
        title: rk("title"),
        period: rk("pdf.period"),
        generatedAt: rk("pdf.generatedAt"),
        noResults: rk("noActivity"),
        columns: {
            agent: rk("columns.agent"),
            sales: rk("columns.sales"),
            cash: rk("columns.cash"),
            paymentPlan: rk("columns.paymentPlan"),
            reservations: rk("columns.reservations"),
            converted: rk("columns.converted"),
            conversionRate: rk("columns.conversionRate"),
            commissionPaid: rk("columns.commissionPaid"),
            commissionPending: rk("columns.commissionPending"),
            avgRate: rk("columns.avgRate"),
        },
    }), [rk]);

    async function handleExportPdf() {
        if (!data) return;
        setExporting(true);
        try {
            await downloadAgentReportPdf(data, pdfLabels, {timezone});
        } finally {
            setExporting(false);
        }
    }

    const canApply = !!dateFrom && !!dateTo;

    return (
        <div className="flex flex-col h-full overflow-hidden">
            <Header title={rk("title")} description={rk("title")}/>

            <div className="shrink-0 border-b px-4 py-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3 items-end">
                    <div className="flex flex-col gap-1.5">
                        <Label className="text-xs">{rk("periodLabel")}</Label>
                        <Select value={periodKey || undefined} onValueChange={handlePeriodChange}>
                            <SelectTrigger className="w-full h-9">
                                <SelectValue placeholder={rk("periodCustom")} />
                            </SelectTrigger>
                            <SelectContent>
                                {PERIOD_OPTIONS.map(opt => (
                                    <SelectItem key={opt.value} value={opt.value}>
                                        {rk(opt.langKey)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <Label className="text-xs">{rk("dateFromLabel")}</Label>
                        <DateInput
                            valueFormat="yyyy-MM-dd"
                            value={dateFrom}
                            onChange={handleDateFromChange}
                            className="w-full h-9"
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <Label className="text-xs">{rk("dateToLabel")}</Label>
                        <DateInput
                            valueFormat="yyyy-MM-dd"
                            value={dateTo}
                            onChange={handleDateToChange}
                            className="w-full h-9"
                        />
                    </div>

                    <div className="flex flex-col gap-1.5 sm:col-span-2 lg:col-span-1 xl:col-span-2">
                        <Label className="text-xs">{rk("agentsLabel")}</Label>
                        <ApiSelect
                            apiUrl="/api/company/users/select"
                            method="POST"
                            placeholder={rk("agentsPlaceholder")}
                            value={agentIds}
                            onValueChange={handleAgentChange}
                            multiple
                            className="w-full h-9"
                            resolveLanguageKey={resolveLanguageKey}
                        />
                    </div>
                </div>

                <div className="flex items-center justify-end gap-3 mt-3 min-h-9">
                    {period && (
                        <span className="text-xs text-muted-foreground mr-auto">
                            {new Date(period.from).toLocaleDateString()} – {new Date(period.to).toLocaleDateString()}
                        </span>
                    )}
                    {data && entries.length > 0 && (
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={exporting || loading}
                            onClick={() => void handleExportPdf()}
                        >
                            <Download className="h-4 w-4 mr-2" />
                            {exporting ? rk("exportPdfLoading") : rk("exportPdf")}
                        </Button>
                    )}
                </div>
            </div>

            <div className="flex-1 overflow-auto p-4">
                {loading && <Loader />}
                {error && !loading && (
                    <ErrorView
                        error={error}
                        title={rk("errorTitle")}
                        description={rk("errorDescription")}
                        tooltipDescription={rk("errorTooltip")}
                        onClick={refetch}
                        resolveLanguageKey={resolveLanguageKey}
                    />
                )}
                {!loading && !error && !canApply && (
                    <div className="text-center text-muted-foreground py-16 text-sm">
                        {rk("selectDateRangeHint")}
                    </div>
                )}
                {!loading && !error && canApply && entries.length === 0 && (
                    <div className="text-center text-muted-foreground py-16 text-sm">
                        {rk("noActivity")}
                    </div>
                )}
                {!loading && !error && canApply && entries.length > 0 && (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>{rk("columns.agent")}</TableHead>
                                <TableHead className="text-center">{rk("columns.sales")}</TableHead>
                                <TableHead className="text-center">{rk("columns.cash")}</TableHead>
                                <TableHead className="text-center">{rk("columns.paymentPlan")}</TableHead>
                                <TableHead className="text-center">{rk("columns.reservations")}</TableHead>
                                <TableHead className="text-center">{rk("columns.converted")}</TableHead>
                                <TableHead className="text-center">{rk("columns.conversionRate")}</TableHead>
                                <TableHead className="text-right">{rk("columns.commissionPaid")}</TableHead>
                                <TableHead className="text-right">{rk("columns.commissionPending")}</TableHead>
                                <TableHead className="text-right">{rk("columns.avgRate")}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {entries.map(entry => {
                                const agentName = [entry.agent.name, entry.agent.surname].filter(Boolean).join(" ") || entry.agent._id;
                                return (
                                    <TableRow key={entry.agent._id}>
                                        <TableCell className="font-medium">{agentName}</TableCell>
                                        <TableCell className="text-center">
                                            <Badge variant={entry.totalSales > 0 ? "default" : "secondary"}>
                                                {entry.totalSales}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-center text-sm">{entry.cashSales}</TableCell>
                                        <TableCell className="text-center text-sm">{entry.paymentPlanSales}</TableCell>
                                        <TableCell className="text-center text-sm">{entry.totalReservations}</TableCell>
                                        <TableCell className="text-center text-sm">{entry.convertedReservations}</TableCell>
                                        <TableCell className="text-center text-sm">
                                            {entry.conversionRate > 0
                                                ? <Badge variant={entry.conversionRate >= 50 ? "default" : "secondary"}>{entry.conversionRate}%</Badge>
                                                : <span className="text-muted-foreground">—</span>
                                            }
                                        </TableCell>
                                        <TableCell className="text-right text-sm tabular-nums">
                                            {entry.totalCommissionsPaid > 0 ? entry.totalCommissionsPaid.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) : "—"}
                                        </TableCell>
                                        <TableCell className="text-right text-sm tabular-nums">
                                            {entry.totalCommissionsPending > 0 ? entry.totalCommissionsPending.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) : "—"}
                                        </TableCell>
                                        <TableCell className="text-right text-sm">
                                            {entry.averageCommissionRate > 0 ? `${entry.averageCommissionRate}%` : "—"}
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                )}
            </div>
        </div>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/agentReport/index.tsx"),
    withAxios<AgentReportResponseType, AgentReportFormType>(
        {
            url: "/api/realEstate/agentReport",
            method: "post",
            data: {},
        },
        true
    ),
    withDebug(true, true, ["commissions", "leads"]),
)(AgentReportPage);

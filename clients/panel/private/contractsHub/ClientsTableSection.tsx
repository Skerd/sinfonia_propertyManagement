import {useCallback, useEffect, useState} from "react";
import {Eye} from "lucide-react";
import type {ResolveLanguageKey} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {Button} from "@coreModule/components/ui/button.tsx";
import {Input} from "@coreModule/components/ui/input.tsx";
import {Label} from "@coreModule/components/ui/label.tsx";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@coreModule/components/ui/select.tsx";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@coreModule/components/ui/table/table.tsx";
import {Badge} from "@coreModule/components/ui/badge.tsx";
import {ApiSelect} from "@coreModule/components/custom/apiSelect";
import Loader from "@coreModule/components/custom/loader.tsx";
import {ErrorView} from "@coreModule/components/custom/errorView.tsx";
import apiClient from "@coreModule/helpers/axiosClients/apiClient.ts";
import type {HttpError} from "@coreModule/helpers/hooks/useHttpRequest.ts";
import type {ClientRegistryRow} from "armonia/src/modules/propertyManagement/api/realEstate/private/contractsHub/contractsHub.client.dto.ts";
import type {ClientsListFormType} from "armonia/src/modules/propertyManagement/api/realEstate/private/contractsHub/contractsHub.form.type.ts";
import type {ClientsListResponseType} from "armonia/src/modules/propertyManagement/api/realEstate/private/contractsHub/contractsHub.response.type.ts";
import {CLIENT_REGISTRY_STATUS_VALUES} from "armonia/src/modules/propertyManagement/api/realEstate/private/contractsHub/contractsHub.constants.ts";
import {
    clientStatusBadgeVariant,
    fmtDate,
    fmtMoney,
    fmtSurface,
    paginationSummary,
    personName,
    unitLabel,
} from "./contractsHubHelpers.ts";
import {ContractsHubFilterField, ContractsHubFilterToolbar} from "./ContractsHubFilterField.tsx";

const PAGE_SIZE = 10;

type ClientsTableSectionProps = {
    resolveLanguageKey: ResolveLanguageKey;
    timezone?: string;
    onViewRow: (row: ClientRegistryRow) => void;
};

export default function ClientsTableSection({
    resolveLanguageKey,
    timezone,
    onViewRow,
}: ClientsTableSectionProps) {
    const rk = (key: string) => String(resolveLanguageKey(`clients.${key}`));

    const [searchInput, setSearchInput] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [projectId, setProjectId] = useState("");
    const [unitTypeId, setUnitTypeId] = useState("");
    const [status, setStatus] = useState("");
    const [valueMin, setValueMin] = useState("");
    const [valueMax, setValueMax] = useState("");
    const [page, setPage] = useState(1);

    const [data, setData] = useState<ClientsListResponseType | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<HttpError | null>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        const body: ClientsListFormType = {page, limit: PAGE_SIZE};
        if (debouncedSearch.trim()) body.search = debouncedSearch.trim();
        if (projectId) body.projectId = projectId;
        if (unitTypeId) body.unitTypeId = unitTypeId;
        if (status) body.status = status as ClientsListFormType["status"];
        if (valueMin.trim()) body.valueMin = Number(valueMin);
        if (valueMax.trim()) body.valueMax = Number(valueMax);

        try {
            const res = await apiClient.post<ClientsListResponseType>(
                "/api/realEstate/contractsHub/clients/list",
                body,
            );
            setData(res.data);
        } catch (err) {
            setError(err as HttpError);
            setData(null);
        } finally {
            setLoading(false);
        }
    }, [page, projectId, debouncedSearch, status, unitTypeId, valueMax, valueMin]);

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(searchInput), 300);
        return () => clearTimeout(timer);
    }, [searchInput]);

    useEffect(() => {
        void fetchData();
    }, [fetchData]);

    useEffect(() => {
        setPage(1);
    }, [debouncedSearch, projectId, unitTypeId, status, valueMin, valueMax]);

    const rows = data?.data ?? [];
    const total = data?.total ?? 0;
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

    return (
        <section className="space-y-4">
            <div>
                <h2 className="text-lg font-semibold">{rk("title")}</h2>
                <p className="text-sm text-muted-foreground">{rk("description")}</p>
            </div>

            <div className="rounded-lg border overflow-hidden">
                <ContractsHubFilterToolbar>
                    <div className="space-y-3">
                        <div className="flex flex-col gap-1.5">
                            <Label className="text-xs font-medium text-muted-foreground">{rk("searchLabel")}</Label>
                            <Input
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                placeholder={rk("searchPlaceholder")}
                                className="h-9"
                            />
                        </div>

                        <div className="flex flex-wrap items-end gap-3">
                            <ContractsHubFilterField label={rk("projectLabel")}>
                                <ApiSelect
                                    apiUrl="/api/realEstate/project/select"
                                    method="POST"
                                    placeholder={rk("projectPlaceholder")}
                                    value={projectId}
                                    onValueChange={(v: string | string[]) => setProjectId(typeof v === "string" ? v : "")}
                                    className="h-9 w-full"
                                    resolveLanguageKey={resolveLanguageKey}
                                />
                            </ContractsHubFilterField>

                            <ContractsHubFilterField label={rk("typologyLabel")}>
                                <ApiSelect
                                    apiUrl="/api/realEstate/unitType/select"
                                    method="POST"
                                    placeholder={rk("typologyPlaceholder")}
                                    value={unitTypeId}
                                    onValueChange={(v: string | string[]) => setUnitTypeId(typeof v === "string" ? v : "")}
                                    className="h-9 w-full"
                                    resolveLanguageKey={resolveLanguageKey}
                                />
                            </ContractsHubFilterField>

                            <ContractsHubFilterField label={rk("statusLabel")}>
                                <Select value={status || "all"} onValueChange={(v) => setStatus(v === "all" ? "" : v)}>
                                    <SelectTrigger className="h-9 w-full">
                                        <SelectValue placeholder={rk("statusPlaceholder")} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">{rk("statusPlaceholder")}</SelectItem>
                                        {CLIENT_REGISTRY_STATUS_VALUES.map((value) => (
                                            <SelectItem key={value} value={value}>
                                                {rk(`status.${value}`)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </ContractsHubFilterField>

                            <ContractsHubFilterField label={rk("valueRangeLabel")} className="min-w-[15rem] flex-[1.4] sm:max-w-[18rem]">
                                <div className="grid grid-cols-2 gap-2">
                                    <Input
                                        type="number"
                                        min={0}
                                        value={valueMin}
                                        onChange={(e) => setValueMin(e.target.value)}
                                        placeholder={rk("valueMinPlaceholder")}
                                        className="h-9"
                                    />
                                    <Input
                                        type="number"
                                        min={0}
                                        value={valueMax}
                                        onChange={(e) => setValueMax(e.target.value)}
                                        placeholder={rk("valueMaxPlaceholder")}
                                        className="h-9"
                                    />
                                </div>
                            </ContractsHubFilterField>
                        </div>
                    </div>
                </ContractsHubFilterToolbar>

                {loading && <div className="p-8"><Loader /></div>}
                {error && !loading && (
                    <div className="p-4">
                        <ErrorView
                            error={error}
                            title={rk("errorTitle")}
                            description={rk("errorDescription")}
                            tooltipDescription={rk("errorTooltip")}
                            onClick={() => void fetchData()}
                            resolveLanguageKey={resolveLanguageKey}
                        />
                    </div>
                )}
                {!loading && !error && rows.length === 0 && (
                    <div className="p-8 text-center text-sm text-muted-foreground">{rk("noResults")}</div>
                )}
                {!loading && !error && rows.length > 0 && (
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>{rk("columns.name")}</TableHead>
                                    <TableHead>{rk("columns.phone")}</TableHead>
                                    <TableHead>{rk("columns.email")}</TableHead>
                                    <TableHead>{rk("columns.project")}</TableHead>
                                    <TableHead>{rk("columns.unit")}</TableHead>
                                    <TableHead>{rk("columns.typology")}</TableHead>
                                    <TableHead>{rk("columns.surface")}</TableHead>
                                    <TableHead>{rk("columns.unitValue")}</TableHead>
                                    <TableHead>{rk("columns.status")}</TableHead>
                                    <TableHead>{rk("columns.bookingDate")}</TableHead>
                                    <TableHead>{rk("columns.contractDate")}</TableHead>
                                    <TableHead>{rk("columns.agent")}</TableHead>
                                    <TableHead>{rk("columns.paid")}</TableHead>
                                    <TableHead>{rk("columns.remaining")}</TableHead>
                                    <TableHead className="text-right">{rk("columns.actions")}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {rows.map((row) => (
                                    <TableRow key={row._id}>
                                        <TableCell className="font-medium whitespace-nowrap">
                                            {personName({name: row.name, surname: row.surname})}
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap">{row.phone ?? "—"}</TableCell>
                                        <TableCell>{row.email ?? "—"}</TableCell>
                                        <TableCell>{row.project?.name ?? "—"}</TableCell>
                                        <TableCell>{unitLabel(row.unit)}</TableCell>
                                        <TableCell>
                                            {row.typology
                                                ? <Badge variant="outline">{row.typology}</Badge>
                                                : "—"}
                                        </TableCell>
                                        <TableCell className="tabular-nums">{fmtSurface(row.surface)}</TableCell>
                                        <TableCell className="tabular-nums whitespace-nowrap">
                                            {fmtMoney(row.unitValue, row.currency?.symbol ?? "€")}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={clientStatusBadgeVariant(row.status)}>
                                                {rk(`status.${row.status}`)}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap">{fmtDate(row.bookingDate, timezone)}</TableCell>
                                        <TableCell className="whitespace-nowrap">{fmtDate(row.contractDate, timezone)}</TableCell>
                                        <TableCell>{personName(row.agent)}</TableCell>
                                        <TableCell className="tabular-nums whitespace-nowrap">
                                            {fmtMoney(row.paid, row.currency?.symbol ?? "€")}
                                        </TableCell>
                                        <TableCell className="tabular-nums whitespace-nowrap">
                                            {fmtMoney(row.remaining, row.currency?.symbol ?? "€")}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                aria-label={rk("viewAction")}
                                                onClick={() => onViewRow(row)}
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </div>

            {!loading && !error && total > 0 && (
                <div className="flex items-center justify-between gap-3">
                    <span className="text-xs text-muted-foreground">
                        {paginationSummary(resolveLanguageKey, "clients", page, PAGE_SIZE, total)}
                    </span>
                    <div className="flex items-center gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={page <= 1}
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                        >
                            Previous
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={page >= totalPages}
                            onClick={() => setPage((p) => p + 1)}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            )}
        </section>
    );
}

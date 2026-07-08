import {useCallback, useEffect, useState} from "react";
import {Eye} from "lucide-react";
import type {ResolveLanguageKey} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {Button} from "@coreModule/components/ui/button.tsx";
import {Input} from "@coreModule/components/ui/input.tsx";
import {Label} from "@coreModule/components/ui/label.tsx";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@coreModule/components/ui/select.tsx";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@coreModule/components/ui/table/table.tsx";
import {Badge} from "@coreModule/components/ui/badge.tsx";
import {DateInput} from "@coreModule/components/custom/dateInput.tsx";
import {ApiSelect} from "@coreModule/components/custom/apiSelect";
import Loader from "@coreModule/components/custom/loader.tsx";
import {ErrorView} from "@coreModule/components/custom/errorView.tsx";
import apiClient from "@coreModule/helpers/axiosClients/apiClient.ts";
import type {HttpError} from "@coreModule/helpers/hooks/useHttpRequest.ts";
import type {ContractRegistryRow} from "armonia/src/modules/propertyManagement/api/realEstate/private/contractsHub/contractsHub.contract.dto.ts";
import type {ContractsListFormType} from "armonia/src/modules/propertyManagement/api/realEstate/private/contractsHub/contractsHub.form.type.ts";
import type {ContractsListResponseType} from "armonia/src/modules/propertyManagement/api/realEstate/private/contractsHub/contractsHub.response.type.ts";
import {
    CONTRACT_REGISTRY_STATUS_VALUES,
    CONTRACT_REGISTRY_TYPE_VALUES,
} from "armonia/src/modules/propertyManagement/api/realEstate/private/contractsHub/contractsHub.constants.ts";
import {
    contractStatusBadgeVariant,
    contractTypeBadgeVariant,
    fmtDate,
    fmtDateTime,
    paginationSummary,
    paymentStatusBadgeVariant,
    personName,
    unitLabel,
} from "./contractsHubHelpers.ts";
import {ContractsHubFilterField, ContractsHubFilterToolbar} from "./ContractsHubFilterField.tsx";

const PAGE_SIZE = 10;

type ContractsTableSectionProps = {
    resolveLanguageKey: ResolveLanguageKey;
    timezone?: string;
    onViewRow: (row: ContractRegistryRow) => void;
};

export default function ContractsTableSection({
    resolveLanguageKey,
    timezone,
    onViewRow,
}: ContractsTableSectionProps) {
    const rk = (key: string) => String(resolveLanguageKey(`contracts.${key}`));

    const [searchInput, setSearchInput] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [projectId, setProjectId] = useState("");
    const [contractType, setContractType] = useState("");
    const [status, setStatus] = useState("");
    const [signatureDateFrom, setSignatureDateFrom] = useState("");
    const [signatureDateTo, setSignatureDateTo] = useState("");
    const [page, setPage] = useState(1);

    const [data, setData] = useState<ContractsListResponseType | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<HttpError | null>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        const body: ContractsListFormType = {page, limit: PAGE_SIZE};
        if (debouncedSearch.trim()) body.search = debouncedSearch.trim();
        if (projectId) body.projectId = projectId;
        if (contractType) body.contractType = contractType as ContractsListFormType["contractType"];
        if (status) body.status = status as ContractsListFormType["status"];
        if (signatureDateFrom) body.signatureDateFrom = signatureDateFrom;
        if (signatureDateTo) body.signatureDateTo = signatureDateTo;

        try {
            const res = await apiClient.post<ContractsListResponseType>(
                "/api/realEstate/contractsHub/contracts/list",
                body,
            );
            setData(res.data);
        } catch (err) {
            setError(err as HttpError);
            setData(null);
        } finally {
            setLoading(false);
        }
    }, [contractType, page, projectId, debouncedSearch, signatureDateFrom, signatureDateTo, status]);

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(searchInput), 300);
        return () => clearTimeout(timer);
    }, [searchInput]);

    useEffect(() => {
        void fetchData();
    }, [fetchData]);

    useEffect(() => {
        setPage(1);
    }, [debouncedSearch, projectId, contractType, status, signatureDateFrom, signatureDateTo]);

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

                            <ContractsHubFilterField label={rk("contractTypeLabel")}>
                                <Select value={contractType || "all"} onValueChange={(v) => setContractType(v === "all" ? "" : v)}>
                                    <SelectTrigger className="h-9 w-full">
                                        <SelectValue placeholder={rk("contractTypePlaceholder")} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">{rk("contractTypePlaceholder")}</SelectItem>
                                        {CONTRACT_REGISTRY_TYPE_VALUES.map((value) => (
                                            <SelectItem key={value} value={value}>
                                                {rk(`contractType.${value}`)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </ContractsHubFilterField>

                            <ContractsHubFilterField label={rk("statusLabel")}>
                                <Select value={status || "all"} onValueChange={(v) => setStatus(v === "all" ? "" : v)}>
                                    <SelectTrigger className="h-9 w-full">
                                        <SelectValue placeholder={rk("statusPlaceholder")} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">{rk("statusPlaceholder")}</SelectItem>
                                        {CONTRACT_REGISTRY_STATUS_VALUES.map((value) => (
                                            <SelectItem key={value} value={value}>
                                                {rk(`status.${value}`)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </ContractsHubFilterField>

                            <ContractsHubFilterField label={rk("signatureDateLabel")} className="min-w-[15rem] flex-[1.4] sm:max-w-[18rem]">
                                <div className="grid grid-cols-2 gap-2">
                                    <DateInput
                                        valueFormat="yyyy-MM-dd"
                                        value={signatureDateFrom}
                                        onChange={setSignatureDateFrom}
                                        className="h-9"
                                        placeholder={rk("signatureDateFromLabel")}
                                    />
                                    <DateInput
                                        valueFormat="yyyy-MM-dd"
                                        value={signatureDateTo}
                                        onChange={setSignatureDateTo}
                                        className="h-9"
                                        placeholder={rk("signatureDateToLabel")}
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
                                    <TableHead>{rk("columns.contractNumber")}</TableHead>
                                    <TableHead>{rk("columns.client")}</TableHead>
                                    <TableHead>{rk("columns.project")}</TableHead>
                                    <TableHead>{rk("columns.unit")}</TableHead>
                                    <TableHead>{rk("columns.contractType")}</TableHead>
                                    <TableHead>{rk("columns.status")}</TableHead>
                                    <TableHead>{rk("columns.signatureDate")}</TableHead>
                                    <TableHead>{rk("columns.uploadDate")}</TableHead>
                                    <TableHead>{rk("columns.agent")}</TableHead>
                                    <TableHead>{rk("columns.paymentStatus")}</TableHead>
                                    <TableHead className="text-right">{rk("columns.actions")}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {rows.map((row) => (
                                    <TableRow key={row._id}>
                                        <TableCell className="font-medium whitespace-nowrap">{row.contractNumber ?? "—"}</TableCell>
                                        <TableCell>{personName(row.client)}</TableCell>
                                        <TableCell>{row.project?.name ?? "—"}</TableCell>
                                        <TableCell>{unitLabel(row.unit)}</TableCell>
                                        <TableCell>
                                            <Badge variant={contractTypeBadgeVariant(row.contractType)}>
                                                {rk(`contractType.${row.contractType}`)}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={contractStatusBadgeVariant(row.status)}>
                                                {rk(`status.${row.status}`)}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap">{fmtDate(row.signatureDate, timezone)}</TableCell>
                                        <TableCell className="whitespace-nowrap">{fmtDateTime(row.uploadDate, timezone)}</TableCell>
                                        <TableCell>{personName(row.agent)}</TableCell>
                                        <TableCell>
                                            <Badge variant={paymentStatusBadgeVariant(row.paymentStatus)}>
                                                {rk(`paymentStatus.${row.paymentStatus}`)}
                                            </Badge>
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
                        {paginationSummary(resolveLanguageKey, "contracts", page, PAGE_SIZE, total)}
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

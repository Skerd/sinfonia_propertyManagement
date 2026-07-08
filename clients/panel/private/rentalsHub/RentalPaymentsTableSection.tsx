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
import type {RentalPaymentRegistryRow} from "armonia/src/modules/propertyManagement/api/realEstate/private/rentalsHub/rentalsHub.payment.dto.ts";
import type {RentalPaymentsListFormType} from "armonia/src/modules/propertyManagement/api/realEstate/private/rentalsHub/rentalsHub.form.type.ts";
import type {RentalPaymentsListResponseType} from "armonia/src/modules/propertyManagement/api/realEstate/private/rentalsHub/rentalsHub.response.type.ts";
import {RENTAL_PAYMENT_REGISTRY_STATUS_VALUES} from "armonia/src/modules/propertyManagement/api/realEstate/private/rentalsHub/rentalsHub.constants.ts";
import {
    fmtDate,
    fmtMoney,
    paginationSummary,
    paymentStatusBadgeVariant,
    personName,
    unitLabel,
} from "./rentalsHubHelpers.ts";
import {RentalsHubFilterField, RentalsHubFilterToolbar} from "./RentalsHubFilterField.tsx";

const PAGE_SIZE = 10;

type RentalPaymentsTableSectionProps = {
    resolveLanguageKey: ResolveLanguageKey;
    timezone?: string;
    onViewRow: (row: RentalPaymentRegistryRow) => void;
};

export default function RentalPaymentsTableSection({
    resolveLanguageKey,
    timezone,
    onViewRow,
}: RentalPaymentsTableSectionProps) {
    const rk = (key: string) => String(resolveLanguageKey(`rentalPayments.${key}`));

    const [searchInput, setSearchInput] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [projectId, setProjectId] = useState("");
    const [status, setStatus] = useState("");
    const [dueDateFrom, setDueDateFrom] = useState("");
    const [dueDateTo, setDueDateTo] = useState("");
    const [page, setPage] = useState(1);

    const [data, setData] = useState<RentalPaymentsListResponseType | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<HttpError | null>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        const body: RentalPaymentsListFormType = {page, limit: PAGE_SIZE};
        if (debouncedSearch.trim()) body.search = debouncedSearch.trim();
        if (projectId) body.projectId = projectId;
        if (status) body.status = status as RentalPaymentsListFormType["status"];
        if (dueDateFrom) body.dueDateFrom = dueDateFrom;
        if (dueDateTo) body.dueDateTo = dueDateTo;

        try {
            const res = await apiClient.post<RentalPaymentsListResponseType>(
                "/api/realEstate/rentalsHub/rentalPayments/list",
                body,
            );
            setData(res.data);
        } catch (err) {
            setError(err as HttpError);
            setData(null);
        } finally {
            setLoading(false);
        }
    }, [page, projectId, debouncedSearch, dueDateFrom, dueDateTo, status]);

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(searchInput), 300);
        return () => clearTimeout(timer);
    }, [searchInput]);

    useEffect(() => {
        void fetchData();
    }, [fetchData]);

    useEffect(() => {
        setPage(1);
    }, [debouncedSearch, projectId, status, dueDateFrom, dueDateTo]);

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
                <RentalsHubFilterToolbar>
                    <div className="space-y-3">
                        <div className="flex flex-col gap-1.5">
                            <Label className="text-xs font-medium text-muted-foreground">{rk("searchLabel")}</Label>
                            <Input
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                placeholder={rk("searchPlaceholder")}
                            />
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <RentalsHubFilterField label={rk("projectLabel")}>
                                <ApiSelect
                                    apiUrl="/api/realEstate/project/select"
                                    method="POST"
                                    placeholder={rk("projectPlaceholder")}
                                    value={projectId}
                                    onValueChange={(v: string | string[]) => setProjectId(typeof v === "string" ? v : "")}
                                    className="h-9 w-full"
                                    resolveLanguageKey={resolveLanguageKey}
                                />
                            </RentalsHubFilterField>
                            <RentalsHubFilterField label={rk("statusLabel")}>
                                <Select value={status || "__all__"} onValueChange={(v) => setStatus(v === "__all__" ? "" : v)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder={rk("statusPlaceholder")} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="__all__">{rk("statusPlaceholder")}</SelectItem>
                                        {RENTAL_PAYMENT_REGISTRY_STATUS_VALUES.map((s) => (
                                            <SelectItem key={s} value={s}>{rk(`status.${s}`)}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </RentalsHubFilterField>
                            <RentalsHubFilterField label={rk("dueDateLabel")} className="min-w-[15rem] flex-[1.4]">
                                <div className="flex gap-2">
                                    <DateInput
                                        valueFormat="yyyy-MM-dd"
                                        value={dueDateFrom}
                                        onChange={setDueDateFrom}
                                        className="h-9"
                                        placeholder={rk("dateFromLabel")}
                                    />
                                    <DateInput
                                        valueFormat="yyyy-MM-dd"
                                        value={dueDateTo}
                                        onChange={setDueDateTo}
                                        className="h-9"
                                        placeholder={rk("dateToLabel")}
                                    />
                                </div>
                            </RentalsHubFilterField>
                        </div>
                    </div>
                </RentalsHubFilterToolbar>

                {loading && (
                    <div className="p-8 flex justify-center"><Loader /></div>
                )}
                {!loading && error && (
                    <div className="p-4">
                        <ErrorView
                            title={rk("errorTitle")}
                            description={rk("errorDescription")}
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
                                    <TableHead>{rk("columns.reference")}</TableHead>
                                    <TableHead>{rk("columns.lease")}</TableHead>
                                    <TableHead>{rk("columns.tenant")}</TableHead>
                                    <TableHead>{rk("columns.unit")}</TableHead>
                                    <TableHead>{rk("columns.status")}</TableHead>
                                    <TableHead>{rk("columns.dueDate")}</TableHead>
                                    <TableHead>{rk("columns.amount")}</TableHead>
                                    <TableHead className="text-right">{rk("columns.actions")}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {rows.map((row) => (
                                    <TableRow key={row._id}>
                                        <TableCell className="font-medium whitespace-nowrap">{row.name ?? "—"}</TableCell>
                                        <TableCell>{row.lease?.name ?? "—"}</TableCell>
                                        <TableCell>{personName(row.tenant)}</TableCell>
                                        <TableCell>{unitLabel(row.unit)}</TableCell>
                                        <TableCell>
                                            <Badge variant={paymentStatusBadgeVariant(row.status)}>
                                                {rk(`status.${row.status}`)}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap">{fmtDate(row.dueDate, timezone)}</TableCell>
                                        <TableCell className="whitespace-nowrap">
                                            {fmtMoney(row.amount, row.currency?.symbol)}
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
                        {paginationSummary(resolveLanguageKey, "rentalPayments", page, PAGE_SIZE, total)}
                    </span>
                    <div className="flex items-center gap-2">
                        <Button type="button" variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                            {rk("previous")}
                        </Button>
                        <Button type="button" variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
                            {rk("next")}
                        </Button>
                    </div>
                </div>
            )}
        </section>
    );
}

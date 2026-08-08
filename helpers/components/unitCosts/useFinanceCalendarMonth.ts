import { useCallback, useEffect, useState } from "react";
import type { TableResponse } from "armonia/src/modules/core/types/shared.types.ts";
import type { UnitCost } from "armonia/src/modules/propertyManagement/api/realEstate/private/unit/unitCost/unitCost.dto.ts";
import apiClient from "@coreModule/helpers/axiosClients/apiClient.ts";
import { buildFinanceCalendarFetchFilter } from "@propertyManagementModule/helpers/components/unitCosts/financeFilterDsl.ts";

const PAGE_LIMIT = 200;
/** Hard cap to avoid unbounded memory; UI shows a warning when results are truncated. */
export const FINANCE_CALENDAR_MAX_ROWS = 5000;

export type FinanceCalendarFetchOptions = {
    project?: string;
    edifice?: string;
    floor?: string;
    unit?: string;
    verificationStatus?: string;
    paymentStatus?: string;
    vendorContains?: string;
    purchasePersonId?: string;
};

function toYmd(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function monthRangeYmd(month: Date): { start: string; end: string } {
    const start = new Date(month.getFullYear(), month.getMonth(), 1);
    const end = new Date(month.getFullYear(), month.getMonth() + 1, 0);
    return { start: toYmd(start), end: toYmd(end) };
}

export function useFinanceCalendarMonth(month: Date, options: FinanceCalendarFetchOptions = {}) {
    const y = month.getFullYear();
    const mo = month.getMonth();
    const { project, edifice, floor, unit, verificationStatus, paymentStatus, vendorContains, purchasePersonId } = options;

    const [rows, setRows] = useState<UnitCost[]>([]);
    const [total, setTotal] = useState<number>(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<unknown>(null);
    const [truncated, setTruncated] = useState(false);

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        setTruncated(false);
        const { start, end } = monthRangeYmd(new Date(y, mo, 1));
        const filter = buildFinanceCalendarFetchFilter(start, end, {
            vendorContains,
            purchasePersonId,
        });
        const collected: UnitCost[] = [];
        let offset = 0;
        let serverTotal = 0;
        try {
            while (offset < FINANCE_CALENDAR_MAX_ROWS) {
                const body: Record<string, unknown> = {
                    offset,
                    limit: PAGE_LIMIT,
                    sortBy: "paymentDate",
                    sortOrder: "asc",
                    filter,
                };
                if (unit) {
                    body.unit = unit;
                } else {
                    if (project) body.project = project;
                    if (edifice) body.edifice = edifice;
                    if (floor) body.floor = floor;
                }
                if (verificationStatus) body.verificationStatus = verificationStatus;
                if (paymentStatus) body.paymentStatus = paymentStatus;

                const { data } = await apiClient.post<TableResponse<UnitCost>>("/api/realEstate/unit/cost", body);
                serverTotal = data.total;
                collected.push(...data.data);
                offset += data.data.length;
                if (
                    data.data.length < PAGE_LIMIT ||
                    collected.length >= serverTotal ||
                    collected.length >= FINANCE_CALENDAR_MAX_ROWS
                ) {
                    break;
                }
            }
            setTotal(serverTotal);
            setRows(collected);
            setTruncated(serverTotal > collected.length && collected.length >= FINANCE_CALENDAR_MAX_ROWS);
        } catch (e) {
            setError(e);
            setRows([]);
            setTotal(0);
        } finally {
            setLoading(false);
        }
    }, [y, mo, project, edifice, floor, unit, verificationStatus, paymentStatus, vendorContains, purchasePersonId]);

    useEffect(() => {
        load();
    }, [load]);

    return { rows, total, loading, error, truncated };
}

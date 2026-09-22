import type {ResolveLanguageKey} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {Button} from "@coreModule/components/ui/button.tsx";
import {Skeleton} from "@coreModule/components/ui/skeleton.tsx";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@coreModule/components/ui/table/table.tsx";
import type {PaymentsHubPeriodRow} from "armonia/src/modules/propertyManagement/api/realEstate/private/paymentsHub/paymentsHub.dto.ts";
import type {PaymentsSummaryResponseType} from "armonia/src/modules/propertyManagement/api/realEstate/private/paymentsHub/paymentsHub.response.type.ts";
import type {PaymentsHubGroupBy} from "armonia/src/modules/propertyManagement/api/realEstate/private/paymentsHub/paymentsHub.constants.ts";
import {formatRevenueByCurrencyLines} from "@propertyManagementModule/helpers/rentals/formatRevenueByCurrency.ts";
import {periodLabel} from "./paymentsHubHelpers.ts";

const GROUP_OPTIONS = ["none", "day", "week", "month"] as const;

type PaymentsPeriodTotalsProps = {
    resolveLanguageKey: ResolveLanguageKey;
    locale: string;
    groupBy: PaymentsHubGroupBy | "none";
    onGroupByChange: (groupBy: PaymentsHubGroupBy | "none") => void;
    summary: PaymentsSummaryResponseType | null;
    loading: boolean;
    onSelectPeriod: (period: PaymentsHubPeriodRow) => void;
};

/**
 * Totals per day, week or month for the current filters — the quick answer to
 * "how much is waiting in the coming weeks", without opening a single sale.
 */
export default function PaymentsPeriodTotals({
    resolveLanguageKey,
    locale,
    groupBy,
    onGroupByChange,
    summary,
    loading,
    onSelectPeriod,
}: PaymentsPeriodTotalsProps) {
    const rk = (key: string) => String(resolveLanguageKey(`periods.${key}`));
    const periods = summary?.periods ?? [];

    return (
        <div className="flex flex-col gap-y-3">
            <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground">{rk("groupByLabel")}</span>
                {GROUP_OPTIONS.map((option) => (
                    <Button
                        key={option}
                        type="button"
                        size="sm"
                        variant={groupBy === option ? "default" : "outline"}
                        onClick={() => onGroupByChange(option)}
                    >
                        {rk(`groupBy.${option}`)}
                    </Button>
                ))}
            </div>

            {groupBy !== "none" && (
                <div className="rounded-lg border overflow-hidden">
                    {loading ? (
                        <div className="flex flex-col gap-y-2 p-4">
                            <Skeleton className="h-6 w-full" />
                            <Skeleton className="h-6 w-full" />
                        </div>
                    ) : periods.length === 0 ? (
                        <div className="p-6 text-center text-sm text-muted-foreground">{rk("noPeriods")}</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>{rk("columns.period")}</TableHead>
                                        <TableHead className="text-right">{rk("columns.count")}</TableHead>
                                        <TableHead className="text-right">{rk("columns.expected")}</TableHead>
                                        <TableHead className="text-right">{rk("columns.paid")}</TableHead>
                                        <TableHead className="text-right">{rk("columns.outstanding")}</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {periods.map((period) => (
                                        <TableRow key={period.periodStart}>
                                            <TableCell>
                                                <button
                                                    type="button"
                                                    className="cursor-pointer font-medium underline-offset-4 hover:underline"
                                                    onClick={() => onSelectPeriod(period)}
                                                >
                                                    {periodLabel(
                                                        period.periodStart,
                                                        period.periodEnd,
                                                        groupBy,
                                                        locale,
                                                    )}
                                                </button>
                                            </TableCell>
                                            <TableCell className="text-right tabular-nums">{period.count}</TableCell>
                                            <TableCell className="text-right tabular-nums">
                                                {formatRevenueByCurrencyLines(period.expectedAmount, locale)}
                                            </TableCell>
                                            <TableCell className="text-right tabular-nums">
                                                {formatRevenueByCurrencyLines(period.paidAmount, locale)}
                                            </TableCell>
                                            <TableCell className="text-right tabular-nums">
                                                {formatRevenueByCurrencyLines(period.outstandingAmount, locale)}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

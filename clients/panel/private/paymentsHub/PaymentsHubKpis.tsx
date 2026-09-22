import {AlertTriangle, CalendarClock, CalendarRange, CheckCircle2} from "lucide-react";
import type {ResolveLanguageKey} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {Card, CardContent, CardHeader, CardTitle} from "@coreModule/components/ui/card.tsx";
import {Skeleton} from "@coreModule/components/ui/skeleton.tsx";
import type {PaymentsSummaryResponseType} from "armonia/src/modules/propertyManagement/api/realEstate/private/paymentsHub/paymentsHub.response.type.ts";
import {formatRevenueByCurrencyLines} from "@propertyManagementModule/helpers/rentals/formatRevenueByCurrency.ts";

type PaymentsHubKpisProps = {
    resolveLanguageKey: ResolveLanguageKey;
    locale: string;
    summary: PaymentsSummaryResponseType | null;
    loading: boolean;
};

/**
 * The page's headline question: what is late, what lands in the next days and
 * weeks, and what has come in this month. Windows are fixed, so these tiles ignore
 * the date range in the filters.
 */
export default function PaymentsHubKpis({
    resolveLanguageKey,
    locale,
    summary,
    loading,
}: PaymentsHubKpisProps) {
    const rk = (key: string) => String(resolveLanguageKey(`kpis.${key}`));

    if (loading) {
        return (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <Skeleton className="h-24 rounded-xl" />
                <Skeleton className="h-24 rounded-xl" />
                <Skeleton className="h-24 rounded-xl" />
                <Skeleton className="h-24 rounded-xl" />
            </div>
        );
    }

    const tiles = [
        {
            key: "overdue",
            title: rk("overdue"),
            icon: <AlertTriangle className="size-4 text-destructive" />,
            value: summary?.kpis.overdueAmount,
        },
        {
            key: "next7",
            title: rk("dueNext7Days"),
            icon: <CalendarClock className="size-4 text-warning" />,
            value: summary?.kpis.dueNext7DaysAmount,
        },
        {
            key: "next30",
            title: rk("dueNext30Days"),
            icon: <CalendarRange className="size-4 text-muted-foreground" />,
            value: summary?.kpis.dueNext30DaysAmount,
        },
        {
            key: "collected",
            title: rk("collectedThisMonth"),
            icon: <CheckCircle2 className="size-4 text-success" />,
            value: summary?.kpis.collectedThisMonthAmount,
        },
    ];

    return (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {tiles.map((tile) => (
                <Card key={tile.key}>
                    <CardHeader className="flex flex-row items-center justify-between gap-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{tile.title}</CardTitle>
                        {tile.icon}
                    </CardHeader>
                    <CardContent>
                        <p className="text-lg font-semibold tabular-nums">
                            {formatRevenueByCurrencyLines(tile.value, locale)}
                        </p>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

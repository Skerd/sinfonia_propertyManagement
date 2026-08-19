import {compose} from "redux";
import {GRID_KPI} from "@coreModule/components/custom/cards/entityCard.constants.ts";
import {useEffect} from "react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import withAxios, {WithAxiosType} from "@coreModule/helpers/hocs/withAxios.tsx";
import type {CostControlResponse} from "armonia/src/modules/propertyManagement/api/realEstate/private/costControl/costControl.response.type.ts";
import Header from "@coreModule/components/custom/header.tsx";
import Loader from "@coreModule/components/custom/loader.tsx";
import {ErrorView} from "@coreModule/components/custom/errorView.tsx";
import {KpiCard} from "@coreModule/components/custom/kpiCard.tsx";
import {Wallet, Receipt, CircleDollarSign, Layers, BadgeCheck, Banknote} from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@coreModule/components/ui/table/table.tsx";

type Props = WithLanguageType & WithAxiosType<CostControlResponse, {projectId?: string}> & {
    projectId?: string;
};

function fmt(n?: number): string {
    return (n ?? 0).toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 2});
}

function CostControl({resolveLanguageKey, data, loading, error, onFilterChange, projectId}: Props) {
    useEffect(() => {
        if (projectId) onFilterChange({projectId});
    }, [projectId]);

    if (!projectId) {
        return (
            <section className="border rounded-lg p-8 text-center text-muted-foreground text-sm bg-card m-4">
                <p className="font-medium text-foreground">{resolveLanguageKey("noProjectTitle")}</p>
                <p className="mt-2">{resolveLanguageKey("noProjectDescription")}</p>
            </section>
        );
    }
    if (loading && !data) return <Loader/>;
    if (error) {
        return <ErrorView title={resolveLanguageKey("failTitle")} description={resolveLanguageKey("failDescription")} onClick={() => onFilterChange({projectId})} />;
    }
    if (!data) return null;

    const kpis = [
        {key: "estimated", labelKey: "estimated", icon: Layers, variant: "primary" as const},
        {key: "committed", labelKey: "committed", icon: Wallet},
        {key: "invoiced", labelKey: "invoiced", icon: Receipt},
        {key: "certified", labelKey: "certified", icon: BadgeCheck},
        {key: "paid", labelKey: "paid", icon: Banknote, variant: "success" as const},
        {key: "variance", labelKey: "variance", icon: CircleDollarSign, variant: "warning" as const},
    ];

    return (
        <div className="flex-full gap-4">
            <Header title={`${resolveLanguageKey("title")}${data.projectName ? ` — ${data.projectName}` : ""}`} description={resolveLanguageKey("description")}>
                <p className="text-muted-foreground text-xs whitespace-nowrap">
                    {resolveLanguageKey("computedAt")} {new Date(data.computedAt).toLocaleString()}
                </p>
            </Header>

            <div className={GRID_KPI}>
                {kpis.map(k => (
                    <KpiCard key={k.key} title={resolveLanguageKey(k.labelKey)} value={fmt((data.totals as any)[k.key])} icon={k.icon} variant={(k as any).variant} compact />
                ))}
            </div>

            {data.rows.length === 0 ? (
                <section className="border rounded-lg p-8 text-center text-muted-foreground text-sm bg-card">
                    <p className="font-medium text-foreground">{resolveLanguageKey("noRowsTitle")}</p>
                    <p className="mt-2">{resolveLanguageKey("noRowsDescription")}</p>
                </section>
            ) : (
                <section className="border rounded-lg overflow-hidden bg-card">
                    <div className="border-b bg-muted/40 px-4 py-3"><h2 className="font-semibold text-sm">{resolveLanguageKey("byBkpTitle")}</h2></div>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>{resolveLanguageKey("bkpCode")}</TableHead>
                                    <TableHead>{resolveLanguageKey("titleCol")}</TableHead>
                                    <TableHead className="text-right whitespace-nowrap">{resolveLanguageKey("estimated")}</TableHead>
                                    <TableHead className="text-right whitespace-nowrap">{resolveLanguageKey("invoiced")}</TableHead>
                                    <TableHead className="text-right whitespace-nowrap">{resolveLanguageKey("paid")}</TableHead>
                                    <TableHead className="text-right whitespace-nowrap">{resolveLanguageKey("variance")}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.rows.map((row) => (
                                    <TableRow key={row.bkpCode}>
                                        <TableCell className="font-medium whitespace-nowrap">{row.bkpCode}</TableCell>
                                        <TableCell className="whitespace-nowrap">{row.title ?? "—"}</TableCell>
                                        <TableCell className="text-right whitespace-nowrap">{fmt(row.estimated)}</TableCell>
                                        <TableCell className="text-right whitespace-nowrap">{fmt(row.invoiced)}</TableCell>
                                        <TableCell className="text-right whitespace-nowrap">{fmt(row.paid)}</TableCell>
                                        <TableCell className={`text-right whitespace-nowrap ${row.variance < 0 ? "text-warning font-medium" : ""}`}>{fmt(row.variance)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </section>
            )}
        </div>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/costControl/costControl.tsx"),
    withAxios(
        {url: "/api/realEstate/costControl", method: "post", data: {}},
        false,
    ),
    withDebug(true, true, ["budgets", "costCommitments"]),
)(CostControl);

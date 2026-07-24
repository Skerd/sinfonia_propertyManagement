import {compose} from "redux";
import {useEffect, useState} from "react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import withAxios, {WithAxiosType} from "@coreModule/helpers/hocs/withAxios.tsx";
import type {EstimateComparisonResponse} from "armonia/src/modules/propertyManagement/api/realEstate/private/estimateComparison/estimateComparison.response.type.ts";
import Header from "@coreModule/components/custom/header.tsx";
import Loader from "@coreModule/components/custom/loader.tsx";
import {ErrorView} from "@coreModule/components/custom/errorView.tsx";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@coreModule/components/ui/table/table.tsx";

type Props = WithLanguageType & WithAxiosType<EstimateComparisonResponse, {standard?: string}>;

const STANDARDS = ["ebkp_h", "ebkp_bau", "bkp", "npk", "custom"] as const;

function fmt(n: number): string {
    return (n ?? 0).toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 2});
}

function EstimateComparison({resolveLanguageKey, data, loading, error, onFilterChange}: Props) {
    const [standard, setStandard] = useState<string>("ebkp_h");

    useEffect(() => {
        onFilterChange({standard});
    }, [standard]);

    if (loading && !data) return <Loader/>;

    if (error) {
        return (
            <ErrorView
                title={resolveLanguageKey("failTitle")}
                description={resolveLanguageKey("failDescription")}
                onClick={() => onFilterChange({standard})}
            />
        );
    }

    return (
        <div className="flex-full gap-4">
            <Header title={resolveLanguageKey("title")} description={resolveLanguageKey("description")}>
                <div className="flex items-center gap-3">
                    <label className="text-xs text-muted-foreground whitespace-nowrap">
                        {resolveLanguageKey("standardLabel")}
                    </label>
                    <select
                        className="border rounded-md bg-background px-2 py-1 text-sm"
                        value={standard}
                        onChange={(e) => setStandard(e.target.value)}
                    >
                        {STANDARDS.map((s) => (
                            <option key={s} value={s}>{resolveLanguageKey(`standards.${s}`)}</option>
                        ))}
                    </select>
                    {data && (
                        <p className="text-muted-foreground text-xs whitespace-nowrap">
                            {resolveLanguageKey("computedAt")} {new Date(data.computedAt).toLocaleString()}
                        </p>
                    )}
                </div>
            </Header>

            {!data || data.rowCount === 0 ? (
                <section className="border rounded-lg p-8 text-center text-muted-foreground text-sm bg-card">
                    <p className="font-medium text-foreground">{resolveLanguageKey("noDataTitle")}</p>
                    <p className="mt-2">{resolveLanguageKey("noDataDescription")}</p>
                </section>
            ) : (
                <div className="flex-full gap-6">
                    {data.rows.map((row) => (
                        <section key={row.code} className="border rounded-lg overflow-hidden bg-card">
                            <div className="border-b bg-muted/40 px-4 py-3 flex flex-wrap items-baseline justify-between gap-2">
                                <h2 className="font-semibold text-sm">
                                    {row.code}{row.title ? ` — ${row.title}` : ""}
                                    {row.unitOfMeasure ? <span className="text-muted-foreground font-normal"> ({row.unitOfMeasure})</span> : null}
                                </h2>
                                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                                    <span>{resolveLanguageKey("occurrences")}: <b className="text-foreground">{row.occurrences}</b></span>
                                    <span>{resolveLanguageKey("min")}: <b className="text-foreground">{fmt(row.plannedAmountMin)}</b></span>
                                    <span>{resolveLanguageKey("avg")}: <b className="text-foreground">{fmt(row.plannedAmountAvg)}</b></span>
                                    <span>{resolveLanguageKey("max")}: <b className="text-foreground">{fmt(row.plannedAmountMax)}</b></span>
                                    <span>{resolveLanguageKey("total")}: <b className="text-foreground">{fmt(row.plannedAmountTotal)}</b></span>
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>{resolveLanguageKey("project")}</TableHead>
                                            <TableHead>{resolveLanguageKey("budget")}</TableHead>
                                            <TableHead>{resolveLanguageKey("edifice")}</TableHead>
                                            <TableHead className="text-right whitespace-nowrap">{resolveLanguageKey("plannedQty")}</TableHead>
                                            <TableHead className="text-right whitespace-nowrap">{resolveLanguageKey("plannedAmount")}</TableHead>
                                            <TableHead className="text-right whitespace-nowrap">{resolveLanguageKey("actualAmount")}</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {row.entries.map((entry, i) => (
                                            <TableRow key={`${entry.budgetId}-${entry.edificeId ?? ""}-${i}`}>
                                                <TableCell className="font-medium whitespace-nowrap">{entry.projectName || "—"}</TableCell>
                                                <TableCell className="whitespace-nowrap">{entry.budgetTitle || entry.budgetName || "—"}</TableCell>
                                                <TableCell className="whitespace-nowrap">{entry.edificeName || "—"}</TableCell>
                                                <TableCell className="text-right whitespace-nowrap">{fmt(entry.plannedQty)}</TableCell>
                                                <TableCell className="text-right whitespace-nowrap">{fmt(entry.plannedAmount)}</TableCell>
                                                <TableCell className="text-right whitespace-nowrap">{fmt(entry.actualAmount)}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </section>
                    ))}
                </div>
            )}
        </div>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/estimateComparison/estimateComparison.tsx"),
    withAxios(
        {
            url: "/api/realEstate/estimateComparison",
            method: "post",
            data: {standard: "ebkp_h"},
        },
        true,
    ),
    withDebug(true, true),
)(EstimateComparison);

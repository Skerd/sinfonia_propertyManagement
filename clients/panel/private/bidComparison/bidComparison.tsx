import {compose} from "redux";
import {useEffect} from "react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import withAxios, {WithAxiosType} from "@coreModule/helpers/hocs/withAxios.tsx";
import type {BidComparisonResponse} from "armonia/src/modules/propertyManagement/api/realEstate/private/bidComparison/bidComparison.response.type.ts";
import Header from "@coreModule/components/custom/header.tsx";
import Loader from "@coreModule/components/custom/loader.tsx";
import {ErrorView} from "@coreModule/components/custom/errorView.tsx";
import {Badge} from "@coreModule/components/ui/badge.tsx";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@coreModule/components/ui/table/table.tsx";

type Props = WithLanguageType & WithAxiosType<BidComparisonResponse, {tenderId?: string}> & {
    tenderId?: string;
};

function fmt(n?: number): string {
    return (n ?? 0).toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 2});
}

function BidComparison({resolveLanguageKey, data, loading, error, onFilterChange, tenderId}: Props) {
    useEffect(() => {
        if (tenderId) onFilterChange({tenderId});
    }, [tenderId]);

    if (!tenderId) {
        return (
            <section className="border rounded-lg p-8 text-center text-muted-foreground text-sm bg-card m-4">
                <p className="font-medium text-foreground">{resolveLanguageKey("noTenderTitle")}</p>
                <p className="mt-2">{resolveLanguageKey("noTenderDescription")}</p>
            </section>
        );
    }
    if (loading && !data) return <Loader/>;
    if (error) {
        return (
            <ErrorView
                title={resolveLanguageKey("failTitle")}
                description={resolveLanguageKey("failDescription")}
                onClick={() => onFilterChange({tenderId})}
            />
        );
    }
    if (!data) return null;

    return (
        <div className="flex-full gap-4">
            <Header title={`${resolveLanguageKey("title")}${data.tenderTitle ? ` — ${data.tenderTitle}` : ""}`} description={resolveLanguageKey("description")}>
                <p className="text-muted-foreground text-xs whitespace-nowrap">
                    {resolveLanguageKey("computedAt")} {new Date(data.computedAt).toLocaleString()}
                </p>
            </Header>

            {data.rows.length === 0 ? (
                <section className="border rounded-lg p-8 text-center text-muted-foreground text-sm bg-card">
                    <p className="font-medium text-foreground">{resolveLanguageKey("noBidsTitle")}</p>
                    <p className="mt-2">{resolveLanguageKey("noBidsDescription")}</p>
                </section>
            ) : (
                <section className="border rounded-lg overflow-hidden bg-card">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>{resolveLanguageKey("contractor")}</TableHead>
                                    <TableHead className="text-right whitespace-nowrap">{resolveLanguageKey("total")}</TableHead>
                                    <TableHead className="text-right whitespace-nowrap">{resolveLanguageKey("completeness")}</TableHead>
                                    <TableHead className="text-right whitespace-nowrap">{resolveLanguageKey("priceScore")}</TableHead>
                                    <TableHead className="text-right whitespace-nowrap">{resolveLanguageKey("qualityScore")}</TableHead>
                                    <TableHead className="text-right whitespace-nowrap">{resolveLanguageKey("overallScore")}</TableHead>
                                    <TableHead>{resolveLanguageKey("status")}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.rows.map((row) => (
                                    <TableRow key={row.bidId} className={row.recommended ? "bg-success/10 dark:bg-success/30" : ""}>
                                        <TableCell className="font-medium whitespace-nowrap">
                                            {row.constructorName || row.bidName || "—"}
                                            {row.recommended ? <Badge variant="secondary" className="ml-2 text-xs">{resolveLanguageKey("recommended")}</Badge> : null}
                                        </TableCell>
                                        <TableCell className="text-right whitespace-nowrap">{fmt(row.total)} {row.currencyAbbr ?? ""}</TableCell>
                                        <TableCell className="text-right whitespace-nowrap">{row.linesPriced}/{row.linesTotal} ({fmt(row.completenessScore)}%)</TableCell>
                                        <TableCell className="text-right whitespace-nowrap">{fmt(row.priceScore)}</TableCell>
                                        <TableCell className="text-right whitespace-nowrap">{fmt(row.qualityScore)}</TableCell>
                                        <TableCell className="text-right whitespace-nowrap font-semibold">{fmt(row.overallScore)}</TableCell>
                                        <TableCell className="whitespace-nowrap">{row.status}</TableCell>
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
    withLanguage("src/modules/propertyManagement/clients/panel/private/bidComparison/bidComparison.tsx"),
    withAxios(
        {
            url: "/api/realEstate/bidComparison",
            method: "post",
            data: {},
        },
        false,
    ),
    withDebug(true, true, ["bids", "bidlines"]),
)(BidComparison);

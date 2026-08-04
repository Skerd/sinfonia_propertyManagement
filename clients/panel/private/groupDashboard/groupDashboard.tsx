import {compose} from "redux";
import {GRID_KPI} from "@coreModule/components/custom/cards/entityCard.constants.ts";
import {useEffect} from "react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import withAxios, {WithAxiosType} from "@coreModule/helpers/hocs/withAxios.tsx";
import type {BranchKpi, GroupDashboardResponse} from "armonia/src/modules/propertyManagement/api/realEstate/private/groupDashboard/groupDashboard.response.type.ts";
import Header from "@coreModule/components/custom/header.tsx";
import Loader from "@coreModule/components/custom/loader.tsx";
import {ErrorView} from "@coreModule/components/custom/errorView.tsx";
import {KpiCard} from "@coreModule/components/custom/kpiCard.tsx";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@coreModule/components/ui/table/table.tsx";
import {
    Building2,
    CircleDollarSign,
    ClipboardList,
    Home,
    KeyRound,
    Layers,
    ShoppingBag,
    Wallet,
} from "lucide-react";

type GroupDashboardProps = WithLanguageType & WithAxiosType<GroupDashboardResponse, Record<string, never>>;

type KpiKey = keyof Omit<BranchKpi, "companyId" | "companyName">;

const KPI_CONFIG: {key: KpiKey; labelKey: string; icon: typeof Layers; variant?: "default" | "primary" | "success" | "warning" | "danger"}[] = [
    {key: "totalUnits", labelKey: "kpiTotalUnits", icon: Layers, variant: "primary"},
    {key: "availableUnits", labelKey: "kpiAvailableUnits", icon: Home, variant: "success"},
    {key: "soldUnits", labelKey: "kpiSoldUnits", icon: ShoppingBag},
    {key: "rentedUnits", labelKey: "kpiRentedUnits", icon: KeyRound},
    {key: "totalRevenue", labelKey: "kpiRevenue", icon: CircleDollarSign, variant: "primary"},
    {key: "totalCommissions", labelKey: "kpiCommissions", icon: Wallet},
    {key: "activeLeases", labelKey: "kpiActiveLeases", icon: Building2},
    {key: "openSnags", labelKey: "kpiOpenSnags", icon: ClipboardList, variant: "warning"},
];

function fmt(n: number): string {
    return n.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 2});
}

function GroupDashboard({
    resolveLanguageKey,
    data,
    loading,
    error,
    onFilterChange,
}: GroupDashboardProps) {
    useEffect(() => {
        onFilterChange({});
    }, []);

    if (loading && !data) return <Loader/>;

    if (error) {
        return (
            <ErrorView
                title={resolveLanguageKey("failTitle")}
                description={resolveLanguageKey("failDescription")}
                onClick={() => onFilterChange({})}
            />
        );
    }

    if (!data) return null;

    const hasMultipleBranches = data.branches.length > 1;
    const pageTitle = data.groupName
        ? `${data.groupName} — ${resolveLanguageKey("title")}`
        : resolveLanguageKey("title");
    const description = data.isHeadquarters
        ? resolveLanguageKey("hqDescription")
        : resolveLanguageKey("branchDescription");

    return (
        <div className="flex-full gap-4">
            <Header title={pageTitle} description={description}>
                <p className="text-muted-foreground text-xs whitespace-nowrap">
                    {resolveLanguageKey("computedAt")} {new Date(data.computedAt).toLocaleString()}
                </p>
            </Header>

            <section>
                <h2 className="font-semibold mb-3 text-sm uppercase tracking-wide text-muted-foreground">
                    {resolveLanguageKey("groupTotalsTitle")}
                </h2>
                <div className={GRID_KPI}>
                    {KPI_CONFIG.map(col => (
                        <KpiCard
                            key={col.key}
                            title={resolveLanguageKey(col.labelKey)}
                            value={fmt(data.totals[col.key])}
                            icon={col.icon}
                            variant={col.variant}
                            compact
                        />
                    ))}
                </div>
            </section>

            {hasMultipleBranches ? (
                <section className="border rounded-lg overflow-hidden bg-card">
                    <div className="border-b bg-muted/40 px-4 py-3">
                        <h2 className="font-semibold text-sm">{resolveLanguageKey("branchBreakdownTitle")}</h2>
                    </div>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>{resolveLanguageKey("branchColumn")}</TableHead>
                                {KPI_CONFIG.map(col => (
                                    <TableHead key={col.key} className="text-right whitespace-nowrap">
                                        {resolveLanguageKey(col.labelKey)}
                                    </TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.branches.map(branch => (
                                <TableRow key={branch.companyId}>
                                    <TableCell className="font-medium whitespace-nowrap">
                                        {branch.companyName}
                                    </TableCell>
                                    {KPI_CONFIG.map(col => (
                                        <TableCell
                                            key={col.key}
                                            className={`text-right whitespace-nowrap ${
                                                col.key === "openSnags" && branch[col.key] > 0
                                                    ? "text-warning font-medium"
                                                    : ""
                                            }`}
                                        >
                                            {fmt(branch[col.key])}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </section>
            ) : (
                <section className="border rounded-lg p-8 text-center text-muted-foreground text-sm bg-card">
                    <p className="font-medium text-foreground">{resolveLanguageKey("noBranchesTitle")}</p>
                    <p className="mt-2">{resolveLanguageKey("noBranchesDescription")}</p>
                </section>
            )}
        </div>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/groupDashboard/groupDashboard.tsx"),
    withAxios(
        {
            url: "/api/realEstate/groupDashboard",
            method: "post",
            data: {},
        },
        true,
    ),
    withDebug(true, true),
)(GroupDashboard);

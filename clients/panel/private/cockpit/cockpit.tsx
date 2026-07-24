import {compose} from "redux";
import {useEffect} from "react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import withAxios, {WithAxiosType} from "@coreModule/helpers/hocs/withAxios.tsx";
import type {CockpitResponse} from "armonia/src/modules/propertyManagement/api/realEstate/private/cockpit/cockpit.response.type.ts";
import Header from "@coreModule/components/custom/header.tsx";
import Loader from "@coreModule/components/custom/loader.tsx";
import {ErrorView} from "@coreModule/components/custom/errorView.tsx";

type Props = WithLanguageType & WithAxiosType<CockpitResponse, {projectId?: string}> & {
    projectId?: string;
};

const AMPEL: Record<string, string> = {
    green: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-300",
    amber: "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border-amber-300",
    red: "bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300 border-red-300",
};

function Cockpit({resolveLanguageKey, data, loading, error, onFilterChange, projectId}: Props) {
    useEffect(() => {
        onFilterChange(projectId ? {projectId} : {});
    }, [projectId]);

    if (loading && !data) return <Loader/>;
    if (error) {
        return <ErrorView title={resolveLanguageKey("failTitle")} description={resolveLanguageKey("failDescription")} onClick={() => onFilterChange(projectId ? {projectId} : {})} />;
    }
    if (!data) return null;

    return (
        <div className="flex-full gap-4">
            <Header title={resolveLanguageKey("title")} description={resolveLanguageKey(data.scope === "project" ? "projectScope" : "companyScope")}>
                <p className="text-muted-foreground text-xs whitespace-nowrap">
                    {resolveLanguageKey("computedAt")} {new Date(data.computedAt).toLocaleString()}
                </p>
            </Header>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {data.kpis.map((kpi) => (
                    <div key={kpi.key} className={`border rounded-lg p-4 ${AMPEL[kpi.ampel] ?? ""}`}>
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">{resolveLanguageKey(`kpi.${kpi.key}`)}</span>
                            <span className="inline-block h-3 w-3 rounded-full" style={{backgroundColor: kpi.ampel === "green" ? "#10b981" : kpi.ampel === "amber" ? "#f59e0b" : "#ef4444"}} />
                        </div>
                        <div className="mt-2 text-2xl font-semibold">
                            {kpi.value.toLocaleString(undefined, {maximumFractionDigits: 1})}{kpi.unit === "%" ? "%" : ""}
                        </div>
                        <div className="text-xs opacity-70">{resolveLanguageKey(`ampel.${kpi.ampel}`)}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/cockpit/cockpit.tsx"),
    withAxios(
        {url: "/api/realEstate/cockpit", method: "post", data: {}},
        true,
    ),
    withDebug(true, true),
)(Cockpit);

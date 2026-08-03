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
    green: "bg-success/10 text-success dark:bg-success/40 border-success/30",
    amber: "bg-warning/10 text-warning dark:bg-warning/40 border-warning/30",
    red: "bg-destructive/10 text-destructive dark:bg-destructive/40 border-destructive/30",
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
                            <span className="inline-block h-3 w-3 rounded-full" style={{backgroundColor: kpi.ampel === "green" ? "var(--success)" : kpi.ampel === "amber" ? "var(--warning)" : "var(--destructive)"}} />
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

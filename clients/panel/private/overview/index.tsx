import {useEffect, useRef, useState, useMemo} from 'react';
import {compose} from "redux";
import DashboardOverview from "@propertyManagementModule/clients/panel/private/overview/overview";
import Analytics from "@propertyManagementModule/clients/panel/private/overview/analytics";
import ProjectsTab from "@propertyManagementModule/clients/panel/private/overview/projects";
import EdificesTab from "@propertyManagementModule/clients/panel/private/overview/edifices";
import UnitsTab from "@propertyManagementModule/clients/panel/private/overview/units";
import WorkflowsTab from "@propertyManagementModule/clients/panel/private/overview/workflows";
import {DashboardFormResponseType} from "armonia/src/modules/propertyManagement/api/realEstate/private/dashboard/dashboard.form.response.type.ts";
import type { DashboardFormType } from "armonia/src/modules/propertyManagement/api/realEstate/private/dashboard/dashboard.form.type.ts";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import Header from "@coreModule/components/custom/header.tsx";
import {readPageHelp} from "@coreModule/components/custom/pageHelp.tsx";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@coreModule/components/ui/tabs.tsx";
import withAxios, {WithAxiosType} from "@coreModule/helpers/hocs/withAxios.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import type {KpiDrillDownContext} from "@propertyManagementModule/helpers/dashboard/kpiDrillDown.ts";
import {
    buildDashboardFilter,
    DashboardPeriodToolbar,
} from "@propertyManagementModule/components/custom/dashboard/DashboardPeriodToolbar.tsx";
import {useAccessHydrated} from "@coreModule/helpers/context/accessContext.tsx";
import {useAccess} from "@coreModule/helpers/hooks/useAccess.ts";
import Forbidden from "@coreModule/components/custom/pages/forbidden.tsx";
import Loader from "@coreModule/components/custom/loader/loader.tsx";
import {hasAnyAccessRead} from "@propertyManagementModule/helpers/access/aggregationAccess.ts";

type DashboardProps = WithLanguageType & WithAxiosType<DashboardFormResponseType, DashboardFormType>

function Dashboard({
    resolveLanguageKey,
    data: dashboardData,
    loading,
    error,
    onFilterChange,
}: DashboardProps) {

    const ref = useRef<HTMLDivElement>(null);
    const [periodKey, setPeriodKey] = useState<string>('last12months');
    const [activeTab, setActiveTab] = useState<string>('overview');
    const accessHydrated = useAccessHydrated();
    const canRead = hasAnyAccessRead([
        useAccess("sales"),
        useAccess("units"),
        useAccess("projects"),
        useAccess("edifices"),
        useAccess("floors"),
        useAccess("reservations"),
        useAccess("paymentplans"),
        useAccess("inspections"),
        useAccess("modificationrequests"),
        useAccess("unitcosts"),
        useAccess("rentalpayments"),
        useAccess("leases"),
    ]);

    useEffect(() => {
        if (accessHydrated === false || !canRead) return;
        onFilterChange(buildDashboardFilter(periodKey));
    }, [accessHydrated, canRead]);

    const handlePeriodChange = (value: string) => {
        setPeriodKey(value);
        if (!canRead) return;
        onFilterChange(buildDashboardFilter(value));
    };

    useEffect(() => {
        if( !!ref && !!ref.current){
            ref.current.scrollTop = 0;
        }
    }, [activeTab]);

    const drillDownContext = useMemo<KpiDrillDownContext>(() => {
        const f = buildDashboardFilter(periodKey);
        return { from: f.from, to: f.to };
    }, [periodKey]);

    const viewEntriesLabel = resolveLanguageKey("viewEntries");
    const tabDrillDownProps = { drillDownContext, viewEntriesLabel };

    if (accessHydrated === false) return <Loader />;
    if (!canRead) return <Forbidden />;

    return (
        <>
            <Header
                title={resolveLanguageKey("title")}
                description={resolveLanguageKey("description")}
                help={readPageHelp(resolveLanguageKey)}
            >
                <DashboardPeriodToolbar
                    periodKey={periodKey}
                    onPeriodChange={handlePeriodChange}
                    onRefresh={() => onFilterChange(buildDashboardFilter(periodKey))}
                    periodLabel={resolveLanguageKey("period")}
                    periodLast7Days={resolveLanguageKey("periodLast7Days")}
                    periodLast30Days={resolveLanguageKey("periodLast30Days")}
                    periodLast3Months={resolveLanguageKey("periodLast3Months")}
                    periodLast12Months={resolveLanguageKey("periodLast12Months")}
                    refreshLabel={resolveLanguageKey("refresh")}
                />
            </Header>

            <Tabs value={activeTab} onValueChange={setActiveTab} orientation='horizontal' className='mt-4 flex flex-col gap-4 flex-full'>
                <div className="flex flex-col gap-4 flex-full">
                    <div className="max-w-full overflow-x-auto min-h-10 shrink-0">
                        <TabsList>
                            <TabsTrigger className="hover:cursor-pointer" value='overview'>{resolveLanguageKey("tabs.overview")}</TabsTrigger>
                            <TabsTrigger className="hover:cursor-pointer" value='analytics'>{resolveLanguageKey("tabs.analytics")}</TabsTrigger>
                            <TabsTrigger className="hover:cursor-pointer" value='projects'>{resolveLanguageKey("tabs.projects")}</TabsTrigger>
                            <TabsTrigger className="hover:cursor-pointer" value='edifices'>{resolveLanguageKey("tabs.edifices")}</TabsTrigger>
                            <TabsTrigger className="hover:cursor-pointer" value='units'>{resolveLanguageKey("tabs.units")}</TabsTrigger>
                            <TabsTrigger className="hover:cursor-pointer" value='workflows'>{resolveLanguageKey("tabs.workflows")}</TabsTrigger>
                        </TabsList>
                    </div>
                    <div className="flex-full" ref={ref}>
                        <TabsContent value='overview'>
                            <DashboardOverview
                                dashboardData={dashboardData}
                                loading={loading}
                                error={error}
                                onRefresh={() => onFilterChange(buildDashboardFilter(periodKey))}
                                {...tabDrillDownProps}
                            />
                        </TabsContent>
                        <TabsContent value='analytics'>
                            <Analytics dashboardData={dashboardData} {...tabDrillDownProps} />
                        </TabsContent>
                        <TabsContent value='projects'>
                            <ProjectsTab
                                dashboardData={dashboardData}
                                loading={loading}
                                error={error}
                                onRefresh={() => onFilterChange(buildDashboardFilter(periodKey))}
                                {...tabDrillDownProps}
                            />
                        </TabsContent>
                        <TabsContent value='edifices'>
                            <EdificesTab
                                dashboardData={dashboardData}
                                loading={loading}
                                error={error}
                                onRefresh={() => onFilterChange(buildDashboardFilter(periodKey))}
                                {...tabDrillDownProps}
                            />
                        </TabsContent>
                        <TabsContent value='units'>
                            <UnitsTab
                                dashboardData={dashboardData}
                                loading={loading}
                                error={error}
                                onRefresh={() => onFilterChange(buildDashboardFilter(periodKey))}
                                {...tabDrillDownProps}
                            />
                        </TabsContent>
                        <TabsContent value='workflows'>
                            <WorkflowsTab
                                dashboardData={dashboardData}
                                loading={loading}
                                error={error}
                                onRefresh={() => onFilterChange(buildDashboardFilter(periodKey))}
                                {...tabDrillDownProps}
                            />
                        </TabsContent>
                    </div>
                </div>
            </Tabs>
        </>
    )
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/overview/index.tsx"),
    withAxios(
        {
            url: "/api/realEstate/dashboard",
            method: "post",
            data: {},
        },
        true
    ),
    withDebug(true, true, ["projects", "units"])
)(Dashboard)

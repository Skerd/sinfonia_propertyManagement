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
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@coreModule/components/ui/tabs.tsx";
import withAxios, {WithAxiosType} from "@coreModule/helpers/hocs/withAxios.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import type {KpiDrillDownContext} from "@propertyManagementModule/helpers/dashboard/kpiDrillDown.ts";
import {
    buildDashboardFilter,
    DashboardPeriodToolbar,
} from "@propertyManagementModule/components/custom/dashboard/DashboardPeriodToolbar.tsx";

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

    useEffect(() => {
        onFilterChange(buildDashboardFilter(periodKey));
    }, []);

    const handlePeriodChange = (value: string) => {
        setPeriodKey(value);
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

    const viewEntriesLabel = resolveLanguageKey("viewEntries") as string;
    const tabDrillDownProps = { drillDownContext, viewEntriesLabel };

    return (
        <>
            <Header
                title={resolveLanguageKey("title")}
                description={resolveLanguageKey("description")}
            >
                <DashboardPeriodToolbar
                    periodKey={periodKey}
                    onPeriodChange={handlePeriodChange}
                    onRefresh={() => onFilterChange(buildDashboardFilter(periodKey))}
                    periodLabel={resolveLanguageKey("period") as string}
                    periodLast7Days={resolveLanguageKey("periodLast7Days") as string}
                    periodLast30Days={resolveLanguageKey("periodLast30Days") as string}
                    periodLast3Months={resolveLanguageKey("periodLast3Months") as string}
                    periodLast12Months={resolveLanguageKey("periodLast12Months") as string}
                    refreshLabel={resolveLanguageKey("refresh") as string}
                />
            </Header>

            <Tabs value={activeTab} onValueChange={setActiveTab} orientation='horizontal' className='flex flex-col gap-4 flex-full'>
                <div className="flex-full">
                    <div className="max-w-full overflow-x-auto min-h-10">
                        <TabsList>
                            <TabsTrigger className="hover:cursor-pointer" value='overview'>{resolveLanguageKey("tabs.overview")}</TabsTrigger>
                            <TabsTrigger className="hover:cursor-pointer" value='analytics'>{resolveLanguageKey("tabs.analytics")}</TabsTrigger>
                            <TabsTrigger className="hover:cursor-pointer" value='projects'>{resolveLanguageKey("tabs.projects")}</TabsTrigger>
                            <TabsTrigger className="hover:cursor-pointer" value='edifices'>{resolveLanguageKey("tabs.edifices")}</TabsTrigger>
                            <TabsTrigger className="hover:cursor-pointer" value='units'>{resolveLanguageKey("tabs.units")}</TabsTrigger>
                            <TabsTrigger className="hover:cursor-pointer" value='workflows'>{resolveLanguageKey("tabs.workflows")}</TabsTrigger>
                        </TabsList>
                    </div>
                    <div className="flex-full pe-1" ref={ref}>
                        <TabsContent value='overview' className="">
                            <DashboardOverview
                                dashboardData={dashboardData}
                                loading={loading}
                                error={error}
                                onRefresh={() => onFilterChange(buildDashboardFilter(periodKey))}
                                {...tabDrillDownProps}
                            />
                        </TabsContent>
                        <TabsContent value='analytics' className='flex flex-col gap-y-4'>
                            <Analytics dashboardData={dashboardData} {...tabDrillDownProps} />
                        </TabsContent>
                        <TabsContent value='projects' className='flex flex-col gap-y-4'>
                            <ProjectsTab
                                dashboardData={dashboardData}
                                loading={loading}
                                error={error}
                                onRefresh={() => onFilterChange(buildDashboardFilter(periodKey))}
                                {...tabDrillDownProps}
                            />
                        </TabsContent>
                        <TabsContent value='edifices' className='flex flex-col gap-y-4'>
                            <EdificesTab
                                dashboardData={dashboardData}
                                loading={loading}
                                error={error}
                                onRefresh={() => onFilterChange(buildDashboardFilter(periodKey))}
                                {...tabDrillDownProps}
                            />
                        </TabsContent>
                        <TabsContent value='units' className='flex flex-col gap-y-4'>
                            <UnitsTab
                                dashboardData={dashboardData}
                                loading={loading}
                                error={error}
                                onRefresh={() => onFilterChange(buildDashboardFilter(periodKey))}
                                {...tabDrillDownProps}
                            />
                        </TabsContent>
                        <TabsContent value='workflows' className='flex flex-col gap-y-4'>
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
    withDebug(true, true)
)(Dashboard)
